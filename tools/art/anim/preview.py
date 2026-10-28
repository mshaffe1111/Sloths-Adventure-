"""Previews of the cut frames (2026-10-28): an animated GIF per move (on a light backdrop, with the ground line, a flier's middle or
the waterline drawn at the anchor) and one contact sheet of every chosen frame, all at one scale.

    python3 -I tools/art/anim/preview.py <out dir> [name ...]
"""
import json, sys
from pathlib import Path

from PIL import Image, ImageDraw

H = Path(__file__).resolve().parent
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
names = sys.argv[2:] or sorted(p.name for p in (H / 'frames').iterdir() if (p / 'meta.json').exists())
BG, LINE, WATER = (214, 222, 206), (120, 96, 70), (60, 120, 120, 120)
SC = 1.5


def scene(fr, m):
    w, h = fr.size
    bg = Image.new('RGBA', (w, h), BG + (255,))
    d = ImageDraw.Draw(bg)
    y = int(m['ay'])
    if m['anchor'] == 'ground':
        d.line([0, y, w, y], fill=LINE + (255,), width=2)
    elif m['anchor'] == 'middle':
        d.line([int(m['ax']) - 6, y, int(m['ax']) + 6, y], fill=LINE + (255,), width=1)
    bg.alpha_composite(fr)
    if m['anchor'] == 'water':
        band = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(band).rectangle([0, y, w, h], fill=WATER)
        bg.alpha_composite(band)
    return bg.convert('RGB').resize((round(w * SC), round(h * SC)), Image.LANCZOS)


rows = []
for name in names:
    meta = json.loads((H / 'frames' / name / 'meta.json').read_text())
    for mv, m in meta.items():
        fs = sorted((H / 'frames' / name / mv).glob(f'{mv}_*.png'))
        raw = [Image.open(f).convert('RGBA') for f in fs]
        ims = [scene(f, m) for f in raw]
        seq = ims if m['loop'] else ims + [ims[-1]] * 6  # a one-shot holds its last frame before the GIF repeats
        seq[0].save(OUT / f'{name}-{mv}.gif', save_all=True, append_images=seq[1:], duration=round(1000 / m['fps']), loop=0)
        rows.append((f"{name} {mv}  ({m['clip']} {m['frames']}, {'loop' if m['loop'] else 'one-shot'}, {m['fps']} fps)", raw, m))
        print(name, mv, len(ims), '->', OUT / f'{name}-{mv}.gif')

TS, lab = 0.6, 18
tiles = [(t, [r.resize((max(1, round(r.width * TS)), max(1, round(r.height * TS))), Image.LANCZOS) for r in raw], m) for t, raw, m in rows]
W = max(sum(im.width + 4 for im in ims) for _, ims, _ in tiles)
Ht = sum(ims[0].height + lab * 2 for _, ims, _ in tiles)
S = Image.new('RGB', (W, Ht), (36, 36, 36))
d = ImageDraw.Draw(S)
y = 0
for t, ims, m in tiles:
    d.text((4, y + 3), t, fill=(255, 255, 255))
    x = 0
    for i, im in enumerate(ims):
        tile = Image.new('RGBA', im.size, BG + (255,))
        tile.alpha_composite(im)
        S.paste(tile.convert('RGB'), (x, y + lab))
        d.text((x + 3, y + lab + im.height + 2), str(i), fill=(255, 230, 0))
        x += im.width + 4
    y += ims[0].height + lab * 2
S.save(OUT / 'contact-sheet.png')
print('sheet ->', OUT / 'contact-sheet.png')
