"""ART-W3 grotto thorns (the lead 11-25: the World 1 brambles read too small, brown and low-contrast in the dark; anything that hurts
Pokey must read as danger at a glance): paste-up starts on flat grey for a grotto thorn bed (long) and a thorn clump (short), pale-bone
thorns with cold-blue shading and a warm red-orange danger rim at the tips, on a low dark rock base. 3 canvas px a world px; the bed
~0.63 Pokey tall like the W1 thorn rows (56 units = 168 px). Run from the repo root:
    python3 -I tools/art/hfw3/starts5.py   -> reference/art/hfw3/starts5/*.png
"""
import math, random
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path('reference/art/hfw3/starts5'); OUT.mkdir(parents=True, exist_ok=True)
GREY = (128, 128, 128)
LINE = (26, 24, 30)
BONE, BONE_D, BLUE, RIM, ROCK, ROCK_L = (232, 226, 208), (176, 170, 160), (120, 150, 190), (236, 96, 48), (52, 60, 62), (78, 90, 90)


def bed(w, seed):
    rnd = random.Random(seed)
    im = Image.new('RGBA', (w, 220), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    base_y = 170
    # the rock base: a low lumpy mound
    pts = [(0, 210)] + [(x, base_y - 8 + int(10 * math.sin(x / 37.0 + seed))) for x in range(0, w + 1, 16)] + [(w, 210)]
    d.polygon(pts, fill=ROCK + (255,), outline=LINE)
    d.line([(8, base_y + 4), (w - 8, base_y + 4)], fill=ROCK_L, width=3)
    # thorns: sharp curved spikes, tallest in the middle, leaning both ways
    x = 18
    while x < w - 18:
        hgt = rnd.randint(70, 150) if 0.15 < x / w < 0.85 else rnd.randint(50, 100)
        lean = rnd.uniform(-0.35, 0.35); bw = rnd.randint(18, 30)
        tip = (x + lean * hgt, base_y - hgt)
        poly = [(x - bw / 2, base_y), (x + bw / 2, base_y), tip]
        d.polygon(poly, fill=BONE + (255,), outline=LINE)
        d.polygon([(x, base_y), (x + bw / 2, base_y), tip], fill=BONE_D + (255,))      # the shaded side
        d.line([(x + bw / 4, base_y - 6), tip], fill=BLUE, width=3)                     # cold-blue shading line
        # warm danger rim: the top third of the thorn edged red-orange
        t0 = (x - bw / 2 + (tip[0] - x + bw / 2) * 0.62, base_y + (tip[1] - base_y) * 0.62)
        t1 = (x + bw / 2 + (tip[0] - x - bw / 2) * 0.62, base_y + (tip[1] - base_y) * 0.62)
        d.line([t0, tip, t1], fill=RIM, width=5)
        x += rnd.randint(22, 40)
    return im


B = Image.new('RGBA', (1024, 384), GREY + (255,)); B.alpha_composite(bed(900, 3), (62, 100)); B.convert('RGB').save(OUT / 'thornBed.png')
K = Image.new('RGBA', (768, 384), GREY + (255,)); K.alpha_composite(bed(440, 7), (164, 100)); K.convert('RGB').save(OUT / 'thornClump.png')
sh = Image.new('RGB', (1024 + 768 + 10, 384), (20, 20, 20)); sh.paste(B.convert('RGB'), (0, 0)); sh.paste(K.convert('RGB'), (1034, 0))
sh.save(OUT.parent / 'starts5-sheet.jpg', quality=85)
print('ok')
