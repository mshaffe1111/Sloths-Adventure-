"""ART-W3: trim a wall shelf's wall stub to a short root into the wall: solid to `face + keep`, a horizontal fade over `fade` px, nothing
past it (the stub's own rock never matches the shaft wall tile's tone, so it showed as a box on the wall; 11-25 stills). The shelf is laid
with its stub face on the wall tile's face, the faded root over the wall.
    python3 -I tools/art/hfw3/stubtrim.py <cut.png> <face x> [keep 10] [fade 36]   (in place)"""
import sys
import numpy as np
from PIL import Image
p, face = sys.argv[1], int(sys.argv[2])
keep = int(sys.argv[3]) if len(sys.argv) > 3 else 10
fade = int(sys.argv[4]) if len(sys.argv) > 4 else 36
a = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
x0, x1 = face + keep, face + keep + fade
m = np.ones(a.shape[1], np.float32); m[x0:x1] = np.linspace(1, 0, x1 - x0); m[x1:] = 0
a[..., 3] *= m[None, :]
a = a[:, :x1]
al = a[..., 3] > 8; ys = np.where(al.any(axis=1))[0]
a = a[ys[0]:ys[-1] + 1]
Image.fromarray(a.astype(np.uint8), 'RGBA').save(p); print(p, 'size', a.shape[1], a.shape[0], 'top trimmed', int(ys[0]))
