# sheet.py OUT.jpg COLS SCALE files... : a labelled contact sheet of screenshots
import sys
from PIL import Image, ImageDraw
out, cols, scale = sys.argv[1], int(sys.argv[2]), float(sys.argv[3])
ims = [(f, Image.open(f).convert('RGB')) for f in sys.argv[4:]]
w = max(int(i.width*scale) for _, i in ims); h = max(int(i.height*scale) for _, i in ims) + 14
rows = (len(ims)+cols-1)//cols
S = Image.new('RGB', (cols*w, rows*h), (40, 40, 40)); d = ImageDraw.Draw(S)
for k, (f, i) in enumerate(ims):
    x, y = (k % cols)*w, (k//cols)*h
    S.paste(i.resize((int(i.width*scale), int(i.height*scale))), (x, y+14))
    d.text((x+2, y+1), f.split('/')[-1][:60], fill=(255, 255, 0))
S.save(out, quality=85)
print(out, S.size)
