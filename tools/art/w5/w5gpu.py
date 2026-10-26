"""World 5 GPU work (2026-10-26): on-model pose edits and Wan 2.2 clips, reading start pictures from the bucket and writing back to it.

Like w5cpu.py, results go to the bucket mshaffe111/w5-xfer mounted at /out (the session's token cannot write the game's HF repos).
env SPEC = jobs/<spec>.json in the bucket, with any of:
  "edits": [{"name", "images": [bucket paths, e.g. "stills/w5q-idle.png"], "prompt", "seed", "lora": "queen"|"meeca"|null, "scale"}]
        Qwen-Image-Edit-2509 with the game's own frames as the reference, optionally with the character's trained model
        (mshaffe111/<queen|meeca>-qwen-lora) loaded into the edit model -> stills/<name>.png, plus a numbered contact sheet
        stills/w5c-edits-<tag>.jpg.
  "clips": [{"name", "src": bucket path of the start picture, "prompt", "seed", "w", "h", "flip"?, "tone"?, "clean"?}], "motion": {...}
        Wan 2.2 I2V with the motion model, exactly as gen/gen_clips.py -> clips/<name>.zip (49 PNG frames) and a numbered contact
        sheet stills/w5c-sheet-<name>.jpg.
  env PART, PARTS split the clips between jobs (the edits run in part 0); SPEC may list several specs, comma separated.
"""
import base64, io, json, os, subprocess, sys, time, zipfile
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageDraw
from huggingface_hub import hf_hub_download

tok = os.environ['HF_TOKEN']
OUT = Path(os.environ.get('OUT', '/out'))
SPEC = {}
for _s in os.environ['SPEC'].split(','):  # several specs merge: e.g. the edits and the clips in one job, so the job loads once
    SPEC.update(json.loads((OUT / _s).read_text()))
PART, PARTS = int(os.environ.get('PART', '0')), int(os.environ.get('PARTS', '1'))
TAG = SPEC.get('tag', 'w5')
LORAS = {'queen': ('mshaffe111/queen-qwen-lora', 'queen_qwen_v1.safetensors'), 'meeca': ('mshaffe111/meeca-qwen-lora', 'meeca_qwen_v1.safetensors')}
t0 = time.time()


def put(path, data):
    p = OUT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    print('PUT', path, len(data), flush=True)


def png(im):
    b = io.BytesIO(); im.save(b, 'PNG'); return b.getvalue()


def sheet(ims, labels, tw, cols, title):
    th = round(ims[0].height * tw / ims[0].width)
    rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (cols * tw, rows * (th + 16) + 22), (40, 40, 40))
    d = ImageDraw.Draw(S)
    d.text((6, 4), title, fill=(255, 255, 255))
    for i, (im, lab) in enumerate(zip(ims, labels)):
        x, y = (i % cols) * tw, 22 + (i // cols) * (th + 16)
        S.paste(im.convert('RGB').resize((tw, th), Image.LANCZOS), (x, y + 16))
        d.text((x + 3, y + 2), str(lab), fill=(255, 255, 0))
    b = io.BytesIO(); S.save(b, 'JPEG', quality=84)
    return b.getvalue()


def edits(items):
    try:
        from diffusers import QwenImageEditPlusPipeline
    except Exception:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '--break-system-packages', '-q', '-U', 'git+https://github.com/huggingface/diffusers'], check=True)
        from diffusers import QwenImageEditPlusPipeline
    pipe = QwenImageEditPlusPipeline.from_pretrained('Qwen/Qwen-Image-Edit-2509', torch_dtype=torch.bfloat16).to('cuda')
    print('EDIT LOADED', round(time.time() - t0), flush=True)
    have = set()
    for k in sorted({it['lora'] for it in items if it.get('lora')}):
        try:
            pipe.load_lora_weights(hf_hub_download(*LORAS[k], token=tok), adapter_name=k)
            have.add(k)
            print('LORA ok', k, flush=True)
        except Exception as e:
            print('LORA failed', k, repr(e)[:300], flush=True)
    neg = 'text, watermark, extra animals, extra legs, background scenery, blurry, photo, 3d render, cropped, cut off'
    done, labels = [], []
    for it in items:
        t1 = time.time()
        k = it.get('lora')
        try:
            if have:
                if k in have:
                    pipe.enable_lora()
                    pipe.set_adapters([k], adapter_weights=[it.get('scale', 0.8)])
                else:
                    pipe.disable_lora()
            if k and k not in have:
                print('NOTE', it['name'], 'ran without its model (it failed to load)', flush=True)
            ims = [Image.open(OUT / p).convert('RGB') for p in it['images']]
            img = pipe(image=ims, prompt=it['prompt'], negative_prompt=it.get('neg', neg), true_cfg_scale=4.0, guidance_scale=1.0,
                       num_inference_steps=40, generator=torch.Generator('cuda').manual_seed(it.get('seed', 1))).images[0]
            put(f"stills/{it['name']}.png", png(img))
            done.append(img); labels.append(it['name'])
            print('DONE', it['name'], round(time.time() - t1), flush=True)
        except Exception as e:
            print('FAILED', it['name'], repr(e)[:300], flush=True)
    if done:
        put(f'stills/w5c-edits-{TAG}.jpg', sheet(done, labels, 340, 4, f'{TAG} edits'))
    del pipe
    torch.cuda.empty_cache()


