"""Pack the stage dressing for Worlds 1, 2 and 5 (hf-art-ground, 2026-10-29; polish report VI-17: "World 1 and World 5 look the same
every visit") into src/assets/props/dress.webp and src/game/dressAtlasData.ts.
    python3 tools/art/hfground/packdress.py <raw dir>

One small sheet a stage of those worlds loads ('dress' in stageSheets.ts), so the sets need nothing else:
  World 5   14 new pieces painted on Hugging Face from World 5's own props (two bank sets of 3, a hanging pair, two clutter sets of 3)
  World 1   its two new hanging pieces (Hugging Face, from a sketch in its moss colours), and copies of its own painted pieces the sets use
            (fern clump, stump, mushrooms, pebble, acorns, pinecone, stones, ferns from Matt's puzzle sheets)
  World 2   its two new hanging pieces, and copies of its reeds, log, stones and fern
Each frame carries its size in the game (`w`: world units across) and its anchor: a standing piece by the middle of its foot, a hanging
piece (`hang`) by the middle of its top.
"""
import json, re, sys
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from keying import depurple, key  # noqa: E402

ROOT = HERE.parents[2]
raw = Path(sys.argv[1])


def frames(ts):
    return {m.group(1): tuple(map(int, m.groups()[1:5])) for m in
            re.finditer(r'(\w+): \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+)', (ROOT / ts).read_text())}


SRC = {'kit': ('src/game/puzzleAtlasData.ts', 'src/assets/props/puzzle-kit.webp'),
       'p1': ('src/game/protoAtlasData.ts', 'src/assets/proto/props-atlas.webp'),
       'p2': ('src/game/proto2AtlasData.ts', 'src/assets/proto/props2-atlas.webp'),
       'w2': ('src/game/w2PropsData.ts', 'src/assets/props/w2-props.webp')}
_cache = {}


def copy(src, n):
    if src not in _cache:
        ts, img = SRC[src]
        _cache[src] = (frames(ts), Image.open(ROOT / img).convert('RGBA'))
    F, im = _cache[src]
    x, y, w, h = F[n]
    return im.crop((x, y, x + w, y + h))


def take(n, t, hang=False, main=False):
    im = key(Image.open(raw / f'dress-{n}-{t}.webp'), speck=120, main_only=main)
    # (the key's dark pink spill on roots and shadows browned; World 5's pinks are bright, so only the dark is touched)
    return depurple(im, lum_max=110)


