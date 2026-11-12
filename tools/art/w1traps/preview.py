"""Quick review sheet of cut pieces on World 1 green (and any starts on dark): python3 -I tools/art/w1traps/preview.py <out.jpg> <png dir>..."""
import glob, os, sys
from PIL import Image, ImageDraw
H, CW = 260, 370
ims = []
for d in sys.argv[2:]:
    for f in sorted(glob.glob(d + '/*.png')):
        p = Image.open(f).convert('RGBA'); k = min(H / p.height, (CW - 10) / p.width)
        p = p.resize((max(1, int(p.width * k)), max(1, int(p.height * k))))
        c = Image.new('RGBA', (CW, H + 16), (70, 110, 60, 255)); c.alpha_composite(p, ((CW - p.width) // 2, 0))
        ImageDraw.Draw(c).text((3, H + 2), os.path.basename(f), fill=(255, 255, 0)); ims.append(c)
cols = 7; rows = (len(ims) + cols - 1) // cols
sh = Image.new('RGB', (cols * CW, rows * (H + 16)))
for i, c in enumerate(ims): sh.paste(c.convert('RGB'), ((i % cols) * CW, (i // cols) * (H + 16)))
sh.save(sys.argv[1], quality=80); print(sh.size)
