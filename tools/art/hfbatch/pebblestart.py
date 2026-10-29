"""Start sheet for World 4's falling-rock grit (2026-10-29, Matt 4:02 PM ET: "it puts squares where it's going to fall"): 16 pebbles and
gravel bits in a 4 x 4 grid on flat magenta, 1024 x 1024, for img2img (tools/art/w6to10/img2imggpu.py). Every bit is cut from World 4's
own painted rock pieces (w4-props.webp: rock, rockMoss, shardA-D, boulderSmall, boulderRound), scaled, squashed and turned so no two
match: round pebbles, flat chips, sharp shards, a mossy one, and four little clusters of gravel. The style model only repaints them.
    python3 -I tools/art/hfbatch/pebblestart.py <game checkout> <out.webp>
"""
import random, re, sys
from pathlib import Path
from PIL import Image

GAME, OUT = Path(sys.argv[1]), Path(sys.argv[2])
t = (GAME / 'src/game/w4PropsData.ts').read_text()
F = {m[0]: tuple(map(int, m[1:])) for m in re.findall(r'(\w+): \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+) \}', t)}
SHEET = Image.open(GAME / 'src/assets/props/w4-props.webp').convert('RGBA')


def piece(n):
    x, y, w, h = F[n]
    im = SHEET.crop((x, y, x + w, y + h))
    # (the shards carry a lilac fringe from their own key: drop the faint rim)
    a = im.getchannel('A').point(lambda v: 0 if v < 140 else 255)
    im.putalpha(a)
    return im.crop(a.getbbox())


def fit(im, w, h, rot):
    im = im.rotate(rot, Image.BICUBIC, expand=True)
    im = im.crop(im.getchannel('A').getbbox())
    k = min(w / im.width, h / im.height)
    return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)


random.seed(4)
C = 256
S = Image.new('RGBA', (4 * C, 4 * C), (255, 0, 255, 255))
# (piece, width, height, turn): 12 single pebbles, every one its own shape
singles = [('boulderRound', 150, 120, 10), ('shardA', 110, 140, -20), ('rock', 160, 110, 35), ('boulderSmall', 170, 100, -8),
           ('shardC', 130, 110, 60), ('rockMoss', 140, 120, -30), ('shardB', 100, 150, 15), ('boulderRound', 120, 80, 70),
           ('shardD', 90, 130, -45), ('rock', 120, 130, 100), ('boulderSmall', 130, 130, 140), ('shardA', 150, 100, 95)]
cells = [(i % 4, i // 4) for i in range(16)]
for (n, w, h, r), (cx, cy) in zip(singles, cells[:12]):
    p = fit(piece(n), w, h, r)
    S.alpha_composite(p, (cx * C + (C - p.width) // 2, cy * C + (C - p.height) // 2))
# four clusters of gravel: 4-7 small bits loosely grouped
pool = ['shardA', 'shardB', 'shardC', 'shardD', 'boulderRound', 'boulderSmall', 'rock']
for cx, cy in cells[12:]:
    for k in range(random.randint(4, 7)):
        s = random.randint(26, 58)
        p = fit(piece(random.choice(pool)), s, s * random.uniform(0.6, 1.1), random.uniform(0, 360))
        S.alpha_composite(p, (cx * C + random.randint(30, C - 30 - p.width), cy * C + random.randint(50, C - 50 - p.height)))
OUT.parent.mkdir(parents=True, exist_ok=True)
S.convert('RGB').save(OUT, 'WEBP', quality=95)
print(OUT)
