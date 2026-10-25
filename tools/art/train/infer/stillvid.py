import os, io, time, torch
from huggingface_hub import hf_hub_download, HfApi
from diffusers import DiffusionPipeline
tok = os.environ['HF_TOKEN']
api = HfApi(token=tok)
t0 = time.time()
pipe = DiffusionPipeline.from_pretrained('Qwen/Qwen-Image', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', round(time.time() - t0), flush=True)
lora = hf_hub_download('mshaffe111/pokey-qwen-lora', 'pokey_qwen_v1.safetensors', token=tok)
try:
    pipe.load_lora_weights(lora)
    print('LORA ok (direct)', flush=True)
except Exception as e:
    print('LORA direct failed:', str(e)[:300], flush=True)
    from safetensors.torch import load_file
    sd = load_file(lora)
    print('keys', list(sd.keys())[:4], flush=True)
    sd2 = {}
    for k, v in sd.items():
        k2 = k
        for pre in ('diffusion_model.', 'model.diffusion_model.', 'base_model.model.'):
            if k2.startswith(pre): k2 = 'transformer.' + k2[len(pre):]
        if not k2.startswith('transformer.'): k2 = 'transformer.' + k2
        sd2[k2] = v
    pipe.load_lora_weights(sd2)
    print('LORA ok (renamed)', flush=True)

STILLS = [('push-mime-a', 42), ('push-mime-b', 7), ('push-mime-c', 1234)]
POSE = ('pokeysloth, pushing hard with both paws held straight out in front of him against something unseen, leaning his whole body forward, '
        'feet braced apart, straining, side view facing right, nothing in front of him, painted storybook illustration, plain grey background')
for name, seed in STILLS:
    img = pipe(prompt=POSE, negative_prompt=' ', width=1024, height=1024, num_inference_steps=30, true_cfg_scale=4.0,
               generator=torch.Generator('cuda').manual_seed(seed)).images[0]
    buf = io.BytesIO(); img.save(buf, 'PNG')
    api.upload_file(path_or_fileobj=buf.getvalue(), path_in_repo=f'tests/{name}.png', repo_id='mshaffe111/pokey-qwen-lora')
    print('DONE still', name, flush=True)
del pipe
import gc; gc.collect(); torch.cuda.empty_cache()
import os, io, time, json, base64, zipfile, torch
import numpy as np
from PIL import Image
from huggingface_hub import hf_hub_download, HfApi
from diffusers import WanImageToVideoPipeline
tok = os.environ['HF_TOKEN']; api = HfApi(token=tok)
REPO = 'mshaffe111/pokey-qwen-lora'
CLIPS = json.loads(base64.b64decode(os.environ['CLIPS_B64']).decode())
t0 = time.time()
pipe = WanImageToVideoPipeline.from_pretrained('Wan-AI/Wan2.2-I2V-A14B-Diffusers', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', round(time.time() - t0), flush=True)
NEG = ('camera movement, zoom, pan, tracking shot, background change, extra limbs, extra characters, human hands, fingers, '
       'blurry, deformed, text, watermark, flicker, morphing')


def prep(path, w, h):
    im = Image.open(path).convert('RGBA')
    bg = Image.new('RGBA', im.size, (128, 128, 128, 255)); bg.alpha_composite(im)
    im = bg.convert('RGB')
    if w == h:  # a figure on grey: pad to a square first
        s = max(im.size); c = Image.new('RGB', (s, s), im.getpixel((2, 2))); c.paste(im, ((s - im.width) // 2, (s - im.height) // 2)); im = c
    return im.resize((w, h), Image.LANCZOS)


for c in CLIPS:
    name, w, h = c['name'], c.get('w', 704), c.get('h', 704)
    t1 = time.time()
    try:
        img = prep(hf_hub_download(REPO, c['src'], token=tok), w, h)
        frames = pipe(image=img, prompt=c['prompt'], negative_prompt=NEG + c.get('neg', ''), height=h, width=w,
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
