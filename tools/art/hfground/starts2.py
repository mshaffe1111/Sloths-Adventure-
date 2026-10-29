"""Starts for the second art job (hf-art-ground, 2026-10-29), written to tools/art/hfground/starts/ (force-added):

  w5p-<piece>.webp   World 5's pastel props (VI-13) on magenta, twice their sheet size, with their thick black outline painted out
                     (each outline pixel takes the colour of the nearest painted pixel, a shade darker: a darker-hue edge), so the
                     repaint starts from a kit-style piece, not a sticker
  sign-<look>.webp   the water's-edge signs (VI-13), the same, for a carved wooden repaint
  dress-<name>.webp  the new dressing (VI-17): World 5's bank, hanging and ground-clutter sets, and the hanging sets for Worlds 1 and 2,
                     collaged from each world's own painted pieces (outlines painted out the same way)
  w6water-<part>.webp World 6's dirty fast water (VI-18): the chop strip, the dead leaves and the current streaks, upscaled from
                     src/assets/props/w6-water.webp
    python3 tools/art/hfground/starts2.py
"""
import json, re, sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
OUT = HERE / 'starts'
OUT.mkdir(exist_ok=True)
MAG = (255, 0, 255)

W5 = {m.group(1): tuple(map(int, m.groups()[1:])) for m in
      re.finditer(r'(\w+): \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+) \}', (ROOT / 'src/game/w5PropsData.ts').read_text())}
W5IMG = Image.open(ROOT / 'src/assets/props/w5-props.webp').convert('RGBA')
SIGNS = json.loads(re.search(r'WATER_SIGN_FRAMES[^=]*= (\{.*\});', (ROOT / 'src/game/waterSignData.ts').read_text()).group(1))
SIGNIMG = Image.open(ROOT / 'src/assets/props/water-signs.webp').convert('RGBA')
kit = json.loads(re.search(r'= (\{.*\});?\s*$', (ROOT / 'src/game/kitAtlasData.ts').read_text(), re.S).group(1))
P1 = {m.group(1): tuple(map(int, m.groups()[1:])) for m in
      re.finditer(r'(\w+): \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+)', (ROOT / 'src/game/protoAtlasData.ts').read_text())}
P1IMG = Image.open(ROOT / 'src/assets/proto/props-atlas.webp').convert('RGBA')


def w5(n):
    x, y, w, h = W5[n]
    return W5IMG.crop((x, y, x + w, y + h))


def kitp(w, n):
    f = kit[str(w)][n]
    return Image.open(ROOT / f'src/assets/kits/w{w}.webp').convert('RGBA').crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


def p1(n):
    x, y, w, h = P1[n]
    return P1IMG.crop((x, y, x + w, y + h))


def deline(im, dark=62, shade=0.74):
    """paint out a thick dark outline: each dark pixel takes the nearest light one's colour, a shade darker"""
    a = np.asarray(im.convert('RGBA'), np.float32)
    lum = a[..., :3].mean(2)
    solid = a[..., 3] > 100
    # (near the silhouette the outline runs lighter where it was blended with the old background: a looser test there)
    rim = ndimage.binary_dilation(a[..., 3] <= 100, iterations=5)
    line = solid & ((lum < dark) | (rim & (lum < dark + 45)))
    keep = solid & ~line
    if keep.sum() == 0:
        return im
    _, (iy, ix) = ndimage.distance_transform_edt(~keep, return_indices=True)
    out = a.copy()
    out[line, :3] = a[iy[line], ix[line], :3] * shade
    # the soft dark fringe at the silhouette (half-alpha outline pixels) gets the same
    fringe = (a[..., 3] > 10) & (a[..., 3] <= 100) & (lum < dark + 45)
    out[fringe, :3] = a[iy[fringe], ix[fringe], :3] * shade
    # (and the silhouette pulled in 3 px: the old outline's soft outer edge read as a dotted ring on the key)
    al = ndimage.binary_erosion(a[..., 3] > 128, iterations=3)
    out[..., 3] = np.where(al, 255, 0)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGBA')


