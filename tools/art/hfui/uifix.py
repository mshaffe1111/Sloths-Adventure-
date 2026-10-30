"""Fixes to the painted menu kit (hf-art-bosses, 2026-10-30, the start screen's polish pass), repacking src/assets/ui/ui-kit.webp and
src/game/uiKitData.ts in place (every other piece is lifted back out of the atlas as it is):
  - the 24 icons are re-cut from their take keeping every part (uicut.py kept only the largest, so the full-screen icon lost three of
    its four corners);
  - the gear is re-graded from brown to the trophy's gold, so it reads on a brown plank.
    python3 -I tools/art/hfui/uifix.py <takes dir (hfui1)> <game checkout>
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'hfbosses'))
TAKES, GAME = Path(sys.argv[1]), Path(sys.argv[2])
sys.argv = [sys.argv[0], str(TAKES), str(GAME)]
import bosscut_lib  # noqa: E402
bosscut_lib.QA = GAME / 'reference/prop-sheets/qa-notes/hf-ui'
from bosscut_lib import cut, review  # noqa: E402

NAMES = ['play', 'restart', 'map', 'trophy', 'cards', 'book', 'save', 'gear', 'speaker', 'mute', 'cross', 'arrow', 'check', 'lock',
         'star', 'heart', 'medal', 'scroll', 'leaf', 'bulb', 'paw', 'swords', 'expand', 'sloth']
im = Image.open(TAKES / 'kit-icons-s40-7.webp').convert('RGB')
icons = {}
for k, n in enumerate(NAMES):
    x, y = 24 + (k % 6) * 340, 24 + (k // 6) * 340
    p = cut(im, 'magenta', (x - 6, y - 6, x + 306, y + 306), crumbs=120)
    if n == 'gear':
        a = np.asarray(p).astype(np.float32)
        L = a[..., :3].mean(axis=2) / 255
        # brown wood to gold: the dark outline stays dark, the body goes to the trophy's yellow-orange by its own lightness
        a[..., 0] = np.clip(60 + L * 330, 0, 255)
        a[..., 1] = np.clip(28 + L * 250, 0, 255)
        a[..., 2] = np.clip(10 + L * 80, 0, 255)
        p = Image.fromarray(a.astype(np.uint8), 'RGBA')
    if p.width > 128:
        p = p.resize((128, max(1, round(p.height * 128 / p.width))), Image.LANCZOS)
    icons[f'icon-{n}'] = p

data = (GAME / 'src/game/uiKitData.ts').read_text()
frames0 = json.loads(re.search(r'UI_KIT: Record<string, UiFrame> = (\{.*\});', data).group(1))
atlas0 = Image.open(GAME / 'src/assets/ui/ui-kit.webp').convert('RGBA')
pieces = [(n, atlas0.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))) for n, f in frames0.items() if n not in icons]
pieces += list(icons.items())
W = 2048
x = y = rowh = 0
frames = {}
for name, p in sorted(pieces, key=lambda t: -t[1].height):
    if x + p.width > W:
        x, y, rowh = 0, y + rowh + 4, 0
    frames[name] = {'x': x, 'y': y, 'w': p.width, 'h': p.height}
    x += p.width + 4
    rowh = max(rowh, p.height)
atlas = Image.new('RGBA', (W, y + rowh), (0, 0, 0, 0))
for name, p in pieces:
    atlas.paste(p, (frames[name]['x'], frames[name]['y']))
atlas.save(GAME / 'src/assets/ui/ui-kit.webp', 'WEBP', quality=88, method=6)
data = re.sub(r'UI_KIT_SIZE = \{[^}]*\}', f'UI_KIT_SIZE = {{ w: {W}, h: {atlas.height} }}', data)
data = re.sub(r'(UI_KIT: Record<string, UiFrame> = )\{.*\};', lambda m: m.group(1) + json.dumps(frames, separators=(',', ':')) + ';', data)
(GAME / 'src/game/uiKitData.ts').write_text(data)
print('ui-kit', atlas.size)
grid = Image.new('RGBA', (6 * 132, 4 * 132), (0, 0, 0, 0))
for k, n in enumerate(NAMES):
    p = icons[f'icon-{n}']
    grid.alpha_composite(p, ((k % 6) * 132 + (128 - p.width) // 2, (k // 6) * 132 + (128 - p.height) // 2))
review('icons-v2', [('24 icons, every part kept; the gear in gold', grid)], game_h=110)