def prep(im, w, h):
    if abs(im.width / im.height - w / h) > 0.02:
        tw = max(im.width, round(im.height * w / h)); th = max(im.height, round(im.width * h / w))
        c = Image.new('RGB', (tw, th), im.getpixel((2, 2))); c.paste(im, ((tw - im.width) // 2, (th - im.height) // 2)); im = c
    return im.resize((w, h), Image.LANCZOS)


def figure(a):
    """pixels that are not the flat grey of the picture's border"""
    bd = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    return np.sqrt(((a - np.median(bd, 0)) ** 2).sum(-1)) > 30


def clean_start(im, halo=None, shadow=False):
    """an edit's lantern glow and ground shadow, painted onto the flat grey, would key as a pale disc and a dark smudge under the feet:
    both are flooded from the open background and painted back to its grey. halo [x0, y0, x1, y1]: the box round the lantern, where a
    lighter, not too bright, not too coloured pixel joined to the grey is glow (the lit glass inside the lantern's dark frame stays);
    shadow: in the lowest fifth of the figure, a darker neutral pixel joined to the grey is the shadow (dark outlines and fur stay)."""
    try:
        from scipy import ndimage
    except ImportError:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '--break-system-packages', '-q', 'scipy'], check=True)
        from scipy import ndimage
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    bd = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(bd, 0)
    lum, sat, bl = a.mean(-1), a.max(-1) - a.min(-1), bg.mean()
    soft = np.zeros(lum.shape, bool)
    inb = np.zeros(lum.shape, bool)
    if halo:
        x0, y0, x1, y1 = halo
        inb[y0:y1, x0:x1] = True
        soft |= inb & (lum > bl + 1.5) & (lum < bl + 62) & (sat < 85)
    if shadow:
        ys = np.nonzero((np.abs(a - bg).max(-1) > 30).any(1))[0]
        band = np.zeros(lum.shape, bool); band[int(ys.max() - 0.2 * (ys.max() - ys.min())):] = True
        soft |= band & (lum < bl - 1.5) & (lum > bl - 45) & (sat < 22)
    flat = np.abs(a - bg).max(-1) < 6
    lab, _ = ndimage.label(flat | soft)
    keep = np.unique(lab[flat & ~inb])
    a[np.isin(lab, keep[keep > 0]) & soft] = bg
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))


def fix_start(im, c):
    """"flip": mirror a start picture that came out facing left (the game's frames face right); "tone": pull the figure's colours to
    the mean and spread of another picture's figure (an edit drifts lighter or more orange than the painted atlas); "clean":
    {"halo": [box], "shadow": true} paints an edit's lantern glow and ground shadow back to the grey (clean_start)"""
    if c.get('clean'):
        im = clean_start(im, **c['clean'])
    if c.get('flip'):
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    if c.get('tone'):
        a = np.asarray(im).astype(np.float32)
        r = np.asarray(Image.open(OUT / c['tone']).convert('RGB')).astype(np.float32)
        m, mr = figure(a), figure(r)
        for ch in range(3):
            s, sr = a[..., ch][m], r[..., ch][mr]
            a[..., ch][m] = (s - s.mean()) / max(1.0, s.std()) * sr.std() + sr.mean()
        im = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    if c.get('flip') or c.get('tone') or c.get('clean'):
        put(f"stills/{c['name']}-start.png", png(im))
    return im


def clips(cl, motion):
    from diffusers import WanImageToVideoPipeline
    pipe = WanImageToVideoPipeline.from_pretrained('Wan-AI/Wan2.2-I2V-A14B-Diffusers', torch_dtype=torch.bfloat16).to('cuda')
    print('WAN LOADED', round(time.time() - t0), flush=True)
    if motion:
        sc = motion.get('scale', 1.0)
        pipe.load_lora_weights(hf_hub_download(*motion['high'], token=tok), adapter_name='mhigh')
        pipe.load_lora_weights(hf_hub_download(*motion['low'], token=tok), adapter_name='mlow', load_into_transformer_2=True)
        pipe.set_adapters(['mhigh', 'mlow'], adapter_weights=[sc, sc])
        print('MOTION LORA ok', flush=True)
    neg = ('camera movement, zoom, pan, tracking shot, background change, scenery, extra limbs, extra characters, human hands, fingers, '
           'blurry, deformed, text, watermark, flicker, morphing, turning to face the camera, leaving the frame')
    for c in cl:
        name, w, h = c['name'], c.get('w', 832), c.get('h', 480)
        t1 = time.time()
        try:
            img = prep(fix_start(Image.open(OUT / c['src']).convert('RGB'), c), w, h)
            frames = pipe(image=img, prompt=c['prompt'], negative_prompt=c.get('neg', neg), height=h, width=w,
                          num_frames=c.get('frames', 49), guidance_scale=3.5, num_inference_steps=30,
                          generator=torch.Generator('cuda').manual_seed(c.get('seed', 7))).frames[0]
            pil = [f if isinstance(f, Image.Image) else Image.fromarray((np.asarray(f) * 255).clip(0, 255).astype(np.uint8)) for f in frames]
            b = io.BytesIO()
            with zipfile.ZipFile(b, 'w') as z:
                for k, f in enumerate(pil):
                    z.writestr(f'{name}_{k:03d}.png', png(f))
            put(f'clips/{name}.zip', b.getvalue())
            put(f'stills/w5c-sheet-{name}.jpg', sheet(pil, range(len(pil)), 200, 7, name))
            print('DONE', name, round(time.time() - t1), flush=True)
        except Exception as e:
            print('FAILED', name, repr(e)[:300], flush=True)


if SPEC.get('edits') and PART == 0:
    edits(SPEC['edits'])
if SPEC.get('clips'):
    clips(SPEC['clips'][PART::PARTS], SPEC.get('motion'))
print('ALL_DONE', round(time.time() - t0), flush=True)
