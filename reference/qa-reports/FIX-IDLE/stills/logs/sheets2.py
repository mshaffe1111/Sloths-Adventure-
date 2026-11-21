# FIX-IDLE sheets: before/after rows from melt2.mjs output dirs. python3 sheets2.py <dir> <prefix> <outdir>
import sys, glob
from PIL import Image, ImageDraw
d, pre, out = sys.argv[1], sys.argv[2], sys.argv[3]
def checker(W, H, s=12):
    c = Image.new('RGBA', (W, H), (255, 255, 255, 255)); dd = ImageDraw.Draw(c)
    for y in range(0, H, s):
        for x in range(0, W, s):
            if (x // s + y // s) % 2: dd.rectangle([x, y, x + s - 1, y + s - 1], fill=(40, 170, 80, 255))
    return c
def sheet(name, frames, orient, kind):
    cells = []
    for t in ['before', 'after']:
        row = []
        for f in frames:
            if kind == 'stage':
                g = glob.glob(f'{d}/{t}-[0-9]*-{orient}-f{f:03d}.png')
                im = Image.open(g[0]).convert('RGB').crop((110, 140, 330, 480)) if g else Image.new('RGB', (220, 340), 'red')
                im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
            else:
                g = glob.glob(f'{d}/{t}-iso-{orient}-f{f:03d}.png')
                im0 = Image.open(g[0]).convert('RGBA').crop((90, 140, 270, 400)) if g else Image.new('RGBA', (180, 260), 'red')
                im0 = im0.resize((im0.width * 2, im0.height * 2), Image.LANCZOS)
                b = checker(*im0.size, 24); b.alpha_composite(im0); im = b.convert('RGB')
            row.append(im)
        cells.append((t, row))
    w, h = cells[0][1][0].size; pad = 30
    s = Image.new('RGB', (w * len(frames), (h + pad) * 2), 'white'); dr = ImageDraw.Draw(s)
    for r, (t, row) in enumerate(cells):
        for c, im in enumerate(row):
            s.paste(im, (c * w, r * (h + pad) + pad)); dr.text((c * w + 6, r * (h + pad) + 8), f'{t} {orient} frame {frames[c]} ({kind})', fill='black')
    s.save(f'{out}/{pre}-{name}-{orient}.jpg', quality=85); print(f'{out}/{pre}-{name}-{orient}.jpg', s.size)
for o in ['upright', 'sideways']:
    sheet('settle-8-20-40-60', [8, 20, 40, 60], o, 'stage')
    sheet('melt-in', [123, 124, 125, 126], o, 'stage')
    sheet('melt-out', [209, 210, 211, 212], o, 'stage')
    sheet('alone-melt-in', [122, 123, 124, 125, 126, 128], o, 'alone')
    sheet('alone-melt-out', [208, 209, 210, 211, 212, 214], o, 'alone')
