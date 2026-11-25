"""ART-W3: each new piece at GAME size beside Pokey (his idle frame drawn 89.1 world px: hero-standard.webp, as hfnext/contact2.py), in a
phone frame UPRIGHT (440 x 952 world px: a 390 x 844 phone shows about 440 px of world across, cameraFollow.ts:196) and SIDEWAYS
(952 x 440), on World 3's cavern backdrop (the 2-9 pieces on World 2's dusk). 1 world px = 1 still px (D 1, for judging; law 2 asks
the real screen when a builder lays them: these are mock-ups, said so on each still).
    python3 -I tools/art/hfw3/stills.py <cut dir> <out dir>
Reads <cut dir>/picks.json: {name: {"file": png, "cpu": cut px a world px, "walk": [y, x0, x1] | null, "scene": kind}}.
Scenes: stand (Pokey on the walk line), wall (the piece tiled 3x down the right side, Pokey on a shelf beside), climb (the root hangs
from a lip, Pokey on the floor beside it, reaching), roof (the roof root tiled under the frame top, Pokey on the floor under it with
the 190-unit gap of 3-2's catch, 2-9 barge on the river), beside (Pokey standing next to it on the floor).
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageEnhance

C, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
P = 89.1
picks = json.load(open(os.path.join(C, 'picks.json')))
hero = Image.open('src/assets/hero/hero-standard.webp').convert('RGBA').crop((674, 478, 674 + 127, 478 + 209))
AX, AY = 57.0, 205.0
hk = P / 200
pk = hero.resize((round(hero.width * hk), round(hero.height * hk)), Image.LANCZOS)
PAX, PAY = AX * hk, AY * hk
LIP = Image.open('reference/art/hfnext/cut/lipA-s23.png').convert('RGBA')
LIP = LIP.resize((round(LIP.width / 2.2), round(LIP.height / 2.2)), Image.LANCZOS); LIP_WY = round(71 / 2.2)


def bg(w, h, world):
    f = 'src/assets/backdrops/w3cavern-far.webp' if world == 3 else 'src/assets/backdrops/w2evening-far.webp'
    im = Image.open(f).convert('RGBA')
    k = max(h / im.height, w / im.width); im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    im = im.crop((0, im.height - h, im.width, im.height))
    x0 = max(0, (im.width - w) // 2); im = im.crop((x0, 0, x0 + w, h))
    if world == 3: im = ImageEnhance.Brightness(im).enhance(0.8)
    return im


def piece(n):
    p = picks[n]; im = Image.open(os.path.join(C, p['file'])).convert('RGBA'); k = 1 / p['cpu']
    return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS), k


def pokey_at(S, fx, fy):
    S.alpha_composite(pk, (round(fx - PAX), round(fy - PAY)))


def floor(S, y):
    x = -20
    while x < S.width:
        S.alpha_composite(LIP, (x, y - LIP_WY)); x += LIP.width - 30


def scene(n, w, h):
    p = picks[n]; kind = p['scene']; world = p.get('world', 3)
    S = bg(w, h, world); g, k = piece(n)
    fy = h - 60   # the floor's walk line
    if kind == 'stand':
        floor(S, fy)
        x = (w - g.width) // 2; y = fy - 180 - round(p['walk'][0] * k)
        S.alpha_composite(g, (x, y))
        wy, x0, x1 = (v * k for v in p['walk'])
        pokey_at(S, x + x0 + (x1 - x0) * 0.62, y + wy)
        pokey_at(S, 60, fy)
    elif kind == 'wall':
        x = w - g.width + 40
        for yy in range(-g.height // 2, h, g.height):
            S.alpha_composite(g, (x, yy))
        floor(S, fy); pokey_at(S, x - 80, fy)
    elif kind == 'wallshelf':
        wall = Image.open(os.path.join(C, picks.get('wallR-s23-tile', {}).get('file', 'wallR-s23-tile.png'))).convert('RGBA')
        wall = wall.resize((round(wall.width / 3), round(wall.height / 3)), Image.LANCZOS)
        wx = w - wall.width + 30
        for yy in range(-wall.height // 2, h, wall.height):
            S.alpha_composite(wall, (wx, yy))
        stub = p['walk'][2] * k   # the stub's face sits on the wall's face (about 12 px into the wall tile)
        x = round(wx + 14 - stub); y = fy - 200 - round(p['walk'][0] * k)
        floor(S, fy); S.alpha_composite(g, (x, y))
        wy, x0, x1 = (v * k for v in p['walk'])
        pokey_at(S, x + x0 + (x1 - x0) * 0.35, y + wy)
    elif kind == 'climb':
        floor(S, fy)
        x = w // 2 - g.width // 2; y = fy - g.height - 10
        S.alpha_composite(g, (x, y)); pokey_at(S, x - 50, fy)
    elif kind == 'roof':
        floor(S, fy)
        y = fy - 190 - round(p['root_y'] * k)   # the root's middle 190 units over the floor (3-2's held-jump catch)
        xx = -40
        while xx < w:
            S.alpha_composite(g, (xx, y)); xx += g.width - 8
        pokey_at(S, w * 0.4, fy)
    elif kind == 'roofend':
        floor(S, fy)
        S.alpha_composite(g, (0, max(0, fy - 190 - round(p['root_y'] * k)))); pokey_at(S, g.width + 40, fy)
    elif kind == 'barge':
        d = ImageDraw.Draw(S); wl = fy - 10
        d.rectangle((0, wl, w, h), fill=(60, 50, 110, 255))
        x = (w - g.width) // 2; deck = wl - 28   # the deck at a log's height over the water (river.ts LOG_HEIGHT 28)
        y = deck - round(p['walk'][0] * k)
        S.alpha_composite(g, (x, y)); pokey_at(S, x + g.width * 0.45, deck)
    else:   # beside
        floor(S, fy); S.alpha_composite(g, (w // 2, fy - g.height + p.get('sink', 0))); pokey_at(S, w // 2 - 70, fy)
    ImageDraw.Draw(S).text((6, 4), f'{n} at game size, Pokey 89 px (MOCK-UP, not the game)', fill=(255, 230, 90))
    return S


names = list(picks)
for n in names:
    up, side = scene(n, 440, 952), scene(n, 952, 440)
    T = Image.new('RGB', (440 + 952 + 30, 952), (12, 12, 14))
    T.paste(up.convert('RGB'), (0, 0)); T.paste(side.convert('RGB'), (470, 0))
    T.save(os.path.join(OUT, f'{n}.jpg'), quality=85)
print('stills', len(names), OUT)
