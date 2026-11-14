"""ART 11-13: the creek tile's seam start. Rolls a creek take by half its width (the join moves to the middle) and cuts the 1024 px
band round that join as an img2img start (the sky13 way: repaint the band whole, then feather it back with creekfinish.py).

    python3 -I tools/art/hf1113/creekstart.py <take.webp> <out dir>   -> <out>/<stem>-roll.png, <out>/<stem>-band.png
"""
import sys
from pathlib import Path
from PIL import Image

src, out = Path(sys.argv[1]), Path(sys.argv[2])
im = Image.open(src).convert('RGB')
W, H = im.size
r = Image.new('RGB', (W, H))
r.paste(im.crop((W // 2, 0, W, H)), (0, 0))
r.paste(im.crop((0, 0, W // 2, H)), (W - W // 2, 0))
out.mkdir(parents=True, exist_ok=True)
r.save(out / f'{src.stem}-roll.png')
x0 = W // 2 - 512
r.crop((x0, 0, x0 + 1024, H)).save(out / f'{src.stem}-band.png')
print(W, H, 'band x', x0, x0 + 1024)
