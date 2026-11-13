"""ART 11-13: a mock (not the engine) of the creek hurt floor at game scale, upright (440 units wide) and sideways (540 units tall),
2 device px a unit: 1-5's dusk backdrop, World 1's ground on two banks, the creek between them drawn as w1Creek.ts draws its tile
(surface on the floor line, tiled, the bed colour below), Pokey (89.1 units, D41) standing on the near bank.

    python3 -I tools/art/hf1113/creekmock.py <creek stem> <out dir> [drift units]
"""
import json, re, sys
from pathlib import Path
from PIL import Image

G = Path(__file__).resolve().parents[3]
PX = 2.0


def pokey():
    t = (G / 'src/game/heroStandardData.ts').read_text()
    x, y, w, h = map(int, re.search(r'idle: \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+)', t).groups())
    im = Image.open(G / 'src/assets/hero/hero-standard.webp').convert('RGBA').crop((x, y, x + w, y + h))
    k = 89.1 * PX / 200
    return im.resize((round(w * k), round(h * k)), Image.LANCZOS)


def scene(stem, vw, vh, drift):
    W, H = round(vw * PX), round(vh * PX)
    c = Image.new('RGBA', (W, H), (40, 30, 60, 255))
    for n in ('w1dusk-sky', 'w1dusk-far', 'w1dusk-mid', 'w1dusk-near'):
        b = Image.open(G / f'src/assets/backdrops/{n}.webp').convert('RGBA')
        s = H / b.height if n != 'w1dusk-sky' else (H * 0.5) / b.height
        b = b.resize((round(b.width * s), round(b.height * s)), Image.LANCZOS)
        for x in range(0, W, b.width):
            c.alpha_composite(b.crop((0, 0, min(W - x, b.width), b.height)), (x, 0 if n == 'w1dusk-sky' else H - b.height))
    floor = round(H * 0.72)
    m = json.loads(Path(stem + '.json').read_text())
    tile = Image.open(stem + '.webp').convert('RGBA')
    k = m['units_per_px'] * PX
    tile = tile.resize((round(tile.width * k), round(tile.height * k)), Image.LANCZOS)
    x0, x1 = round(W * 0.30), round(W * 0.80)
    top = floor - round(m['surface'] * k)
    water = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    bed = tuple(int(m['bed'][i:i + 2], 16) for i in (1, 3, 5)) + (255,)
    water.paste(bed, (x0, top + tile.height - 2, x1, H))
    off = round(drift * PX) % tile.width
    for x in range(x0 - off, x1, tile.width):
        water.alpha_composite(tile, (x, top))
    mask = Image.new('L', (W, H), 0); mask.paste(255, (x0, 0, x1, H))
    c.paste(water, (0, 0), Image.composite(water.getchannel('A'), mask, mask).point(lambda v: v))
    gt = Image.open(G / 'src/assets/ground/w1.webp').convert('RGBA')
    earth = gt.crop((0, 0, 2048, 2048)).resize((round(512 * PX), round(512 * PX)), Image.LANCZOS)
    grass = gt.crop((0, 2052, 2048, 2132)); grass = grass.resize((round(512 * PX), round(grass.height * 512 * PX / 2048)), Image.LANCZOS)
    for a, b in ((0, x0), (x1, W)):
        for x in range(a, b, earth.width):
            e = earth.crop((0, 0, min(earth.width, b - x), min(earth.height, H - floor)))
            c.alpha_composite(e, (x, floor))
            g = grass.crop((0, 0, min(grass.width, b - x), grass.height))
            c.alpha_composite(g, (x, floor - round(grass.height * 0.45)))
    p = pokey()
    c.alpha_composite(p, (x0 - p.width - round(20 * PX), floor - p.height + round(4 * PX)))
    return c.convert('RGB')


if __name__ == '__main__':
    stem, out = sys.argv[1], Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
    dr = float(sys.argv[3]) if len(sys.argv) > 3 else 0
    nm = Path(stem).name
    scene(stem, 440, 440 * 844 / 390, dr).save(out / f'{nm}-upright.jpg', quality=88)
    scene(stem, 540 * 844 / 390, 540, dr).save(out / f'{nm}-sideways.jpg', quality=88)
    print('ok')
