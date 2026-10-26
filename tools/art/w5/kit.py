"""Repaint World 5's platform kit for the new light (Matt's approved concept art, 2026-10-26).

    python3 -I tools/art/w5/kit.py <the violet kit>     (git show 1e3211b:src/assets/kits/w5.webp > violet.webp)

The kit was painted for the old night-violet backdrop: blue bark, violet earth, blue-grey moss. Every new World 5 backdrop, gold, dusk
and twilight alike, has brown bark, warm earth and green moss in its foreground, so the kit is repainted that way once and sits right
against all three: the moss on top of each ground piece goes yellow-green, the earth under it a warm plum-brown, the bark of the trunk
wall and the stumps a soft brown. The pale things keep their colour: the silk webs, the petals and the orchids on the stumps.
Pieces and their places are unchanged (kitAtlasData.ts). Writes src/assets/kits/w5.webp."""
import json
import re
import sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
src = Image.open(sys.argv[1]).convert('RGBA')
a = np.asarray(src).astype(np.float32) / 255
data = (ROOT / 'src/game/kitAtlasData.ts').read_text()
frames = json.loads(data[data.index('= {') + 2:].rstrip().rstrip(';'))['5']

# each piece: how many rows from its top are moss (the rest is earth), or 'bark'
MOSS_ROWS = {'bank': 90, 'mossStrip': 152, 'bankEnd': 160, 'buttress': 80, 'fill': 0}
BARK = {'wall', 'stump', 'boulder'}
# target colours (hue in degrees, saturation): the backdrops' foreground moss, earth and bark
MOSS, EARTH, BARKC = (84, 0.46), (14, 0.42), (24, 0.4)


def rgb2hsv(rgb):
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = np.maximum(mx - mn, 1e-6)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    return h, s, mx


def hsv2rgb(h, s, v):
    h = (h % 360) / 60
    i = np.floor(h).astype(int) % 6
    f = h - np.floor(h)
    p, q, t = v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))
    out = np.zeros(h.shape + (3,), np.float32)
    for k, (r, g, b) in enumerate([(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]):
        m = i == k
        out[m] = np.stack([r[m], g[m], b[m]], -1)
    return out


h, s, v = rgb2hsv(a[..., :3])
target_h = np.full(h.shape, np.nan, np.float32)
target_s = np.zeros(h.shape, np.float32)
lift = np.ones(h.shape, np.float32)
for name, f in frames.items():
    x, y, w, hh = f['x'], f['y'], f['w'], f['h']
    sl = (slice(y, y + hh), slice(x, x + w))
    if name in BARK:
        target_h[sl], target_s[sl], lift[sl] = BARKC[0], BARKC[1], 1.08
        continue
    rows = MOSS_ROWS.get(name, 0)
    target_h[sl], target_s[sl], lift[sl] = EARTH[0], EARTH[1], 1.06
    if rows:
        ms = (slice(y, y + min(rows, hh)), slice(x, x + w))
        target_h[ms], target_s[ms], lift[ms] = MOSS[0], MOSS[1], 1.12

# the pale things keep their colour: silk (no colour), petals and orchids (pink, light)
petal = ((h > 290) | (h < 20)) & (s > 0.12) & (v > 0.62)
w = np.clip((s - 0.05) / 0.1, 0, 1) * ~petal * ~np.isnan(target_h)
# a little of each pixel's own hue swing is kept, so the painting keeps its life
hue_mean = np.nanmean(np.where(w > 0.5, h, np.nan))
nh = np.nan_to_num(target_h) + np.clip(h - hue_mean, -40, 40) * 0.25
ns = np.clip(np.nan_to_num(target_s) * (0.65 + 0.7 * s), 0, 1)
nv = np.clip(v * lift, 0, 1)
new = hsv2rgb(nh, ns, nv)
rgb = a[..., :3] * (1 - w[..., None]) + new * w[..., None]
out = np.concatenate([rgb, a[..., 3:]], -1)
im = Image.fromarray((np.clip(out, 0, 1) * 255).round().astype(np.uint8), 'RGBA')
p = ROOT / 'src/assets/kits/w5.webp'
im.save(p, 'WEBP', quality=88, method=6)
print(p, im.size, p.stat().st_size)
