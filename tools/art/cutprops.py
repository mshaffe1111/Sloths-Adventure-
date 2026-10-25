import sys, numpy as np
from PIL import Image
from scipy import ndimage
D = (str(__import__('pathlib').Path(__file__).resolve().parents[0]) + '/props/')
for name in ['s1', 's2', 's3']:
    im = np.asarray(Image.open(D + name + '.jpg').convert('RGB')).astype(np.float32)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    # magenta-ness: high r and b, low g
    mag = np.clip((np.minimum(r, b) - g) / 255.0, 0, 1)
    key = mag > 0.38
    obj = ~key
    obj = ndimage.binary_opening(obj, iterations=2)
    lab, n = ndimage.label(obj)
    sizes = ndimage.sum(obj, lab, range(1, n + 1))
    boxes = ndimage.find_objects(lab)
    keep = [(i + 1, boxes[i]) for i in range(n) if sizes[i] > 1500]
    print(name, im.shape, len(keep))
    for k, (li, sl) in enumerate(sorted(keep, key=lambda t: (round(t[1][0].start / 300), t[1][1].start))):
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        print('  ', k, x0, y0, x1 - x0, y1 - y0, int(sizes[li - 1]))
