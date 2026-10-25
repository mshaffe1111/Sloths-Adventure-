"""Qwen-Image-Edit-2509 with reference pictures from mshaffe111/slothadv-gen (stills/<name>.png); results to stills/<name>.png.
env JOB_B64 = {"items": [{"name", "images": [still names], "prompt", "seed", "neg"?}]}"""
import os, io, time, json, base64, subprocess, sys, torch
from PIL import Image
from huggingface_hub import hf_hub_download, HfApi
tok = os.environ['HF_TOKEN']; api = HfApi(token=tok)
REPO = 'mshaffe111/slothadv-gen'
J = json.loads(base64.b64decode(os.environ['JOB_B64']).decode())
try:
    from diffusers import QwenImageEditPlusPipeline
except Exception as e:
    print('installing newer diffusers', repr(e)[:200], flush=True)
    subprocess.run([sys.executable, '-m', 'pip', 'install', '--break-system-packages', '-q', '-U', 'git+https://github.com/huggingface/diffusers'], check=True)
    from diffusers import QwenImageEditPlusPipeline
t0 = time.time()
pipe = QwenImageEditPlusPipeline.from_pretrained('Qwen/Qwen-Image-Edit-2509', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', round(time.time() - t0), flush=True)
NEG = 'text, watermark, extra animals, background scenery, blurry, photo, 3d render, cropped, cut off'
cache = {}
def load(n):
    if n not in cache:
        cache[n] = Image.open(hf_hub_download(REPO, f'stills/{n}.png', token=tok)).convert('RGB')
    return cache[n]
for it in J['items']:
    t1 = time.time()
    try:
        img = pipe(image=[load(n) for n in it['images']], prompt=it['prompt'], negative_prompt=it.get('neg', NEG), true_cfg_scale=4.0,
                   guidance_scale=1.0, num_inference_steps=40, generator=torch.Generator('cuda').manual_seed(it.get('seed', 1))).images[0]
        b = io.BytesIO(); img.save(b, 'PNG')
        api.upload_file(path_or_fileobj=b.getvalue(), path_in_repo=f'stills/{it["name"]}.png', repo_id=REPO)
        print('DONE', it['name'], round(time.time() - t1), flush=True)
    except Exception as e:
        print('FAILED', it['name'], repr(e)[:300], flush=True)
print('ALL_DONE', round(time.time() - t0), flush=True)
