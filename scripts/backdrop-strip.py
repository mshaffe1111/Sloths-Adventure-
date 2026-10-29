"""Turn a Gemini background strip into a game layer: crop the side bands, key out the flat key colour (magenta, cyan or yellow),
then make it seamless (strip-seamless.py: the right edge crossfaded into the left), since the game repeats it side by side, unflipped. Usage: python3 scripts/backdrop-strip.py <in> src/assets/backdrops/w<N>-<far|mid|near>.webp <far|mid|near> [scale]"""
import sys, numpy as np
from PIL import Image

def crop_bands(a):
    """Gemini sometimes paints a darker panel down each side of a far strip. A panel shows as a sharp step in the average colour of the
    columns near an edge (a painted edge changes gradually), with a flatter panel outside the step: cut at that step."""
    W = a.shape[1]
    m = a.mean(axis=0)  # average colour of each column
    sd = a.std(axis=0).mean(axis=1)
    jump = np.abs(np.diff(m, axis=0)).sum(axis=1)  # jump[x] = change between column x and x+1
    edge = int(W * 0.15)
    def step(xs):
        xs = list(xs)
        x = max(xs, key=lambda k: jump[k])
        return x if jump[x] > 12 and jump[x] > 6 * np.median([jump[k] for k in xs]) else None
    x0, x1 = 0, W
    l = step(range(2, edge))
    # a panel is flat: little variation down its columns (a painted edge, however dark, has detail)
    if l is not None and sd[:l + 1].mean() < 16 and sd[:l + 1].mean() < sd[l + 1:l + 60].mean():
        x0 = l + 3
    r = step(range(W - edge, W - 3))
    if r is not None and sd[r + 1:].mean() < 16 and sd[r + 1:].mean() < sd[r - 60:r + 1].mean():
        x1 = r - 2
    return a[:, x0:x1], (x0, x1)

KEYS = {'magenta': (255, 0, 255), 'cyan': (0, 255, 255), 'yellow': (255, 255, 0)}

