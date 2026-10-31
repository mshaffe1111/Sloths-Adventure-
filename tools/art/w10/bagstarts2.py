"""Round 2 of World 10's grab-bag art (2026-10-31, the lead's rough spots): the rolling barrel's round end, so the barrel truly rolls (its lid
turns as it goes: the painting rotated in code, a real roll, not a wobble). The world's style sheet (reference/prop-sheets/w10-style-sheet.png:
the kit and approved pieces) fills the top of the canvas, so the batch shares its light, palette and edges (the lead's one-batch rule).
    python3 -I tools/art/w10/bagstarts2.py <out dir>
  start-w10bag2.webp  1536 x 1152 on magenta: the style sheet (top 768), then three barrel ends, face on (bottom row, 384 px cells)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)
INK = (24, 22, 30)
WOOD = (122, 86, 54)
WOOD2 = (150, 110, 70)
IRON = (62, 64, 74)
C = Image.new('RGB', (1536, 1152), MAG)
C.paste(Image.open(ROOT / 'reference/prop-sheets/w10-style-sheet.png').convert('RGB'), (0, 0))
d = ImageDraw.Draw(C)
for k in range(3):
    cx, cy, r = 192 + k * 384, 768 + 192, 150
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=IRON, outline=INK, width=6)
    d.ellipse((cx - r + 18, cy - r + 18, cx + r - 18, cy + r - 18), fill=WOOD, outline=INK, width=4)
    # (the lid's planks, a chord each, and the bung)
    for j in range(-3, 4):
        y = cy + j * 38
        hw = math.sqrt(max(0, (r - 18) ** 2 - (y - cy) ** 2))
        d.line((cx - hw + 4, y, cx + hw - 4, y), fill=(92, 62, 38), width=3)
    d.ellipse((cx + 40, cy - 70, cx + 70, cy - 40), fill=WOOD2, outline=INK, width=3)
    for a in range(8):
        ang = a * math.pi / 4
        d.ellipse((cx + (r - 9) * math.cos(ang) - 5, cy + (r - 9) * math.sin(ang) - 5, cx + (r - 9) * math.cos(ang) + 5, cy + (r - 9) * math.sin(ang) + 5), fill=(120, 122, 130))
C.save(OUT / 'start-w10bag2.webp', 'WEBP', quality=95)
print('ok')
