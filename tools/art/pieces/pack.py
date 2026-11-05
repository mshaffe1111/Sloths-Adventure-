"""Packs the engine pieces' art (src/game/pieces/) into one small sheet, src/assets/pieces/pieces.webp + pieces.json.

Every cell is EXISTING packed art that nothing drew (reference/engine/unused-art/IN-GAME-UNUSED.md, 2026-11-05): no new painting, no
masking, no retouching; each cell is copied whole from its source sheet, scaled down only where the game draws it far smaller than painted
(PERFORMANCE-RULES §2.6: a picture's pixels near what it covers on screen at q0, 2x CSS). One sheet instead of four (w2-new 1935x1226,
w3-new 2031x1224, w4-new 1873x2124, the secret kits: about 46 MB decoded together) keeps a stage that lays a piece under budget (§2.13).

  python3 tools/art/pieces/pack.py
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
A = ROOT / 'src/assets'
# (source sheet, cell, scale): scale 1 keeps the painted pixels; < 1 where the drawn size is far smaller (named per cell)
CELLS = [
    ('w1to4art/w4-new', 'slung-log', 1.0),      # drawn ~200-240 wide: 2x is ~480, the cell is 487
    ('w1to4art/w2-new', 'crate-up', 1.0),       # drawn ~90-110 wide
    ('w1to4art/w2-new', 'crate-down', 1.0),
    ('w1to4art/w2-new', 'waterline', 1.0),
    ('w1to4art/w3-new', 'counterweight', 1.0),
    ('w1to4art/w1-new', 'root-gate-shut', 1.0),
    ('w1to4art/w1-new', 'root-gate-open', 1.0),
    ('w1to4art/w1-new', 'knot-a', 0.6),         # drawn ~70 tall: 2x is ~140, the cell is 231
    ('w1to4art/w1-new', 'knot-b', 0.6),
    ('w1to4art/w3-new', 'crack-whole', 1.0),
    ('w1to4art/w3-new', 'crack-cracking', 1.0),
    ('w1to4art/w3-new', 'bat-asleep', 0.5),     # drawn ~70-90 tall: 2x is ~180, the cell is 420
    ('w1to4art/w3-new', 'bat-stir', 0.5),
    ('w1to4art/w3-new', 'bat-flap1', 0.5),
    ('w1to4art/w3-new', 'bat-flap2', 0.5),
    ('w1to4art/w3-new', 'stalactite-fall', 1.0),
    ('w1to4art/w3-new', 'stalactite-shards', 1.0),
]
PAD = 4
MAXW = 1024


def frames(sheet):
    d = json.loads((A / f'{sheet}.json').read_text())
    return d.get('frames', d)


def main():
    cuts = []
    srcs = {}
    for sheet, name, k in CELLS:
        if sheet not in srcs:
            srcs[sheet] = Image.open(A / f'{sheet}.webp').convert('RGBA')
        f = frames(sheet)[name]
        c = srcs[sheet].crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
        if k != 1.0:
            c = c.resize((round(c.width * k), round(c.height * k)), Image.LANCZOS)
        cuts.append((name, c, sheet, k))
    # shelf pack, tallest first
    order = sorted(cuts, key=lambda t: -t[1].height)
    x = y = shelf = 0
    out = {}
    for name, c, sheet, k in order:
        if x + c.width > MAXW:
            x, y, shelf = 0, y + shelf + PAD, 0
        out[name] = {'x': x, 'y': y, 'w': c.width, 'h': c.height, 'from': sheet, 'scale': k}
        x += c.width + PAD
        shelf = max(shelf, c.height)
    H = y + shelf
    im = Image.new('RGBA', (MAXW, H), (0, 0, 0, 0))
    for name, c, _, _ in cuts:
        im.alpha_composite(c, (out[name]['x'], out[name]['y']))
    (A / 'pieces').mkdir(exist_ok=True)
    im.save(A / 'pieces/pieces.webp', 'WEBP', quality=92, method=6)
    (A / 'pieces/pieces.json').write_text(json.dumps({'sheet': 'pieces.webp', 'size': {'w': MAXW, 'h': H}, 'frames': out}, indent=1) + '\n')
    print(f'pieces.webp {MAXW}x{H}, {len(out)} cells, {(A / "pieces/pieces.webp").stat().st_size // 1024} KB, {MAXW * H * 4 / 1e6:.1f} MB decoded')


if __name__ == '__main__':
    main()
