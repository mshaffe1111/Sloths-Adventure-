"""Pokey's vine-swing sheet with in-betweens (pokey-anim round 3, 2026-10-31): Matt's three vine pictures (src/assets/hero/hero-vine.webp,
cut 2026-10-24 by a scratchpad script that is not kept) and Qwen-Edit in-betweens of still->forward and still->back (spec-anim5.json),
repacked into hero-vine.webp + heroVineData.ts.

For an in-between: keyed off the grey, the thin vine Qwen drew taken out (cutStandard.strip_lines), scaled back to the sheet's px
(starts2.py drew the pictures 1.35x), and measured the way the old cut was: the grip (gx, gy) is his top paw (the topmost point of him near
where the start put his hands, a little in), psi is the way his body hangs from it (to the middle of the body, radians from straight down), phi (the vine's lean in the
picture) halfway between the two pictures it sits between. `measure` prints psi measured the same way on Matt's three, to check the rule.

    python3 -I tools/art/pokeyanim/vinepack.py measure
    python3 -I tools/art/pokeyanim/vinepack.py pack stillfwd=<png> stillback=<png>
"""
import math, re, sys
from pathlib import Path
import numpy as np
from PIL import Image

H = Path(__file__).resolve().parent
ROOT = H.parents[2]
sys.path.insert(0, str(H.parent / 'train'))
sys.path.insert(0, str(ROOT / 'scripts'))
from clips import key, bbox  # noqa: E402
from cutStandard import strip_lines  # noqa: E402

DATA = ROOT / 'src/game/heroVineData.ts'
ATLAS = ROOT / 'src/assets/hero/hero-vine.webp'
SCALE = 1 / 1.35
# (the order and the in-betweens' place: each sits between 'still' and the picture it leads to)
BETWEEN = {'stillfwd': 'forward', 'stillback': 'back'}


def old_frames():
    txt = DATA.read_text()
    out = {}
    for m in re.finditer(r"(\w+): \{ ([^}]*) \}", txt):
        out[m.group(1)] = {k.strip(): float(v) for k, v in (p.split(':') for p in m.group(2).split(','))}
    body = float(re.search(r'VINE_BODY_PX = ([\d.]+)', txt).group(1))
    return out, body


def psi_of(alpha, gx, gy):
    ys, xs = np.nonzero(alpha > 128)
    return math.atan2(xs.mean() - gx, ys.mean() - gy)


def measure():
    fr, _ = old_frames()
    im = Image.open(ATLAS).convert('RGBA')
    for n, f in fr.items():
        a = np.asarray(im.crop((int(f['x']), int(f['y']), int(f['x'] + f['w']), int(f['y'] + f['h']))))[..., 3]
        print(n, 'psi in the data', f['psi'], 'measured', round(psi_of(a, f['gx'], f['gy']), 3))


def pack(args):
    fr, body = old_frames()
    atlas = Image.open(ATLAS).convert('RGBA')
    pics = {n: atlas.crop((int(f['x']), int(f['y']), int(f['x'] + f['w']), int(f['y'] + f['h']))) for n, f in fr.items()}
    meta = {n: dict(gx=f['gx'], gy=f['gy'], phi=f['phi'], psi=f['psi']) for n, f in fr.items()}
    for arg in args:
        name, path = arg.split('=', 1)
        rgb = np.asarray(Image.open(path).convert('RGB'))
        a = key(rgb)
        m = strip_lines((a > 128).astype(np.uint8) * 255, min_len=40)
        a = np.where(m > 0, a, 0).astype(np.uint8)
        x0, y0, x1, y1 = bbox(a)
        x0, y0, x1, y1 = max(0, x0 - 4), max(0, y0 - 4), x1 + 4, y1 + 4
        im = Image.fromarray(np.dstack([rgb, a]), 'RGBA').crop((x0, y0, x1, y1))
        im = im.resize((round(im.width * SCALE), round(im.height * SCALE)), Image.LANCZOS)
        al = np.asarray(im)[..., 3]
        # (his paws, not his head: starts2.py put the grip at (384, 80) of the 768 px picture, and his head can rise above his paws in a
        # swing, so the grip is the top of him near there)
        hx, hy = (384 - x0) * SCALE, (80 - y0) * SCALE
        ys, xs = np.nonzero(al > 128)
        near = (np.abs(xs - hx) < 60 * SCALE) & (ys < hy + 80 * SCALE)
        top = ys[near].min()
        gx = float(np.median(xs[near & (ys < top + 6)]))
        gy = float(top + 6)
        other = fr[BETWEEN[name]]
        pics[name] = im
        meta[name] = dict(gx=round(gx, 1), gy=round(gy, 1), phi=round((fr['still']['phi'] + other['phi']) / 2, 3), psi=round(psi_of(al, gx, gy), 3))
        print(name, im.size, meta[name])
    order = ['still', 'stillfwd', 'forward', 'stillback', 'back']
    order = [n for n in order if n in pics]
    W = sum(pics[n].width for n in order) + 8 * (len(order) - 1)
    Hh = max(pics[n].height for n in order)
    sheet = Image.new('RGBA', (W, Hh), (0, 0, 0, 0))
    x = 0
    lines = ["// generated from Matt's vine-swing sheets (2026-10-24, by a scratchpad cut) and Qwen-Edit in-betweens (stillfwd, stillback:",
             '// tools/art/pokeyanim/vinepack.py, 2026-10-31): Pokey holding a vine, the drawn vine taken out so he holds the real one.',
             '// psi: which way his body hangs from the grip in the picture (radians from straight down, to the middle of the body)',
             '// gx, gy: where his top hand grips (the point on the vine); phi: the vine\'s lean in the picture (radians from straight down, positive = its foot to the right)',
             'export const VINE_FRAMES = {']
    for n in order:
        im = pics[n]
        sheet.alpha_composite(im, (x, 0))
        m = meta[n]
        lines.append(f"  {n}: {{ x: {x}, y: 0, w: {im.width}, h: {im.height}, gx: {m['gx']}, gy: {m['gy']}, phi: {m['phi']}, psi: {m['psi']} }},")
        x += im.width + 8
    lines += ['} as const;', '/** the hanging body\'s height in the still frame, grip to toes, in atlas pixels (sized against the standing hero) */',
              f'export const VINE_BODY_PX = {body};', '']
    sheet.save(ATLAS, 'WEBP', quality=90, method=6)
    DATA.write_text('\n'.join(lines))
    print(ATLAS, sheet.size, ATLAS.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    measure() if sys.argv[1] == 'measure' else pack(sys.argv[2:])
