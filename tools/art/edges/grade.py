"""World 4's far strips graded warmer and less grey (polish report VI-18, the lead 2026-10-29), the same grade defringe.py --grade gives
its mid strip: saturation +12%, highlights warmed. From A1's seamless strips (pinned), so running it again gives the same files.

    python3 -I tools/art/edges/grade.py"""
import io
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from defringe import grade  # noqa: E402

ROOT = Path(__file__).resolve().parents[3]
REV = '3a1247a'  # polish-a1: the strips made seamless (VI-4)
FARS = ['w4-far', 'w4mist-far', 'w4terraces-far']

for name in FARS:
    path = f'src/assets/backdrops/{name}.webp'
    src = Image.open(io.BytesIO(subprocess.run(['git', 'show', f'{REV}:{path}'], cwd=ROOT, check=True, capture_output=True).stdout))
    out = Image.fromarray(grade(np.asarray(src.convert('RGB')).astype(np.float32)).round().astype(np.uint8), 'RGB')
    out.save(ROOT / path, 'WEBP', quality=90, method=6)
    print(name, src.size, (ROOT / path).stat().st_size)
