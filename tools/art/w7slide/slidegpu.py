"""World 7-4 "The Slide" art (2026-10-29), one GPU job on Hugging Face. The session cannot download from huggingface.co, so the job mounts
the bucket mshaffe111/w5-xfer read-write at /out and works under /out/w7slide/:
  img/<name>.png             mode "img": Qwen-Image img2img with the style model or Pokey's model, as w6to10/img2imggpu.py
  img/sheet-<tag>-<k>.jpg    contact sheets
  img/carrier-<tag>-<k>.png  the pictures as WebP q94 packed byte for byte into greyscale PNGs (w5/unpack_carrier.py), for hf_fs attach
  clips/<name>.zip, clips/sheet-<name>.jpg, clips/<name>.carrier.png
                             mode "clips": Wan 2.2 I2V + the motion model, as w6/swim/swimgpu.py
env SPEC = the spec's path in the bucket: {"tag", "base": url prefix of the starts (raw GitHub, reference/prop-sheets/qa-notes/7-4-slide-art/starts/ at a commit), "loras": {"style": [repo, file, scale], "pokey": [...]}, "items": [{"name", "start",
"prompt", "lora", "strength", "seed", "w", "h", "neg"?}], "clips": [{"name", "src", "prompt", "seed", "w", "h"}], "motion": {...}}.
The token reaches the job only as the job secret HF_TOKEN.
"""
import io, json, os, time, urllib.request, zipfile
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageDraw
from huggingface_hub import hf_hub_download

tok = os.environ['HF_TOKEN']
ROOT = Path(os.environ.get('OUT', '/out'))
OUT = ROOT / 'w7slide'
SPEC = json.loads((ROOT / os.environ['SPEC']).read_text())
TAG = SPEC.get('tag', 'slide')
t0 = time.time()


def put(path, data):
    p = OUT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    print('PUT', path, len(data), flush=True)


def png(im):
    b = io.BytesIO(); im.save(b, 'PNG'); return b.getvalue()


def carrier(files):
    head = json.dumps([[n, len(x)] for n, x in files]).encode() + b'\n'
    data = head + b''.join(x for _, x in files)
    w = 2048
    h = (len(data) + w - 1) // w
    arr = np.zeros(w * h, np.uint8)
    arr[:len(data)] = np.frombuffer(data, np.uint8)
    b = io.BytesIO(); Image.fromarray(arr.reshape(h, w), 'L').save(b, 'PNG', compress_level=9)
    return b.getvalue()


