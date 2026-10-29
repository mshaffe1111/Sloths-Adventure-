"""Cut World 9's hazard art (2026-10-29) from the HF takes (tools/art/w9/make_spec.py; raw PNGs fetched with hf_fs attach into RAW) into
src/assets/w9/hazards.webp + hazards.json (frames anchored at the middle of the foot; the lava strip by its top-left):
  lava        w9lava-s78-7: the molten surface band with its crust rim, cut to a strip whose two ends are cross-faded so copies meet
              with no seam (the deep below it is filled in the game from `deep`)
  vent, warn  w9geyser-s70-23 cells 1 and 2: the quiet vent rock and the same rock glowing, with its steam
  burst0..2   the round-2 burst take's three frames (the burst leaving the vent, the full fountain, the fall) when present
  haze0..5    the round-2 haze take's six wisps when present
Keying: alpha from the pixel's magenta-ness (min(r, b) - g), despilled on the fringe (r and b clamped toward g); nothing is upscaled.
    python3 -I tools/art/w9/cut.py RAW [burst-take] [haze-take]
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[3]
RAW = Path(sys.argv[1])
OUT = ROOT / 'src/assets/w9'
OUT.mkdir(parents=True, exist_ok=True)


def keyed(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mag = np.clip((np.minimum(r, b) - g) / 255.0, 0, 1)
    alpha = np.clip((0.42 - mag) / 0.22, 0, 1)
    fringe = (alpha < 1) & (alpha > 0)
    a[..., 0] = np.where(fringe, np.minimum(r, g + (r - g) * alpha), r)
    a[..., 2] = np.where(fringe, np.minimum(b, g + (b - g) * alpha * 0.5), b)
    # (pink left by the key colour in glows and on rims: blue brought down to green where it is above it, so it reads warm, not pink)
    pink = (a[..., 2] > a[..., 1] + 8) & (a[..., 0] > a[..., 1])
    a[..., 2] = np.where(pink, a[..., 1], a[..., 2])
    out = np.dstack([a, alpha * 255]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def main_parts(im, minpx=400):
    """the box around every solid part of a keyed cell (stray specks dropped)"""
    al = np.asarray(im)[..., 3] > 40
    lab, n = ndimage.label(al)
    sizes = ndimage.sum(al, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i in range(n) if sizes[i] >= minpx])
    arr = np.asarray(im).copy()
    arr[..., 3] = np.where(keep | (arr[..., 3] < 40), arr[..., 3], 0)
    ys, xs = np.nonzero(keep)
    return Image.fromarray(arr), (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)


frames = {}
pieces = []

# ── the lava strip ──
lava = Image.open(RAW / 'w9lava-s78-7.png').convert('RGB')
band = keyed(lava.crop((0, 40, lava.width, 250)))
W = band.width
FADE = 160
arr = np.asarray(band).astype(np.float32)
tile = arr[:, : W - FADE].copy()
# (the last FADE px blended into the first FADE: the strip ends the way it starts)
k = np.linspace(0, 1, FADE)[None, :, None]
tile[:, :FADE] = arr[:, W - FADE:] * (1 - k) + arr[:, :FADE] * k
strip = Image.fromarray(tile.clip(0, 255).astype(np.uint8), 'RGBA')
deep = [int(v) for v in np.asarray(lava)[248, :, :].mean(axis=0)]
pieces.append(('lava', strip, None))

# ── the vent, quiet and warning ──
gey = Image.open(RAW / 'w9geyser-s70-23.png').convert('RGB')
cw = gey.width // 4
for i, n in ((0, 'vent'), (1, 'warn')):
    c, box = main_parts(keyed(gey.crop((i * cw, 0, (i + 1) * cw, gey.height))))
    pieces.append((n, c.crop(box), 'foot'))

# ── round 2: the bursts and the haze ──
if len(sys.argv) > 2:
    b = Image.open(RAW / sys.argv[2]).convert('RGB')
    bw = b.width // 3
    # (each frame stops above its own little cone: the game stands it in the vent rock's mouth)
    for i, cut in enumerate((612, 655, 655)):
        c, box = main_parts(keyed(b.crop((i * bw, 0, (i + 1) * bw, cut))), 150)
        pieces.append((f'burst{i}', c.crop(box), 'foot'))
if len(sys.argv) > 3:
    h = Image.open(RAW / sys.argv[3]).convert('RGB')
    hw = h.width // 6
    for i in range(6):
        c, box = main_parts(keyed(h.crop((i * hw, 0, (i + 1) * hw, h.height))), 120)
        c = c.crop(box)
        # (a wisp fades out at its top and its foot: the take's cell edge cut it flat)
        arr = np.asarray(c).astype(np.float32)
        n = arr.shape[0]
        ramp = np.clip(np.minimum(np.arange(n) / (0.35 * n), (n - np.arange(n)) / (0.2 * n)), 0, 1)[:, None]
        arr[..., 3] *= ramp
        pieces.append((f'haze{i}', Image.fromarray(arr.astype(np.uint8), 'RGBA'), 'foot'))

# ── pack: shelf rows, 2048 wide ──
x = y = rowh = 0
for n, im, anchor in pieces:
    if x + im.width > 2048:
        x, y, rowh = 0, y + rowh + 2, 0
    frames[n] = {'x': x, 'y': y, 'w': im.width, 'h': im.height, **({'ax': im.width / 2, 'ay': im.height} if anchor else {})}
    x += im.width + 2
    rowh = max(rowh, im.height)
sheet = Image.new('RGBA', (2048, y + rowh), (0, 0, 0, 0))
for n, im, _ in pieces:
    f = frames[n]
    sheet.alpha_composite(im, (f['x'], f['y']))
sheet.save(OUT / 'hazards.webp', 'WEBP', quality=90, method=6)
(OUT / 'hazards.json').write_text(json.dumps({'sheet': 'hazards.webp', 'deep': deep, 'frames': frames}, indent=1))
print({n: (f['w'], f['h']) for n, f in frames.items()}, 'deep', deep, (OUT / 'hazards.webp').stat().st_size)

# ── the data module the game reads (no JSON imports in the game): the hazards' frames and the deep colour, and the World 9 scenery
# cells of Matt's props-made sheets (w9c, w9c-b) that w9Art.ts draws ──
scen = {}
for n in ('w9c', 'w9c-b'):
    js = json.loads((ROOT / f'src/assets/w6to10/props-made/{n}.json').read_text())
    scen[n] = {k: {kk: round(v, 1) for kk, v in f.items()} for k, f in js['frames'].items()}
ts = ['/** World 9\'s painted hazards and scenery frames: written by tools/art/w9/cut.py (do not edit by hand) */',
      f'export const W9_HAZARD_FRAMES = {json.dumps(frames)} as const;',
      f'/** the lava\'s deep colour under the strip (sampled from the take) */\nexport const W9_LAVA_DEEP = {json.dumps(deep)} as const;',
      f'/** Matt\'s World 9 set dressing (src/assets/w6to10/props-made: w9c and its second look w9c-b), frames anchored at the middle of the foot */',
      f'export const W9_SCENERY_FRAMES = {json.dumps(scen)} as const;', '']
(ROOT / 'src/game/w9ArtData.ts').write_text('\n'.join(ts))
