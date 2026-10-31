"""Cut the rolling barrel's end (hfb-w10bag-r2, 2026-10-31: three barrel ends face on, the style sheet on the canvas) into
src/assets/w10/barrel-end.webp: one round lid, keyed off magenta, trimmed to its circle (its middle is the axle the engine turns it on).
    python3 -I tools/art/w10/barrelcut.py <takes dir> [take] [which 0..2]"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, str(Path(__file__).resolve().parent))
from w10lib import key_magenta, trim, on, DARK, GREY  # noqa: E402

T = Path(sys.argv[1])
take = sys.argv[2] if len(sys.argv) > 2 else 's58-23'
which = int(sys.argv[3]) if len(sys.argv) > 3 else 0
GAME = Path(__file__).resolve().parents[3]
src = Image.open(T / f'w10bag2-{take}.webp').convert('RGB')
row = key_magenta(src.crop((0, 760, src.width, src.height)))
a = np.asarray(row.getchannel('A')) > 40
cols = np.where(a.any(axis=0))[0]
# (the lids, left to right: runs of opaque columns)
runs, s = [], cols[0]
for p, q in zip(cols, cols[1:]):
    if q > p + 8:
        runs.append((s, p)); s = q
runs.append((s, cols[-1]))
x0, x1 = runs[which]
im, _ = trim(row.crop((x0, 0, x1 + 1, row.height)))
# (a clean circle: anything outside the lid's rim is cut, so it turns without a corner showing)
d = min(im.size)
im = im.crop(((im.width - d) // 2, (im.height - d) // 2, (im.width - d) // 2 + d, (im.height - d) // 2 + d))
m = Image.new('L', (d * 4, d * 4), 0)
ImageDraw.Draw(m).ellipse((2, 2, d * 4 - 3, d * 4 - 3), fill=255)
m = m.resize((d, d), Image.LANCZOS)
al = np.minimum(np.asarray(im.getchannel('A')), np.asarray(m))
im.putalpha(Image.fromarray(al))
im = im.resize((160, 160), Image.LANCZOS)
out = GAME / 'src/assets/w10/barrel-end.webp'
im.save(out, 'WEBP', quality=90, method=6)
print(out, im.size, out.stat().st_size, 'runs', runs)
R = Image.new('RGB', (360, 170), DARK)
R.paste(on(im, DARK), (0, 0)); R.paste(on(im, GREY), (180, 0))
R.save(GAME / 'reference/prop-sheets/qa-notes/w10/barrel-end-cut.jpg', quality=88)
