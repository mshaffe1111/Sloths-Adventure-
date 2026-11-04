"""Starts, round 2 (hf-backdrops2, 2026-11-01). Fixes what round 1's paste-ups (starts.py) left in the repaint:
  - squared notches where two pieces met (W4 terraces / W6 dawn near, the W3 sinkhole pillar cut): pieces now overlap and their cut
    edges are feathered, over a continuous ground band tiled from the source strip, so no straight edge and no gap is left to paint;
  - a hard canopy band (every W8 middle) and crowns cut flat or faded at the top: the source's fade is dropped, an optional top band is
    trimmed off, and every run of columns that touched the top gets a whole rounded crown blob above it (in the strip's own foliage
    colour) with plain magenta above, so the repaint finishes a round crown;
  - pink water (W2 near): a near strip's half-transparent pixels (river water) are dropped, so magenta never shows through paint;
  - narrow strips: the laid row always fills the full width.
Modes: remix (pieces cut, shuffled, laid in a new order: a new strip) and crown (the whole strip kept in place, shrunk, crowns added:
the crown-top fix for an old middle strip).
    python3 -I tools/art/hfbackdrops/starts2.py <out dir> <name> <src stem> <mid|near> <grade> <seed> <remix|crown> [trim] [W H]
"""
import random, sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from starts import GRADE, MAG, pieces  # noqa: E402


