"""Start for World 1's side branch (2026-11-05, the lead's go): a short limb growing out of the side of a kapok trunk, so a further bough
can hang from a shared trunk. Pasted up from the W1 kit's own pieces (src/assets/proto/props-atlas.webp: PROTO_FRAMES.trunk and
.branch) on magenta, for fungusgpu.py to repaint by img2img (make_sidebranch_spec.py).
    python3 -I tools/art/hfbatch/sidebranchstarts.py <out dir>
  side.png  a slice of the kit trunk standing at the left, and out of its right side the kit limb, shortened, rising a little (8 deg)
            from a swollen bark collar where it joins (no gap), its tip ending in a flat sawn top to stand on. The final frame is the
            limb and its collar only (sidebranchcut.py cuts it at the trunk's edge); the trunk is in the start so the join is painted.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)
W, H = 1024, 768
A = Image.open(ROOT / 'src/assets/proto/props-atlas.webp').convert('RGBA')
TRUNK = A.crop((737, 0, 737 + 173, 590))          # PROTO_FRAMES.trunk
LIMB = A.crop((381, 1583, 381 + 598, 1583 + 180))  # PROTO_FRAMES.branch
# (the limb's bromeliad off: the bark beside it pasted over, as rotwoodstarts.py does)
LIMB.paste(LIMB.crop((250, 0, 330, 180)).transpose(Image.FLIP_LEFT_RIGHT), (330, 0)); LIMB.paste(LIMB.crop((250, 0, 330, 180)), (410, 0))

cv = Image.new('RGBA', (W, H), MAG + (255,))
trunk = TRUNK.resize((230, 784), Image.LANCZOS).crop((0, 0, 230, H))
tx = 120
limb = LIMB.crop((0, 0, 430, 180)).resize((560, 200), Image.LANCZOS).rotate(8, expand=True, resample=Image.BICUBIC)
ly = 300
# the limb, then the collar: a bark flare from the trunk's edge out to the limb's own thickness, filled with the trunk's bark
cv.alpha_composite(limb, (tx + 150, ly))
la = np.asarray(limb)[..., 3] > 128
def span(col):
    ys = np.nonzero(la[:, col])[0]
    return (ly + ys.min(), ly + ys.max()) if len(ys) else (ly, ly)
t0, b0 = span(20)
# (the trunk's own right edge at the limb's height, from its alpha: the kit frame has a clear margin)
ta = np.asarray(trunk)[..., 3] > 128
ex = tx + int(np.median([np.nonzero(ta[y])[0].max() for y in range(0, H, 4)])) - 6   # (the median: the vine loops stick out)
fl = [(ex, t0 - 70), (ex + 80, t0 - 4), (ex + 80, b0 + 4), (ex, b0 + 80)]
fm = Image.new('L', (W, H), 0); ImageDraw.Draw(fm).polygon(fl, fill=255)
bark = TRUNK.resize((230, 784), Image.LANCZOS).crop((20, 250, 230, 250 + 350)).resize((140, 360), Image.LANCZOS)
bl = Image.new('RGBA', (W, H), (0, 0, 0, 0)); bl.paste(bark, (ex - 20, t0 - 90))
cv.paste(bl, (0, 0), Image.composite(fm, Image.new('L', (W, H), 0), bl.getchannel('A')))
d = ImageDraw.Draw(cv)
d.line([fl[0], fl[1]], fill=(40, 28, 22), width=5); d.line([fl[2], fl[3]], fill=(40, 28, 22), width=5)
cv.alpha_composite(trunk, (tx, 0))
# the tip: a flat sawn end face (pale, with rings), as tall as the limb is thick there, so its top is level to stand on
tc = limb.width - 30
t1, b1 = span(tc)
tipx = tx + 150 + tc
d.ellipse((tipx - 22, t1, tipx + 22, b1), fill=(214, 182, 132), outline=(50, 34, 26), width=5)
for r in (0.25, 0.45):
    hh = (b1 - t1) * r
    d.ellipse((tipx - 22 * r * 2, (t1 + b1) / 2 - hh, tipx + 22 * r * 2, (t1 + b1) / 2 + hh), outline=(160, 120, 80), width=3)
cv.convert('RGB').filter(ImageFilter.GaussianBlur(0.6)).save(OUT / 'side.png')
print('ok', OUT, 'trunk right edge x', ex)
