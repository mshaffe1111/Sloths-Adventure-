"""Starts for Worlds 8-10's own pit water (hf-art-ground, 2026-10-30; the lead's W8-10 inventory, item 1): World 6's dirty water sheet
(src/assets/props/w6-water.webp: the choppy strip and the floating leaves) tinted toward each world, on magenta, for groundgpu.py to
repaint as that world's water: W8 moonlit blackwater, W9 a magma pit, W10 a grey storm surge.
    python3 tools/art/hfground/starts7.py   ->  tools/art/hfground/starts/water-w<N>-chop.webp, water-w<N>-bits.webp
"""
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
OUT = HERE / 'starts'
S = Image.open(ROOT / 'src/assets/props/w6-water.webp').convert('RGBA')
CHOP = (0, 0, 1024, 528)
BITS = (0, 541, 512, 754)
# world: (dark, light) for the water, (dark, light) for the floating bits
PAL = {8: ((10, 18, 40), (150, 176, 220), (40, 46, 70), (210, 214, 236)),
       9: ((40, 8, 4), (255, 170, 60), (30, 24, 24), (120, 104, 96)),
       10: ((24, 28, 34), (190, 198, 206), (60, 48, 40), (150, 130, 110))}
MAG = np.array([255, 0, 255], np.float32)


def tint(im, dark, light):
    a = np.asarray(im, np.float32)
    lum = np.clip(((a[..., :3] @ np.array([0.3, 0.59, 0.11], np.float32)) / 255 - 0.1) / 0.8, 0, 1)[..., None]
    rgb = np.array(dark, np.float32) * (1 - lum) + np.array(light, np.float32) * lum
    al = a[..., 3:4] / 255
    return Image.fromarray(np.clip(rgb * al + MAG * (1 - al), 0, 255).astype(np.uint8))


for w, (wd, wl, bd, bl) in PAL.items():
    tint(S.crop(CHOP), wd, wl).save(OUT / f'water-w{w}-chop.webp', quality=95)
    tint(S.crop(BITS), bd, bl).save(OUT / f'water-w{w}-bits.webp', quality=95)
print('ok')
