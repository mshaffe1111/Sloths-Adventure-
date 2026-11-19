"""ART-W2B: key the picked takes (cut.py: flood from the border, trapped flat grey keyed, rim un-mixed), register each on the engine's
geometry and pack them into ONE sheet, src/assets/props/w2-wheel.webp, plus its frame table src/game/w2WheelData.ts.
    python3 -I tools/art/hfw2b/ship.py <takes dir> <picks.json> <cut dir>   (cut dir: pack.sh's untarred cuts, or where cuts go)
picks.json: {"wheel": "wheel-s23", "dry": "bucket-s11", "spill": "spill-s23", "lip": "lip-s11"}
Scale: 3 sheet px a world px (as set pieces; Pokey's drawn 89.1 = 267 sheet px).
  noria: the frame is a square centred on the rim's middle (the alpha box's middle); the start's rim middle line is at 400 of its
         417 px outer radius, so the frame's r (rim to a bucket floor) = outer x 400/417. Drawn at R / r: one frame for R160-200.
  bucket: the start's trough is 120 + 2 x 10/7 world px over its end posts; the floor board's bottom is the alpha bottom, the platform
         top 16 px over it (WHEEL.bucketH). Every bucket frame carries (ax, ay): the floor's left end, top, in sheet px. The spill frame is
         an edit of the dry take in the same cell, so it is registered in take px on the dry trough; spillL is spillR mirrored.
"""
import json, re, subprocess, sys
from pathlib import Path
from PIL import Image, ImageOps

PX = 3
takes, picks = Path(sys.argv[1]), json.load(open(sys.argv[2]))
tmp = Path(sys.argv[3] if len(sys.argv) > 3 else '/tmp/w2b-cut'); tmp.mkdir(parents=True, exist_ok=True)


def cut(name, tol=26):
    """the cut piece and its box in take px: from the sandbox's pack.sh (<cut dir>/<name>.webp + boxes*.txt) when there, else cut.py here"""
    got = [l for bx in sorted(tmp.glob('boxes*.txt')) for l in bx.read_text().splitlines() if f'/{name}.png' in l]
    if (tmp / f'{name}.webp').exists() and got:
        r = got[-1]
        im = Image.open(tmp / f'{name}.webp').convert('RGBA')
    else:
        o = tmp / f'{name}.png'
        r = subprocess.run(['python3', '-I', 'tools/art/hfw2b/cut.py', str(takes / f'{name}.png'), str(o), '1', str(tol)], capture_output=True, text=True, check=True).stdout.strip()
        im = Image.open(o).convert('RGBA')
    print(r)
    box = tuple(int(v) for v in re.search(r'box \((\d+), (\d+), (\d+), (\d+)\)', r).groups())
    return im, box


