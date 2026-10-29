"""Before/after sheets of the every-stage pieces in the game (hf-art-stage, 2026-10-29) from tools/art/shot-stage-art-all.sh's shots:
one sheet per piece, upright (390 x 844) and sideways (844 x 390), before on the left, after on the right.
    python3 -I tools/art/hfbatch/beforeafter.py <shots dir>
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

R = Path(__file__).resolve().parents[3]
SH = Path(sys.argv[1])
OUT = R / 'reference/prop-sheets/qa-notes/hf-art-stage'
names = sorted({f.name[len('after-'):].rsplit('-', 1)[0] for f in SH.glob('after-*-up.jpg')})
for n in names:
    ims = {}
    for t in ('before', 'after'):
        for o in ('up', 'side'):
            f = SH / f'{t}-{n}-{o}.jpg'
            ims[t, o] = Image.open(f).convert('RGB') if f.exists() else None
    uw, uh = 300, 650
    sw, sh = 650, 300
    W = 2 * uw + 2 * sw + 50
    S = Image.new('RGB', (W, uh + 30), (16, 16, 20))
    d = ImageDraw.Draw(S)
    x = 0
    for o, (w, h) in (('up', (uw, uh)), ('side', (sw, sh))):
        for t in ('before', 'after'):
            im = ims[t, o]
            if im is not None:
                S.paste(im.resize((w, h), Image.LANCZOS), (x, 24))
            d.text((x + 4, 6), f'{t} {o}' + ('' if im is not None else ' (no shot)'), fill=(255, 230, 0))
            x += w + 12
    p = OUT / f'ba-{n}.jpg'
    S.save(p, 'JPEG', quality=84)
    print(p)
