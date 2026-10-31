"""Start sheets for World 9's hazard art (2026-10-29), for img2img (tools/art/w6to10/img2imggpu.py, Qwen-Image + the style model), made
from World 9's own painted pieces on flat magenta (the HF brief: img2img from the world's kit keeps the style):
  start-w9lava.webp    1536 x 416: a side-on molten lava surface, crust plates riding it, the deep glow below (cut into a tiling strip)
  start-w9geyser.webp  1536 x 768: the vent rock (w9b vent-rock) quiet, the same rock glowing and steaming (the warning), and two
                       eruption columns rising out of it (the burst), side by side on magenta
  start-w9haze.webp    1536 x 416: pale heat-haze wisps and drifting embers, to rise off the lava
    python3 tools/art/w9/lavastart.py
"""
import json, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'tools/art/hfbatch/starts'
OUT.mkdir(parents=True, exist_ok=True)
KEY = (255, 0, 255)
rnd = random.Random(9)


def cell(sheet, name):
    js = json.loads((ROOT / f'src/assets/w6to10/props-made/{sheet}.json').read_text())
    f = js['frames'][name]
    im = Image.open(ROOT / f'src/assets/w6to10/props-made/{sheet}.webp').convert('RGBA')
    return im.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


# ── the lava strip: the painted lava pool's molten middle, stretched and tiled along, with crust plates and a dark deep under it ──
pool = cell('w9c', 'lava-pool')
mol = pool.crop((pool.width * 0.25, pool.height * 0.35, pool.width * 0.75, pool.height * 0.75)).convert('RGB')
W, H = 1536, 416
lava = Image.new('RGB', (W, H), KEY)
# (random crops of the molten middle at random sizes, so the start has no beat for the paint to keep)
x = 0
while x < W:
    cw = rnd.randint(140, 260)
    sx = rnd.randint(0, mol.width - 60)
    piece = mol.crop((sx, 0, min(mol.width, sx + rnd.randint(50, 120)), mol.height)).resize((cw, 150))
    lava.paste(piece if rnd.random() < 0.5 else piece.transpose(Image.FLIP_LEFT_RIGHT), (x, 60))
    x += cw
d = ImageDraw.Draw(lava)
# the deep: from the band's glow down to a dark red
for y in range(210, H):
    k = (y - 210) / (H - 210)
    d.line([(0, y), (W, y)], fill=(int(200 - 130 * k), int(70 - 55 * k), int(20 - 10 * k)))
# crust plates riding on the surface
for i in range(16):
    cx = rnd.randint(0, W)
    w = rnd.randint(50, 130)
    cy = rnd.randint(70, 150)
    d.polygon([(cx - w // 2, cy), (cx - w // 3, cy - 12), (cx + w // 3, cy - 10), (cx + w // 2, cy + 2), (cx + w // 4, cy + 12), (cx - w // 3, cy + 10)], fill=(46, 36, 38), outline=(24, 18, 20))
    d.line([(cx - w // 4, cy), (cx + w // 5, cy - 3)], fill=(255, 150, 40), width=2)
# a wavy top edge: the surface line
for x in range(0, W, 4):
    top = 60 + int(6 * __import__('math').sin(x * 0.02)) + rnd.randint(-2, 2)
    d.line([(x, 0), (x, top)], fill=KEY, width=4)
lava = lava.filter(ImageFilter.SMOOTH)
lava.save(OUT / 'start-w9lava.webp', quality=92)

# ── the geyser: quiet vent, warning vent, two bursts ──
rock = cell('w9b', 'vent-rock')
G = Image.new('RGBA', (1536, 768), KEY + (255,))
rw = 300
r = rock.resize((rw, round(rock.height * rw / rock.width)))
cols = [192, 576, 960, 1344]
for i, cx in enumerate(cols):
    y0 = 768 - r.height - 10
    gd = ImageDraw.Draw(G)
    if i == 1:
        # the warning: steam puffs over the mouth
        for k in range(5):
            rr = 26 + 10 * k
            gd.ellipse([cx - rr + rnd.randint(-20, 20), y0 - 40 - 50 * k - rr, cx + rr, y0 - 40 - 50 * k + rr], fill=(222, 212, 206, 255))
    if i >= 2:
        # the burst: a tall spout of molten rock and fire, wider at its foot, ragged at the top, blobs flung out
        h = 540 if i == 2 else 470
        sway = 18 if i == 2 else -22
        pts = [(cx - 70, y0 + 30), (cx - 52 + sway // 2, y0 - h * 0.5), (cx - 34 + sway, y0 - h), (cx + 34 + sway, y0 - h), (cx + 52 + sway // 2, y0 - h * 0.5), (cx + 70, y0 + 30)]
        gd.polygon(pts, fill=(255, 150, 30, 255))
        gd.polygon([(cx - 34, y0 + 20), (cx - 22 + sway // 2, y0 - h * 0.55), (cx + 22 + sway // 2, y0 - h * 0.55), (cx + 34, y0 + 20)], fill=(255, 236, 150, 255))
        for k in range(9):
            bx = cx + rnd.randint(-120, 120)
            by = y0 - rnd.randint(int(h * 0.4), int(h * 1.0))
            br = rnd.randint(8, 16)
            gd.ellipse([bx - br, by - br, bx + br, by + br], fill=(255, 120, 30, 255), outline=(60, 20, 10, 255))
    G.alpha_composite(r, (cx - rw // 2, y0))
    if i == 1:
        gd.ellipse([cx - 40, y0 + 4, cx + 40, y0 + 34], fill=(255, 190, 70, 255))
G.convert('RGB').save(OUT / 'start-w9geyser.webp', quality=92)

# ── the heat haze: pale wisps and embers ──
Hz = Image.new('RGB', (1536, 416), KEY)
hd = ImageDraw.Draw(Hz)
for i in range(6):
    cx = 130 + i * 250
    for k in range(7):
        rr = 34 - 3 * k
        hd.ellipse([cx - rr + 14 * __import__('math').sin(k), 360 - 46 * k - rr, cx + rr + 14 * __import__('math').sin(k), 360 - 46 * k + rr], fill=(236, 214, 196))
    for k in range(5):
        ex, ey = cx + rnd.randint(-80, 80), rnd.randint(40, 330)
        hd.ellipse([ex - 5, ey - 5, ex + 5, ey + 5], fill=(255, 150, 40))
Hz.filter(ImageFilter.GaussianBlur(2)).save(OUT / 'start-w9haze.webp', quality=92)
print('starts written')
