#!/usr/bin/env python3
"""Contact sheets for catalog-game-B2.csv: one per world (world_best) and layer, each piece at its play size (on_screen_px, capped),
on a mid-grey checker so halos and key fringes show, labelled with its id tail and a status bar (green in game, blue ready,
amber ships-not-drawn, red needs fix). Writes reference/art/master-sheets/b2/w<N>-<layer>.webp."""
import csv, json, os, re
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
R = list(csv.DictReader(open('reference/art/catalog-game-B2.csv')))
RECT = json.load(open(os.path.join(HERE, 'rects.json')))
CELL_H = 150
MAXW = 1800
def col(st):
    return (200, 40, 40) if st.startswith('needs fix') else (40, 160, 60) if st == 'in game' else (220, 160, 30) if st.startswith('ships') else (60, 110, 210)
cache = {}
groups = {}
for r in R:
    groups.setdefault((int(r['world_best']), r['layer']), []).append(r)
out = []
for (w, lay), rs in sorted(groups.items()):
    tiles = []
    for r in rs:
        p, x, y, fw, fh = RECT[r['id']]
        if p not in cache:
            cache[p] = Image.open(p).convert('RGBA')
        im = cache[p].crop((x, y, x + fw, y + fh))
        on = int(r['on_screen_px'] or max(fw, fh))
        k = min(CELL_H / fh, on / max(fw, fh), 260 / fw, 1.0) if fh else 1
        im = im.resize((max(1, int(fw * k)), max(1, int(fh * k))), Image.LANCZOS)
        tiles.append((r, im))
    rows_ = []
    cur, cw = [], 0
    for r, im in tiles:
        tw = max(im.width, 110) + 8
        if cw + tw > MAXW and cur:
            rows_.append(cur); cur, cw = [], 0
        cur.append((r, im, tw)); cw += tw
    if cur:
        rows_.append(cur)
    H = len(rows_) * (CELL_H + 34) + 30
    sheet = Image.new('RGB', (MAXW, H), (128, 128, 128))
    d = ImageDraw.Draw(sheet)
    for yy in range(0, H, 16):
        for xx in range(0, MAXW, 16):
            if (xx // 16 + yy // 16) % 2:
                d.rectangle([xx, yy, xx + 15, yy + 15], fill=(140, 140, 140))
    d.text((6, 6), f'World {w} - {lay} - {len(rs)} pieces (green in game, blue ready, amber ships not drawn, red needs fix)', fill=(0, 0, 0))
    yy = 24
    for row in rows_:
        xx = 4
        for r, im, tw in row:
            sheet.paste(im, (xx, yy + CELL_H - im.height), im)
            fw = r['walk_y']
            if fw not in ('', None) and r['layer'] in ('platform', 'step', 'soft landing'):
                k = im.height / int(r['h'])
                ly = yy + CELL_H - im.height + int(int(fw) * k)
                d.line([xx, ly, xx + im.width, ly], fill=(255, 0, 255), width=1)
            d.rectangle([xx, yy + CELL_H + 2, xx + tw - 10, yy + CELL_H + 6], fill=col(r['status']))
            d.text((xx, yy + CELL_H + 8), r['id'].split('/')[-1][:20], fill=(0, 0, 0))
            xx += tw
        yy += CELL_H + 34
    fn = f'w{w}-{lay.replace(" ", "-")}.webp'
    sheet.save(os.path.join(HERE, fn), quality=70)
    out.append((fn, len(rs), sheet.size))
for o in out:
    print(*o)
