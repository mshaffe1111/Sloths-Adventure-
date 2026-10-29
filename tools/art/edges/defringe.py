"""Clean cut-out edges for the painted backdrop strips (polish report VI-1, VI-5, VI-6): no dark sticker ring, no white halo, no
magenta spill. Every cut-out strip (near, mid, canopy) goes through this before it ships.

    python3 -I tools/art/edges/defringe.py <src> <dst.webp> [--scale 2] [--esrgan] [--ring N] [--ink] [--despill] [--q 90]

  --scale S    output size as a multiple of the source (2 for the 1024 px originals of Worlds 1-4, 6, 7 and 10; 1 to clean in place)
  --esrgan     enlarge the colour 4x with Real-ESRGAN (tools/art/upscale/anime6b.pth) before scaling down to S; without it, Lanczos
  --ring N     how many source px in from the cut are not trusted for colour (default 1.5; 3 for a 2048 strip cleaned in place)
  --ink        draw an even 1.6 px ink line at 0.42x the local colour along the cut, so the edge reads as drawn on purpose
  --despill    take the magenta key's spill out first (r and b clamped to green + 12 where the pixel is magenta-tinted near the cut)
  --keep-line  the strip's dark outline is its own clean ink line (World 5's Gemini strips): keep it, no erode; only despill,
               clear the specks and bleed outward
  --unveil N   clear what keying left in the sky: specks, and faint (alpha < 0.5) leftovers more than N px from the painting
               (the W1 canopy's white key). Never on World 5, whose cobwebs are faint strands on purpose
  --unmix R,G,B  the strip was keyed off this light colour (the W1 canopy: white): un-mix it from the edge pixels first
  --grade      World 4 (VI-18): saturation +12%, highlights warmed (grade.py does the same to an opaque far strip)
  --q          WebP quality (default 90, what the strips were saved at)

What it does, in order:
 1. Colour you can trust: fully opaque pixels more than --ring px from the transparent area, plus every pixel of a thin feature
    (a hair vine, a twig: under 2 source px wide), whose colour is all there is. The outer ring is not trusted: on the 1024 px
    originals it holds a dark painted rim, on keyed strips the key's spill (white on the canopy, magenta on World 5), and on the old
    2x files the black the upscaler smeared in (it saw the transparent area as black).
 2. Bleed: every untrusted pixel, and the transparent area 16 px out, gets the trusted colour around it (a normalised Gaussian fill,
    sigma 1, 2, 4 then 8 px, the nearest that reaches). Un-premultiplying is part of this: a half-see-through pixel's stored colour
    is replaced, so it no longer matters whether it was premultiplied.
 3. Enlarge the colour (Real-ESRGAN or Lanczos) with nothing dark next to the edge to smear in; the alpha separately, with the
    same model (smooth curves) or Lanczos.
 4. Erode the alpha 1 px and feather it ~1.2 px, so the cut sits inside clean paint; features under 4 px wide (at output size) keep
    their alpha, so hair vines don't vanish.
 5. Optional ink line (--ink).
The transparent area keeps the bled colour 6 px out (so any filtering samples paint, not black) and is black beyond (costs nothing)."""
import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from measure import edge_stats  # noqa: E402

_model = None


def esrgan4x(rgb):
    """rgb float 0-255 (H, W, 3) -> 4x, Real-ESRGAN anime 6B on the CPU, tiled (as tools/art/upscale/up.py)"""
    global _model
    import torch
    from spandrel import ModelLoader
    if _model is None:
        _model = ModelLoader().load_from_file(str(HERE.parent / 'upscale' / 'anime6b.pth')).eval()
    t = torch.from_numpy((rgb / 255.0).astype(np.float32)).permute(2, 0, 1).unsqueeze(0)
    _, _, h, w = t.shape
    s, tile, pad = _model.scale, 256, 16
    out = torch.zeros(1, 3, h * s, w * s)
    for y in range(0, h, tile):
        for x in range(0, w, tile):
            y0, x0 = max(0, y - pad), max(0, x - pad)
            y1, x1 = min(h, y + tile + pad), min(w, x + tile + pad)
            with torch.no_grad():
                o = _model(t[:, :, y0:y1, x0:x1])
            oy, ox = (y - y0) * s, (x - x0) * s
            th, tw = min(tile, h - y) * s, min(tile, w - x) * s
            out[:, :, y * s:y * s + th, x * s:x * s + tw] = o[:, :, oy:oy + th, ox:ox + tw]
    return out.squeeze(0).permute(1, 2, 0).clamp(0, 1).numpy() * 255