def noise(h, w, rnd, scale=24):
    g = np.array([[rnd.random() for _ in range(w // scale + 2)] for _ in range(h // scale + 2)], np.float32)
    return np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(np.float32) / 255


def crowns(src, rnd, trim=0.0):
    """drop the fade, trim the top band, add a round crown blob over every run of columns that touched the (new) top"""
    sh, sw = src.shape[:2]
    a = src[..., 3]
    a[a < 245] = 0
    t0 = round(sh * trim)
    a[:t0] = 0
    opaque = a > 128
    tc = np.where(opaque.any(0), opaque.argmax(0), sh)
    t0 = int(np.percentile(tc[tc < sh], 5)) if (tc < sh).any() else t0  # (the real top line, under any dropped fade)
    top_rows = tc < t0 + round(sh * 0.07)
    band = src[t0:t0 + round(sh * 0.2)][opaque[t0:t0 + round(sh * 0.2)]]
    fol = band[:, :3].mean(0) if len(band) else np.array([60, 90, 50], np.float32)
    M = round(sh * 0.34)
    out = np.zeros((sh + M, sw, 4), np.float32)
    out[M:] = src
    yy, xx = np.mgrid[0:sh + M, 0:sw]
    tex = noise(sh + M, sw, rnd, 18)
    x = 0
    while x < sw:
        if not top_rows[x]:
            x += 1
            continue
        e = x
        while e < sw and top_rows[e]:
            e += 1
        w = e - x
        if w > 30:
            # one crown per ~420 px of run, each a lumpy ellipse
            n = max(1, round(w / 420))
            for k in range(n):
                cx = x + (k + 0.5) * w / n
                rx = w / n * rnd.uniform(0.55, 0.68)
                ry = min(M + 0.08 * sh, rx * rnd.uniform(0.55, 0.75))
                cy = M + t0 + ry * 0.35
                d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
                lump = 1 + 0.12 * (tex - 0.5) * 2
                m = d < lump
                shade = (0.78 + 0.4 * tex[..., None]) * (1.08 - 0.25 * np.clip((yy - (cy - ry)) / (2 * ry), 0, 1))[..., None]
                col = fol * shade
                put = m & (out[..., 3] < 200)
                out[..., :3][put] = col[put]
                out[..., 3][put] = 255
        x = e
    return out


def feather(p, px, left, right, rnd=random.Random(5)):
    """a ragged hard edge instead of the straight cut (a soft alpha ramp blended the paint into magenta: purple smears)"""
    p = p.copy()
    h, w = p.shape[:2]
    r = np.ones((h, w), np.float32)
    k = min(px, w // 3)
    nz = noise(h, k, rnd, 10)
    ramp = np.linspace(0, 1, k)[None, :]
    if left:
        r[:, :k] = (ramp > nz * 0.9).astype(np.float32)
    if right:
        r[:, w - k:] = np.minimum(r[:, w - k:], (ramp[:, ::-1] > nz[:, ::-1] * 0.9).astype(np.float32))
    p[..., 3] *= r
    return p


def main(out, name, stem, part, grade, seed, mode, trim=0.0, W=2048, H=None):
    rnd = random.Random(seed)
    src = np.asarray(Image.open(ROOT / f'src/assets/backdrops/{stem}-{part}.webp').convert('RGBA')).astype(np.float32)
    if part == 'near':
        src[..., 3][src[..., 3] < 235] = 0  # (the half-transparent water: magenta showed through it, pink river, round 1)
        src = np.concatenate([np.zeros((round(src.shape[0] * 0.15), src.shape[1], 4), np.float32), src])
    else:
        src = crowns(src, rnd, trim)
    sh, sw = src.shape[:2]
    H = H or (1104 if part == 'mid' else 1072)
    if mode == 'crown':
        k = H / sh
        lay = np.asarray(Image.fromarray(src.clip(0, 255).astype(np.uint8)).resize((round(sw * k), H), Image.LANCZOS)).astype(np.float32)
        lay = np.asarray(Image.fromarray(lay.astype(np.uint8)).resize((W, H), Image.LANCZOS)).astype(np.float32)
    else:
        ps = pieces(src, 5, rnd)
        rnd.shuffle(ps)
        k = H / sh
        canvas = np.zeros((H, W * 2, 4), np.float32)
        # a continuous ground band from the source's own bottom rows, under everything (no gap between pieces reaches the bottom)
        g = max(8, round(sh * (0.09 if part == 'mid' else 0.2)))
        gb = src[sh - g:]
        gb = gb[:, gb[..., 3].mean(0) > 200] if (gb[..., 3].mean(0) > 200).sum() > 64 else gb
        gs = round(g * k * 0.8)
        gim = np.asarray(Image.fromarray(gb.clip(0, 255).astype(np.uint8)).resize((max(8, round(gb.shape[1] * k * 0.8)), gs), Image.LANCZOS)).astype(np.float32)
        x = 0
        while x < canvas.shape[1]:
            x1 = min(x + gim.shape[1], canvas.shape[1])
            canvas[H - gs:, x:x1] = gim[:, :x1 - x]
            x = x1
        canvas[H - gs:, :, 3] = 255
        x = 0
        for i, p in enumerate(ps):
            s = k * rnd.uniform(0.74, 0.88)
            q = np.asarray(Image.fromarray(p.clip(0, 255).astype(np.uint8)).resize((max(8, round(p.shape[1] * s)), round(sh * s)), Image.LANCZOS)).astype(np.float32)
            q = feather(q, 90, i > 0, True, rnd)
            ph, pw = q.shape[:2]
            if ph > H:
                q, ph = q[ph - H:], H
            y0 = H - ph
            x1 = min(x + pw, canvas.shape[1])
            reg = canvas[y0:H, x:x1]
            al = q[:, :x1 - x, 3:4] / 255
            reg[..., :3] = q[:, :x1 - x, :3] * al + reg[..., :3] * (1 - al)
            reg[..., 3:4] = np.maximum(reg[..., 3:4], q[:, :x1 - x, 3:4])
            x += round(pw * rnd.uniform(0.72, 0.84))
        end = x + round(pw * 0.2)
        # the right end feathers into the ground band; the last piece's ramp runs into the start of the row (it wraps when keyed)
        from scipy import ndimage
        lab, n = ndimage.label(canvas[..., 3] > 60)
        grounded = set(np.unique(lab[-max(8, H // 12):])) - {0}
        canvas[..., 3] *= ndimage.binary_dilation(np.isin(lab, list(grounded)), iterations=2)
        lay = np.asarray(Image.fromarray(canvas[:, :end].clip(0, 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)).astype(np.float32)
    mul, add = GRADE[grade]
    rgb = lay[..., :3] * np.array(mul) + np.array(add)
    al = lay[..., 3:4] / 255
    rgb = rgb * al + MAG * (1 - al)
    Path(out).mkdir(parents=True, exist_ok=True)
    p = Path(out) / f'start-{name}.webp'
    Image.fromarray(rgb.clip(0, 255).astype(np.uint8)).save(p, quality=92)
    print(p, W, H)


if __name__ == '__main__':
    a = sys.argv[1:]
    main(a[0], a[1], a[2], a[3], a[4], int(a[5]), a[6], float(a[7]) if len(a) > 7 else 0.0, *(int(v) for v in a[8:10]))
