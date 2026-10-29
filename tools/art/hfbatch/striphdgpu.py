"""Backdrop strips repainted at native resolution (polish report VI-2, 2026-10-29): Qwen-Image img2img with the style model
(mshaffe111/slothadv-style-lora) at a low strength, run over the current strip in overlapping full-height tiles, so the picture keeps
its composition and only gains real painted detail. The tiles go round the strip as a circle (the last tile wraps from the right end
onto the left one), so the right edge still runs straight on into the left: the strips were already made seamless
(scripts/strip-seamless.py) and stay so.

Each strip: the current RGBA file, laid on flat magenta, Lanczos-scaled to the target height (the game draws strips by height, so the
width follows the file's own aspect), then tiled (TW wide, full height, evenly spaced round the circle, overlaps blended by linear
ramps). Results to the bucket mshaffe111/w5-xfer, under <SUB>/:
  <name>.webp            the repainted RGB picture on magenta (q95)
  crop-<name>.jpg         a 1:1 crop of the middle, for a quick look (hf_fs attach)
  carrier-<TAG>-<k>.png   the webps packed byte for byte into greyscale PNGs under 6 MB (tools/art/w5/unpack_carrier.py)
env SPEC = the spec's bucket path: {"loras": {"style": [repo, file, scale]}, "neg", "tw", "items": [{"name", "src" (url), "h",
"prompt", "strength", "seed", "steps"?}]}; SUB; TAG. The token reaches the job only as the secret HF_TOKEN.
"""
import io, json, math, os, time, urllib.request
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from huggingface_hub import hf_hub_download

tok = os.environ['HF_TOKEN']
ROOT = Path(os.environ.get('OUT', '/out'))
OUT = ROOT / os.environ['SUB']
SPEC = json.loads((ROOT / os.environ['SPEC']).read_text())
TAG = os.environ.get('TAG', 'hd')
t0 = time.time()


def put(path, data):
    p = OUT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    print('PUT', path, len(data), flush=True)


from diffusers import QwenImageImg2ImgPipeline as P  # noqa: E402
pipe = P.from_pretrained('Qwen/Qwen-Image', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', round(time.time() - t0), flush=True)

repo, fn, scale = SPEC['loras']['style']
path = hf_hub_download(repo, fn, token=tok)
try:
    pipe.load_lora_weights(path, adapter_name='style')
except Exception as e:  # ai-toolkit key names, as img2imggpu.py
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
    pipe.load_lora_weights(sd2, adapter_name='style')
pipe.set_adapters(['style'], adapter_weights=[scale])

NEG = SPEC.get('neg', 'blurry, soft focus, smeared, low detail, jpeg artifacts, text, letters, watermark, frame, border, photo, 3d render, people, animal, sloth')
TW = SPEC.get('tw', 1024)
MAG = np.array([255, 0, 255], np.float32)


def esrgan():
    # Real-ESRGAN anime 6B (as titlegpu.py): crisp lines to start from, so the repaint adds paint texture on sharp shapes, not on a blur
    try:
        import spandrel  # noqa: F401
    except ImportError:
        import subprocess, sys
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'spandrel'], check=True)
    from spandrel import ModelLoader
    pth = Path('/tmp/anime6b.pth')
    if not pth.exists():
        urllib.request.urlretrieve('https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth', pth)
    model = ModelLoader().load_from_file(str(pth)).eval().to('cuda')

    def run(rgb):  # float HxWx3 0-255, wrapped round left to right so the seam stays a seam; tiles of 512, 32 overlap
        P = 32
        x = np.concatenate([rgb[:, -P:], rgb, rgb[:, :P]], 1) / 255
        h, w = x.shape[:2]
        out = np.zeros((h * 4, w * 4, 3), np.float32)
        T = 512
        for y0 in range(0, h, T - 2 * P):
            for x0 in range(0, w, T - 2 * P):
                ya, xa = max(0, min(y0, h - T)), max(0, min(x0, w - T))
                t = torch.from_numpy(np.ascontiguousarray(x[ya:ya + T, xa:xa + T])).permute(2, 0, 1).unsqueeze(0).float().cuda()
                with torch.no_grad():
                    o = model(t).float().clamp(0, 1)[0].permute(1, 2, 0).cpu().numpy()
                # keep the middle of each tile (its own P border is dropped unless it is the picture's edge)
                l = 0 if xa == 0 else P; tp = 0 if ya == 0 else P
                out[(ya + tp) * 4:(ya + T) * 4, (xa + l) * 4:(xa + T) * 4] = o[tp * 4:, l * 4:]
        return out[:, P * 4:(w - P) * 4] * 255
    return run


