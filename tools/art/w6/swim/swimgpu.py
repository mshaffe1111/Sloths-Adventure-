"""World 6 (Deep Mangrove) swimming for Pokey (2026-10-27): on-model start stills and Wan 2.2 clips, as GPU jobs on Hugging Face.

The session machine cannot reach huggingface.co and the connector's token cannot write the game's HF repos, so (like w5/w5gpu.py)
the job mounts the bucket mshaffe111/w5-xfer read-write at /out and everything lives under /out/w6swim/:
  stills/<name>.png         Qwen-Image + Pokey's character model (mshaffe111/pokey-qwen-lora), as gen/gen_stills.py
  stills/sheet-<tag>.jpg    numbered contact sheet of the stills (pick with hf_fs attach)
  clips/<name>.zip          Wan 2.2 I2V + the motion model, exactly as gen/gen_clips.py (49 PNG frames)
  clips/sheet-<name>.jpg    numbered contact sheet of a clip's frames
  clips/<name>.carrier.png  the clip's frames as WebP q95 packed byte for byte into one greyscale PNG, so hf_fs attach can bring the
                            whole clip back to the session (w5/unpack_carrier.py unpacks it)
env SPEC = w6swim/jobs/<spec>.json in the bucket: {"tag", "stills"?: {"lora": [repo, file, scale], "neg", "items": [{"name", "prompt",
"seed", "w", "h"}]}, "clips"?: [{"name", "src": bucket path, "prompt", "seed", "w", "h"}], "motion"?: {...}}; PART, PARTS split the clips
(stills run in part 0). The token reaches the job only as the job secret HF_TOKEN.
"""
import io, json, os, time, zipfile
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageDraw
from huggingface_hub import hf_hub_download

tok = os.environ['HF_TOKEN']
ROOT = Path(os.environ.get('OUT', '/out'))
OUT = ROOT / 'w6swim'
SPEC = json.loads((ROOT / os.environ['SPEC']).read_text())
PART, PARTS = int(os.environ.get('PART', '0')), int(os.environ.get('PARTS', '1'))
TAG = SPEC.get('tag', 'swim')
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


def carrier(files):
    """files packed losslessly into one greyscale PNG: a JSON header line [[name, size], ...] then the bytes, one per pixel"""
    head = json.dumps([[n, len(x)] for n, x in files]).encode() + b'\n'
    data = head + b''.join(x for _, x in files)
    w = 2048
    h = (len(data) + w - 1) // w
    arr = np.zeros(w * h, np.uint8)
    arr[:len(data)] = np.frombuffer(data, np.uint8)
    b = io.BytesIO(); Image.fromarray(arr.reshape(h, w), 'L').save(b, 'PNG', compress_level=9)
    return b.getvalue()