def sketch_hang(size, moss, strand, seed):
    """a sketch of hanging moss: a clump along the top, strands of moss and thin vines hanging from it"""
    import random
    from PIL import ImageDraw
    rnd = random.Random(seed)
    W, H = size
    can = Image.new('RGB', size, MAG)
    d = ImageDraw.Draw(can)
    for i in range(int(W / 30)):
        x = rnd.uniform(W * 0.1, W * 0.9)
        L = rnd.uniform(H * 0.35, H * 0.92)
        pts = [(x, 40)]
        for k in range(1, 9):
            pts.append((x + rnd.uniform(-10, 10) + 6 * (k % 2), 40 + L * k / 8))
        d.line(pts, fill=strand if i % 3 else moss, width=rnd.choice([5, 7, 9, 12]))
        for k in range(2, 9, 2):
            px, py = pts[k]
            d.ellipse((px - 9, py - 5, px + 9, py + 5), fill=moss)
    for i in range(14):
        x = rnd.uniform(W * 0.05, W * 0.95)
        r = rnd.uniform(18, 34)
        d.ellipse((x - r * 1.4, 34 - r * 0.7, x + r * 1.4, 34 + r * 0.7), fill=tuple(max(0, c - rnd.randrange(0, 40)) for c in moss))
    return can


