"""FIX-284: each stood-on pond piece's painted top span (its widest opaque row) as shares of the picture's width: riverArt.ts POND_ART `top`.
   python3 reference/qa-reports/FIX-284/padtop.py"""
from PIL import Image
import numpy as np
for f in ['src/assets/w2-1115/w2-pad-small.webp', 'src/assets/w2-1115/w2-pad-small-sunk.webp', 'src/assets/w1-1109/M-03-a.png',
          'src/assets/w2-1115/w2-pad-big-sunk.webp', 'src/assets/w1-1109/M-02-a.png']:
    a = np.array(Image.open(f).convert('RGBA'))[..., 3] > 128
    H, W = a.shape
    span, y, x0, x1 = max((np.where(a[y])[0].max() - np.where(a[y])[0].min(), y, np.where(a[y])[0].min(), np.where(a[y])[0].max())
                          for y in range(H) if a[y].any())
    print(f'{f}: {W}x{H}, widest row y {y} ({y / H:.2f}), x {x0}-{x1}: top [{x0 / W:.3f}, {(x1 + 1) / W:.3f}]')
