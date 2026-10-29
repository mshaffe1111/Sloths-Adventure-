"""Cut World 10's lightning rods (two looks x dull/charge/spent + additive fx) and the crumbling rampart (whole/cracked/breaking +
rubble + scorch decal) from the w10-props and w10-props2 takes (unpacked carriers) into src/assets/w10/ and review sheets.
    python3 -I tools/art/w10/cut2.py <takes dir>
Every state of a rod is the dull pick with only its upper part swapped for the state's repaint (feathered over 60 px of plain rod), so
the footing, the anchor and the outline below the tip are pixel-identical across states.
"""
import math, random, sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
from w10lib import GAME, edge_fade, key_black, key_magenta, review, trim, write  # noqa: E402

T = Path(sys.argv[1])
OUT = GAME / 'src/assets/w10'
QA = GAME / 'reference/prop-sheets/qa-notes/w10'
PICK = {'rods': 'w10rods-s68-7', 'charge': sys.argv[2] if len(sys.argv) > 2 else 'w10rodcharge-s45-7',
        'spent': sys.argv[3] if len(sys.argv) > 3 else 'w10rodspent-s35-7', 'fx': sys.argv[4] if len(sys.argv) > 4 else 'w10rodfx-s45-7',
        'ramp': 'w10rampart-s55-23', 'crack': sys.argv[5] if len(sys.argv) > 5 else 'w10rampcrack-s35-7', 'scorch': 'w10rampart-s55-7'}
K = 0.5


def load(n):
    return Image.open(T / f'{n}.webp').convert('RGB')


def takes(g):
    return [(f.stem, Image.open(f).convert('RGB')) for f in sorted(T.glob(f'w10{g}-*.webp'))]


def scale(im, k=K):
    return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)


# ---------------------------------------------------------------- rods
dull = np.asarray(key_magenta(load(PICK['rods']))).astype(np.float32)
states = {'dull': dull}
SPLIT = 640  # rows above this come from the state's repaint; the shaft is plain there on both looks
ramp = np.clip((SPLIT - np.arange(dull.shape[0])) / 60, 0, 1)[:, None, None]
for st in ('charge', 'spent'):
    rep = np.asarray(key_magenta(load(PICK[st]))).astype(np.float32)
    if st == 'charge':
        # (the repaint lit the iron a pale grey-blue that reads as white wrap on the coil: where it brightened the dull iron, push the hue to
        # the bolts' cyan-white and lift it, so the lit parts read as glowing at phone size)
        L0, L1 = dull[..., :3].mean(2), rep[..., :3].mean(2)
        g = np.clip((L1 - L0 - 25) / 70, 0, 1) * (rep[..., 3] > 0)
        g = ndimage.gaussian_filter(g, 1.5)[..., None]
        lum = rep[..., :3].mean(2, keepdims=True)
        tint = np.clip(np.array([0.62, 0.9, 1.12]) * lum * 1.12 + np.array([0, 10, 30]), 0, 255)
        rep[..., :3] = rep[..., :3] * (1 - g) + tint * g
    states[st] = rep * ramp + dull * (1 - ramp)
frames, tips = [], {}
for look, (x0, x1, tip) in (('a', (120, 400, (256, 66))), ('b', (630, 910, (768, 150)))):
    al = dull[..., 3][:, x0:x1] > 128
    for st in ('charge', 'spent'):
        al |= states[st][..., 3][:, x0:x1] > 128
    ys, xs = np.nonzero(al)
    bx0, by0, bx1, by1 = xs.min() + x0 - 2, ys.min() - 2, xs.max() + x0 + 3, ys.max() + 3
    # foot: on the rod's axis, at the footing's bottom
    fx = tip[0]  # the rod's own axis (the footing's rough bottom is lopsided), so a bolt meets the tip straight above the anchor
    for st in ('dull', 'charge', 'spent'):
        im = scale(Image.fromarray(np.clip(states[st][by0:by1, bx0:bx1], 0, 255).astype(np.uint8), 'RGBA'))
        frames.append((f'rod-{look}-{st}', im, (fx - bx0) * K, (by1 - 3 - by0) * K))
    tips[f'rod-{look}'] = [round((tip[0] - bx0) * K, 1), round((tip[1] - by0) * K, 1)]
# additive fx: [spear halo | crown halo | after-glow | smoke | smoke] on black
fxsrc = load(PICK['fx'])
for name, (c0, c1, ax, ay) in (('halo-a', (0, 256, 128, 150)), ('halo-b', (256, 512, 384, 150)), ('afterglow', (512, 720, 640, 150)),
                               ('smoke-0', (720, 870, 800, 470)), ('smoke-1', (870, 1024, 940, 470))):
    c = edge_fade(key_black(fxsrc.crop((c0, 0, c1, 512)), floor=20), 30, 'lrtb')
    c = scale(c)
    im, bb = trim(c, 5)
    frames.append((name, im, (ax - c0) * K - bb[0], ay * K - bb[1]))
