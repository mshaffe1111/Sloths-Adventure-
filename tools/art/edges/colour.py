"""How colourful and contrasty the backdrop reads on a screenshot (Matt 2026-10-29: upright looked faded next to sideways).

    python3 -I tools/art/edges/colour.py <shot.png> [...]

Over the backdrop band (below the HUD, above the ground: upright 12-58% of the height, sideways 16-62%), the mean HSV saturation and
the standard deviation of luma (0-255), plus the mean luma. Upright after should sit close to sideways."""
import sys

import numpy as np
from PIL import Image


def stats(path):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    lo, hi = (0.12, 0.58) if h > w else (0.16, 0.62)
    a = np.asarray(im).astype(np.float32)[int(h * lo):int(h * hi)] / 255
    mx, mn = a.max(-1), a.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    luma = (a @ np.array([0.2126, 0.7152, 0.0722], np.float32)) * 255
    return float(sat.mean()), float(luma.std()), float(luma.mean())


if __name__ == '__main__':
    for p in sys.argv[1:]:
        s, c, m = stats(p)
        print(f'{p.rsplit("/", 1)[-1]:24s} saturation {s:.3f}  luma sd {c:5.1f}  luma mean {m:5.1f}')
