"""ART-W3: make a cut shaft wall (its rock face on the left, rock to the right edge) tile top to bottom. A circular cross-fade over the
last B rows into the first: in the band each pair of rows is first SHIFTED so both rock faces sit at the blended face line, then
cross-faded, so the outline never blends two different edges (hf-art.md 11-11: never cross-fade alpha straight). Height becomes H - B.
    python3 -I tools/art/hfw3/walltile.py <cut.png> <out.png> [B 160]
Prints the seam check: the largest colour step between the last and first rows (inside the rock) against the median row-to-row step."""
import sys
import numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
B = int(sys.argv[3]) if len(sys.argv) > 3 else 160
a = np.asarray(Image.open(src).convert('RGBA')).astype(np.float32)
H, W = a.shape[:2]
edge = np.array([int(np.argmax(a[r, :, 3] > 128)) for r in range(H)], np.float32)
def shifted(row, dx):
    dx = int(round(dx)); o = np.zeros_like(row)
    if dx >= 0: o[dx:] = row[:W - dx] if dx else row
    else: o[:W + dx] = row[-dx:]
    if dx > 0: o[:dx] = 0
    return o
o = a[:H - B].copy()
for i in range(B):
    t = (i + 0.5) / B; t = t * t * (3 - 2 * t)
    e = (1 - t) * edge[H - B + i] + t * edge[i]
    r0 = shifted(a[H - B + i], e - edge[H - B + i]); r1 = shifted(a[i], e - edge[i])
    o[i] = (1 - t) * r0 + t * r1
rgbstep = lambda x, y: float(np.abs(x[:, :3] - y[:, :3])[(x[:, 3] > 250) & (y[:, 3] > 250)].mean())
inner = np.median([rgbstep(o[r], o[r + 1]) for r in range(0, H - B - 1, 7)])
print(f'seam step {rgbstep(o[-1], o[0]):.1f} vs median row step {inner:.1f}; size {W}x{H - B}')
Image.fromarray(o.clip(0, 255).astype(np.uint8), 'RGBA').save(out)
