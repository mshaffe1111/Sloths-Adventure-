"""Pack the art director's World 1 cuts that 1-1 stands on into one atlas (W1-ART-AUDIT §3.2-3.5; reference/art/cut/INTEGRATE-1-1.md).

  python3 tools/art/packcut.py <cut dir>   -> src/assets/w1to4art/w1-cut.webp and w1-cut.json

The cut dir holds the art director's cut PNGs and footing.json (art-director branch, reference/art/cut). Each piece is scaled so it is drawn
at about 2.5x its game size at most (crisp on a phone's 2-3x screen, the atlas under 4096 px and 4 MiB), and its footing (the standable top,
INTEGRATE-1-1.md) is carried into atlas pixels: `fy` the top line from the frame's top, `fx0..fx1` the stand span.
"""
import json, sys
from pathlib import Path
from PIL import Image

SRC = Path(sys.argv[1])
GAME = Path(__file__).resolve().parents[2]
OUT_IMG = GAME / 'src/assets/w1to4art/w1-cut.webp'
OUT_JSON = GAME / 'src/assets/w1to4art/w1-cut.json'
# the pieces 1-1 stands on (INTEGRATE-1-1.md's table; the hollow stumps are perches only, the lashed log is World 2's, branches dressing)
KEEP = {
    'stone': ['w1-rock-boulder-moss', 'w1-rock-boulder-moss-big', 'w1-boulder-grey-moss', 'w1-boulder-grey-moss-b', 'w1-rock-block-big',
              'w1-rock-root-block', 'w1-rock-slabs-stacked', 'w1-rock-slabs-stacked-big', 'w1-rock-slabs-low', 'w1-rock-roots'],
    'stump': ['w1-stump-wide', 'w1-post-tall-vine'],
    'perch': ['w1-hide-stump-hollow', 'w1-hide-stump-hollow-tall'],
    'log': ['w1-log-plank-a', 'w1-log-plank-b', 'w1-plank-ledge-a', 'w1-plank-ledge-b', 'w1-plank-ledge-c'],
}
SCALE_MAX = 2.5
foot = json.loads((SRC / 'footing.json').read_text())['pieces']
cells = []
for kind, names in KEEP.items():
    for n in names:
        f = foot[n]
        im = Image.open(SRC / f'{n}.png').convert('RGBA')
        sw, sh = im.size
        # the scale from the cut's pixels to the atlas's: 2.5x the game size it is drawn at, never up from the cut
        k = min(1.0, SCALE_MAX * f['drawn_game_h'] / sh)
        im = im.resize((max(1, round(sw * k)), max(1, round(sh * k))), Image.LANCZOS)
        top = f['footing'][0]
        cells.append({'n': n, 'kind': kind, 'im': im, 'fy': top['y'] * k, 'fx0': top['x0'] * k, 'fx1': top['x1'] * k, 'game_h': f['drawn_game_h']})
# shelf packing, tallest first, 2 px apart
cells.sort(key=lambda c: -c['im'].size[1])
W = 2048
x = y = shelf = 0
for c in cells:
    w, h = c['im'].size
    if x + w > W:
        x, y, shelf = 0, y + shelf + 2, 0
    c['x'], c['y'] = x, y
    x += w + 2
    shelf = max(shelf, h)
H = y + shelf
assert H <= 4096, H
sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for c in cells:
    sheet.paste(c['im'], (c['x'], c['y']))
OUT_IMG.parent.mkdir(parents=True, exist_ok=True)
sheet.save(OUT_IMG, 'WEBP', quality=88, method=6)
data = {c['n']: {'kind': c['kind'], 'x': c['x'], 'y': c['y'], 'w': c['im'].size[0], 'h': c['im'].size[1], 'fy': round(c['fy'], 1), 'fx0': round(c['fx0'], 1), 'fx1': round(c['fx1'], 1)} for c in sorted(cells, key=lambda c: c['n'])}
OUT_JSON.write_text(json.dumps(data, indent=1) + '\n')
print(f'{len(cells)} pieces, {W}x{H}, {OUT_IMG.stat().st_size // 1024} KiB')
