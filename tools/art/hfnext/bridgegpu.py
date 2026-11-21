"""ART-NEXT-c (R-165.354), IN the Hugging Face sandbox: Pokey's idle BRIDGES, Wan2.2-I2V-A14B with the first AND last frame pinned
(creaturegpu.py's proven last_image path). Starts from tools/art/hfnext/bridgestarts.py (reference/art/hfnext/bridge/<B>-first/last.png),
fetched from GitHub at commit C. Each gen's frames are written as WebP q92 the moment it finishes, packed into /w/<name>.tar and split
by sbx.py into 95 KB parts (/w/READY-<name> holds the part count): pull each as it lands (D98).
    C=<commit> python bridgegpu.py        (spec: /w/bridge-spec.json = tools/art/hfnext/spec-bridge.json)
"""
import io, json, os, subprocess, tarfile, time, urllib.request
import numpy as np
import torch
from PIL import Image
from diffusers import WanImageToVideoPipeline

C = os.environ['C']
GH = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{C}/'
SPEC = json.load(open('/w/bridge-spec.json'))
t0 = time.time()


def get(path):
    return Image.open(io.BytesIO(urllib.request.urlopen(GH + path).read())).convert('RGB')


pipe = WanImageToVideoPipeline.from_pretrained('Wan-AI/Wan2.2-I2V-A14B-Diffusers', torch_dtype=torch.bfloat16).to('cuda')
print('WAN LOADED', round(time.time() - t0), flush=True)
for g in SPEC['gens']:
    name, t1 = g['name'], time.time()
    try:
        first, last = get(SPEC['dir'] + g['bridge'] + '-first.png'), get(SPEC['dir'] + g['bridge'] + '-last.png')
        out = pipe(image=first, last_image=last, prompt=g['prompt'], negative_prompt=g.get('neg', SPEC['neg']),
                   height=SPEC['h'], width=SPEC['w'], num_frames=g['frames'], guidance_scale=3.5, num_inference_steps=30,
                   generator=torch.Generator('cuda').manual_seed(g['seed'])).frames[0]
        d = f'/w/br/{name}'; os.makedirs(d, exist_ok=True)
        for k, f in enumerate(out):
            im = f if isinstance(f, Image.Image) else Image.fromarray((np.asarray(f) * 255).clip(0, 255).astype(np.uint8))
            im.save(f'{d}/{name}_{k:03d}.webp', quality=92, method=4)
        with tarfile.open(f'/w/{name}.tar', 'w') as t:
            t.add(d, arcname=name)
        n = subprocess.run(['python', '/w/sbx.py', 'parts', f'/w/{name}.tar'], capture_output=True, text=True).stdout.strip()
        open(f'/w/READY-{name}', 'w').write(n + '\n')
        print('DONE', name, len(out), 'frames', round(time.time() - t1), 's', n, 'parts', flush=True)
    except Exception as e:
        print('FAILED', name, repr(e)[:300], flush=True)
print('ALL_DONE', round(time.time() - t0), flush=True)
open('/w/DONE', 'w').write('ok\n')
