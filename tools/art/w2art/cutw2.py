import sys
sys.path.insert(0, '.')
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

def cut(src, box, name, tol=40, hole=1500, keepmin=400):
    im = Image.open(src).convert('RGB').crop(box)
    a = np.asarray(im).astype(int)
    edge = np.concatenate([a[:6].reshape(-1,3), a[-6:].reshape(-1,3), a[:, :6].reshape(-1,3), a[:, -6:].reshape(-1,3)])
    bg = np.median(edge, 0)
    d = np.abs(a - bg).sum(2)
    near = d < tol
    lab, n = ndi.label(near)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bgmask = np.isin(lab, list(border))
    tight = d < 22
    lab2, n2 = ndi.label(tight & ~bgmask)
    if n2:
        sizes = ndi.sum(np.ones_like(lab2), lab2, range(1, n2 + 1))
        for i, s in enumerate(sizes, 1):
            if s > hole: bgmask |= lab2 == i
    fg = ~bgmask
    fg = ndi.binary_opening(fg, iterations=2)
    lab3, n3 = ndi.label(fg)
    keep = np.zeros_like(fg)
    if n3:
        sizes = ndi.sum(np.ones_like(lab3), lab3, range(1, n3 + 1))
        big = sizes.max()
        for i, s in enumerate(sizes, 1):
            if s > max(keepmin, big * 0.02): keep |= lab3 == i
    keep = ndi.binary_erosion(keep, iterations=2)
    alpha = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    out = im.copy(); out.putalpha(alpha)
    out = out.crop(out.getbbox())
    out.save(f'cut/{name}.png')
    print(name, out.size)

K = 4
def B(x0, y0, x1, y1): return (x0*K, y0*K, x1*K, y1*K)
if 'cages' in sys.argv:
    C = 'cages-4x.png'
    for nm, b in [('capySad', (25, 345, 175, 512)), ('capyHappy', (180, 318, 335, 512)), ('duckSad', (365, 355, 495, 512)),
                  ('duckHappy', (505, 305, 660, 512)), ('otterSad', (670, 345, 825, 512)), ('otterHappy', (838, 315, 1000, 512)),
                  ('cageA', (90, 25, 300, 280)), ('cageB', (395, 25, 640, 280)), ('cageC', (680, 25, 980, 280))]:
        cut(C, B(*b), nm)
if 'river' in sys.argv:
    R = 'river-4x.png'
    for nm, b in [('logLong', (40, 50, 455, 162)), ('logShort', (485, 55, 705, 162)), ('lily', (735, 80, 995, 162)),
                  ('reedTall', (25, 205, 205, 510)), ('reedShort', (205, 355, 400, 510)), ('reedLean', (410, 305, 570, 510)), ('water', (590, 355, 1000, 510))]:
        cut(R, B(*b), nm)
if 'village' in sys.argv:
    V = 'village-4x.png'
    for nm, b in [('door', (20, 30, 340, 250)), ('window', (360, 85, 515, 225)), ('sign', (600, 60, 765, 240)), ('mailbox', (835, 60, 955, 240)),
                  ('chimney', (65, 240, 240, 510)), ('jetty', (290, 335, 610, 510)), ('laundry', (655, 300, 985, 510))]:
        cut(V, B(*b), nm)
