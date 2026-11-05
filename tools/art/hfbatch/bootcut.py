"""Cut 1-1's Stage Cleared clue, the soldier's bootprint (2026-11-05; jobs.txt hfb-w1boot-r2, take low-s62-5), as a FLUSH DECAL
pressed into the shrine log's top, not an object on it. Round 1's top-down bed and round 2's whole bed both stood up on the log like a
disc (the coordinator's polish review, 2026-11-05), so:
  - the take is masked to the print alone (its dark pressed earth and lugs) plus a thin soft rim, nothing else: no bed, no earth edge,
    no thickness; the outline is smoothed (the bed's lip left the heel ragged);
  - the rim, and the take's pale lit lip, are graded to the ground's own moss (the W1 bank top's grass, or GROUND=log the shrine log's
    grey sage, both sampled from real screenshots) and feather out, so it melts into the ground's paint;
  - the anchor is the decal's TOP edge (ax = middle, ay = 0): drawn with that edge exactly on the landing's top line, nothing stands
    above the surface. Saved at 4x (phones draw at 2-3x). The frame is printed for whoever wires it in.
    python3 -I tools/art/hfbatch/bootcut.py <take png> [east|card|up] [out webp]
  east  (default) THE WORLD DECAL, approved 2026-11-05, out src/assets/props/w1-bootprint.webp: the print laid along the log's top band,
        toe east (onward, toward the shrine: "They did not stop here"); the take's own foreshortening undone (TAKE_FS), turned, squashed
        to the top band's angle (EAST_FLAT), EAST_W game px long (75 x 18).
  card  the Stage Cleared card's picture, out src/assets/props/w1-bootprint-card.webp: the whole print toe up the card (north, where
        the line "pointing north" is read), as painted, CARD_H px tall. Wiring the card is engine-render's.
  up    option A, not used: toe up hanging on the log's face; the face is only ~34 game px deep, so it came out 20 x 32 and read only
        as a dark footprint shape sideways.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[3]
MODE = sys.argv[2] if len(sys.argv) > 2 else 'east'
TAKE_FS, EAST_FLAT, EAST_W = 0.62, 0.72, 75
CARD_H = 320   # card mode: px tall (the card scales it)
DRAW_H = 32                   # game px: the log is ~34 px deep under its top line (the 1-1 shrine log), so the decal stays on its face
FLAT = 0.9                    # the extra squash on top of the take's own foreshortening (the log top seen from the side)
RIM = 12                      # take px of moss-and-mud rim round the print, feathered to nothing
SCALE = 4
ROI = (300, 95, 470, 346)   # x0, y0, x1, y1 of low-s62-5's print (its toe at y ~105, its heel ends at y ~345)
# the moss the rim is graded to: the World 1 bank top's grass (default: the print's home once 1-1's end is a bank, the coordinator
# 2026-11-05; bank15-sideways.png, 1-5's end bank, y 226-234) or the shrine log's grey-sage top moss (GROUND=log; end-sideways.png)
import os
LOG_MOSS = np.array({'bank': [96, 100, 55], 'log': [112, 124, 106]}[os.environ.get('GROUND', 'bank')], np.float32)

im = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
lum = 0.3 * r + 0.59 * g + 0.11 * b
not_mag = ((r - g) + (b - g)) < 140
# the print: the dark, not-green pressed earth (and its brown lugs) in the middle of the bed; the largest such piece
dark = (lum < 100) & ((g - b) < 22) & not_mag   # (moss is olive: its blue sits far under its green; the pressed earth is grey-brown)
# (only inside the print's window of the take: the bed's dark earth side touches it below)
roi = np.zeros_like(dark); roi[ROI[1]:ROI[3], ROI[0]:ROI[2]] = True
dark = ndimage.binary_opening(dark & roi, iterations=2)
lab, n = ndimage.label(dark)
cy, cx = im.shape[0] * 0.45, im.shape[1] * 0.5
best, bestd = 1, 1e9
for k in range(1, n + 1):
    ys, xs = np.nonzero(lab == k)
    if len(ys) < 2000:
        continue
    d = np.hypot(ys.mean() - cy, xs.mean() - cx)
    if d < bestd:
        best, bestd = k, d
pr = ndimage.binary_fill_holes(ndimage.binary_closing(lab == best, iterations=6))
# a smooth outline (the bed's lip left the heel ragged): blur the mask and cut it at half
pr = ndimage.gaussian_filter(pr.astype(np.float32), 7) > 0.5
# alpha: solid over the print, the rim fading over RIM px
dist = ndimage.distance_transform_edt(~pr)
alpha = np.clip(1 - (dist - 1.5) / RIM, 0, 1)
alpha = np.where(pr, 1.0, alpha * alpha)
# the rim's moss graded to the log's moss (keep its light and dark, move its colour); the print itself is left as painted
rim = ~pr & (alpha > 0)
out = im.copy()
mean = im[rim].mean(0)
lift = (lum[..., None] - lum[rim].mean()) * 0.9
graded = np.clip(LOG_MOSS + lift, 0, 255)
w = np.clip((dist - 0.5) / 1.5, 0, 1)[..., None]   # graded from the print edge on: the take's pale lit lip read as a sticker outline
out = np.where(rim[..., None], out * (1 - w) + graded * w, out)
# the take's pale lit lip and the bed's torn moss that the smoothed mask took in (olive inside the print's edge, ragged at the heel):
# painted the print's own mud, so its edge is one clean dark line
inner = ndimage.distance_transform_edt(pr)
ys = np.nonzero(pr)[0]
heel = np.arange(pr.shape[0])[:, None] > ys.min() + 0.86 * (ys.max() - ys.min())
toe = np.arange(pr.shape[0])[:, None] < ys.min() + 0.32 * (ys.max() - ys.min())
lip = pr & ((g - b) >= 22) & (((inner < 2.5) & ~toe) | heel)   # (the outer ring below the toe and the heel's torn end: the toe's lugs stay)
mud = np.median(im[pr & ((g - b) < 22)], axis=0)
out = np.where(lip[..., None], mud * (0.85 + 0.3 * (lum[..., None] / 255.0)), out)
if MODE == 'card':
    # the card has no ground under it, so no rim at all (the coordinator 2026-11-05: the take's lit rim read as a yellow-green halo):
    # cut tight to the sole's own dark edge (the toe's lug gaps become the notches a real lugged print leaves), its enclosed lug lines
    # kept as painted; the heel's torn end takes the smooth outline and is painted mud; then the alpha is eroded 1 px, softened, and
    # every edge pixel's colour bled in from 3 px inside, so no lit or green fringe is left on light or dark.
    sole = ndimage.binary_fill_holes(ndimage.binary_closing(dark & pr, iterations=2))
    sole = np.where(heel, pr, sole)
    sole = ndimage.binary_opening(sole, iterations=1)
    sole = ndimage.binary_erosion(sole, iterations=1)
    alpha = np.clip(ndimage.gaussian_filter(sole.astype(np.float32), 0.8) * 1.6 - 0.3, 0, 1)
    core = ndimage.binary_erosion(sole, iterations=3)
    idx = ndimage.distance_transform_edt(~core, return_distances=False, return_indices=True)
    bleed = out[idx[0], idx[1]]
    ring = ~core
    out = np.where(ring[..., None], bleed, out)
rgba = np.dstack([np.clip(out, 0, 255).astype(np.uint8), (alpha * 255).astype(np.uint8)])
D = Image.fromarray(rgba, 'RGBA')
D = D.crop(D.getchannel('A').point(lambda v: 255 if v > 6 else 0).getbbox())
if MODE == 'east':
    D = D.resize((D.width, round(D.height / TAKE_FS)), Image.LANCZOS).rotate(-90, expand=True, resample=Image.BICUBIC)
    w_ = EAST_W * SCALE
    D = D.resize((w_, round(D.height * w_ / D.width * EAST_FLAT)), Image.LANCZOS)
elif MODE == 'card':
    # the Stage Cleared card's picture (the coordinator, 2026-11-05): the full painted print, toe up the card (north), as painted
    D = D.resize((round(D.width * CARD_H / D.height), CARD_H), Image.LANCZOS)
else:
    h = DRAW_H * SCALE
    w_ = round(D.width * (h / D.height) / FLAT)
    D = D.resize((w_, h), Image.LANCZOS)
dst = Path(sys.argv[3]) if len(sys.argv) > 3 else ROOT / {'card': 'src/assets/props/w1-bootprint-card.webp', 'east': 'src/assets/props/w1-bootprint.webp'}.get(MODE, 'src/assets/props/w1-bootprint-up.webp')
D.save(dst, 'WEBP', quality=92, method=6)
print(dst, D.size, 'print px', int(pr.sum()))
print(json.dumps({'w1-bootprint': {'x': 0, 'y': 0, 'w': D.width, 'h': D.height, 'ax': D.width / 2, 'ay': 0,
                                   'drawW': round(D.width / SCALE), 'drawH': round(D.height / SCALE), 'note': 'card picture' if MODE == 'card' else 'top edge on the landing top line'}}))
