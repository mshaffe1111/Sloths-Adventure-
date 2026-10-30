"""Starts for Worlds 8-10's bank-face pieces (hf-art-ground, 2026-10-30; W8-10 inventory item 3): a 512 square of each world's own soil
(its first texture in src/assets/ground/w<N>.webp), so the piece painted into it (make_spec9.py) keeps the soil's colour and grain and
can be feathered into the bank's face with no pasted edge.
    python3 tools/art/hfground/starts8.py   ->  tools/art/hfground/starts/face-w<N>.webp
"""
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
for w in (8, 9, 10):
    S = Image.open(ROOT / f'src/assets/ground/w{w}.webp').convert('RGB')
    S.crop((256, 256, 768, 768)).save(HERE / 'starts' / f'face-w{w}.webp', quality=95)
print('ok')
