"""World 5 GPU work (2026-10-26): on-model pose edits and Wan 2.2 clips, reading start pictures from the bucket and writing back to it.

Like w5cpu.py, results go to the bucket mshaffe111/w5-xfer mounted at /out (the session's token cannot write the game's HF repos).
env SPEC = jobs/<spec>.json in the bucket, with any of:
  "edits": [{"name", "images": [bucket paths, e.g. "stills/w5q-idle.png"], "prompt", "seed", "lora": "queen"|"meeca"|null, "scale"}]
        Qwen-Image-Edit-2509 with the game's own frames as the reference, optionally with the character's trained model
        (mshaffe111/<queen|meeca>-qwen-lora) loaded into the edit model -> stills/<name>.png, plus a numbered contact sheet
        stills/w5c-edits-<tag>.jpg.
  "clips": [{"name", "src": bucket path of the start picture, "prompt", "seed", "w", "h"}], "motion": {...}
        Wan 2.2 I2V with the motion model, exactly as gen/gen_clips.py -> clips/<name>.zip (49 PNG frames) and a numbered contact
        sheet stills/w5c-sheet-<name>.jpg.
  "part"/"parts" in env PART, PARTS split the clips between jobs.
"""
import base64, io, json, os, subprocess, sys, time, zipfile
from pathlib import Path

import numpy as np
import torch
from PIL import Image, ImageDraw
from huggingface_hub import hf_hub_download

tok = os.environ['HF_TOKEN']
OUT = Path(os.environ.get('OUT', '/out'))
SPEC = json.loads((OUT / os.environ['SPEC']).read_text())
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
            img = prep(Image.open(OUT / c['src']).convert('RGB'), w, h)
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
