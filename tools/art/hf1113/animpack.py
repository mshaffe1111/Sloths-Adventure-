"""ART 11-13: cut a creature's frames (keyed on their own drifted magenta, hfprops/cut.py key_own, biggest piece kept), register them on
one painted mark (the centroid of pixels near a colour: the oropendola's blue cheek, the ant's eye), and pack one row like hero-rope.

    python3 -I tools/art/hf1113/animpack.py <picks.json> <name>

picks.json {"<name>": {"frames": [take paths, in play order; a repeat reuses the cell], "mark": [r, g, b], "tol": 40,
  "units": game units of the first frame's width (scaled vs Pokey's drawn 89.1), "fps": play rate, "dest": "src/assets/enemies"}}
Writes <dest>/<name>.webp (cells of one size, 2 px apart) and <name>.json {cells: [{x, y, w, h}], order, ax, ay (the mark in a cell),
units_w, units_h, px_per_unit, fps}; a review strip at reference/qa-reports/ART/<name>-strip.jpg.
"""
import json, runpy, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'tools/art/w1to4'))
key_own = runpy.run_path(str(ROOT / 'tools/art/hfprops/cut.py'))['key_own']
PX_PER_UNIT = 3.0
GAP = 2


def neutral_darks(im):
    """near-black paint carries a faint pink cast from the key, and the hue key then clears it (speckle through the oropendola's black
    neck): pixels darker than 70 are made neutral grey at their own lightness first, so only the distance key judges them"""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    mx = a.max(-1, keepdims=True)
    a = np.where(mx < 70, a.mean(-1, keepdims=True), a)
    return Image.fromarray(a.astype(np.uint8), 'RGB')


def mark(im, rgb, tol):
    a = np.asarray(im).astype(np.float32)
    m = (np.linalg.norm(a[..., :3] - np.array(rgb, np.float32), axis=-1) < tol) & (a[..., 3] > 200)
    ys, xs = np.nonzero(m)
    if len(xs) < 30:
        raise SystemExit(f'mark not found ({len(xs)} px)')
    return float(xs.mean()), float(ys.mean())


def main(picks_path, name):
    p = json.loads(Path(picks_path).read_text())[name]
    takes = list(dict.fromkeys(p['frames']))
    cuts = {t: key_own(neutral_darks(Image.open(ROOT / t)), solo=True) for t in takes}
    marks = {t: mark(cuts[t], p['mark'], p.get('tol', 40)) for t in takes}
    s = p['units'] * PX_PER_UNIT / cuts[takes[0]].width
    left = max(marks[t][0] for t in takes); right = max(cuts[t].width - marks[t][0] for t in takes)
    up = max(marks[t][1] for t in takes); down = max(cuts[t].height - marks[t][1] for t in takes)
    cw, ch = int(np.ceil((left + right) * s)) + 2, int(np.ceil((up + down) * s)) + 2
    cells = []
    sheet = Image.new('RGBA', (len(takes) * (cw + GAP) - GAP, ch), (0, 0, 0, 0))
    for i, t in enumerate(takes):
        c = cuts[t]
        r = c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.LANCZOS)
        x = i * (cw + GAP) + round((left - marks[t][0]) * s) + 1
        y = round((up - marks[t][1]) * s) + 1
        sheet.alpha_composite(r, (x, y))
        cells.append({'x': i * (cw + GAP), 'y': 0, 'w': cw, 'h': ch})
    a = np.asarray(sheet).copy(); a[a[..., 3] == 0, :3] = 0
    sheet = Image.fromarray(a, 'RGBA')
    dest = ROOT / p['dest']; dest.mkdir(parents=True, exist_ok=True)
    sheet.save(dest / f'{name}.webp', quality=92, method=6)
    meta = {'cells': cells, 'order': [takes.index(t) for t in p['frames']], 'ax': round(left * s + 1, 1), 'ay': round(up * s + 1, 1),
            'units_w': round(cw / PX_PER_UNIT, 1), 'units_h': round(ch / PX_PER_UNIT, 1), 'px_per_unit': PX_PER_UNIT, 'fps': p['fps'],
            'source': {'takes': takes, 'mark': p['mark']}}
    (dest / f'{name}.json').write_text(json.dumps(meta, indent=1))
    # review: each cell on dusk purple and on day green, with the mark crossed, then the play order
    rv = Image.new('RGB', (len(p['frames']) * (cw + 8) + 8, ch * 2 + 24), (30, 30, 30))
    d = ImageDraw.Draw(rv)
    for j, k in enumerate(meta['order']):
        cell = sheet.crop((cells[k]['x'], 0, cells[k]['x'] + cw, ch))
        for row, bg in enumerate([(60, 30, 70), (70, 110, 60)]):
            b = Image.new('RGBA', (cw, ch), bg + (255,)); b.alpha_composite(cell)
            X, Y = 8 + j * (cw + 8), 16 + row * (ch + 4)
            rv.paste(b.convert('RGB'), (X, Y))
            d.line((X + meta['ax'] - 5, Y + meta['ay'], X + meta['ax'] + 5, Y + meta['ay']), fill=(255, 255, 0))
        d.text((8 + j * (cw + 8), 2), f'{j}: cell {k}', fill=(255, 255, 0))
    rv.save(ROOT / 'reference/qa-reports/ART' / f'{name}-strip.jpg', quality=88)
    print(name, sheet.size, 'cell', cw, ch, 'kb', round((dest / f"{name}.webp").stat().st_size / 1024, 1))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