def on_mag(img, size, pad=0.08):
    """img fitted (keeping its shape) into a magenta canvas of size, bottom-centred with a margin"""
    W, H = size
    k = min(W * (1 - 2 * pad) / img.width, H * (1 - 2 * pad) / img.height)
    im = img.resize((max(1, round(img.width * k)), max(1, round(img.height * k))), Image.LANCZOS)
    bg = Image.new('RGBA', size, MAG + (255,))
    bg.alpha_composite(im, ((W - im.width) // 2, H - round(H * pad) - im.height))
    return bg.convert('RGB')


def size16(w, h, long=576):
    k = long / max(w, h)
    return (max(16, round(w * k / 16) * 16), max(16, round(h * k / 16) * 16))


PROPS = ['cupcake', 'cupcake2', 'cakeCherry', 'cakeSponge', 'cakeTier', 'cakeTier2', 'cakePlate', 'cakePlate2', 'teapot', 'teapot2',
         'teacup', 'teacup2', 'armchairRose', 'armchairRose2', 'armchairLilac', 'armchairLilac2', 'teaTable', 'teaTableNapkin']


def collage(size, parts):
    """parts: (picture, x share of the middle, bottom share, height share, flip)"""
    W, H = size
    can = Image.new('RGBA', size, (0, 0, 0, 0))
    for im, cx, b, hs, flip in parts:
        k = H * hs / im.height
        p = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
        if flip:
            p = p.transpose(Image.FLIP_LEFT_RIGHT)
        can.alpha_composite(p, (round(W * cx - p.width / 2), round(H * b - p.height)))
    bg = Image.new('RGBA', size, MAG + (255,))
    bg.alpha_composite(can)
    return bg.convert('RGB')


def dress():
    d = {}
    L = lambda n: deline(w5(n))  # noqa: E731
    # World 5 bank sets (pieces that sit on a bank's lip near its end, some hanging over the edge)
    d['w5-bankA1'] = ((512, 384), [(L('mossRoot'), 0.45, 0.95, 0.7, False), (L('orchidSprout2'), 0.66, 0.78, 0.55, False)])
    d['w5-bankA2'] = ((512, 320), [(L('fern'), 0.5, 0.95, 0.85, True)])
    d['w5-bankA3'] = ((448, 384), [(L('mossRoot2'), 0.5, 0.95, 0.6, True), (L('silkLump'), 0.5, 0.62, 0.2, False)])
    d['w5-bankB1'] = ((448, 448), [(L('orchidSprout'), 0.38, 0.95, 0.85, False), (L('orchidSprout2'), 0.66, 0.95, 0.6, True)])
    d['w5-bankB2'] = ((512, 320), [(L('mossRoot2'), 0.42, 0.95, 0.7, False), (L('teacup'), 0.68, 0.8, 0.32, False)])
    d['w5-bankB3'] = ((448, 320), [(L('fern'), 0.5, 0.95, 0.6, False), (L('orchidIcon'), 0.62, 0.7, 0.3, False)])
    # the hanging set (from the underside of a ledge or a bough)
    d['w5-hang1'] = ((256, 576), [(L('cocoonHanging'), 0.5, 0.96, 0.92, False)])
    d['w5-hang2'] = ((576, 384), [(L('orchidRow'), 0.5, 0.92, 0.8, False)])
    # two ground-clutter sets (small things lying in the moss along a long floor)
    d['w5-clutA1'] = ((512, 192), [(L('cocoonTorn'), 0.3, 0.95, 0.6, False), (L('orchidIcon'), 0.7, 0.95, 0.45, True)])
    d['w5-clutA2'] = ((448, 256), [(L('orchidSprout2'), 0.5, 0.95, 0.85, False)])
    d['w5-clutA3'] = ((512, 192), [(L('silkLump'), 0.5, 0.95, 0.55, False)])
    d['w5-clutB1'] = ((448, 256), [(L('teacup2'), 0.45, 0.95, 0.55, True)])
    d['w5-clutB2'] = ((512, 256), [(L('mossRoot2'), 0.5, 0.95, 0.7, False)])
    d['w5-clutB3'] = ((448, 256), [(L('cakeIcon'), 0.4, 0.95, 0.45, False), (L('orchidIcon'), 0.66, 0.95, 0.4, False)])
    # the hanging sets for Worlds 1 and 2 (their sheets have nothing that hangs): moss and roots from the world's own lip and vine
    d['w1-hang1'] = sketch_hang((384, 576), (88, 128, 52), (96, 74, 46), 1)
    d['w1-hang2'] = sketch_hang((320, 448), (98, 140, 60), (84, 66, 42), 2)
    d['w2-hang1'] = sketch_hang((384, 576), (150, 150, 70), (122, 92, 52), 3)
    d['w2-hang2'] = sketch_hang((320, 448), (140, 146, 66), (110, 84, 48), 4)
    return d


def water():
    im = Image.open(ROOT / 'src/assets/props/w6-water.webp').convert('RGBA')
    chop = im.crop((0, 150, 183, 244))
    bg = Image.new('RGBA', chop.size, MAG + (255,)); bg.alpha_composite(chop)
    out = {'w6water-chop': bg.convert('RGB').resize((1024, 528), Image.LANCZOS)}
    lv = im.crop((0, 246, 170, 318))
    out['w6water-leaves'] = on_mag(lv, (512, 224), pad=0.04)
    st = im.crop((0, 320, 180, 370))
    dk = Image.new('RGBA', st.size, (45, 49, 45, 255)); dk.alpha_composite(st)
    out['w6water-streaks'] = dk.convert('RGB').resize((640, 176), Image.LANCZOS)
    return out


if __name__ == '__main__':
    for n in PROPS:
        im = deline(w5(n))
        on_mag(im, size16(im.width, im.height)).save(OUT / f'w5p-{n}.webp', quality=92)
    for n in ('sign-w5', 'sign-jungle'):
        f = SIGNS[n]
        im = SIGNIMG.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
        on_mag(im, (448, 640), pad=0.05).save(OUT / f'{n}.webp', quality=92)
    for n, v in dress().items():
        (v if isinstance(v, Image.Image) else collage(*v)).save(OUT / f'dress-{n}.webp', quality=92)
    for n, im in water().items():
        im.save(OUT / f'{n}.webp', quality=92)
    print('ok')
