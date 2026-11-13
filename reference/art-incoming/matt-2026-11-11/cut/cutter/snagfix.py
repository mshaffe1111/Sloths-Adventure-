# N-06-e (attempt 2): the stepped cutting boxes left a faint outline and smear above the snag's broken top. Above y 90 (piece px),
# keep only the snag itself: the solid (alpha > 200) region connected to the trunk, plus a 2 px anti-aliased rim; clear the rest.
import sys; ROOT = sys.argv[1]; sys.path.insert(0, ROOT + '/pylib')
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
f = f'{ROOT}/artcut/pieces/N-06-e.png'; a = np.asarray(Image.open(f)).copy(); H = 90
solid = a[..., 3] > 200
lab, n = ndi.label(solid); trunk = lab[lab.shape[0] // 2][lab[lab.shape[0] // 2] > 0]; main = np.bincount(trunk).argmax()
keep = ndi.binary_dilation(lab == main, iterations=2)
top = np.zeros(keep.shape, bool); top[:H] = True
clear = top & ~keep & (a[..., 3] > 0)
a[..., 3][clear] = 0
print('cleared', int(clear.sum()), 'px')
out = Image.fromarray(a, 'RGBA'); bb = out.getbbox(); out.crop(bb).save(f, compress_level=6); print('bbox', bb)
