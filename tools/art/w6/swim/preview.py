"""Previews of the cut swim frames (2026-10-27): a contact sheet of every chosen frame and an animated GIF of each move, with a
stand-in water band so the waterline reads (the game draws and masks the real water).

    python3 -I tools/art/w6/swim/preview.py <out dir>
"""
import json, sys
from pathlib import Path

from PIL import Image, ImageDraw

H = Path(__file__).resolve().parent
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
meta = json.loads((H / 'frames' / 'meta.json').read_text())
SKY, WATER, DEEP = (196, 214, 200), (60, 120, 120, 150), (40, 92, 100)
SC = 2  # previews at twice the sheet size, so they read on a phone


def scene(fr, m):
    w, h = fr.size
    bg = Image.new('RGBA', (w, h), DEEP + (255,) if m['water'] is None else SKY + (255,))
    bg.alpha_composite(fr)
    if m['water'] is not None:  # the game masks him below the waterline: a translucent band stands in for it
        band = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(band).rectangle([0, int(m['ay']), w, h], fill=WATER)
        ImageDraw.Draw(band).line([0, int(m['ay']), w, int(m['ay'])], fill=(230, 245, 245, 255), width=2)
        bg.alpha_composite(band)
    return bg.convert('RGB').resize((w * SC, h * SC), Image.LANCZOS)


tiles = []
for mv, m in meta.items():
    fs = sorted((H / 'frames' / mv).glob(f'{mv}_*.png'))
    ims = [scene(Image.open(f).convert('RGBA'), m) for f in fs]
    seq = ims if m['loop'] else ims + [ims[-1]] * 4  # a one-shot holds its last frame before the GIF repeats
    seq[0].save(OUT / f'{mv}.gif', save_all=True, append_images=seq[1:], duration=round(1000 / m['fps']), loop=0, disposal=2)
    tiles.append((mv, m, ims))
    print(mv, len(ims), 'frames ->', OUT / f'{mv}.gif')

TS = 0.65  # every move at one scale (1.3x the sheet), so their sizes compare as they will in the game
lab = 18
rows = []
for mv, m, ims in tiles:
    tw, th = round(ims[0].width * TS), round(ims[0].height * TS)
    rows.append((mv, m, [im.resize((tw, th), Image.LANCZOS) for im in ims], tw, th))
W = max(len(r[2]) * r[3] for r in rows)
Ht = sum(th + lab * 2 for *_, th in rows)
S = Image.new('RGB', (W, Ht), (32, 32, 32))
d = ImageDraw.Draw(S)
y = 0
for mv, m, ims, tw, th in rows:
    d.text((4, y + 3), f"{mv}  ({m['clip']} frames {m['frames']}, {'loop' if m['loop'] else 'one-shot'}, {m['fps']} fps)", fill=(255, 255, 255))
    for i, im in enumerate(ims):
        S.paste(im, (i * tw, y + lab))
        d.text((i * tw + 3, y + lab + th + 2), str(i), fill=(255, 230, 0))
    y += th + lab * 2
S.save(OUT / 'contact-sheet.png')
print('sheet ->', OUT / 'contact-sheet.png')
