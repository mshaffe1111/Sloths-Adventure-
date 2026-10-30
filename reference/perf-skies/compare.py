"""before/after diff numbers and a contact sheet: python3 compare.py <before> <after> <out.png> [zoom.png]"""
import sys, glob, os
from PIL import Image, ImageChops, ImageDraw, ImageStat

b, a, out = sys.argv[1], sys.argv[2], sys.argv[3]
zoom_out = sys.argv[4] if len(sys.argv) > 4 else None
rows = []
for view in ('up', 'side'):
    files = sorted(glob.glob(f'{b}/{view}-*.png'), key=lambda f: int(os.path.basename(f).split('-w')[1].split('-')[0]))
    for fb in files:
        fa = os.path.join(a, os.path.basename(fb))
        if not os.path.exists(fa):
            continue
        ib, ia = Image.open(fb).convert('RGB'), Image.open(fa).convert('RGB')
        d = ImageChops.difference(ib, ia).convert('L')
        hist = d.histogram()
        n = sum(hist)
        over8 = sum(hist[9:]) / n * 100
        over24 = sum(hist[25:]) / n * 100
        mean = ImageStat.Stat(d).mean[0]
        mx = max(i for i, c in enumerate(hist) if c)
        name = os.path.basename(fb)[:-4]
        print(f'{name:16s} mean {mean:5.2f}  max {mx:3d}  >8: {over8:5.2f}%  >24: {over24:5.3f}%')
        rows.append((name, ib, ia, d))

# contact sheet: before | after | diff x4, scaled down
W = 300
tiles = []
for name, ib, ia, d in rows:
    sc = W / ib.width
    sz = (W, int(ib.height * sc))
    dd = d.point(lambda v: min(255, v * 4)).convert('RGB')
    tiles.append((name, [im.resize(sz, Image.LANCZOS) for im in (ib, ia, dd)]))
up = [t for t in tiles if t[0].startswith('up')]
side = [t for t in tiles if t[0].startswith('side')]

def sheet(group, cols):
    th = group[0][1][0].height
    per = W * 3 + 20
    gw = cols * per
    gh = ((len(group) + cols - 1) // cols) * (th + 22)
    im = Image.new('RGB', (gw, gh), 'white')
    dr = ImageDraw.Draw(im)
    for i, (name, ims) in enumerate(group):
        x = (i % cols) * per
        y = (i // cols) * (th + 22)
        dr.text((x + 4, y + 4), f'{name}   before | after | diff x4', fill='black')
        for j, t in enumerate(ims):
            im.paste(t, (x + j * W, y + 20))
    return im

s1 = sheet(up, 2)
s2 = sheet(side, 2)
full = Image.new('RGB', (max(s1.width, s2.width), s1.height + s2.height + 10), 'white')
full.paste(s1, (0, 0))
full.paste(s2, (0, s1.height + 10))
full.save(out)
print('sheet', out, full.size)

if zoom_out:
    # 2x zoom crops of the most-changed region in each pair, before over after
    crops = []
    for name, ib, ia, d in rows:
        bb = d.point(lambda v: 255 if v > 8 else 0).getbbox() or (0, 0, 200, 200)
        cx, cy = (bb[0] + bb[2]) // 2, (bb[1] + bb[3]) // 2
        box = (max(0, cx - 100), max(0, cy - 75), max(0, cx - 100) + 200, max(0, cy - 75) + 150)
        crops.append((name, ib.crop(box).resize((400, 300), Image.NEAREST), ia.crop(box).resize((400, 300), Image.NEAREST)))
    cols = 4
    zw = cols * 810
    zh = ((len(crops) + cols - 1) // cols) * 330
    z = Image.new('RGB', (zw, zh), 'white')
    dz = ImageDraw.Draw(z)
    for i, (name, c1, c2) in enumerate(crops):
        x, y = (i % cols) * 810, (i // cols) * 330
        dz.text((x + 4, y + 4), f'{name} 2x: before | after', fill='black')
        z.paste(c1, (x, y + 22)); z.paste(c2, (x + 402, y + 22))
    z.save(zoom_out)
    print('zoom', zoom_out, z.size)
