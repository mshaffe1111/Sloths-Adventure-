"""1-1's sunrise backdrop made properly periodic, its far's orchid corners repainted (engine-render, 2026-11-05; the lead's option B).

    python3 -I tools/art/strips/sunrise_fix.py starts <far.webp> <mid.webp> <out dir>      the rolled strips and the crops to repaint
    python3 -I tools/art/strips/sunrise_fix.py finish <out dir> <far take.png> <mid take.png>   the repaint composited back, feathered

Roll: each strip is turned by part of its width, so its new ends are columns that were side by side in the painting: the strip repeats
with no seam at all. The old seam (and, on the far, the orchid corners Matt saw, the dark corner leaves and the cut branch) then meet
inside the picture; only that crop is repainted (Qwen-Image + the style model, img2img), and it goes back through a feathered mask, so
the rest of each painting is untouched pixel for pixel.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

# the far: rolled by half; the repaint crop round its middle and bottom, where the orchids, the branch and the leaves meet
FAR_ROLL = 1080
FAR_BOX = (432, 470, 1728, 1302)          # 1296 x 832
FAR_TOP = (1230, 0, 1950, 240)            # the dark corner leaf at the top, its own small mask (inside the second crop)
FAR_BOX2 = (1104, 0, 2064, 320)           # 960 x 320
# the mid: rolled so its ends fall in an empty column (1899-2066 are fully transparent), the cut trunk then 133 px in
MID_ROLL = 1980
MID_BOX = (0, 406, 512, 1302)             # 512 x 896
KEY = (255, 0, 255)


def roll(a, k):
    return np.roll(a, -k, axis=1)


def feather(w, h, pad, bottom=True, top=True, left=True):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = (np.minimum(xx, w - 1 - xx) if left else w - 1 - xx)
    if top:
        d = np.minimum(d, yy)
    if bottom:
        d = np.minimum(d, h - 1 - yy)
    t = np.clip(d / pad, 0, 1)
    return t * t * (3 - 2 * t)


def starts(far, mid, out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    f = roll(np.asarray(Image.open(far).convert('RGB')), FAR_ROLL)
    Image.fromarray(f).save(out / 'far-rolled.png')
    x0, y0, x1, y1 = FAR_BOX
    c = f[y0:y1, x0:x1].astype(np.float32)
    # (the orchids' white and the seed pods' yellow would steer the repaint back to flowers: bright or yellow paint goes to the canopy's
    # deep teal first, then the middle is blurred; the hills and crowns at the crop's edges keep their colour, the shapes are the model's)
    lum = c @ np.array([0.3, 0.59, 0.11], np.float32)
    yel = (c[..., 0] > c[..., 2] + 25) & (c[..., 1] > 90)
    c[(lum > 105) | yel] = (34, 62, 56)
    crop = Image.fromarray(f[y0:y1, x0:x1])
    blur = Image.fromarray(c.astype(np.uint8)).filter(ImageFilter.GaussianBlur(30))
    # (the crop runs to the strip's bottom: no feather there)
    m = Image.fromarray((feather(*crop.size, 150, bottom=False) * 255).astype(np.uint8))
    Image.composite(blur, crop, m).save(out / 'far-start.png')
    bx0, by0, bx1, by1 = FAR_BOX2
    q = f[by0:by1, bx0:bx1].astype(np.float32)
    # (the dark corner leaf hangs into the sky: its paint, in the sky's rows, goes to that row's own sky colour before the blur)
    lq = q @ np.array([0.3, 0.59, 0.11], np.float32)
    for y in range(170):
        sky = q[y][lq[y] > 140]
        if len(sky):
            q[y][lq[y] < 120] = np.median(sky, axis=0)
    c2 = Image.fromarray(f[by0:by1, bx0:bx1])
    c2b = Image.fromarray(q.astype(np.uint8))
    Image.composite(c2b.filter(ImageFilter.GaussianBlur(30)), c2, Image.fromarray((feather(*c2.size, 120, top=False) * 255).astype(np.uint8))).save(out / 'far-start2.png')
    mm = roll(np.asarray(Image.open(mid).convert('RGBA')), MID_ROLL)
    Image.fromarray(mm).save(out / 'mid-rolled.png')
    x0, y0, x1, y1 = MID_BOX
    c = Image.fromarray(mm[y0:y1, x0:x1])
    bg = Image.new('RGBA', c.size, KEY + (255,))
    bg.alpha_composite(c)
    bg.convert('RGB').save(out / 'mid-start.png')
    print('starts in', out)


def finish(out, far_take, mid_take, far_take2=None):
    out = Path(out)
    f = np.asarray(Image.open(out / 'far-rolled.png').convert('RGB'), np.float32)
    for take, box, pad in ((far_take, FAR_BOX, 90), (far_take2, FAR_BOX2, 70)):
        if not take:
            continue
        x0, y0, x1, y1 = box
        t = np.asarray(Image.open(take).convert('RGB').resize((x1 - x0, y1 - y0), Image.LANCZOS), np.float32)
        # (a crop that runs to the strip's top or bottom keeps the repaint right to that edge)
        m = feather(x1 - x0, y1 - y0, pad, bottom=y1 < f.shape[0], top=y0 > 0)
        f[y0:y1, x0:x1] = m[..., None] * t + (1 - m[..., None]) * f[y0:y1, x0:x1]
    Image.fromarray(np.clip(f + 0.5, 0, 255).astype(np.uint8)).save(out / 'w1sunrise-far.webp', 'WEBP', quality=90, method=6)
    mm = np.asarray(Image.open(out / 'mid-rolled.png').convert('RGBA'), np.float32)
    x0, y0, x1, y1 = MID_BOX
    t = np.asarray(Image.open(mid_take).convert('RGB').resize((x1 - x0, y1 - y0), Image.LANCZOS), np.float32)
    # (key out the magenta: distance from the key colour; soft over a narrow band)
    d = np.sqrt(((t - np.array(KEY, np.float32)) ** 2).sum(-1))
    a = np.clip((d - 60) / 50, 0, 1)
    # (inside the crop the repaint replaces the old paint; at its right edge the old strip takes over over 80 px)
    xx = np.arange(x1 - x0, dtype=np.float32)
    w = np.clip((x1 - x0 - 1 - xx) / 80, 0, 1)[None, :]
    w = w * w * (3 - 2 * w)
    old = mm[y0:y1, x0:x1]
    na = a * w + old[..., 3] / 255 * (1 - w)
    rgb = (t * (a * w)[..., None] + old[..., :3] * (old[..., 3:4] / 255) * (1 - w)[..., None]) / np.maximum(na[..., None], 1e-4)
    mm[y0:y1, x0:x1, :3] = rgb
    mm[y0:y1, x0:x1, 3] = na * 255
    Image.fromarray(np.clip(mm + 0.5, 0, 255).astype(np.uint8), 'RGBA').save(out / 'w1sunrise-mid.webp', 'WEBP', quality=90, method=6)
    print('finished in', out)


# round 2 (er-sun2): the far's lower left (the original's foreground branch, its end hard shards) and the mid's canopy corner (a
# straight left edge the first repaint kept), each cut from round 1's result and repainted again
FAR_BOX3 = (0, 774, 912, 1302)            # 912 x 528
MID_BOX2 = (64, 448, 448, 768)            # 384 x 320


def starts2(out):
    out = Path(out)
    f = np.asarray(Image.open(out / 'w1sunrise-far.webp').convert('RGB'))
    x0, y0, x1, y1 = FAR_BOX3
    c = f[y0:y1, x0:x1].astype(np.float32)
    # (the branch's red-brown and its shards go to the canopy's deep teal, then a blur: the model paints treetops there)
    lum = c @ np.array([0.3, 0.59, 0.11], np.float32)
    br = (c[..., 0] > c[..., 1] + 8) | (lum < 32)
    c[br] = (30, 56, 52)
    crop = Image.fromarray(f[y0:y1, x0:x1])
    # (to its left edge too: the strip's other end, which meets it there, has no branch)
    m = Image.fromarray((feather(x1 - x0, y1 - y0, 120, bottom=False, left=False) * 255).astype(np.uint8))
    Image.composite(Image.fromarray(c.astype(np.uint8)).filter(ImageFilter.GaussianBlur(26)), crop, m).save(out / 'far-start3.png')
    mm = Image.open(out / 'w1sunrise-mid.webp').convert('RGBA')
    x0, y0, x1, y1 = MID_BOX2
    cm = mm.crop((x0, y0, x1, y1))
    a = np.asarray(cm, np.float32)
    # (the canopy's straight left edge: its first 70 columns' paint taken out, so the model rounds the crown there)
    a[:, :140, 3] *= np.clip((np.arange(140) - 70) / 70, 0, 1)[None, :]
    cm = Image.fromarray(a.astype(np.uint8), 'RGBA')
    bg = Image.new('RGBA', cm.size, KEY + (255,))
    bg.alpha_composite(cm)
    bg.convert('RGB').save(out / 'mid-start2.png')
    print('round 2 starts in', out)


def finish2(out, far_take, mid_take):
    out = Path(out)
    f = np.asarray(Image.open(out / 'w1sunrise-far.webp').convert('RGB'), np.float32)
    x0, y0, x1, y1 = FAR_BOX3
    t = np.asarray(Image.open(far_take).convert('RGB').resize((x1 - x0, y1 - y0), Image.LANCZOS), np.float32)
    # (the crop runs to the strip's left edge and bottom; the left edge is the repaint's, then joined to the strip's right end by a narrow
    # band below)
    m = feather(x1 - x0, y1 - y0, 90, bottom=False, left=False)
    f[y0:y1, x0:x1] = m[..., None] * t + (1 - m[..., None]) * f[y0:y1, x0:x1]
    Image.fromarray(np.clip(f + 0.5, 0, 255).astype(np.uint8)).save(out / 'w1sunrise-far.webp', 'WEBP', quality=90, method=6)
    mm = np.asarray(Image.open(out / 'w1sunrise-mid.webp').convert('RGBA'), np.float32)
    x0, y0, x1, y1 = MID_BOX2
    t = np.asarray(Image.open(mid_take).convert('RGB').resize((x1 - x0, y1 - y0), Image.LANCZOS), np.float32)
    d = np.sqrt(((t - np.array(KEY, np.float32)) ** 2).sum(-1))
    a = np.clip((d - 60) / 50, 0, 1)
    w = feather(x1 - x0, y1 - y0, 50)
    old = mm[y0:y1, x0:x1]
    na = a * w + old[..., 3] / 255 * (1 - w)
    rgb = (t * (a * w)[..., None] + old[..., :3] * (old[..., 3:4] / 255) * (1 - w)[..., None]) / np.maximum(na[..., None], 1e-4)
    mm[y0:y1, x0:x1, :3] = rgb
    mm[y0:y1, x0:x1, 3] = na * 255
    Image.fromarray(np.clip(mm + 0.5, 0, 255).astype(np.uint8), 'RGBA').save(out / 'w1sunrise-mid.webp', 'WEBP', quality=90, method=6)
    print('round 2 finished in', out)


if __name__ == '__main__' and sys.argv[1] in ('starts2', 'finish2'):
    (starts2 if sys.argv[1] == 'starts2' else finish2)(*sys.argv[2:])
    sys.exit(0)

if __name__ == '__main__':
    if sys.argv[1] == 'starts':
        starts(*sys.argv[2:5])
    else:
        finish(*sys.argv[2:6])