write(OUT, 'rods', frames, {'tips': tips, 'note': (
    'World 10 lightning rods (HF img2img, tools/art/w10/cut2.py). rod-a (spear) and rod-b (crown + coil), states dull/charge/spent; '
    'the three states of a look share size and anchor (ax = the rod\'s axis, ay = the footing\'s bottom). "tips" = where the tip is in a rod '
    'frame, for placing halo-a/halo-b (anchor = the halo\'s centre) and afterglow while charging/spent, and smoke-0/1 (anchor = the '
    'wisp\'s base) after a strike. halo/afterglow/smoke were painted on black: draw them with "lighter".')})
# review: the three states side by side per look, with the fx placed
F = {n: (im, ax, ay) for n, im, ax, ay in frames}
row = Image.new('RGBA', (6 * 150, 690), (0, 0, 0, 0))
from w10lib import on_add  # noqa: E402
k = 0
for look in 'ab':
    for st in ('dull', 'charge', 'spent'):
        im, ax, ay = F[f'rod-{look}-{st}']
        ox, oy = round(k * 150 + 75 - ax), round(680 - ay)
        row.alpha_composite(im, (ox, oy))
        tx, ty = tips[f'rod-{look}']
        extra = {'charge': [f'halo-{look}'], 'spent': ['afterglow', 'smoke-0']}.get(st, [])
        for e in extra:
            fim, fax, fay = F[e]
            # additive fx shown composited normally here (alpha from brightness), as they look over the dark sky
            row.alpha_composite(fim, (round(ox + tx - fax), round(oy + ty - fay - (0 if 'smoke' not in e else 10))))
        k += 1
review(QA / 'rods.jpg', 'World 10 lightning rods: dull takes (round 1), charge and spent takes (round 2); picks '
       f"{PICK['rods']} / {PICK['charge']} / {PICK['spent']} / fx {PICK['fx']}. Below: spear dull/charge/spent, crown dull/charge/spent "
       '(halo on charge; after-glow + smoke on spent)', takes('rods') + takes('rodcharge') + takes('rodspent') + takes('rodfx'),
       None, [('rods', row)], tw=300)

# ---------------------------------------------------------------- rampart
SX0, SY0, SX1, SY1 = 30, 38, 692, 322
whole = np.asarray(key_magenta(load(PICK['ramp']))).astype(np.float32)
crack = np.asarray(key_magenta(load(PICK['crack']))).astype(np.float32)
top_y = 40  # the slab's top surface row in the takes
# (at phone size the repaint's cracks were too faint to tell cracked from whole: where the cracked take is clearly darker than the whole
# one (the crack lines), darken it further)
dL = whole[..., :3].mean(2) - crack[..., :3].mean(2)
cm = ndimage.gaussian_filter(np.clip((dL - 18) / 40, 0, 1), 0.7)[..., None] * (crack[..., 3:] > 128)
crack[..., :3] *= 1 - 0.55 * cm
fr = []
for st, src in (('whole', whole), ('cracked', crack)):
    im = scale(Image.fromarray(src[SY0:SY1, SX0:SX1].astype(np.uint8), 'RGBA'))
    fr.append((f'rampart-{st}', im, 0, (top_y - SY0) * K))
# breaking: the cracked slab cut into four pieces along the start's crack lines (replayed from starts2.py's seed), pieces dropping and
# tilting apart; same canvas origin and anchor, the canvas taller to hold the drop
rng = random.Random(11)
lines = []
for sx, sy in ((200, 42), (430, 42), (560, 320)):
    x, y = sx, sy
    down = 1 if sy < 100 else -1
    pts = [(x, y)]
    for _ in range(7):
        x += rng.uniform(-28, 28); y += down * rng.uniform(22, 40)
        pts.append((x, y))
        if rng.random() < 0.4:
            rng.uniform(-40, 40); rng.uniform(15, 30)
    lines.append(sorted(pts, key=lambda p: p[1]))
H, W = SY1 - SY0, SX1 - SX0
yy = np.arange(SY0, SY1)


def line_x(pts, y):
    ys = [p[1] for p in pts]; xs = [p[0] for p in pts]
    return np.interp(y, ys, xs, left=xs[0], right=xs[-1])


cuts = [line_x(l, yy) - SX0 for l in lines]  # per row x of each crack (3 cracks -> 4 pieces)
xx = np.arange(W)[None, :]
order = np.argsort([c.mean() for c in cuts])
cuts = [cuts[i] for i in order]
labels = np.zeros((H, W), int)
for c in cuts:
    labels += (xx > c[:, None]).astype(int)
