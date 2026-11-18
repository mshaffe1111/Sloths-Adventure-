"""ART 11-13: run in the HF sandbox: cut the picked climb takes (climbcut.py) at full size, then scale them to the pack's size
(climbpack.py STAND_PX / STAND_START) so they travel small; grips.json carries the scale applied. Tars <out dir>.

    python climbprep.py <climbcut.py> <out dir> <png>...
"""
import json, runpy, sys, tarfile
from pathlib import Path
from PIL import Image

SCALE = 300 / (200 * 2.8)
cut = runpy.run_path(sys.argv[1])['cut']
od = Path(sys.argv[2]); od.mkdir(parents=True, exist_ok=True)
allg = {'scale': SCALE}
for f in sys.argv[3:]:
    n = Path(f).stem
    info = cut(f, str(od / f'{n}-full.png'))
    im = Image.open(od / f'{n}-full.png')
    im = im.resize((round(im.width * SCALE), round(im.height * SCALE)), Image.LANCZOS)
    im.save(od / f'{n}.png', optimize=True)
    (od / f'{n}-full.png').unlink()
    allg[n] = info
(od / 'grips.json').write_text(json.dumps(allg, indent=1))
with tarfile.open(f'{od}.tar', 'w') as t:
    t.add(od, arcname=od.name)
print('TAR', Path(f'{od}.tar').stat().st_size)
