"""Crocus Rex's defeat still (R-1.1, 2026-11-02): img2img starts from his own painted frames in croc-anim.webp, on flat MAGENTA
(he is grey-green: the old grey key cut his belly out, the see-through defeat frames). Holes in a frame are filled with his olive before
pasting, the crown is lifted off his head and laid on the ground by his snout (the line: "My crown! Where is my... oh. There.").
  python3 -I tools/art/crocdefeat/starts.py   -> reference/prop-sheets/qa-notes/croc-defeat/starts/*.png"""
import json, re
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
R = Path(__file__).resolve().parents[3]
OUT = R / 'reference/prop-sheets/qa-notes/croc-defeat/starts'
fr = json.loads(re.search(r'CROC_ANIM_FRAMES: Record<string, BossFrameRect> = (\{.*?\});', (R / 'src/game/crocAnimData.ts').read_text()).group(1))
sheet = Image.open(R / 'src/assets/enemies/croc-anim.webp').convert('RGBA')
MAG = (255, 0, 255)
OLIVE = np.array([86, 92, 60], np.float32)

def frame(n):
    f = fr[n]
    return sheet.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))

def filled(im):
    a = np.asarray(im).astype(np.float32)
    solid = a[..., 3] > 128
    body = ndimage.binary_fill_holes(ndimage.binary_closing(solid, iterations=6))
    rgb = a[..., :3] * (a[..., 3:] / 255) + OLIVE * (1 - a[..., 3:] / 255)
    out = np.zeros_like(a); out[..., :3] = rgb; out[..., 3] = body * 255
    return Image.fromarray(out.astype(np.uint8))

def crown_split(im):
    """the pink crown pixels (high red, low green) cut off his head"""
    a = np.asarray(im).copy()
    r, g, b = [a[..., i].astype(int) for i in range(3)]
    pink = (r > 170) & (g < 150) & (b > 90) & (a[..., 3] > 0)
    lab, n = ndimage.label(ndimage.binary_dilation(pink, iterations=3))
    if not n: return im, None
    big = np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))) + 1
    m = lab == big
    ys, xs = np.where(m)
    crown = Image.fromarray(np.where(m[..., None], a, 0).astype(np.uint8)).crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    a2 = a.copy(); a2[m, :3] = OLIVE.astype(np.uint8)
    return Image.fromarray(a2), crown

def make(name, src, flip):
    im = frame(src)
    body, crown = crown_split(im)
    body = filled(body)
    if flip: body = body.transpose(Image.FLIP_TOP_BOTTOM)
    W, H = 1536, 768
    c = Image.new('RGB', (W, H), MAG)
    k = 1150 / body.width
    b = body.resize((round(body.width * k), round(body.height * k)), Image.LANCZOS)
    x, y = (W - b.width) // 2 - 40, H - 90 - b.height
    c.paste(b, (x, y), b)
    if crown is not None:
        cr = crown.resize((round(crown.width * k * 0.9), round(crown.height * k * 0.9)), Image.LANCZOS).rotate(-25, expand=True)
        c.paste(cr, (x + b.width + 10, H - 90 - cr.height), cr)
    OUT.mkdir(parents=True, exist_ok=True)
    c.save(OUT / f'{name}.png')
    print(name, c.size)

def round2(take):
    """round 2: the keyed round-1 take (his body only) with his real painted crown from idle_005 laid on the ground by his snout, on
    magenta, for a low-strength repaint in place with the style model"""
    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from cut import key
    k = key(take)
    a = np.asarray(k)[..., 3] > 128
    lab, n = ndimage.label(a)
    s = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    keep = lab == (np.argmax(s) + 1)
    arr = np.asarray(k).copy(); arr[~keep, 3] = 0
    body = Image.fromarray(arr); body = body.crop(body.getbbox())
    _, crown = crown_split(frame('idle_005'))
    W, H = 1536, 768
    c = Image.new('RGB', (W, H), MAG)
    sc = 1250 / body.width
    body = body.resize((round(body.width * sc), round(body.height * sc)), Image.LANCZOS)
    x, y = 60, H - 70 - body.height
    c.paste(body, (x, y), body)
    cr = crown.resize((round(crown.width * 4.6), round(crown.height * 4.6)), Image.LANCZOS).rotate(-20, expand=True)
    c.paste(cr, (x + body.width + 10, H - 75 - cr.height), cr)
    c.save(OUT / 'round2.png'); print('round2', c.size)


if __name__ == '__main__' and len(__import__('sys').argv) > 1:
    round2(__import__('sys').argv[1])
elif __name__ == '__main__':
  make('back-from-idle', 'idle_005', True)     # rolled onto his back: his clean idle, upside down
  make('side-from-defeat', 'defeated_000', False)  # the defeat clip's first frame (least cut), holes filled
