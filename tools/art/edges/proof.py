"""Before/after crops of every strip set at phone size, upright (390x844) and sideways (844x390), plus the edge table.

    python3 -I tools/art/edges/proof.py <before rev> <out dir> [<no-ink take dir>]

Before = the strips at <before rev>; after = the working tree. Each set is drawn as the game layers it (far, then mid, then near)
and cropped where the most cut edge is, at the size a phone shows it (portrait magnifies a strip about 2x: a 195x422 strip window
fills the 390x844 screen; sideways about 1x). Writes <set>-up.png, <set>-side.png (before left, after right) and edges.md."""
import io
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
from measure import edge_stats  # noqa: E402

ROOT = Path(__file__).resolve().parents[3]
BACK = 'src/assets/backdrops'
SETS = ['w1', 'w1c', 'w2', 'w3', 'w4', 'w5', 'w5gold2', 'w5dusk1', 'w5dusk2', 'w5twi1', 'w5twi2', 'w5night', 'w6', 'w7', 'w8', 'w9',
        'w10']


def load(rev, name):
    if rev is None:
        p = ROOT / BACK / f'{name}.webp'
        return Image.open(p).convert('RGBA') if p.exists() else None
    r = subprocess.run(['git', 'show', f'{rev}:{BACK}/{name}.webp'], cwd=ROOT, capture_output=True)
    return Image.open(io.BytesIO(r.stdout)).convert('RGBA') if r.returncode == 0 else None


def scene(rev, s):
    """far, mid and near layered as the game draws them (bottoms aligned, 2048 wide), and where the mid and near cut edges are"""
    far = load(rev, f'{"w1" if s == "w1c" else s}-far') or load(None, f'{"w1" if s == "w1c" else s}-far')
    W = 2048
    layers = [far.resize((W, round(far.height * W / far.width)))]
    for part in ('mid', 'near'):
        im = load(rev, f'{s}-{part}')
        layers.append(im.resize((W, round(im.height * W / im.width)), Image.LANCZOS))
    H = max(l.height for l in layers)
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    edge = np.zeros((H, W), bool)
    for k, l in enumerate(layers):
        out.alpha_composite(l, (0, H - l.height))
        if k:
            al = np.asarray(l)[..., 3] > 127
            edge[H - l.height:] |= al ^ ndimage.binary_erosion(al)
    return out, edge


def edgiest(edge, w, h):
    """top-left of the w x h window with the most cut edge"""
    ii = ndimage.uniform_filter(edge.astype(np.float32), (h, w), mode='constant')
    H, W = edge.shape
    sub = ii[h // 2:H - (h - h // 2) + 1, w // 2:W - (w - w // 2) + 1]
    y, x = np.unravel_index(np.argmax(sub), sub.shape)
    return int(x), int(y)


def pair(before, after, box, size, label):
    tiles = []
    for im, tag in ((before, 'before'), (after, 'after')):
        t = im.crop(box).resize(size, Image.LANCZOS).convert('RGB')
        d = ImageDraw.Draw(t)
        d.rectangle((0, 0, 120, 26), fill=(0, 0, 0))
        d.text((6, 6), f'{label} {tag}', fill=(255, 255, 255))
        tiles.append(t)
    o = Image.new('RGB', (size[0] * 2 + 12, size[1]), 'white')
    o.paste(tiles[0], (0, 0))
    o.paste(tiles[1], (size[0] + 12, 0))
    return o


def main(rev, out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    clean = Path(sys.argv[3]) if len(sys.argv) > 3 else None
    rows = ['| file | before: rim / outer px | before: dark at 1-4 px | after: rim / outer px | after: dark at 1-4 px | no-ink take: rim / '
            'outer px | magenta spill before -> after | size before -> after | px |', '|---|---|---|---|---|---|---|---|---|']
    for s in SETS:
        (b, _), (a, edge) = scene(rev, s), scene(None, s)
        x, y = edgiest(edge, 195, 422)
        pair(b, a, (x, y, x + 195, y + 422), (390, 844), s).save(out / f'{s}-up.png')
        x2, y2 = edgiest(edge, 844, 390)
        pair(b, a, (x2, y2, x2 + 844, y2 + 390), (844, 390), s).save(out / f'{s}-side.png')
        for part in ('mid', 'near'):
            n = f'{s}-{part}'
            bi, ai = load(rev, n), load(None, n)
            sb, sa = edge_stats(np.asarray(bi)), edge_stats(np.asarray(ai))
            zb = len(subprocess.run(['git', 'show', f'{rev}:{BACK}/{n}.webp'], cwd=ROOT, capture_output=True).stdout)
            za = (ROOT / BACK / f'{n}.webp').stat().st_size
            cp = clean / f'{n}.webp' if clean else None
            sc = edge_stats(np.asarray(Image.open(cp).convert('RGBA'))) if cp and cp.exists() else None
            dk = lambda v: ' '.join(f'{x:.2f}' for x in v)
            rows.append(f'| {n} | {sb[0]:.2f} / {sb[1]:.2f} | {dk(sb[4])} | {sa[0]:.2f} / {sa[1]:.2f} | {dk(sa[4])} | '
                        f'{"%.2f / %.2f" % sc[:2] if sc else ("(own line kept)" if s.startswith("w5") else "-")} | {sb[2] * 100:.1f}% -> {sa[2] * 100:.1f}% | '
                        f'{zb // 1024} -> {za // 1024} KB | {bi.width}x{bi.height}{"" if bi.size == ai.size else " -> %dx%d" % ai.size} |')
        print(s)
    (out / 'edges.md').write_text('\n'.join(rows) + '\n')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
