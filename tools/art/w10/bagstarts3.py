"""Round 3 of World 10's grab-bag art (2026-10-31, the lead: HF cap $12 for real World 10 pieces): the pit floor under the moving planks
(World 9's knobs, drawn in World 10's look) and more pieces for 10-9's gear theme. The world's style sheet (reference/prop-sheets/
w10-style-sheet.png) fills the top of the canvas, so the batch shares its light, palette and edges (the lead's one-batch rule).
    python3 -I tools/art/w10/bagstarts3.py <out dir>
  start-w10bag3.webp  1536 x 1536 on magenta: the style sheet (top 768), then two rows of four 384 px cells:
    row 1 (the lift pits' floor):  cog-stub (half a gear sunk in rubble), gear-fallen (a gear lying in rubble), chain-heap (a coil of chain
                                   on stones), axle-stub (a stone stub with an iron hub)
    row 2 (10-9's gear theme):     grinder (a stone trough, two iron cogs meshing in it), spiked-cog (an iron cog with spikes, face on),
                                   gear-wall (a stone frame of three meshed gears), gear-lever (a lever on a toothed quadrant)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)
INK = (24, 22, 30)
STONE = (92, 94, 104)
STONE2 = (70, 72, 82)
IRON = (62, 64, 74)
IRON2 = (96, 98, 110)
WOOD = (122, 86, 54)
RUST = (120, 70, 46)
C = Image.new('RGB', (1536, 1536), MAG)
C.paste(Image.open(ROOT / 'reference/prop-sheets/w10-style-sheet.png').convert('RGB'), (0, 0))
d = ImageDraw.Draw(C)


def cell(col: int, row: int) -> tuple[int, int]:
    """the top-left of a 384 px cell under the style sheet"""
    return col * 384, 768 + row * 384


def gear(cx: float, cy: float, r: float, teeth: int, fill=IRON, rot=0.0, spikes=False, hub=True):
    pts = []
    for i in range(teeth * 2):
        a = rot + i * math.pi / teeth
        rr = r if i % 2 == 0 else r * (0.78 if not spikes else 0.62)
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=fill, outline=INK, width=5)
    d.ellipse((cx - r * 0.55, cy - r * 0.55, cx + r * 0.55, cy + r * 0.55), outline=INK, width=4)
    if hub:
        d.ellipse((cx - r * 0.18, cy - r * 0.18, cx + r * 0.18, cy + r * 0.18), fill=IRON2, outline=INK, width=4)


def rubble(x0: float, x1: float, base: float, h: float):
    """a heap of stones along [x0, x1], its foot at `base`"""
    w = x1 - x0
    d.polygon([(x0, base), (x0 + w * 0.15, base - h * 0.6), (x0 + w * 0.4, base - h), (x0 + w * 0.7, base - h * 0.8), (x1 - w * 0.08, base - h * 0.35), (x1, base)], fill=STONE2, outline=INK)
    for k in range(7):
        sx = x0 + w * (0.1 + 0.12 * k)
        sy = base - h * (0.25 + 0.3 * ((k * 37) % 5) / 5)
        d.ellipse((sx - 22, sy - 14, sx + 22, sy + 14), fill=STONE, outline=INK, width=3)


# row 1: the lift pits' floor
x, y = cell(0, 0)
gear(x + 192, y + 270, 120, 12, fill=RUST)
rubble(x + 40, x + 344, y + 350, 110)
d.rectangle((x, y + 351, x + 383, y + 383), fill=MAG)  # (the ground line: nothing of the gear under the heap's foot)
x, y = cell(1, 0)
rubble(x + 30, x + 354, y + 350, 90)
d.ellipse((x + 70, y + 230, x + 314, y + 320), fill=IRON, outline=INK, width=5)
d.ellipse((x + 150, y + 255, x + 234, y + 295), fill=IRON2, outline=INK, width=4)
x, y = cell(2, 0)
rubble(x + 40, x + 344, y + 350, 100)
for k in range(6):
    cx = x + 110 + k * 32
    cy = y + 240 - 20 * math.sin(k)
    d.ellipse((cx - 22, cy - 14, cx + 22, cy + 14), outline=IRON, width=8)
x, y = cell(3, 0)
d.rectangle((x + 112, y + 200, x + 272, y + 350), fill=STONE, outline=INK, width=5)
gear(x + 192, y + 200, 62, 10, fill=IRON)

# row 2: 10-9's gear theme
x, y = cell(0, 1)
gear(x + 132, y + 230, 86, 12, fill=IRON)
gear(x + 252, y + 230, 86, 12, fill=IRON, rot=math.pi / 12)
d.polygon([(x + 20, y + 230), (x + 364, y + 230), (x + 340, y + 360), (x + 44, y + 360)], fill=STONE, outline=INK)
x, y = cell(1, 1)
gear(x + 192, y + 192, 150, 10, fill=IRON, spikes=True)
x, y = cell(2, 1)
d.rectangle((x + 30, y + 30, x + 354, y + 360), fill=STONE2, outline=INK, width=6)
gear(x + 120, y + 130, 80, 12, fill=IRON)
gear(x + 250, y + 150, 64, 10, fill=RUST, rot=0.2)
gear(x + 170, y + 270, 70, 11, fill=IRON, rot=0.1)
x, y = cell(3, 1)
d.pieslice((x + 62, y + 120, x + 322, y + 380), 180, 360, fill=IRON, outline=INK, width=5)
for k in range(9):
    a = math.pi + k * math.pi / 8
    d.rectangle((x + 192 + 135 * math.cos(a) - 7, y + 250 + 135 * math.sin(a) - 7, x + 192 + 135 * math.cos(a) + 7, y + 250 + 135 * math.sin(a) + 7), fill=IRON, outline=INK)
d.line((x + 192, y + 250, x + 270, y + 70), fill=WOOD, width=22)
d.ellipse((x + 252, y + 48, x + 292, y + 88), fill=RUST, outline=INK, width=4)
d.rectangle((x + 140, y + 250, x + 244, y + 360), fill=STONE, outline=INK, width=5)

C.save(OUT / 'start-w10bag3.webp', 'WEBP', quality=95)
print('ok')