UP = esrgan() if any(it.get('pre') == 'esrgan' for it in SPEC['items']) else None
srcs = {}
done = []
for it in SPEC['items']:
    t1 = time.time()
    try:
        if it['src'] not in srcs:
            with urllib.request.urlopen(it['src'], timeout=60) as r:
                srcs[it['src']] = Image.open(io.BytesIO(r.read())).convert('RGBA')
        im = srcs[it['src']]
        H = it['h']
        W = round(im.width * H / im.height)
        if it.get('pre') == 'esrgan':
            a = np.asarray(im).astype(np.float32)
            al = a[..., 3:4] / 255
            big = UP(a[..., :3] * al + MAG * (1 - al))
            rgb = np.asarray(Image.fromarray(np.clip(big, 0, 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)).astype(np.float32)
            b = io.BytesIO(); Image.fromarray(rgb.astype(np.uint8)).save(b, 'WEBP', quality=95, method=4)
            put(f"pre-{it['name']}.webp", b.getvalue())
        else:
            a = np.asarray(im.resize((W, H), Image.LANCZOS)).astype(np.float32)
            al = a[..., 3:4] / 255
            rgb = a[..., :3] * al + MAG * (1 - al)
        H16 = math.ceil(H / 16) * 16
        if H16 > H:
            rgb = np.concatenate([rgb, np.repeat(rgb[-1:], H16 - H, 0)], 0)
        n = math.ceil(W / (TW - 256))
        acc = np.zeros((H16, W, 3), np.float64)
        wsum = np.zeros((1, W, 1), np.float64)
        for i in range(n):
            x0 = round(i * W / n)
            cols = (x0 + np.arange(TW)) % W
            tile = Image.fromarray(np.clip(rgb[:, cols], 0, 255).astype(np.uint8))
            res = pipe(prompt=it['prompt'], negative_prompt=it.get('neg', NEG), image=tile, strength=it['strength'], width=TW, height=H16,
                       num_inference_steps=it.get('steps', 30), true_cfg_scale=4.0,
                       generator=torch.Generator('cuda').manual_seed(it.get('seed', 7))).images[0].convert('RGB')
            ov = TW - W / n
            x = np.arange(TW, dtype=np.float64)
            wt = np.clip(np.minimum((x + 1) / ov, (TW - x) / ov), 0, 1)[None, :, None]
            np.add.at(acc, (slice(None), cols), np.asarray(res, np.float64) * wt)
            np.add.at(wsum, (slice(None), cols), wt)
            print('tile', it['name'], i, n, round(time.time() - t1), flush=True)
        out = Image.fromarray(np.clip(acc / wsum, 0, 255)[:H].astype(np.uint8))
        b = io.BytesIO(); out.save(b, 'WEBP', quality=95, method=4)
        put(f"{it['name']}.webp", b.getvalue())
        cx = W // 2 - 512
        b = io.BytesIO(); out.crop((cx, 0, cx + 1024, H)).save(b, 'JPEG', quality=88)
        put(f"crop-{it['name']}.jpg", b.getvalue())
        done.append((f"{it['name']}.webp", (OUT / f"{it['name']}.webp").read_bytes()))
        if it.get('pre') == 'esrgan':
            done.append((f"pre-{it['name']}.webp", (OUT / f"pre-{it['name']}.webp").read_bytes()))
        print('DONE', it['name'], W, H, round(time.time() - t1), flush=True)
    except Exception as e:
        import traceback; traceback.print_exc()
        print('FAILED', it['name'], repr(e)[:300], flush=True)


def carrier(files):
    head = json.dumps([[n, len(x)] for n, x in files]).encode() + b'\n'
    data = head + b''.join(x for _, x in files)
    w = 2048
    h = (len(data) + w - 1) // w
    arr = np.zeros(w * h, np.uint8)
    arr[:len(data)] = np.frombuffer(data, np.uint8)
    b = io.BytesIO(); Image.fromarray(arr.reshape(h, w), 'L').save(b, 'PNG', compress_level=9)
    return b.getvalue()


chunk, size, k = [], 0, 0
for n, x in done:
    if chunk and size + len(x) > 5_800_000:
        put(f'carrier-{TAG}-{k}.png', carrier(chunk)); k += 1; chunk, size = [], 0
    chunk.append((n, x)); size += len(x)
if chunk:
    put(f'carrier-{TAG}-{k}.png', carrier(chunk))
print('ALL_DONE', len(done), round(time.time() - t0), flush=True)
