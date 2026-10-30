"""Pack Worlds 8-10's own pit water (hf-art-ground, 2026-10-30; W8-10 inventory item 1) into src/assets/props/w<N>-water.webp, in World 6's
layout (badWaterArt.ts FRAMES): the choppy strip 1024 x 528 at (0, 0), keyed above its surface; the floating bits at (0, 541), 512 wide;
World 6's current streaks at (512, 530), tinted for the world (W8 moonlight silver, W9 ember orange, W10 foam white). Prints each world's
deep colour (the strip's bottom rows) and surface row.
    python3 tools/art/hfground/packwater810.py <raw dir>
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
PICK = {8: ('water-w8-chop-b-v11', 'water-w8-bits-s5', (200, 214, 240)),
        9: ('water-w9-chop-b-v11', 'water-w9-bits-s5', (255, 150, 50)),
        10: ('water-w10-chop-a-v11', 'water-w10-bits-s5', (236, 240, 244))}
w6 = Image.open(ROOT / 'src/assets/props/w6-water.webp').convert('RGBA')
streak0 = np.asarray(w6.crop((512, 530, 1024, 672)), np.float32)
for w, (chop_n, bits_n, sc) in PICK.items():
    chop = depurple(key(Image.open(raw / f'{chop_n}.webp')), lum_max=256 if w != 8 else 120).resize((1024, 528), Image.LANCZOS)
    a = np.asarray(chop)
    cov = (a[..., 3] > 128).mean(1)
    surf = int(np.where(cov > 0.6)[0][0])
    deep = a[-12:, :, :3].reshape(-1, 3).mean(0).astype(int)
    bits = depurple(key(Image.open(raw / f'{bits_n}.webp'), main_only=True), lum_max=256)
    bits = bits.crop(bits.getbbox())
    k = min(512 / bits.width, 213 / bits.height)
    bits = bits.resize((round(bits.width * k), round(bits.height * k)), Image.LANCZOS)
    st = streak0.copy()
    lum = st[..., :3].mean(2, keepdims=True) / 255
    st[..., :3] = np.array(sc, np.float32) * (0.55 + 0.45 * lum)
    S = Image.new('RGBA', (1024, 754), (0, 0, 0, 0))
    S.alpha_composite(chop, (0, 0))
    S.alpha_composite(Image.fromarray(st.clip(0, 255).astype(np.uint8), 'RGBA'), (512, 530))
    S.alpha_composite(bits, (0, 541))
    out = ROOT / f'src/assets/props/w{w}-water.webp'
    S.save(out, 'WEBP', quality=86, method=6)
    print(w, out.stat().st_size, 'surface', round(surf / 528, 3), 'deep', '#%02x%02x%02x' % tuple(deep), 'bits', bits.size)
