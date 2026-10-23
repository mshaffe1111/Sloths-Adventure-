"""Cut an item picture (painted on parchment) out of its background for use as an in-world pickup: flood the parchment from the edges,
feather the edge, trim, and save a small transparent webp. Usage: python3 scripts/item-cutout.py <in.webp> <out.webp> [size] [tol] [holes]
(holes: also clear parchment shut inside the picture, like the loops of a chain; only for pictures with no parchment-coloured parts)"""
import sys, numpy as np, cv2
from PIL import Image

def main(src, dst, size=96, tol=26, holes=False):
    rgb = np.asarray(Image.open(src).convert('RGB'))
    H, W, _ = rgb.shape
    blur = cv2.GaussianBlur(rgb, (5, 5), 0)
    mask = np.zeros((H + 2, W + 2), np.uint8)
    flags = 4 | cv2.FLOODFILL_MASK_ONLY | cv2.FLOODFILL_FIXED_RANGE | (255 << 8)
    img = blur.copy()
    for x in range(0, W, 16):
        for y in (1, H - 2):
            if mask[y + 1, x + 1] == 0:
                cv2.floodFill(img, mask, (x, y), 0, (tol, tol, tol), (tol, tol, tol), flags)
    for y in range(0, H, 16):
        for x in (1, W - 2):
            if mask[y + 1, x + 1] == 0:
                cv2.floodFill(img, mask, (x, y), 0, (tol, tol, tol), (tol, tol, tol), flags)
    bg = mask[1:-1, 1:-1] > 0
    # the parchment is lighter toward the middle than at its edges, so the flood stops short of it in places: GrabCut learns the
    # parchment's colours from what the flood did reach and takes the rest
    gc = np.where(bg, cv2.GC_BGD, cv2.GC_PR_FGD).astype(np.uint8)
    bgm, fgm = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), gc, None, bgm, fgm, 6, cv2.GC_INIT_WITH_MASK)
    bg = (gc == cv2.GC_BGD) | (gc == cv2.GC_PR_BGD)
    fg = (~bg).astype(np.uint8) * 255
    # keep the biggest piece (and anything touching it), drop specks
    n, lab, stats, _ = cv2.connectedComponentsWithStats(fg, 8)
    if n > 1:
        big = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        keep = np.zeros_like(fg)
        for i in range(1, n):
            if i == big or stats[i, cv2.CC_STAT_AREA] > 0.04 * stats[big, cv2.CC_STAT_AREA]:
                keep[lab == i] = 255
        fg = keep
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    # parchment caught inside the picture (the loops of a chain, a corner the flood could not reach): regions close to the
    # parchment's own colour, measured on the parchment next to them
    par = np.median(blur[bg], axis=0) if holes else None
    near = (np.abs(blur.astype(int) - par).sum(axis=-1) < 30).astype(np.uint8) * (fg > 0) if holes else np.zeros_like(fg)
    n2, lab2, st2, _ = cv2.connectedComponentsWithStats(near, 4)
    for i in range(1, n2):
        if st2[i, cv2.CC_STAT_AREA] > 120:
            fg[lab2 == i] = 0
    alpha = cv2.GaussianBlur(cv2.erode(fg, np.ones((3, 3), np.uint8)), (3, 3), 0)
    ys, xs = np.where(alpha > 10)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    out = Image.fromarray(np.dstack([rgb, alpha])[y0:y1, x0:x1], 'RGBA')
    k = size / max(out.size)
    out = out.resize((max(1, round(out.width * k)), max(1, round(out.height * k))), Image.LANCZOS)
    out.save(dst, 'WEBP', quality=90, method=6)
    print(dst, out.size)

if __name__ == '__main__':
    a = sys.argv
    main(a[1], a[2], int(a[3]) if len(a) > 3 else 96, int(a[4]) if len(a) > 4 else 26, len(a) > 5 and a[5] == 'holes')
