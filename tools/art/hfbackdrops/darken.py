"""Grade a far strip and its sky into a darker light (hf-backdrops2: the W3 crystal grotto came out with a bright day sky through the
cave mouth, wrong for World 3's dark caves): each pixel multiplied by MUL, more at the top (the sky) than at the bottom.
    python3 -I tools/art/hfbackdrops/darken.py <stem> r,g,b(top) r,g,b(bottom)
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image

B = Path(__file__).resolve().parents[2].parent / 'src/assets/backdrops'
stem = sys.argv[1]
top = np.array([float(v) for v in sys.argv[2].split(',')], np.float32)
bot = np.array([float(v) for v in sys.argv[3].split(',')], np.float32)
far = B / f'{stem}-far.webp'
sky = B / f'{stem}-sky.webp'
fs = Image.open(far).convert('RGB')
sk = Image.open(sky).convert('RGBA')
H = fs.height + sk.height
for p, im, y0 in ((sky, sk, 0), (far, fs, sk.height)):
    a = np.asarray(im).astype(np.float32)
    t = ((np.arange(a.shape[0]) + y0) / H)[:, None, None]
    a[..., :3] *= top * (1 - t) + bot * t
    out = Image.fromarray(a.clip(0, 255).astype(np.uint8), im.mode)
    out.save(p, quality=88 if im.mode == 'RGB' else 85, method=6)
    print(p.name, p.stat().st_size // 1024, 'KB')
