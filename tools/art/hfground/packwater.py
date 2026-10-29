"""Pack World 6's dirty fast water (hf-art-ground, 2026-10-29; polish report VI-18: the painted strip was only 183 x 372) into
src/assets/props/w6-water.webp, 1024 wide, and print the frames for badWaterArt.ts.
  chop     1024 x 528 at (0, 0): the choppy strip repainted on Hugging Face from the old one (w6water-chop-v11, made periodic left to
           right on the GPU), keyed above its surface; the old sheet's frame above it, which came along in the start's top rows, cut
           away; the key's pink cast on the foam taken out (the water has no purple of its own)
  leaves   512 x 224 at (0, 530): the floating dead leaves, repainted (w6water-leaves-s55-7)
  streaks  512 x 142 at (512, 530): the old current streaks, upscaled (thin white strokes: they read the same, no repaint needed)
    python3 tools/art/hfground/packwater.py <raw dir>
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from keying import depurple, key  # noqa: E402

ROOT = HERE.parents[2]
raw = Path(sys.argv[1])
chop = depurple(key(Image.open(raw / 'w6water-chop-v11.webp')), lum_max=256)
a = np.asarray(chop).copy()
# (the junk band: the rows of the old sheet's frame above, scaled up into the start; the surface starts below it)
a[:44, :, 3] = 0
# (the foam along the top edge: the key left it pink, then tan; foam is grey-white, so the band within 10 px of the edge is desaturated)
from scipy import ndimage  # noqa: E402
band = ndimage.binary_dilation(a[..., 3] < 128, iterations=10) & (a[..., 3] > 0)
lum = a[..., :3].astype(np.float32).mean(2, keepdims=True)
rgb = a[..., :3].astype(np.float32)
a[..., :3] = np.where(band[..., None], np.clip(rgb * 0.25 + lum * 0.75 + 6, 0, 255), rgb).astype(np.uint8)
cov = (a[..., 3] > 128).mean(1)
surf = int(np.where(cov > 0.6)[0][0])
chop = Image.fromarray(a, 'RGBA')
leaves = depurple(key(Image.open(raw / 'w6water-leaves-s55-7.webp'), main_only=True), lum_max=256)
leaves = leaves.crop(leaves.getbbox())
k = min(512 / leaves.width, 224 / leaves.height)
leaves = leaves.resize((round(leaves.width * k), round(leaves.height * k)), Image.LANCZOS)
# (the old sheet's streaks, kept in starts/ as cut from it: the sheet itself is rewritten here)
streaks = Image.open(HERE / 'starts/w6water-streaks-old.webp').convert('RGBA').resize((512, 142), Image.LANCZOS)
S = Image.new('RGBA', (1024, 530 + 224), (0, 0, 0, 0))
S.alpha_composite(chop, (0, 0))
S.alpha_composite(leaves, ((512 - leaves.width) // 2, 530 + 224 - leaves.height))
S.alpha_composite(streaks, (512, 530))
out = ROOT / 'src/assets/props/w6-water.webp'
S.save(out, 'WEBP', quality=88, method=6)
deep = np.asarray(chop)[-6:, :, :3].reshape(-1, 3).mean(0).astype(int)
print(out, out.stat().st_size, S.size)
print(f"chop: {{ x: 0, y: 0, w: 1024, h: 528 }}, leaves: {{ x: {(512 - leaves.width) // 2}, y: {530 + 224 - leaves.height}, w: {leaves.width}, "
      f"h: {leaves.height} }}, streaks: {{ x: 512, y: 530, w: 512, h: 142 }}")
print('SURFACE', round(surf / 528, 3), 'DEEP', '#%02x%02x%02x' % tuple(deep))
