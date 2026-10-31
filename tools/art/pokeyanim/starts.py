"""Start pictures for Pokey's animation clips (pokey-anim, 2026-10-30): one of his standard frames (src/assets/hero/hero-standard.webp, cut by
scripts/cutStandard.py) on the flat grey the motion model was trained on, at the clip's size.

    python3 -I tools/art/pokeyanim/starts.py    -> reference/prop-sheets/qa-notes/pokey-anim/starts/<name>.png (kept in git: the job reads them from raw GitHub)
"""
import re
from pathlib import Path
from PIL import Image

H = Path(__file__).resolve().parent
ROOT = H.parents[2]
DATA = (ROOT / 'src/game/heroStandardData.ts').read_text()
ATLAS = Image.open(ROOT / 'src/assets/hero/hero-standard.webp').convert('RGBA')
GREY = (200, 200, 200)
# name: (frame, canvas w, h, standing-height in px on the canvas, feet y (fraction of h), x of the feet (fraction of w))
STARTS = {
    'jump': ('idle', 704, 704, 250, 0.93, 0.5),
    'run': ('run_0', 832, 480, 330, 0.92, 0.45),
    'flip': ('tuck', 704, 704, 300, 0.72, 0.5),
    'slide': ('run_3', 832, 480, 330, 0.92, 0.35),
    'skid': ('run_5', 832, 480, 330, 0.92, 0.55),
}


def frame(name):
    m = re.search(rf"\b{name}: \{{ x: (\d+), y: (\d+), w: (\d+), h: (\d+), ax: ([\d.]+), ay: ([\d.]+)", DATA)
    x, y, w, h = map(int, m.groups()[:4])
    return ATLAS.crop((x, y, x + w, y + h)), float(m.group(5)), float(m.group(6))


for out, (fn, W, Hh, stand, fy, fx) in STARTS.items():
    im, ax, ay = frame(fn)
    k = stand / 200
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    c = Image.new('RGBA', (W, Hh), GREY + (255,))
    c.alpha_composite(im, (round(W * fx - ax * k), round(Hh * fy - ay * k)))
    c.convert('RGB').save(ROOT / 'reference/prop-sheets/qa-notes/pokey-anim/starts' / f'{out}.png')
    print(out, fn, im.size)
