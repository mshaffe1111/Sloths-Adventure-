"""Phone-size stills of a world's new pieces on its own backdrop (2026-10-31, w1-4-sheets; the brief's step 4, STAGE-RULES §5b).

    python3 tools/art/w1to4/stills.py <world> [--dpr 2]

Two pictures per world in reference/prop-sheets/qa-notes/w1-4-art/: w<N>-upright.jpg (390 x 844) and w<N>-sideways.jpg (844 x 390),
each at --dpr (2 by default, as the phone shots). They're drawn the way the game frames a stage (engine.ts: sideways the world is
WORLD_VIEW_H = 540 units tall; upright it is PORTRAIT_VIEW_W = 440 units wide): the far, mid and near strips and the world's painted
ground, then Pokey's standing frame at HERO_UNITS = 66 for scale, then the new pieces at the size the grab bag plays them (USE below, in
game units), standing on the ground or hanging where they hang. A composite to judge how the art reads, not a game screenshot: the
pieces aren't wired into any stage in this pass.
"""
import json, re, sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
SRC = ROOT / 'src'
OUT = ROOT / 'reference/prop-sheets/qa-notes/w1-4-art'
VIEW_H, VIEW_W, HERO = 540, 440, 66
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

# how big each piece plays (game units: width, or height when h=True) and where it sits: 'ground', 'air' (y above ground), 'hang'
USE = {
    'acorn-slope': (200, 'ground'), 'vine-rope': (180, 'air', 150), 'log-hide': (190, 'ground'), 'root-gate-shut': (110, 'ground', 0, True),
    'root-gate-open': (110, 'ground', 0, True), 'squirrel-sit': (34, 'ground', 0, True), 'squirrel-wave': (36, 'ground', 0, True),
    'squirrel-haul': (40, 'ground', 0, True), 'squirrel-tip': (36, 'ground', 0, True), 'squirrel-run': (60, 'ground'),
    'hollowlog-moss': (130, 'ground'), 'hollowlog-plain': (130, 'ground'), 'log-moss-shut': (130, 'ground'), 'knot-a': (44, 'air', 70),
    'knot-b': (44, 'air', 110),
    'stone-a': (90, 'ground'), 'stone-b': (100, 'ground'), 'stone-c': (70, 'ground'), 'reed-isle-a': (120, 'ground'),
    'reed-isle-b': (120, 'ground'), 'sandbar': (220, 'ground'), 'mooring-post': (150, 'ground', 0, True), 'barrel-up': (40, 'ground'),
    'barrel-down': (40, 'ground'), 'crate-up': (44, 'ground'), 'crate-down': (44, 'ground'), 'reed-gate-shut': (120, 'ground', 0, True),
    'reed-gate-open': (120, 'ground', 0, True), 'cage-whole': (70, 'ground', 0, True), 'net-empty': (60, 'air', 90, True),
    'net-full': (60, 'air', 90, True), 'foam-1': (180, 'ground'), 'foam-2': (180, 'ground'), 'foam-3': (180, 'ground'),
    'waterline': (180, 'ground'),
    'stone-a3': (100, 'ground'), 'shelf-short': (140, 'air', 90), 'shelf-long': (220, 'air', 160), 'crack-whole': (150, 'air', 60),
    'crack-cracking': (150, 'air', 60), 'stalactite-hang': (40, 'hang', 0, True), 'stalactite-fall': (60, 'hang', 0, True),
    'stalactite-shards': (80, 'ground'), 'root-basket': (50, 'air', 120), 'counterweight': (60, 'ground'), 'bat-asleep': (30, 'hang', 0, True),
    'bat-stir': (30, 'hang', 0, True), 'bat-flap1': (54, 'air', 220), 'bat-flap2': (54, 'air', 200), 'spore-0': (90, 'ground'),
    'spore-1': (110, 'ground'), 'spore-2': (130, 'ground'),
    'knot': (40, 'air', 80, True), 'peg': (40, 'air', 80, True), 'veil-closed': (300, 'ground', 0, True), 'veil-parting': (300, 'ground', 0, True),
    'slung-log': (200, 'air', 120), 'rope-anchor': (70, 'ground', 0, True), 'ledge-whole': (160, 'air', 100), 'ledge-cracking': (160, 'air', 100),
    'ledge-gone': (160, 'air', 100), 'updraft-1': (260, 'ground', 0, True), 'updraft-2': (260, 'ground', 0, True),
    'updraft-3': (260, 'ground', 0, True), 'mist-1': (300, 'air', 60), 'mist-2': (300, 'air', 60), 'mist-3': (300, 'air', 60),
    'sov-shadow': (320, 'ground'),
}


def font(n):
    return ImageFont.truetype(FONT, n) if Path(FONT).exists() else ImageFont.load_default()


def ground_sheet(world):
    t = (SRC / 'game/groundAtlasData.ts').read_text()
    m = re.search(r'=\s*(\{.*\});?\s*$', t, re.S)
    data = json.loads(re.sub(r'(\w+):', r'"\1":', m.group(1)).replace(',}', '}').replace(',]', ']')) if m else None
    return data[str(world)] if data and str(world) in data else None