fr, ims = {}, {}
# --- the noria: square frame on the rim's middle
wim, _ = cut(picks['wheel'])
side = max(wim.width, wim.height)
sq = Image.new('RGBA', (side, side)); sq.alpha_composite(wim, ((side - wim.width) // 2, (side - wim.height) // 2))
r_take = (wim.width + wim.height) / 4 * 400 / 417
s = 200 * PX / r_take
ims['noria'] = sq.resize((round(side * s), round(side * s)), Image.LANCZOS)
fr['noria'] = {'r': 200 * PX}
# --- the buckets
dim, db = cut(picks['dry'])
span = db[2] - db[0]
floorW_t = span * 120 / (120 + 20 / 7)
floorL_t, floorT_t = db[0] + span * (10 / 7) / (120 + 20 / 7), db[3] - span * 16 / (120 + 20 / 7)
s = 120 * PX / floorW_t
def bucket(im, box):
    out = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    return out, {'ax': round((floorL_t - box[0]) * s, 1), 'ay': round((floorT_t - box[1]) * s, 1)}
ims['bucket'], fr['bucket'] = bucket(dim, db)
fr['bucket']['floorW'] = 120 * PX
sim, sb = cut(picks['spill'])
# the take was cropped above its splash pool (pack.sh input spillc-*: a bucket in the air pours into nothing): fade the stream out over
# its last FADE take px, so it ends as falling water, not a cut edge
FADE = 70
import numpy as np
a = np.asarray(sim).astype(np.float32)
# the splash crown at the stream's foot (faint teal spray either side, joined to the stream by faint px): under BAND px from the bottom,
# keep only the stream's own columns (where it is solid, BAND px up), +-3 px
BAND = 48
row = a[sim.height - BAND - 1]
cols = np.nonzero((row[:, 3] > 128) & (row[:, 2] > row[:, 0] + 20))[0]
if len(cols):
    lo, hi = cols.min() - 3, cols.max() + 3
    band = a[sim.height - BAND:]
    band[:, :max(0, lo), 3] = 0
    band[:, hi + 1:, 3] = 0
ramp = np.clip((sim.height - 1 - np.arange(sim.height)) / FADE, 0, 1)
a[..., 3] *= ramp[:, None]
# the cut splash pool leaves loose teal specks under the stream (the lead, 8:54 PM ET 11-18): keep only what joins the trough (alpha over
# 8, 8-connected to the biggest part); everything else, and any faint px under 8, goes clear
from scipy import ndimage as nd
solid = a[..., 3] > 8
lab, n = nd.label(solid, structure=np.ones((3, 3)))
if n > 1:
    sizes = nd.sum(solid, lab, range(1, n + 1))
    keep = lab == (1 + int(np.argmax(sizes)))
    print('spill: dropped', n - 1, 'loose parts,', int(solid.sum() - keep.sum()), 'px')
    a[~keep, 3] = 0
a[a[..., 3] <= 8, 3] = 0
sim = Image.fromarray(a.astype(np.uint8), 'RGBA')
ims['bucketSpillR'], fr['bucketSpillR'] = bucket(sim, sb)
ims['bucketSpillL'] = ImageOps.mirror(ims['bucketSpillR'])
fr['bucketSpillL'] = {'ax': round(ims['bucketSpillR'].width - fr['bucketSpillR']['ax'] - 120 * PX, 1), 'ay': fr['bucketSpillR']['ay']}
# --- the millrace lip: 400 world px long
if picks.get('lip'):
    lim, _ = cut(picks['lip'])
    s = 400 * PX / lim.width
    ims['lip'] = lim.resize((round(lim.width * s), round(lim.height * s)), Image.LANCZOS)
# --- pack: the noria left, the rest stacked right of it
order = [n for n in ('noria', 'bucket', 'bucketSpillR', 'bucketSpillL', 'lip') if n in ims]
x2 = ims['noria'].width + 4
y, place = 0, {'noria': (0, 0)}
for n in order[1:]:
    place[n] = (x2, y); y += ims[n].height + 4
SW = x2 + max(ims[n].width for n in order[1:]); SH = max(ims['noria'].height, y - 4)
sheet = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
for n in order:
    sheet.alpha_composite(ims[n], place[n])
    fr.setdefault(n, {}).update({'x': place[n][0], 'y': place[n][1], 'w': ims[n].width, 'h': ims[n].height})
# zero the colour under full transparency (smaller, and no fringe under scaling)
px = sheet.load()
for yy in range(SH):
    for xx in range(SW):
        if px[xx, yy][3] == 0: px[xx, yy] = (0, 0, 0, 0)
sheet.save('src/assets/props/w2-wheel.webp', quality=90, method=6)
for n in order:
    ims[n].save(tmp / f'ship-{n}.png')
lines = ["// generated by tools/art/hfw2b/ship.py (ART-W2B): where each piece of 2-6's painted noria sits in w2-wheel.webp, in sheet px (3 a world px).",
         "// noria: drawn centred on the axle, r = its rim's middle line (a bucket floor's radius). bucket frames: (ax, ay) = the floor's left end, top;",
         "// floorW = the floor's width (120 world px). bucketSpillR pours over the right end, bucketSpillL is it mirrored.",
         "export const W2_WHEEL_URL = new URL('../assets/props/w2-wheel.webp', import.meta.url).href;",
         'export const W2_WHEEL_FRAMES = {']
for n in order:
    lines.append(f"  {n}: {{ {', '.join(f'{k}: {v}' for k, v in fr[n].items())} }},")
lines += ['} as const;', '']
Path('src/game/w2WheelData.ts').write_text('\n'.join(lines))
print('sheet', SW, SH, json.dumps(fr))
