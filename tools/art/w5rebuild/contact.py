# contact sheet: python3 contact.py <out.jpg> <cols> <scale> files...
import sys
from PIL import Image, ImageDraw
out, cols, sc = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]); fs = sys.argv[4:]
ims = [Image.open(f).convert('RGB') for f in fs]
w, h = int(ims[0].width * sc), int(ims[0].height * sc)
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * w, rows * (h + 14)), (20, 20, 20)); d = ImageDraw.Draw(S)
for i, (im, f) in enumerate(zip(ims, fs)):
    x, y = (i % cols) * w, (i // cols) * (h + 14)
    S.paste(im.resize((w, h)), (x, y + 14)); d.text((x + 3, y + 1), f.split('/')[-1][:60], fill=(255, 255, 0))
S.save(out, quality=82)
