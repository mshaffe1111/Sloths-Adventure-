"""Edge brightness of cut-out backdrop strips: how bright the outer rim of every leaf and trunk is, against the paint just inside.

    python3 -I tools/art/edges/measure.py <file.webp> [...]

For each opaque pixel (alpha >= 0.5) within RIM px of the transparent area, the ratio of its luminance to the local paint further in
(a normalised Gaussian mean, sigma 4 px, of the pixels more than RIM+2 px inside). 1.0 = the edge is as bright as the paint; the
dark sticker ring measured 0.38-0.61. Pixels count by their alpha (anything at
alpha >= 0.1 draws), each pixel by its straight (un-premultiplied) colour. Prints the alpha-weighted mean ratio over the rim, the
same for the outermost pixel only, the paint 2.5-4 px in (past an ink line, inside the old 3 px smear), and the share of rim pixels tinted by the magenta key (red and blue both over green by 20+, and 25 more than the paint
inside)."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

RIM = 3


def lum(rgb):
    return rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722


def edge_stats(rgba):
    rgb = rgba[..., :3].astype(np.float32)
    a = rgba[..., 3].astype(np.float32) / 255
    drawn = a >= 0.1  # anything that visibly draws, half-see-through edge pixels included
    if drawn.all() or not drawn.any():
        return None
    dist = ndimage.distance_transform_edt(drawn)  # px to the nearest see-through pixel
    rim = drawn & (dist <= RIM)
    core = (dist > RIM + 2) & (a > 0.99)
    L = lum(rgb)
    num = ndimage.gaussian_filter(np.where(core, L, 0), 4)
    den = ndimage.gaussian_filter(core.astype(np.float32), 4)
    ok = rim & (den > 0.05)
    ref = num[ok] / den[ok]
    keep = ref > 12  # skip near-black interiors, where a ratio means nothing
    ratio = np.clip(L[ok][keep] / ref[keep], 0, 1.5)
    w = a[ok][keep]  # a half-see-through pixel shows half as much
    outer = (dist[ok][keep] <= 1)
    mean = float((ratio * w).sum() / w.sum())
    out1 = float((ratio * w)[outer].sum() / w[outer].sum())
    # how even the edge is: the share of drawn pixels darker than 0.7x the paint inside, 1, 2, 3 and 4 px in. A drawn line is
    # one even ring (1.0 1.0 then low); the old smear is blotchy (some outer pixels dark, some not, dark again further in)
    rr = np.where(den > 0.05, L / np.maximum(num / np.maximum(den, 1e-3), 1), 1)
    dark = [float((rr[drawn & (den > 0.05) & (dist > k - 1) & (dist <= k)] < 0.7).mean()) for k in (1, 2, 3, 4)]
    # magenta spill: a rim pixel whose pinkness (red and blue over green) is well above the paint just inside it; real pinks
    # (orchids, dusk haze) are as pink inside as at the edge and do not count
    pinkness = np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1]
    pnum = ndimage.gaussian_filter(np.where(core, pinkness, 0), 4)
    p_in = pnum[ok] / den[ok]
    pink = float(((pinkness[ok] > 20) & (pinkness[ok] > p_in + 25)).mean())
    return mean, out1, pink, int(rim.sum()), dark


if __name__ == '__main__':
    for p in sys.argv[1:]:
        s = edge_stats(np.asarray(Image.open(p).convert('RGBA')))
        name = p.rsplit('/', 1)[-1]
        print(f'{name:24s} ' + ('opaque' if s is None else f'rim {s[0]:.2f}  outer px {s[1]:.2f}  dark at 1-4 px ' + ' '.join(f'{v:.2f}' for v in s[4]) + f'  pink {s[2]*100:4.1f}%'))
