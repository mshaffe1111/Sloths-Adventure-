"""Clear the stacked slices above a strip's top (the lead's review, 2026-10-29: "torn strips of stretched pixels" over 5-2's orchid tree,
upright). The X-16 rebuild of the World 5 moods (and World 1's canopy) left two copies of the content's top rows stacked above its real
top, each a thin full-width slice, with fully empty rows between them; drawn small over the sky they read as a torn, stair-stepped band.
The strip's real top is the row after the last fully empty row in its top third: everything above it is cleared (its own fade is kept).
    python3 tools/art/w5rebuild/fixtops.py src/assets/backdrops/<name>.webp ...   (writes in place; a strip with no such slices is left)
"""
import sys
import numpy as np
from PIL import Image

for path in sys.argv[1:]:
    im = Image.open(path).convert('RGBA')
    a = np.asarray(im).copy()
    al = a[..., 3]
    h = al.shape[0]
    share = (al > 8).mean(1)
    first = int(np.argmax(share > 0))
    empty = [y for y in range(first, h // 3) if share[y] == 0]
    if not empty:
        print(path, 'clean')
        continue
    cut = empty[-1] + 1
    gone = int((al[:cut] > 8).sum())
    a[:cut, :, 3] = 0
    Image.fromarray(a, 'RGBA').save(path, 'WEBP', quality=92, method=6)
    print(path, 'cleared rows', first, '..', cut - 1, f'({gone} px)')
