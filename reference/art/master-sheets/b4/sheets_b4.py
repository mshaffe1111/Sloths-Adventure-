#!/usr/bin/env python3
"""Contact sheets for part B4 (reference/art/master-sheets/b4-*.webp), from reference/art/catalog-game-B4.csv.
  b4-all-<layer>.webp   every B4 image whole, thumbnailed, on a light and a dark checker (halo and fringe show on one or the other)
  b4-play-w<N>.webp     for each world: one frame of each sheet drawn there, at its on-screen size x2 (a 2x phone), over that world's
                        own mid backdrop, so it is judged at play size against the painting it sits on
Run from the repo root: python3 reference/art/master-sheets/b4/sheets_b4.py
"""
import csv, glob, os
from collections import OrderedDict, defaultdict
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
OUT = os.path.join(ROOT, 'reference', 'art', 'master-sheets')
rows = list(csv.DictReader(open(os.path.join(ROOT, 'reference', 'art', 'catalog-game-B4.csv'))))
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
except OSError:
    FONT = ImageFont.load_default()

def checker(w, h, dark):
    a, b = ((40, 52, 40), (58, 70, 58)) if dark else ((205, 205, 205), (235, 235, 235))
    im = Image.new('RGB', (w, h), a)
    d = ImageDraw.Draw(im)
    for y in range(0, h, 12):
        for x in range((y // 12) % 2 * 12, w, 24):
            d.rectangle([x, y, x + 11, y + 11], fill=b)
    return im

def frame_img(row):
    path, _, key = row['file'].partition('#')
    im = Image.open(os.path.join(ROOT, path)).convert('RGBA')
    return im, key

# ---- overview by layer: each image once, whole ----
by_file = OrderedDict()
for r in rows:
    by_file.setdefault(r['file'].split('#')[0], r)
by_layer = defaultdict(list)
for f, r in by_file.items():
    by_layer[r['layer']].append((f, r))
T = 180
for layer, items in by_layer.items():
    cols = 8
    cell_w, cell_h = T * 2 + 12, T + 34
    n = len(items)
    rws = (n + cols - 1) // cols
    sheet = Image.new('RGB', (cols * cell_w, rws * cell_h), (20, 20, 20))
    d = ImageDraw.Draw(sheet)
    for i, (f, r) in enumerate(items):
        im = Image.open(os.path.join(ROOT, f)).convert('RGBA')
        im.thumbnail((T, T))
        x, y = (i % cols) * cell_w, (i // cols) * cell_h
        for j, dark in enumerate((False, True)):
            bg = checker(T, T, dark)
            bg.paste(im, ((T - im.width) // 2, (T - im.height) // 2), im)
            sheet.paste(bg, (x + j * (T + 4), y))
        d.text((x + 2, y + T + 2), f.replace('src/assets/', '')[-46:], fill=(240, 240, 240), font=FONT)
        d.text((x + 2, y + T + 17), (r['status'][:44]), fill=(255, 200, 120) if r['status'] != 'in game' else (150, 220, 150), font=FONT)
    sheet.save(os.path.join(OUT, f'b4-all-{layer.replace(" ", "-")}.webp'), quality=80)
    print('b4-all', layer, n)

# ---- play size per world: one frame per sheet shown there, at on_screen x2 over the world's mid backdrop ----
def world_bg(w, W, H):
    c = sorted(glob.glob(os.path.join(ROOT, f'src/assets/backdrops/w{w}-mid*.webp'))) or sorted(glob.glob(os.path.join(ROOT, f'src/assets/backdrops/w{w}*.webp')))
    if not c:
        return checker(W, H, True)
    im = Image.open(c[0]).convert('RGBA')
    bg = Image.new('RGB', im.size, (52, 74, 50))
    bg.paste(im, (0, 0), im)
    k = max(W / bg.width, H / bg.height)
    bg = bg.resize((int(bg.width * k) + 1, int(bg.height * k) + 1))
    return bg.crop((0, bg.height - H, W, bg.height))

for w in range(1, 11):
    picks = OrderedDict()
    for r in rows:
        f = r['file'].split('#')[0]
        if r['layer'] not in ('character', 'enemy', 'decor mid', 'danger look', 'pickup') or r['used_in'].startswith('story'):
            continue
        ws = [int(x.split(' ')[0]) for x in r['worlds'].split('; ') if x[:2].strip().isdigit()]
        if w not in ws or f in picks:
            continue
        key = r['file'].partition('#')[2]
        if any(s in key for s in ('idle', 'stand', 'walk_0', 'hold')) or f not in picks:
            picks[f] = r
    # prefer an idle-like frame per sheet
    for r in rows:
        f = r['file'].split('#')[0]
        if f in picks and '#' in r['file'] and any(s in r['file'].split('#')[1] for s in ('idle', 'stand')) and not any(s in picks[f]['file'].split('#')[-1] for s in ('idle', 'stand')):
            picks[f] = r
    items = [(f, r, int(str(r['on_screen_px']).replace('est:', ''))) for f, r in picks.items()]
    if not items:
        continue
    import json
    rects = json.load(open(os.path.join(OUT, 'b4', 'rects.json')))
    cell = 260
    cols = 6
    rws = (len(items) + cols - 1) // cols
    W, H = cols * cell, rws * (cell + 30)
    sheet = world_bg(w, W, H)
    d = ImageDraw.Draw(sheet)
    for i, (f, r, on) in enumerate(items):
        src = Image.open(os.path.join(ROOT, f)).convert('RGBA')
        key = r['file'].partition('#')[2]
        if key and r['file'] in rects:
            x, y, fw, fh = rects[r['file']]
            src = src.crop((x, y, x + fw, y + fh))
        target = min(cell - 10, on * 2)
        k = target / max(src.width, src.height)
        im = src.resize((max(1, int(src.width * k)), max(1, int(src.height * k))), Image.LANCZOS)
        cx, cy = (i % cols) * cell, (i // cols) * (cell + 30)
        sheet.paste(im, (cx + (cell - im.width) // 2, cy + cell - im.height - 4), im)
        lab = f.replace('src/assets/', '').replace('.webp', '')[-34:] + f' {on}px'
        d.rectangle([cx, cy + cell, cx + cell - 2, cy + cell + 28], fill=(0, 0, 0))
        d.text((cx + 3, cy + cell + 2), lab, fill=(255, 255, 255), font=FONT)
        d.text((cx + 3, cy + cell + 15), r['file'].partition('#')[2][:34], fill=(200, 200, 200), font=FONT)
    sheet.save(os.path.join(OUT, f'b4-play-w{w}.webp'), quality=82)
    print('b4-play', w, len(items))
