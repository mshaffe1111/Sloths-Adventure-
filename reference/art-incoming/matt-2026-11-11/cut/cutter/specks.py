# N-09: Matt's prompt text leaves stray dots near the platforms after the label boxes; drop any opaque island under 600 px area.
import sys, glob, os
ROOT = sys.argv[1]; sys.path.insert(0, ROOT + '/pylib')
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
for pid in sys.argv[2:]:
    f = f'{ROOT}/artcut/pieces/{pid}.png'; a = np.asarray(Image.open(f)).copy()
    lab, n = ndi.label(a[..., 3] > 30, structure=np.ones((3, 3)))
    area = ndi.sum(np.ones(lab.shape), lab, range(1, n + 1))
    small = [i + 1 for i in range(n) if area[i] < 600]
    if small:
        k = ndi.binary_dilation(np.isin(lab, small), iterations=2); a[..., 3][k] = 0
    out = Image.fromarray(a, 'RGBA'); bb = out.getbbox(); out.crop(bb).save(f, compress_level=6)
    print(pid, 'islands removed', len(small), [int(area[i - 1]) for i in small][:8], 'size', out.crop(bb).size)
