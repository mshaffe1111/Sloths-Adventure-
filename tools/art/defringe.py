#!/usr/bin/env python3
"""
Defringe cut-out sheets once, for the whole pipeline (polish-clean, 2026-10-29; Matt: "seams and that extra cleanness").

A cut-out's soft edge keeps colour from what it was cut off: a light halo where it was keyed off white or a light ground, and magenta
where it was keyed off the magenta screen. Each contaminated edge pixel gets the colour of the nearest clean paint inside it; its
alpha is kept, so the shape and the anti-aliasing stay as they were. The painted dark outline is left alone: only edge pixels that are
lighter than the paint just inside them (a halo) or key-coloured where the paint inside is not (spill) are touched.

  python3 tools/art/defringe.py FILE [FILE ...] [--write] [--preview DIR] [--halo 34] [--quality 92]

Without --write it only reports what it would change (and writes before/after previews to --preview). The seam detector (seams.py)
measures the same faults; run the stage walk after a change.
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def lum(c):
    return c[..., 0] * 0.299 + c[..., 1] * 0.587 + c[..., 2] * 0.114


def magenta(c):
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    # (dark too: the keyer tints the painted outline itself purple)
    # (the key's own hue: red and blue near equal and green well under both; a pink petal has far more green than this)
    return (r - g > 30) & (b - g > 25) & (np.abs(r - b) < 0.5 * np.maximum(r, b)) & (g < 0.55 * np.minimum(r, b))


def green(c):
    # the green screen's spill: a pure, bright green the painting itself does not use
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    return (g > 120) & (g - np.maximum(r, b) > 60) & (r < 120)


def defringe(im, halo=None):
    """returns the fixed RGBA array and the counts of halo and spill pixels changed.

    Spill: an edge pixel (within 6 px of clear) tinted magenta or green where the paint 6+ px inside is not, or shifted toward
    magenta from that paint. It keeps its alpha and its lightness and takes the hue of the paint inside: a dark outline stays a dark
    outline, a pink line under yellow soil goes soil-coloured.
    Thin pieces with no paint 6 px in (web strands, glows, rope, hair) are never touched: what is round them is their own colour.
    Halo (only with halo=N): an edge pixel lighter than the paint just inside it by N or more takes that paint's colour. Off by
    default: on the sheets checked (2026-10-29) the light edges were glows and silk, drawn that way."""
    a = im[..., 3]
    rgb = im[..., :3].copy()
    clear = a < 40
    if clear.sum() < 20:
        return im, 0, 0
    dist = ndi.distance_transform_edt(~clear)
    core6 = (a > 200) & (dist >= 6.0)
    if core6.sum() < 50:
        return im, 0, 0
    d6, (jy, jx) = ndi.distance_transform_edt(~core6, return_indices=True)
    near6 = rgb[jy, jx]
    L = lum(rgb)
    # (no clean paint within 8 px: a thin piece, left alone)
    thick = d6 <= 8.0
    # the paint inside at this pixel's lightness: what the pixel would be without the screen's colour mixed in
    want = np.clip(near6 * (L / np.maximum(lum(near6), 1.0))[..., None], 0, 255)
    dv = rgb - want
    # magenta mixed in: redder and bluer and less green than the paint inside (a pink line under yellow soil, a purple outline)
    # (on the soft edge only: a solid purple leaf beside a fern is paint)
    shift = (dv[..., 0] > 18) & (dv[..., 2] > 10) & (dv[..., 1] < -8) & (a < 230)
    spill_px = (a > 8) & (dist < 6.0) & thick & (((magenta(rgb) | shift) & ~magenta(near6)) | (green(rgb) & ~green(near6)))
    halo_px = np.zeros_like(spill_px)
    if halo:
        core = (a > 200) & (dist >= 3.0)
        _, (iy, ix) = ndi.distance_transform_edt(~core, return_indices=True)
        near = rgb[iy, ix]
        halo_px = (a > 8) & (dist < 3.0) & thick & (L - lum(near) > halo)
        rgb[halo_px] = near[halo_px]
    if not (halo_px.any() or spill_px.any()):
        return im, 0, 0
    # (half the way to grey: where the nearest clean paint is another object, a fern beside a purple leaf, its full colour would
    # put a bright speck on the edge)
    grey = np.repeat(L[..., None], 3, axis=-1)
    m = spill_px & ~halo_px
    rgb[m] = (want * 0.5 + grey * 0.5)[m]
    out = im.copy()
    out[..., :3] = rgb
    return out, int(halo_px.sum()), int(spill_px.sum())


def preview(before, after, path):
    """the worst 120 px of the sheet, before and after, x3, on dark and on grey"""
    d = np.abs(before[..., :3] - after[..., :3]).sum(-1)
    sm = ndi.uniform_filter(d, 61)
    y, x = np.unravel_index(int(sm.argmax()), sm.shape)
    r = 60
    tiles = []
    for im in (before, after):
        c = im[max(0, y - r):y + r, max(0, x - r):x + r]
        al = c[..., 3:4] / 255
        for bg in ((22, 26, 34), (128, 128, 128)):
            t = c[..., :3] * al + np.array(bg, np.float32) * (1 - al)
            tiles.append(Image.fromarray(t.clip(0, 255).astype(np.uint8)).resize((c.shape[1] * 3, c.shape[0] * 3), Image.NEAREST))
    w, h = tiles[0].size
    P = Image.new('RGB', (w * 2 + 6, h * 2 + 6), (0, 0, 0))
    for i, t in enumerate(tiles):
        P.paste(t, ((i % 2) * (w + 6), (i // 2) * (h + 6)))
    P.save(path, quality=90)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('files', nargs='+')
    ap.add_argument('--write', action='store_true')
    ap.add_argument('--preview')
    ap.add_argument('--halo', type=float, default=None, help='also fix light halos this much lighter than the paint inside (off by default)')
    ap.add_argument('--quality', type=int, default=92)
    a = ap.parse_args()
    if a.preview:
        os.makedirs(a.preview, exist_ok=True)
    for f in a.files:
        src = Image.open(f)
        im = np.asarray(src.convert('RGBA')).astype(np.float32)
        out, nh, ns = defringe(im, a.halo)
        print(f'{f}: {nh} halo px, {ns} magenta px')
        if a.preview and nh + ns:
            preview(im, out, os.path.join(a.preview, os.path.basename(f).rsplit('.', 1)[0] + '.jpg'))
        if a.write and nh + ns:
            img = Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')
            if f.endswith('.webp'):
                img.save(f, 'WEBP', quality=a.quality, method=6, exact=True)
            else:
                img.save(f)
            print(f'  wrote {f} ({os.path.getsize(f) // 1024} KiB)')


if __name__ == '__main__':
    sys.exit(main())
