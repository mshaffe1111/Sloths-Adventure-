"""reanim/pack.py meta for a start picture that is not cut from an atlas (an on-model edit): its scale `f` (start px per atlas px) and
the anchor in atlas px, so its clip packs at the same size and on the same ground line as the creature's atlas frames.

    python3 -I tools/art/w5/edit_meta.py <picture> <key> (--f F | --stand-h ATLAS_PX) [--flip] [--max-x PX] [--min-x PX]

--f: the scale of a sibling start picture (the edit kept the reference's size); --stand-h: the creature's standing height in atlas
pixels (the figure's height in the picture is that many atlas pixels). --max-x/--min-x ignore columns past a prop (a tree trunk) when
finding the feet. The anchor is the middle of the lowest rows of the figure, on its lowest solid row. Prints {key: meta}.
"""
import argparse, json
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('pic'); ap.add_argument('key')
ap.add_argument('--f', type=float); ap.add_argument('--stand-h', type=float)
ap.add_argument('--flip', action='store_true'); ap.add_argument('--max-x', type=int); ap.add_argument('--min-x', type=int, default=0)
a = ap.parse_args()
im = Image.open(a.pic).convert('RGB')
if a.flip:
    im = im.transpose(Image.FLIP_LEFT_RIGHT)
p = np.asarray(im).astype(np.float32)
bd = np.concatenate([p[:6].reshape(-1, 3), p[-6:].reshape(-1, 3), p[:, :6].reshape(-1, 3), p[:, -6:].reshape(-1, 3)])
fig = np.sqrt(((p - np.median(bd, 0)) ** 2).sum(-1)) > 30
fig[:, :a.min_x] = False
if a.max_x:
    fig[:, a.max_x:] = False
ys, xs = np.nonzero(fig)
top, low = ys.min(), ys.max()
f = a.f if a.f else (low + 1 - top) / a.stand_h
band = fig[max(0, low - int(0.06 * (low - top))):low + 1]
cols = np.nonzero(band.any(0))[0]
cx = (cols.min() + cols.max()) / 2
print(json.dumps({a.key: {'creature': a.key.split('-')[0], 'frame': a.key.split('-', 1)[1], 'ax': round(cx / f, 2), 'ay': round((low + 1) / f, 2),
                          'f': f, 'ox': 0, 'oy': 0, 'w': 0, 'h': 0, 'x': 0, 'y': 0}}))
