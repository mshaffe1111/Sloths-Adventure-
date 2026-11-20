"""ART-NEXT-b: the weir's foot and ends. Its take paints a pool across the whole frame (off the left, right and bottom edges) and the
right-hand rock runs off the frame (sliced flat at x 1023, 87 px tall). In the game the river strip is drawn over the weir's foot, so:
(1) the right rock gets a rounded end inside the frame: cut to an ellipse from its tallest column near the end, the dark outline drawn
along the new edge; (2) water and foam (anything that is not warm rock) fade to nothing over
EDGE px, starting 60 px in, at the left and right ends; (3) every pixel fades out between Y0 and Y1 (the foam line to just under it, cut px from the top),
nothing kept below Y1; (1b) the pool outside the outer rocks is dropped, their teal-mixed rim pulled to the outline colour; (4) small loose scraps at the ends are dropped. Then scale by K. On a cut at K 1 (cut.py: box top 100 on the take).
    python3 -I tools/art/hfnext/weirfoot.py <cut K1.png> <out.png> <K> [Y0 Y1 EDGE]
"""
import sys
import numpy as np
from PIL import Image
src, out, K = sys.argv[1], sys.argv[2], float(sys.argv[3])
Y0, Y1, EDGE = (int(v) for v in sys.argv[4:7]) if len(sys.argv) > 6 else (330, 370, 100)
a = np.asarray(Image.open(src).convert('RGBA')).astype(np.float32)
h, w = a.shape[:2]
def rockm(p):
    """rock = anything kept that is neither the pool's teal water nor white foam (11-20 redo: a warm-only test called the rocks'
    mauve shadow sides 'not rock', so the end fades ate the left rock's lower half into blocky fragments)"""
    r, g, b = p[..., 0], p[..., 1], p[..., 2]
    water = (b > r + 25) & (g > r + 25)
    mx, mn = p[..., :3].max(axis=2), p[..., :3].min(axis=2)
    foam = (p[..., :3].mean(axis=2) > 185) & (mx - mn < 70)
    return ~water & ~foam & (p[..., 3] > 8)
# (1) the right rock's end, inside the frame: cut to a rounded end (an ellipse from the rock's tallest column near the end, X0, to the
# slice: its top meets the rock's own painted top near x 980 within a px), the take's dark outline drawn along the new edge. (Tried
# first: the left rock's end mirrored on (a seam and a notch), and the rock's last 30 columns mirrored past the slice (a chevron fold
# in the shading): both rejected on the zoomed stills.)
from scipy import ndimage as nd
rk = rockm(a)
def span(x):
    ys = np.nonzero(rk[:, x])[0]; return (ys.min(), ys.max()) if len(ys) else (0, -1)
E = 0
W2 = a.shape[1]
X0 = max(range(w - 120, w - 40), key=lambda x: span(x)[1] - span(x)[0])
t0, t1 = span(X0); cy, ry, rx = (t0 + t1) / 2, (t1 - t0) / 2, W2 - 1 - X0
xs = np.arange(W2)[None, :].repeat(h, 0); ys = np.arange(h)[:, None].repeat(W2, 1)
ell = ((xs - X0) / rx) ** 2 + ((ys - cy) / ry) ** 2 <= 1
rock2 = rockm(a)
right = xs >= X0
# soft edge (11-20 game-size still: a hard mask stair-stepped the new end): a signed distance to the ellipse, alpha over 1 px, and the
# outline weight over its 3 px inside, so the drawn line is anti-aliased like the take's own
ell_in = nd.distance_transform_edt(ell); ell_out = nd.distance_transform_edt(~ell)
sd = np.where(ell, ell_in - 0.5, 0.5 - ell_out)
soft = np.clip(sd + 0.5, 0, 1)
cut_here = right & rock2
a[..., 3] = np.where(cut_here, a[..., 3] * soft, a[..., 3])
wline = np.clip(3.0 - np.maximum(sd, 0), 0, 1) * (sd > -1) * cut_here * (xs >= X0 + 30)
line = np.array([62, 36, 26], np.float32)
a[..., :3] = a[..., :3] * (1 - 0.85 * wline[..., None]) + line * 0.85 * wline[..., None]
w = W2
# (1b) the pool OUTSIDE the weir: in each row, water and foam left of the first rock pixel or right of the last are not the weir (they
# ran off the frame); rock pixels touching them (the anti-aliased rim, mixed with teal) are pulled to the outline colour, as the take's
# own edge against the grey is
rk = rockm(a)
anyr = rk.any(axis=1)
first = np.where(anyr, rk.argmax(axis=1), w)
last = np.where(anyr, w - 1 - rk[:, ::-1].argmax(axis=1), -1)
xs1 = np.arange(w)[None, :]
outside = (xs1 < first[:, None]) | (xs1 > last[:, None])
outside &= ~rk & anyr[:, None]   # rows under the rocks (the foam at the falls' foot) keep their water: the end and foot fades take it
a[outside, 3] = 0
rim = rk & nd.binary_dilation(outside, iterations=1)
tealish = rim & (a[..., 2] > a[..., 0])
a[tealish, :3] = a[tealish, :3] * 0.35 + np.array([62, 36, 26], np.float32) * 0.65
# (2) + (3)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
notrock = ~rockm(a)
xs = np.arange(w)[None, :].repeat(h, 0)
ys = np.arange(h)[:, None].repeat(w, 1)
edge = np.clip((np.minimum(xs, w - 1 - xs) - 60) / EDGE, 0, 1)
edge = edge * edge * (3 - 2 * edge)
m = np.where(notrock, edge, 1.0)
fy = np.clip((Y1 - ys) / max(1, Y1 - Y0), 0, 1)
m = m * (fy * fy * (3 - 2 * fy))
a[..., 3] *= m
# (4) scraps: small loose bits (under 300 px) in the outer 250 px are the pool's leftovers (foam flecks), not the weir
lab, n = nd.label(a[..., 3] > 76)
for i, sz in enumerate(nd.sum(np.ones_like(lab), lab, range(1, n + 1))):
    if sz < 300:
        yy, xx = np.nonzero(lab == i + 1)
        if xx.mean() < 250 or xx.mean() > w - 250: a[lab == i + 1, 3] = 0
im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')
bb = im.getchannel('A').point(lambda v: 255 if v > 5 else 0).getbbox()
im = im.crop(bb)
im = im.resize((max(1, round(im.width / K)), max(1, round(im.height / K))), Image.LANCZOS)
pad = Image.new('RGBA', (im.width + 4, im.height + 4), (0, 0, 0, 0)); pad.paste(im, (2, 2)); im = pad   # 2 px clear margin: no paint on the file's edge
im.save(out)
print(out, 'size', im.size, 'end from x', X0, 'span', t0, t1)
