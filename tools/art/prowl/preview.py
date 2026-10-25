"""a looping preview of the usable Prowler clips, keyed onto the lair painting"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'train'))
from clips import key
H = Path(__file__).resolve().parent
SHOW = [('Waiting', 'idle', list(range(0, 49))), ('Prowling', 'walk', list(range(0, 49))), ('Pounce', 'pounce', list(range(0, 35)) + [34] * 6),
        ('Roar', 'roar', list(range(0, 22)) + [21] * 6), ('Hit', 'hurt', list(range(0, 14)) + [13] * 6), ('Beaten', 'defeated', list(range(0, 22)) + [21] * 14)]
PW, PH = 420, 260
bgsrc = Image.open(H.parent / 'w3c/src/lair.jpg').convert('RGB')
bg = bgsrc.crop((180, 300, 880, 572)).resize((PW, round(PW * 272 / 700)))
bgp = Image.new('RGB', (PW, PH), (12, 15, 16)); bgp.paste(bg, (0, PH - bg.height))
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20) if Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf').exists() else ImageFont.load_default()
panels = []
for label, clip, sel in SHOW:
    fr = []
    for i in sorted(set(sel)):
        rgb = np.asarray(Image.open(H / f'vids/{clip}/{clip}_{i:03d}.png').convert('RGB'))
        fr.append((i, rgb, key(rgb)))
    al = np.maximum.reduce([a for _, _, a in fr])
    ys, xs = np.nonzero(al > 40)
    x0, x1, y0, y1 = xs.min() - 6, xs.max() + 6, ys.min() - 6, ys.max() + 6
    s = min((PW - 30) / (x1 - x0), (PH - 50) / (y1 - y0))
    out = {}
    for i, rgb, a in fr:
        im = Image.fromarray(np.dstack([rgb, a]).astype(np.uint8), 'RGBA').crop((x0, y0, x1, y1))
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        p = bgp.copy(); p.paste(im, ((PW - im.width) // 2, PH - 22 - im.height), im)
        d = ImageDraw.Draw(p); d.text((12, 10), label, fill=(255, 236, 170), font=font)
        out[i] = p
    panels.append([out[i] for i in sel])
N = max(len(p) for p in panels)
frames = []
for t in range(N):
    sheet = Image.new('RGB', (PW * 3 + 8, PH * 2 + 4), (0, 0, 0))
    for k, p in enumerate(panels):
        sheet.paste(p[t % len(p)], ((k % 3) * (PW + 4), (k // 3) * (PH + 4)))
    frames.append(sheet)
frames[0].save(H / 'prowler-preview.gif', save_all=True, append_images=frames[1:], duration=70, loop=0, optimize=True)
frames[20].save(H / 'prowler-preview-still.jpg', quality=88)
print(N)
