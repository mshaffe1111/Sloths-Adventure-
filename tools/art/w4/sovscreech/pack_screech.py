"""Add the Sky Sovereign's two screech poses to her atlas (4-10): `screechPerch` (on a rock or ledge, head thrown back, beak wide)
and `screechAir` (hovering, wings spread wide, beak open, talons out).

    python3 -I tools/art/w4/sovscreech/pack_screech.py [--perch sov-screech-perch-final.png] [--air sov-screech-air-final.png]
                                                       [--flip-perch] [--flip-air] [--perch-h 122] [--air-h 124]
                                                       [--perch-ay 0.94] [--perch-beak X,Y] [--air-beak X,Y]

The frames in the game (2026-10-26, second pass) were packed from the finals with the defaults and --air-beak 116,63 (the guess
picks a wing tip there). The finals are stills/sov-screech-perch-3.png and stills/sov-screech-air-1.png on the HF repo.

The sources are PNGs on flat grey (#808080) like her other pose sources, facing RIGHT (pass --flip-* for one facing left). For each:
  - the grey is keyed out from the edges inwards (only grey joined to the border goes, so grey feathers inside her stay), with a
    soft edge, and the result is trimmed;
  - it is scaled to her other frames' size, judged by her head and body (not the box: the poses are taller than her others, the
    perch one upright and the air one with the wings raised): 122 / 124 px tall by default, which on the finals puts her head and
    body the size they are in `idle` and `alert` (145 left her head half as big again), so she does not grow when she screams;
  - it is roughened to her sheet frames' finish (`roughen`, --no-rough to skip): point-sampled down from twice the size for the
    same crunchy feather edges, sharpened, a little less colour (--sat), a hard alpha edge, and the generation's black outline
    shaved off (--erode px);
  - its colours are pulled to her painted frames' tone (the mean and spread of each channel), with a little grain (--grain, or
    --no-tone to keep the source colours): the generations are cleaner and lighter than her sheet;
  - the anchor is set like her other frames: the perch pose on its feet (`--perch-ay`, a share of its height: the feet on the
    branch), the air pose on its bottom edge (flying frames hang at the height of her hit box), and both in the middle across.
The two frames are packed in a new row under her other frames in src/assets/enemies/sovereign-atlas.webp, and
src/game/sovereignAtlasData.ts gets their entries and her beak in each (for the shimmer drawn at it, sovereignArt.ts). Running it
again replaces them. The game picks the frames up by name (sovereignSprite.ts SCREECH_FRAMES); until they are in the atlas it
falls back to the open-beak `alert` pose.
"""
import argparse
import json
import re
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

H = Path(__file__).resolve().parent
ROOT = H.parents[3]
ATLAS = ROOT / 'src/assets/enemies/sovereign-atlas.webp'
DATA = ROOT / 'src/game/sovereignAtlasData.ts'
NAMES = ('screechPerch', 'screechAir')
PAD = 2


