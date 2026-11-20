"""ART-22P: img2img starts for 2-2's pickup, from the SHIPPED painted petal (src/assets/pickups/petal.webp) so the take keeps its
shape, veins, edge weight and shading; recoloured to the target and pasted on flat mid grey (128), 1024 px (hf-art.md: pinks and
pale pieces on GREY; magenta drifts and eats them).

    python3 -I tools/art/hf22p/starts.py <repo root>
"""
import colorsys, sys
from pathlib import Path
import numpy as np
from PIL import Image

root = Path(sys.argv[1])
src = Image.open(root / 'src/assets/pickups/petal.webp').convert('RGBA')
big = src.resize((src.width * 8, src.height * 8), Image.LANCZOS)
a = np.asarray(big).astype(np.float32) / 255


def recolour(hue, sat_k, light_k):
    rgb = a[..., :3]
    out = np.empty_like(rgb)
    flat = rgb.reshape(-1, 3)
    o = out.reshape(-1, 3)
    for i, (r, g, b) in enumerate(flat):
        h, l, s = colorsys.rgb_to_hls(r, g, b)
        # the warm cream base stays warm (h near 0.1); only the pink body turns
        if 0.75 < h or h < 0.05:
            h = hue
            s = min(1, s * sat_k)
            l = min(1, l * light_k)
        o[i] = colorsys.hls_to_rgb(h, l, s)
    return out


def paste(rgb, name):
    c = Image.new('RGB', (1024, 1024), (128, 128, 128))
    im = Image.fromarray((np.dstack([rgb, a[..., 3]]) * 255).astype(np.uint8), 'RGBA')
    c.paste(im, ((1024 - im.width) // 2, (1024 - im.height) // 2), im)
    c.save(root / 'reference/art/hf22p/starts' / name)
    print(name)


paste(recolour(0.73, 0.8, 1.18), 'petal-lav.png')   # lavender: water hyacinth
paste(recolour(0.95, 0.25, 1.32), 'petal-white.png')  # white lily with a faint blush
