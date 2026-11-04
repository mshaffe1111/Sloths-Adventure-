"""Tall starts for the upright skies from a painted sky-only donor (hf-backdrops2, spec-K): the donor sky (text to image, no ground),
recoloured to the far strip's own top rows, its last 25% eased into the strip's top row, stacked above the far strip, so one s30 pass
(striphdgpu.py) joins them. Replaces tallstart.py's stretched-strip or gradient skies, whose straight join survived every strength.
    python3 -I tools/art/hfbackdrops/skydonor.py <stem> <donor.webp>   -> tools/art/hfbatch/starts/sky2/<stem>-tall.webp
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
stem, donor = sys.argv[1], sys.argv[2]
crop = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0  # (keep only the donor's top share: below it some takes painted ground)
far = np.asarray(Image.open(ROOT / f'src/assets/backdrops/{stem}-far.webp').convert('RGB')).astype(np.float32)
H, W, _ = far.shape
E = int(round(H * 0.35 / 16) * 16)
d = Image.open(donor).convert('RGB')
d = d.crop((0, 0, d.width, round(d.height * crop))).resize((W, E), Image.LANCZOS)
sky = np.asarray(d).astype(np.float32)
top = far[:max(8, H // 8)].reshape(-1, 3)
s = sky.reshape(-1, 3)
# (the donor keeps its own shapes and most of its spread; its colour moves to the strip's top light)
sky = (sky - s.mean(0)) / np.maximum(s.std(0), 1) * np.maximum(np.maximum(top.std(0), s.std(0) * 0.7), 6) + top.mean(0) * 0.92
k = int(E * 0.25)
t = np.linspace(0, 1, k, dtype=np.float32)[:, None, None]
t = t * t * (3 - 2 * t)
sky[E - k:] = sky[E - k:] * (1 - t) + far[:1] * t
out = ROOT / 'tools/art/hfbatch/starts/sky2'
out.mkdir(parents=True, exist_ok=True)
p = out / f'{stem}-tall.webp'
Image.fromarray(np.clip(np.concatenate([sky, far], 0), 0, 255).astype(np.uint8)).save(p, 'WEBP', quality=92, method=6)
print(p.name, W, E + H)
