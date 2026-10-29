"""4-D's rope bridges (VI-18, 2026-10-29): the painted bridges in Dot's far backdrops (dot-far-1, dot-far-2) sit under the stage's haze
and read as washed out. This lifts each bridge out of its own painting (the dark rope pixels inside a band around it, soft-edged) into
an overlay the game lays back on top of the haze, with a soft shadow line under it (dotFlightArt.ts drawDotBackdrop). The paintings
themselves are not changed.
    python3 -I tools/art/hfbosses/dotbridge.py <game checkout>
Out: src/assets/props/dot-bridges.webp (the two overlays side by side, each at the painting's own size / 2) + its json.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

GAME = Path(sys.argv[1])
# the band each bridge lies in (fractions of the painting): x0, x1, y0, y1
BANDS = {'far1': [(0.17, 0.82, 0.50, 0.88)], 'far2': [(0.40, 0.92, 0.42, 0.58), (0.09, 0.99, 0.56, 0.82), (0.06, 0.09, 0.56, 0.70)]}
# boxes left out (the dark rock under far-2's left post joins the rope)
EXCLUDE = {'far2': [(0.0, 0.16, 0.69, 0.9)]}
outs = []
for name, bands in BANDS.items():
    im = Image.open(GAME / f'src/assets/backdrops/dot-{name.replace("far", "far-")}.webp').convert('RGB')
    a = np.asarray(im).astype(np.float32)
    H, W = a.shape[:2]
    lum = a.mean(axis=2)
    band = np.zeros((H, W), bool)
    for x0, x1, y0, y1 in bands:
        band[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)] = True
    for x0, x1, y0, y1 in EXCLUDE.get(name, []):
        band[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)] = False
    rope = (lum < 95) & band
    # (keep the long connected runs of rope, not the dark rock edges: a component must be wide and thin)
    lab, n = ndimage.label(ndimage.binary_dilation(rope, iterations=1))
    keep = np.zeros_like(rope)
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        if sl is None:
            continue
        w = sl[1].stop - sl[1].start
        h = sl[0].stop - sl[0].start
        if w > W * 0.2 and w > h * 2.2:
            keep |= lab == i
    keep &= rope | ndimage.binary_dilation(rope, iterations=1)
    alpha = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    # a touch darker and warmer than in the painting, so it holds against the haze
    rgb = np.clip(a * np.array([0.62, 0.58, 0.56]), 0, 255).astype(np.uint8)
    o = Image.fromarray(rgb).convert('RGBA')
    o.putalpha(alpha)
    o = o.resize((W // 2, H // 2), Image.LANCZOS)
    outs.append((name, o, int(keep.sum())))
    # its soft shadow line: the rope's shape, blurred wide and set a little lower, dark and faint
    sh = Image.fromarray((ndimage.binary_dilation(keep, iterations=3) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(7))
    sh = Image.fromarray((np.asarray(sh).astype(np.float32) * 0.55).astype(np.uint8))
    s2 = Image.new('RGBA', (W, H), (24, 18, 30, 0))
    s2.putalpha(sh)
    outs.append((name + '-shadow', s2.resize((W // 2, H // 2), Image.LANCZOS), 0))
    print(name, int(keep.sum()), 'px of rope')
S = Image.new('RGBA', (sum(o.width for _, o, _ in outs), max(o.height for _, o, _ in outs)), (0, 0, 0, 0))
frames, x = {}, 0
for name, o, _ in outs:
    S.paste(o, (x, 0))
    frames[name] = {'x': x, 'y': 0, 'w': o.width, 'h': o.height}
    x += o.width
out = GAME / 'src/assets/props/dot-bridges.webp'
S.save(out, 'WEBP', quality=88, method=6)
(out.with_suffix('.json')).write_text(json.dumps(frames))
print(out, S.size, out.stat().st_size)