def backdrop(world, W, H, s, ground_y):
    """sky, then far, mid, near strips bottom-aligned near the ground line, each scaled by its share of the view"""
    S = Image.new('RGBA', (W, H), (120, 150, 180, 255))
    b = SRC / 'assets/backdrops'
    for name, share, lift in (('sky', None, 0), ('far', 0.9, 0.18), ('mid', 0.75, 0.08), ('near', 0.55, 0.0)):
        p = b / f'w{world}-{name}.webp'
        if not p.exists():
            continue
        im = Image.open(p).convert('RGBA')
        if share is None:
            im = im.resize((W, max(1, round(W * im.height / im.width))))
            S.alpha_composite(im.resize((W, H)) if im.height < H else im, (0, 0))
            continue
        hh = round(VIEW_H * share * s)
        im = im.resize((max(1, round(hh * im.width / im.height)), hh), Image.LANCZOS)
        y = round(ground_y - hh + lift * hh)
        x = 0
        while x < W:
            S.alpha_composite(im, (x, y))
            x += im.width
    return S


def ground(world, S, s, ground_y):
    g = SRC / f'assets/ground/w{world}.webp'
    W, H = S.size
    if not g.exists():
        ImageDraw.Draw(S).rectangle((0, ground_y, W, H), fill=(60, 44, 30, 255))
        return
    sheet = Image.open(g).convert('RGBA')
    info = ground_sheet(world)
    if not info:
        ImageDraw.Draw(S).rectangle((0, ground_y, W, H), fill=(60, 44, 30, 255))
        return
    f = info['fills'][0]
    fill = sheet.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
    th = round(120 * s)
    fill = fill.resize((max(1, round(th * fill.width / fill.height)), th))
    for y in range(ground_y, H, th):
        for x in range(0, W, fill.width):
            S.alpha_composite(fill, (x, y))
    lp = info['lip']
    lip = sheet.crop((lp['x'], lp['y'], lp['x'] + lp['w'], lp['y'] + lp['h']))
    lh = round(40 * s)
    lip = lip.resize((max(1, round(lh * lip.width / lip.height)), lh))
    for x in range(0, W, lip.width):
        S.alpha_composite(lip, (x, ground_y - round(lh * lp.get('surf', 0.3))))


def hero(s):
    t = (SRC / 'game/heroStandardData.ts').read_text()
    m = re.search(r'idle: \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+)', t)
    x, y, w, h = map(int, m.groups())
    im = Image.open(SRC / 'assets/hero/hero-standard.webp').convert('RGBA').crop((x, y, x + w, y + h))
    k = HERO * s / 200
    return im.resize((round(w * k), round(h * k)), Image.LANCZOS)


def scene(world, W, H, dpr, pieces, label):
    W, H = W * dpr, H * dpr
    s = (H / VIEW_H) if W > H else (W / VIEW_W)
    ground_y = round(H * (0.74 if W > H else 0.78))
    S = backdrop(world, W, H, s, ground_y)
    ground(world, S, s, ground_y)
    d = ImageDraw.Draw(S)
    x = round(20 * s)
    pk = hero(s)
    S.alpha_composite(pk, (x, ground_y - pk.height))
    x += pk.width + round(14 * s)
    row_x = x
    for name, im in pieces:
        u = USE.get(name, (80, 'ground'))
        size, where = u[0], u[1]
        up = u[2] if len(u) > 2 else 0
        by_h = len(u) > 3 and u[3]
        k = size * s / (im.height if by_h else im.width)
        t = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
        if row_x + t.width > W - 10 and row_x != x:
            break
        if where == 'hang':
            y = round(H * 0.06)
        else:
            y = ground_y - t.height - round(up * s)
        S.alpha_composite(t, (row_x, y))
        d.text((row_x, max(2, y - 13 * dpr)), name, fill=(255, 255, 220), font=font(9 * dpr), stroke_width=dpr, stroke_fill=(0, 0, 0))
        row_x += t.width + round(10 * s)
    d.text((8 * dpr, 6 * dpr), label, fill=(255, 255, 255), font=font(11 * dpr), stroke_width=dpr, stroke_fill=(0, 0, 0))
    return S, len([1 for _ in pieces])


def main():
    world = int(sys.argv[1])
    dpr = int(sys.argv[sys.argv.index('--dpr') + 1]) if '--dpr' in sys.argv else 2
    atlas = Image.open(SRC / f'assets/w1to4art/w{world}-new.webp').convert('RGBA')
    fr = json.loads((SRC / f'assets/w1to4art/w{world}-new.json').read_text())
    pieces = [(n, atlas.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))) for n, f in fr.items()]
    # as many pictures as it takes to show every piece, upright and sideways
    for orient, (W, H) in (('upright', (390, 844)), ('sideways', (844, 390))):
        i, k = 0, 1
        while i < len(pieces):
            # fit as many as the row holds
            S, _ = scene(world, W, H, dpr, pieces[i:], f'World {world} new pieces ({orient}), Pokey for scale')
            # count how many went in: re-run the layout arithmetic
            s = (H * dpr / VIEW_H) if W > H else (W * dpr / VIEW_W)
            x = round(20 * s) + hero(s).width + round(14 * s)
            n = 0
            for name, im in pieces[i:]:
                u = USE.get(name, (80, 'ground'))
                kk = u[0] * s / (im.height if len(u) > 3 and u[3] else im.width)
                wpx = round(im.width * kk)
                if x + wpx > W * dpr - 10 and n:
                    break
                x += wpx + round(10 * s)
                n += 1
            n = max(1, n)
            S.convert('RGB').save(OUT / f'w{world}-{orient}-{k}.jpg', quality=85)
            print(OUT / f'w{world}-{orient}-{k}.jpg', [p[0] for p in pieces[i:i + n]])
            i += n
            k += 1


if __name__ == '__main__':
    main()
