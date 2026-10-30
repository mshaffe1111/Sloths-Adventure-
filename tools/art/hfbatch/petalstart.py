"""Start sheet for drifting petals (2026-10-29, hazard-anim: the weather's petals in Worlds 2 and 5 were flat code ellipses): 16 cells in
a 4 x 4 grid on flat green (the petals are pink), 1024 x 1024, for img2img (tools/art/w6to10/img2imggpu.py). Each cell is a petal-sized
crop of one of the game's own painted flowers (src/assets/flora/flowers-atlas.webp), its leaves masked off, scaled and turned, so the
style model only has to make each one a single loose petal or a tiny blossom.
    python3 -I tools/art/hfbatch/petalstart.py <game checkout> <out.webp>
"""
import sys
from pathlib import Path
from PIL import Image

GAME, OUT = Path(sys.argv[1]), Path(sys.argv[2])
A = Image.open(GAME / 'src/assets/flora/flowers-atlas.webp').convert('RGBA')
CW, CH = 128, 121
# (column, row, crop box inside the cell as fractions, turn): petal-rich spots, no leaves
PICK = [(0, 0, (0.1, 0.05, 0.55, 0.5), 20), (4, 0, (0.55, 0.05, 0.95, 0.45), -30), (5, 0, (0.05, 0.1, 0.5, 0.55), 60),
        (2, 1, (0.3, 0.0, 0.7, 0.45), 0), (3, 1, (0.5, 0.05, 0.95, 0.5), 40), (5, 1, (0.25, 0.0, 0.75, 0.45), -15),
        (0, 2, (0.05, 0.05, 0.5, 0.5), 75), (3, 2, (0.45, 0.0, 0.9, 0.45), -50), (5, 2, (0.05, 0.05, 0.5, 0.5), 25),
        (6, 2, (0.3, 0.05, 0.8, 0.45), 100), (0, 3, (0.05, 0.05, 0.5, 0.45), -70), (4, 3, (0.25, 0.05, 0.75, 0.6), 10),
        (7, 3, (0.1, 0.05, 0.6, 0.5), 140), (2, 1, (0.0, 0.25, 0.4, 0.65), -100), (1, 1, (0.05, 0.05, 0.6, 0.6), 30),
        (6, 0, (0.3, 0.05, 0.7, 0.5), -20)]
C = 256
S = Image.new('RGBA', (4 * C, 4 * C), (0, 255, 0, 255))
for i, (cx, cy, (a, b, c, d), rot) in enumerate(PICK):
    x0, y0 = cx * CW, cy * CH
    p = A.crop((x0 + round(a * CW), y0 + round(b * CH), x0 + round(c * CW), y0 + round(d * CH)))
    # (green-ish pixels, the flower's leaves, go: they would melt into the key)
    px = p.load()
    for yy in range(p.height):
        for xx in range(p.width):
            r, g, bb, al = px[xx, yy]
            if g > r + 12 and g > bb + 12:
                px[xx, yy] = (0, 0, 0, 0)
    p = p.rotate(rot, Image.BICUBIC, expand=True)
    k = 150 / max(p.size)
    p = p.resize((round(p.width * k), round(p.height * k)), Image.LANCZOS)
    S.alpha_composite(p, ((i % 4) * C + (C - p.width) // 2, (i // 4) * C + (C - p.height) // 2))
OUT.parent.mkdir(parents=True, exist_ok=True)
S.convert('RGB').save(OUT, 'WEBP', quality=95)
print(OUT)
