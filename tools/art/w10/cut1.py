"""Cut World 10's lightning bolts, strike bursts and spike bed (2026-10-29) from the w10-props takes (unpacked carrier
carrier-w10props-0.png, tools/art/w5/unpack_carrier.py) into src/assets/w10/ and their review sheets.
    python3 -I tools/art/w10/cut1.py <takes dir>
Bolts and bursts were painted on black: alpha from brightness (w10lib.key_black), so they draw additively ('lighter') or normally alike.
Frames: {name: {x, y, w, h, ax, ay}}; ax/ay in the frame's own pixels.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from w10lib import GAME, edge_fade, key_black, key_magenta, review, trim, write  # noqa: E402

T = Path(sys.argv[1])
OUT = GAME / 'src/assets/w10'
QA = GAME / 'reference/prop-sheets/qa-notes/w10'
PICK = {'bolts': 'w10bolts-s65-7', 'bursts': 'w10bursts-s65-23', 'spikes': 'w10spikes-s62-7'}


def takes(g):
    return [(f.stem, Image.open(f).convert('RGB')) for f in sorted(T.glob(f'w10{g}-*.webp'))]


def half(im):
    return im.resize((round(im.width / 2), round(im.height / 2)), Image.LANCZOS)


# ---- lightning: four bolts (columns of 288 at 2x) + the impact burst's three frames (cells of 528 at 2x)
frames = []
src = Image.open(T / f"{PICK['bolts']}.webp").convert('RGB')
for i in range(4):
    col = edge_fade(key_black(src.crop((i * 288, 0, i * 288 + 288, src.height)), floor=22), 40, 'lr')
    col = half(col)
    a = np.asarray(col)[..., 3].astype(np.float32)
    # strike point: the brightest column in the bottom 20 rows
    ax = float(np.argmax(a[-20:].sum(axis=0)))
    im, bb = trim(col, 6)
    frames.append((f'bolt{i}', im, ax - bb[0], col.height - bb[1]))
bsrc = Image.open(T / f"{PICK['bursts']}.webp").convert('RGB')
for i, n in enumerate(('flash', 'crackle', 'fade')):
    cell = half(edge_fade(key_black(bsrc.crop((i * 528, 0, i * 528 + 528, bsrc.height)), floor=22), 50, 'lrt'))
    im, bb = trim(cell, 6)
    frames.append((f'burst-{n}', im, 132 - bb[0], 150 - bb[1]))
write(OUT, 'lightning', frames, {'note': 'World 10 lightning (HF img2img, tools/art/w10/cut1.py): bolt0-3 tall strikes, anchor = strike '
                                         'point at the bottom; burst-flash/crackle/fade at the foot, anchor = ground contact. Painted '
                                         'on black, alpha from brightness: draw with globalCompositeOperation "lighter".'})
bolt_row = Image.new('RGBA', (4 * 180, 704), (0, 0, 0, 0))
for k, (n, im, ax, ay) in enumerate(frames[:4]):
    bolt_row.alpha_composite(im, (round(k * 180 + 90 - ax), round(704 - ay)))
review(QA / 'lightning-bolts.jpg', 'World 10 lightning bolts: every take (4 bolts per take), pick w10bolts-s65-7; below, the 4 bolts drawn '
       'additively', takes('bolts'), PICK['bolts'], [('bolts 0-3', bolt_row)], additive=True, tw=280)
burst_row = Image.new('RGBA', (3 * 280, 180), (0, 0, 0, 0))
for k, (n, im, ax, ay) in enumerate(frames[4:]):
    burst_row.alpha_composite(im, (round(k * 280 + 140 - ax), round(170 - ay)))
review(QA / 'lightning-burst.jpg', 'World 10 strike burst (flash, crackle, fade): every take, pick w10bursts-s65-23', takes('bursts'),
       PICK['bursts'], [('burst flash / crackle / fade', burst_row)], additive=True, tw=440)

# ---- spike bed: the 1024 period (2x) with its first 96 columns blended from the overlap, so it tiles; two end caps; all halved
src = Image.open(T / f"{PICK['spikes']}.webp").convert('RGB')
y0, y1 = 40, 324                       # the rows that hold the spikes and the base (base 236-316 in the start)
cut = np.asarray(key_magenta(src.crop((0, y0, src.width, y1)))).astype(np.float32)
P, O = 1024, 96
tile = cut[:, :P].copy()
w = (np.arange(O) / O)[None, :, None]
tile[:, :O] = cut[:, P:P + O] * (1 - w) + cut[:, :O] * w
strip = half(Image.fromarray(np.clip(tile, 0, 255).astype(np.uint8), 'RGBA'))
base_bot = (316 - y0) / 2
caps = []
for name, (xa, xb) in (('cap-left', (1166, 1352)), ('cap-right', (1356, 1536))):
    c = half(Image.fromarray(cut[:, xa:xb].astype(np.uint8), 'RGBA'))
    im, bb = trim(c, 8)
    # left cap joins the strip's left edge (its right side), right cap the strip's right edge (its left side)
    ax = (im.width if name == 'cap-left' else 0)
    caps.append((name, im, ax, base_bot - bb[1]))
frames = [('strip', strip, 0, base_bot)] + caps
write(OUT, 'spikes', frames, {'note': 'World 10 iron spike bed (HF img2img, tools/art/w10/cut1.py): "strip" tiles left-right every 512 px '
                                      '(anchor: its left end at the bottom of the base); cap-left goes on the strip\'s left (anchor at its '
                                      'right side), cap-right on its right (anchor at its left side).'})
row = Image.new('RGBA', (caps[0][1].width + 3 * strip.width + caps[1][1].width, strip.height), (0, 0, 0, 0))
x = 0
row.alpha_composite(caps[0][1], (0, round(base_bot - caps[0][3])))
x = caps[0][1].width
for _ in range(3):
    row.alpha_composite(strip, (x, 0)); x += strip.width
row.alpha_composite(caps[1][1], (x, round(base_bot - caps[1][3])))
review(QA / 'spikes.jpg', 'World 10 spike bed: every take, pick w10spikes-s62-7; below: cap + the strip tiled 3x + cap (seams at 1/4, '
       '1/2, 3/4 of the strip run)', takes('spikes'), PICK['spikes'], [('spike bed, 3x tile with caps', row)], tw=440)
