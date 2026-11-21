"""ART-UNDER (11-21): paste-up starts for World 2's painted earth UNDERSIDE (an upper leg seen from below, 2-7's way home).
Writes reference/art/hfunder/starts/{under0,under1,under2,corner,ref}.png (pictures under tools/ are git-ignored).

  under<k>  1536 x 384 (cut to 1024 x 256, shown 512 x 128): the top ~135 px IS World 2's soil fill (its own sheet, at the strip's
            scale: 3 start px a unit against the fill's 1018 px per 600), then a lumpy periodic overhang edge in shadow, roots and clods
            hanging below it, flat grey (128) under everything.
  corner    512 x 768 (cut to 384 x 576, the end frame's scale): soil top-left, the end face down the right side, turning at the
            bottom-right into the underside edge along the bottom, roots off both. Mirrored in code for the other side.
  ref       the W2 end frame and a fill crop on grey: the style reference.

    python3 -I tools/art/hfunder/starts.py
"""
import math
import os
import random
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
OUT = os.path.join(ROOT, 'reference/art/hfunder/starts')
GREY = (128, 128, 128)
SHEET = Image.open(os.path.join(ROOT, 'src/assets/ground/w2.webp')).convert('RGBA')
FILL = SHEET.crop((3, 3, 1021, 1021)).convert('RGB')  # fill 0, FILL_INSET in
END = SHEET.crop((1024, 2208, 1408, 2784))
ROOT_DARK, ROOT_MID, ROOT_LIT, LINE = (58, 38, 24), (88, 60, 38), (120, 86, 55), (42, 27, 17)


def fill_at(scale, w, h, ox=0, oy=0):
    """the fill tiled at `scale` start px per fill px, w x h"""
    t = FILL.resize((round(FILL.width * scale), round(FILL.height * scale)), Image.LANCZOS)
    c = Image.new('RGB', (w, h))
    for y in range(-oy, h, t.height):
        for x in range(-ox, w, t.width):
            c.paste(t, (x, y))
    return c


def edge_line(w, base, rng, amp=1.0):
    """a periodic lumpy line (y per x), never straight: sines on whole periods plus hanging bulges"""
    x = np.arange(w)
    y = np.full(w, float(base))
    for k, a in ((2, 14), (3, 12), (5, 9), (8, 6), (13, 4), (21, 2.5)):
        y += amp * a * np.sin(2 * math.pi * k * x / w + rng.uniform(0, 2 * math.pi))
    for _ in range(rng.randint(5, 7)):  # lumps of earth bulging down
        cx, hw, d = rng.uniform(0, w), rng.uniform(40, 110), rng.uniform(14, 34) * amp
        dx = np.minimum(np.abs(x - cx), w - np.abs(x - cx))
        y += d * np.clip(1 - (dx / hw) ** 2, 0, None) ** 0.5
    return y


def root(dr, x, y, length, rng, width):
    """a hanging root: tapering, wandering, with a rootlet or two"""
    pts = [(x, y)]
    ang = math.pi / 2 + rng.uniform(-0.25, 0.25)
    for i in range(int(length / 6)):
        ang += rng.uniform(-0.18, 0.18)
        ang = min(max(ang, math.pi / 2 - 0.6), math.pi / 2 + 0.6)
        x, y = x + 6 * math.cos(ang), y + 6 * math.sin(ang)
        pts.append((x, y))
    n = len(pts)
    for i in range(n - 1):
        wd = max(1, width * (1 - i / n))
        dr.line([pts[i], pts[i + 1]], fill=ROOT_DARK, width=round(wd + 1.5))
    for i in range(n - 1):
        wd = max(1, width * (1 - i / n) * 0.45)
        dr.line([(pts[i][0] - wd * 0.4, pts[i][1]), (pts[i + 1][0] - wd * 0.4, pts[i + 1][1])], fill=ROOT_LIT if width > 3 else ROOT_MID,
                width=max(1, round(wd)))
    for _ in range(rng.randint(1, 3)):  # rootlets
        j = rng.randint(1, max(1, n - 3))
        bx, by = pts[j]
        a2 = math.pi / 2 + rng.choice((-1, 1)) * rng.uniform(0.5, 0.9)
        L = rng.uniform(15, 40)
        dr.line([(bx, by), (bx + L * math.cos(a2), by + L * math.sin(a2))], fill=ROOT_DARK, width=1)


