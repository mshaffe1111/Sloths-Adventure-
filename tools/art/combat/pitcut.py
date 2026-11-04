"""R-6.38 (fix-petals, 2026-11-04): World 1's pit art, cut from the four takes Matt approved (PIT-LIST.md, R-159.1) and the lead accepted
(tools/art/combat/jobs.txt 15:03Z): the drop s52-7, the lip s55-7, the bed s60-7 and the high drop s65-23. No new painting: the takes are
made to tile (the drop and the high drop, by scripts/backdrop-strip.py's seamless join, the backdrops' own) and keyed off their magenta
(the lip and the bed), trimmed, sized and saved as webp in src/assets/props/pits/.
  python3 -I tools/art/combat/pitcut.py <dir with drop.png lip.png bed.png high.png>
(the takes come from hf://buckets/mshaffe111/w5-xfer/r159/r159-pits/props/, attached with hf_fs: reference/methods/hf-art.md §7)"""
import importlib.util, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
spec = importlib.util.spec_from_file_location('bs', os.path.join(ROOT, 'scripts', 'backdrop-strip.py'))
bs = importlib.util.module_from_spec(spec); spec.loader.exec_module(bs)
OUT = os.path.join(ROOT, 'src', 'assets', 'props', 'pits')


def tile(src: str, name: str, w: int, band: int):
    """made to repeat side by side (the seamless join), then sized to `w` px wide"""
    a = np.asarray(Image.open(src).convert('RGBA')).astype(np.float64)
    a[..., 3] /= 255
    s = bs.seamless(a, band)  # (colour 0-255 and alpha 0-1; the takes are opaque)
    im = Image.fromarray(np.clip(s[..., :3], 0, 255).astype(np.uint8), 'RGB')
    h = round(im.height * w / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    im.save(os.path.join(OUT, name), 'WEBP', quality=86, method=6)
    return im.size


def keyed(src: str, name: str, w: int):
    """the magenta (255, 0, 255) keyed out, a soft 2 px edge, its halo's pink pulled out of the edge colours; trimmed; sized to `w` wide"""
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.float64)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # (how magenta a pixel is: red and blue high, green low)
    # (the take's key is not one flat colour: 81-93 above green at its edges, about 230 inside; the paint is below 0, browns and greens)
    mag = np.clip(((np.minimum(r, b) - g) - 25) / 50, 0, 1)
    alpha = 1 - mag
    # (the pink the edge picked up from the key: take the magenta part out where the pixel is part-keyed)
    k = np.minimum(r, b) - g
    fix = (alpha < 1) & (alpha > 0)
    a[..., 0] = np.where(fix, np.clip(r - k * (1 - alpha), 0, 255), r)
    a[..., 2] = np.where(fix, np.clip(b - k * (1 - alpha), 0, 255), b)
    rgba = np.dstack([a, alpha[..., None] * 255]).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    # (the outermost pixel ring still carries the key's pink: the alpha is eroded by one pixel, which takes it off)
    from PIL import ImageFilter
    im.putalpha(im.getchannel('A').filter(ImageFilter.MinFilter(3)))
    box = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    im = im.crop(box)
    h = round(im.height * w / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    im.save(os.path.join(OUT, name), 'WEBP', quality=88, method=6)
    return im.size, box


if __name__ == '__main__':
    d = sys.argv[1]
    os.makedirs(OUT, exist_ok=True)
    print('drop', tile(os.path.join(d, 'drop.png'), 'w1-drop.webp', 512, 128))
    print('high', tile(os.path.join(d, 'high.png'), 'w1-high.webp', 1024, 128))
    print('lip', keyed(os.path.join(d, 'lip.png'), 'w1-lip.webp', 256))
    print('bed', keyed(os.path.join(d, 'bed.png'), 'w1-bed.webp', 512))
