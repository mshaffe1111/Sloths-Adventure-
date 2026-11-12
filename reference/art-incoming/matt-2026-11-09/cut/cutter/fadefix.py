# Sheet M-05: Matt's art fades the banyan trunk top into the magenta ground (a painted overlay, not a cut edge).
# Treat that overlay as alpha: a = 1 - magenta-ness / ground magenta-ness, unmix the colour, fade the top out.
import sys, json, numpy as np
from PIL import Image
ROOT = sys.argv[1]; pid = 'M-05-a'; YMAX = 185
info = {r['sheet']: r for r in json.load(open(ROOT + '/artcut/_cutinfo.json'))}['M-05']
p = [q for q in info['pieces'] if q['id'] == pid][0]
bg = np.array(info['bg'], np.float32); sbg = min(bg[0] - bg[1], bg[2] - bg[1])
src = np.asarray(Image.open(ROOT + '/artraw/M/M-sheet-05.jpg').convert('RGB')).astype(np.float32)
im = np.asarray(Image.open(f'{ROOT}/artcut/pieces/{pid}.png')).astype(np.float32).copy()
x0, y0 = p['x'], p['y']; hh = min(YMAX - y0, im.shape[0])
C = src[y0:y0 + hh, x0:x0 + im.shape[1]]
s = np.minimum(C[..., 0] - C[..., 1], C[..., 2] - C[..., 1])
a = np.clip(1 - s / sbg, 0, 1)
a = np.where(a < 0.12, 0, a)
F = (C - (1 - a[..., None]) * bg) / np.maximum(a, 0.05)[..., None]
F = np.clip(F, 0, 255)
sel = a < 0.995
im[:hh][..., :3] = np.where(sel[..., None], F, im[:hh][..., :3])
im[:hh][..., 3] = np.minimum(im[:hh][..., 3], a * 255)
out = Image.fromarray(np.clip(im + 0.5, 0, 255).astype(np.uint8), 'RGBA')
bb = out.getbbox(); out = out.crop(bb); out.save(f'{ROOT}/artcut/pieces/{pid}.png', compress_level=6)
print(pid, 'fade fixed, new size', out.size, 'trim', bb)
