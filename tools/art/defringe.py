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
    return (r - g > 30) & (b - g > 25) & (np.abs(r - b) < 0.5 * np.maximum(r, b))


def defringe(im, halo=34.0):
    """returns the fixed RGBA array and the counts of halo and spill pixels changed"""
    a = im[..., 3]
    rgb = im[..., :3].copy()
    clear = a < 40
    if clear.sum() < 20:
        return im, 0, 0
    dist = ndi.distance_transform_edt(~clear)
    # clean paint: solid, at least 3 px in from the edge
    core = (a > 200) & (dist >= 3.0)
    if core.sum() < 50:
        return im, 0, 0
    _, (iy, ix) = ndi.distance_transform_edt(~core, return_indices=True)
    near = rgb[iy, ix]
    edge = (a > 8) & (dist < 3.0)
    L, Ln = lum(rgb), lum(near)
    halo_px = edge & (L - Ln > halo)
    # (the keyer tints the whole painted outline, 3-5 px wide: spill is judged against the paint 6 px in)
    core6 = (a > 200) & (dist >= 6.0)
    if core6.sum() >= 50:
        _, (jy, jx) = ndi.distance_transform_edt(~core6, return_indices=True)
        near6 = rgb[jy, jx]
    else:
        near6 = near
    spill_px = (a > 8) & (dist < 6.0) & magenta(rgb) & ~magenta(near6)
    if not (halo_px.any() or spill_px.any()):
        return im, 0, 0
    rgb[halo_px] = near[halo_px]
    # spill keeps its lightness (a dark outline stays dark) and takes the hue of the paint inside
    k = (L / np.maximum(lum(near6), 1.0))[..., None]
    rgb[spill_px & ~halo_px] = np.clip(near6 * k, 0, 255)[spill_px & ~halo_px]
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
    ap.add_argument('--halo', type=float, default=34.0)
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
