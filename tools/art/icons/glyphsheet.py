"""Group E check: each small painted glyph at every CSS size it is used, drawn at 2x (a phone's pixel density), on the game's cream
card, dark wood and leaf green.   python3 -I tools/art/icons/glyphsheet.py <out.png>"""
import sys
from PIL import Image, ImageDraw, ImageFont
ROWS = [('lock', [13, 15, 17, 19, 24, 34]), ('star', [11, 15, 17, 19]), ('checkmark', [14, 16, 24]), ('close', [24, 26]),
        ('back', [22, 24, 26, 28]), ('play', [20, 22, 24, 26, 34]), ('restart', [22, 40]), ('paw', [17, 20]), ('heart', [19, 24]),
        ('heartEmpty', [19, 24]), ('spyglass', [26])]
BG = [(244, 228, 196), (92, 58, 30), (46, 92, 44)]
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
W, RH = 1500, 90
S = Image.new('RGB', (W, RH * len(ROWS)), (20, 14, 8)); d = ImageDraw.Draw(S)
for r, (name, sizes) in enumerate(ROWS):
    y = r * RH
    d.text((8, y + 30), name, fill=(255, 230, 120), font=F)
    im = Image.open(f'src/assets/icons/{name}.webp').convert('RGBA')
    x = 170
    for bg in BG:
        d.rectangle((x - 6, y + 6, x + len(sizes) * 80, y + RH - 6), fill=bg)
        for sz in sizes:
            t = im.resize((sz * 2, sz * 2), Image.LANCZOS)
            S.paste(t, (x, y + (RH - sz * 2) // 2), t)
            d.text((x, y + RH - 22), str(sz), fill=(120, 120, 120), font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12))
            x += 80
        x += 20
S.save(sys.argv[1])
