"""
make.py: the small painted stand-ins for every painted backdrop strip (src/assets/backdrops/w*-*.webp ->
src/assets/backdrops-lo/, a sixth of the size). A stage that starts before its strips have decoded shows these, soft but painted, and
the strips fade in over them: never a flat sky (lead, 2026-10-29). Run it again whenever a strip is added or repainted.

  python3 -I tools/art/backdroplo/make.py
"""
import glob, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SRC = os.path.join(ROOT, 'src', 'assets', 'backdrops')
OUT = os.path.join(ROOT, 'src', 'assets', 'backdrops-lo')
K = 6

os.makedirs(OUT, exist_ok=True)
made = 0
for f in sorted(glob.glob(os.path.join(SRC, 'w*-*.webp'))):
    im = Image.open(f)
    im.load()
    w, h = im.size
    lo = im.resize((max(8, round(w / K)), max(8, round(h / K))), Image.LANCZOS)
    lo.save(os.path.join(OUT, os.path.basename(f)), 'WEBP', quality=72, method=6)
    made += 1
# a stand-in whose strip is gone goes too
for f in glob.glob(os.path.join(OUT, '*.webp')):
    if not os.path.exists(os.path.join(SRC, os.path.basename(f))):
        os.remove(f)
print(f'{made} stand-ins in {OUT}')
