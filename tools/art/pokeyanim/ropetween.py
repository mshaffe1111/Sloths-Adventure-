"""Cut Qwen-Edit in-betweens of Pokey's rope cells (pokey-anim round 3, spec-anim5.json) into tools/art/rope/clipframes/ for
tools/art/rope/pack.py: keyed off the grey, any rope Qwen drew taken out (long thin strokes, as scripts/cutStandard.py strips a drawn
rope), cropped, with the grip (`gy`: starts2.py put every cell's grip at y=120 of the 768 px picture) and torso middle (`ax`).

    python3 -I tools/art/pokeyanim/ropetween.py <name>=<png> ...   (pngs as hf_fs attach saved them)
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

H = Path(__file__).resolve().parent
ROOT = H.parents[2]
sys.path.insert(0, str(H.parent / 'train'))
sys.path.insert(0, str(ROOT / 'scripts'))
from clips import key, bbox  # noqa: E402
from cutStandard import strip_lines  # noqa: E402

SCALE = 1 / 2.6  # starts2.py drew the rope cells 2.6x their sheet px
GRIP_Y = 120
PAD = 6
# nothing of him reaches above this (his paws close round the rope ~25 px above GRIP_Y): anything there is rope Qwen drew in
ABOVE = 64
out = ROOT / 'tools/art/rope/clipframes'
out.mkdir(exist_ok=True)
mp = out / 'meta.json'
meta = json.loads(mp.read_text()) if mp.exists() else {}
meta['scale'] = SCALE
for arg in sys.argv[1:]:
    name, path = arg.split('=', 1)
    f = np.asarray(Image.open(path).convert('RGB'))
    a = key(f)
    a[:ABOVE] = 0
    m = strip_lines((a > 128).astype(np.uint8) * 255, min_len=40)
    a = np.where(m > 0, a, 0).astype(np.uint8)
    x0, y0, x1, y1 = bbox(a)
    x0, y0, x1, y1 = max(0, x0 - PAD), max(0, y0 - PAD), min(f.shape[1], x1 + PAD), min(f.shape[0], y1 + PAD)
    Image.fromarray(np.dstack([f, a]), 'RGBA').crop((x0, y0, x1, y1)).save(out / f'{name}.png')
    sub = a[y0:y1, x0:x1] > 128
    ys, xs = np.nonzero(sub)
    h = ys.max() - ys.min()
    band = (ys > ys.min() + 0.3 * h) & (ys < ys.min() + 0.65 * h)
    # the grip: where the rope would run, GRIP_Y, unless Qwen drew his fists higher than the cells hold them (5-6 did); then through
    # his fists, the cells' own ~25 px below the top of his paws
    meta[name] = {'ax': float(np.median(xs[band])), 'gy': float(min(GRIP_Y - y0, PAD + 25)), 'top': int(y0)}
    print(name, meta[name], (x1 - x0, y1 - y0))
mp.write_text(json.dumps(meta, indent=1))
