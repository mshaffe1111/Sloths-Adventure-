"""Matt's new far backdrops for Worlds 1-4 (2026-10-28): each world's stages go through the day (stageBackdrops.ts).

    python3 -I tools/art/w1to4/backdrops.py

Reads reference/prop-sheets/w1to4/backdrop-*.jpg (1024 x 434) and writes src/assets/backdrops/<stem>-far.webp at the game's far-layer
size, 2048 x 868 (exactly twice): a Lanczos resize with a light unsharp mask (a far layer is soft, and is drawn behind the middle and
near strips, which stay the world's own), saved as the other far strips are (WEBP quality 80: the soft upscale holds up at it, and keeps each near the other far strips' size). The w3 sinkhole is a redo and is left out.
"""
import os
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SRC = os.path.join(ROOT, 'reference', 'prop-sheets', 'w1to4')
OUT = os.path.join(ROOT, 'src', 'assets', 'backdrops')
STEMS = {
    'backdrop-w1-sunrise': 'w1sunrise',
    'backdrop-w1-kapok': 'w1kapok',
    'backdrop-w2-rapids': 'w2rapids',
    'backdrop-w2-village-evening': 'w2evening',
    'backdrop-w3-glowworm-cavern': 'w3cavern',
    'backdrop-w4-terraces': 'w4terraces',
    'backdrop-w4-above-mist': 'w4mist',
}

for src, stem in STEMS.items():
    im = Image.open(os.path.join(SRC, src + '.jpg')).convert('RGB')
    im = im.resize((2048, 868), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=2.2, percent=45, threshold=2))
    dst = os.path.join(OUT, f'{stem}-far.webp')
    im.save(dst, 'WEBP', quality=80, method=6)
    print(stem, im.size, os.path.getsize(dst), 'bytes')
