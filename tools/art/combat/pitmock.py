"""R-159.1 pit list (w8-rope2, 2026-11-04): today's vault pits beside a CODE mock of the look the painted art should give them (a fall
that reads as a fall: the ground line ends, the gap drops into dark with roots at the lips; 1-3's soft pit bottoms out on a lit leaf bed).
The mock is only a brief for the painted art; it is stamped MOCK so nobody mistakes it for the fix.
    python3 -I tools/art/combat/pitmock.py <shots dir> <out dir>
"""
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SHOTS, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
# each pit: the shot, the gap's columns at full size, the lip line, soft or not (read off the shots by a 100 px grid)
PITS = [
    ('1-8 The Long Branch: a vault pit', 'stomp-1-approach-side', 570, 1195, 520, False),
    ('1-3 Branch Snakes: the first vault, a soft pit', 'esc13-3-vault-side', 515, 1140, 505, True),
]


def fix(img, x0, x1, lip, soft):
    W, H = img.size
    rnd = random.Random(7)
    over = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    # the drop: dark from just under the lip, near-black by ~170 px down
    for y in range(lip + 30, H):
        t = min(1, (y - lip - 30) / 170)
        a = int(250 * t ** 0.8)
        d.line((x0, y, x1, y), fill=(8, 14, 10, a))
    # ragged lips: the ground's edge torn down into the dark, both sides
    for side, xe in ((1, x0), (-1, x1)):
        pts = [(xe, lip + 10)]
        for k in range(1, 12):
            pts.append((xe + side * rnd.randint(4, 28), lip + 10 + k * 26))
        pts.append((xe, lip + 10 + 12 * 26))
        d.polygon(pts, fill=(52, 36, 24, 255))
        # roots hanging off the lip
        for r in range(5):
            rx = xe + side * rnd.randint(6, 60)
            ry = lip + rnd.randint(14, 40)
            d.line([(rx, ry), (rx + side * rnd.randint(-10, 14), ry + rnd.randint(60, 150))], fill=(40, 28, 18, 255), width=rnd.randint(3, 6))
    if soft:
        # 1-3: the drop ends on a lit bed of big leaves (it catches him: a miss costs nothing)
        for k in range(26):
            cx = rnd.randint(x0 + 20, x1 - 20)
            cy = rnd.randint(H - 95, H - 30)
            w, h = rnd.randint(70, 120), rnd.randint(26, 40)
            g = rnd.randint(120, 170)
            d.ellipse((cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2), fill=(40, g, 60, 255), outline=(20, 70, 30, 255), width=3)
    over = over.filter(ImageFilter.GaussianBlur(1.2))
    img.alpha_composite(over)
    return img


tiles = []
for title, shot, x0, x1, lip, soft in PITS:
    base = Image.open(SHOTS / f'{shot}.png').convert('RGBA')
    after = fix(base.copy(), x0, x1, lip, soft)
    dr = ImageDraw.Draw(after)
    f = ImageFont.truetype(F, 26)
    txt = 'MOCK (code): the look the painted pit should give'
    w = dr.textlength(txt, font=f)
    dr.rounded_rectangle((50, 220, 70 + w, 260), 8, fill=(180, 30, 30, 235))
    dr.text((60, 224), txt, font=f, fill=(255, 255, 255))
    row = Image.new('RGBA', (base.width + after.width + 36, base.height + 70), (14, 18, 14, 255))
    ImageDraw.Draw(row).text((12, 14), f'{title}: today (left), the fix (right)', font=ImageFont.truetype(F, 30), fill=(253, 230, 138))
    row.alpha_composite(base, (12, 60))
    row.alpha_composite(after, (base.width + 24, 60))
    tiles.append(row.resize((row.width // 2, row.height // 2), Image.LANCZOS))
sheet = Image.new('RGB', (max(t.width for t in tiles), sum(t.height for t in tiles)), (14, 18, 14))
y = 0
for t in tiles:
    sheet.paste(t.convert('RGB'), (0, y))
    y += t.height
sheet.save(OUT / 'pits-today-vs-fix.jpg', quality=88)
print(OUT / 'pits-today-vs-fix.jpg')
