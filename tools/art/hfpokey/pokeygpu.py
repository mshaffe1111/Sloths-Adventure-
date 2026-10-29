"""Pokey fixes on Hugging Face (hf-art-pokey, 2026-10-29): image edits with Qwen-Image-Edit-2511 (+ optionally Pokey's character model),
Real-ESRGAN anime x4 upscales (brought to 2x), and Wan 2.2 clips from edited starts (as tools/art/w6/swim/swimgpu.py).

The job mounts the bucket mshaffe111/w5-xfer read-write at /out; everything it writes lives under /out/hfpokey/. env SPEC = a bucket path
to the spec JSON:
  {"tag",
   "upscale"?: [{"name", "src"}],                          -> up/<name>.png  (x4 anime model, then Lanczos to 2x of the source)
   "edits"?: [{"name", "src", "refs"?: [src...], "prompt", "neg"?, "seeds": [..], "lora"?: scale, "w", "h", "crop"?: [x0,y0,x1,y1],
               "pad"?: [r,g,b], "steps"?}],                 -> edits/<name>-s<seed>.png  (+ edits/sheet-<tag>.jpg)
   "clips"?: [{"name", "src", "prompt", "neg"?, "seed", "w", "h"}], "motion"?: {...}   -> clips/<name>.zip, sheet, carrier (as swimgpu)
   "carry"?: [[carrier name, [bucket paths...]]]            -> carry/<name>.png, files packed byte for byte (w5/unpack_carrier.py)}
A src is "gh:<commit>:<repo path>" (raw GitHub), "b:<bucket path>" or "z:<bucket zip path>#<member>". The token reaches the job only as
the job secret HF_TOKEN.
"""
import io, json, os, time, zipfile, urllib.request
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageDraw
from huggingface_hub import hf_hub_download

tok = os.environ['HF_TOKEN']
ROOT = Path(os.environ.get('OUT', '/out'))
OUT = ROOT / 'hfpokey'
SPEC = json.loads((ROOT / os.environ['SPEC']).read_text())
TAG = SPEC.get('tag', 'pokey')
GH = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/'
t0 = time.time()


def put(path, data):
    p = OUT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    print('PUT', path, len(data), flush=True)


def png(im):
    b = io.BytesIO(); im.save(b, 'PNG'); return b.getvalue()


def load(src):
    if src.startswith('gh:'):
        _, commit, path = src.split(':', 2)
        data = urllib.request.urlopen(GH + commit + '/' + urllib.request.quote(path), timeout=60).read()
    elif src.startswith('b:'):
        data = (ROOT / src[2:]).read_bytes()
    elif src.startswith('z:'):
        zp, member = src[2:].split('#')
        with zipfile.ZipFile(ROOT / zp) as z:
            data = z.read(member)
    else:
        raise ValueError(src)
    return Image.open(io.BytesIO(data)).convert('RGB')


