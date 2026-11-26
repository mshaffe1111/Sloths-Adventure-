"""ART-NEXT-b: the weir at game size with World 2's DEEP river drawn over its foot as the engine draws it (riverArt.ts drawRiverWater:
the w2-props water frame tiled WATER_TILE wide, its top th x 0.045 over the surface, RIVER_DEEP under it), Pokey on the left middle
rock, on World 2's day sky; D screen px a world px.
    python3 -I tools/art/hfnext/weirmock.py <out.jpg> [SURF_CUT_Y 318] [D 1.5] [WATER_TILE 300: riverArt.ts:126]
SURF_CUT_Y: the river's surface on the weir cut (cut px from its top): the falls' foam line.
"""
import sys
from PIL import Image
OUT = sys.argv[1]; SURF = float(sys.argv[2]) if len(sys.argv) > 2 else 318; D = float(sys.argv[3]) if len(sys.argv) > 3 else 1.5
P, WATER_TILE, WEIR_W = 89.1, float(sys.argv[4]) if len(sys.argv) > 4 else 300, 921
weir = Image.open('reference/art/hfnext/cut/weir.png').convert('RGBA')
k = WEIR_W * D / weir.width
weir = weir.resize((round(weir.width * k), round(weir.height * k)), Image.LANCZOS)
sheet = Image.open('src/assets/props/w2-props.webp').convert('RGBA')
water = sheet.crop((0, 1262, 640, 1262 + 286))
tw = round(WATER_TILE * D); th = round(tw * 286 / 640)
water = water.resize((tw, th), Image.LANCZOS)
hero = Image.open('src/assets/hero/hero-standard.webp').convert('RGBA').crop((674, 478, 674 + 127, 478 + 209))
hero = hero.resize((round(127 * P / 200 * D), round(209 * P / 200 * D)), Image.LANCZOS)
W, H = weir.width + 80, weir.height + int(P * D) + int(90 * D)
img = Image.new('RGBA', (W, H), (178, 206, 214, 255))
wx, wy = 40, int(P * D)
img.alpha_composite(weir, (wx, wy))
surf = wy + round(SURF * k)
top = round(surf - th * 0.045)
img.paste((0x26, 0x42, 0x47, 255), (0, top + th - 2, W, H))
x = 0
while x < W: img.alpha_composite(water, (x, top)); x += tw - 1
step = wy + round(96 * k); img.alpha_composite(hero, (wx + round(222 * k), step - hero.height))
img.convert('RGB').save(OUT, quality=88)
print(OUT, img.size, 'surface at', surf)
