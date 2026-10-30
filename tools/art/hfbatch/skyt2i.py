"""X-16 round 5 (the lead, 2026-10-29): fresh start pictures for the 11 skies round 4 left on the cover fit. Round 4 showed the img2img
pass hardly moves its start, so the start has to be good already: here it is painted from text, not built from a donor sky or a gradient.

Per take (Qwen-Image, one load for both pipelines):
  1. sky    text-to-image, sky only (TW2 x TH2), WITHOUT the style model: with it (and its trigger word) the first take of round 5 painted
            a giant sloth's head into the sky, "sloth" in the negative or not (job 6ae3dd5e, cancelled)
  2. start  the sky Lanczos-scaled to the strip's width (+ a wrap margin crossfaded into its left end, so it repeats like the strip), its
            bottom rows squeezed into the E rows above the strip, moved a third of the way to the strip's top colour, laid straight on the strip
  3. join   inpainted with the style model across the join (from JA x E above the strip's top, fading in over its upper half, to JB x H
            into the strip) in ONE pass the strip's full width, then a second narrow pass over the wrap point (the picture turned half
            way round), so the strip's trunks, leaves and smoke carry on up and the join is painted, not a straight crossfade (round 4).
            Overlapping 1024 tiles, even each keeping what the one before painted, showed hard tile edges (the cancelled job)
Results to the bucket mshaffe111/w5-xfer, under <SUB>/:
  <name>.webp            E + O rows (the canvas skycut.py cuts: the sky, then the strip's top 16%), q95
  start-<name>.jpg       step 2, before the join is painted
  t2i-<name>.jpg         step 1
  carrier-<TAG>-<k>.png  all of them packed byte for byte into greyscale PNGs under 6 MB (tools/art/w5/unpack_carrier.py)
env SPEC = the spec's bucket path: {"loras": {"style": [repo, file, scale]}, "items": [{"name", "src" (url of the far strip), "sky",
"join", "neg" (the sky's), "neg_join", "seed"}]}; SUB; TAG. The token reaches the job only as the secret HF_TOKEN.
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
TAG = os.environ.get('TAG', 'sky5')
t0 = time.time()

E_SHARE, O_SHARE, C_SHARE = 0.35, 0.16, 0.45  # tallstart.py E_SHARE, skycut.py O, the strip shown below the join for context
JA, JB = 0.40, 0.10  # the join band: this share of E above the strip's top, this share of H into the strip
TW, TW2, TH2 = 1024, 1664, 640


def put(path, data):
    p = OUT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    print('PUT', path, len(data), flush=True)


from diffusers import QwenImagePipeline, QwenImageInpaintPipeline  # noqa: E402
t2i = QwenImagePipeline.from_pretrained('Qwen/Qwen-Image', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', round(time.time() - t0), flush=True)

repo, fn, scale = SPEC['loras']['style']
path = hf_hub_download(repo, fn, token=tok)
try:
    t2i.load_lora_weights(path, adapter_name='style')
except Exception as e:  # ai-toolkit key names, as striphdgpu.py
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
    t2i.load_lora_weights(sd2, adapter_name='style')
inp = QwenImageInpaintPipeline(**t2i.components)  # the same weights, LoRA and all


def jpg(a, q=85):
    b = io.BytesIO(); Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(b, 'JPEG', quality=q)
    return b.getvalue()


def start(sky, rgb, E):
    """the sky over the strip: scaled to the strip's width plus a wrap margin crossfaded into its left end, its bottom rows squeezed
    (at most 1.4x) into E rows, matched to the strip's top rows' colour (mean, and the spread tempered), eased into the strip's top row"""
    H, W, _ = rgb.shape
    M = W // 6
    s = Image.fromarray(sky)
    h = round(s.height * (W + M) / s.width)
    big = np.asarray(s.resize((W + M, h), Image.LANCZOS)).astype(np.float32)
    t = np.linspace(0, 1, M, dtype=np.float32)[None, :, None]
    t = t * t * (3 - 2 * t)
    big[:, :M] = big[:, W:W + M] * (1 - t) + big[:, :M] * t  # the right end runs on into the left
    big = big[:, :W]
    take = min(h, round(E * 1.4))
    up = np.asarray(Image.fromarray(big[h - take:].astype(np.uint8)).resize((W, E), Image.LANCZOS)).astype(np.float32)
    # a third of the way to the strip's top rows' mean colour: matched fully (the spread too), a blue sky over leaves came out green
    # (round 5b); the prompt already gives the light
    top = rgb[: max(8, H // 8)].reshape(-1, 3)
    up = up + (top.mean(0) - up[-max(8, E // 4):].reshape(-1, 3).mean(0)) / 3
    # (no easing into the strip's top row: that smeared the top row's colour sideways into a soft dark band over every cut-off tree
    # top, pilot 5c; the join pass paints the step from sky to strip instead)
    return np.clip(up, 0, 255)


done = []
for it in SPEC['items']:
    t1 = time.time()
    try:
        with urllib.request.urlopen(it['src'], timeout=60) as r:
            rgb = np.asarray(Image.open(io.BytesIO(r.read())).convert('RGB')).astype(np.float32)
        H, W, _ = rgb.shape
        E = int(round(H * E_SHARE / 16) * 16)
        O = int(round(H * O_SHARE / 16) * 16)
        C = int(round(H * C_SHARE / 16) * 16)
        t2i.set_adapters(['style'], adapter_weights=[0.0])
        sky = t2i(prompt=it['sky'], negative_prompt=it['neg'], width=TW2, height=TH2, num_inference_steps=28, true_cfg_scale=4.0,
                  generator=torch.Generator('cuda').manual_seed(it['seed'])).images[0].convert('RGB')
        sky = np.asarray(sky)
        put(f"t2i-{it['name']}.jpg", jpg(sky))
        cv = np.concatenate([start(sky, rgb, E), rgb[:C]], 0)
        put(f"start-{it['name']}.jpg", jpg(cv[:E + O]))
        CH = E + C
        # the join band's mask: rising over the upper half of the part above the strip, full down to JB x H into the strip, off over 40 px
        ja, jb = int(E * JA), int(H * JB)
        rows = np.zeros(CH, np.float32)
        rows[E - ja:E + jb] = 1
        up = ja // 2
        t = np.linspace(0, 1, up, dtype=np.float32)
        rows[E - ja:E - ja + up] = t * t * (3 - 2 * t)
        rows[E + jb - 40:E + jb] = np.linspace(1, 0, 40)
        t2i.set_adapters(['style'], adapter_weights=[scale])

        def paint(img, mask, seed):
            """one inpaint pass, the picture padded on the right (wrapping round) to a multiple of 16 wide; the result laid in through the
            soft mask (the pipeline itself keys on a hard one)"""
            w = img.shape[1]
            w16 = math.ceil(w / 16) * 16
            cols = np.arange(w16) % w
            # the pipeline keys on a hard mask (half way): given the soft one it left everything above its half-way line as it was, and the
            # blend below jumped there (round 5b); so it repaints wherever the soft mask is above zero, and the soft mask blends it in
            res = inp(prompt=it['join'], negative_prompt=it.get('neg_join', it['neg']), image=Image.fromarray(np.clip(img[:, cols], 0, 255).astype(np.uint8)),
                      mask_image=Image.fromarray(((mask[:, cols] > 0.01) * 255).astype(np.uint8), 'L'), strength=it.get('strength', 0.85), width=w16, height=img.shape[0],
                      num_inference_steps=28, true_cfg_scale=4.0, generator=torch.Generator('cuda').manual_seed(seed)).images[0].convert('RGB')
            m = mask[..., None]
            return img * (1 - m) + np.asarray(res, np.float32)[:, :w] * m

        cv = paint(cv, np.repeat(rows[:, None], W, 1), it['seed'])
        print('join', it['name'], round(time.time() - t1), flush=True)
        # the wrap point: turned half way round it sits in the middle; a 1024-wide window over it, the middle 512 repainted
        cv = np.roll(cv, W // 2, axis=1)
        x0 = W // 2 - 512
        x = np.arange(1024, dtype=np.float32)
        colm = np.clip(np.minimum(x - 192, 832 - x) / 64, 0, 1)
        cv[:, x0:x0 + 1024] = paint(cv[:, x0:x0 + 1024], rows[:, None] * colm[None, :], it['seed'] + 1)
        cv = np.roll(cv, -(W // 2), axis=1)
        print('wrap', it['name'], round(time.time() - t1), flush=True)
        b = io.BytesIO(); Image.fromarray(np.clip(cv[:E + O], 0, 255).astype(np.uint8)).save(b, 'WEBP', quality=95, method=4)
        put(f"{it['name']}.webp", b.getvalue())
        for f in (f"{it['name']}.webp", f"start-{it['name']}.jpg", f"t2i-{it['name']}.jpg"):
            done.append((f, (OUT / f).read_bytes()))
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
