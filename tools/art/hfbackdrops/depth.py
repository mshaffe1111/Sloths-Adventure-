"""Give a washed-out set depth (lead's review 2026-11-01: "a big pale area with nothing in it"): stretch the far strip's (and its sky's)
contrast about its mean by K, so its silhouettes come forward; then (after process.py finish re-grades the middle strip at half haze)
darken the middle strip by D so there is a clear value step far -> middle -> near.
    python3 -I tools/art/hfbackdrops/depth.py far <stem> <K>
    python3 -I tools/art/hfbackdrops/depth.py mid <stem> <D>
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image

B = Path(__file__).resolve().parents[2].parent / 'src/assets/backdrops'
what, stem, k = sys.argv[1], sys.argv[2], float(sys.argv[3])
if what == 'far':
    far = np.asarray(Image.open(B / f'{stem}-far.webp').convert('RGB')).astype(np.float32)
    mu = far.reshape(-1, 3).mean(0)
    for name in ('far', 'sky'):
        p = B / f'{stem}-{name}.webp'
        if not p.exists():
            continue
        im = Image.open(p)
        a = np.asarray(im.convert('RGBA' if name == 'sky' else 'RGB')).astype(np.float32)
        a[..., :3] = (a[..., :3] - mu) * k + mu
        Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA' if name == 'sky' else 'RGB').save(p, quality=86, method=6)
        print(p.name, p.stat().st_size // 1024, 'KB')
else:
    p = B / f'{stem}-mid.webp'
    a = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
    a[..., :3] *= k
    Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA').save(p, quality=88, method=6)
    print(p.name, p.stat().st_size // 1024, 'KB')
