"""Prove the edge fix leaves the painting alone (the lead, 2026-10-29): changed pixels in red over the strip, and the share of interior
pixels (more than BAND px inside the painting) that changed.

    python3 -I tools/art/edges/diffmask.py <before.webp> <after.webp> <out.jpg> [band px, default 4] [top share left out, e.g. 0.07]

A pixel counts as changed when any channel (alpha included) moved by more than 6 (WebP noise at q90-95 is about 1-4). Prints the
interior share changed and the edge band share changed."""
import sys

import numpy as np
from PIL import Image
from scipy import ndimage


def diff(before, after, band=4.0, skip_top=0.0):
    a = np.asarray(Image.open(before).convert('RGBA')).astype(np.int16)
    b = np.asarray(Image.open(after).convert('RGBA')).astype(np.int16)
    assert a.shape == b.shape, (a.shape, b.shape)
    vis = (a[..., 3] > 0) | (b[..., 3] > 0)
    ch = (np.abs(a - b).max(-1) > 6) & vis
    din = ndimage.distance_transform_edt(a[..., 3] >= 128)
    inner = din > band
    # (the top rows a middle strip fades out on purpose, run_all.py TOPFADE, are left out of the count)
    inner[: int(round(a.shape[0] * skip_top))] = False
    edge = vis & ~inner
    return a, b, ch, inner, edge


if __name__ == '__main__':
    before, after, out = sys.argv[1:4]
    band = float(sys.argv[4]) if len(sys.argv) > 4 else 4.0
    skip = float(sys.argv[5]) if len(sys.argv) > 5 else 0.0
    a, b, ch, inner, edge = diff(before, after, band, skip)
    si = ch[inner].mean() if inner.any() else 0.0
    se = ch[edge].mean() if edge.any() else 0.0
    # the strip on mid-grey, changed pixels red
    al = b[..., 3:4] / 255
    img = b[..., :3] * al + 128 * (1 - al)
    img[ch] = img[ch] * 0.3 + np.array([255, 0, 0]) * 0.7
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    im.thumbnail((2400, 2400), Image.LANCZOS)
    im.save(out, quality=85)
    print(f'{before.rsplit("/", 1)[-1]:24s} interior changed {si * 100:5.2f}%   edge band changed {se * 100:5.1f}%')
