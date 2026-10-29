"""Review sheet for job 2 (hf-art-ground): each piece's start beside its takes, keyed, on dark and on mid-grey, at a size near the game's.
    python3 tools/art/hfground/review2.py <raw dir> <out.jpg> <prefix>...
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from keying import key  # noqa: E402

HERE = Path(__file__).resolve().parent
raw, out, prefixes = Path(sys.argv[1]), sys.argv[2], sys.argv[3:]
T = 180
names = sorted({p.stem.rsplit('-s', 1)[0] for p in raw.glob('*.webp') if any(p.stem.startswith(x) for x in prefixes) and '-s' in p.stem})
rows = []
for n in names:
    takes = sorted(raw.glob(f'{n}-s*.webp'))
    cells = []
    st = HERE / 'starts' / f'{n}.webp'
    if st.exists():
        cells.append(('start', Image.open(st).convert('RGBA')))
    for t in takes:
        cells.append((t.stem[len(n) + 1:], key(Image.open(t), main_only=not n.startswith('dress-w5-clut'))))
    R = Image.new('RGB', (T * (1 + 2 * (len(cells) - 1)) + 10, T + 16), (20, 20, 20))
    d = ImageDraw.Draw(R)
    d.text((2, 2), n, fill=(255, 255, 0))
    x = 0
    for i, (lab, im) in enumerate(cells):
        for bg in ([(30, 30, 34)] if i == 0 else [(30, 30, 34), (128, 128, 128)]):
            c = Image.new('RGBA', (T, T), bg + (255,))
            j = im.copy(); j.thumbnail((T - 6, T - 6))
            c.alpha_composite(j, ((T - j.width) // 2, (T - j.height) // 2))
            R.paste(c.convert('RGB'), (x, 16))
            d.text((x + 3, 18), lab, fill=(255, 255, 0))
            x += T
    rows.append(R)
W = max(r.width for r in rows)
S = Image.new('RGB', (W, sum(r.height for r in rows)), (20, 20, 20))
y = 0
for r in rows:
    S.paste(r, (0, y)); y += r.height
S.save(out, quality=82)
print(out, len(names))
