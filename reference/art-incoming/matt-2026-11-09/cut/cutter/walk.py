import numpy as np
def walk_top(alpha):
    """alpha: HxW uint8. Returns (y, x0, x1, flatness) of the longest near-flat run of the top silhouette.
    Protrusions above the surface (mushrooms, tufts) are allowed as short gaps; drops below are not."""
    h, w = alpha.shape
    op = alpha > 128
    has = op.any(0)
    top = np.where(has, op.argmax(0), h).astype(float)
    k = max(3, w // 120) | 1
    pad = np.pad(top, k // 2, mode='edge')
    sm = np.array([np.median(pad[i:i + k]) for i in range(w)])
    tol = max(10.0, 0.04 * h)
    gapmax = max(20, int(0.25 * w))
    best = (0, None)
    cand = np.unique(np.round(sm[has] / 4) * 4)
    for y in cand:
        on = np.abs(sm - y) <= tol
        above = sm < y - tol           # protrusion columns
        run_s = None; gap = 0; last_on = None
        for x in range(w):
            if on[x]:
                if run_s is None: run_s = x
                last_on = x; gap = 0
            elif above[x] and run_s is not None and gap < gapmax:
                gap += 1
            else:
                if run_s is not None:
                    L = last_on - run_s + 1
                    if L > best[0]: best = (L, (y, run_s, last_on))
                run_s = None; gap = 0
        if run_s is not None:
            L = last_on - run_s + 1
            if L > best[0]: best = (L, (y, run_s, last_on))
    if best[1] is None: return None
    y, x0, x1 = best[1]
    seg = sm[x0:x1 + 1]; seg = seg[np.abs(seg - y) <= tol]
    return int(round(np.median(seg))), int(x0), int(x1), round(best[0] / w, 2)
