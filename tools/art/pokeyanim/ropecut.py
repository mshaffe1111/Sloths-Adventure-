"""Cut a rope clip made with no rope (pokey-anim, spec-anim2.json: Pokey moving hand over hand along a rope left out of the picture, the
game draws its own) into tools/art/rope/clipframes/ for tools/art/rope/pack.py: keyed off the grey, cropped, his grip (`gy`, where the
rope's middle would run through his paws: the top of his paws plus the Gemini cells' own 10 px) and torso middle (`ax`) measured.

    python3 -I tools/art/pokeyanim/ropecut.py <clip> <first> <last>   (frames from tools/art/train/vids/<clip>/, png)
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

H = Path(__file__).resolve().parent
ROOT = H.parents[2]
sys.path.insert(0, str(H.parent / 'train'))
from clips import key, bbox  # noqa: E402

# starts.py drew rope cell f1 at 300/200 of its sheet px: the clip's px back to the rope sheet's
SCALE = 200 / 300
GRIP_BELOW_TOP = 10 / SCALE
PAD = 6

clip, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
out = ROOT / 'tools/art/rope/clipframes'
out.mkdir(exist_ok=True)
mp = out / 'meta.json'
meta = json.loads(mp.read_text()) if mp.exists() else {}
meta['scale'] = SCALE
for n in range(a, b + 1):
    f = np.asarray(Image.open(ROOT / f'tools/art/train/vids/{clip}/{clip}_{n:03d}.png').convert('RGB'))
    al = key(f)
    x0, y0, x1, y1 = bbox(al)
    x0, y0, x1, y1 = max(0, x0 - PAD), max(0, y0 - PAD), min(f.shape[1], x1 + PAD), min(f.shape[0], y1 + PAD)
    im = Image.fromarray(np.dstack([f, al]), 'RGBA').crop((x0, y0, x1, y1))
    sub = al[y0:y1, x0:x1] > 128
    ys, xs = np.nonzero(sub)
    h = ys.max() - ys.min()
    band = (ys > ys.min() + 0.3 * h) & (ys < ys.min() + 0.65 * h)
    name = f'p{n:02d}'
    im.save(out / f'{name}.png')
    meta[name] = {'w': im.width, 'h': im.height, 'ax': float(np.median(xs[band])), 'gy': float(ys.min() + GRIP_BELOW_TOP)}
    print(name, meta[name])
mp.write_text(json.dumps(meta, indent=1))
