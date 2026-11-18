"""stripjoin: a painted backdrop strip's wrap join (INT-9, the lead's ruling 11-14 3:59 PM ET).

A strip is drawn end to end (scenery.ts drawFitted), so its right edge stands against its own left edge. A strip whose painting is cut
by one border while the other border is clear sky shows that cut as a hard vertical edge in play: w1kapok-mid (1-7, 1-9) cut its kapok
canopy at its right border, and under the mid haze veil it read as a pale block with a hard right side (INT-9's stills, beat 3).

  python3 -I tools/art/stripjoin.py measure <strip.webp> ...        the share of rows CUT at the join (paint at one end, clear at the other)
  python3 -I tools/art/stripjoin.py feather <strip.webp> <out.webp> [band px]
      fades the cut rows' paint to nothing over the last `band` px before the border that cuts it (smoothstep; rows feathered so no row
      step shows). Rows opaque at BOTH ends (painting that carries on across the join, e.g. the ground line) are left exactly as they are.
"""
import sys
import numpy as np
from PIL import Image

OPAQUE, CLEAR = 200, 40


def cut_rows(al):
    """rows whose paint (any that shows: alpha over CLEAR, a soft canopy top too) stops at one border while the other border is clear"""
    return ((al[:, -1] > CLEAR) & (al[:, 0] < CLEAR)), ((al[:, 0] > CLEAR) & (al[:, -1] < CLEAR))


def measure(path):
    al = np.asarray(Image.open(path).convert('RGBA'))[..., 3].astype(np.float32)
    r, l = cut_rows(al)
    return float((r | l).mean() * 100)


def row_mask(rows, H, grow=16, soft=10):
    """the cut rows, grown a little and softened, so the fade has no stair at its top and bottom"""
    m = rows.astype(np.float32)
    k = np.ones(2 * grow + 1, np.float32)
    m = np.clip(np.convolve(m, k, mode='same'), 0, 1)
    g = np.exp(-0.5 * (np.arange(-3 * soft, 3 * soft + 1) / soft) ** 2)
    m = np.convolve(m, g / g.sum(), mode='same')
    return np.clip(m, 0, 1)


def feather(src, out, band=420):
    im = Image.open(src).convert('RGBA')
    a = np.asarray(im).astype(np.float32)
    H, W = a.shape[:2]
    al = a[..., 3]
    r, l = cut_rows(al)
    # (never touch a row that carries on across the join)
    both = (al[:, -1] > OPAQUE) & (al[:, 0] > OPAQUE)
    t = np.linspace(0, 1, band, dtype=np.float32)
    s = t * t * (3 - 2 * t)  # 0 at the border, 1 a band in
    for rows, right in ((r, True), (l, False)):
        if not rows.any():
            continue
        m = row_mask(rows, H) * (~both)
        ramp = s[::-1] if right else s  # right: 1 -> 0 toward the border
        k = 1 - m[:, None] * (1 - ramp[None, :])
        if right:
            al[:, W - band:] *= k
        else:
            al[:, :band] *= k
    a[..., 3] = al
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA').save(out, 'WEBP', quality=82, method=6)


if __name__ == '__main__':
    if sys.argv[1] == 'measure':
        for p in sys.argv[2:]:
            print(f'{measure(p):5.1f}% of rows cut at the join  {p}')
    elif sys.argv[1] == 'feather':
        feather(sys.argv[2], sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else 420)
        print('before', f'{measure(sys.argv[2]):.1f}%', 'after', f'{measure(sys.argv[3]):.1f}%')
    else:
        sys.exit(__doc__)
