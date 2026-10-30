"""Starts for each world's own bounce plant (hf-art-ground, 2026-10-29; Matt: a set per world, not one red/pink/orange set everywhere):
the painted round-3 caps (work/raw4, picks-bounce.json) tinted toward each world's colours, keeping their shading, on magenta; and each
plant's stalk tinted the same way. img2img (make_spec6.py) then paints each one into its world's plant.
    python3 tools/art/hfground/starts5.py   ->  tools/art/hfground/starts/bounce-w<N>.webp, stalkw-w<N>.webp
"""
import json, sys
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from keying import key  # noqa: E402

RAW = HERE / 'work' / 'raw4'
OUT = HERE / 'starts'
MAG = np.array([255, 0, 255], np.float32)
PK = json.loads((HERE / 'picks-bounce.json').read_text())
# world: (base shape, cap colours dark->light, stalk colours dark->light)
W = {1: ('toad', (96, 62, 34), (214, 176, 120), (120, 100, 72), (226, 210, 172)),
     2: ('bloom', (50, 104, 52), (236, 190, 210), (40, 92, 50), (120, 176, 96)),
     3: ('toad', (16, 70, 80), (120, 236, 226), (40, 76, 80), (170, 214, 210)),
     4: ('parasol', (40, 86, 86), (176, 226, 200), (44, 80, 66), (150, 196, 160)),
     5: ('bloom', (150, 96, 20), (252, 222, 120), (70, 110, 50), (150, 190, 110)),
     6: ('bloom', (86, 26, 30), (196, 210, 100), (54, 70, 30), (140, 160, 80)),
     7: ('bloom', (90, 96, 86), (232, 228, 210), (70, 84, 60), (170, 180, 150)),
     8: ('parasol', (40, 50, 100), (210, 220, 250), (40, 56, 80), (140, 160, 190)),
     9: ('toad', (46, 44, 46), (196, 190, 186), (60, 54, 52), (170, 160, 150)),
     10: ('parasol', (40, 30, 54), (170, 150, 196), (40, 36, 44), (130, 120, 140))}


def tint(img, dark, light, keep_alpha=None):
    k = key(img, main_only=True)
    a = np.asarray(k, np.float32)
    lum = (a[..., :3] @ np.array([0.3, 0.59, 0.11], np.float32)) / 255
    lum = np.clip((lum - 0.15) / 0.75, 0, 1)[..., None]
    rgb = np.array(dark, np.float32) * (1 - lum) + np.array(light, np.float32) * lum
    al = a[..., 3:4] / 255
    out = rgb * al + MAG * (1 - al)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


for w, (sp, cd, cl, sd, sl) in W.items():
    tint(Image.open(RAW / f"{PK[sp]['cap']}.webp"), cd, cl).save(OUT / f'bounce-w{w}.webp', quality=92)
    tint(Image.open(RAW / f"{PK[sp]['stalk']}.webp"), sd, sl).save(OUT / f'stalkw-w{w}.webp', quality=92)
print('ok')
