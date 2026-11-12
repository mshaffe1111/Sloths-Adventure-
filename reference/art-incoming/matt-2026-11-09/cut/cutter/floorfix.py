# M-11-b (Vine-Curtained Rock Arch): Matt painted a soft dark shadow on the floor under the arch, over the magenta ground, so
# the keyer kept it as an opaque dark-red strip. Model each floor pixel as ground + a dark shadow S at opacity a, and where
# that model fits (small residual), turn it into a real translucent dark shadow. Rock and vines don't fit the model and stay.
import sys, json, numpy as np
from PIL import Image
ROOT = sys.argv[1]; pid = 'M-11-b'; X0, X1, Y0 = 300, 760, 520
S = np.array([45., 45., 45.])
info = {r['sheet']: r for r in json.load(open(ROOT + '/artcut/_cutinfo.json'))}['M-11']
p = [q for q in info['pieces'] if q['id'] == pid][0]; bg = np.array(info['bg'], np.float32)
src = np.asarray(Image.open(ROOT + '/artraw/M/M-sheet-11.jpg').convert('RGB')).astype(np.float32)
f = f'{ROOT}/artcut/pieces/{pid}.png'; im = np.asarray(Image.open(f)).astype(np.float32).copy()
H, W = im.shape[:2]
C = src[p['y']:p['y'] + H, p['x']:p['x'] + W]
a = np.clip(((bg - C) * (bg - S)).sum(-1) / ((bg - S) ** 2).sum(), 0, 1)
resid = np.linalg.norm(C - ((1 - a[..., None]) * bg + a[..., None] * S), axis=-1)
box = np.zeros((H, W), bool); box[Y0:, X0:X1] = True
k = box & (resid < 14) & (C[..., 0] - C[..., 1] > 28)
im[..., :3][k] = S * 0.8
im[..., 3][k] = np.minimum(im[..., 3][k], a[k] * 255 * 0.85)
print(pid, 'shadow pixels', int(k.sum()))
Image.fromarray(np.clip(im + .5, 0, 255).astype(np.uint8), 'RGBA').save(f, compress_level=6)
