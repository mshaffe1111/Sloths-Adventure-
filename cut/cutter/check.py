import sys, os, json, glob
ROOT = sys.argv[1]; sys.path.insert(0, ROOT + '/pylib')
from PIL import Image, ImageDraw, ImageFont
OUT = ROOT + '/artcut'
font = ImageFont.load_default(size=22)
info = json.load(open(OUT + '/_cutinfo.json'))
want = sys.argv[2:]
for r in info:
    if want and r['sheet'] not in want: continue
    tiles = []
    for p in r['pieces']:
        im = Image.open(f"{OUT}/pieces/{p['id']}.png")
        s = min(1.0, 420 / max(im.size))
        t = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
        pair = Image.new('RGB', (t.width * 2 + 30, t.height + 40), (20, 20, 20))
        for k, col in enumerate([(48, 48, 48), (225, 225, 215)]):
            bgim = Image.new('RGB', t.size, col); bgim.paste(t, (0, 0), t)
            pair.paste(bgim, (10 + k * (t.width + 10), 30))
        ImageDraw.Draw(pair).text((10, 4), f"{p['id']} {p['w']}x{p['h']} s{p['sharp']}", fill=(255, 255, 0), font=font)
        tiles.append(pair)
    if not tiles: continue
    W = 1800; x = y = 0; rowh = 0; pos = []
    for t in tiles:
        if x + t.width > W: x = 0; y += rowh + 6; rowh = 0
        pos.append((x, y)); x += t.width + 6; rowh = max(rowh, t.height)
    sheet = Image.new('RGB', (W, y + rowh), (20, 20, 20))
    for t, pp in zip(tiles, pos): sheet.paste(t, pp)
    sheet.save(f"{OUT}/_debug/{r['sheet']}_check.jpg", quality=88)
