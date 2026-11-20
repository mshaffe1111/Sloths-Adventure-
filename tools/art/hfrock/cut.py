"""ENG-ROCK: cut each img2img take (1536x768, two rocks on flat grey) into its LEFT (low wide) and RIGHT (tall narrow) rock: each half
keyed by tools/art/hf22p/cut.py (the grey flood from the edge, un-mixed rim, biggest part only, cropped), long side 400 px, lossless
WebP; plus a q90 copy (<name>.q.webp) small enough to bring back through hf_sandbox_fs.

    python cut.py <hf22p cut.py> <out dir> <take.png>...
"""
import subprocess, sys
from pathlib import Path
from PIL import Image

cutter, out = sys.argv[1], Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
for t in sys.argv[3:]:
    im = Image.open(t).convert('RGB')
    W = im.width
    for side, box in (('L', (0, 0, W // 2, im.height)), ('R', (W // 2, 0, W, im.height))):
        half = out / f'{Path(t).stem}-{side}.half.png'
        im.crop(box).save(half)
        dst = out / f'{Path(t).stem}-{side}.webp'
        subprocess.run([sys.executable, cutter, str(half), str(dst), '400'], check=True)
        Image.open(dst).save(out / f'{Path(t).stem}-{side}.q.webp', 'WEBP', quality=90, method=6)
        half.unlink()
        print('CUT', dst.name, Image.open(dst).size, flush=True)
