"""Middle-strip starts with open ground at both ends (art-1-1-sunrise, 2026-11-05). starts2.py lays its first piece hard against x=0 and
can end on a cut piece, so the repaint keeps a tree in a join band and the join cuts it (the old w1sunrise-mid's 268 px cut trunk; all
8 of round M's takes failed cut.py's join check). Here the pieces are laid between two margins of plain ground band, every piece's both
edges ragged, so each end of the start holds only ground and the join falls in a clearing.
    python3 -I tools/art/sunrise11/starts.py <out dir> <name> <src stem> <grade> <seed> [margin px] [grow %]
"""
import random, sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'tools/art/hfbackdrops'))
from starts import GRADE, MAG, pieces  # noqa: E402
from starts2 import crowns, feather  # noqa: E402

W, H = 2048, 1104


def main(out, name, stem, grade, seed, margin=300, grow=100):
    rnd = random.Random(seed)
    src = np.asarray(Image.open(ROOT / f'src/assets/backdrops/{stem}-mid.webp').convert('RGBA')).astype(np.float32)
    src = crowns(src, rnd, 0.0)
    sh = src.shape[0]
    k = H / sh
    ps = pieces(src, 5, rnd)
    rnd.shuffle(ps)
    # lay the pieces in a row at the start's scale, both edges of every piece ragged (no straight cut anywhere)
    row = np.zeros((H, W * 3, 4), np.float32)
    x = 0
    end = 0
    for p in ps:
        # (grow, in percent: taller pieces; the paste-up's own scale left round M2's crowns 100-300 px lower than W1's other mids)
        s = k * rnd.uniform(0.74, 0.88) * grow / 100
        q = np.asarray(Image.fromarray(p.clip(0, 255).astype(np.uint8)).resize((max(8, round(p.shape[1] * s)), round(sh * s)), Image.LANCZOS)).astype(np.float32)
        q = feather(q, 90, True, True, rnd)
        ph, pw = q.shape[:2]
        if ph > H:
            q, ph = q[ph - H:], H
        x1 = min(x + pw, row.shape[1])
        reg = row[H - ph:H, x:x1]
        al = q[:, :x1 - x, 3:4] / 255
        reg[..., :3] = q[:, :x1 - x, :3] * al + reg[..., :3] * (1 - al)
        reg[..., 3:4] = np.maximum(reg[..., 3:4], q[:, :x1 - x, 3:4])
        end = max(end, x1)
        x += round(pw * rnd.uniform(0.72, 0.84))
    row = row[:, :end]
    # squeeze the row into the room between the margins, keeping its height (as starts2 squeezes its row to the start's width)
    inner = W - 2 * margin
    row = np.asarray(Image.fromarray(row.clip(0, 255).astype(np.uint8)).resize((inner, H), Image.LANCZOS)).astype(np.float32)
    canvas = np.zeros((H, W, 4), np.float32)
    # a continuous ground band from the source's own bottom rows under everything, the full width (the two margins are only this)
    g = max(8, round(sh * 0.09))
    gb = src[sh - g:]
    gb = gb[:, gb[..., 3].mean(0) > 200] if (gb[..., 3].mean(0) > 200).sum() > 64 else gb
    gs = round(g * k * 0.8)
    gim = np.asarray(Image.fromarray(gb.clip(0, 255).astype(np.uint8)).resize((max(8, round(gb.shape[1] * k * 0.8)), gs), Image.LANCZOS)).astype(np.float32)
    x = 0
    while x < W:
        x1 = min(x + gim.shape[1], W)
        canvas[H - gs:, x:x1] = gim[:, :x1 - x]
        x = x1
    canvas[H - gs:, :, 3] = 255
    reg = canvas[:, margin:margin + inner]
    al = row[..., 3:4] / 255
    reg[..., :3] = row[..., :3] * al + reg[..., :3] * (1 - al)
    reg[..., 3:4] = np.maximum(reg[..., 3:4], row[..., 3:4])
    lab, n = ndimage.label(canvas[..., 3] > 60)
    grounded = set(np.unique(lab[-max(8, H // 12):])) - {0}
    canvas[..., 3] *= ndimage.binary_dilation(np.isin(lab, list(grounded)), iterations=2)
    mul, add = GRADE[grade]
    rgb = canvas[..., :3] * np.array(mul) + np.array(add)
    al = canvas[..., 3:4] / 255
    rgb = rgb * al + MAG * (1 - al)
    Path(out).mkdir(parents=True, exist_ok=True)
    p = Path(out) / f'start-{name}.webp'
    Image.fromarray(rgb.clip(0, 255).astype(np.uint8)).save(p, quality=92)
    print(p, W, H)


if __name__ == '__main__':
    a = sys.argv[1:]
    main(a[0], a[1], a[2], a[3], int(a[4]), *(int(v) for v in a[5:7]))
