"""1-1's new near strip (art director, 2026-11-06; lead's OK 9:35 AM ET, cap $1). The old near (w1sun2-near = a copy of
w1sunrise-near) is a pile of fallen logs with flat cut ends at Pokey's floor height and two painted mushrooms: through a pit gap they
read as standable ground and as a mushroom in the air (KIT-AUDIT.md L9, 1-1.jpg). This start keeps the strip's own ground band (its
bottom rows, tiled) and lays ROUNDED World 1 pieces on it (bushes, a root arch, mossy rocks, roots: Matt's keeper cuts in
reference/art/cut/), never a flat top, no mushroom, no log end, between two margins of plain ground so the ends tile.
    python3 -I tools/art/near11/starts.py <out dir> <name> <seed> [height %]
"""
import random, sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'tools/art/hfbackdrops'))
from starts import GRADE, MAG  # noqa: E402
from starts2 import feather  # noqa: E402

W, H = 2048, 1104
CUT = ROOT / 'reference/art/cut'
# rounded, never flat-topped (no stump, slab, log end or plank)
PIECES = ['w1-bush-monstera', 'w1-hide-root-arch', 'w1-rock-boulder-moss', 'w1-hide-boulder-cave', 'w1-bush-monstera',
          'w1-rock-arch', 'w1-rock-boulder-moss-big', 'w1-rock-spire']  # (the small moss rocks blur when enlarged; rock-roots and the
# twisted trunk have flat cut tops)


def main(out, name, seed, hp=36):
    rnd = random.Random(seed)
    src = np.asarray(Image.open(ROOT / 'src/assets/backdrops/w1sunrise-near.webp').convert('RGBA')).astype(np.float32)
    sh = src.shape[0]
    k = H / sh
    canvas = np.zeros((H, W, 4), np.float32)
    # the strip's own ground band (its bottom 12%), tiled the full width: the two margins are only this
    g = round(sh * 0.12)
    gb = src[sh - g:sh - round(sh * 0.015)]  # (not the last rows: a dark edge line)
    gs = round(gb.shape[0] * k)
    gim = np.asarray(Image.fromarray(gb.clip(0, 255).astype(np.uint8)).resize((round(gb.shape[1] * k), gs), Image.LANCZOS)).astype(np.float32)
    x = 0
    while x < W:
        x1 = min(x + gim.shape[1], W)
        canvas[H - gs:, x:x1] = gim[:, :x1 - x]
        x = x1
    canvas[H - gs:, :, 3] = 255
    # the row of pieces between the margins, each sunk into the ground band, overlapping, ragged edges
    margin = 260
    names = PIECES[:]
    rnd.shuffle(names)
    names = names * 3  # (cycle until the row reaches the far margin: the old near is full width)
    x = margin
    sink = round(gs * 0.55)
    for n in names:
        if x > W - margin - 80:
            break
        p = np.asarray(Image.open(CUT / f'{n}.png').convert('RGBA')).astype(np.float32)
        th = H * hp / 100 * rnd.uniform(0.55, 1.0)
        s = th / p.shape[0]
        q = np.asarray(Image.fromarray(p.astype(np.uint8)).resize((max(8, round(p.shape[1] * s)), round(th)), Image.LANCZOS)).astype(np.float32)
        q = feather(q, 40, True, True, rnd)
        ph, pw = q.shape[:2]
        if x + pw > W - margin:  # the last piece: shrink it to the room left
            f = (W - margin - x) / pw
            q = np.asarray(Image.fromarray(q.clip(0, 255).astype(np.uint8)).resize((max(8, round(pw * f)), max(8, round(ph * f))), Image.LANCZOS)).astype(np.float32)
            ph, pw = q.shape[:2]
        y1 = H - gs + sink
        y0 = y1 - ph
        reg = canvas[y0:y1, x:x + pw]
        al = q[..., 3:4] / 255
        reg[..., :3] = q[..., :3] * al + reg[..., :3] * (1 - al)
        reg[..., 3:4] = np.maximum(reg[..., 3:4], q[..., 3:4])
        x += round(pw * rnd.uniform(0.7, 0.85))
    # no half-see-through pixels (magenta must never show through paint), nothing floating
    canvas[..., 3] = np.where(canvas[..., 3] > 128, 255, 0)
    lab, n = ndimage.label(canvas[..., 3] > 0)
    grounded = set(np.unique(lab[-max(8, H // 12):])) - {0}
    canvas[..., 3] *= np.isin(lab, list(grounded))
    mul, add = GRADE['dawn']
    rgb = canvas[..., :3] * np.array(mul) + np.array(add)
    al = canvas[..., 3:4] / 255
    rgb = rgb * al + MAG * (1 - al)
    Path(out).mkdir(parents=True, exist_ok=True)
    p = Path(out) / f'start-{name}.webp'
    Image.fromarray(rgb.clip(0, 255).astype(np.uint8)).save(p, quality=92)
    print(p, W, H)


if __name__ == '__main__':
    a = sys.argv[1:]
    main(a[0], a[1], int(a[2]), *(int(v) for v in a[3:4]))
