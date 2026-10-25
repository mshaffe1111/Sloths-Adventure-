"""Wan 2.2 image-to-video clips from stills in mshaffe111/slothadv-gen (stills/<src>.png), uploaded as clips/<name>.zip + .gif.
env CLIPS_B64 = [{"name", "src", "prompt", "seed", "w", "h", "neg"?}], optional MOTION_B64 = {"high": [repo, file], "low": [repo, file], "scale"}"""
import os, io, time, json, base64, zipfile, torch
import numpy as np
from PIL import Image
from huggingface_hub import hf_hub_download, HfApi
from diffusers import WanImageToVideoPipeline
tok = os.environ['HF_TOKEN']; api = HfApi(token=tok)
REPO = 'mshaffe111/slothadv-gen'
CLIPS = json.loads(base64.b64decode(os.environ['CLIPS_B64']).decode())
MOTION = json.loads(base64.b64decode(os.environ['MOTION_B64']).decode()) if os.environ.get('MOTION_B64') else None
t0 = time.time()
pipe = WanImageToVideoPipeline.from_pretrained('Wan-AI/Wan2.2-I2V-A14B-Diffusers', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', round(time.time() - t0), flush=True)
if MOTION:
    sc = MOTION.get('scale', 1.0)
    try:
        pipe.load_lora_weights(hf_hub_download(*MOTION['high'], token=tok), adapter_name='mhigh')
        pipe.load_lora_weights(hf_hub_download(*MOTION['low'], token=tok), adapter_name='mlow', load_into_transformer_2=True)
        pipe.set_adapters(['mhigh', 'mlow'], adapter_weights=[sc, sc])
        print('MOTION LORA ok', flush=True)
    except Exception as e:
        print('MOTION LORA failed', repr(e)[:400], flush=True)
        raise
NEG = ('camera movement, zoom, pan, tracking shot, background change, scenery, extra limbs, extra characters, human hands, fingers, '
       'blurry, deformed, text, watermark, flicker, morphing, turning to face the camera, leaving the frame')


def prep(path, w, h):
    im = Image.open(path).convert('RGB')
    if abs(im.width / im.height - w / h) > 0.02:
        # a figure on grey: pad to the clip's shape with the picture's own grey, figure in the middle
        tw = max(im.width, round(im.height * w / h)); th = max(im.height, round(im.width * h / w))
        c = Image.new('RGB', (tw, th), im.getpixel((2, 2))); c.paste(im, ((tw - im.width) // 2, (th - im.height) // 2)); im = c
    return im.resize((w, h), Image.LANCZOS)


for c in CLIPS:
    name, w, h = c['name'], c.get('w', 832), c.get('h', 480)
    t1 = time.time()
    try:
        img = prep(hf_hub_download(REPO, f"stills/{c['src']}.png", token=tok), w, h)
        frames = pipe(image=img, prompt=c['prompt'], negative_prompt=c.get('neg', NEG), height=h, width=w,
                      num_frames=c.get('frames', 49), guidance_scale=3.5, num_inference_steps=30,
                      generator=torch.Generator('cuda').manual_seed(c.get('seed', 7))).frames[0]
        pil = [f if isinstance(f, Image.Image) else Image.fromarray((np.asarray(f) * 255).clip(0, 255).astype(np.uint8)) for f in frames]
        with zipfile.ZipFile(f'/tmp/{name}.zip', 'w') as z:
            for k, f in enumerate(pil):
                b = io.BytesIO(); f.save(b, 'PNG'); z.writestr(f'{name}_{k:03d}.png', b.getvalue())
        pil[0].save(f'/tmp/{name}.gif', save_all=True, append_images=pil[1:], duration=62, loop=0)
        api.upload_file(path_or_fileobj=f'/tmp/{name}.zip', path_in_repo=f'clips/{name}.zip', repo_id=REPO)
        print('DONE', name, round(time.time() - t1), flush=True)
    except Exception as e:
        print('FAILED', name, repr(e)[:300], flush=True)
print('ALL_DONE', round(time.time() - t0), flush=True)
