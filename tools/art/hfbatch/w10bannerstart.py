"""World 10's swing banner, the start for img2img (2026-10-29, branch gen2-w10-swing): three tall war banners hung each from an iron ring,
no pole, cut from World 10's own painted pieces (props-made/w10alt 'banner-b' and gemini/w10c 'banner': the cloth, stretched long and its
pole cut away under the cloth; the kit's chain ring, kits/w10.webp 'liana' rows 0-90) on flat magenta, 1024 x 1024. Pokey swings on the
cloth (gen2/worlds/w10Swing.ts look 'banner'), so it is long and narrow: a ring, a short iron bar, the cloth down to a torn end.
    python3 tools/art/hfbatch/w10bannerstart.py  -> tools/art/hfbatch/starts/start-w10banner.webp
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image

R = Path(__file__).resolve().parents[3]
A = R / 'src/assets'


def frame(sheet, key):
    d = json.loads((A / f'{sheet}.json').read_text())
    f = d.get('frames', d)[key]
    f = f.get('frame', f)
    return Image.open(A / f'{sheet}.webp').convert('RGBA').crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


def cloth(img, top, bot):
    """the cloth from row `top` (under the crossbar's finial) to `bot` (its torn end), the pole below the cloth cut away"""
    c = np.array(img)
    c[bot:, :, 3] = 0
    return Image.fromarray(c).crop((0, top, img.width, bot))


kit = json.loads((R / 'src/game/kitAtlasData.ts').read_text().split('= ', 1)[1].rstrip().rstrip(';'))['10']['liana']
ring = Image.open(A / 'kits/w10.webp').convert('RGBA').crop((kit['x'], kit['y'], kit['x'] + kit['w'], kit['y'] + 95))
out = Image.new('RGBA', (1024, 1024), (255, 0, 255, 255))
bb = frame('w6to10/props-made/w10alt', 'banner-b')
bc = frame('w6to10/gemini/w10c-set-dressing', 'banner')
# (the cloth: banner-b's from its crossbar down, its stick cut off where it leaves the cloth; w10c's at twice the size)
pieces = [cloth(bb, 28, 352), cloth(bc.resize((bc.width * 2, bc.height * 2), Image.LANCZOS), 40, 452), cloth(bb, 28, 352).transpose(Image.FLIP_LEFT_RIGHT)]
for k, p in enumerate(pieces):
    w = 230
    h = 840
    p = p.resize((w, h), Image.LANCZOS)
    x = 60 + k * 330
    out.alpha_composite(ring.resize((70, 74), Image.LANCZOS), (x + w // 2 - 35, 20))
    out.alpha_composite(p, (x, 90))
# (the stick under each torn end: from the bottom up, a row whose only paint is a narrow band (the stick) goes back to magenta)
a = np.array(out)
mag = (a[:, :, 0] > 200) & (a[:, :, 1] < 60) & (a[:, :, 2] > 200)
for k in range(3):
    x0, x1 = 60 + k * 330, 60 + k * 330 + 230
    for y in range(1023, 90, -1):
        xs = np.where(~mag[y, x0:x1])[0]
        if len(xs) and xs.max() - xs.min() > 30:
            break
        a[y, x0:x1] = (255, 0, 255, 255)
out = Image.fromarray(a)
dst = Path(__file__).resolve().parent / 'starts/start-w10banner.webp'
out.convert('RGB').save(dst, quality=95)
print(dst)
