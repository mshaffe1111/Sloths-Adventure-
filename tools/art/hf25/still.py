"""ENG-25: a COMPOSITE still of the snap stone at its in-game size (not an engine frame: no shipped or toy stage is reachable by the
shooter yet). World 2's own backdrop layers, a row of three snap stones (80 u floors, drawn 1.08x as snapStoneArt.ts draws them, 40 u of
water between), each on a different count (SHUT = the bite, OPEN-1..3), and Pokey's standing frame at his drawn 89.1 u (D41), upright
412x915 and sideways 915x412 at the game's zoom (about 425 u across an upright phone, level.md World 1 notes).

    python3 -I tools/art/hf25/still.py <out dir>
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
sheet = Image.open('src/assets/w2-1118/w2-snapstone.webp').convert('RGBA')
FW, FH, WALK = 240, 140, 7
hero = Image.open('src/assets/hero/hero-atlas.webp').convert('RGBA').crop((231, 303, 231 + 180, 303 + 303))
layers = [Image.open(f'src/assets/backdrops/w2-{n}.webp').convert('RGBA') for n in ('sky', 'far', 'mid', 'near')]


def shot(W, H, units_across, name):
    k = W / units_across                       # screen px per world unit
    c = Image.new('RGBA', (W, H), (150, 190, 210, 255))
    floor = round(H * 0.68)                    # the stones' walk line on screen
    for i, L in enumerate(layers):             # each layer as tall as the view over the river (the sky over all), standing on the river line
        s = max(W / L.width, (floor + 14 * k) / L.height)
        im = L.resize((round(L.width * s), round(L.height * s)), Image.LANCZOS)
        c.alpha_composite(im, ((W - im.width) // 2, round(floor + 14 * k) - im.height if i else 0))
    d = ImageDraw.Draw(c)
    d.rectangle((0, floor + round(14 * k), W, H), fill=(70, 120, 120, 255))   # the river (a flat stand-in for the water strip)
    x = round(40 * k)
    d.rectangle((0, floor, x, H), fill=(110, 90, 60, 255))                    # the near bank (a flat stand-in)
    for f in (1, 2, 3, 4):
        x += round(40 * k)
        dw = round(80 * 1.08 * k); dh = round(FH * dw / FW)
        fr = sheet.crop((f * FW, 0, (f + 1) * FW, FH)).resize((dw, dh), Image.LANCZOS)
        c.alpha_composite(fr, (x + round(80 * k / 2) - dw // 2, floor - round(WALK * dw / FW)))
        x += round(80 * k)
    hh = round(89.1 * k); hw = round(180 * hh / 303)
    c.alpha_composite(hero.resize((hw, hh), Image.LANCZOS), (round(40 * k) + round(120 * k) + round(40 * k) - hw // 2, floor - hh + 2))
    d.text((8, 8), 'COMPOSITE (not an engine frame): counts 1, 2, 3 and the bite (SNAP); Pokey 89.1 u', fill=(255, 255, 255, 255))
    c.convert('RGB').save(out / name, quality=88)


shot(412, 915, 425, 'snapstone-upright-412x915.jpg')
shot(915, 412, 945, 'snapstone-sideways-915x412.jpg')
print('wrote', out)
