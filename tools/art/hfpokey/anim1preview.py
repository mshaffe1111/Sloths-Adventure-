"""ANIM-NEXT: a takes sheet + a preview video for one clip's takes (both seeds side by side), from the zips anim1gpu.py packs.

    python3 -I tools/art/hfpokey/anim1preview.py <out dir> <clip> <zip>...

Writes <out>/<clip>-sheet.jpg (every 3rd frame of each take, numbered) and <out>/<clip>-preview.mp4: each take big on its grey (top) and
keyed at phone size (Pokey 89 px tall, his drawn game height) on World 3's dark (bottom), played 3 times at 16 fps.
"""
import io, json, subprocess, sys, tempfile, zipfile
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

out, clip, zips = Path(sys.argv[1]), sys.argv[2], sys.argv[3:]
out.mkdir(parents=True, exist_ok=True)
POKEY = 89
DARK = (18, 24, 40)


def frames(zp):
    with zipfile.ZipFile(zp) as z:
        meta = json.loads(z.read('box.json'))
        names = sorted(n for n in z.namelist() if n.endswith('.webp'))
        return meta, [Image.open(io.BytesIO(z.read(n))).convert('RGB') for n in names]


def key(im, bg):
    a = np.asarray(im, dtype=np.int16)
    m = (np.abs(a - np.array(bg)).max(axis=2) > 30).astype(np.uint8) * 255
    rgba = im.convert('RGBA'); rgba.putalpha(Image.fromarray(m)); return rgba, m


takes = []
for zp in zips:
    meta, fr = frames(zp)
    _, m0 = key(fr[0], meta['bg'])
    ys = np.nonzero(m0.any(axis=1))[0]
    stand = ys.max() - ys.min()
    takes.append((Path(zp).stem, meta, fr, POKEY / max(1, stand)))

# the sheet
tw = 150
rows = []
for name, meta, fr, _ in takes:
    pick = list(range(0, len(fr), 3))
    th = round(tw * fr[0].height / fr[0].width)
    row = Image.new('RGB', (tw * len(pick), th + 30), (30, 30, 30))
    d = ImageDraw.Draw(row)
    d.text((4, 2), name, fill=(255, 255, 0))
    for i, k in enumerate(pick):
        row.paste(fr[k].resize((tw, th), Image.LANCZOS), (i * tw, 16))
        d.text((i * tw + 3, 18), str(k), fill=(255, 60, 60))
    rows.append(row)
S = Image.new('RGB', (max(r.width for r in rows), sum(r.height for r in rows)), (30, 30, 30))
y = 0
for r in rows:
    S.paste(r, (0, y)); y += r.height
S.save(out / f'{clip}-sheet.jpg', quality=82)

# the video
BW = max(f[0].width for _, _, f, _ in takes)
BH = max(f[0].height for _, _, f, _ in takes)
SH = 160
W = BW * len(takes); W += W % 2
H = BH + SH + 20; H += H % 2
n = max(len(f) for _, _, f, _ in takes)
with tempfile.TemporaryDirectory() as td:
    k = 0
    for rep in range(3):
        for i in range(n):
            C = Image.new('RGB', (W, H), (40, 40, 40))
            d = ImageDraw.Draw(C)
            for j, (name, meta, fr, sc) in enumerate(takes):
                f = fr[min(i, len(fr) - 1)]
                C.paste(f, (j * BW, 0))
                d.text((j * BW + 4, 4), f'{name}  f{i}', fill=(255, 255, 0))
                C.paste(DARK, (j * BW, BH + 20, (j + 1) * BW, H))
                rgba, _ = key(f, meta['bg'])
                s = rgba.resize((max(1, round(f.width * sc)), max(1, round(f.height * sc))), Image.LANCZOS)
                C.paste(s, (j * BW + (BW - s.width) // 2, H - 12 - s.height), s)
                d.text((j * BW + 4, BH + 4), 'phone size (89 px)', fill=(200, 200, 200))
            C.save(f'{td}/{k:05d}.png'); k += 1
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', '16', '-i', f'{td}/%05d.png', '-c:v', 'libx264', '-pix_fmt',
                    'yuv420p', '-crf', '22', str(out / f'{clip}-preview.mp4')], check=True)
print(out / f'{clip}-sheet.jpg', out / f'{clip}-preview.mp4')
