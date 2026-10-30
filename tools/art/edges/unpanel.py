"""Cut the unkeyed background panels out of World 5's dusk B near strip (w5dusk2-near; polish report VI-6, the lead 2026-10-29).

Gemini painted that strip (Hugging Face mshaffe111/slothadv-w5art raw/w5g-dusk-near-11.png) with background trees and a pink sunset
sky down both sides of the green key; the first cut only faded their tops out, so a see-through pink-and-purple panel hung over the
middle and far layers on the left and right. Here everything above the ground line (drawn by hand along the top of the moss) that is
background goes: background = the regions between ink lines that reach the faded top (the sky, the far trunks), with the ink lines
that bound only them. What stays above the ground: the shapes the ink closes off (orchids, buds, petals, their leaves), and the moss
and leaves grown up from the ground.

    used by run_all.py on the pinned source; on its own: python3 -I tools/art/edges/unpanel.py <src> <dst.png>"""
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

# the ground line (top of the moss), x -> y on the 2048x868 strip, in the two side zones; the middle was keyed cleanly
GROUND = [(0, 640), (100, 640), (200, 640), (300, 650), (400, 655), (520, 660), (1350, 660), (1500, 655), (1600, 645), (1650, 638),
          (1700, 628), (1750, 610), (1800, 590), (1850, 556), (1900, 516), (1950, 492), (2000, 462), (2048, 448)]
ZONES = [(0, 520), (1350, 2048)]


def unpanel(rgba):
    H, W = rgba.shape[:2]
    k = W / 2048
    rgb = rgba[..., :3].astype(np.float32)
    a = rgba[..., 3].astype(np.float32)
    xs = np.arange(W)
    gy = np.interp(xs / k, [p[0] for p in GROUND], [p[1] for p in GROUND]) * (H / 868)
    yy = np.arange(H)[:, None]
    zone = np.zeros(W, bool)
    for x0, x1 in ZONES:
        zone[round(x0 * k):round(x1 * k)] = True
    above = (yy < gy[None, :]) & zone[None, :]
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    ink = lum < 70
    free = above & ~ink & (a > 0)
    lab, n = ndimage.label(free)
    # a region that reaches the faded top (or is half see-through anywhere) is background
    faded = above & (a < 200)
    bg_ids = np.unique(lab[faded & free])
    bg = np.isin(lab, bg_ids[bg_ids > 0])
    # orchid petals (white, or orchid pink: red and blue both high and close, unlike the salmon sky) are never background, even
    # where a gap in their ink lets the sky's region in
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    petal = above & (a > 200) & (((rgb.min(-1) > 165) & (rgb.max(-1) - rgb.min(-1) < 60)) |
                                 ((r > 190) & (b > g + 25) & (np.abs(r - b) < 60)))
    plab, pn = ndimage.label(petal)
    keep_ids = []
    for i, sl in enumerate(ndimage.find_objects(plab), 1):
        comp = plab[sl] == i
        if comp.sum() < 60:
            continue
        # a petal is drawn: ink runs along its edge (a streak of sunset sky has none)
        ring = ndimage.binary_dilation(np.pad(comp, 3), iterations=3) & ~np.pad(comp, 3)
        if np.pad(ink[sl], 3)[ring].mean() > 0.15:
            keep_ids.append(i)
    petal = np.isin(plab, keep_ids)
    bg &= ~petal
    # an ink-closed region of the far trunks' purple (or the sky's salmon) is background too: nothing in front is those colours
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        comp = lab[sl] == i
        if comp.sum() < 150 or (petal[sl] & comp).any():
            continue
        m = rgb[sl][comp].mean(0)
        if m[2] > m[1] + 12 and m[0] > m[1]:
            bg[sl] |= comp
    keep_fg = free & ~bg
    # moss and leaves grown up from the ground: green, connected to the ground through green
    green = (g > r) & (g > b + 6) & (a > 128)  # (moss, leaves and the olive orchid stems)
    ground = ~above
    glab, _ = ndimage.label(green | (ground & (a > 128)))
    grown = np.isin(glab, np.unique(glab[ground & (a > 128)])) & green & above
    kept = keep_fg | grown | petal
    # ink lines stay where they bound something kept
    ink_kept = above & ink & ndimage.binary_dilation(kept, iterations=4)
    keep = ~above | kept | ink_kept
    # a white flower whose stem went with the background would float: it goes too (pink falling petals float on purpose)
    white = above & (rgb.min(-1) > 165) & keep
    reach, _ = ndimage.label(ndimage.binary_dilation(keep & (a > 128), iterations=2))
    rooted = np.isin(reach, np.unique(reach[~above & (a > 128)]))
    wl, wn = ndimage.label(white)
    for i, sl in enumerate(ndimage.find_objects(wl), 1):
        comp = wl[sl] == i
        if not (rooted[sl] & comp).any():
            keep[sl] &= ~ndimage.binary_dilation(comp, iterations=4)
    # and crumbs of ink left in the air (a falling petal, pink and over 60 px, stays)
    cl, cn = ndimage.label(keep & above)
    for i, sl in enumerate(ndimage.find_objects(cl), 1):
        comp = cl[sl] == i
        if comp.sum() < 150 and not (rooted[sl] & comp).any() and not (petal[sl] & comp).any():
            keep[sl] &= ~comp
    keep = ndimage.binary_opening(keep, iterations=1) | ~above  # no lone crumbs of the old panel
    soft = ndimage.gaussian_filter(keep.astype(np.float32), 0.7)
    out = rgba.copy()
    out[..., 3] = np.round(a * np.where(above, keep * soft, 1)).astype(np.uint8)  # (soft: the new cut anti-aliased)
    return out


if __name__ == '__main__':
    src = np.asarray(Image.open(sys.argv[1]).convert('RGBA'))
    Image.fromarray(unpanel(src), 'RGBA').save(sys.argv[2])
