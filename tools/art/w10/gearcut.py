"""Cut World 10's gear works (hfb-w10bag-r3, 2026-10-31: the lift pits' floor and 10-9's gear theme, the style sheet on the canvas) into
src/assets/w10/gear.webp + gear.json, and a review sheet (reference/prop-sheets/qa-notes/w10/gear-cut.jpg).
    python3 -I tools/art/w10/gearcut.py <takes dir>
The canvas (bagstarts3.py): the style sheet over two rows of four 384 px cells. Each pick names its take; the anchor of every frame is the
middle of its foot, except the cogs' (their hub, the frame's middle) and the trough's (its rim: the walk line).
The grinder's cell is cut in two: its cog (the left one, a circle around its hub, to turn in code) and the trough's front (from the rim down).
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw
sys.path.insert(0, str(Path(__file__).resolve().parent))
from w10lib import key_magenta, trim, write, on, DARK, GREY  # noqa: E402

T = Path(sys.argv[1])
GAME = Path(__file__).resolve().parents[3]
PICK = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
CELLS = {'cog-stub': (0, 0), 'gear-fallen': (1, 0), 'chain-heap': (2, 0), 'axle-stub': (3, 0),
         'grinder': (0, 1), 'spiked-cog': (1, 1), 'gear-wall': (2, 1), 'gear-lever': (3, 1)}
keyed: dict[str, Image.Image] = {}


def take(n: str) -> Image.Image:
    t = PICK.get(n, 's50-23')
    if t not in keyed:
        keyed[t] = key_magenta(Image.open(T / f'w10bag3-{t}.webp').convert('RGB').resize((1536, 1536)))
    return keyed[t]


def cellOf(n: str) -> Image.Image:
    c, r = CELLS[n]
    return take(n).crop((c * 384, 768 + r * 384, c * 384 + 384, 768 + r * 384 + 384))


def circle(im: Image.Image, cx: float, cy: float, r: float) -> Image.Image:
    """the disc of radius r about (cx, cy), the rest clear (a cog to turn about its hub)"""
    box = (round(cx - r), round(cy - r), round(cx + r), round(cy + r))
    c = im.crop(box)
    m = Image.new('L', (c.width * 4, c.height * 4), 0)
    ImageDraw.Draw(m).ellipse((2, 2, c.width * 4 - 3, c.height * 4 - 3), fill=255)
    m = m.resize(c.size, Image.LANCZOS)
    a = Image.fromarray(__import__('numpy').minimum(__import__('numpy').asarray(c.getchannel('A')), __import__('numpy').asarray(m)))
    c.putalpha(a)
    return c


frames = []
for n in ['cog-stub', 'gear-fallen', 'chain-heap', 'axle-stub', 'gear-wall', 'gear-lever']:
    im, _ = trim(cellOf(n))
    frames.append((n, im, im.width / 2, im.height))
# (the spiked cog: a disc about its middle)
sc, _ = trim(cellOf('spiked-cog'))
d = min(sc.size)
sc = circle(sc, sc.width / 2, sc.height / 2, d / 2)
frames.append(('spiked-cog', sc, sc.width / 2, sc.height / 2))
# (the grinder: in the sketch the cogs' hubs sat at (132, 230) and (252, 230) of the cell, radius 86, the trough's rim at y 230)
g = cellOf('grinder')
RIM = int(PICK.get('rim', 230))
cog = circle(g, 132, 230, 88)
frames.append(('grinder-cog', cog, cog.width / 2, cog.height / 2))
tr, bb = trim(g.crop((0, RIM - 6, 384, 384)))
frames.append(('grinder-trough', tr, tr.width / 2, 6 - bb[1]))
S, data = write(GAME / 'src/assets/w10', 'gear', frames)
print(json.dumps({k: (v['w'], v['h']) for k, v in data.items()}))
W = sum(f[1].width for f in frames) + 10 * len(frames)
H = max(f[1].height for f in frames)
R = Image.new('RGB', (W, 2 * H + 20), DARK)
x = 0
for n, im, *_ in frames:
    R.paste(on(im, DARK), (x, 0)); R.paste(on(im, GREY), (x, H + 20)); x += im.width + 10
out = GAME / 'reference/prop-sheets/qa-notes/w10/gear-cut.jpg'
R.thumbnail((2400, 1200)); R.save(out, quality=85); print(out)
