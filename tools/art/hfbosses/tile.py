"""python3 tile.py out.jpg cols scale f1 f2 ..."""
import sys
from PIL import Image
out, cols, sc = sys.argv[1], int(sys.argv[2]), float(sys.argv[3])
ims = [Image.open(f).convert('RGB') for f in sys.argv[4:]]
ims = [im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS) for im in ims]
w = max(i.width for i in ims); h = max(i.height for i in ims)
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * (w + 4), rows * (h + 4)), (60, 60, 60))
for k, im in enumerate(ims):
    S.paste(im, ((k % cols) * (w + 4), (k // cols) * (h + 4)))
S.save(out, quality=85)
