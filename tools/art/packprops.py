"""Cut Matt's three prop sheets (upscaled 4x, used at 2x) into one atlas with clean alpha, and write the frame table."""
import json
import numpy as np
from PIL import Image
from scipy import ndimage

D = (str(__import__('pathlib').Path(__file__).resolve().parents[0]) + '/props/')
OUT_IMG = (str(__import__('pathlib').Path(__file__).resolve().parents[2]) + '/src/assets/proto/props-atlas.webp')
OUT_TS = (str(__import__('pathlib').Path(__file__).resolve().parents[2]) + '/src/game/protoAtlasData.ts')

WANT = {
    's1': {'log': [0], 'logPush': [1, 2], 'boulder': [3], 'seed': [4], 'curtain': [5], 'curtainOpen': [6]},
    's2': {'branch': [0], 'branchCreak': [1], 'snapL': [2], 'snapR': [3], 'perch': [4], 'liana': [5], 'trunk': [6]},
    's3': {'bank': [0], 'bankEnd': [1], 'mossStrip': [2], 'wall': [3], 'buttress': [4], 'stump': [5]},
}


def magness(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return np.clip((np.minimum(r, b) - g) / 255.0, 0, 1)


frames = {}
for sheet, want in WANT.items():
    small = np.asarray(Image.open(D + sheet + '.jpg').convert('RGB')).astype(np.float32)
    obj = ndimage.binary_opening(magness(small) <= 0.38, iterations=2)
    lab, n = ndimage.label(obj)
    sizes = ndimage.sum(obj, lab, range(1, n + 1))
    boxes = ndimage.find_objects(lab)
    keep = sorted([(i + 1, boxes[i]) for i in range(n) if sizes[i] > 1500], key=lambda t: (round(t[1][0].start / 300), t[1][1].start))
    big = Image.open(D + sheet + 'x4.png').convert('RGB')
    big = big.resize((big.width // 2, big.height // 2), Image.LANCZOS)  # 2x of the original sheet
    A = np.asarray(big).astype(np.float32)
    S = 2
    mag = magness(A)
    for name, idxs in want.items():
        labs = [keep[i][0] for i in idxs]
        sl = [keep[i][1] for i in idxs]
        y0 = min(s[0].start for s in sl) * S - 6; y1 = max(s[0].stop for s in sl) * S + 6
        x0 = min(s[1].start for s in sl) * S - 6; x1 = max(s[1].stop for s in sl) * S + 6
        y0, x0 = max(0, y0), max(0, x0)
        y1, x1 = min(A.shape[0], y1), min(A.shape[1], x1)
        crop = A[y0:y1, x0:x1].copy()
        m = mag[y0:y1, x0:x1]
        # only this object's pixels: its labels, grown a little, scaled up from the small sheet
        own = np.isin(lab, labs)
        own = ndimage.binary_dilation(own, iterations=3)
        own_big = np.asarray(Image.fromarray((own * 255).astype(np.uint8)).resize((A.shape[1], A.shape[0]), Image.NEAREST))[y0:y1, x0:x1] > 0
        alpha = 1 - np.clip((m - 0.18) / (0.42 - 0.18), 0, 1)
        alpha = np.where(own_big, alpha, 0)
        # despill: pull magenta fringes toward the green channel
        k = np.clip(m * 2.2, 0, 1)[..., None]
        g = crop[..., 1:2]
        crop[..., 0:1] = crop[..., 0:1] - (crop[..., 0:1] - np.minimum(crop[..., 0:1], g + 20)) * k
        crop[..., 2:3] = crop[..., 2:3] - (crop[..., 2:3] - np.minimum(crop[..., 2:3], g + 10)) * k
        rgba = np.dstack([np.clip(crop, 0, 255), alpha * 255]).astype(np.uint8)
        im = Image.fromarray(rgba, 'RGBA')
        bb = im.getbbox()
        frames[name] = im.crop(bb)

# shelf pack
W = 2048
order = sorted(frames.items(), key=lambda kv: -kv[1].height)
x = y = shelf = 0
pos = {}
for name, im in order:
    if x + im.width + 2 > W:
        x = 0; y += shelf + 2; shelf = 0
    pos[name] = (x, y, im.width, im.height)
    x += im.width + 2
    shelf = max(shelf, im.height)
H = y + shelf
atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for name, im in frames.items():
    px, py, _, _ = pos[name]
    atlas.paste(im, (px, py))
import os
os.makedirs(os.path.dirname(OUT_IMG), exist_ok=True)
atlas.save(OUT_IMG, 'WEBP', quality=88, method=6)
with open(OUT_TS, 'w') as f:
    f.write('// generated from Matt\'s three prop sheets (2026-10-23) by scratchpad/packprops.py: where each prop sits in props-atlas.webp\n')
    f.write('export interface ProtoFrame { x: number; y: number; w: number; h: number }\n')
    f.write('export const PROTO_FRAMES = {\n')
    for name in WANT['s1'].keys() | WANT['s2'].keys() | WANT['s3'].keys():
        pass
    for sheet in WANT.values():
        for name in sheet:
            px, py, w, h = pos[name]
            f.write(f'  {name}: {{ x: {px}, y: {py}, w: {w}, h: {h} }},\n')
    f.write('} as const satisfies Record<string, ProtoFrame>;\n')
print(W, H, os.path.getsize(OUT_IMG), {k: v[2:] for k, v in pos.items()})
