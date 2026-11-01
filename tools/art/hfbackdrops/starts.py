"""Starts for the new middle and near strips (hf-backdrops, 2026-10-31). Text to image on magenta does not keep the key (the pilot
painted a sky, rain and clouds behind the trees), so each new strip is img2img from a paste-up of the world's own painted strip: cut at
its thinnest columns into pieces, the pieces put in a new order at new sizes (feet on one ground line), graded to the light of the
stages it will play behind, on flat magenta. The repaint (make_spec.py) then turns them into new landmarks in the same paint.
    python3 -I tools/art/hfbackdrops/starts.py <out dir> <name> <world> <mid|near> <grade> <seed> [W H]
grades: day, dawn, dusk, night, cave, storm, ember
"""
import random, sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
MAG = np.array([255, 0, 255], np.float32)
GRADE = {  # multiply, add (0-255)
    'day': ((1, 1, 1), (0, 0, 0)), 'dawn': ((1.0, 0.9, 0.86), (18, 6, 4)), 'dusk': ((0.78, 0.74, 0.86), (10, 4, 12)),
    'night': ((0.55, 0.62, 0.85), (0, 4, 16)), 'cave': ((0.6, 0.78, 0.8), (0, 6, 8)), 'storm': ((0.72, 0.78, 0.9), (4, 6, 14)),
    'ember': ((1.0, 0.8, 0.7), (16, 2, 0)),
}


def pieces(a, n, rnd):
    """cut the strip at its n-1 thinnest columns (coverage above the ground band), at least W/(2n) apart"""
    H, W = a.shape[:2]
    cov = (a[:int(H * 0.8), :, 3] > 40).sum(0).astype(float)
    cov = np.convolve(cov, np.ones(31) / 31, 'same')
    cuts = []
    for x in np.argsort(cov):
        if all(abs(x - c) > W / (2 * n) for c in cuts) and W * 0.05 < x < W * 0.95:
            cuts.append(int(x))
        if len(cuts) == n - 1:
            break
    cuts = [0] + sorted(cuts) + [W]
    return [a[:, cuts[i]:cuts[i + 1]] for i in range(len(cuts) - 1)]


def main(out, name, world, part, grade, seed, W=2048, H=None):
    rnd = random.Random(seed)
    src = np.asarray(Image.open(ROOT / f'src/assets/backdrops/w{world}-{part}.webp').convert('RGBA')).astype(np.float32)
    sh, sw = src.shape[:2]
    H = H or round(W * sh / sw) // 16 * 16
    k = H / sh
    # the strips' crowns run off their top edge (cut flat, or faded): round each run of top-touching columns off into a dome, so
    # the repaint finishes the crown instead of keeping a straight cut
    top = src[:24, :, 3].max(0) > 40
    x = 0
    while x < sw:
        if top[x]:
            e = x
            while e < sw and top[e]:
                e += 1
            w = e - x
            dome = round(min(0.22 * sh, 0.45 * w))
            for c in range(x, e):
                u = (c - x + 0.5) / w * 2 - 1
                cut = round(dome * (1 - (1 - u * u) ** 0.5)) + 24
                src[:cut, c, 3] = 0
            x = e
        else:
            x += 1
    ps = pieces(src, 5, rnd)
    rnd.shuffle(ps)
    canvas = np.zeros((H, W + 400, 4), np.float32)
    x = 0
    for p in ps:
        s = k * rnd.uniform(0.7, 0.86)
        im = Image.fromarray(p.astype(np.uint8)).resize((max(8, round(p.shape[1] * s)), round(sh * s)), Image.LANCZOS)
        q = np.asarray(im).astype(np.float32)
        ph, pw = q.shape[:2]
        if ph > H:  # (a piece taller than the canvas loses its top, never its feet)
            q, ph = q[ph - H:], H
        y0 = H - ph  # the ground line stays at the bottom
        x1 = min(x + pw, canvas.shape[1])
        reg = canvas[y0:H, x:x1]
        al = q[:, :x1 - x, 3:4] / 255
        reg[..., :3] = q[:, :x1 - x, :3] * al + reg[..., :3] * (1 - al)
        reg[..., 3:4] = np.maximum(reg[..., 3:4], q[:, :x1 - x, 3:4])
        x += round(pw * rnd.uniform(0.84, 0.95))
    # nothing may float: keep only the painted shapes joined to the ground band (pilot 2: a cut-off crown or a loose hanging piece
    # came back from the repaint as a floating root, an upside-down palm, a creature-like plant)
    from scipy import ndimage
    lab, n = ndimage.label(canvas[..., 3] > 60)
    grounded = set(np.unique(lab[-max(8, H // 12):])) - {0}
    keep = np.isin(lab, list(grounded))
    canvas[..., 3] *= ndimage.binary_dilation(keep, iterations=2)
    # fit the laid row to the width
    row = Image.fromarray(canvas[:, :max(x, 64)].clip(0, 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)
    a = np.asarray(row).astype(np.float32)
    mul, add = GRADE[grade]
    rgb = a[..., :3] * np.array(mul) + np.array(add)
    al = a[..., 3:4] / 255
    rgb = rgb * al + MAG * (1 - al)
    Path(out).mkdir(parents=True, exist_ok=True)
    p = Path(out) / f'start-{name}.webp'
    Image.fromarray(rgb.clip(0, 255).astype(np.uint8)).save(p, quality=92)
    print(p, W, H)


if __name__ == '__main__':
    a = sys.argv[1:]
    main(a[0], a[1], int(a[2]), a[3], a[4], int(a[5]), *(int(v) for v in a[6:8]))