def sheet(ims, labels, tw, cols, title):
    th = max(round(im.height * tw / im.width) for im in ims)
    rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (cols * tw, rows * (th + 16) + 22), (30, 30, 30))
    d = ImageDraw.Draw(S)
    d.text((6, 4), title, fill=(255, 255, 255))
    for i, (im, lab) in enumerate(zip(ims, labels)):
        x, y = (i % cols) * tw, 22 + (i // cols) * (th + 16)
        S.paste(im.convert('RGB').resize((tw, round(im.height * tw / im.width)), Image.LANCZOS), (x, y + 16))
        d.text((x + 3, y + 2), str(lab), fill=(255, 255, 0))
    b = io.BytesIO(); S.save(b, 'JPEG', quality=84)
    return b.getvalue()


def load_lora(pipe, path, name):
    try:
        pipe.load_lora_weights(path, adapter_name=name)
    except Exception as e:  # ai-toolkit key names, as stillsgpu.py
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
        pipe.load_lora_weights(sd2, adapter_name=name)


def img(items):
    try:
        from diffusers import QwenImageImg2ImgPipeline as P
    except Exception as e:
        print('no QwenImageImg2ImgPipeline:', repr(e)[:200], flush=True)
        from diffusers import AutoPipelineForImage2Image as P
    pipe = P.from_pretrained('Qwen/Qwen-Image', torch_dtype=torch.bfloat16).to('cuda')
    print('LOADED', type(pipe).__name__, round(time.time() - t0), flush=True)
    for name, (repo, fn, _) in SPEC['loras'].items():
        load_lora(pipe, hf_hub_download(repo, fn, token=tok), name)
    neg = SPEC.get('neg', 'text, letters, numbers, watermark, frame, border, photo, 3d render, blurry')
    done = []
    for it in items:
        t1 = time.time()
        try:
            ln = it['lora']
            pipe.set_adapters([ln], adapter_weights=[SPEC['loras'][ln][2]])
            with urllib.request.urlopen(SPEC['base'] + it['start'], timeout=60) as r:  # the starts are kept in the repo
                start = Image.open(io.BytesIO(r.read())).convert('RGB')
            w, h = it.get('w', start.width), it.get('h', start.height)
            im = pipe(prompt=it['prompt'], negative_prompt=it.get('neg', neg), image=start.resize((w, h), Image.LANCZOS),
                      strength=it['strength'], width=w, height=h, num_inference_steps=it.get('steps', 30), true_cfg_scale=4.0,
                      generator=torch.Generator('cuda').manual_seed(it.get('seed', 42))).images[0].convert('RGB')
            put(f"img/{it['name']}.png", png(im))
            done.append((it['name'], im))
            print('DONE', it['name'], round(time.time() - t1), flush=True)
        except Exception as e:
            import traceback; traceback.print_exc()
            print('FAILED', it['name'], repr(e)[:300], flush=True)
    for s in range(0, len(done), 12):
        part = done[s:s + 12]
        put(f'img/sheet-{TAG}-{s // 12}.jpg', sheet([im for _, im in part], [n for n, _ in part], 480, 3, TAG))
    chunk, size, k = [], 0, 0
    for n, im in done:
        b = io.BytesIO(); im.save(b, 'WEBP', quality=94, method=4)
        x = b.getvalue()
        if chunk and size + len(x) > 5_500_000:
            put(f'img/carrier-{TAG}-{k}.png', carrier(chunk)); k += 1; chunk, size = [], 0
        chunk.append((f'{n}.webp', x)); size += len(x)
    if chunk:
        put(f'img/carrier-{TAG}-{k}.png', carrier(chunk))
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
    neg = ('camera movement, zoom, pan, background change, scenery, floor, ground, dust cloud, extra limbs, extra characters, human hands, '
           'blurry, deformed, text, watermark, flicker, morphing, turning around, turning to face the camera, leaving the frame, '
           'bag moving, strap changing sides')
    for c in cl:
        name, w, h = c['name'], c.get('w', 704), c.get('h', 704)
        t1 = time.time()
        try:
            im = prep(Image.open(OUT / c['src']).convert('RGB'), w, h)
            frames = pipe(image=im, prompt=c['prompt'], negative_prompt=c.get('neg', neg), height=h, width=w,
                          num_frames=c.get('frames', 49), guidance_scale=3.5, num_inference_steps=30,
                          generator=torch.Generator('cuda').manual_seed(c.get('seed', 7))).frames[0]
            pil = [f if isinstance(f, Image.Image) else Image.fromarray((np.asarray(f) * 255).clip(0, 255).astype(np.uint8)) for f in frames]
            b = io.BytesIO()
            with zipfile.ZipFile(b, 'w') as z:
                for k, f in enumerate(pil):
                    z.writestr(f'{name}_{k:03d}.png', png(f))
            put(f'clips/{name}.zip', b.getvalue())
            put(f'clips/sheet-{name}.jpg', sheet(pil, range(len(pil)), 160, 7, name))
            files = []
            for k, f in enumerate(pil):
                wb = io.BytesIO(); f.save(wb, 'WEBP', quality=95, method=4); files.append((f'{name}_{k:03d}.webp', wb.getvalue()))
            put(f'clips/{name}.carrier.png', carrier(files))
            print('DONE', name, round(time.time() - t1), flush=True)
        except Exception as e:
            print('FAILED', name, repr(e)[:300], flush=True)


if SPEC.get('items'):
    img(SPEC['items'])
if SPEC.get('clips'):
    clips(SPEC['clips'], SPEC.get('motion'))
print('ALL_DONE', round(time.time() - t0), flush=True)
