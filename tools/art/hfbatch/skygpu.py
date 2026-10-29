"""Painted sky above every far strip, for the upright view (Matt 2026-10-29: upright looked faded next to sideways; the strips are now
drawn upright at the size sideways uses, which leaves room above the far strip). Qwen-Image img2img with the style model
(mshaffe111/slothadv-style-lora), outpainting each far strip upward from its own top rows, so the colours, the light and the shapes
running off the top (trunks, branches, cave roof, smoke) carry on.

Per strip: a canvas E + C rows tall (E = half the strip's height, the new sky; C = its top 45%, the context), inpainted in the top E
rows only (QwenImageInpaintPipeline; img2img if that is missing). The bottom C rows are the strip itself, the E rows above start as its top quarter turned over, stretched and shifted along (start()),
with its top row carried straight on just above the join. Run in overlapping full-height tiles round the strip as a circle (as
striphdgpu.py), so the sky repeats left to right like the strip. Results to the bucket mshaffe111/w5-xfer, under <SUB>/:
  <name>.webp          the painted rows and the strip's top 16% (E + O rows, the strip's width), q95; skycut.py makes the game file
  start-<name>.jpg     the start it painted from
  carrier-<TAG>-<k>.png the webps packed byte for byte into greyscale PNGs under 6 MB (tools/art/w5/unpack_carrier.py)
env SPEC = the spec's bucket path: {"loras": {"style": [repo, file, scale]}, "neg", "tw", "items": [{"name", "src" (url), "prompt",
"strength", "seed", "steps"?, "ext"?, "ctx"?, "bg"? (a cut-out's key colour)}]}; SUB; TAG. The token reaches the job only as the secret HF_TOKEN.
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


# inpainting: the strip itself stays as it is (the context below), only the masked rows above are painted. Plain img2img on a short wide
# canvas painted a whole new scene, ground and all, over the strip's top (pilots 1-2, 2026-10-29)
try:
    from diffusers import QwenImageInpaintPipeline as P  # noqa: E402
    INPAINT = True
except Exception as e:
    print('no QwenImageInpaintPipeline:', repr(e)[:200], flush=True)
    from diffusers import QwenImageImg2ImgPipeline as P  # noqa: E402
    INPAINT = False
pipe = P.from_pretrained('Qwen/Qwen-Image', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', type(pipe).__name__, round(time.time() - t0), flush=True)

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


def start(rgb, E, C, seed):
    """the canvas the model paints from: the strip's own top O rows at the bottom; above, the strip's top quarter (its sky, canopy or
    cave roof) turned over, stretched up and shifted along, so there is painted texture of the right kind everywhere for the model to
    repaint (a flat colour came back flat, pilot 2026-10-29); just above the strip its top row carried straight on, so the join is
    continuous"""
    H, W, _ = rgb.shape
    band = rgb[: max(16, H // 4)][::-1]  # the top quarter, turned over: its top row now meets the strip's top row
    tex = np.asarray(Image.fromarray(band.astype(np.uint8)).resize((W, E), Image.BICUBIC)).astype(np.float32)[::-1]
    tex = np.roll(tex, int(W * 0.37), axis=1)  # shifted along, so it is no mirror of the strip below
    near = blur_x(rgb[:4].mean(0, keepdims=True), 3)
    y = np.arange(E, dtype=np.float32)[:, None, None]
    t = np.clip((E - 1 - y) / (E * 0.22), 0, 1)  # 0 at the strip's top, 1 a fifth of the way up
    t = t * t * (3 - 2 * t)
    up = near * (1 - t) + tex * t
    rng = np.random.default_rng(seed)
    up = up + blur_x(rng.normal(0, 1, (E, W, 1)).astype(np.float32), 4) * 10
    return np.clip(np.concatenate([up, rgb[:C]], 0), 0, 255)


done = []
for it in SPEC['items']:
    t1 = time.time()
    try:
        with urllib.request.urlopen(it['src'], timeout=60) as r:
            im = Image.open(io.BytesIO(r.read())).convert('RGBA')
        a = np.asarray(im).astype(np.float32)
        # a cut-out (a middle strip) is painted on flat magenta, and keyed again afterwards (skycut.py)
        BG = np.array(it.get('bg', [255, 0, 255]), np.float32)
        rgb = a[..., :3] * (a[..., 3:4] / 255) + BG * (1 - a[..., 3:4] / 255)
        H, W, _ = rgb.shape
        E = int(round(H * it.get('ext', 0.5) / 16) * 16)
        O = int(round(H * 0.16 / 16) * 16)  # what skycut.py takes of the strip's own rows
        C = int(round(H * it.get('ctx', 0.45) / 16) * 16)  # the strip shown below, for the model to carry on from
        cv = start(rgb, E, C, it.get('seed', 7))
        b = io.BytesIO(); Image.fromarray(cv.astype(np.uint8)).save(b, 'JPEG', quality=85)
        put(f"start-{it['name']}.jpg", b.getvalue())
        CH = E + C
        # the mask runs on into the strip's top 11%, falling off, so the model blends the join (skycut.py fades back to the strip itself
        # over the same rows); a mask that stopped at the strip's top left a hard seam (pilot 3, w1kapok)
        R = int(H * 0.11)
        mask = np.zeros((CH, TW), np.uint8)
        mask[:E] = 255
        mask[E:E + R] = np.linspace(255, 0, R, dtype=np.float32)[:, None].astype(np.uint8)
        mimg = Image.fromarray(mask, 'L')
        n = math.ceil(W / (TW - 256))
        acc = np.zeros((CH, W, 3), np.float64)
        wsum = np.zeros((1, W, 1), np.float64)
        for i in range(n):
            x0 = round(i * W / n)
            cols = (x0 + np.arange(TW)) % W
            tile = Image.fromarray(np.clip(cv[:, cols], 0, 255).astype(np.uint8))
            kw = dict(prompt=it['prompt'], negative_prompt=it.get('neg', NEG), image=tile, strength=it['strength'], width=TW, height=CH,
                      num_inference_steps=it.get('steps', 24), true_cfg_scale=4.0,
                      generator=torch.Generator('cuda').manual_seed(it.get('seed', 7) + i))
            if INPAINT:
                kw['mask_image'] = mimg
            res = pipe(**kw).images[0].convert('RGB')
            ov = TW - W / n
            x = np.arange(TW, dtype=np.float64)
            wt = np.clip(np.minimum((x + 1) / ov, (TW - x) / ov), 0, 1)[None, :, None]
            np.add.at(acc, (slice(None), cols), np.asarray(res, np.float64) * wt)
            np.add.at(wsum, (slice(None), cols), wt)
            print('tile', it['name'], i, n, round(time.time() - t1), flush=True)
        acc = acc[:E + O]
        out = Image.fromarray(np.clip(acc / wsum, 0, 255).astype(np.uint8))
        b = io.BytesIO(); out.save(b, 'WEBP', quality=95, method=4)
        put(f"{it['name']}.webp", b.getvalue())
        done.append((f"{it['name']}.webp", b.getvalue()))
        print('DONE', it['name'], W, E + O, round(time.time() - t1), flush=True)
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
