"""snakebrown.py: the brown vine snake (ENG-S2, the lead's ruling 11-14: a hue shift in the cut, so it never hides on a green liana).
Takes ART-678b's green cuts (t-art-678b@a93e335, src/assets/w1-678/w16-vinesnake-{hang,hiss}.webp) and turns ONLY the green scales brown:
every pixel whose hue is in the green band (45-150 deg) has its hue moved to vine-brown (keeps its place in the band, so the shading
stays), its saturation and value eased down a little; the cream belly, the orange eye, the dark outline and the mouth are untouched.
Usage: python3 tools/art/snakebrown.py <in.webp> <out.webp>
"""
import sys
import numpy as np
from PIL import Image

def brown(src, dst):
    im = Image.open(src).convert('RGBA')
    a = np.asarray(im).astype(np.float32) / 255.0
    rgb, al = a[..., :3], a[..., 3:]
    hsv = np.asarray(Image.fromarray((rgb * 255).astype(np.uint8)).convert('HSV')).astype(np.float32)
    h = hsv[..., 0] * 360 / 255; s = hsv[..., 1] / 255; v = hsv[..., 2] / 255
    green = (h >= 45) & (h <= 150) & (s > 0.18)
    # (the green band 45-150 maps onto 18-38: warm bark brown, darker in the shade as the green was)
    h2 = np.where(green, 18 + (h - 45) * (20 / 105), h)
    s2 = np.where(green, np.clip(s * 0.92, 0, 1), s)
    v2 = np.where(green, np.clip(v * 0.80, 0, 1), v)
    out = np.stack([h2 * 255 / 360, s2 * 255, v2 * 255], -1).clip(0, 255).astype(np.uint8)
    rgb2 = np.asarray(Image.fromarray(out, 'HSV').convert('RGB'))
    Image.fromarray(np.concatenate([rgb2, (al * 255).astype(np.uint8)], -1), 'RGBA').save(dst, 'WEBP', lossless=True, quality=100, method=6)

if __name__ == '__main__':
    brown(sys.argv[1], sys.argv[2])
