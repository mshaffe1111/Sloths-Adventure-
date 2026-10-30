"""Cut the start screen's painted pieces (into src/assets/ui/ for the game, and as PNGs for the mocks) (hfui2 kit2-s80-23) and the Settings screen's tab chips and slider (hfui1 takes) to PNGs for the
layout mocks (and, once Matt picks a layout, for the game):
    python3 -I tools/art/hfui/kit2cut.py <hfui2 takes> <hfui1 takes> <game checkout> <out dir>
"""
import sys
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'hfbosses'))
T2, T1, GAME, OUT = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]), Path(sys.argv[4])
sys.argv = [sys.argv[0], str(T2), str(GAME)]
import bosscut_lib  # noqa: E402
bosscut_lib.QA = GAME / 'reference/prop-sheets/qa-notes/hf-ui'
from bosscut_lib import cut, review  # noqa: E402

OUT.mkdir(parents=True, exist_ok=True)
k2 = Image.open(T2 / 'kit2-s80-23.webp').convert('RGB')
PIECES = [('signBig', k2, (30, 0, 1010, 510), 700), ('token', k2, (1090, 30, 1350, 290), 160), ('leafToken', k2, (1370, 30, 1670, 290), 160),
          ('tag', k2, (1090, 330, 1610, 510), 360), ('vine', k2, (1690, 0, 1850, 1024), 120)]
PIECES += [(f'signSm{k}', k2, (40 + k * 330, 540, 350 + k * 330, 870), 260) for k in range(3)]
b1 = Image.open(T1 / 'kit-buttons-s62-7.webp').convert('RGB')
p1 = Image.open(T1 / 'kit-panels-s62-7.webp').convert('RGB')
PIECES += [('chipOff', b1, (1066, 456, 1414, 584), 220), ('chipOn', b1, (1466, 456, 1814, 584), 220),
           ('sliderTrack', p1, (986, 676, 1614, 784), 420), ('sliderKnob', p1, (1636, 626, 1844, 834), 120)]
# the ones the title and Settings draw (option B, Matt 2026-10-30)
GAME_FILES = {'signBig': 'sign-big.webp', 'leafToken': 'leaf-token.webp', 'token': 'token.webp', 'chipOn': 'chip-on.webp',
              'chipOff': 'chip-off.webp', 'sliderTrack': 'slider-track.webp', 'sliderKnob': 'slider-knob.webp'}
out = []
for name, im, box, mw in PIECES:
    p = cut(im, 'magenta', box, mainOnly=name not in ('vine',), crumbs=200)
    if p.width > mw:
        p = p.resize((mw, round(p.height * mw / p.width)), Image.LANCZOS)
    p.save(OUT / f'{name}.png')
    if name in GAME_FILES:
        p.save(GAME / 'src/assets/ui' / GAME_FILES[name], 'WEBP', quality=90, method=6)
    out.append((name, p))
    print(name, p.size)
review('kit2', out)

# the slider for a live value: the painted track with its baked green fill painted out (the empty track), and the green fill on its
# own (stretched to the value in CSS, border-image keeping its round ends)
import numpy as np  # noqa: E402
tr = np.asarray(Image.open(GAME / 'src/assets/ui/slider-track.webp').convert('RGBA')).astype(np.float32)
g = (tr[..., 1] > tr[..., 0] + 25) & (tr[..., 1] > tr[..., 2] + 25) & (tr[..., 3] > 0)
ys, xs = np.nonzero(g)
inner = tr[ys.min():ys.max() + 1, xs.max() + 30:xs.max() + 60, :3].reshape(-1, 3).mean(axis=0)
# (painting the fill out left its outline: the empty track is built from the clean right end instead, its round cap mirrored for the
# left and one clean column between them)
W = tr.shape[1]
cap = tr[:, W - 26:]
col = tr[:, W - 60:W - 59]
empty = np.concatenate([cap[:, ::-1], np.repeat(col, W - 52, axis=1), cap], axis=1)
Image.fromarray(empty.astype(np.uint8), 'RGBA').save(GAME / 'src/assets/ui/slider-empty.webp', 'WEBP', quality=90, method=6)
fill = tr[ys.min() - 1:ys.max() + 2, xs.min() - 1:xs.max() + 2].copy()
fill[..., 3] = np.where(g[ys.min() - 1:ys.max() + 2, xs.min() - 1:xs.max() + 2], 255, 0)
Image.fromarray(fill.astype(np.uint8), 'RGBA').save(GAME / 'src/assets/ui/slider-fill.webp', 'WEBP', quality=90, method=6)
print('slider', Image.open(GAME / 'src/assets/ui/slider-fill.webp').size, 'inset', int(ys.min()), int(xs.min()))
