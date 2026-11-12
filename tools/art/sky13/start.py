"""1-3's sunrise far repaint (ART-W1B, 2026-11-12): the start for img2img. The old w1sunrise far has white orchids at both edges (they
meet at the wrap as one white "ghost"), a fallen log across its lower right, a dark branch at its top and rain streaks. Paint them out
(a pyramid fill from the unmasked paint round them, generous masks), then roll the strip half a width so its old join sits in the middle where the model paints across it.
    python3 -I tools/art/sky13/start.py   -> reference/qa-reports/ART-W1B/sky/start-far13.webp (+ mask preview)
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'reference/qa-reports/ART-W1B/sky'
a = np.array(Image.open(ROOT / 'src/assets/backdrops/w1sunrise-far.webp').convert('RGB'))
H, W = a.shape[:2]
k = W / 1000  # polygons below are in a 1000-wide view
m = Image.new('L', (W, H), 0)
d = ImageDraw.Draw(m)
P = lambda pts: [(x * k, y * k) for x, y in pts]
d.polygon(P([(440, 610), (560, 495), (700, 440), (850, 400), (1000, 380), (1000, 610)]), 255)   # the fallen log
d.rectangle(P([(800, 260), (1000, 610)]), 255)                                                   # right orchids
d.rectangle(P([(0, 240), (90, 490)]), 255)                                                        # left orchids
d.rectangle(P([(140, 0), (350, 115)]), 255)                                                       # the dark branch, top
d.rectangle(P([(935, 0), (1000, 70)]), 255)                                                       # its end at the right edge
mask = np.array(m.filter(ImageFilter.MaxFilter(25)))


def pyfill(img, msk):
    # push-pull: average the known paint down a pyramid, then fill the holes from the coarser level on the way up
    known = (msk == 0).astype(np.float32)
    if min(img.shape[:2]) < 8 or known.all():
        return img
    h, w = img.shape[:2]
    h2, w2 = (h + 1) // 2, (w + 1) // 2
    ip = np.zeros((h2 * 2, w2 * 2, 3), np.float32); kp = np.zeros((h2 * 2, w2 * 2), np.float32)
    ip[:h, :w] = img * known[..., None]; kp[:h, :w] = known
    s_i = ip.reshape(h2, 2, w2, 2, 3).sum((1, 3)); s_k = kp.reshape(h2, 2, w2, 2).sum((1, 3))
    small = np.where(s_k[..., None] > 0, s_i / np.maximum(s_k, 1e-6)[..., None], 0)
    small = pyfill(small, (s_k == 0).astype(np.uint8) * 255)
    up = np.array(Image.fromarray(np.clip(small, 0, 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)).astype(np.float32)
    return np.where(known[..., None] > 0, img, up)


fill = pyfill(a.astype(np.float32), mask)
soft = np.array(Image.fromarray(np.clip(fill, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))).astype(np.float32)
fill = np.where(mask[..., None] > 0, soft, a)
# the top boxes sit in open sky: fill their upper rows with that row's own sky (the median of the clear middle), feathered into the fill
yb = int(80 * k)
sky = np.median(a[:, int(.40 * W):int(.75 * W)].astype(np.float32), axis=1)
sky = np.array(Image.fromarray(np.clip(sky[:, None, :].repeat(8, 1), 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(18)))[:, 4].astype(np.float32)
# lower boxes: lift the near-black fill toward the clear middle's own canopy tone at that height (the model paints the treetops)
low = mask > 0
fill[low] = fill[low] * 0.45 + np.broadcast_to(sky[:, None, :], fill.shape)[low] * 0.55
for y in range(yb):
    t = min(1.0, (yb - y) / (20 * k))
    row = mask[y] > 0
    fill[y, row] = sky[y] * t + fill[y, row] * (1 - t)
fill = np.clip(fill, 0, 255).astype(np.uint8)
fill = np.roll(fill, W // 2, axis=1)
Image.fromarray(fill).save(OUT / 'start-far13.webp', 'WEBP', quality=92)
prev = a.copy(); prev[mask > 0] = (prev[mask > 0] * 0.4 + np.array([255, 0, 255]) * 0.6).astype(np.uint8)
Image.fromarray(np.vstack([prev, np.roll(fill, -W // 2, axis=1)])).resize((W // 2, H)).save(OUT / 'start-mask.jpg', quality=80)
