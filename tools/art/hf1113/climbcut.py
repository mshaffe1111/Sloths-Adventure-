"""ART 11-13 (R-165.178): cut Pokey's two-hand climb frames out of the edits (grey ground, two olive vines).

    python3 -I tools/art/hf1113/climbcut.py <edit png> <out png>   -> prints the frame's grips as JSON

1. Vines: the olive/green columns (hue 50-110 deg, saturated) found per column across the whole picture: their centres are the grips' x.
2. Ground: pixels near flat grey, flood-filled from the border, go clear; then every vine pixel goes clear (the game draws its own vine
   behind his paws, as hero-rope's rope was cut away). Pokey has no green: his fur, wraps, satchel and face are warm.
3. The largest piece kept (no specks), a 1 px soft rim, colour under clear pixels zeroed (smaller file).
Grips: for each vine, the topmost run of his pixels inside the vine's band in the upper half = where that paw closes on it.
"""
import json, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def cut(src, dst):
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.int16)
    H, W, _ = im.shape
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    mx, mn = im.max(-1), im.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1)
    # hue in degrees
    rf, gf, bf = r / 255, g / 255, b / 255
    d = np.maximum((mx - mn) / 255, 1e-6)
    hue = np.where(mx == r, 60 * (((gf - bf) / d) % 6), np.where(mx == g, 60 * ((bf - rf) / d + 2), 60 * ((rf - gf) / d + 4)))
    green = (hue > 48) & (hue < 115) & (sat > 0.28) & (mx > 40)
    colfrac = green.mean(0)
    cols = colfrac > 0.25
    lab, n = ndi.label(cols)
    vines = []
    for k in range(1, n + 1):
        xs = np.where(lab == k)[0]
        if len(xs) > 12:
            vines.append((int(xs.min()), int(xs.max())))
    grey = (np.abs(im - 128).max(-1) < 26) & (sat < 0.12)
    bg_l, _ = ndi.label(grey)
    border = set(np.unique(np.concatenate([bg_l[0], bg_l[-1], bg_l[:, 0], bg_l[:, -1]]))) - {0}
    bg = np.isin(bg_l, list(border))
    vine_px = np.zeros_like(green)
    for x0, x1 in vines:
        band = np.zeros_like(green); band[:, max(0, x0 - 6):x1 + 7] = True
        vine_px |= band & (green | (sat < 0.5) & (hue > 40) & (hue < 120) & (mx < 140))
    keep = ~(bg | vine_px)
    keep = ndi.binary_opening(keep, iterations=1)
    lab2, n2 = ndi.label(keep)
    if n2 == 0:
        raise SystemExit('nothing kept')
    sizes = ndi.sum(keep, lab2, range(1, n2 + 1))
    body = lab2 == (1 + int(np.argmax(sizes)))
    # the claws that curl round the far side of a vine come apart from him once the vine is keyed out: keep every piece of some size
    # that lies within a vine's width of his body
    vw = max([x1 - x0 + 1 for x0, x1 in vines] or [10])
    near = ndi.binary_dilation(body, iterations=vw + 6)
    minpx = max(12, H * W // 40000)
    for k in range(1, n2 + 1):
        if sizes[k - 1] >= minpx and k != 1 + int(np.argmax(sizes)) and (near & (lab2 == k)).any():
            body |= lab2 == k
    body = ndi.binary_fill_holes(body) & ~bg | body
    alpha = ndi.gaussian_filter(body.astype(np.float32), 0.6)
    alpha = np.where(body, np.maximum(alpha, 0.5), alpha * 0.0)
    a8 = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    rgba = np.dstack([im.astype(np.uint8), a8])
    rgba[a8 == 0, :3] = 0
    ys, xs = np.where(a8 > 0)
    box = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    out = Image.fromarray(rgba, 'RGBA').crop(box)
    out.save(dst, optimize=True)
    grips = []
    for x0, x1 in vines:
        cx = (x0 + x1) / 2
        sub = body[: H // 2, x0:x1 + 1]
        rows = np.where(sub.mean(1) > 0.2)[0]
        gy = float(rows[:max(1, len(rows) // 4)].mean()) if len(rows) else None
        grips.append({'x': round(cx - box[0], 1), 'y': None if gy is None else round(gy - box[1], 1), 'vine_w': x1 - x0 + 1})
    info = {'src': str(src), 'w': out.width, 'h': out.height, 'box': box, 'vines_x': [(a + b) / 2 for a, b in vines], 'grips': grips}
    print(json.dumps(info))
    return info


if __name__ == '__main__':
    cut(sys.argv[1], sys.argv[2])
