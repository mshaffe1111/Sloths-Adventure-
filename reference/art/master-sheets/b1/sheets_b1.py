#!/usr/bin/env python3
"""
B1 contact sheets, one per world and layer (reference/art/master-sheets/b1/w<N>-<layer>.png), each piece drawn at its play size (the
catalog's on_screen_px, world px; WORLD_VIEW_H 540 is a sideways phone's height) on the world's mid-tone, with Pokey's 48 px height as a
ruler, the footing line in red on every platform / step / soft landing, and a red label on every "needs fix".
  B1_SCRATCH=<dir> python3 reference/art/master-sheets/b1/sheets_b1.py   (after build_b1.py)
"""
import csv, os, re, sys, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from b1_frames import rows as FRAMES, R
from PIL import Image, ImageDraw

OUT = os.path.dirname(os.path.abspath(__file__))
CAT = list(csv.DictReader(open(f'{R}/reference/art/catalog-game-B1.csv')))
BG = {1: (46, 70, 44), 2: (64, 84, 80), 3: (30, 44, 50), 4: (58, 70, 84), 'shared': (70, 70, 70)}
key = {}
for r in FRAMES:
    rid = r['frame'] if r['atlas'] == 'w1-cut' else f"{os.path.basename(r['file']).rsplit('.', 1)[0]}#{r['frame']}"
    key[rid] = r
cache = {}


def piece(r):
    if r['file'] not in cache:
        cache[r['file']] = Image.open(f"{R}/{r['file']}").convert('RGBA')
    f = r['rect']
    return cache[r['file']].crop((int(f['x']), int(f['y']), int(f['x'] + f['w']), int(f['y'] + f['h'])))


groups = collections.defaultdict(list)
for c in CAT:
    w = c['world_best']
    wk = int(w) if w and int(w) <= 4 else 'shared'
    groups[(wk, c['layer'])].append(c)

made = []
for (wk, layer), items in sorted(groups.items(), key=lambda x: str(x[0])):
    W = 1400
    x = y = 12
    rowh = 0
    placed = []
    for c in items:
        r = key[c['id']]
        m = re.match(r'(\d+)x(\d+)', c['on_screen_px'])
        sw, sh = int(m.group(1)), int(m.group(2))
        k = min(1.0, 360 / max(sw, sh, 1))  # (a very big piece shrunk to fit a row; its label says so)
        dw, dh = max(4, int(sw * k)), max(4, int(sh * k))
        if x + dw + 12 > W:
            x, y = 12, y + rowh + 40
            rowh = 0
        placed.append((c, r, x, y, dw, dh, k))
        x += max(dw, 120) + 16
        rowh = max(rowh, dh)
    H = y + rowh + 60
    img = Image.new('RGB', (W, H), BG[wk])
    d = ImageDraw.Draw(img)
    for c, r, x, y, dw, dh, k in placed:
        im = piece(r).resize((dw, dh), Image.LANCZOS)
        img.paste(im, (x, y), im)
        # Pokey's height (48 world px) beside it, as a ruler
        d.rectangle((x - 6, y + dh - int(48 * k), x - 4, y + dh), fill=(240, 200, 120))
        if c['walk_y'] not in ('', None) and c['layer'] in ('platform', 'step', 'soft landing'):
            sy = dh / float(c['h'])
            wy = y + float(c['walk_y']) * sy
            x0 = x + float(c['walk_x0'] or 0) * dw / float(c['w'])
            x1 = x + float(c['walk_x1'] or c['w']) * dw / float(c['w'])
            d.line((x0, wy, x1, wy), fill=(255, 40, 40), width=2)
        bad = 'needs fix' in c['status']
        label = c['id'].split('#')[-1][:20] + ('' if k == 1 else f' (x{k:.2f})')
        d.text((x, y + dh + 3), label, fill=(255, 90, 90) if bad else (235, 235, 225))
        if bad:
            d.text((x, y + dh + 15), 'needs fix', fill=(255, 90, 90))
    name = f"w{wk}-{layer.replace(' ', '-')}.webp" if wk != 'shared' else f"shared-{layer.replace(' ', '-')}.webp"
    img.save(f'{OUT}/{name}', quality=82, method=5)
    made.append((name, len(items)))
for n, c in made:
    print(n, c)
