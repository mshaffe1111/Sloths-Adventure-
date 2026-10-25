"""Qwen-Image-Edit-2509: the guardians' iron collar (the Iron Pact) on the Shadow Prowler. STAGE=idle: the resting pose, several tries
and two collar looks. STAGE=all: the same collar on every other pose, with the chosen collared pose as the reference (image 2)."""
import os, io, time, subprocess, sys, torch
from PIL import Image
from huggingface_hub import hf_hub_download, HfApi
tok = os.environ['HF_TOKEN']; api = HfApi(token=tok)
REPO = 'mshaffe111/prowler-qwen-lora'
STAGE = os.environ.get('STAGE', 'idle')
REF = os.environ.get('REF', 'collared/idle-a1.png')
try:
    from diffusers import QwenImageEditPlusPipeline
except Exception as e:
    print('installing newer diffusers', repr(e)[:200], flush=True)
    subprocess.run([sys.executable, '-m', 'pip', 'install', '--break-system-packages', '-q', '-U', 'git+https://github.com/huggingface/diffusers'], check=True)
    from diffusers import QwenImageEditPlusPipeline
t0 = time.time()
pipe = QwenImageEditPlusPipeline.from_pretrained('Qwen/Qwen-Image-Edit-2509', torch_dtype=torch.bfloat16).to('cuda')
print('LOADED', round(time.time() - t0), flush=True)
COLLARS = {
    'c': ('a plain dark iron collar, a narrow riveted band fitted snugly around the panther\'s neck just behind the head, with a neat row of '
          'small short iron thorn points along its edge'),
    'd': ('a snug dark grey iron collar around the panther\'s neck, a simple band with a few rivets and small thorn points, one dull red '
          'glint where the band is fastened'),
}
KEEP = ('Keep everything else exactly the same: the same panther, the same pose, the same fur, spots and glowing green eyes, the same '
        'painted storybook style with dark ink outlines, the same plain flat grey background. Do not add anything else.')
NEG = ('text, watermark, extra animal, chain, leash, background scenery, blurry, photo, 3d render, gold, jewel, glowing lines on the body, '
       'red stripes, red veins, lava, cracks in the fur, huge spikes, long spikes, glowing collar')

def run(images, prompt, seed):
    return pipe(image=images, prompt=prompt, negative_prompt=NEG, true_cfg_scale=4.0, guidance_scale=1.0,
                num_inference_steps=40, generator=torch.Generator('cuda').manual_seed(seed)).images[0]

def up(img, path):
    b = io.BytesIO(); img.save(b, 'PNG'); api.upload_file(path_or_fileobj=b.getvalue(), path_in_repo=path, repo_id=REPO)

def load(p):
    return Image.open(hf_hub_download(REPO, p, token=tok)).convert('RGB')

if STAGE == 'idle':
    for pose in ('idle', 'w_1', 'alert'):
        src = load(f'inputs/{pose}.png')
        for tag, desc in COLLARS.items():
            for seed in (1, 2):
                t1 = time.time()
                up(run([src], f'Put {desc} on the black panther. {KEEP}', seed), f'collared/{pose}-{tag}{seed}.png')
                print('DONE', pose, tag, seed, round(time.time() - t1), flush=True)
else:
    ref = load(REF)
    names = os.environ['POSES'].split(',')
    for name in names:
        src = load(f'inputs/{name}.png')
        for seed in (1, 2):
            t1 = time.time()
            try:
                img = run([src, ref], 'Put the same iron collar with thorns that the panther wears in image 2 around the neck of the panther in image 1. '
                          f'{KEEP} The result keeps image 1\'s pose and framing.', seed)
                up(img, f'collared/{name}-s{seed}.png')
                print('DONE', name, seed, round(time.time() - t1), flush=True)
            except Exception as e:
                print('FAILED', name, seed, repr(e)[:300], flush=True)
print('ALL_DONE', round(time.time() - t0), flush=True)
