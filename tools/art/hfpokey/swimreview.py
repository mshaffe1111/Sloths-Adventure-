"""Review sheet for the swim satchel fix (hf-art-pokey, 2026-10-29): each fixed loop next to the frames it replaces and the surf loop
(the satchel reference), on dark, at the sheet's own size and at game size (x0.45, about how big he is on a phone), plus GIFs.

    python3 -I tools/art/hfpokey/swimreview.py <before dir> <after dir> <out dir>

<before dir>/<move>/<move>_NN.png and <after dir>/<move>/<move>_NN.png are cut frames (RGBA), as reference/animation-sheets/pokey-swim/.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

B, A, OUT = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
OUT.mkdir(parents=True, exist_ok=True)
DARK, GREY = (24, 28, 36), (110, 112, 116)


def frames(d, m):
    return [Image.open(f).convert('RGBA') for f in sorted((d / m).glob(f'{m}_*.png'))]


def row(ims, k, bg):
    ims = [im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS) for im in ims]
    W = sum(im.width + 6 for im in ims)
    H = max(im.height for im in ims)
    R = Image.new('RGBA', (W, H), bg + (255,))
    x = 0
    for im in ims:
        R.alpha_composite(im, (x, H - im.height)); x += im.width + 6
    return R


def stack(rows, title):
    W = max(r.width for _, r in rows) + 10
    H = 26 + sum(r.height + 22 for _, r in rows)
    S = Image.new('RGB', (W, H), (16, 16, 20))
    d = ImageDraw.Draw(S)
    d.text((6, 6), title, fill=(255, 255, 255))
    y = 26
    for lab, r in rows:
        d.text((6, y + 4), lab, fill=(255, 220, 0)); y += 18
        S.paste(r.convert('RGB'), (5, y)); y += r.height + 4
    return S


surf = frames(A if (A / 'surf').exists() else B, 'surf')
for m in sys.argv[4:] or ['tread', 'under']:
    bf, af = frames(B, m), frames(A, m)
    rows = [(f'{m} BEFORE (no satchel), sheet size, on dark', row(bf, 1.0, DARK)),
            (f'{m} AFTER, sheet size, on dark', row(af, 1.0, DARK)),
            ('surf (the satchel reference), sheet size, on dark', row(surf, 1.0, DARK)),
            (f'{m} AFTER on mid-grey', row(af, 1.0, GREY)),
            (f'game size (x0.45): before / after / surf, on dark', row(bf + af, 0.45, DARK)),
            ('', row(surf, 0.45, DARK))]
    stack(rows, f'Pokey swim: {m} satchel fix (hf-art-pokey)').save(OUT / f'{m}-before-after.jpg', quality=90)
    seq = []
    for im in af:
        c = Image.new('RGBA', im.size, DARK + (255,)); c.alpha_composite(im); seq.append(c.convert('RGB').resize((im.width * 2, im.height * 2), Image.LANCZOS))
    seq[0].save(OUT / f'{m}-after.gif', save_all=True, append_images=seq[1:], duration=150 if m == 'tread' else 125, loop=0)
    print(m, len(bf), '->', len(af))
