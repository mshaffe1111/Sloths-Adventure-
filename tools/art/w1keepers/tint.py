"""The earth-wall cool tint (art director, 2026-11-06; lead 9:27 AM ET: "the free cool/desaturate tint"). Matt's earth walls (sheets 36,
38, 39) are painted a warmer, more orange soil than World 1's painted bank soil (props-atlas `bank`), so they pop forward in a 1-1 still.
This moves only the SOIL pixels (brown: r > g + 8) to the bank soil's colour statistics (per-channel mean and spread, measured on the
bank frame), blended at STRENGTH with a soft edge so the moss, grass and ledge planks keep their own colour. Baked into new files
<name>-w1.png next to the cuts (the originals stay, for the W3 "darker" kin).
    python3 tools/art/w1keepers/tint.py [strength]     (default 0.85)
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[3]
CUT = ROOT / 'reference/art/cut'
PIECES = ['w1-wall-earth-A', 'w1-wall-earth-B', 'w1-wall-earth-C', 'w1-wall-cap-tl', 'w1-wall-cap-tr', 'w1-wall-foot-l', 'w1-wall-foot-r',
          'w1-wall-foot-l-41', 'w1-ledge-earth-a', 'w1-ledge-earth-long', 'w1-ledge-earth-small', 'w1-ledge-earth-b', 'w1-ground-chunk',
          'w1-ledge-overhang-big']


def soil_stats(a):
    m = a[..., 3] > 200
    c = a[m][:, :3]
    s = c[c[:, 0] > c[:, 1] + 8]
    return s.mean(0), s.std(0)


def main(strength=0.85):
    atlas = np.asarray(Image.open(ROOT / 'src/assets/proto/props-atlas.webp').convert('RGBA')).astype(np.float32)
    bank = atlas[647:647 + 371, 479:479 + 566]
    tm, ts = soil_stats(bank)
    for n in PIECES:
        a = np.asarray(Image.open(CUT / f'{n}.png').convert('RGBA')).astype(np.float32)
        sm, ss = soil_stats(a)
        rgb = a[..., :3]
        moved = (rgb - sm) / np.maximum(ss, 1) * ts + tm
        soil = (rgb[..., 0] > rgb[..., 1] + 8).astype(np.float32)
        soil = ndimage.gaussian_filter(soil, 1.2)
        k = (soil * strength)[..., None]
        out = np.concatenate([np.clip(rgb * (1 - k) + moved * k, 0, 255), a[..., 3:4]], -1).astype(np.uint8)
        Image.fromarray(out).save(CUT / f'{n}-w1.png')
        print(n, sm.round(1), '->', soil_stats(out.astype(np.float32))[0].round(1), 'target', tm.round(1))


if __name__ == '__main__':
    main(*(float(v) for v in sys.argv[1:2]))
