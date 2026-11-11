"""Hugging Face picture list 1 (R-165.100): magenta paste-up starts for img2img (hf-art.md §5: flat (255,0,255), no half-transparent
pixels, nothing floating). Inputs are the cut pieces of the 11-09, 11-11 and 11-11b batches (transparent PNGs).
usage: python3 starts.py <dir with P-*.png, N-*.png, M-*.png> <out dir>"""
import sys, os
import numpy as np
from PIL import Image
SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
MAG = (255, 0, 255)


def load(pid):
    return Image.open(f'{SRC}/{pid}.png').convert('RGBA')


def hard(im):  # no half-transparent pixels: alpha > 127 becomes opaque, the rest goes
    a = np.asarray(im).copy(); a[..., 3] = np.where(a[..., 3] > 127, 255, 0); return Image.fromarray(a, 'RGBA')


def place(im, long_side=1840, canvas_long=2048, margin=0.06, wide_h=None):
    im = hard(im); s = long_side / max(im.size); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    W = canvas_long if im.width >= im.height else None; H = canvas_long if im.height > im.width else None
    if W: H = int(np.ceil((im.height * (1 + 2 * margin) if wide_h is None else wide_h) / 16) * 16)
    else: W = int(np.ceil(im.width * (1 + 2 * margin) / 16) * 16)
    c = Image.new('RGBA', (W, H), MAG + (255,)); c.alpha_composite(hard(im), ((W - im.width) // 2, H - im.height - round(H * margin)))
    return c.convert('RGB')


def save(c, name): c.save(f'{OUT}/{name}.jpg', quality=95, subsampling=0); print(name, c.size)  # JPEG q95 4:4:4 keeps the repo small; the output is keyed, not the start


# item 1: the 7 set pieces, repainted in place at 2000 px (s52/s60)
for pid in ['P-08-c', 'P-08-d', 'P-10-a', 'P-10-d', 'P-11-a', 'P-11-c', 'P-11-d']:
    save(place(load(pid)), f'i1-{pid}')


# item 2: the 4 ground strips: rounded ends trimmed square, then made seamless by cross-fading the last 96 px into the first
def seamless(im, trim, fade=96):
    a = np.asarray(hard(im)).astype(np.float32)[:, trim:-trim]
    W = a.shape[1]; t = np.linspace(1, 0, fade)[None, :, None]
    head = a[:, W - fade:] * t + a[:, :fade] * (1 - t)
    out = np.concatenate([head, a[:, fade:W - fade]], 1)
    out[..., 3] = np.where(out[..., 3] > 127, 255, 0)
    return Image.fromarray(np.clip(out + .5, 0, 255).astype(np.uint8), 'RGBA')


for pid, trim in [('P-03-a', 28), ('P-03-b', 28), ('P-04-c', 28), ('P-01-a', 6)]:
    st = seamless(load(pid), trim); s = 2048 / st.width
    st = st.resize((2048, round(st.height * s)), Image.LANCZOS)
    H = int(np.ceil(st.height * 1.16 / 16) * 16)
    c = Image.new('RGBA', (2048, H), MAG + (255,)); c.alpha_composite(hard(st), (0, (H - st.height) // 2))
    save(c.convert('RGB'), f'i2-{pid}')


# item 3: natural flat-top stumps: a broken stump cut level, with a moss cap from the 11-11b moss block's top band
moss = load('P-05-d'); ma = np.asarray(moss)[..., 3] > 127
mtop = moss.crop((0, 0, moss.width, int(moss.height * 0.32)))


def stump(pid, keep, name):
    im = load(pid); a = np.asarray(im)[..., 3] > 127; ys = np.nonzero(a.any(1))[0]; y0, y1 = ys.min(), ys.max()
    cut = int(y1 - (y1 - y0) * keep); body = im.crop((0, cut, im.width, y1 + 1))
    row = np.nonzero(np.asarray(body)[..., 3][6] > 127)[0]; x0, x1 = row.min(), row.max()
    cap = mtop.resize((int((x1 - x0) * 1.12), int(2.4 * mtop.height * (x1 - x0) * 1.12 / mtop.width)), Image.LANCZOS)  # a thick moss mound, not a lid
    from PIL import ImageDraw
    mk = Image.new('L', cap.size, 0); ImageDraw.Draw(mk).rounded_rectangle([0, 0, cap.width - 1, cap.height - 1], radius=cap.height // 2, fill=255)
    cap.putalpha(Image.fromarray(np.minimum(np.asarray(cap)[..., 3], np.asarray(mk))))  # a rounded moss mound, no square corners
    H = body.height + cap.height // 2; W = max(body.width, cap.width)
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); c.alpha_composite(body, ((W - body.width) // 2, cap.height // 2))
    c.alpha_composite(cap, ((W - body.width) // 2 + x0 - int((x1 - x0) * 0.06), 0))
    save(place(c, long_side=1700), f'i3-{name}')


stump('N-06-c', 0.42, 'stump-short')
stump('M-06-a', 0.62, 'stump-medium')
stump('N-06-a', 0.78, 'stump-tall')


# item 4: sheet 02's slabs side-on: the angled top face squashed to a thin surface band on the front face (no top showing)
def slab(pid, face_frac):
    im = hard(load(pid)); a = np.asarray(im)[..., 3] > 127; ys = np.nonzero(a.any(1))[0]; y0, y1 = ys.min(), ys.max()
    split = int(y0 + (y1 - y0) * face_frac)
    top = im.crop((0, y0, im.width, split)); front = im.crop((0, split, im.width, y1 + 1))
    band = top.resize((im.width, max(8, int(front.height * 0.16))), Image.LANCZOS)
    c = Image.new('RGBA', (im.width, band.height + front.height), (0, 0, 0, 0)); c.alpha_composite(front, (0, band.height)); c.alpha_composite(band, (0, 0))
    save(place(c), f'i4-{pid}')


for pid in ['P-02-a', 'P-02-b', 'P-02-c', 'P-02-d']:
    slab(pid, 0.38)
