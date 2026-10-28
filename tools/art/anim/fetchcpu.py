"""Bring existing clips from mshaffe111/slothadv-gen (clips/<name>.zip) back to a session that cannot reach huggingface.co
(2026-10-27): a CPU job reads each zip and writes, in the bucket mshaffe111/w5-xfer mounted at /out, under <SUB>/clips/:
  sheet-<name>.jpg      numbered contact sheet of the clip's frames (pick with hf_fs attach)
  <name>.carrier.png    the frames as WebP q95 packed byte for byte into one greyscale PNG (w5/unpack_carrier.py unpacks it)
env CLIPS = comma-separated clip names, SUB = bucket folder (default "anim"). The token reaches the job only as the secret HF_TOKEN.
Run on python:3.12, flavor cpu-basic (no GPU spend).
"""
import subprocess, sys

subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'pillow', 'numpy', 'huggingface_hub'], check=True)
import io, json, os, zipfile  # noqa: E402
from pathlib import Path  # noqa: E402

import numpy as np  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402
from huggingface_hub import hf_hub_download  # noqa: E402

tok = os.environ['HF_TOKEN']
OUT = Path(os.environ.get('OUT', '/out')) / os.environ.get('SUB', 'anim') / 'clips'
OUT.mkdir(parents=True, exist_ok=True)


def sheet(ims, title, tw=200, cols=7):
    th = round(ims[0].height * tw / ims[0].width)
    rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (cols * tw, rows * (th + 16) + 22), (40, 40, 40))
    d = ImageDraw.Draw(S)
    d.text((6, 4), title, fill=(255, 255, 255))
    for i, im in enumerate(ims):
        x, y = (i % cols) * tw, 22 + (i // cols) * (th + 16)
        S.paste(im.convert('RGB').resize((tw, th), Image.LANCZOS), (x, y + 16))
        d.text((x + 3, y + 2), str(i), fill=(255, 255, 0))
    b = io.BytesIO(); S.save(b, 'JPEG', quality=84)
    return b.getvalue()


def carrier(files):
    head = json.dumps([[n, len(x)] for n, x in files]).encode() + b'\n'
    data = head + b''.join(x for _, x in files)
    w = 2048
    h = (len(data) + w - 1) // w
    arr = np.zeros(w * h, np.uint8)
    arr[:len(data)] = np.frombuffer(data, np.uint8)
    b = io.BytesIO(); Image.fromarray(arr.reshape(h, w), 'L').save(b, 'PNG', compress_level=9)
    return b.getvalue()


for name in os.environ['CLIPS'].split(','):
    try:
        with zipfile.ZipFile(hf_hub_download('mshaffe111/slothadv-gen', f'clips/{name}.zip', token=tok)) as z:
            names = sorted(n for n in z.namelist() if n.endswith('.png'))
            ims = [Image.open(io.BytesIO(z.read(n))).convert('RGB') for n in names]
        (OUT / f'sheet-{name}.jpg').write_bytes(sheet(ims, name))
        files = []
        for k, im in enumerate(ims):
            b = io.BytesIO(); im.save(b, 'WEBP', quality=95, method=4); files.append((f'{name}_{k:03d}.webp', b.getvalue()))
        (OUT / f'{name}.carrier.png').write_bytes(carrier(files))
        print('DONE', name, len(ims), flush=True)
    except Exception as e:
        print('FAILED', name, repr(e)[:300], flush=True)
print('ALL_DONE', flush=True)