def resize(arr, size):
    """float array (H, W[, C]) -> size (w, h), Lanczos, per channel in float"""
    chans = arr[..., None] if arr.ndim == 2 else arr
    out = np.stack([np.asarray(Image.fromarray(chans[..., c].astype(np.float32), 'F').resize(size, Image.LANCZOS))
                    for c in range(chans.shape[-1])], -1)
    return out[..., 0] if arr.ndim == 2 else out


def thin(mask, width):
    """pixels of features narrower than `width` px: what an opening with a disc that wide removes"""
    r = width / 2
    yy, xx = np.mgrid[-int(r):int(r) + 1, -int(r):int(r) + 1]
    disc = xx * xx + yy * yy <= r * r
    return mask & ~ndimage.binary_opening(mask, structure=disc)


def despill(rgb, alpha, reach=3, margin=12):
    """VI-6: magenta key spill at the cut. Within `reach` px of the transparent area, clamp red and blue to green plus a small
    margin over what the paint just inside has: r <= g + max(margin, r_in - g_in + margin), the same for b. World 5 is full of
    real pinks and purples (orchids, the dusk haze): they are as pink inside as at the edge, so they pass untouched; only a rim
    pinker than its own paint is pulled back"""
    drawn = alpha >= 0.1
    d = ndimage.distance_transform_edt(drawn)
    rim = drawn & (d <= reach)
    inside, _ = bleed(rgb, drawn & (d > reach + 1))
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    ri, gi, bi = inside[..., 0], inside[..., 1], inside[..., 2]
    cap_r = g + np.maximum(margin, ri - gi + margin)
    cap_b = g + np.maximum(margin, bi - gi + margin)
    tint = rim & (np.minimum(r - g, b - g) > 20) & ((r > cap_r) | (b > cap_b))
    out = rgb.copy()
    out[..., 0] = np.where(tint, np.minimum(r, cap_r), r)
    out[..., 2] = np.where(tint, np.minimum(b, cap_b), b)
    return out, int(tint.sum())


def unmix(rgb, alpha, key):
    """VI-5: a strip keyed off a light background kept the key mixed into its half-see-through edge pixels (stored colour =
    a x paint + (1 - a) x key). Take the key back out: paint = (stored - (1 - a) x key) / a. Below a = 0.35 the division only
    amplifies noise, so those pixels are left to the bleed. An opaque pixel at the cut that is the key's own colour is key that
    the keyer missed, and goes (except on thin features)"""
    k = np.asarray(key, np.float32)
    a = alpha[..., None]
    soft = (alpha > 0.02) & (alpha < 0.98)
    paint = np.clip((rgb - (1 - a) * k) / np.maximum(a, 0.35), 0, 255)
    out = np.where(soft[..., None], paint, rgb)
    # opaque-looking pixels that are near the key's colour at the very edge are key, not paint
    # (not on thin features: the canopy's lianas are painted pale grey-green, close to white, and are all edge)
    lianas = ndimage.binary_dilation(thin(alpha >= 0.5, 8), iterations=2)
    near_key = (np.abs(rgb - k).max(-1) < 40) & (ndimage.distance_transform_edt(alpha >= 0.5) <= 3) & ~lianas
    alpha = np.where(near_key, 0, alpha)
    return out, alpha, int(soft.sum() + near_key.sum())


def grade(rgb, sat=1.12, warm=0.05):
    """VI-18 (World 4 reads grey): saturation up by `sat`, highlights warmed (red up, blue down by up to `warm` in the brightest
    paint, eased in from mid-grey up), luminance kept"""
    L = lum(rgb)[..., None]
    out = L + (rgb - L) * sat
    t = np.clip((L / 255 - 0.5) / 0.5, 0, 1)
    t = t * t * (3 - 2 * t)
    out = out * (1 + warm * t * np.array([1, 0.2, -1], np.float32))
    return np.clip(out * (L / np.maximum(lum(out)[..., None], 1e-3)), 0, 255)


