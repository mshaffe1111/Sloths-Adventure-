"""Seam repair starts for the chute textures (2026-10-29). A half-roll blend left ghosted double joints, so instead each picked texture
is rolled so its seams (the start's own tile edges) lie on lines inside the picture, the model repaints the whole rolled picture at a low
strength (slidegpu.py, spec-seam.json), and cut.py keeps the repaint only in feathered bands over those lines. The picture's new edges are
its old interior, so it wraps with no seam.

    python3 -I tools/art/w7slide/seamstarts.py      -> reference/prop-sheets/qa-notes/7-4-slide-art/starts/roll-<key>.jpg

  floor: rolled 512 down only (it repeats along the chute; across, it meets the walls, and the groove must stay in the middle)
  floor2 (three lanes) the same; ceiling: rolled 512 both ways (its start was laid out on a torus, the paint still broke the wrap)
  walls: rolled 256 both ways (the 2 x 2 tiled kit panel left seams at 0 and 512, now at 256 and 768)
"""
import json, sys
from pathlib import Path

import numpy as np
from PIL import Image

H = Path(__file__).resolve().parent
REPO = H.parents[2]
ROLL = {'floor': (512, 0), 'wall-roots': (256, 256), 'wall-glyph': (256, 256), 'floor2': (512, 0), 'ceiling': (512, 512)}


def rolled(key):
    picks = json.loads((H / 'picks.json').read_text())
    a = np.asarray(Image.open(H / 'raw' / f'{picks[key]}.webp').convert('RGB'))
    dy, dx = ROLL[key]
    return Image.fromarray(np.roll(np.roll(a, dy, 0), dx, 1))


if __name__ == '__main__':
    for k in (sys.argv[1:] or ROLL):
        rolled(k).save(REPO / f'reference/prop-sheets/qa-notes/7-4-slide-art/starts/roll-{k}.jpg', quality=93)
        print(k)
