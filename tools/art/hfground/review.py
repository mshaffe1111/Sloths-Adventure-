"""Review sheets for the ground takes (hf-art-ground): per world, every soil take (base and its variants), a 3x3 brick-bond check of each
base's variants laid as the game lays them, the top lips on dark and mid-grey, and the bank ends keyed on dark and mid-grey.
    python3 tools/art/hfground/review.py <raw dir> <out dir> <world>...
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import seam  # noqa: E402
from keying import key  # noqa: E402

raw, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)


def label(im, t):
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 8 * len(t) + 6, 14), fill=(0, 0, 0))
    d.text((3, 1), t, fill=(255, 255, 0))
    return im


def on(im, col):
    bg = Image.new('RGBA', im.size, col + (255,))
    bg.alpha_composite(im)
    return bg.convert('RGB')


for w in sys.argv[3:]:
    tiles = []
    for t in 'abcd':
        names = [f'fill-w{w}-{t}-base'] + [f'fill-w{w}-{t}-v{s}' for s in (3, 5, 7)]
        ims = [Image.open(raw / f'{n}.webp').convert('RGB') for n in names if (raw / f'{n}.webp').exists()]
        if not ims:
            continue
        row = Image.new('RGB', (4 * 256, 256))
        for i, (n, im) in enumerate(zip(names, ims)):
            row.paste(label(im.resize((256, 256)), n), (i * 256, 0))
        chk = label(seam.check3(ims[1:] or ims, scale=0.25), f'w{w}-{t} 3x3 brick, variants mixed')
        tiles.append((row, chk))
    lips = []
    for t in 'ab':
        for n in (f'lip-w{w}-{t}-base', f'lip-w{w}-{t}-v9'):
            p = raw / f'{n}.webp'
            if p.exists():
                k = key(Image.open(p))
                strip = Image.new('RGBA', (k.width * 2, k.height))
                strip.paste(k, (0, 0)); strip.paste(k, (k.width, 0))
                strip = strip.resize((1024, round(1024 * k.height / strip.width)))
                lips.append(label(on(strip, (30, 30, 34)), n + ' x2'))
                lips.append(on(strip, (128, 128, 128)))
    ends = []
    for t in 'ab':
        p = raw / f'end-w{w}-{t}.webp'
        if p.exists():
            k = key(Image.open(p)).resize((256, 384))
            ends.append(label(on(k, (30, 30, 34)), f'end-w{w}-{t}'))
            ends.append(on(k, (128, 128, 128)))
    H = sum(r.height + c.height for r, c in tiles) + sum(l.height for l in lips) + (384 if ends else 0)
    S = Image.new('RGB', (1024, H), (20, 20, 20))
    y = 0
    for r, c in tiles:
        S.paste(r, (0, y)); y += r.height
        S.paste(c, (0, y)); y += c.height
    for l in lips:
        S.paste(l, (0, y)); y += l.height
    for i, e in enumerate(ends):
        S.paste(e, (i * 256, y))
    S.save(out / f'review-w{w}.jpg', quality=84)
    print(out / f'review-w{w}.jpg')
