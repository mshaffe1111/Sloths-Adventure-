"""
Measurements the cutters take from a frame's alpha mask, shared by cutMeeca.py and cutPokeyStory.py.

  head_x(alpha)        x of the middle of the head (the centre of the biggest round blob in the upper half). A walk or a run is lined up on this, so the body
                       travels smoothly and the feet swing under it.
  planted_foot(alpha)  where the foot that is on the ground is, relative to the head: the number the story's gait uses to keep a stance foot still on the
                       ground (see storyActors.ts "gait"). The lowest foot is the planted one; two feet at the same height (a silhouette cannot say which
                       one the weight is on) count as the front one, the foot that has just landed.
"""
import cv2
import numpy as np
from scipy import ndimage as ndi


def head_x(alpha):
    m = (alpha > 128).astype(np.uint8)
    ys, xs = np.where(m > 0)
    y0, y1 = ys.min(), ys.max()
    dt = cv2.distanceTransform(m, cv2.DIST_L2, 5)
    dt[y0 + int((y1 - y0) * 0.5):] = 0
    cy, cx = np.unravel_index(np.argmax(dt), dt.shape)
    return float(cx)


def feet(alpha, band=0.13):
    """[(x centre, lift above the lowest solid row, area)] of the blobs in the bottom `band` of the figure, left to right. A blob smaller than 0.28% of the
    figure's height squared (a stray toe, a raised fingertip) is not a foot."""
    m = alpha > 128
    ys, xs = np.where(m)
    y0, y1 = ys.min(), ys.max()
    h = y1 - y0 + 1
    low = m.copy()
    low[: y1 - int(band * h)] = False
    lb, n = ndi.label(low)
    need = 0.0028 * h * h
    out = []
    for k in range(1, n + 1):
        yy, xx = np.where(lb == k)
        if len(yy) < need:
            continue
        out.append((float(xx.mean()), int(y1 - yy.max()), len(yy)))
    out.sort()
    return out


def planted_foot(alpha, prefer='front', tol=2):
    """(fx, lift): x of the foot on the ground relative to the head centre, and how far it is above the lowest solid row (0 = flat on the ground).
    A foot within `tol` px of the lowest counts as on the ground too (resampling moves a foot a pixel); when both are, `prefer` ('front' | 'rear') decides."""
    hx = head_x(alpha)
    fs = feet(alpha)
    if not fs:
        return 0.0, 0
    low = min(f[1] for f in fs)
    on = [f for f in fs if f[1] <= low + tol]
    best = max(on, key=lambda f: f[0]) if prefer == 'front' else min(on, key=lambda f: f[0])
    return best[0] - hx, best[1]
