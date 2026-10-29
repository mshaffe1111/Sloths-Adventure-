"""Two touch-ups on the kept chairs take w7chairs-c-s60-41 (2026-10-29, lead review of v2):
  1. the eleventh chair came out a flat pale shape with almost no painted shading: repaint just that chair by img2img (~0.45);
  2. the brown rock clump right of centre: painted out roughly (the pillar behind it continued down, the floor under it shifted up
     from just below), then the same img2img pass blends it.
Step "starts" writes the two 256 px crops, scaled 3x to 768 for the model, as tools/art/hfbatch/starts/start-w7chairs-fix-*.webp;
step "paste" pastes the repainted crops back (scaled down, feathered, only inside each fix's own area) and writes the fixed take.
    python3 -I tools/art/hfbatch/chairfix.py starts <take.webp> <starts dir>
    python3 -I tools/art/hfbatch/chairfix.py paste <take.webp> <repaint dir> <out.webp>
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

STEP, TAKE = sys.argv[1], Path(sys.argv[2])
src = Image.open(TAKE).convert('RGB')
CROPS = {'c11': (1280, 160), 'rock': (852, 160)}  # top-left of each 256 x 256 crop in the take
K = 3


def prep():
    a = np.asarray(src).astype(np.float32).copy()
    # (1) the eleventh chair, toned down to the kit's stone first (it was near white), a little moss at its feet
    part = a[:385, 1400:]
    paint = part[..., 1] > np.minimum(part[..., 0], part[..., 2]) - 60
    part[paint] *= 0.74
    # (2) the rock: the pillar behind it continued down, the floor under it moved up from just below, the rest back to the key
    for x in range(936, 1016):
        ft = round(331 + (343 - 331) * (x - 936) / 80)  # the floor's back edge across the clump
        if 955 <= x <= 990:
            a[318:ft, x] = a[296:296 + (ft - 318), x]
        else:
            a[312:ft, x] = (255, 0, 255)
        a[ft:360, x] = a[ft + 18:360 + 18, x]
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    for cx in (1428, 1496):  # moss at the two feet of the eleventh chair
        d.ellipse((cx - 12, 378, cx + 12, 388), fill=(104, 128, 64))
    return im


if STEP == 'starts':
    out = Path(sys.argv[3])
    im = prep()
    im.save(out / 'chairfix-prepped.webp', 'WEBP', quality=95)
    for n, (x, y) in CROPS.items():
        c = im.crop((x, y, x + 256, y + 256)).resize((256 * K, 256 * K), Image.LANCZOS)
        c.save(out / f'start-w7chairs-fix-{n}.webp', 'WEBP', quality=94)
        print(n)
else:
    rep, out = Path(sys.argv[3]), Path(sys.argv[4])
    im = prep()
    masks = {'c11': (1392, 170, 1536, 384), 'rock': (930, 296, 1024, 364)}  # where each repaint is taken (take coords)
    for n, (x, y) in CROPS.items():
        r = Image.open(next(rep.glob(f'w7chairs-fix-{n}*.webp'))).convert('RGB').resize((256, 256), Image.LANCZOS)
        m = Image.new('L', (256, 256), 0)
        bx0, by0, bx1, by1 = masks[n]
        ImageDraw.Draw(m).rectangle((bx0 - x, by0 - y, bx1 - x, by1 - y), fill=255)
        im.paste(r, (x, y), m.filter(ImageFilter.GaussianBlur(3)))
    im.save(out, 'WEBP', quality=95)
    print(out)