cr = crack[SY0:SY1, SX0:SX1]
drop = [(0, 10, -3.0), (0, 4, 1.5), (0, 14, -2.5), (0, 24, 4.0)]  # (dx, dy, degrees) per piece, left to right
pad = 40
canvas = Image.new('RGBA', (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0))
for i in range(4):
    m = (labels == i)
    m = ndimage.binary_erosion(m, iterations=3)  # a gap opens along each crack
    piece = cr.copy(); piece[..., 3] *= m
    # (a thin dark outline along the new broken edge, like the painting's own outline, so a piece doesn't look scissor-cut)
    rim = m & ~ndimage.binary_erosion(m, iterations=3) & ndimage.binary_erosion(cr[..., 3] > 128, iterations=4)
    soft = ndimage.gaussian_filter(rim.astype(np.float32), 0.8)[..., None] * 0.9
    piece[..., :3] = piece[..., :3] * (1 - soft) + np.array([22, 18, 20]) * soft
    pim = Image.fromarray(piece.astype(np.uint8), 'RGBA')
    cx = np.nonzero(m.any(0))[0].mean()
    dx, dy, deg = drop[i]
    dx += (i - 1.5) * 8
    big = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); big.alpha_composite(pim, (pad, pad))
    big = big.rotate(deg, resample=Image.BICUBIC, center=(pad + cx, pad + H / 2))
    sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); sh.alpha_composite(big, (round(dx), round(dy)))
    canvas.alpha_composite(sh)
fr.append(('rampart-breaking', scale(canvas), pad * K, (pad + top_y - SY0) * K))
# rubble: the four loose chunks of the whole take
full = Image.fromarray(whole.astype(np.uint8), 'RGBA')
for i, box in enumerate(((739, 57, 836, 158), (878, 79, 976, 155), (765, 231, 838, 279), (886, 234, 970, 336))):
    im, bb = trim(scale(full.crop((box[0] - 3, box[1] - 3, box[2] + 3, box[3] + 3))), 8)
    fr.append((f'rubble-{i}', im, im.width / 2, im.height / 2))
# scorch decal: soot = how much darker than the patch's own stone; embers kept bright; edges faded
sc = np.asarray(load(PICK['scorch']).crop((50, 428, 592, 584))).astype(np.float32)
L = sc.mean(axis=2)
stone = np.median(np.concatenate([L[:10].ravel(), L[-10:].ravel(), L[:, :14].ravel(), L[:, -14:].ravel()]))
soot = np.clip((stone - 8 - L) / (stone - 20), 0, 1)
soot = ndimage.gaussian_filter(soot, 1.2)
ember = np.clip((sc[..., 0] - sc[..., 2] - 60) / 60, 0, 1) * (sc[..., 0] > 140)
alpha = np.maximum(soot ** 0.9, ember)
rgb = sc * ember[..., None] + np.array([22, 18, 20]) * (1 - ember[..., None])
dec = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), 'RGBA')
dec = edge_fade(dec, 24, 'lrtb')
dec, bb = trim(scale(dec, 0.42), 6)
fr.append(('scorch', dec, dec.width / 2, dec.height / 2))
write(OUT, 'rampart', fr, {'note': (
    'World 10 crumbling rampart (HF img2img, tools/art/w10/cut2.py): rampart-whole/cracked/breaking share the anchor ax/ay = the left '
    'end of the slab\'s top surface (where Pokey stands); 330 px wide = 110 game units at 1/3. rubble-0..3 falling chunks (anchor = '
    'centre). scorch: soot decal for the floor where a bolt hits, anchor = centre (normal blend; its embers can take a small code glow).')})
G = {n: (im, ax, ay) for n, im, ax, ay in fr}
row = Image.new('RGBA', (3 * 380 + 4 * 70 + 260, 220), (0, 0, 0, 0))
x = 10
for st in ('whole', 'cracked', 'breaking'):
    im, ax, ay = G[f'rampart-{st}']
    row.alpha_composite(im, (round(x + 10 - ax), round(30 - ay))); x += 380
for i in range(4):
    im, ax, ay = G[f'rubble-{i}']
    row.alpha_composite(im, (round(x + 30 - ax), round(80 - ay))); x += 70
im, ax, ay = G['scorch']
row.alpha_composite(im, (round(x + 120 - ax), round(170 - ay)))
review(QA / 'rampart.jpg', f"World 10 rampart: round-1 takes (whole) and round-2 takes (cracked); picks {PICK['ramp']} / {PICK['crack']}, "
       f"scorch from {PICK['scorch']}. Below: whole, cracked, breaking, rubble x4, scorch", takes('rampart') + takes('rampcrack'), None,
       [('rampart', row)], tw=300)
