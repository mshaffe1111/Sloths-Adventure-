"""Before/after contact sheets for hf-backdrops2: per world, each stage's upright (412x915) and sideways (915x412) shot from the
release (before) and this branch (after), Pokey placed 45% along (audit.mjs 'b' shot, else the start 'a').
    python3 -I tools/art/hfbackdrops/sheet2.py <before dir> <after dir> <out dir> [world ...]
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

bdir, adir, out = map(Path, sys.argv[1:4])
worlds = [int(w) for w in sys.argv[4:]] or [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
out.mkdir(parents=True, exist_ok=True)


def shot(d, sid, tag):
    for k in ('b', 'a'):
        p = d / f'{sid}-{tag}-{k}.png'
        if p.exists():
            return Image.open(p).convert('RGB')
    return None


for w in worlds:
    ids = [f'{w}-{s}' for s in range(1, 10) if (adir / f'{w}-{s}-412x915-a.png').exists()]
    if not ids:
        continue
    # upright: 206x458 each, before above after; sideways: 458x206
    uw, uh, sw, sh = 206, 458, 458, 206
    cols = len(ids)
    W = max(cols * (uw + 6) + 6, 4 * (sw + 6) + 6)
    S = Image.new('RGB', (W, 22 + 2 * (uh + 18) + (cols + 1) // 2 * (sh + 18) + 10), (24, 24, 24))
    d = ImageDraw.Draw(S)
    d.text((6, 4), f'World {w}: upright 412x915 (top: before, then after), then sideways 915x412 (before | after pairs)', fill=(255, 255, 0))
    for i, sid in enumerate(ids):
        x = 6 + i * (uw + 6)
        for r, (dd, lab) in enumerate(((bdir, 'before'), (adir, 'after'))):
            im = shot(dd, sid, '412x915')
            y = 22 + r * (uh + 18)
            d.text((x, y), f'{sid} {lab}', fill=(255, 255, 255))
            if im:
                S.paste(im.resize((uw, uh)), (x, y + 14))
    y0 = 22 + 2 * (uh + 18)
    for i, sid in enumerate(ids):
        row, col = divmod(i, 2)
        for k, (dd, lab) in enumerate(((bdir, 'before'), (adir, 'after'))):
            im = shot(dd, sid, '915x412')
            x = 6 + (col * 2 + k) * (sw + 6)
            y = y0 + row * (sh + 18)
            d.text((x, y), f'{sid} {lab}', fill=(255, 255, 255))
            if im:
                S.paste(im.resize((sw, sh)), (x, y + 14))
    p = out / f'w{w}-before-after.jpg'
    S.save(p, quality=80)
    print(p, S.size)
