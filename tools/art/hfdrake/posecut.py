"""The new 9-10 and 10-10 boss poses (hfboss910a picks), keyed and trimmed at their source scale, into tools/art/hfdrake/poses/ (not
loaded by the game: the new fights in reference/boss-design/9-10-and-10-10.md are not built; cut910.py packs them into the boss atlases
when they are) and a review sheet.
    python3 -I tools/art/hfdrake/posecut.py <takes dir> <game checkout>
"""
import sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'hfbosses'))
sys.path.insert(0, str(HERE))
TAKES, GAME = Path(sys.argv[1]), Path(sys.argv[2])
sys.argv = [sys.argv[0], str(TAKES), str(GAME)]
from bosscut_lib import cut, review  # noqa: E402
from keyfix import flatten_key  # noqa: E402

PICKS = {'drake-tea': ('drake-teap-2', None), 'drake-breathdown': ('drake-breathdownp-6', None), 'drake-winded': ('drake-windedp-6', None),
         'drake-cling': ('drake-clingp-6', None), 'ironclaw-aboutface': ('gen-aboutfacep-6', None), 'ironclaw-chairlift': ('gen-chairliftp-6', None),
         'ironclaw-throw': ('gen-throwp-2', None), 'ironclaw-peek': ('gen-peekp-6', (0, 0, 1024, 456)), 'ironclaw-paw': ('gen-pawp-6', None)}
# (the peek is cut at the drawn wall's top, y 456: the game's tipped table stands there)
OUT = HERE / 'poses'
OUT.mkdir(exist_ok=True)
done = []
for name, (tk, box) in PICKS.items():
    p = cut(flatten_key(Image.open(TAKES / f'{tk}.webp')), 'magenta', box, mainOnly=name != 'ironclaw-paw', crumbs=300)
    p.save(OUT / f'{name}.webp', 'WEBP', quality=90, method=6)
    done.append((f'{name} ({tk})', p))
    print(name, p.size)
review('910-poses', done)
