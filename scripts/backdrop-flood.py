"""Cut a background strip out of a SHADED backdrop (Kling paints a soft gradient sky instead of one flat key colour):
the background is everything connected to the edges that stays close in colour to the sky where it was seeded (many seeds along
the top and the upper sides, so the whole gradient is covered). The watermark in the bottom-right corner is painted out first. Usage:
    python3 scripts/backdrop-flood.py <in> src/assets/backdrops/w<N>-<mid|near|far>.webp <mid|near|far> [tolerance]"""
import sys, cv2, numpy as np

def unmark(im):
    h, w = im.shape[:2]
    x0, y0, x1, y1 = int(0.86 * w), int(0.92 * h), int(0.995 * w), int(0.99 * h)
    roi = im[y0:y1, x0:x1].astype(int)
    mask = np.zeros((h, w), np.uint8)
    mask[y0:y1, x0:x1] = cv2.dilate((roi.min(axis=2) > 150).astype(np.uint8) * 255, np.ones((7, 7), np.uint8))
    return cv2.inpaint(im, mask, 9, cv2.INPAINT_TELEA)

def main(src, dst, kind, tol=40, hue_band=10):
    im = unmark(cv2.imread(src))
    h, w = im.shape[:2]
    nh = 600
    im = cv2.resize(im, (round(w * nh / h), nh), interpolation=cv2.INTER_AREA)
    h, w = im.shape[:2]
    if kind == 'far':
        cv2.imwrite(dst, im, [cv2.IMWRITE_WEBP_QUALITY, 88])
        print(dst, (w, h))
        return
    smooth = cv2.GaussianBlur(im, (5, 5), 0)
    mask = np.zeros((h + 2, w + 2), np.uint8)
    # fixed range: each fill takes only colours close to its own seed, so it cannot creep along a soft edge into the painting
    flags = 4 | cv2.FLOODFILL_MASK_ONLY | cv2.FLOODFILL_FIXED_RANGE | (255 << 8)
    # seed along the whole top edge, and down the sides through the top half
    seeds = [(x, 0) for x in range(0, w, 6)] + [(0, y) for y in range(0, h // 2, 6)] + [(w - 1, y) for y in range(0, h // 2, 6)]
    for (x, y) in seeds:
        if mask[y + 1, x + 1]:
            continue
        cv2.floodFill(smooth, mask, (x, y), 0, (tol,) * 3, (tol,) * 3, flags)
    bg = mask[1:-1, 1:-1] > 0
    # pockets of sky the fill cannot reach (between two rocks): anything of the sky's own hue and strength is sky too. This only works
    # because the sky's hue is one the painting does not use (teal behind a volcano); pass hue=0 to skip it
    if hue_band:
        sky_hue = np.median(cv2.cvtColor(im, cv2.COLOR_BGR2HSV)[bg][:, 0]) if bg.any() else None
        if sky_hue is not None:
            hsv = cv2.cvtColor(smooth, cv2.COLOR_BGR2HSV).astype(int)
            near_hue = np.abs(hsv[..., 0] - sky_hue) <= hue_band
            bg |= near_hue & (hsv[..., 1] > 90) & (hsv[..., 2] > 70)
    # close pinholes, then a soft one-pixel edge
    bg = cv2.morphologyEx(bg.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)) > 0
    alpha = cv2.GaussianBlur((~bg).astype(np.float32), (3, 3), 0)
    # take the sky's tint back out of the edge pixels
    sky = np.median(im[bg].reshape(-1, 3), axis=0) if bg.any() else np.zeros(3)
    edge = (alpha > 0) & (alpha < 1)
    out = im.astype(np.float32)
    a3 = alpha[..., None]
    fixed = np.clip((out - (1 - a3) * sky) / np.maximum(a3, 0.05), 0, 255)
    out[edge] = fixed[edge]
    rgba = np.dstack([out.astype(np.uint8), (alpha * 255).astype(np.uint8)])
    cv2.imwrite(dst, rgba, [cv2.IMWRITE_WEBP_QUALITY, 88])
    print(dst, (w, h), 'background', round(bg.mean() * 100), '%')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]) if len(sys.argv) > 4 else 40, int(sys.argv[5]) if len(sys.argv) > 5 else 10)
