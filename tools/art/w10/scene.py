"""A rough phone-size check of World 10's new pieces together (2026-10-29): a dark storm ground of kit stone, the spike bed in a pit,
both rods (dull and charged, a bolt striking the charged one with its flash), a rampart run with a cracked and a breaking slab, rubble,
the scorch. Not a game screenshot: only for judging the art at phone size.
    python3 -I tools/art/w10/scene.py   -> reference/prop-sheets/qa-notes/w10/scene-check.jpg
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image

GAME = Path(__file__).resolve().parents[3]
A = GAME / 'src/assets/w10'


def atlas(n):
    im = Image.open(A / f'{n}.webp').convert('RGBA')
    fr = json.loads((A / f'{n}.json').read_text())['frames']
    return {k: (im.crop((v['x'], v['y'], v['x'] + v['w'], v['y'] + v['h'])), v['ax'], v['ay']) for k, v in fr.items()}


F = {**atlas('lightning'), **atlas('spikes'), **atlas('rods'), **atlas('rampart')}
W, H = 1688, 780  # a sideways phone (844x390) at 2x
S = Image.new('RGBA', (W, H), (0, 0, 0, 255))
g = np.linspace(0, 1, H)[:, None, None]
S = Image.fromarray(np.uint8(np.broadcast_to(np.array([22, 24, 34]) * (1 - g) + np.array([44, 46, 56]) * g, (H, W, 3))).copy()).convert('RGBA')
kit = Image.open(GAME / 'src/assets/kits/w10.webp').convert('RGBA')
floor = kit.crop((1016, 604, 1576, 836))
GY = 600
for x in list(range(0, 520, 280)) + list(range(1060, W, 280)):
    S.alpha_composite(floor.resize((280, 116)), (x, GY))
PITL, PITR = 560, 1060
d = Image.new('RGBA', (PITR - PITL, H - GY), (12, 12, 16, 255)); S.alpha_composite(d, (PITL, GY))


def put(n, x, y, k=1.0, add=False):
    im, ax, ay = F[n]
    if k != 1.0:
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS); ax *= k; ay *= k
    x0, y0 = round(x - ax), round(y - ay)
    if add:
        a = np.asarray(S).astype(np.float32)
        b = np.asarray(im).astype(np.float32)
        h, w = b.shape[:2]
        ys, xs = slice(max(0, y0), min(H, y0 + h)), slice(max(0, x0), min(W, x0 + w))
        bb = b[ys.start - y0:ys.stop - y0, xs.start - x0:xs.stop - x0]
        a[ys, xs, :3] = np.clip(a[ys, xs, :3] + bb[..., :3] * bb[..., 3:] / 255, 0, 255)
        S.paste(Image.fromarray(a.astype(np.uint8), 'RGBA'))
    else:
        S.alpha_composite(im, (x0, y0))


# spikes across the pit floor
sy = H - 20
put('cap-left', PITL, sy)
x = PITL
while x < PITR - 40:
    put('strip', x, sy); x += 512
put('cap-right', x, sy)
# rods: dull, and charged with a bolt and flash
put('rod-a-dull', 200, GY + 8, 0.8)
put('rod-b-charge', 1250, GY + 8, 0.8)
tx, ty = F['rod-b-charge'][1], F['rod-b-charge'][2]
tip = json.loads((A / 'rods.json').read_text())['tips']['rod-b']
hx, hy = 1250 - tx * 0.8 + tip[0] * 0.8, GY + 8 - ty * 0.8 + tip[1] * 0.8
put('halo-b', hx, hy, 0.8, add=True)
put('bolt2', hx, hy, 1.0, add=True)
put('scorch', 1480, GY + 22)
put('burst-crackle', 1480, GY + 20, 1.0, add=True)
# a rampart run above the pit
RY = 330
put('rampart-whole', 560, RY); put('rampart-cracked', 560 + 330, RY); put('rampart-breaking', 560 + 660, RY)
put('rubble-0', 700, RY + 210); put('rubble-2', 1000, RY + 160)
out = GAME / 'reference/prop-sheets/qa-notes/w10/scene-check.jpg'
S.convert('RGB').resize((W // 2, H // 2), Image.LANCZOS).save(out, quality=90)
print(out)
