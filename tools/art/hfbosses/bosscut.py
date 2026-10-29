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

sys.path.insert(0, str(Path(__file__).resolve().parent))
from bosscut_lib import cut, keyness, review, QA  # noqa: E402

TAKES, GAME = Path(sys.argv[1]), Path(sys.argv[2])


def take(name):
    return Image.open(TAKES / f'{name}.webp').convert('RGB')


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
