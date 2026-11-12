"""The contact sheet for the lead (ART-W1, 2026-11-12): two candidates per trap piece, each cut and shown large on World 1 green, and
again at game size beside the real Pokey cropped from W1C's 1-3 still (1.57 still-px per game unit: he is 140 px there, 89.1 units).

    python3 -I tools/art/w1traps/lead_sheet.py <cuts root> <W1C upright still> <out.jpg> <base commit>
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

C, STILL, OUT, BASE = Path(sys.argv[1]), sys.argv[2], sys.argv[3], sys.argv[4]
K = 140 / 89.1  # still px per game unit
# (row label, [(candidate label, file under C, axis, game units)])  game units from castArt.ts / dropTrap.ts: the handle hangs from
# the clump 168 over the ground to his raised hand 42 over it (126 long); the tendril runs the full 168; the load hangs 100 up
ROWS = [
    ('1 HANDLE, set (vine he punches)', [('A', 'cuts/handleSet-67.png', 'h', 126), ('B', 'cuts/handleSet-29.png', 'h', 126)]),
    ('1 HANDLE, sprung', [('A', 'cuts/handleSprung-67.png', 'h', 40), ('B', 'cuts/handleSprung-41.png', 'h', 40)]),
    ('1b TENDRIL handle, set', [('A', 'cuts/tendrilSet-5.png', 'h', 168), ('B', 'cuts/tendrilSet-29.png', 'h', 168)]),
    ('1b TENDRIL handle, cut', [('A', 'cuts/tendrilCut-67.png', 'h', 40), ('B', 'cuts/tendrilCut-79.png', 'h', 40)]),
    ('2 ANCHOR (replaces both poles)', [('A', 'cuts/anchorArm-41.png', 'h', 250), ('B', 'cuts/anchorArch-5.png', 'h', 250)]),
    ('3 VINE link', [('A', 'cuts/vineLink-79.png', 'w', 165), ('B', 'cuts/vineLink-53.png', 'w', 165)]),
    ('3 LEAF clump (vine ends)', [('A', 'cuts/leafClump-41.png', 'w', 70), ('B', 'cuts/leafClump-67.png', 'w', 70)]),
    ('4 HIVE, hanging', [('A', 'cuts/hiveHang-67.png', 'h', 50), ('B', 'cuts/hiveHang-29.png', 'h', 50)]),
    ('4 HIVE, landed (whole)', [('A', 'r3cut/hiveDown-down-hiveHang-67-s42-7.png', 'w', 52),
                                ('B', 'r3cut/hiveDown-down-hiveHang-29-s42-7.png', 'w', 52)]),
    ('5 STONE, hanging', [('A', 'cuts/stoneHang-17.png', 'w', 48), ('B', 'cuts/stoneHang-41.png', 'w', 48)]),
    ('5 STONE, landed', [('A', 'r3cut/stoneDown-down-stoneHang-17-s42-31.png', 'w', 48),
                         ('B', 'r3cut/stoneDown-down-stoneHang-41-s42-7.png', 'w', 48)]),
]
still = Image.open(STILL).convert('RGBA')
_a = Image.open(Path(__file__).resolve().parents[3] / 'src/assets/hero/hero-atlas.webp').convert('RGBA')
POKEY = _a.crop((231, 303, 231 + 180, 303 + 303))  # idle_a (heroAtlasData.ts), drawn 89.1 units tall
POKEY = POKEY.crop(POKEY.getbbox()); POKEY = POKEY.resize((round(POKEY.width * 140 / POKEY.height), 140), Image.LANCZOS)
BG = still.crop((0, 560, 824, 1000))  # the 1-3 forest behind him
CH, BIGW, SMW, LW = 240, 250, 260, 230
S = Image.new('RGB', (LW + 2 * (BIGW + SMW + 12), 34 + len(ROWS) * (CH + 20)), (22, 22, 28))
d = ImageDraw.Draw(S)
d.text((8, 8), f'ART-W1 trap pieces for the lead: A / B per piece; left = the cut, right = game size beside Pokey (idle frame, 89.1 units) on the 1-3 forest. base {BASE}',
       fill=(255, 255, 0))
for r, (lab, cands) in enumerate(ROWS):
    y = 34 + r * (CH + 20)
    d.text((8, y + CH // 2 - 6), lab, fill=(255, 255, 255))
    for c, (cl, f, ax, units) in enumerate(cands):
        x = LW + c * (BIGW + SMW + 12)
        p = Image.open(C / f).convert('RGBA')
        big = Image.new('RGBA', (BIGW, CH), (70, 110, 60, 255))
        q = p.copy(); q.thumbnail((BIGW - 10, CH - 10)); big.alpha_composite(q, ((BIGW - q.width) // 2, (CH - q.height) // 2))
        S.paste(big.convert('RGB'), (x, y))
        sm = BG.crop((0, 0, SMW, CH)).resize((SMW, CH)).copy() if BG.height >= CH else BG.resize((SMW, CH))
        k = units * K / (p.height if ax == 'h' else p.width)
        g = p.resize((max(1, round(p.width * k)), max(1, round(p.height * k))), Image.LANCZOS)
        f2 = min(1, (CH - 8) / g.height, (SMW - POKEY.width - 14) / g.width)  # (too big for the cell: both scaled together)
        g = g.resize((max(1, round(g.width * f2)), max(1, round(g.height * f2))), Image.LANCZOS)
        pk = POKEY.resize((max(1, round(POKEY.width * f2)), max(1, round(POKEY.height * f2))), Image.LANCZOS)
        sm.alpha_composite(pk, (4, CH - pk.height - 4))
        sm.alpha_composite(g, (pk.width + 10, CH - g.height - 4 if ax == 'w' or units < 60 or 'anchor' in f or 'tendril' in f else 4))
        S.paste(sm.convert('RGB'), (x + BIGW + 4, y))
        d.text((x + 3, y + CH + 3), f'{cl}: {Path(f).stem}' + ('' if f2 == 1 else f'  (cell shrunk x{f2:.2f})'), fill=(220, 220, 120))
S.save(OUT, quality=84)
print(OUT, S.size)
