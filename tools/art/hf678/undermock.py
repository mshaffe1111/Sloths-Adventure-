"""ART-678b FAIL 1: show an underlayer band (a) tiled 3x side by side on LIGHT and DARK, and (b) laid into a real game frame under the
lowest ground strip. A MOCK-UP, nothing wired: the band is drawn behind everything above `top` (the frame's own pixels are kept there)
and the foreground leaves below are re-laid over it by a colour mask (bright leaf green). Every sheet prints what it shows.

    python3 undermock.py <band.webp|png> <frame.jpg> <frame label> <px per unit in frame> <top y> <out prefix> [join x]

Sizes: the band is 3 px per game unit; in the frame it is drawn at (px per unit in frame) / 3. The seam: the band is tiled from x0 =
join - band width, so a join between two copies lands at `join` (default the frame's middle) and can be judged in the frame.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

band, frame, flabel, ppu, top, outp = sys.argv[1:7]
ppu, top = float(ppu), int(top)
B = Image.open(band).convert('RGBA'); Fr = Image.open(frame).convert('RGB'); FW, FH = Fr.size
join = int(sys.argv[7]) if len(sys.argv) > 7 else FW // 2
try:
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
except OSError:
    F = ImageFont.load_default()
name = band.rsplit('/', 1)[-1]

# (a) 3x side by side, at half size, on light and on dark, joins marked by ticks under the strip
t = B.resize((B.width // 2, B.height // 2), Image.LANCZOS)
S = Image.new('RGB', (t.width * 3, 60 + 2 * (t.height + 40)), 'white'); d = ImageDraw.Draw(S)
d.text((8, 8), f'{name} tiled 3x side by side (shown at 0.5x of 3 px/unit; one tile {B.width}x{B.height} px = '
               f'{B.width / 3:.0f}x{B.height / 3:.0f} units). Ticks = the joins. Rows: LIGHT, DARK.', fill='black', font=F)
for r, c in enumerate([(236, 232, 220), (28, 32, 36)]):
    y = 60 + r * (t.height + 40)
    row = Image.new('RGBA', (t.width * 3, t.height), c + (255,))
    for k in range(3):
        row.alpha_composite(t, (k * t.width, 0))
    S.paste(row.convert('RGB'), (0, y))
    for k in (1, 2):
        d.line([(k * t.width, y + t.height + 4), (k * t.width, y + t.height + 24)], fill=(220, 0, 0), width=3)
S.save(f'{outp}-tiled3.jpg', quality=88)

# (b) in the frame
k = ppu / 3.0
bt = B.resize((round(B.width * k), round(B.height * k)), Image.LANCZOS)
lay = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
x = join % bt.width - bt.width  # copies at ..., join - w, join, ... (the layer is empty, so a masked paste is a composite)
while x < FW:
    lay.paste(bt, (x, top), bt)
    x += bt.width
out = Fr.convert('RGBA'); out.alpha_composite(lay)
o = np.asarray(out.convert('RGB')).copy(); f = np.asarray(Fr).astype(int)
o[:top + 18] = f[:top + 18]  # everything above the band's top (the ground strip, Pokey) stays in front
r, g, b = f[..., 0], f[..., 1], f[..., 2]
leaf = (g > r + 25) & (g > b + 15) & (g > 95)
leaf[:FH - 260] = False  # only the foreground leaves along the bottom edge
o[leaf] = f[leaf]
M = Image.fromarray(o.astype(np.uint8))
pair = Image.new('RGB', (FW * 2 + 20, FH + 110), 'white'); d = ImageDraw.Draw(pair)
pair.paste(Fr, (0, 110)); pair.paste(M, (FW + 20, 110))
d.text((8, 6), f'LEFT: the real frame, {flabel}', fill='black', font=F)
d.text((8, 32), f'RIGHT: MOCK-UP (not wired): {name} behind everything above y {top}, drawn at {k:.2f}x ({ppu:.2f} frame px per unit,', fill='black', font=F)
d.text((8, 58), f'Pokey 89.1 u drawn), a join at x {join} (red tick); foreground leaves re-laid in front.', fill='black', font=F)
d.line([(FW + 20 + join, 110 + top - 30), (FW + 20 + join, 110 + top - 6)], fill=(220, 0, 0), width=3)
pair.save(f'{outp}-frame.jpg', quality=88)
print('band in frame', bt.size, 'top', top, 'bottom', top + bt.height, 'of', FH)
