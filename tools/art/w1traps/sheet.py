"""Contact sheet of the trap-piece takes (ART-W1, 2026-11-12): every take keyed by its own background (hfprops/cut.py key_own), shown
large on a crop of World 1's middle backdrop, with a game-size inset (the picture list's size, x2 like a phone) beside a bar of Pokey's
drawn height (89.1 px, heroSprite.ts). Raw takes are shown beside the keyed cut so a bad key is seen, not hidden.

    python3 -I tools/art/w1traps/sheet.py <takes dir> <out.jpg> [base commit]
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
sys.argv, ARGS = sys.argv[:1], sys.argv[1:]
import importlib.util  # noqa: E402  (hfprops/cut.py imports w1to4/cut.py as `cut`, so it is loaded under its own name)
_sp = importlib.util.spec_from_file_location('hfcut', ROOT / 'tools/art/hfprops/cut.py')
_m = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_m)
key_own = _m.key_own

TAKES, OUT = Path(ARGS[0]), Path(ARGS[1])
BASE = ARGS[2] if len(ARGS) > 2 else ''
POKEY = 89.1
# on-screen size from reference/art/W1-TRAPS-LIST.md: ('h', px) height or ('w', px) width
SIZE = {'hiveHang': ('h', 50), 'hiveDown': ('w', 50), 'stoneHang': ('w', 48), 'stoneDown': ('w', 48), 'handleSet': ('h', 130),
        'handleSprung': ('h', 40), 'tendrilSet': ('h', 130), 'tendrilCut': ('h', 44), 'anchor': ('w', 230), 'vineLink': ('w', 190),
        'leafClump': ('w', 70)}
ORDER = list(SIZE)
_bd = Image.open(ROOT / 'src/assets/backdrops/w1-mid.webp').convert('RGBA')
BD = Image.new('RGBA', _bd.size, (196, 214, 170, 255)); BD.alpha_composite(_bd); BD = BD.convert('RGB')  # (the strip has clear sky rows)
CELL, INS = 300, 2


def back(w, h, k):
    x = (k * 397) % max(1, BD.width - w)
    return BD.crop((x, max(0, BD.height - h - 120), x + w, max(0, BD.height - h - 120) + h)).resize((w, h))


takes = sorted(p for p in TAKES.glob('*.webp'))
groups = {n: [p for p in takes if p.stem.rsplit('-', 1)[0] == n] for n in ORDER}
groups = {n: v for n, v in groups.items() if v}
cols = max(len(v) for v in groups.values())
cw = CELL * 2 + 10
S = Image.new('RGB', (180 + cols * cw, 40 + len(groups) * (CELL + 30)), (24, 24, 30))
d = ImageDraw.Draw(S)
d.text((8, 8), f'ART-W1 trap takes (raw | keyed on W1 mid backdrop, inset = game size x2 beside Pokey 89 px)  base {BASE}', fill=(255, 255, 0))
for r, (n, ps) in enumerate(groups.items()):
    y = 40 + r * (CELL + 30)
    d.text((8, y + CELL // 2), n, fill=(255, 255, 255))
    for c, p in enumerate(ps):
        x = 180 + c * cw
        raw = Image.open(p).convert('RGB')
        raw.thumbnail((CELL, CELL))
        S.paste(raw, (x, y))
        cut = key_own(Image.open(p).convert('RGB'), solo=True)
        bg = back(CELL, CELL, r * 5 + c).convert('RGBA')
        big = cut.copy(); big.thumbnail((CELL - 20, CELL - 90))
        bg.alpha_composite(big, ((CELL - big.width) // 2, 8))
        ax, v = SIZE[n]
        k = INS * (v / (cut.height if ax == 'h' else cut.width))
        sm = cut.resize((max(1, round(cut.width * k)), max(1, round(cut.height * k))), Image.LANCZOS)
        if sm.height > 80 or sm.width > CELL - 40:  # (too tall for the strip: scaled to fit, the bar scaled with it)
            f = min(80 / sm.height, (CELL - 40) / sm.width)
            sm = sm.resize((max(1, round(sm.width * f)), max(1, round(sm.height * f))), Image.LANCZOS)
        else:
            f = 1
        ph = round(POKEY * INS * f)
        base = CELL - 6
        dd = ImageDraw.Draw(bg)
        dd.rectangle((10, base - min(ph, CELL - 10), 22, base), fill=(150, 95, 50, 255))
        bg.alpha_composite(sm, (32, base - sm.height))
        S.paste(bg.convert('RGB'), (x + CELL + 4, y))
        a = np.asarray(cut.getchannel('A'))
        hole = 1 - (a > 128).sum() / max(1, (a > 10).sum())
        d.text((x + 2, y + CELL + 4), f'{p.stem}  {cut.width}x{cut.height}  soft {hole:.0%}', fill=(220, 220, 120))
OUT.parent.mkdir(parents=True, exist_ok=True)
S.save(OUT, quality=82)
print(OUT, S.size)
