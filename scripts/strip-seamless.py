"""Make the painted backdrop strips repeat side by side with no seam and no flip (polish report VI-4, 2026-10-29).

The game used to draw every other copy of a strip mirrored, so each edge met its own reflection: no hard join, but the same tree stood
twice facing itself ("inkblot" twins), and the darker rim columns at the ends doubled into a stripe. Now each strip file is made
seamless once, here: the clear margin and the soft rim columns at both ends are cut off, then the last `band` columns are joined onto
the first ones along the seam where they look most alike (backdrop-strip.py seamless()), so the right edge runs straight on into the
left one with no ghosted double picture. The game tiles it as is.

A strip whose ends already meet (its join is no rougher than its own neighbouring columns) is left alone, so running this again is safe.
Usage: python3 scripts/strip-seamless.py [files...]   (default: every w*-far/mid/near strip in src/assets/backdrops)"""
import sys, glob, importlib.util, os
import numpy as np
from PIL import Image

spec = importlib.util.spec_from_file_location('bs', os.path.join(os.path.dirname(__file__), 'backdrop-strip.py'))
bs = importlib.util.module_from_spec(spec); spec.loader.exec_module(bs)

RIM = 16  # soft rim columns cut off past the clear margin, at 2048 px wide (the dark edge the report measured sits in the outer 10-30 px)
BAND = 256  # the band the join is cut through, at 2048 px wide (the report: 128-256)


def join_score(a):
    """how rough the wrap from the last column to the first is, against the picture's own column-to-column change (premultiplied)"""
    pm = a[..., :3] * a[..., 3:4] / 255
    return np.abs(pm[:, -1] - pm[:, 0]).mean(), np.abs(pm[:, 1:] - pm[:, :-1]).mean()


def painted_cols(a):
    """the columns that are painted: the clear margin at each end is read along a row low in the strip (as scenery.ts paintedSpan did)"""
    row = a[int(a.shape[0] * 0.8), :, 3]
    l, r = 0, len(row) - 1
    while l < len(row) and row[l] < 200: l += 1
    while r > l and row[r] < 200: r -= 1
    return (l, r + 1) if r - l > len(row) * 0.66 else (0, len(row))


def make_seamless(path):
    im = Image.open(path)
    opaque = im.mode == 'RGB'
    a = np.asarray(im.convert('RGBA')).astype(float)
    l, r = painted_cols(a)
    # (judged on the painted columns: a clear margin at both ends would always meet itself)
    join, nb = join_score(a[:, l:r])
    if l == 0 and r == a.shape[1] and join <= nb * 1.5:
        print(f'{os.path.basename(path)}: already seamless (join {join:.1f}, columns {nb:.1f})')
        return
    k = a.shape[1] / 2048
    rim = round(RIM * k)
    a = a[:, l + rim:r - rim]
    band = round(BAND * k)
    rgba = a.copy(); rgba[..., 3] /= 255
    out = bs.seamless(rgba, band)
    px = np.dstack([np.clip(out[..., :3], 0, 255), np.clip(out[..., 3] * 255, 0, 255)]).astype(np.uint8)
    pic = Image.fromarray(px, 'RGBA')
    if opaque: pic = pic.convert('RGB')
    pic.save(path, 'WEBP', quality=90, method=6)
    j2, nb2 = join_score(np.asarray(pic.convert('RGBA')).astype(float))
    print(f'{os.path.basename(path)}: cut {l + rim},{im.width - r + rim}, band {band}, {im.width} -> {pic.width} wide, join {join:.1f} -> {j2:.1f} (columns {nb2:.1f})')


if __name__ == '__main__':
    files = sys.argv[1:] or sorted(f for f in glob.glob('src/assets/backdrops/w*-*.webp') if f.rsplit('-', 1)[1] in ('far.webp', 'mid.webp', 'near.webp'))
    for f in files: make_seamless(f)
