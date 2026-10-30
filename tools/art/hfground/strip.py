"""A row of shots at a third of their size, for a quick look: python3 tools/art/hfground/strip.py <shots dir> <out.jpg> <tag> <up|side> <stage>..."""
import sys
from PIL import Image

d, out, tag, o, *st = sys.argv[1:]
ims = [Image.open(f'{d}/{tag}-{s}-{o}.jpg') for s in st]
k = 3
if o == 'up':
    O = Image.new('RGB', (sum(i.width // k for i in ims), ims[0].height // k))
    x = 0
    for i in ims:
        O.paste(i.resize((i.width // k, i.height // k)), (x, 0)); x += i.width // k
else:
    O = Image.new('RGB', (ims[0].width // k, sum(i.height // k for i in ims)))
    y = 0
    for i in ims:
        O.paste(i.resize((i.width // k, i.height // k)), (0, y)); y += i.height // k
O.save(out, quality=82)
