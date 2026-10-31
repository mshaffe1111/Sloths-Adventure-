"""Starts for World 8's fungus steps (GRAB-BAG.md J, 2026-10-31): flat side-on sketches on magenta that fungusgpu.py repaints by img2img.
    python3 -I tools/art/hfbatch/fungusstarts.py <out dir>
  bracket.png       a shelf-fungus bracket seen from the side: a flat top to stand on, banded tan / rust / violet, a soft round
                    underside, a few blue glow spots (World 8's night palette), as wide as a step (about 2.6 : 1)
  bracket-moss.png  the same with a little moss and two tiny glow mushrooms on its top edge
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)


def bracket(moss=False, size=512):
    im = Image.new('RGB', (size, size), MAG)
    d = ImageDraw.Draw(im)
    x0, x1, top = 70, 442, 210
    # the underside: a squashed half disc, then the bands
    d.chord((x0, top - 120, x1, top + 130), 0, 180, fill=(92, 70, 120), outline=(30, 22, 40), width=6)
    d.chord((x0 + 14, top - 90, x1 - 14, top + 96), 0, 180, fill=(150, 92, 70))
    d.chord((x0 + 30, top - 60, x1 - 30, top + 62), 0, 180, fill=(196, 150, 104))
    d.chord((x0 + 50, top - 34, x1 - 50, top + 30), 0, 180, fill=(224, 196, 150))
    # the flat top and its lip
    d.rectangle((x0, top - 16, x1, top + 4), fill=(206, 170, 120), outline=(30, 22, 40), width=6)
    for k, (gx, gy) in enumerate([(150, 260), (230, 290), (320, 270), (380, 240), (110, 236)]):
        r = 9 if k % 2 else 6
        d.ellipse((gx - r, gy - r, gx + r, gy + r), fill=(150, 220, 255))
    if moss:
        for mx in range(x0 + 6, x1 - 6, 18):
            d.ellipse((mx - 12, top - 28, mx + 12, top - 8), fill=(70, 110, 80))
        for gx in (140, 360):
            d.rectangle((gx - 3, top - 58, gx + 3, top - 20), fill=(200, 220, 230))
            d.ellipse((gx - 16, top - 74, gx + 16, top - 50), fill=(120, 200, 255), outline=(30, 22, 40), width=3)
    return im.filter(ImageFilter.GaussianBlur(0.6))


bracket().save(OUT / 'bracket.png')
bracket(True).save(OUT / 'bracket-moss.png')
print('ok', OUT)
