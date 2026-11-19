"""ART-W2B show-first sheet: the shipped pieces (ship.py's ship-*.png) beside World 2's own jetty and ladder at the same px a unit,
the real game stills (the painted wheel drawn by the engine on ?fixture=wheel, upright and sideways) and the edges at 3x on light and dark.
    python3 -I tools/art/hfw2b/sheet.py <cut dir> <stills dir up> <stills dir side> <out.jpg> <base commit>
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

cut, up, side, out, base = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]), sys.argv[4], sys.argv[5]
W = 1800
S = Image.new('RGB', (W, 3000), (34, 34, 38)); d = ImageDraw.Draw(S)
def text(xy, t, c=(255, 240, 160)): d.text(xy, t, fill=c)
text((12, 8), f'ART-W2B show-first: 2-6 noria (rim + spokes), bucket dry / spilling, millrace lip. Base {base}. Row 1: sheet px (3 a unit) at 0.5x beside W2 jetty + ladder + Pokey 89.1 u')
# row 1: pieces at half sheet scale (1.5 px a unit), World 2 pieces at the same
props = Image.open('src/assets/props/w2-props.webp').convert('RGBA')
y0 = 30; x = 12; bg = Image.new('RGBA', (W - 24, 700), (96, 112, 92, 255))
k = 0.5
def put(im, at):
    bg.alpha_composite(im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS), at)
put(Image.open(cut / 'ship-noria.png'), (0, 10))
nx = round(Image.open(cut / 'ship-noria.png').width * k) + 20
yy = 20
for n in ('bucket', 'bucketSpillR', 'bucketSpillL', 'lip'):
    im = Image.open(cut / f'ship-{n}.png'); put(im, (nx, yy)); yy += round(im.height * k) + 16
# the World 2 jetty: its painted px a unit are W2's (1 px = 1 unit on w2-props at its ship scale ~ 0.5); shown at sheet px x k for the painter
jet = props.crop((0, 958, 560, 1258)); bg.alpha_composite(jet.resize((jet.width // 2 * 3 // 2, jet.height // 2 * 3 // 2)), (nx + 420, 20))
lad = props.crop((0, 0, 190, 620)); bg.alpha_composite(lad.resize((lad.width * 3 // 4, lad.height * 3 // 4)), (nx + 1000, 20))
# Pokey's height bar: 89.1 u = 133.6 px here
d2 = ImageDraw.Draw(bg); d2.rectangle([W - 60, 680 - 134, W - 44, 680], fill=(255, 200, 60)); d2.text((W - 120, 680 - 150), 'Pokey 89.1', fill=(255, 255, 255))
S.paste(bg.convert('RGB'), (12, y0))
# row 2: the game stills (upright full, sideways full)
y1 = y0 + 720
text((12, y1), 'Row 2: the real page, ?fixture=wheel (Normal, edge wheel R180 V70 N6), the painted draw: board / mid-ride / step-off, upright then sideways')
ups = sorted(p for p in up.glob('0*.png'))[:4]; sides = sorted(p for p in side.glob('0*.png'))[:3]
x = 12
for p in ups:
    im = Image.open(p).convert('RGB'); im = im.resize((round(im.width * 620 / im.height), 620)); S.paste(im, (x, y1 + 16)); text((x + 4, y1 + 20), p.stem); x += im.width + 8
y2 = y1 + 650; x = 12
for p in sides:
    im = Image.open(p).convert('RGB'); im = im.resize((585, round(im.height * 585 / im.width))); S.paste(im, (x, y2)); text((x + 4, y2 + 4), p.stem); x += 593
# row 3: edges at 3x on light and dark
y3 = y2 + 290
text((12, y3), 'Row 3: edges at 3x (bucket spill corner, rim + spoke join) on light and dark')
x = 12
for n, box in (('bucketSpillR', None), ('noria', None)):
    im = Image.open(cut / f'ship-{n}.png')
    w, h = im.size
    c = im.crop((w - 200, h // 2 - 100, w, h // 2 + 100)) if n == 'noria' else im.crop((w - 260, 0, w - 60, 200))
    for col in ((236, 232, 220), (30, 26, 22)):
        t = Image.new('RGBA', c.size, col + (255,)); t.alpha_composite(c); t = t.resize((c.width * 2, c.height * 2), Image.NEAREST)
        S.paste(t.convert('RGB'), (x, y3 + 16)); x += t.width + 8
S = S.crop((0, 0, W, y3 + 16 + 420))
S.save(out, quality=84)
print(out, S.size)
