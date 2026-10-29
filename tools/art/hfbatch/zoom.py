"""Close-up check strip (2026-10-29): the named frames cropped to the subject's box (union over the frames), keyed and laid on a dark
background at full size, so eyes and edges can be judged.
    python3 -I tools/art/hfbatch/zoom.py <frames dir> <out.jpg> <scale> <clip>:<f1>,<f2>,... [...]
"""
import os, sys, tempfile
from pathlib import Path
os.environ.setdefault('PIPINSTALL', '0')
import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
_tmp = Path(tempfile.mkdtemp()); (_tmp / 'spec.json').write_text('{"groups": {}}')
os.environ.update(OUT=str(_tmp), SPEC='spec.json', GROUPS='')
sys.path.insert(0, str(HERE.parent / 'w6to10'))
import cutpack  # noqa: E402

SRC, OUT, K = Path(sys.argv[1]), Path(sys.argv[2]), float(sys.argv[3])
rows = []
for arg in sys.argv[4:]:
    clip, fl = arg.split(':')
    ims = []
    for n in fl.split(','):
        rgb = np.asarray(Image.open(SRC / f'{clip}_{int(n):03d}.webp').convert('RGB'))
        a = cutpack.key_default(rgb)
        ims.append((n, rgb, a))
    m = np.zeros_like(ims[0][2]);
    for _, _, a in ims:
        m = np.maximum(m, a)
    ys, xs = np.nonzero(m > 8)
    box = (max(0, xs.min() - 6), max(0, ys.min() - 6), xs.max() + 7, ys.max() + 7)
    tiles = []
    for n, rgb, a in ims:
        im = Image.fromarray(np.dstack([rgb, a]), 'RGBA').crop(box)
        bg = Image.new('RGBA', im.size, (22, 22, 30, 255)); bg.alpha_composite(im)
        bg = bg.convert('RGB').resize((round(im.width * K), round(im.height * K)), Image.LANCZOS)
        ImageDraw.Draw(bg).text((3, 2), f'{clip} {n}', fill=(255, 255, 0))
        tiles.append(bg)
    rows.append(tiles)
W = max(sum(t.width for t in r) for r in rows); H = sum(r[0].height for r in rows)
S = Image.new('RGB', (W, H), (60, 60, 60)); y = 0
for r in rows:
    x = 0
    for t in r:
        S.paste(t, (x, y)); x += t.width
    y += r[0].height
S.save(OUT, quality=88)
print(OUT, S.size)
