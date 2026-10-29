"""Cut a repainted figure off its flat grey start and bring it back to the game at its new size.

    from cut import cut_figure
    rgba, (ax, ay) = cut_figure(gen_png, start_meta, old_rgba, k_new, anchor=(ax, ay))

The start (starts.py on_key) put the old frame at `scale` start px per old px, offset (ox, oy). The repaint keeps the pose, so the old
frame's own silhouette (scaled up and grown a little) is the limit of the cut: anything the model painted outside it is background. Inside it
the grey is keyed out by its distance from the background colour, and the grey spill on the edge is taken back out (un-premultiplied).
The result is `k_new` new px per old px, trimmed, with the anchor moved with it.
"""
import numpy as np
from PIL import Image, ImageFilter


def bg_colour(arr):
    edge = np.concatenate([arr[:8].reshape(-1, 3), arr[-8:].reshape(-1, 3), arr[:, :8].reshape(-1, 3), arr[:, -8:].reshape(-1, 3)])
    return np.median(edge, 0)


def cut_figure(gen, meta, old, k_new, anchor=None, grow=14, lo=14, hi=46, rect_margin=None, limit=True):
    g = np.asarray(gen.convert('RGB'), np.float32)
    H, W = g.shape[:2]
    bg = bg_colour(g)
    d = np.sqrt(((g - bg) ** 2).sum(-1))
    # (saturation counts double: a pale fur edge on grey is still fur when it has any colour)
    if bg.max() - bg.min() < 20:
        mx, mn = g.max(-1), g.min(-1)
        d = np.maximum(d, (mx - mn) * 2.2)
    ak = np.clip((d - lo) / (hi - lo), 0, 1)
    # the old silhouette, where the start put it, grown by `grow` px
    s, ox, oy = meta['scale'], meta['ox'], meta['oy']
    oa = old.split()[3].resize((max(1, round(old.width * s)), max(1, round(old.height * s))), Image.LANCZOS)
    lim = Image.new('L', (W, H), 0)
    lim.paste(oa, (ox, oy))
    lim = lim.point(lambda v: 255 if v > 40 else 0).filter(ImageFilter.MaxFilter(2 * (grow // 2) + 1)).filter(ImageFilter.GaussianBlur(grow / 3))
    a = ak * (np.asarray(lim, np.float32) / 255) if limit else ak
    if not limit:
        # (an edit can leave a pale outline round the figure, like a sticker: a light, colourless rim on the edge goes)
        rim = (np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(9)), np.float32) / 255) < 0.5
        pale = (g.min(-1) > 200) & ((g.max(-1) - g.min(-1)) < 30)
        a = np.where(rim & pale & (a > 0), 0, a)
    # un-premultiply the grey out of the edge
    aa = np.maximum(a, 0.18)[..., None]
    rgb = np.clip(bg + (g - bg) / aa, 0, 255)
    rgb = np.where(a[..., None] > 0.98, g, rgb)
    out = np.dstack([rgb, a * 255]).astype(np.uint8)
    im = Image.fromarray(out, 'RGBA')
    if rect_margin is not None:
        # the old frame's own rect, mapped to the start and grown by `rect_margin` old px: the new frame is the old one times f exactly, so every
        # point the game keeps for it (feet, head, bib) is just multiplied
        mg = rect_margin * s
        box = (round(ox - mg), round(oy - mg), round(ox + old.width * s + mg), round(oy + old.height * s + mg))
        im = im.crop(box)
        f = k_new / s
        im = im.resize((max(1, round(old.width * k_new + 2 * rect_margin * k_new)), max(1, round(old.height * k_new + 2 * rect_margin * k_new))), Image.LANCZOS)
        return im, rect_margin * k_new
    box = im.split()[3].point(lambda v: 255 if v > 8 else 0).getbbox()
    if not box:
        return None, None
    x0, y0, x1, y1 = box
    im = im.crop(box)
    f = k_new / s
    im = im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), Image.LANCZOS)
    if anchor is None:
        return im, None
    sx = anchor[0] * s + ox
    sy = anchor[1] * s + oy
    return im, ((sx - x0) * f, (sy - y0) * f)


def on_dark(im, bg=(24, 28, 32)):
    b = Image.new('RGBA', im.size, bg + (255,))
    b.alpha_composite(im)
    return b.convert('RGB')
