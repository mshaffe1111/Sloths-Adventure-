"""Cut World 8's glow-mushroom cluster (2026-10-31; jobs.txt hfb-w8glowcaps-g1, take glowcaps-s72-17) into
src/assets/w6to10/props-made/w8glowcaps.webp: magenta keyed out with its spill (funguscut.py's key), trimmed, 300 px wide; its frame
(anchored at the middle of its foot) is printed for w8DecorData.ts W8GLOW.
    python3 -I tools/art/hfbatch/glowcut.py <take png>
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]


def key(im):
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mag = (r - g) + (b - g)
    alpha = np.clip(255 - (mag - 140) * 3, 0, 255).astype(np.uint8)
    edge = (alpha > 0) & (alpha < 255)
    a2 = a.copy()
    a2[..., 0] = np.where(edge, np.minimum(r, g + 40), r)
    a2[..., 2] = np.where(edge, np.minimum(b, g + 60), b)
    return Image.fromarray(np.dstack([np.clip(a2, 0, 255).astype(np.uint8), alpha]), 'RGBA')


im = key(Image.open(sys.argv[1]))
im = im.crop(im.getbbox())
im = im.resize((300, round(300 * im.height / im.width)), Image.LANCZOS)
dst = ROOT / 'src/assets/w6to10/props-made/w8glowcaps.webp'
im.save(dst, 'WEBP', quality=90, method=6)
print(json.dumps({'glow-mushrooms': {'x': 0, 'y': 0, 'w': im.width, 'h': im.height, 'ax': im.width / 2, 'ay': im.height}}))
