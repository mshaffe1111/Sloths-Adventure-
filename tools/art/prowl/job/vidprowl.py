"""Wan 2.2 image-to-video job: clips listed in the CLIPS_B64 env var (json), frames zipped as PNG plus a GIF, uploaded to the repo."""
import os, io, time, json, base64, zipfile, torch
import numpy as np
from PIL import Image
from huggingface_hub import hf_hub_download, HfApi
from diffusers import WanImageToVideoPipeline
tok = os.environ['HF_TOKEN']; api = HfApi(token=tok)
REPO = 'mshaffe111/prowler-qwen-lora'
CLIPS = json.loads(base64.b64decode(os.environ['CLIPS_B64']).decode())
t0 = time.time()
pipe = WanImageToVideoPipeline.from_pretrained('Wan-AI/Wan2.2-I2V-A14B-Diffusers', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', round(time.time() - t0), flush=True)
NEG = ('camera movement, zoom, pan, tracking shot, background change, extra limbs, extra characters, human hands, fingers, '
       'blurry, deformed, text, watermark, flicker, morphing')


def prep(path, w, h):
    """the figure on grey, cropped (or padded with the grey) to the clip's shape around its middle, then sized"""
    im = Image.open(path).convert('RGB')
    g = im.getpixel((2, 2))
    W0, H0 = im.size
    want = w / h
    if W0 / H0 > want:
        cw, ch = W0, int(W0 / want)
    else:
        cw, ch = int(H0 * want), H0
    # a canvas of the right shape, filled with the grey, the picture centred on it, then the middle cut to fit
    c = Image.new('RGB', (max(cw, W0), max(ch, H0)), g)
    c.paste(im, ((c.width - W0) // 2, (c.height - H0) // 2))
    x0 = (c.width - cw) // 2; y0 = (c.height - ch) // 2
    return c.crop((x0, y0, x0 + cw, y0 + ch)).resize((w, h), Image.LANCZOS)


for c in CLIPS:
    name, w, h = c['name'], c.get('w', 832), c.get('h', 480)
    t1 = time.time()
    try:
        img = prep(hf_hub_download(REPO, c['src'], token=tok), w, h)
        frames = pipe(image=img, prompt=c['prompt'], negative_prompt=c.get('negfull', NEG + c.get('neg', '')), height=h, width=w,
                      num_frames=c.get('frames', 49), guidance_scale=3.5, num_inference_steps=30,
                      generator=torch.Generator('cuda').manual_seed(c.get('seed', 7))).frames[0]
        pil = [f if isinstance(f, Image.Image) else Image.fromarray((np.asarray(f) * 255).clip(0, 255).astype(np.uint8)) for f in frames]
        with zipfile.ZipFile(f'/tmp/{name}.zip', 'w') as z:
            for k, f in enumerate(pil):
                b = io.BytesIO(); f.save(b, 'PNG'); z.writestr(f'{name}_{k:03d}.png', b.getvalue())
        pil[0].save(f'/tmp/{name}.gif', save_all=True, append_images=pil[1:], duration=62, loop=0)
        api.upload_file(path_or_fileobj=f'/tmp/{name}.zip', path_in_repo=f'videos/{name}.zip', repo_id=REPO)
        api.upload_file(path_or_fileobj=f'/tmp/{name}.gif', path_in_repo=f'videos/{name}.gif', repo_id=REPO)
        print('DONE', name, round(time.time() - t1), flush=True)
    except Exception as e:
        print('FAILED', name, repr(e)[:300], flush=True)
print('ALL_DONE', round(time.time() - t0), flush=True)