# name: (picture, width in world units, hanging)
P = {
    # World 5, new
    'w5BankA1': (lambda: take('w5-bankA1', 's66-19'), 92, False),
    'w5BankA2': (lambda: take('w5-bankA2', 's55-7'), 84, False),
    'w5BankA3': (lambda: take('w5-bankA3', 's55-7'), 70, False),
    'w5BankB1': (lambda: take('w5-bankB1', 's55-7'), 74, False),
    'w5BankB2': (lambda: take('w5-bankB2', 's66-19'), 96, False),
    'w5BankB3': (lambda: take('w5-bankB3', 's66-19'), 80, False),
    'w5Hang1': (lambda: take('w5-hang1', 's55-7', True), 34, True),
    'w5Hang2': (lambda: take('w5-hang2', 's55-7', True), 130, True),
    'w5ClutA1': (lambda: take('w5-clutA1', 's55-7'), 78, False),
    'w5ClutA2': (lambda: take('w5-clutA2', 's55-7'), 40, False),
    'w5ClutA3': (lambda: take('w5-clutA3', 's55-7'), 46, False),
    'w5ClutB1': (lambda: take('w5-clutB1', 's66-19'), 44, False),
    'w5ClutB2': (lambda: take('w5-clutB2', 's55-7', main=True), 62, False),  # (main piece only: a stray sparkle above it)
    'w5ClutB3': (lambda: take('w5-clutB3', 's66-19'), 56, False),
    # World 1: new hanging moss, and its own pieces
    'w1Hang1': (lambda: take('w1-hang1', 's74-7', True), 86, True),
    'w1Hang2': (lambda: take('w1-hang2', 's74-7', True), 64, True),
    'w1Fern': (lambda: copy('p2', 'fernClump'), 96, False),
    'w1Stump': (lambda: copy('p1', 'stump'), 90, False),
    'w1Mushroom': (lambda: copy('kit', 'mushroom'), 30, False),
    'w1MushroomDim': (lambda: copy('kit', 'mushroomDim'), 32, False),
    'w1Pebble': (lambda: copy('kit', 'pebble'), 16, False),
    'w1Acorns': (lambda: copy('kit', 'acornPile'), 44, False),
    'w1Pinecone': (lambda: copy('kit', 'pinecone'), 24, False),
    'w1Stones': (lambda: copy('kit', 'stonePile'), 48, False),
    'w1Sprig': (lambda: copy('kit', 'fern4'), 46, False),
    'w1Fiddle': (lambda: copy('kit', 'fern2'), 30, False),
    # World 2: new hanging moss and roots, and its own pieces
    'w2Hang1': (lambda: take('w2-hang1', 's74-7', True), 86, True),
    'w2Hang2': (lambda: take('w2-hang2', 's74-7', True), 64, True),
    'w2ReedTall': (lambda: copy('w2', 'reedTall'), 54, False),
    'w2ReedShort': (lambda: copy('w2', 'reedShort'), 78, False),
    'w2ReedLean': (lambda: copy('w2', 'reedLean'), 60, False),
    'w2Log': (lambda: copy('w2', 'logShort'), 92, False),
    'w2Stone': (lambda: copy('kit', 'stone'), 26, False),
    'w2RiverStone': (lambda: copy('kit', 'riverStone'), 50, False),
    'w2Stones': (lambda: copy('kit', 'stonePile'), 46, False),
    'w2Fern': (lambda: copy('kit', 'fern1'), 60, False),
}
# (drawn at about 2.4 px a unit, a phone's), so nothing is bigger than it needs to be
PX = 2.4
pieces = []
for n, (get, w, hang) in P.items():
    im = get()
    im = im.crop(im.getbbox())
    tw = max(8, round(w * PX))
    th = max(8, round(im.height * tw / im.width))
    pieces.append((n, im.resize((tw, th), Image.LANCZOS), w, hang))
# shelf packing, tallest first
pieces.sort(key=lambda p: -p[1].height)
W = 1024
x = y = row = 0
pos = {}
for n, im, w, hang in pieces:
    if x + im.width > W:
        x, y, row = 0, y + row + 2, 0
    pos[n] = (x, y)
    x += im.width + 2
    row = max(row, im.height)
H = y + row
S = Image.new('RGBA', (W, H), (0, 0, 0, 0))
data = {}
for n, im, w, hang in pieces:
    px, py = pos[n]
    S.alpha_composite(im, (px, py))
    data[n] = {'x': px, 'y': py, 'w': im.width, 'h': im.height, 'units': w, **({'hang': True} if hang else {})}
out = ROOT / 'src/assets/props/dress.webp'
S.save(out, 'WEBP', quality=88, method=6)
ts = ['/**',
      ' * Generated by tools/art/hfground/packdress.py (hf-art-ground, 2026-10-29; polish report VI-17): the stage dressing for Worlds 1, 2 and 5',
      ' * in src/assets/props/dress.webp. Do not edit by hand. Drawn by dressArt.ts; placed by artDress.ts (dressSets).',
      ' * units: the width it is drawn at in the game (world units); hang: anchored by the middle of its top (else the middle of its foot).',
      ' */',
      'export interface DressFrame { x: number; y: number; w: number; h: number; units: number; hang?: boolean }',
      f'export const DRESS_FRAMES = {json.dumps(dict(sorted(data.items())), indent=1)} satisfies Record<string, DressFrame>;',
      'export type DressName = keyof typeof DRESS_FRAMES;', '']
(ROOT / 'src/game/dressAtlasData.ts').write_text('\n'.join(ts))
print(out, out.stat().st_size, W, H, len(data))