def stills(st):
    from diffusers import DiffusionPipeline
    pipe = DiffusionPipeline.from_pretrained('Qwen/Qwen-Image', torch_dtype=torch.bfloat16).to('cuda')
    print('QWEN LOADED', round(time.time() - t0), flush=True)
    repo, fn, sc = st['lora']
    path = hf_hub_download(repo, fn, token=tok)
    try:
        pipe.load_lora_weights(path, adapter_name='pokey')
    except Exception as e:  # the ai-toolkit key names, as gen_stills.py
        print('LORA direct failed:', str(e)[:200], flush=True)
        from safetensors.torch import load_file
        sd2 = {}
        for k, v in load_file(path).items():
            k2 = k
            for pre in ('diffusion_model.', 'model.diffusion_model.', 'base_model.model.'):
                if k2.startswith(pre):
                    k2 = 'transformer.' + k2[len(pre):]
            if not k2.startswith('transformer.'):
                k2 = 'transformer.' + k2
            sd2[k2] = v
        pipe.load_lora_weights(sd2, adapter_name='pokey')
    pipe.set_adapters(['pokey'], adapter_weights=[sc])
    done = []
    for it in st['items']:
        t1 = time.time()
        try:
            img = pipe(prompt=it['prompt'], negative_prompt=it.get('neg', st.get('neg', ' ')), width=it.get('w', 1024),
                       height=it.get('h', 1024), num_inference_steps=it.get('steps', 30), true_cfg_scale=4.0,
                       generator=torch.Generator('cuda').manual_seed(it.get('seed', 42))).images[0].convert('RGB')
            put(f"stills/{it['name']}.png", png(img))
            done.append((it['name'], img))
            print('DONE', it['name'], round(time.time() - t1), flush=True)
        except Exception as e:
            print('FAILED', it['name'], repr(e)[:300], flush=True)
    if done:
        sq = [im.resize((256, 256 * im.height // im.width), Image.LANCZOS) for _, im in done]
        canvas = [Image.new('RGB', (256, 256), (40, 40, 40)) for _ in sq]
        for c, im in zip(canvas, sq):
            c.paste(im, (0, (256 - im.height) // 2))
        put(f'stills/sheet-{TAG}.jpg', sheet(canvas, [n for n, _ in done], 256, 5, f'{TAG} stills'))
    del pipe
    torch.cuda.empty_cache()


def erase(im, y0, sat=24, dl=-25):
    """paint a still's pale, unsaturated water ring below y0 (round his feet) back to the flat grey of its border"""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    bd = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(bd, 0)
    m = np.zeros(a.shape[:2], bool); m[y0:] = True
    m &= (a.max(-1) - a.min(-1) < sat) & (a.mean(-1) > bg.mean() + dl)  # pale or near-grey, not his dark outline
    a[m] = bg
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))


def prep(im, w, h):
    if abs(im.width / im.height - w / h) > 0.02:
        tw = max(im.width, round(im.height * w / h)); th = max(im.height, round(im.width * h / w))
        c = Image.new('RGB', (tw, th), im.getpixel((2, 2))); c.paste(im, ((tw - im.width) // 2, (th - im.height) // 2)); im = c
    return im.resize((w, h), Image.LANCZOS)


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
    neg = ('camera movement, zoom, pan, tracking shot, background change, scenery, water, waves, ripples, splashes, extra limbs, '
           'extra characters, human hands, fingers, blurry, deformed, text, watermark, flicker, morphing, turning to face the camera, '
           'leaving the frame')
    for c in cl:
        name, w, h = c['name'], c.get('w', 832), c.get('h', 480)
        t1 = time.time()
        try:
            img = Image.open(OUT / c['src']).convert('RGB')
            if c.get('erase'):
                img = erase(img, **c['erase'])
                put(f"clips/{name}-start.png", png(img))
            img = prep(img, w, h)
            frames = pipe(image=img, prompt=c['prompt'], negative_prompt=c.get('neg', neg), height=h, width=w,
                          num_frames=c.get('frames', 49), guidance_scale=3.5, num_inference_steps=30,
                          generator=torch.Generator('cuda').manual_seed(c.get('seed', 7))).frames[0]
            pil = [f if isinstance(f, Image.Image) else Image.fromarray((np.asarray(f) * 255).clip(0, 255).astype(np.uint8)) for f in frames]
            b = io.BytesIO()
            with zipfile.ZipFile(b, 'w') as z:
                for k, f in enumerate(pil):
                    z.writestr(f'{name}_{k:03d}.png', png(f))
            put(f'clips/{name}.zip', b.getvalue())
            put(f'clips/sheet-{name}.jpg', sheet(pil, range(len(pil)), 200, 7, name))
            files = []
            for k, f in enumerate(pil):
                wb = io.BytesIO(); f.save(wb, 'WEBP', quality=95, method=4); files.append((f'{name}_{k:03d}.webp', wb.getvalue()))
            put(f'clips/{name}.carrier.png', carrier(files))
            print('DONE', name, round(time.time() - t1), flush=True)
        except Exception as e:
            print('FAILED', name, repr(e)[:300], flush=True)


if SPEC.get('stills') and PART == 0:
    stills(SPEC['stills'])
if SPEC.get('clips'):
    clips(SPEC['clips'][PART::PARTS], SPEC.get('motion'))
print('ALL_DONE', round(time.time() - t0), flush=True)
