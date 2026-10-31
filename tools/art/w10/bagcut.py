"""Cut World 10's grab-bag art (hfb-w10bag-r1, 2026-10-31) into src/assets/w10/bag.webp + bag.json, and a review sheet.
    python3 -I tools/art/w10/bagcut.py <takes dir>
Canvas a is a 3 x 3 grid of 512 px cells (bagstarts.py); each pick names its take and its cell. Canvas b: beams and the gush on black,
keyed by brightness (w10lib.key_black). The anchor of every frame is the middle of its foot, except the pulley's (its wheel's hub)."""
import json, sys
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
from w10lib import key_magenta, key_black, trim, write, on, DARK, GREY  # noqa: E402

T = Path(sys.argv[1])
GAME = Path(__file__).resolve().parents[3]
CELLS = ['pulley', 'weight', 'cog', 'rack', 'gatehouse', 'grate', 'barrels', 'winch', 'winch-jam']
PICK = {'pulley': 's62-23', 'weight': 's50-23', 'cog': 's62-23', 'rack': 's62-7', 'gatehouse': 's62-7', 'grate': 's50-23',
        'barrels': 's62-23', 'winch': 's62-23', 'winch-jam': 's62-23'}
frames = []
keyed = {}
for i, n in enumerate(CELLS):
    take = PICK[n]
    if take not in keyed:
        keyed[take] = key_magenta(Image.open(T / f'w10bag-a-{take}.webp').convert('RGB').resize((1536, 1536)))
    x, y = (i % 3) * 512, (i // 3) * 512
    im, bb = trim(keyed[take].crop((x, y, x + 512, y + 512)))
    if n == 'barrels':
        # (two barrels: on its side (left, upper) and tipped (right, lower))
        a, _ = trim(im.crop((0, 0, im.width // 2 + 10, im.height // 2 + 20)))
        b, _ = trim(im.crop((im.width // 2 - 20, im.height // 2 - 30, im.width, im.height)))
        frames += [('barrel', a, a.width / 2, a.height), ('barrel-tip', b, b.width / 2, b.height)]
        continue
    frames.append((n, im, im.width / 2, im.height))
b = Image.open(T / 'w10bag-b-s65-23.webp').convert('RGB').resize((1536, 512))
bb7 = Image.open(T / 'w10bag-b-s65-7.webp').convert('RGB').resize((1536, 512))
for k, x0 in enumerate((0, 370)):
    im, _ = trim(key_black(bb7.crop((x0, 0, x0 + 370, 512)), floor=14))
    frames.append((f'beam-{k + 1}', im, 40 * im.width / 370, 0))
for k in range(3):
    x0 = 740 + k * 265
    im, _ = trim(key_black(b.crop((x0, 0, x0 + 265, 512)), floor=14))
    frames.append((f'gush-{k + 1}', im, im.width / 2, im.height))
S, data = write(GAME / 'src/assets/w10', 'bag', frames)
print(json.dumps({k: (v['w'], v['h']) for k, v in data.items()}))
# review: every frame on dark and grey
W = sum(f[1].width for f in frames) + 10 * len(frames)
H = max(f[1].height for f in frames)
R = Image.new('RGB', (W, 2 * H + 20), DARK)
x = 0
for n, im, *_ in frames:
    R.paste(on(im, DARK), (x, 0)); R.paste(on(im, GREY), (x, H + 20)); x += im.width + 10
out = GAME / 'reference/prop-sheets/qa-notes/w10/bag-cut.jpg'
R.thumbnail((2400, 1200)); R.save(out, quality=85); print(out)