def shade(img, mask_bottom, top0, top1, low=0.6):
    """brightness 1.0 above top0, ramping to `low` at top1 and below (ground seen from below is in shadow)"""
    a = np.asarray(img).astype(float)
    yy = np.arange(a.shape[0])[:, None]
    m = np.clip((yy - top0) / max(1, top1 - top0), 0, 1)
    m = 1 - (1 - low) * m
    a *= m[..., None] if m.ndim == 2 else m
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def strip(k):
    rng = random.Random(1121 + 17 * k)
    W, H = 1536, 384
    soil = fill_at(3 / 1.697, W, H, ox=rng.randint(0, 900), oy=rng.randint(0, 600))
    e = edge_line(W, 222, rng)
    # shadow: full fill to ~120, ramping to 60% by ~185, and 55% hard under the edge's last 20 px
    a = np.asarray(soil).astype(float)
    yy = np.arange(H)[:, None].astype(float)
    m = 1 - 0.4 * np.clip((yy - 118) / 70, 0, 1)
    m = np.minimum(m, 1 - 0.45 * np.clip((yy - (e[None, :] - 22)) / 22, 0, 1))
    a *= m[..., None]
    soil = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    mask = Image.fromarray((yy < e[None, :]).astype(np.uint8) * 255)
    out = Image.new('RGB', (W, H), GREY)
    out.paste(soil, (0, 0), mask)
    dr = ImageDraw.Draw(out)
    # the edge's fine dark line
    for x in range(W):
        y = e[x]
        dr.line([(x, y - 3), (x, y)], fill=LINE)
    # clods: small lumps hanging from the edge
    for _ in range(rng.randint(3, 4)):
        x = rng.uniform(40, W - 40)
        y = e[int(x)]
        r = rng.uniform(8, 15)
        dr.ellipse([x - r * 1.3, y - r * 0.6, x + r * 1.3, y + r * 1.2], fill=(84, 60, 40), outline=LINE, width=2)
    # roots: 8-11, 60-195 px (40-130 sheet px)
    xs = sorted(rng.uniform(20, W - 20) for _ in range(rng.randint(8, 11)))
    for x in xs:
        root(dr, x, e[int(x)] - 2, rng.uniform(60, 190), rng, rng.choice((2, 3, 4, 5)))
    return out


def corner():
    rng = random.Random(4421)
    W, H = 512, 768
    soil = fill_at(2.56 / 1.697, W, H, ox=300, oy=200)
    # the outline: face down the right at ~0.80 W wobbling, turning through a round corner into the bottom edge at ~0.70 H
    fx, by, R = 0.80 * W, 0.70 * H, 150
    y = np.arange(H)
    face = fx + 10 * np.sin(y / 37) + 6 * np.sin(y / 13 + 1)
    x = np.arange(W)
    bot = by + 10 * np.sin(x / 41 + 2) + 6 * np.sin(x / 15) + 0
    for _ in range(3):
        cx, hw, d = rng.uniform(40, fx - R), rng.uniform(30, 70), rng.uniform(12, 26)
        bot += d * np.clip(1 - ((x - cx) / hw) ** 2, 0, None) ** 0.5
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    inside = (xx < face[:, None]) & (yy < bot[None, :])
    # round the corner: inside the corner box, keep only within R of the corner's centre
    ccx, ccy = fx - R, by - R
    box = (xx > ccx) & (yy > ccy)
    inside &= ~box | (np.hypot(xx - ccx, yy - ccy) < R + 6 * np.sin(np.arctan2(yy - ccy, xx - ccx) * 7))
    a = np.asarray(soil).astype(float)
    # shadow toward the underside (bottom) and a little toward the face
    db = np.clip((yy - (by - 150)) / 130, 0, 1)
    dfc = np.clip((xx - (fx - 60)) / 60, 0, 1)
    m = 1 - 0.4 * db - 0.12 * dfc * (1 - db)
    a *= m[..., None]
    soil = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    out = Image.new('RGB', (W, H), GREY)
    mask = Image.fromarray(inside.astype(np.uint8) * 255)
    out.paste(soil, (0, 0), mask)
    edge = np.asarray(mask.filter(ImageFilter.MaxFilter(5))).astype(int) - np.asarray(mask).astype(int)
    o = np.asarray(out).copy()
    o[edge > 0] = LINE
    out = Image.fromarray(o)
    dr = ImageDraw.Draw(out)
    col = inside.any(axis=0)
    lowest = np.where(col, H - 1 - np.argmax(inside[::-1, :], axis=0), -1)
    for xr in sorted(rng.uniform(20, fx - 20) for _ in range(6)):
        root(dr, xr, lowest[int(xr)] - 2, rng.uniform(55, 160), rng, rng.choice((2, 3, 4)))
    # roots off the face (as the end frame has), hanging from a few points down it
    for yr in (180, 330, 470):
        xr = face[yr]
        root(dr, xr - 2, yr, rng.uniform(50, 120), rng, 2)
    for _ in range(2):
        xr = rng.uniform(60, fx - R)
        yv = lowest[int(xr)]
        r = rng.uniform(8, 13)
        dr.ellipse([xr - r * 1.3, yv - r * 0.6, xr + r * 1.3, yv + r * 1.2], fill=(84, 60, 40), outline=LINE, width=2)
    return out


def ref():
    c = Image.new('RGB', (1024, 512), GREY)
    e = END.resize((341, 512), Image.LANCZOS)
    c.paste(e, (0, 0), e)
    c.paste(fill_at(0.75, 640, 512), (370, 0))
    return c


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for k in range(3):
        strip(k).save(os.path.join(OUT, f'under{k}.png'))
    corner().save(os.path.join(OUT, 'corner.png'))
    ref().save(os.path.join(OUT, 'ref.png'))
    print('starts ->', OUT, file=sys.stderr)
