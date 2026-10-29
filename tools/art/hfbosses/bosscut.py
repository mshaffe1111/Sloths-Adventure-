"""Cut and pack the boss art batch (hf-art-bosses, 2026-10-29) from the Hugging Face takes (unpacked from their carriers):

  src/assets/lairs/lair-croc-{calm,rage}.webp, lair-sov-{calm,rage}.webp   the picked plates, 2048 x 1152
  src/assets/lairs/fg-croc.webp, fg-sov.webp                              the foreground strips, keyed
  src/assets/bosses/boss-fx.webp + boss-fx.json                           every effect piece and the two AN-5 strips, keyed and packed
  reference/prop-sheets/qa-notes/hf-art-bosses/review-*.jpg                each piece on dark and on mid-grey, at full and game size

Keying: the key flooded in from the piece's own box border, a soft rim from how much key a pixel holds, the key's spill clamped off the
rim (magenta: r and b toward g; green: g toward the larger of r and b), crumbs dropped, then trimmed.
    python3 -I tools/art/hfbosses/bosscut.py <takes dir> <game checkout>
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

TAKES, GAME = Path(sys.argv[1]), Path(sys.argv[2])
QA = GAME / 'reference/prop-sheets/qa-notes/hf-art-bosses'
QA.mkdir(parents=True, exist_ok=True)


def take(name):
    return Image.open(TAKES / f'{name}.webp').convert('RGB')


def keyness(a, key):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return np.minimum(r, b) - g if key == 'magenta' else g - np.maximum(r, b)


def cut(im, key, box=None, crumbs=60, mainOnly=False, trim=True):
    if box:
        im = im.crop(box)
    a = np.asarray(im).astype(np.float32)
    k = keyness(a, key)
    bg_like = k > 90
    lab, n = ndimage.label(bg_like)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge)) | (k > 150)
    alpha = np.where(bg, 0.0, 1.0)
    rim = ndimage.binary_dilation(alpha == 0, iterations=2) & (alpha > 0)
    alpha = np.where(rim, np.minimum(alpha, np.clip((140 - k) / 110, 0, 1)), alpha)
    alpha = np.minimum(alpha, np.clip((160 - k) / 100, 0, 1))
    band = ndimage.binary_dilation(alpha < 0.5, iterations=4) | (k > 20)
    if key == 'magenta':
        ex = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1] - 8, 0, None) * band
        a[..., 0] -= ex; a[..., 2] -= ex
    else:
        ex = np.clip(a[..., 1] - np.maximum(a[..., 0], a[..., 2]) - 8, 0, None) * band
        a[..., 1] -= ex
    lab, n = ndimage.label(alpha > 0.5)
    if n:
        sizes = ndimage.sum(np.ones_like(alpha), lab, range(1, n + 1))
        biggest = int(np.argmax(sizes)) + 1
        for i, s in enumerate(sizes, 1):
            if s < crumbs or (mainOnly and i != biggest):
                alpha[lab == i] = 0
    o = Image.fromarray(np.dstack([np.clip(a, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')
    if not trim:
        return o
    bb = o.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    return o.crop(bb) if bb else o


def review(name, pieces, game_h=None):
    """each piece on dark and on mid-grey, full size (scaled to fit) and at about game size"""
    rows = []
    for label, p in pieces:
        s = min(1.0, 700 / p.width, 300 / p.height)
        big = p.resize((max(1, round(p.width * s)), max(1, round(p.height * s))), Image.LANCZOS)
        gs = (game_h / p.height) if game_h else 0.3
        small = p.resize((max(1, round(p.width * gs)), max(1, round(p.height * gs))), Image.LANCZOS)
        rows.append((label, big, small))
    W = 2 * 720 + 2 * 260
    H = sum(max(r[1].height, r[2].height) + 30 for r in rows) + 10
    S = Image.new('RGB', (W, H), (30, 30, 30))
    d = ImageDraw.Draw(S)
    y = 6
    for label, big, small in rows:
        h = max(big.height, small.height) + 24
        for i, (bg, im, w) in enumerate((((20, 16, 24), big, 720), ((128, 128, 128), big, 720), ((20, 16, 24), small, 260), ((128, 128, 128), small, 260))):
            x = [0, 720, 1440, 1700][i]
            tile = Image.new('RGBA', (w, h - 20), bg + (255,))
            tile.alpha_composite(im, (max(0, (w - im.width) // 2), max(0, (h - 20 - im.height) // 2)))
            S.paste(tile.convert('RGB'), (x, y + 20))
        d.text((4, y + 4), label, fill=(255, 230, 0))
        y += h + 6
    S.save(QA / f'review-{name}.jpg', quality=86)


# ───── lair plates ─────
LAIRS = GAME / 'src/assets/lairs'
PLATES = {'lair-croc-calm': 'lair-croc-calm-s68-7', 'lair-croc-rage': 'lair-croc-rage-s68-7',
          'lair-sov-calm': 'lair-sov-calm-s68-7', 'lair-sov-rage': 'lair-sov-rage-s68-7'}
for out, src in PLATES.items():
    im = take(src).resize((2048, 1152), Image.LANCZOS)
    im.save(LAIRS / f'{out}.webp', 'WEBP', quality=84, method=6)
    print(out, (LAIRS / f'{out}.webp').stat().st_size)

# ───── foreground strips ─────
FG = {'fg-croc': ('fg-croc-s75-23', 'magenta'), 'fg-sov': ('fg-sov-s75-23', 'magenta')}
fgs = []
for out, (src, key) in FG.items():
    im = take(src)
    a = np.asarray(im).astype(np.float32)
    o = cut(im, key, crumbs=30)
    # (keep the strip's full size: the cut is trimmed, so put it back where it was)
    full = Image.new('RGBA', im.size, (0, 0, 0, 0))
    bb = Image.fromarray(((keyness(a, key) < 90) * 255).astype(np.uint8)).getbbox()
    full.alpha_composite(o, (bb[0], bb[1]) if bb else (0, 0))
    if out == 'fg-sov':
        # (all of the Aerie's strip stands along the bottom: keep just its rows)
        bb2 = full.getchannel('A').getbbox()
        full = full.crop((0, max(0, bb2[1] - 4), full.width, full.height))
    full.save(LAIRS / f'{out}.webp', 'WEBP', quality=86, method=6)
    fgs.append((out, full))
    print(out, (LAIRS / f'{out}.webp').stat().st_size)
review('fg', fgs, game_h=120)

# ───── effects: (piece name, take, key, box in the take, options) ─────
FX = [
    ('warnRing', 'marker-s75-7', 'green', (60, 60, 1480, 470), {'mainOnly': True}),
    ('warnArrow', 'marker-s75-7', 'green', (120, 540, 660, 900), {'mainOnly': True}),
    ('warnDown', 'marker-s75-7', 'green', (900, 400, 1360, 880), {'mainOnly': True}),
    ('dashTrail', 'marker-s75-7', 'green', (20, 880, 1520, 1010), {}),
    ('flood', 'fx-croc-s75-23', 'magenta', (0, 90, 1536, 350), {}),
    ('piranha', 'fx-croc-s75-23', 'magenta', (20, 440, 560, 780), {'mainOnly': True}),
    ('silkBall', 'fx-queen-s75-7', 'magenta', (20, 20, 450, 450), {'mainOnly': True}),
    ('webSplat', 'fx-queen-s75-7', 'magenta', (420, 180, 1110, 420), {'mainOnly': True}),
    ('cocoon', 'fx-queen-s75-7', 'magenta', (1140, 0, 1480, 520), {}),
    ('venomJet', 'fx-queen-s75-7', 'magenta', (20, 590, 1536, 840), {}),
    ('silkRipple', 'fx-queen-s75-7', 'magenta', (120, 820, 1400, 1024), {}),
    ('bolt', 'fx-sov-s75-23', 'green', (200, 380, 480, 1010), {'mainOnly': True}),
    ('feather', 'fx-sov-s75-23', 'green', (600, 480, 1220, 720), {'mainOnly': True}),
    ('gust', 'fx-sov-s75-23', 'green', (500, 730, 1500, 1010), {}),
    # round 2 (make_spec2.py): the storm clouds, the mud wave and the splash
    ('storm0', 'fx-storm-s80-7', 'green', (0, 40, 500, 520), {'mainOnly': True}),
    ('storm1', 'fx-storm-s80-7', 'green', (470, 40, 1050, 560), {'mainOnly': True}),
    ('storm2', 'fx-storm-s80-7', 'green', (1030, 40, 1536, 520), {'mainOnly': True}),
    ('mudWave', 'fx-mud-s88-7', 'magenta', (0, 230, 770, 920), {}),
    ('splash', 'fx-mud-s88-7', 'magenta', (770, 240, 1536, 930), {}),
]
STRIPS = [('spark', 'spark-s62-7', 'magenta', 6, 256), ('dust', 'dust2-s80-23', 'magenta', 8, 256)]
pieces = []
for name, src, key, box, opts in FX:
    pieces.append((name, cut(take(src), key, tuple(box), **opts)))
for name, src, key, n, cw in STRIPS:
    im = take(src)
    for f in range(n):
        # (strip frames keep their whole cell, so every frame is drawn at one size and place)
        p = cut(im, key, (f * cw, 0, (f + 1) * cw, im.height), crumbs=20, trim=False)
        if name == 'dust':
            # (the thin late frames took a pink cast from the key: back to the dust's tan wherever blue runs over green)
            a = np.asarray(p).astype(np.float32)
            pink = (a[..., 2] > a[..., 1] - 18) | (a[..., 0] - a[..., 1] > 34)
            g = a[..., 1]
            a[..., 0] = np.where(pink, np.minimum(a[..., 0], g * 1.18), a[..., 0])
            a[..., 2] = np.where(pink, g * 0.74, a[..., 2])
            p = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')
        pieces.append((f'{name}{f}', p))
# scale each piece down to what the game needs (the biggest it is ever drawn, at 2x for a sharp phone)
MAXW = {'warnRing': 720, 'warnArrow': 220, 'warnDown': 180, 'dashTrail': 900, 'flood': 1024, 'piranha': 160, 'silkBall': 160, 'webSplat': 360,
        'cocoon': 160, 'venomJet': 1100, 'silkRipple': 600, 'bolt': 160, 'feather': 140, 'gust': 640, 'storm0': 420, 'storm1': 420,
        'storm2': 420, 'mudWave': 320, 'splash': 280}
packed = []
for name, p in pieces:
    base = name.rstrip('0123456789') if name[:-1] in ('spark', 'dust') or name.startswith(('spark', 'dust')) else name
    mw = MAXW.get(name, 200 if base in ('spark', 'dust') else 400)
    if p.width > mw:
        p = p.resize((mw, max(1, round(p.height * mw / p.width))), Image.LANCZOS)
    packed.append((name, p))
# shelf pack, 2048 wide
W = 2048
x = y = rowh = 0
frames = {}
for name, p in sorted(packed, key=lambda t: -t[1].height):
    if x + p.width > W:
        x, y, rowh = 0, y + rowh + 4, 0
    frames[name] = {'x': x, 'y': y, 'w': p.width, 'h': p.height}
    x += p.width + 4
    rowh = max(rowh, p.height)
H = y + rowh
atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for name, p in packed:
    f = frames[name]
    atlas.paste(p, (f['x'], f['y']))
out = GAME / 'src/assets/bosses'
out.mkdir(parents=True, exist_ok=True)
atlas.save(out / 'boss-fx.webp', 'WEBP', quality=88, method=6)
(out / 'boss-fx.json').write_text(json.dumps(frames, indent=0))
(GAME / 'src/game/bossFxData.ts').write_text(
    '// generated by tools/art/hfbosses/bosscut.py (2026-10-29): where each painted boss effect sits in src/assets/bosses/boss-fx.webp\n'
    '// (Hugging Face img2img takes with the style model; the picks and boxes are in the script)\n'
    'export interface FxFrame { x: number; y: number; w: number; h: number }\n'
    f'export const BOSS_FX_SIZE = {{ w: {W}, h: {H} }};\n'
    'export const BOSS_FX: Record<string, FxFrame> = ' + json.dumps(frames, separators=(',', ':')) + ';\n')
print('atlas', atlas.size, (out / 'boss-fx.webp').stat().st_size)
review('fx', packed[:len(FX)])
review('strips', packed[len(FX):], game_h=60)
