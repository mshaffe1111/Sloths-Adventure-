"""Review sheet: each piece's old sheet frame, then its two HF takes keyed, on dark | mid-grey. python3 review.py <raw> <out.jpg> [names]"""
import re, sys
from pathlib import Path
from PIL import Image, ImageDraw
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'hfground'))
from keying import depurple, key  # noqa: E402
sys.path.insert(0, str(HERE))
from art import REPAINT  # noqa: E402
ROOT = HERE.parents[2]
F = {m.group(1): tuple(map(int, m.groups()[1:])) for m in re.finditer(r'(\w+): \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+) \}', (ROOT / 'src/game/w5PropsData.ts').read_text())}
raw = Path(sys.argv[1]); names = sys.argv[3:] or list(REPAINT)
sheet = Image.open(ROOT / 'src/assets/props/w5-props.webp').convert('RGBA')
T = 150
def cell(p):
    c = Image.new('RGBA', (T, T), (128, 128, 128, 255)); c.paste((30, 28, 36, 255), (0, 0, T // 2, T))
    p = p.copy(); p.thumbnail((T - 8, T - 8)); c.alpha_composite(p, ((T - p.width) // 2, (T - p.height) // 2)); return c.convert('RGB')
cols = 2
rows = (len(names) + cols - 1) // cols
S = Image.new('RGB', (cols * (3 * T + 12), rows * (T + 14)), (16, 16, 16)); d = ImageDraw.Draw(S)
for i, n in enumerate(names):
    X, Y = (i % cols) * (3 * T + 12), (i // cols) * (T + 14)
    x, y, w, h = F[n]
    ims = [sheet.crop((x, y, x + w, y + h))]
    for t in ('s55-7', 's65-19'):
        im = depurple(key(Image.open(raw / f'w5r-{n}-{t}.webp'), speck=80), lum_max=256, edge_only=3); ims.append(im.crop(im.getbbox()))
    for k, im in enumerate(ims): S.paste(cell(im), (X + k * T, Y + 14))
    d.text((X + 2, Y + 1), f'{n}  old | s55 | s65', fill=(255, 255, 0))
S.save(sys.argv[2], quality=85)
