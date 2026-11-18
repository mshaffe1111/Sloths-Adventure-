"""ENG-25: the picked take (snap-s50-11) -> the shipped snap stone sheet src/assets/w2-1118/w2-snapstone.webp. Re-runnable from the kept take.

    python3 -I tools/art/hf25/ship.py <take.webp>

All four frames are built from the take's widest cell (OPEN-3) so the lid, the stone he stands on, is the SAME pixels in every frame (the
take's own cells drift 5-6 levels on the lid, a shimmer at each count; its OPEN-1 cell had closed to a crack): the lid stays, the jaw (its
ridges and lip) rises a notch a frame, the mouth between is the take's own dark stone. Key: the magenta joined to the cell's border; soft
1 px rim; spill pulled back. Frames: SHUT, OPEN-1, OPEN-2, OPEN-3 left to right, each FW x FH, the walk line WALK px from each frame's top.
"""
import sys
from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image

take = Image.open(sys.argv[1]).convert('RGB')
cell = np.asarray(take.crop((3 * 448, 0, 4 * 448, 320))).astype(np.float32)
H, W, _ = cell.shape
R, G, B = cell[..., 0], cell[..., 1], cell[..., 2]
strong = (np.minimum(R, B) - G > 70) & (R > 140) & (B > 140)
bg = np.zeros((H, W), bool)
q = deque((y, x) for y in range(H) for x in (0, W - 1)) ; q.extend((y, x) for x in range(W) for y in (0, H - 1))
while q:
    y, x = q.popleft()
    if bg[y, x] or not strong[y, x]:
        continue
    bg[y, x] = True
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        yy, xx = y + dy, x + dx
        if 0 <= yy < H and 0 <= xx < W and not bg[yy, xx]:
            q.append((yy, xx))
alpha = np.where(bg, 0.0, 1.0)
# soft rim: a pixel next to the background keeps alpha by how little magenta it holds
spill = np.clip((np.minimum(R, B) - G) / 120.0, 0, 1)
edge = (~bg) & (np.roll(bg, 1, 0) | np.roll(bg, -1, 0) | np.roll(bg, 1, 1) | np.roll(bg, -1, 1))
alpha[edge] = 1 - spill[edge] * 0.8
rgb = cell.copy()
m = (~bg) & (np.minimum(R, B) > G)
rgb[..., 0][m] = np.minimum(R[m], G[m] + (R[m] - np.minimum(R[m], B[m])))
rgb[..., 2][m] = np.minimum(B[m], G[m] + (B[m] - np.minimum(R[m], B[m])))
rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)

# the take's geometry (the start's: tools/art/hf25/starts.py, kept by img2img at s50; measured on this cell): the lid's lip ink at 152-156,
# the jaw's lip ink at 203, the upper ridges 156-178 hanging from the lid, the lower 178-203 rising from the jaw
LIP, JAW_LIP, UP_END = 156, 203, 178
lum = cell.mean(2)
dark = lum < 62
lid = rgba.copy(); lid[LIP:] = 0
# (the lid's band under its lip: the upper ridges and the dark mouth between them, drawn OVER the jaw, clipped to each frame's opening:
# a small opening is a dark slot with the ridge tips in it; at OPEN-3 it is the take's own cell)
up = rgba.copy(); up[:LIP] = 0; up[UP_END:] = 0
jaw = rgba.copy(); jaw[:UP_END] = 0
# (the jaw's lip ink lands on the lid's lip ink when shut: one closed seam)
SHIFT = {'shut': JAW_LIP - LIP - 1, 'open1': 31, 'open2': 16, 'open3': 0}


def over(dst, src):
    a = src[..., 3:4] / 255.0
    dst[..., :3] = src[..., :3] * a + dst[..., :3] * (1 - a)
    dst[..., 3:4] = np.maximum(dst[..., 3:4], src[..., 3:4])


def frame(s):
    f = np.zeros((H, W, 4), np.float32)
    j = np.zeros_like(f); j[:H - s] = jaw[s:]
    over(f, j)
    band = up.astype(np.float32).copy(); band[max(LIP, JAW_LIP - s - 3):] = 0
    over(f, band)
    over(f, lid.astype(np.float32))
    return f


frames = [frame(SHIFT[k]) for k in ('shut', 'open1', 'open2', 'open3')]
# crop every frame to one box: the union of their pieces, so the lid and the walk line sit at the same place in each
a = np.maximum.reduce([fr[..., 3] for fr in frames]) > 8
ys, xs = np.where(a)
y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
TOP = 78  # the start's flat top (starts.py TOP): the walk line, under the moss
FW = 240  # ship: 3x its 80 u on screen (2-5.md: ships 80 px wide), so a 3x phone stays sharp
k = FW / (x1 - x0)
FH = round((y1 - y0) * k)
WALK = round((TOP - y0) * k)
sheet = Image.new('RGBA', (FW * 4, FH), (0, 0, 0, 0))
for i, fr in enumerate(frames):
    im = Image.fromarray(fr[y0:y1, x0:x1].clip(0, 255).astype(np.uint8), 'RGBA').resize((FW, FH), Image.LANCZOS)
    sheet.paste(im, (i * FW, 0))
out = Path('src/assets/w2-1118/w2-snapstone.webp')
sheet.save(out, 'WEBP', quality=90, method=6)
print(f'{out} {sheet.size[0]}x{sheet.size[1]} frame {FW}x{FH} walk_y {WALK} bytes {out.stat().st_size} (cell box x {x0}-{x1} y {y0}-{y1})')
