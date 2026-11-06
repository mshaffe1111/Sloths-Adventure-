"""Review stills for 1-1's bootprint clue (2026-11-05): the cut print (src/assets/props/w1-bootprint.webp) at its in-game size (90 game
px wide) on real screenshots of 1-1's end (the shrine's log, taken with the stills.mjs way: the engine paused and stepped, layout 1,
Normal), upright 412x915 and sideways 915x412, and a close-up contact sheet of every take of the round.
    python3 -I tools/art/hfbatch/bootreview.py <upright png> <sideways png> <round 1 sheet jpg> <round 2 sheet jpg> <picked take png> <out dir>
The cameras are the ones the screenshots printed (cam.x, cam.y, zoom); the print sits on the shrine log's top (y 420) at x 32170, 143 px
before the shrine (exitTotemX 32313), clear of the petal pickup that floats over x ~32110.
"""
import os, sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
up, side, sheet, sheet2, take, out = sys.argv[1:7]
OUT = Path(out); OUT.mkdir(parents=True, exist_ok=True)
P = Image.open(os.environ.get('PROP', ROOT / 'src/assets/props/w1-bootprint.webp')).convert('RGBA')
PRE = os.environ.get('PREFIX', 'review')   # (PROP=<webp> PREFIX=option-b: another cut, e.g. bootcut.py east)
WX, WY = 32170, 420
DRAW_H = round(P.height / 4)  # (the file is 4x; (bootcut.py: a flush decal, its TOP edge on the landing's top line y 420, hanging on the log's face)
CAMS = {'upright': (up, 31880.98, 0.0, 0.93636), 'sideways': (side, 31563.28, 205.0, 0.76296)}
if os.environ.get('BANK'):
    # (BANK=1: the proof on a real World 1 bank top, the coordinator 2026-11-05: 1-5's end bank, x 45976-46616, top y 930, the
    # shrine at 46376; shots by shot2.mjs STAGE=1-5 BACK=450 with the camera snapped to its target. The print sits between Meeca's
    # first sign (x ~45805) and Pokey (x 45926, his left foot ~45904), clear of both, and far from where he stops at the shrine (46411))
    WX, WY = 45862, 930
    CAMS = {'upright': (up, 45794.0, 392.549, 0.93636), 'sideways': (side, 45476.328, 633.0, 0.76296)}


def place(shot, cx, cy, z):
    im = Image.open(shot).convert('RGBA')
    h = round(DRAW_H * z); w = round(h * P.width / P.height)
    p = P.resize((w, h), Image.LANCZOS)
    sx, sy = round((WX - cx) * z), round((WY - cy) * z)
    im.alpha_composite(p, (sx - w // 2, sy))
    return im, (sx - w // 2, sy, w, h)


for tag, (shot, cx, cy, z) in CAMS.items():
    im, (x, y, w, h) = place(shot, cx, cy, z)
    im.convert('RGB').save(OUT / f'{PRE}-{tag}.jpg', quality=90)
    # the same with a 3x close-up of that spot in a corner, to judge the edges and style next to the log's own paint
    pad = 30
    crop = im.crop((x - pad, y - pad, x + w + pad, y + h + pad))
    crop = crop.resize((crop.width * 4, crop.height * 4), Image.LANCZOS)
    im2 = im.copy()
    ox, oy = (im.width - crop.width - 8, im.height - crop.height - 8)
    ImageDraw.Draw(im2).rectangle((ox - 3, oy - 3, ox + crop.width + 2, oy + crop.height + 2), fill=(255, 255, 255, 255))
    im2.alpha_composite(crop, (ox, oy))
    ImageDraw.Draw(im2).rectangle((x - 2, y - 2, x + w + 1, y + h + 1), outline=(255, 255, 0, 255), width=1)
    im2.convert('RGB').save(OUT / f'{PRE}-{tag}-zoom.jpg', quality=90)
    print(tag, 'print at', x, y, w, h)

# the contact sheet: every take (the job's own sheet) above the picked take, the cut on light and dark, and the cut at 90 px
S1, S2 = Image.open(sheet).convert('RGB'), Image.open(sheet2).convert('RGB')
S = Image.new('RGB', (1440, S1.height + S2.height + 40), (30, 30, 30))
S.paste(S1, (0, 20)); S.paste(S2, (0, S1.height + 40))
ImageDraw.Draw(S).text((4, 4), 'ROUND 1 (hfb-w1boot-r1): the bed seen from above', fill=(120, 220, 255))
ImageDraw.Draw(S).text((4, S1.height + 24), 'ROUND 2 (hfb-w1boot-r2): the bed laid down for the side view', fill=(120, 220, 255))
pick = Image.open(take).convert('RGB').resize((480, 320), Image.LANCZOS)
cw = 1440
row2 = Image.new('RGB', (cw, 360), (30, 30, 30))
d = ImageDraw.Draw(row2)
row2.paste(pick, (0, 30)); d.text((4, 8), 'low-s62-5 (raw take), re-cut to the print', fill=(255, 255, 0))
for i, bg in enumerate([(128, 138, 104), (20, 20, 20)]):
    b = Image.new('RGBA', P.size, bg + (255,)); b.alpha_composite(P)
    b = b.convert('RGB')
    b = b.resize((round(P.width * 2.4), round(P.height * 2.4)), Image.LANCZOS)
    row2.paste(b, (500 + i * (b.width + 14), 30))
d.text((504, 8), 'the decal on log moss and dark (2.4x of the file)', fill=(255, 255, 0))
small = P.resize((round(DRAW_H * P.width / P.height), DRAW_H), Image.LANCZOS)
d.text((1340, 8), 'game size', fill=(255, 255, 0))
bb = Image.new('RGBA', (small.width + 10, small.height + 10), (70, 90, 50, 255)); bb.alpha_composite(small, (5, 5))
row2.paste(bb.convert('RGB'), (1340, 30))
sheetout = Image.new('RGB', (cw, S.height + row2.height), (30, 30, 30))
sheetout.paste(S, (0, 0)); sheetout.paste(row2, (0, S.height))
if PRE == 'review':
    sheetout.save(OUT / 'contact-takes.jpg', quality=88)
print('sheet', sheetout.size)
