"""Key a croc take off flat magenta: the key, the magenta spill pulled out of the edge (his body has no pink but the crown), holes
inside the body never keyed (only magenta joined to the border is background), specks dropped, trimmed.
  python3 -I tools/art/crocdefeat/cut.py <take> <out.png> [--crown]     (--crown keeps the crown's pink where it is)"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

def key(src, keep_pink_box=None):
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    magness = np.minimum(r, b) - g          # high on magenta and its spill
    bgish = (magness > 90) & (r > 150) & (b > 150)
    lab, n = ndimage.label(bgish)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    bg = ndimage.binary_dilation(bg, iterations=1) & (magness > 40)   # the soft edge of the key
    fg = ~bg
    fg = ndimage.binary_opening(fg, iterations=1)
    lab2, n2 = ndimage.label(fg)
    if n2 > 1:
        s = ndimage.sum(np.ones_like(lab2), lab2, range(1, n2 + 1))
        fg = np.isin(lab2, [i + 1 for i, a in enumerate(s) if a > 0.004 * s.max()])
    # despill: pull pink out of the body (keep the crown's pink inside its box)
    spill = np.clip(magness - 6, 0, None)
    if keep_pink_box is not None:
        x0, y0, x1, y1 = keep_pink_box; spill[y0:y1, x0:x1] = 0
    im[..., 0] -= spill * 0.85; im[..., 2] -= spill * 0.85
    im = np.clip(im, 0, 255)
    a = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9))
    out = Image.fromarray(im.astype(np.uint8)).convert('RGBA'); out.putalpha(a)
    return out.crop(out.getbbox())

if __name__ == '__main__':
    key(sys.argv[1]).save(sys.argv[2]); print(sys.argv[2])
