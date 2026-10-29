"""Key 7-3's ring of chairs (2026-10-29) off the magenta, with the repo's cut and despill (w6to10/geminicut.py cut_cell: border flood,
soft rim, r and b clamped toward g on the fringe), trim it and scale it to 1600 px wide; then the review sheet: every candidate, and the
pick on dark and on mid-grey.
    python3 -I tools/art/hfbatch/chairscut.py <takes dir> <pick name> <out.webp> <review.jpg>
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'w6to10'))
from geminicut import cut_cell  # noqa: E402

TAKES, PICK, OUT, REVIEW = Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3]), Path(sys.argv[4])
src = Image.open(TAKES / f'{PICK}.webp').convert('RGB')
cut_src = src
if len(sys.argv) > 5:  # dim=X0:F:Y1: darken the painted (non-key) pixels right of x0 and above y1 by F (the c take painted its
    # eleventh chair near white; y1 keeps the floor strip under it untouched, so no seam)
    x0, f, y1 = sys.argv[5].split('=')[1].split(':')
    b = np.asarray(src).astype(np.float32)
    part = b[:int(y1), int(x0):]
    paint = part[..., 1] > np.minimum(part[..., 0], part[..., 2]) - 60
    part[paint] *= float(f)
    cut_src = Image.fromarray(np.clip(b, 0, 255).astype(np.uint8))
sp = cut_cell(cut_src, 'magenta', {})
sp = sp.crop(sp.getchannel('A').getbbox())
# (the model paints the thin outline with some of the key in it: a purple-pink line on a dark ground. A second, wider despill on the
# 4 px band next to the transparency: where both r and b sit above g (a magenta tint), pull them both down to g + 6; brown roots,
# with b under g, are left alone.)
a = np.asarray(sp).astype(np.float32)
band = ndimage.binary_dilation(a[..., 3] < 128, iterations=4) & (a[..., 3] > 0)
ex = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1] - 6, 0, None) * band
a[..., 0] -= ex; a[..., 2] -= ex
# (tone match to the World 7 kit: the repaint's stone came out a little lilac and dark, mean rgb about 115/107/103 against the kit's
# 119-132 / 112-133 / 101-124 with green at or above red; a light grade pulls it back to the kit's grey-green.)
a[..., 0] *= 0.98 * 1.07; a[..., 1] *= 1.03 * 1.07; a[..., 2] *= 0.98 * 1.07
sp = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')
k = 1600 / sp.width
sp = sp.resize((1600, round(sp.height * k)), Image.LANCZOS)
OUT.parent.mkdir(parents=True, exist_ok=True)
sp.save(OUT, 'WEBP', quality=90, method=6)
print(OUT, sp.size, OUT.stat().st_size)

takes = sorted(TAKES.glob('*.webp'))
tw = 800
cols = 2
th = round(tw * src.height / src.width)
rows = (len(takes) + 1) // 2
pw = 1600
ph = sp.height
H = rows * (th + 22) + 2 * (ph + 40) + 10
S = Image.new('RGB', (cols * tw + 10, H), (24, 24, 24))
d = ImageDraw.Draw(S)
for i, f in enumerate(takes):
    x, y = (i % cols) * (tw + 10), (i // cols) * (th + 22)
    S.paste(Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS), (x, y + 20))
    d.text((x + 4, y + 4), f.stem + ('   <- PICK' if f.stem == PICK else ''), fill=(255, 230, 0))
y = rows * (th + 22) + 10
for label, col in (('pick on dark (#141018)', (20, 16, 24)), ('pick on mid-grey (#808080)', (128, 128, 128))):
    bg = Image.new('RGBA', (pw, ph), col + (255,))
    bg.alpha_composite(sp)
    d.text((4, y + 4), label, fill=(255, 230, 0))
    S.paste(bg.convert('RGB'), (0, y + 22))
    y += ph + 40
REVIEW.parent.mkdir(parents=True, exist_ok=True)
S.save(REVIEW, 'JPEG', quality=88)
print(REVIEW, S.size)