def sheet(ims, labels, tw, cols, title):
    th = max(round(im.height * tw / im.width) for im in ims)
    rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (cols * tw, rows * (th + 16) + 22), (40, 40, 40))
    d = ImageDraw.Draw(S)
    d.text((6, 4), title, fill=(255, 255, 255))
    for i, (im, lab) in enumerate(zip(ims, labels)):
        x, y = (i % cols) * tw, 22 + (i // cols) * (th + 16)
        S.paste(im.convert('RGB').resize((tw, round(im.height * tw / im.width)), Image.LANCZOS), (x, y + 16))
        d.text((x + 3, y + 2), str(lab), fill=(255, 255, 0))
    b = io.BytesIO(); S.save(b, 'JPEG', quality=86)
    return b.getvalue()


def carrier(files):
    head = json.dumps([[n, len(x)] for n, x in files]).encode() + b'\n'
    data = head + b''.join(x for _, x in files)
    w = 2048
    h = (len(data) + w - 1) // w
    arr = np.zeros(w * h, np.uint8)
    arr[:len(data)] = np.frombuffer(data, np.uint8)
    b = io.BytesIO(); Image.fromarray(arr.reshape(h, w), 'L').save(b, 'PNG', compress_level=9)
    return b.getvalue()


def upscale(items):
    import spandrel
    path = hf_hub_download('ximso/RealESRGAN_x4plus_anime_6B', 'RealESRGAN_x4plus_anime_6B.pth', token=tok)
    model = spandrel.ModelLoader().load_from_file(path).cuda().eval()
    print('ESRGAN', model.architecture.name, model.scale, flush=True)
    for it in items:
        im = load(it['src'])
        x = torch.from_numpy(np.asarray(im).astype(np.float32) / 255).permute(2, 0, 1)[None].cuda()
        with torch.no_grad():
            y = model(x)[0].clamp(0, 1).permute(1, 2, 0).cpu().numpy()
        big = Image.fromarray((y * 255 + 0.5).astype(np.uint8))
        two = big.resize((im.width * 2, im.height * 2), Image.LANCZOS)
        put(f"up/{it['name']}.png", png(two))
    del model
    torch.cuda.empty_cache()


def lora_sd(path):
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
    return sd2


def edits(items):
    from diffusers import QwenImageEditPlusPipeline
    pipe = QwenImageEditPlusPipeline.from_pretrained('Qwen/Qwen-Image-Edit-2511', torch_dtype=torch.bfloat16).to('cuda')
    pipe.set_progress_bar_config(disable=True)
    print('EDIT LOADED', round(time.time() - t0), flush=True)
    have_lora = False
    if any(it.get('lora') for it in items):
        path = hf_hub_download('mshaffe111/pokey-qwen-lora', 'pokey_qwen_v1.safetensors', token=tok)
        try:
            pipe.load_lora_weights(path, adapter_name='pokey'); have_lora = True
        except Exception as e:
            print('LORA direct failed:', str(e)[:200], flush=True)
            try:
                pipe.load_lora_weights(lora_sd(path), adapter_name='pokey'); have_lora = True
            except Exception as e2:
                print('LORA failed:', str(e2)[:300], flush=True)
        print('LORA', have_lora, flush=True)
    done = []
    for it in items:
        sc = it.get('lora') or 0
        if sc and not have_lora:
            print('SKIP (no lora)', it['name'], flush=True)
            continue
        if have_lora:
            pipe.set_adapters(['pokey'], adapter_weights=[sc])
        img = load(it['src'])
        if it.get('crop'):
            img = img.crop(tuple(it['crop']))
        w, h = it['w'], it['h']
        if abs(img.width / img.height - w / h) > 0.01:  # pad to the target's shape with the background colour
            pad = tuple(it.get('pad') or img.getpixel((2, 2)))
            tw = max(img.width, round(img.height * w / h)); th = max(img.height, round(img.width * h / w))
            c = Image.new('RGB', (tw, th), pad); c.paste(img, ((tw - img.width) // 2, (th - img.height) // 2)); img = c
        img = img.resize((w, h), Image.LANCZOS)
        refs = [load(r) for r in it.get('refs', [])]
        for s in it['seeds']:
            t1 = time.time()
            try:
                with torch.inference_mode():
                    out = pipe(image=[img] + refs, prompt=it['prompt'], negative_prompt=it.get('neg', ' '), width=w, height=h,
                               num_inference_steps=it.get('steps', 40), true_cfg_scale=4.0, guidance_scale=1.0,
                               generator=torch.Generator('cuda').manual_seed(s)).images[0].convert('RGB')
                put(f"edits/{it['name']}-s{s}.png", png(out))
                done.append((f"{it['name']}-s{s}", out))
                print('DONE', it['name'], s, round(time.time() - t1), flush=True)
            except Exception as e:
                print('FAILED', it['name'], s, repr(e)[:300], flush=True)
    if done:
        put(f'edits/sheet-{TAG}.jpg', sheet([d[1] for d in done], [d[0] for d in done], 300, 6, f'{TAG} edits'))
    del pipe
    torch.cuda.empty_cache()


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
    neg = ('camera movement, zoom, pan, tracking shot, background change, scenery, water, waves, ripples, splashes, extra limbs, '
           'extra characters, human hands, fingers, blurry, deformed, text, watermark, flicker, morphing, turning to face the camera, '
           'leaving the frame, bag disappearing, strap disappearing')
    for c in cl:
        name, w, h = c['name'], c.get('w', 832), c.get('h', 480)
        t1 = time.time()
        try:
            img = prep(load(c['src']), w, h)
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
    del pipe
    torch.cuda.empty_cache()


if SPEC.get('upscale'):
    upscale(SPEC['upscale'])
if SPEC.get('edits'):
    edits(SPEC['edits'])
if SPEC.get('clips'):
    clips(SPEC['clips'], SPEC.get('motion'))
for name, paths in SPEC.get('carry', []):
    files = [(Path(p).name, (OUT / p).read_bytes()) for p in paths if (OUT / p).exists()]
    if files:
        put(f'carry/{name}.png', carrier(files))
print('ALL_DONE', round(time.time() - t0), flush=True)
