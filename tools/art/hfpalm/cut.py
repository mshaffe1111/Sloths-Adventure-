"""ART-18: one of 1-8's painted palms from one Hugging Face take (spec-palm.json; picked takes in reference/art/hfpalm/).

    python3 -I tools/art/hfpalm/cut.py <take.png|webp> <out.webp> [--haze K] [--fade F] [--height H]

Keys the magenta off by how magenta each pixel is (the takes' pink is not flat), pulls the spill back, keeps only what joins the
tree (a loose leaf or speck the model left floating is dropped, hf-art.md 2026-10-31), fades the trunk's foot out over the lowest F of
the tree (default 0.16: the trunk rises out of the mist under the bough, never a cut end), crops to the tree, and writes it H px tall
(default 1100). --haze K (0..1) mixes the colours K of the way toward 1-8's mist (sampled from the w1rain backdrop at middle depth, ART-18)
and softens their contrast: a palm further back, behind the near ones (STAGE-RULES §4: painted, graded, never a code tint at draw time).
Prints the cut's size and where its nut cluster is (fractions of the cut: cx from the left, cy from the top), for DRESS_18.
"""
import sys
from collections import deque
import numpy as np
from PIL import Image

args = sys.argv[1:]
src, out = args[0], args[1]
opt = {args[i]: float(args[i + 1]) for i in range(2, len(args) - 1, 2)}
HAZE, FADE, HEIGHT, GRADE = opt.get('--haze', 0.0), opt.get('--fade', 0.16), int(opt.get('--height', 1100)), opt.get('--grade', 0.62)
SAT0 = opt.get("--sat0", 14.0)
MIST = np.array([172, 190, 180], np.float32)

im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = im.shape
# (the takes' magenta is not flat (soft pink gradients, rain streaks), so it is keyed by how magenta a pixel is, not by its distance from
# one colour: m = min(R, B) - G is high on the pink and near 0 on the grey trunk, the greens, the browns and the orange nuts)
mg = np.minimum(im[..., 0], im[..., 2]) - im[..., 1]
hs = np.asarray(Image.fromarray(np.clip(im, 0, 255).astype(np.uint8), 'RGB').convert('HSV')).astype(np.float32)
hue, sat = hs[..., 0], hs[..., 1]
# (magenta-pink hues, PIL 0-255: 300-345 deg = 212-245, soft over 8 either side; the pale pink haze has low saturation but that hue, and
# min(R, B) over G; nothing in a palm (greens, teal, browns, orange, the grey trunk) has both)
hw = np.clip(1 - (np.maximum(0, 200 - hue) + np.maximum(0, hue - 250)) / 8, 0, 1)
bgness = hw * np.clip((sat - SAT0) / 16, 0, 1) * np.clip((mg - 1) / 7, 0, 1) * np.clip((hs[..., 2] - 150) / 40, 0, 1)  # (the pink is bright; dark purplish nuts are not)
a = 1 - bgness
# (the spill: any pixel left with min(R, B) over G is pulled back to G there, fully at the soft rim, half inside the tree)
sp = np.clip(mg, 0, None) * np.where(a < 0.98, 1.0, 0.5)
im[..., 0] -= sp
im[..., 2] -= sp
# (keep only what joins the tree: components on a quarter-size mask, the biggest one and anything touching it)
S = 4
m = a[::S, ::S] > 0.5
h4, w4 = m.shape
lab = np.zeros(m.shape, np.int32)
sizes = [0]
for y0 in range(h4):
    for x0 in range(w4):
        if m[y0, x0] and not lab[y0, x0]:
            k = len(sizes); n = 0
            q = deque([(y0, x0)]); lab[y0, x0] = k
            while q:
                y, x = q.popleft(); n += 1
                for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1), (y - 1, x - 1), (y + 1, x + 1), (y - 1, x + 1), (y + 1, x - 1)):
                    if 0 <= yy < h4 and 0 <= xx < w4 and m[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = k; q.append((yy, xx))
            sizes.append(n)
big = int(np.argmax(sizes))
keep = lab == big
dropped = sum(1 for i, s in enumerate(sizes) if i and i != big)
k2 = np.repeat(np.repeat(keep, S, 0), S, 1)[:H, :W]
# (grow the kept mask by a few px so the soft rim of the tree stays)
grow = k2.copy()
for d in range(1, 7):
    grow[d:] |= k2[:-d]; grow[:-d] |= k2[d:]; grow[:, d:] |= k2[:, :-d]; grow[:, :-d] |= k2[:, d:]
a = a * grow

ys, xs = np.where(a > 0.02)
y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
pad = 6
y0, x0, x1 = max(0, y0 - pad), max(0, x0 - pad), min(W, x1 + pad)
im, a = im[y0:y1, x0:x1], a[y0:y1, x0:x1]
h, w = a.shape
# (the foot: alpha ramps from 1 to 0 over the lowest FADE of the tree, eased, so the trunk thins into the mist)
nf = max(1, int(h * FADE))
t = np.linspace(1, 0, nf) ** 1.6
a[h - nf:] *= t[:, None]

# (the grade: the takes' lime and teal fronds pulled to the w1rain backdrop's sage (saturation down, value a touch down), hues kept;
# browns, the trunk's grey and the nuts untouched, ENG-LOOK2's HSV way)
hsv0 = np.asarray(Image.fromarray(np.clip(im, 0, 255).astype(np.uint8), 'RGB').convert('HSV')).astype(np.float32)
gr = (hsv0[..., 0] >= 28) & (hsv0[..., 0] < 150) & (hsv0[..., 1] > 40)
hsv0[..., 1][gr] *= GRADE
hsv0[..., 2][gr] *= 0.9
im = np.asarray(Image.fromarray(np.clip(hsv0, 0, 255).astype(np.uint8), 'HSV').convert('RGB')).astype(np.float32)

if HAZE > 0:
    lum = im.mean(-1, keepdims=True)
    im = im * (1 - 0.35 * HAZE) + lum * (0.35 * HAZE)       # (a little of the colour out, as distance does)
    im = im * (1 - HAZE) + MIST * HAZE

# (the nut cluster: the dark warm-brown round pixels in the top 70% of the tree, centroid)
hsv = np.asarray(Image.fromarray(np.clip(im, 0, 255).astype(np.uint8), 'RGB').convert('HSV')).astype(np.float32)
top = np.zeros_like(a, bool); top[: int(h * 0.7)] = True
nut = top & (a > 0.9) & ((hsv[..., 0] < 28) | (hsv[..., 0] > 240)) & (hsv[..., 1] > 70) & (hsv[..., 2] < 150)
if nut.sum() > 50:
    ny, nx = np.where(nut)
    cx, cy = nx.mean() / w, ny.mean() / h
else:
    cx, cy = float('nan'), float('nan')

rgba = np.dstack([np.clip(im, 0, 255), np.clip(a * 255, 0, 255)]).astype(np.uint8)
img = Image.fromarray(rgba, 'RGBA')
sc = HEIGHT / h
img = img.resize((round(w * sc), HEIGHT), Image.LANCZOS)
img.save(out, 'WEBP', quality=90, method=6)
print(f'{out}: {img.width}x{img.height} dropped {dropped} loose bits; nuts cx {cx:.3f} cy {cy:.3f} ({int(nut.sum())} px)')
