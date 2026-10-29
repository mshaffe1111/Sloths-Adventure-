"""Painted sky above every far strip, for the upright view (Matt 2026-10-29: upright looked faded next to sideways; the strips are now
drawn upright at the size sideways uses, which leaves room above the far strip). Qwen-Image img2img with the style model
(mshaffe111/slothadv-style-lora), outpainting each far strip upward from its own top rows, so the colours, the light and the shapes
running off the top (trunks, branches, cave roof, smoke) carry on.

Per strip: a canvas E + O rows tall (E = half the strip's height, the new sky; O = its top rows, the context and the cross-fade):
the bottom O rows are the strip's own top, the E rows above start as its top rows carried upward and eased into the average colour of
its sky, with a little noise for the model to paint into. Run in overlapping full-height tiles round the strip as a circle (as
striphdgpu.py), so the sky repeats left to right like the strip. Results to the bucket mshaffe111/w5-xfer, under <SUB>/:
  <name>.webp          the painted canvas (E + O rows, the strip's width), q95
  start-<name>.jpg     the start it painted from
  carrier-<TAG>-<k>.png the webps packed byte for byte into greyscale PNGs under 6 MB (tools/art/w5/unpack_carrier.py)
env SPEC = the spec's bucket path: {"loras": {"style": [repo, file, scale]}, "neg", "tw", "items": [{"name", "src" (url), "prompt",
"strength", "seed", "steps"?}]}; SUB; TAG. The token reaches the job only as the secret HF_TOKEN.
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
TAG = os.environ.get('TAG', 'sky')
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

NEG = SPEC.get('neg', 'text, letters, watermark, frame, border, photo, 3d render, people, animal, sloth, bird, horizontal band, seam, '
               'blurry, smeared')
TW = SPEC.get('tw', 1024)


def blur_x(a, s):
    """a soft horizontal blur (gaussian by three box passes), wrapping round left to right"""
    r = max(1, int(s))
    for _ in range(3):
        p = np.concatenate([a[:, -r:], a, a[:, :r]], 1)
        c = np.cumsum(np.pad(p, ((0, 0), (1, 0), (0, 0))), 1)
        a = (c[:, 2 * r + 1:] - c[:, :-2 * r - 1]) / (2 * r + 1)
    return a


def start(rgb, E, O, seed):
    """the canvas the model paints from: the strip's own top O rows at the bottom, its top rows carried up and eased into its sky"""
    H, W, _ = rgb.shape
    top = rgb[:6].mean(0, keepdims=True)  # the strip's top row (a few rows, for noise)
    near = blur_x(top, 3)  # shapes running off the top carry straight on, just above
    far = blur_x(top, 160)  # higher up: the sky's own colour, without the shapes
    y = np.arange(E, dtype=np.float32)[:, None, None]
    t = np.clip((E - 1 - y) / (E * 0.55), 0, 1)  # 0 at the strip's top, 1 from about half way up
    t = t * t * (3 - 2 * t)
    up = near * (1 - t) + far * t
    rng = np.random.default_rng(seed)
    noise = blur_x(rng.normal(0, 1, (E, W, 1)).astype(np.float32), 6) * 18
    up = up + noise
    return np.clip(np.concatenate([up, rgb[:O]], 0), 0, 255)


done = []
for it in SPEC['items']:
    t1 = time.time()
    try:
        with urllib.request.urlopen(it['src'], timeout=60) as r:
            im = Image.open(io.BytesIO(r.read())).convert('RGB')
        rgb = np.asarray(im).astype(np.float32)
        H, W, _ = rgb.shape
        E = int(round(H * it.get('ext', 0.5) / 16) * 16)
        O = int(round(H * 0.16 / 16) * 16)
        cv = start(rgb, E, O, it.get('seed', 7))
        b = io.BytesIO(); Image.fromarray(cv.astype(np.uint8)).save(b, 'JPEG', quality=85)
        put(f"start-{it['name']}.jpg", b.getvalue())
        CH = E + O
        n = math.ceil(W / (TW - 256))
        acc = np.zeros((CH, W, 3), np.float64)
        wsum = np.zeros((1, W, 1), np.float64)
        for i in range(n):
            x0 = round(i * W / n)
            cols = (x0 + np.arange(TW)) % W
            tile = Image.fromarray(np.clip(cv[:, cols], 0, 255).astype(np.uint8))
            res = pipe(prompt=it['prompt'], negative_prompt=it.get('neg', NEG), image=tile, strength=it['strength'], width=TW, height=CH,
                       num_inference_steps=it.get('steps', 28), true_cfg_scale=4.0,
                       generator=torch.Generator('cuda').manual_seed(it.get('seed', 7) + i)).images[0].convert('RGB')
            ov = TW - W / n
            x = np.arange(TW, dtype=np.float64)
            wt = np.clip(np.minimum((x + 1) / ov, (TW - x) / ov), 0, 1)[None, :, None]
            np.add.at(acc, (slice(None), cols), np.asarray(res, np.float64) * wt)
            np.add.at(wsum, (slice(None), cols), wt)
            print('tile', it['name'], i, n, round(time.time() - t1), flush=True)
        out = Image.fromarray(np.clip(acc / wsum, 0, 255).astype(np.uint8))
        b = io.BytesIO(); out.save(b, 'WEBP', quality=95, method=4)
        put(f"{it['name']}.webp", b.getvalue())
        done.append((f"{it['name']}.webp", b.getvalue()))
        print('DONE', it['name'], W, CH, round(time.time() - t1), flush=True)
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
