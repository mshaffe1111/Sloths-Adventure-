"""Cut World 10's pressure plate (2026-10-29) from the Hugging Face take w10plate-s72-23 (bucket mshaffe111/w5-xfer,
hfbatch/w10swing/props/, brought back with hf_fs attach) into src/assets/w10/plate.webp: raised (left) and pressed (right), each cut on
the same box round its iron frame so the two states swap in place (anchor: the middle of the frame's foot). Keyed and despilled as
bannercut.py. The frames' boxes are printed for w10PuzzleArt.ts.
    python3 tools/art/w10swing/platecut.py <dir with the take>
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from bannercut import key  # noqa: E402  (same keying)

SRC = Path(sys.argv[1])
ROOT = Path(__file__).resolve().parents[3]
a = key(np.array(Image.open(SRC / 'w10plate-s72-23.png').convert('RGB')))
alpha = a[:, :, 3] > 40
cells = []
for x0, x1 in ((0, 512), (512, 1024)):
    ys, xs = np.where(alpha[:, x0:x1])
    cells.append((x0 + xs.min(), x0 + xs.max() + 1, ys.min(), ys.max() + 1))
top = min(c[2] for c in cells)
bot = max(c[3] for c in cells)
w = max(c[1] - c[0] for c in cells)
sheet = Image.new('RGBA', (w * 2 + 4, bot - top), (0, 0, 0, 0))
for k, (x0, x1, _, _) in enumerate(cells):
    # (each centred on its frame: the frame is the widest thing in the cell)
    cx = (x0 + x1) // 2
    sheet.alpha_composite(Image.fromarray(a[top:bot, cx - w // 2:cx - w // 2 + w]), (k * (w + 4), 0))
dst = ROOT / 'src/assets/w10/plate.webp'
sheet.save(dst, quality=90, method=6)
print(dst, sheet.size, dst.stat().st_size, 'cell', w, bot - top)
