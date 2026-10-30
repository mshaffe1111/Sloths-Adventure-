"""Seamless tiling for the painted ground (hf-art-ground, 2026-10-29; polish report VI-8).

The soil texture is laid in the game as a brick bond: rows of square tiles, each row shifted half a tile (protoArt.ts drawGroundFill).
So the texture is made periodic on that lattice, basis (W, 0) and (W/2, H), not on a plain grid: a tile's bottom edge runs on into the
top edge of the two tiles below it, half a tile across.

  brick(img)   -> img made periodic on the brick lattice: the picture blended with itself moved by (W/4, H/2) on the lattice, each one
                  weighted by how far a pixel is from its own seams (so neither one's seams show)
  wrap_x(img)  -> img made periodic left to right only (the top-lip strip)
  border_mask  -> 1 on a band along the edges, 0 inside, smooth: a second pass's repaint is kept inside, the shared edges outside, so
                  every variant of a world has the same edges and any of them sits next to any other with no seam
  check3(img, brick=True) -> a 3x3 check picture of the texture laid as the game lays it

numpy + PIL only (it runs in the GPU job and on the machine).
"""
import numpy as np
from PIL import Image


def _lattice(a, xs, ys):
    """a sampled at integer points (xs, ys) of its brick-lattice extension"""
    H, W = a.shape[:2]
    b = np.floor_divide(ys, H)
    y = ys - b * H
    x = np.mod(xs - b * (W // 2), W)
    return a[y, x]


def _dist_edges(H, W):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    return np.minimum(np.minimum(xx + 0.5, W - 0.5 - xx), np.minimum(yy + 0.5, H - 0.5 - yy))


def brick(img):
    a = np.asarray(img.convert('RGB'), np.float32)
    H, W = a.shape[:2]
    dx, dy = W // 4, H // 2
    yy, xx = np.mgrid[0:H, 0:W]
    r = _lattice(a, xx + dx, yy + dy)
    # the moved copy's seams: where its samples wrap. Rows y < H - dy come from the tile's row y + dy (x shifted dx), the rest from the
    # next brick row (x shifted dx - W/2): vertical seams at x = W - dx above, x = W/2 - dx (mod W) below; a horizontal seam at H - dy.
    sx_top = (W - dx) % W
    sx_bot = (W // 2 - dx) % W
    hy = H - dy
    dv = np.where(yy < hy, np.minimum(np.abs(xx + 0.5 - sx_top), W - np.abs(xx + 0.5 - sx_top)),
                  np.minimum(np.abs(xx + 0.5 - sx_bot), W - np.abs(xx + 0.5 - sx_bot)))
    dR = np.minimum(dv, np.abs(yy + 0.5 - hy)).astype(np.float32)
    dI = _dist_edges(H, W)
    # (smoothstep on the share, so the hand-over is soft but each copy is fully itself near the other's seams)
    w = dI / (dI + dR + 1e-6)
    w = w * w * (3 - 2 * w)
    out = w[..., None] * a + (1 - w[..., None]) * r
    return Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8))


def wrap_x(img):
    """periodic left to right (any mode: RGB or RGBA)"""
    a = np.asarray(img, np.float32)
    H, W = a.shape[:2]
    r = np.roll(a, -W // 2, axis=1)
    xx = np.arange(W, dtype=np.float32) + 0.5
    dI = np.minimum(xx, W - xx)
    dR = np.abs(xx - W / 2)
    w = dI / (dI + dR + 1e-6)
    w = (w * w * (3 - 2 * w))[None, :]
    if a.ndim == 3:
        w = w[..., None]
    out = w * a + (1 - w) * r
    return Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8), img.mode)


def border_mask(H, W, band, x_only=False):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.minimum(xx + 0.5, W - 0.5 - xx)
    if not x_only:
        d = np.minimum(d, np.minimum(yy + 0.5, H - 0.5 - yy))
    t = np.clip(1 - d / band, 0, 1)
    return t * t * (3 - 2 * t)


def keep_border(base, inner, band, x_only=False):
    """base's edges, inner's middle (both the same size and mode)"""
    a = np.asarray(base, np.float32)
    b = np.asarray(inner.resize(base.size, Image.LANCZOS), np.float32)
    m = border_mask(a.shape[0], a.shape[1], band, x_only)
    if a.ndim == 3:
        m = m[..., None]
    out = m * a + (1 - m) * b
    return Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8), base.mode)


def check3(tiles, bricked=True, scale=0.5):
    """3 x 3 of the tile (or a list of variants, taken in turn), each row half a tile on when bricked"""
    if not isinstance(tiles, (list, tuple)):
        tiles = [tiles]
    t0 = tiles[0]
    W, H = round(t0.width * scale), round(t0.height * scale)
    ts = [t.convert('RGB').resize((W, H), Image.LANCZOS) for t in tiles]
    out = Image.new('RGB', (W * 3, H * 3))
    k = 0
    for r in range(3):
        off = (W // 2) * (r % 2) if bricked else 0
        for c in range(-1, 4):
            x = c * W + off
            out.paste(ts[(k + c * 7 + r * 3) % len(ts)], (x, r * H))
        k += 1
    return out
