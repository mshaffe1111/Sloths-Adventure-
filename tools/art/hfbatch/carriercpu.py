"""Bring existing clips (zips of PNG frames in the bucket) back to this session (2026-10-29): every 2nd frame as WebP q95, packed byte
for byte into greyscale carrier PNGs under 6.5 MB (hf_fs attach takes up to 8 MB; unpack with tools/art/w5/unpack_carrier.py).
CPU job, image python:3.12, volumes ["hf://buckets/mshaffe111/w5-xfer:/out:rw"], env SUB, CLIPS (comma list of zip paths under the
bucket), TAG. No token needed beyond the job's own mount.
"""
import io, json, os, subprocess, sys, zipfile
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'pillow', 'numpy'], check=True)
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path('/out')
OUT = ROOT / os.environ['SUB'] / 'carriers'
OUT.mkdir(parents=True, exist_ok=True)
TAG = os.environ.get('TAG', 'c')


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
for zp in os.environ['CLIPS'].split(','):
    name = Path(zp).stem
    with zipfile.ZipFile(ROOT / zp) as z:
        ns = sorted(n for n in z.namelist() if n.lower().endswith('.png'))
        for i in range(0, len(ns), 2):
            im = Image.open(io.BytesIO(z.read(ns[i]))).convert('RGB')
            b = io.BytesIO(); im.save(b, 'WEBP', quality=95, method=4); x = b.getvalue()
            if chunk and size + len(x) > 6_300_000:
                (OUT / f'carrier-{TAG}-{k}.png').write_bytes(carrier(chunk)); print('PUT', k, len(chunk), flush=True)
                k += 1; chunk, size = [], 0
            chunk.append((f'{name}_{i:03d}.webp', x)); size += len(x)
    print('CLIP', name, len(ns), im.size, flush=True)
if chunk:
    (OUT / f'carrier-{TAG}-{k}.png').write_bytes(carrier(chunk)); print('PUT', k, len(chunk), flush=True)
print('ALL_DONE', k + 1, flush=True)
