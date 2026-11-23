"""ART-NEXT-c: the batch 2 cuts (part NEXT2) at game size beside Pokey (his idle frame drawn 89.1 world px tall: heroStandardData
STD_STAND_H 200 = HERO_UNITS x HERO_SPRITE_SCALE), Pokey STANDING on each platform's walk line (catalog2.py's WALK), at D screen px a
world px, on World 3's dark grotto and on a light ground.
    python3 -I tools/art/hfnext/contact2.py <out.jpg> [D 1.5]
Scales (cut px a world px) here and in catalog2.py go together.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw
OUT = sys.argv[1]; D = float(sys.argv[2]) if len(sys.argv) > 2 else 1.5
C = 'reference/art/hfnext/cut/'
P = 89.1
WALK = {'lipA-s11': (88, 20, 860), 'lipA-s23': (71, 20, 935), 'lipA-s37': (91, 20, 895), 'lipB-s23': (63, 30, 930), 'lipB-s37': (79, 30, 860),
        'rimLong-s11': (66, 10, 645), 'rimS-s11': (38, 6, 330), 'rimS-s23': (54, 6, 458), 'rimShort-s11': (59, 6, 389),
        'shelfS-s37': (48, 8, 410), 'sleepy-s23': (135, 222, 649), 'sleepy-s37': (131, 197, 643), 'mat-s23': (11, 69, 272)}
CPU = {n: (2.2 if n.startswith('lip') else 3.0) for n in WALK}
NAMES = list(WALK) + sorted(f[:-4] for f in os.listdir(C) if f.startswith('reedsR-'))
hero = Image.open('src/assets/hero/hero-standard.webp').convert('RGBA').crop((674, 478, 674 + 127, 478 + 209))
AX, AY = 57.0, 205.0   # the idle frame's feet anchor (heroStandardData)
hk = P / 200 * D
pk = hero.resize((round(hero.width * hk), round(hero.height * hk)), Image.LANCZOS)
def tile(n, bgc):
    im = Image.open(C + n + '.png').convert('RGBA'); k = D / CPU.get(n, 3.0)
    g = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    top = round(P * D) + 14
    T = Image.new('RGBA', (g.width + pk.width + 30, top + g.height + 8), bgc)
    T.alpha_composite(g, (6, top))
    d = ImageDraw.Draw(T)
    if n in WALK:   # Pokey on the walk line, two-thirds along it
        wy, x0, x1 = WALK[n]; fx = 6 + round((x0 + (x1 - x0) * 0.66) * k); fy = top + round(wy * k)
        T.alpha_composite(pk, (fx - round(AX * hk), fy - round(AY * hk)))
        d.line([(6 + round(x0 * k), fy), (6 + round(x1 * k), fy)], fill=(255, 60, 60, 160), width=1)
    else:           # decor: Pokey beside it on the same ground
        T.alpha_composite(pk, (g.width + 16, top + g.height - pk.height))
    d.text((4, 2), n + ('' if n in WALK else '  (decor)'), fill=(255, 230, 90, 255))
    return T
rows = []
for n in NAMES:
    a, b = tile(n, (24, 28, 40, 255)), tile(n, (214, 220, 200, 255))
    R = Image.new('RGBA', (a.width + b.width + 10, a.height), (0, 0, 0, 255)); R.paste(a, (0, 0)); R.paste(b, (a.width + 10, 0)); rows.append(R)
cols = 2; W = max(r.width for r in rows)
hs = [0] * cols; place = []
for r in rows:
    c = hs.index(min(hs)); place.append((r, c * (W + 10), hs[c])); hs[c] += r.height + 6
S = Image.new('RGB', (cols * (W + 10), max(hs)), (0, 0, 0))
for r, x, y in place: S.paste(r.convert('RGB'), (x, y))
S.save(OUT, quality=85); print(OUT, S.size)
