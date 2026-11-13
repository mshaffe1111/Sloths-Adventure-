"""ART 11-13: finish 1-5's dusk strips (run in the HF sandbox): each pick is sized to World 1's own strip (w1-far 2640x1302,
w1-sky 2640x513, Lanczos), its wrap join cross-faded over 160 px (hflist1/wrapfix.py's colour blend; both strips are opaque here),
the sky given World 1's own sky alpha back (its foot fades over the far), and saved as WebP q90. Prints each wrap difference against
the strip's own neighbouring-column difference (the backdrop bar: no visible join).

    python duskfinish.py <far take.png> <sky take.png> <w1-sky.webp> <out dir>
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image

FADE = 160


def wrap(a):
    W = a.shape[1]
    t = np.linspace(1, 0, FADE)[None, :, None]
    head = a[:, W - FADE:] * t + a[:, :FADE] * (1 - t)
    o = np.concatenate([head, a[:, FADE:W - FADE]], 1)
    w = o.shape[1]
    jd = float(np.abs(o[:, 0] - o[:, w - 1]).mean())
    inner = float(np.median([np.abs(o[:, x] - o[:, x + 1]).mean() for x in range(100, w - 100, 97)]))
    return o, jd, inner


def main(far, sky, w1sky, od):
    od = Path(od); od.mkdir(parents=True, exist_ok=True)
    f = np.asarray(Image.open(far).convert('RGB').resize((2640 + FADE, 1302), Image.LANCZOS)).astype(np.float32)
    fo, jd, inner = wrap(f)
    Image.fromarray(np.clip(fo + .5, 0, 255).astype(np.uint8)).save(od / 'w1dusk-far.webp', quality=90, method=6)
    print('far', fo.shape[1], fo.shape[0], 'wrap diff %.1f interior %.1f' % (jd, inner))
    s = np.asarray(Image.open(sky).convert('RGB').resize((2640 + FADE, 513), Image.LANCZOS)).astype(np.float32)
    so, jd, inner = wrap(s)
    alpha = np.asarray(Image.open(w1sky).convert('RGBA').resize((so.shape[1], so.shape[0]), Image.LANCZOS))[..., 3:]
    out = np.concatenate([np.clip(so + .5, 0, 255).astype(np.uint8), alpha], 2)
    out[out[..., 3] == 0, :3] = 0
    Image.fromarray(out, 'RGBA').save(od / 'w1dusk-sky.webp', quality=90, method=6)
    print('sky', so.shape[1], so.shape[0], 'wrap diff %.1f interior %.1f' % (jd, inner))


if __name__ == '__main__' and sys.argv[1] != 'match':
    main(*sys.argv[1:5])


def match_sky(sky_path, far_path):
    """the engine overlaps the sky's foot on the far's top SKY_OVERLAP (5%) of the far's height (scenery.ts:1809); dusk's repaint left
    the sky lightest at its foot and the far darkest at its top (a light band at the join), so each sky row's mean is moved onto a ramp
    from the sky's own top to the far's top colour (cloud detail kept: only each row's mean shifts)"""
    sky = np.asarray(Image.open(sky_path).convert('RGBA')).astype(np.float32)
    far = np.asarray(Image.open(far_path).convert('RGB')).astype(np.float32)
    H = sky.shape[0]
    target_bot = far[:65].mean((0, 1))
    top = sky[:32, :, :3].mean((0, 1))
    rows = sky[..., :3].mean(1)  # H x 3
    t = np.linspace(0, 1, H)[:, None] ** 1.3
    want = top * (1 - t) + target_bot * t
    rgb = sky[..., :3] + (want - rows)[:, None, :]
    sky[..., :3] = np.clip(rgb, 0, 255)
    sky[sky[..., 3] == 0, :3] = 0
    Image.fromarray((sky + .5).astype(np.uint8), 'RGBA').save(sky_path, quality=90, method=6)
    print('sky foot now', sky[448:, :, :3].mean((0, 1)).round(), 'far top', target_bot.round())


if __name__ == '__main__' and len(sys.argv) > 1 and sys.argv[1] == 'match':
    match_sky(sys.argv[2], sys.argv[3])
