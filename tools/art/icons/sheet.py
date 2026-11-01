"""Contact sheet of cut icons on the game's green leaf and dark wood colours: python3 -I sheet.py <out.jpg> <webp>..."""
import sys, os
from PIL import Image, ImageDraw
fs = sys.argv[2:]
cols, cw = 8, 200
rows = (len(fs) + cols - 1) // cols
out = []
for bgc in [(52, 78, 40), (30, 20, 12)]:
    S = Image.new('RGB', (cols * cw, rows * (cw + 14)), bgc); d = ImageDraw.Draw(S)
    for i, f in enumerate(fs):
        im = Image.open(f).convert('RGBA'); im.thumbnail((192, 192))
        x, y = (i % cols) * cw, (i // cols) * (cw + 14)
        S.paste(im, (x + 4, y + 14), im); d.text((x + 3, y + 1), os.path.basename(f)[:-5], fill=(255, 255, 0))
    out.append(S)
T = Image.new('RGB', (out[0].width, out[0].height * 2)); T.paste(out[0], (0, 0)); T.paste(out[1], (0, out[0].height))
T.save(sys.argv[1], quality=85)
