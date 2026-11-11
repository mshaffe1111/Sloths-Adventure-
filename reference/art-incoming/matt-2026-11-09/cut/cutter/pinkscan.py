# Pink-fringe scan. Two tests: hot magenta anywhere (r>g+45, b>g+35, bright), and the darker ground-hued magenta the
# lead's critic found on 11-10 (r>g+45, b>g+25) within 8 px of the edge. Edge counts must be 0 on every kept piece.
import sys, glob, os
ROOT = sys.argv[1]; sys.path.insert(0, ROOT + '/pylib')
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
pat = sys.argv[2] if len(sys.argv) > 2 else '*'
d = sys.argv[3] if len(sys.argv) > 3 else f'{ROOT}/artcut/pieces'
for f in sorted(glob.glob(f'{d}/{pat}.png')):
    a = np.asarray(Image.open(f)).astype(np.float32)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    op = al > 60
    edge = op & ~ndi.binary_erosion(op, iterations=8)
    hot = (r - g > 45) & (b - g > 35) & op & (np.maximum(r, b) > 110)
    dark = (r - g > 45) & (b - g > 25) & op
    print(os.path.basename(f)[:-4], 'hot', int(hot.sum()), 'hot-edge', int((hot & edge).sum()), 'dark-edge', int((dark & edge).sum()))