def lum(rgb):
    return rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722


def unspeck(alpha, min_px=24, veil=None):
    """drop what keying left behind in the open sky: specks under `min_px` px and, with `veil`, faint (alpha < 0.5) veils more than
    `veil` px from the painting (the W1 canopy's leftover key; never on World 5, whose dusk haze is a painted veil)"""
    body = alpha >= 0.5
    drawn = alpha >= 0.04
    lab, n = ndimage.label(drawn)
    sizes = ndimage.sum(body, lab, range(1, n + 1))
    small = np.isin(lab, 1 + np.flatnonzero(sizes < min_px))
    gone = drawn & small
    if veil is not None:
        gone |= drawn & ~body & (ndimage.distance_transform_edt(~body) > veil)
    return np.where(gone, 0, alpha), int(gone.sum())


def bleed(rgb, trusted, reach=16):
    """fill every untrusted pixel with the nearby trusted colour: normalised Gaussian at growing sigma, nearest scale that reaches"""
    out = rgb.copy()
    todo = ~trusted
    w0 = trusted.astype(np.float32)
    for sigma in (1, 2, 4, 8):
        den = ndimage.gaussian_filter(w0, sigma)
        ok = todo & (den > 0.02)
        if ok.any():
            for c in range(3):
                num = ndimage.gaussian_filter(rgb[..., c] * w0, sigma)
                out[..., c][ok] = num[ok] / den[ok]
        todo &= ~ok
        if sigma * 2 >= reach and not todo.any():
            break
    return out, todo  # todo: pixels nothing trusted reaches (far out in the transparent area)


def ink_line(rgb, alpha, width=1.6, k=0.42):
    """an even line along the cut: colour darkened to k x local within `width` px of the alpha edge, smoothly. Only where the paint
    has a solid body (4+ px thick) within 3 px: see-through water ripples and wisps get no outline"""
    d = ndimage.distance_transform_edt(alpha >= 0.5)
    t = np.clip(width + 0.5 - d, 0, 1)  # 1 inside the line, ramps off over its last px
    yy, xx = np.mgrid[-2:3, -2:3]
    body = ndimage.binary_opening(alpha > 0.97, structure=xx * xx + yy * yy <= 4)
    t = t * np.clip(1.5 - ndimage.distance_transform_edt(~body) / 3, 0, 1)
    f = 1 - (1 - k) * t
    return rgb * f[..., None]