def key_grey(im: Image.Image, tol: float = 30.0, soft: float = 22.0) -> Image.Image:
    """grey joined to the border becomes clear; the edge fades over `soft` levels of colour distance"""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    h, w, _ = a.shape
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(axis=2))
    near = dist < tol + soft
    # flood from the border through near-grey pixels only
    seen = np.zeros((h, w), bool)
    q = deque()
    for y in range(h):
        for x in (0, w - 1):
            if near[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for x in range(w):
        for y in (0, h - 1):
            if near[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and near[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    alpha = np.full((h, w), 255.0, np.float32)
    ramp = np.clip((dist - tol) / soft, 0, 1) * 255
    alpha[seen] = ramp[seen]
    out = np.dstack([a, alpha]).astype(np.uint8)
    img = Image.fromarray(out, 'RGBA')
    box = img.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    return img.crop(box) if box else img


def match_tone(im: Image.Image, ref: Image.Image, grain: float) -> Image.Image:
    """pull a pose's colours to her painted frames' tone: each channel's mean and spread over the solid pixels matched to the atlas's,
    then a little grain so the clean generation reads as rough as her other frames"""
    a = np.asarray(im).astype(np.float32)
    r = np.asarray(ref).astype(np.float32)
    m = a[..., 3] > 200
    rm = r[..., 3] > 200
    out = a.copy()
    for ch in range(3):
        src, dst = a[..., ch][m], r[..., ch][rm]
        k = dst.std() / max(1.0, src.std())
        out[..., ch] = (a[..., ch] - src.mean()) * k + dst.mean()
    if grain > 0:
        rng = np.random.default_rng(7)
        out[..., :3] += rng.normal(0, grain, out[..., :3].shape[:2])[..., None]
    out[..., :3] = np.clip(out[..., :3], 0, 255)
    return Image.fromarray(out.astype(np.uint8), 'RGBA')


def roughen(im: Image.Image, w: int, h: int, sat: float, erode: int) -> Image.Image:
    """make a clean generation read like her painted frames: drawn at twice the size and taken down by point sampling (the crunchy,
    aliased feather edges her sheet frames have), sharpened, its colour a little flatter, and the generation's dark outline shaved
    off (`erode` px of the edge: her other frames have no black contour)"""
    from PIL import ImageFilter
    big = im.resize((w * 2, h * 2), Image.LANCZOS)
    small = big.resize((w, h), Image.NEAREST)
    rgb = small.convert('RGB').filter(ImageFilter.UnsharpMask(radius=1.2, percent=120, threshold=2))
    a = np.asarray(rgb).astype(np.float32)
    grey = a.mean(axis=2, keepdims=True)
    a = grey + (a - grey) * sat
    al = np.asarray(small.getchannel('A')).astype(np.float32)
    al = np.where(al > 110, 255.0, 0.0)  # hard edge like the sheet frames
    for _ in range(erode):
        al = np.minimum.reduce([al, np.roll(al, 1, 0), np.roll(al, -1, 0), np.roll(al, 1, 1), np.roll(al, -1, 1)])
    out = Image.fromarray(np.dstack([np.clip(a, 0, 255), al]).astype(np.uint8), 'RGBA')
    box = out.getchannel('A').getbbox()
    return out.crop(box) if box else out


def beak_guess(im: Image.Image) -> tuple[int, int]:
    """the beak of a right-facing pose: the rightmost solid pixel in the top 45% of the frame"""
    al = np.asarray(im.getchannel('A'))
    top = al[: max(1, int(al.shape[0] * 0.45))]
    ys, xs = np.nonzero(top > 128)
    if not len(xs):
        return im.width - 1, im.height // 3
    i = int(np.argmax(xs))
    return int(xs[i]), int(ys[i])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--perch', default=str(H / 'sov-screech-perch-final.png'))
    ap.add_argument('--air', default=str(H / 'sov-screech-air-final.png'))
    ap.add_argument('--flip-perch', action='store_true')
    ap.add_argument('--flip-air', action='store_true')
    ap.add_argument('--perch-h', type=int, default=122)
    ap.add_argument('--air-h', type=int, default=124)
    ap.add_argument('--no-rough', action='store_true', help='plain resize, keep the generation\'s clean edges and outline')
    ap.add_argument('--sat', type=float, default=0.8, help='colour kept by the roughening (1 = all)')
    ap.add_argument('--erode', type=int, default=1)
    ap.add_argument('--perch-ay', type=float, default=0.94)
    ap.add_argument('--perch-beak')
    ap.add_argument('--air-beak')
    ap.add_argument('--no-tone', action='store_true', help='keep the sources\' own colours')
    ap.add_argument('--grain', type=float, default=6.0)
    o = ap.parse_args()

    src = DATA.read_text()
    m = re.search(r'export const SOVEREIGN_FRAMES: Record<string, BossFrame> = (\{.*?\});', src, re.S)
    frames = {k: v for k, v in json.loads(m.group(1)).items() if k not in NAMES}
    atlas = Image.open(ATLAS).convert('RGBA')
    base_h = max(f['y'] + f['h'] for f in frames.values())
    base = atlas.crop((0, 0, atlas.width, base_h))

    poses = []
    for name, path, flip in (('screechPerch', o.perch, o.flip_perch), ('screechAir', o.air, o.flip_air)):
        im = key_grey(Image.open(path))
        if flip:
            im = im.transpose(Image.FLIP_LEFT_RIGHT)
        k = (o.perch_h if name == 'screechPerch' else o.air_h) / im.height
        tw, th = max(1, round(im.width * k)), max(1, round(im.height * k))
        im = im.resize((tw, th), Image.LANCZOS) if o.no_rough else roughen(im, tw, th, o.sat, o.erode)
        if not o.no_tone:
            im = match_tone(im, base, o.grain)
        given = o.perch_beak if name == 'screechPerch' else o.air_beak
        beak = tuple(int(v) for v in given.split(',')) if given else beak_guess(im)
        ay = round(im.height * o.perch_ay) if name == 'screechPerch' else im.height
        poses.append((name, im, im.width / 2, ay, beak))

    row_h = max(p[1].height for p in poses)
    out = Image.new('RGBA', (atlas.width, base_h + PAD + row_h), (0, 0, 0, 0))
    out.paste(base, (0, 0))
    x = 0
    beaks = {}
    for name, im, ax, ay, beak in poses:
        assert x + im.width <= out.width, 'the screech poses do not fit across the atlas'
        out.paste(im, (x, base_h + PAD))
        frames[name] = {'x': x, 'y': base_h + PAD, 'w': im.width, 'h': im.height, 'ax': ax, 'ay': ay}
        # her beak, in atlas px from the anchor (x forward, y up)
        beaks[name] = {'dx': beak[0] - ax, 'dy': ay - beak[1]}
        x += im.width + PAD
    out.save(ATLAS, 'WEBP', quality=88, method=6)

    src = src.replace(m.group(1), json.dumps(frames))
    src = re.sub(r'export const SOVEREIGN_ATLAS_SIZE = \{[^}]*\};', f'export const SOVEREIGN_ATLAS_SIZE = {{ w: {out.width}, h: {out.height} }};', src)
    line = f'export const SOVEREIGN_SCREECH_BEAK: Record<string, {{ dx: number; dy: number }}> = {json.dumps(beaks)};'
    if 'SOVEREIGN_SCREECH_BEAK' in src:
        src = re.sub(r'export const SOVEREIGN_SCREECH_BEAK[^\n]*', line, src)
    else:
        src = src.rstrip('\n') + '\n/** her beak in the screech poses (pack_screech.py): atlas px from the anchor, forward and up */\n' + line + '\n'
    DATA.write_text(src)
    print('atlas', out.size, ATLAS.stat().st_size, 'bytes;', {n: frames[n] for n in NAMES}, beaks)


if __name__ == '__main__':
    main()
