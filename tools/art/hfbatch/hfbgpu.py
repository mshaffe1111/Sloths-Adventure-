"""HF batch for Worlds 7-8 (2026-10-29): creature clips started from a frame of an EXISTING clip in the bucket (so a new move shares
that clip's canvas, framing and scale and swaps in place), then tools/art/anim/animgpu.py (already in the bucket at anim/jobs/) runs
the spec as usual. A clip with "pin": true gets its last frame held to its first (Wan's last_image, as rope/ropegpu.py).

A clip may give "zipsrc": [<zip path under the bucket>, <frame index>] instead of "src": the frame is written to
<SUB>/starts/<name>.png first. Bucket: <SUB>/jobs/hfbgpu.py (this file), <SUB>/jobs/<spec>.json.
Job: image ostris/aitoolkit:latest, flavor rtx-pro-6000, secrets {"HF_TOKEN"}, volumes ["hf://buckets/mshaffe111/w5-xfer:/out:rw"],
env SUB, SPEC (bucket path of the spec), PART, PARTS. The token reaches the job only as the job secret HF_TOKEN.
"""
import io, json, os, runpy, zipfile
from pathlib import Path

from PIL import Image

ROOT = Path(os.environ.get('OUT', '/out'))
SUB = os.environ['SUB']
spec_p = ROOT / os.environ['SPEC']
spec = json.loads(spec_p.read_text())
for c in spec['clips']:
    if 'zipsrc' in c:
        zp, k = c['zipsrc']
        with zipfile.ZipFile(ROOT / zp) as z:
            ns = sorted(n for n in z.namelist() if n.lower().endswith('.png'))
            im = Image.open(io.BytesIO(z.read(ns[k]))).convert('RGB')
        rel = f'starts/{c["name"]}.png'
        p = ROOT / SUB / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        im.save(p)
        c['src'] = rel
        print('START', c['name'], zp, k, im.size, flush=True)
part = os.environ.get('PART', '0')
out_spec = f'{SUB}/jobs/run-{spec.get("tag", "hfb")}-{part}.json'
(ROOT / out_spec).write_text(json.dumps(spec))
os.environ['SPEC'] = out_spec
import diffusers  # noqa: E402
PIN = {c['prompt'] + '|' + str(c.get('seed')) for c in spec['clips'] if c.get('pin')}
_call = diffusers.WanImageToVideoPipeline.__call__


def _pinned(self, *a, **k):
    g = k.get('generator')
    seed = g.initial_seed() if g is not None else None
    if k.get('prompt', '') + '|' + str(seed) in PIN and 'last_image' not in k:
        k['last_image'] = k['image']
        print('PINNED', seed, flush=True)
    return _call(self, *a, **k)


diffusers.WanImageToVideoPipeline.__call__ = _pinned
runpy.run_path(str(ROOT / 'anim' / 'jobs' / 'animgpu.py'), run_name='__main__')