def process(src_rgba, scale=2.0, use_esrgan=False, ring=1.5, ink=False, do_despill=False, keep_line=False, veil=None, key=None, do_grade=False):
    rgb = src_rgba[..., :3].astype(np.float32)
    alpha = src_rgba[..., 3].astype(np.float32) / 255
    info = {}
    if do_grade:
        rgb = grade(rgb)
    if do_despill:
        rgb, info['despilled px'] = despill(rgb, alpha)
    if key is not None:
        rgb, alpha, info['unmixed px'] = unmix(rgb, alpha, key)
    if veil is not None:  # never on World 5: its cobwebs are faint specks and strands on purpose
        alpha, info['cleared px'] = unspeck(alpha, veil=veil)
    solid = alpha > 0.99
    dist = ndimage.distance_transform_edt(alpha >= 0.5)
    # a thin feature (under 2 px at 1024, under 4 at 2048 cleaned in place) has no inside to borrow from: its colour is all there is
    thin_w = 2 * max(ring / 1.5, 1)
    vine = thin(alpha >= 0.5, thin_w)
    # crumbs of the old painted outline are thin too, but short: a vine is a connected run of 12+ px
    lab, n = ndimage.label(vine, structure=np.ones((3, 3)))
    if n:
        vine &= np.isin(lab, 1 + np.flatnonzero(ndimage.sum(vine, lab, range(1, n + 1)) >= 12))
    core = solid & (dist > ring)
    # a thin feature is trusted unless it is much lighter than the paint around it (a stray strand of the white key, not a vine)
    ref, _ = bleed(rgb, core)
    light = lum(rgb) > 1.25 * lum(ref) + 10
    if key is not None:
        # the key is already un-mixed: what is left light is paint (the canopy's pale lianas), unless it is the key's own colour
        light &= np.abs(rgb - np.asarray(key, np.float32)).max(-1) < 60
    trusted = core | (vine & (alpha > (0.35 if key is not None else 0.3)) & ~light)
    if keep_line:
        trusted = alpha >= 0.5  # the strip's own ink line is clean and on purpose: keep every drawn pixel, only bleed outward
    rgb, _ = bleed(rgb, trusted)
    H, W = alpha.shape
    size = (round(W * scale), round(H * scale))
    if use_esrgan:
        big = resize(esrgan4x(rgb), size)
    elif scale != 1:
        big = resize(rgb, size)
    else:
        big = rgb
    if use_esrgan:  # the silhouette enlarged by the same model: smooth curves instead of Lanczos stair-steps
        a = np.clip(resize(esrgan4x(np.repeat(alpha[..., None] * 255, 3, -1)).mean(-1) / 255, size), 0, 1)
    elif scale != 1:
        a = np.clip(resize(alpha, size), 0, 1)
    else:
        a = alpha
    # erode 1 px and feather ~1.2 px; features under 4 px wide (8 on a 2048 strip cleaned in place, whose lianas are 5-7 px)
    # keep their alpha
    keep = ndimage.binary_dilation(thin(a >= 0.3, 4 * max(ring / 1.5, 1)), iterations=2)
    er = ndimage.grey_erosion(a, size=(3, 3))
    er = ndimage.gaussian_filter(er, 0.6)
    a2 = np.where(keep, a, np.minimum(a, er))
    a2 = ndimage.gaussian_filter(a2, 0.5)  # feather: the two blurs add to about 1.2 px of soft edge
    a2 = np.where(keep, np.maximum(a2, a * 0.9), a2)
    if keep_line:
        a2 = a  # no erode: it would thin the painted line
    if ink:
        big = ink_line(big, a2)
    # past 6 px into the transparent area the colour is never sampled: black there costs nothing in the file
    far = ndimage.distance_transform_edt(a2 < 0.01) > 6
    big[far] = 0
    out = np.dstack([np.clip(big, 0, 255), np.clip(a2 * 255, 0, 255)]).round().astype(np.uint8)
    return out, info


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('dst')
    ap.add_argument('--scale', type=float, default=2.0)
    ap.add_argument('--esrgan', action='store_true')
    ap.add_argument('--ring', type=float, default=1.5)
    ap.add_argument('--ink', action='store_true')
    ap.add_argument('--despill', action='store_true')
    ap.add_argument('--keep-line', action='store_true')
    ap.add_argument('--grade', action='store_true')
    ap.add_argument('--unveil', type=float, default=None)
    ap.add_argument('--unmix', default=None, help='r,g,b of a light key to take out of the edge pixels')
    ap.add_argument('--q', type=int, default=90)
    o = ap.parse_args()
    src = np.asarray(Image.open(o.src).convert('RGBA'))
    out, info = process(src, o.scale, o.esrgan, o.ring, o.ink, o.despill, o.keep_line, o.unveil, None if o.unmix is None else [float(v) for v in o.unmix.split(",")], o.grade)
    Image.fromarray(out, 'RGBA').save(o.dst, 'WEBP', quality=o.q, method=6)
    before, after = edge_stats(src), edge_stats(np.asarray(Image.open(o.dst).convert('RGBA')))
    print(f'{Path(o.dst).name}: {out.shape[1]}x{out.shape[0]} {Path(o.dst).stat().st_size} B  edge {before[0]:.2f} -> {after[0]:.2f}'
          f'  outer px {before[1]:.2f} -> {after[1]:.2f}  pink {before[2]*100:.1f}% -> {after[2]*100:.1f}%  {info or ""}')


if __name__ == '__main__':
    main()