def key_colour(a):
    """the flat key colour the strip was painted on: whichever of magenta, cyan and yellow covers the most of the picture"""
    px = a.reshape(-1, 3)[:: 7]
    best, n = None, -1
    for name, k in KEYS.items():
        c = int((np.abs(px - np.array(k)).sum(axis=1) < 110).sum())
        if c > n: best, n = name, c
    if n < 0.03 * len(px):
        # not painted on one of the three keys (another tool's shaded backdrop): the key is whatever fills the top rows
        top = a[2:max(4, a.shape[0] // 12)].reshape(-1, 3)
        return np.median(top, axis=0)
    k = np.array(KEYS[best], float)
    near = px[np.abs(px - k).sum(axis=1) < 110]
    return np.median(near, axis=0) if len(near) else k

def key_out(rgb, key):
    """alpha from the distance to the key colour, and the key's colour spill taken back out of the edges"""
    d = np.sqrt(((rgb - key) ** 2).sum(axis=-1))
    alpha = np.clip((d - 70) / 80, 0, 1)
    hi = [i for i in range(3) if key[i] > 150]
    lo = [i for i in range(3) if key[i] <= 150]
    spill = np.clip(np.min(rgb[..., hi], axis=-1) - (np.max(rgb[..., lo], axis=-1) if lo else 0) - 8, 0, None)
    out = rgb.copy()
    for i in hi:
        out[..., i] = np.clip(rgb[..., i] - spill * 0.95, 0, 255)
    # the painting itself never uses the key's hue, so anything strongly tinted by it (a band of tinted water, a fringe) is background
    alpha = alpha * np.clip((60 - spill) / 30, 0, 1)
    return out, alpha

def _blur(v, r):
    """a soft blur (three box passes of radius `r` along both axes), with the outside counted as zero"""
    for ax in (0, 1):
        for _ in range(3):
            c = np.cumsum(np.pad(v, [(r + 1, r) if i == ax else (0, 0) for i in range(v.ndim)]), axis=ax)
            n = v.shape[ax]
            v = (np.take(c, np.arange(2 * r + 1, 2 * r + 1 + n), axis=ax) - np.take(c, np.arange(0, n), axis=ax)) / (2 * r + 1)
    return v


def seamless(rgba, band, feather=6):
    """Join the last `band` columns onto the first ones so the strip repeats with no visible join, unflipped (polish report VI-4).
    A plain crossfade across the band left both pictures half see-through on top of each other (ghost flowers and trunks on w5gold2-mid,
    2026-10-29), so the two are cut along the seam where they look most alike instead (texture quilting): the cheapest path from top to
    bottom through the band, by how different the two pictures are there, each row switching from the right edge's paint to the left
    edge's paint at that path, softened over `feather` columns. Works on premultiplied colour; `rgba` alpha is 0-1."""
    H, W, _ = rgba.shape
    rgb = rgba[..., :3] * rgba[..., 3:4]
    a = rgba[..., 3:4]
    L = np.concatenate([rgb[:, :band], a[:, :band] * 255], axis=-1)
    R = np.concatenate([rgb[:, W - band:], a[:, W - band:] * 255], axis=-1)
    cost = np.abs(L - R).sum(axis=-1)
    # (the cut keeps clear of the band's ends, so the wrap from the last column to the first is always the right edge's own paint)
    lo, hi = feather + 2, band - feather - 2
    cost[:, :lo] = 1e9
    cost[:, hi:] = 1e9
    acc = cost.copy()
    for y in range(1, H):
        prev = acc[y - 1]
        best = np.minimum(prev, np.minimum(np.r_[1e18, prev[:-1]], np.r_[prev[1:], 1e18]))
        acc[y] += best
    cut = np.zeros(H, int)
    cut[-1] = int(np.argmin(acc[-1]))
    for y in range(H - 2, -1, -1):
        c = cut[y + 1]
        js = [j for j in (c - 1, c, c + 1) if 0 <= j < band]
        cut[y] = min(js, key=lambda j: acc[y, j])
    x = np.arange(band)[None, :]
    t_cut = np.clip((x - cut[:, None] + feather / 2) / feather, 0, 1)  # 0: the right edge's paint, 1: the left edge's
    # a cut through a smooth glow (a sky, a haze) is a step in brightness, and a plain crossfade there ghosts nothing (it has no detail):
    # so where both pictures are smooth the join is a plain crossfade, and where either has detail it is the cut
    lin = np.linspace(0, 1, band)[None, :]
    grad = lambda v: np.abs(np.diff(v, axis=1, append=v[:, -1:])).sum(-1) + np.abs(np.diff(v, axis=0, append=v[-1:])).sum(-1)
    detail = np.clip(_blur(grad(L) + grad(R), 10) / 14, 0, 1)
    t = (t_cut * detail + lin * (1 - detail))[..., None]
    head_rgb = rgb[:, :band] * t + rgb[:, W - band:] * (1 - t)
    head_a = a[:, :band] * t + a[:, W - band:] * (1 - t)
    rgb2 = np.concatenate([head_rgb, rgb[:, band:W - band]], axis=1)
    a2 = np.concatenate([head_a, a[:, band:W - band]], axis=1)
    col = np.where(a2 > 1e-4, rgb2 / np.maximum(a2, 1e-4), 0)
    return np.concatenate([col, a2], axis=-1)

def main(src, dst, kind, scale=2.0, band_frac=0.07):
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(float)
    if kind == 'far':
        a, cut = crop_bands(a)
    else:
        cut = (0, a.shape[1])
    if kind == 'far':
        rgba = np.concatenate([a, np.ones(a.shape[:2] + (1,))], axis=-1)
    else:
        rgb, al = key_out(a, key_colour(a))
        rgba = np.concatenate([rgb, al[..., None]], axis=-1)
    out = Image.fromarray(np.dstack([np.clip(rgba[..., :3], 0, 255), np.clip(rgba[..., 3] * 255, 0, 255)]).astype(np.uint8), 'RGBA')
    if scale != 1:
        out = out.resize((round(out.width * scale), round(out.height * scale)), Image.LANCZOS)
    if kind == 'far':
        out = out.convert('RGB')
    out.save(dst, 'WEBP', quality=88, method=6)
    print(dst, 'crop', cut, 'size', out.size)
    # the game tiles strips unflipped (VI-4), so the ends are crossfaded into each other
    import importlib.util, os
    spec = importlib.util.spec_from_file_location('seam', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'strip-seamless.py'))
    seam = importlib.util.module_from_spec(spec); spec.loader.exec_module(seam)
    seam.make_seamless(dst)

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]) if len(sys.argv) > 4 else 2.0)
