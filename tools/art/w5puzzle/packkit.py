"""Pack the puzzle kit's pieces (puzzleKit.ts, drawn by puzzleArt.ts) into one atlas, from Matt's cut-out sheets.

    python3 -I tools/art/w5puzzle/packkit.py

Reads Matt's sheets in reference/prop-sheets/ (w1to4: pokey-carry, w1-puzzle, w2-puzzle, w4-puzzle; w5puzzle: pieces, beetle) and
cuts each wanted cell the way cut.py does (cut.py w5puzzle / cut.py w1to4 write the same cuts for looking at), plus the cupcake from
World 5's own props atlas. Writes src/assets/props/puzzle-kit.webp and src/game/puzzleAtlasData.ts.

Per frame it also writes:
  ax   the middle of its feet / its base across the frame (atlas px), so a pose with an arm thrown forward stands where Pokey stands;
  hx,hy  for Pokey's carry poses: where the held thing sits in his hands (atlas px), measured off the sheet by eye (cell px below);
  k    game px per atlas px (the frame is packed larger than it is drawn, for sharpness on a phone).
The beetle's last eight frames face left on the sheet: they are mirrored here, so every frame faces right. The thrown acorn (and its
streak) in Pokey's three throw poses is dropped (only his body is kept: the flying thing is the game's own, drawn where it really is).
"""
import importlib.util
import os
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
spec = importlib.util.spec_from_file_location('cut', os.path.join(HERE, 'cut.py'))
cut = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cut)
REF = os.path.join(ROOT, 'reference', 'prop-sheets')

# where the held thing is in each of Pokey's carry poses, in the 256 px cell of the sheet (measured by eye off the 1024 sheet)
HANDS = {1: (215, 200), 2: (164, 130), 3: (143, 125), 4: (137, 35), 5: (155, 109), 6: (149, 109), 7: (153, 109), 8: (147, 109),
         9: (85, 68), 13: (175, 192)}
# (sheet folder, sheet, cell number 1.., name, scale, options)
WANT = []
for i in range(1, 17):
    opt = {'largest': i in (1, 10, 11, 12), 'hand': HANDS.get(i), 'game': 0.48}
    WANT.append(('w1to4', 'pokey-carry', i, f'p{i}', 0.75, opt))
for i in range(1, 17):
    WANT.append(('w5puzzle', 'beetle', i, f'b{i}', 0.6, {'flip': i >= 9, 'game': 0.4}))
WANT += [
    ('w1to4', 'w1-puzzle', 4, 'acorn', 0.5, {'game': 0.3}),
    ('w1to4', 'w1-puzzle', 5, 'acornPile', 0.6, {'game': 0.42}),
    ('w1to4', 'w1-puzzle', 6, 'pulley', 0.8, {'game': 0.55}),
    ('w1to4', 'w1-puzzle', 7, 'basket', 0.8, {'game': 0.5}),
    ('w1to4', 'w1-puzzle', 8, 'basketFull', 0.8, {'game': 0.5}),
    ('w1to4', 'w1-puzzle', 9, 'liftPlank', 0.8, {'game': 0.55, 'bottom': 0.3}),
    ('w1to4', 'w1-puzzle', 10, 'plate', 0.6, {'game': 0.4}),
    ('w1to4', 'w1-puzzle', 11, 'platePressed', 0.6, {'game': 0.4}),
    ('w1to4', 'w1-puzzle', 14, 'stone', 0.4, {'game': 0.27}),
    ('w1to4', 'w2-puzzle', 2, 'stonePile', 0.6, {'game': 0.4}),
    ('w1to4', 'w2-puzzle', 16, 'sign', 0.5, {'game': 0.36}),
    ('w1to4', 'w4-puzzle', 9, 'leverOff', 0.6, {'game': 0.38}),
    ('w1to4', 'w4-puzzle', 10, 'leverOn', 0.6, {'game': 0.38}),
    ('w5puzzle', 'pieces', 1, 'pinecone', 0.4, {'game': 0.24}),
    ('w5puzzle', 'pieces', 4, 'gateShut', 1.0, {'game': 0.7}),
    ('w5puzzle', 'pieces', 5, 'gateOpen', 1.0, {'game': 0.7}),
]
SHEETS = {**cut.FOLDERS['w1to4'], **cut.FOLDERS['w5puzzle']}


def cell(folder, sheet, idx, opt):
    cols, rows, key = SHEETS[sheet]
    im = np.asarray(Image.open(os.path.join(REF, folder, sheet + '.jpg')).convert('RGB')).astype(np.float32)
    h, w = im.shape[:2]
    cw, ch = w / cols, h / rows
    r, c = (idx - 1) // cols, (idx - 1) % cols
    x0, y0 = int(c * cw) + cut.INSET, int(r * ch) + cut.INSET
    x1, y1 = int((c + 1) * cw) - cut.INSET, int((r + 1) * ch) - cut.INSET
    k = cut.keyness(im[y0:y1, x0:x1], key)
    out = cut.cut_cell(im[y0:y1, x0:x1], key, depink=sheet in cut.DEPINK)
    # where the trimmed cut sits in the cell (cut_cell trims to alpha > 0.02 of the same mask)
    alpha = np.clip((0.42 - k) / 0.22, 0, 1)
    solid = ndimage.binary_opening(alpha > 0.5, iterations=1)
    lab, n = ndimage.label(solid)
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i in range(n) if sizes[i] >= max(80, sizes.max() * 0.02)])
    keep = ndimage.binary_dilation(keep, iterations=2)
    ys, xs = np.nonzero(alpha * keep > 0.02)
    off = (xs.min() + cut.INSET, ys.min() + cut.INSET)
    a = np.asarray(out).copy()
    if opt.get('largest'):
        m = a[..., 3] > 40
        lab2, n2 = ndimage.label(ndimage.binary_dilation(m, iterations=2))
        if n2 > 1:
            sz = ndimage.sum(m, lab2, range(1, n2 + 1))
            big = np.argmax(sz) + 1
            a[..., 3] = np.where(lab2 == big, a[..., 3], 0)
    img = Image.fromarray(a)
    bb = img.getbbox()
    img = img.crop(bb)
    off = (off[0] + bb[0], off[1] + bb[1])
    if opt.get('bottom'):
        hh = img.height
        top = int(hh * (1 - opt['bottom']))
        img = img.crop((0, top, img.width, hh))
        bb2 = img.getbbox()
        img = img.crop(bb2)
    return img, off


frames = []
for folder, sheet, idx, name, sc, opt in WANT:
    img, off = cell(folder, sheet, idx, opt)
    hand = None
    if opt.get('hand'):
        hx, hy = opt['hand']
        hand = ((hx - off[0]) * sc, (hy - off[1]) * sc)
    if opt.get('flip'):
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    img = img.resize((max(1, round(img.width * sc)), max(1, round(img.height * sc))), Image.LANCZOS)
    a = np.asarray(img)[..., 3].astype(np.float32) / 255
    rows = max(2, int(img.height * 0.12))
    foot = a[-rows:].sum(axis=0)
    ax = float((foot * np.arange(img.width)).sum() / max(1e-6, foot.sum()))
    frames.append((name, img, ax, hand, opt['game'] / sc))

# the cupcake, from World 5's own props atlas
w5 = Image.open(os.path.join(ROOT, 'src/assets/props/w5-props.webp')).convert('RGBA')
cake = w5.crop((620, 1329, 620 + 112, 1329 + 147))
cake = cake.crop(cake.getbbox())
cake = cake.resize((round(cake.width * 0.6), round(cake.height * 0.6)), Image.LANCZOS)
frames.append(('cake', cake, cake.width / 2, None, 0.3 / 0.6))

W, PAD = 2048, 4
order = sorted(frames, key=lambda f: -f[1].height)
x = y = row = 0
pos = {}
for name, im, *_ in order:
    if x + im.width > W:
        x, y, row = 0, y + row + PAD, 0
    pos[name] = (x, y)
    x += im.width + PAD
    row = max(row, im.height)
atlas = Image.new('RGBA', (W, y + row), (0, 0, 0, 0))
for name, im, *_ in frames:
    atlas.paste(im, pos[name])
out = os.path.join(ROOT, 'src/assets/props/puzzle-kit.webp')
atlas.save(out, 'WEBP', quality=86, method=6)
print('atlas', atlas.size, os.path.getsize(out), 'bytes')

lines = [
    '// generated by tools/art/w5puzzle/packkit.py from Matt\'s puzzle sheets (reference/prop-sheets/w1to4, w5puzzle): where each piece of',
    '// the puzzle kit sits in puzzle-kit.webp. ax: the middle of its feet or base across the frame; hx, hy: where a held thing sits in',
    '// Pokey\'s hands (his carry poses); k: game px per atlas px.',
    'export interface KitFrame { x: number; y: number; w: number; h: number; ax: number; k: number; hx?: number; hy?: number }',
    'export const KIT_ART = {',
]
for name, im, ax, hand, k in frames:
    px, py = pos[name]
    extra = f', hx: {hand[0]:.0f}, hy: {hand[1]:.0f}' if hand else ''
    lines.append(f'  {name}: {{ x: {px}, y: {py}, w: {im.width}, h: {im.height}, ax: {ax:.0f}, k: {k:.3f}{extra} }},')
lines.append('} as const satisfies Record<string, KitFrame>;')
lines.append('export type KitArtName = keyof typeof KIT_ART;')
open(os.path.join(ROOT, 'src/game/puzzleAtlasData.ts'), 'w').write('\n'.join(lines) + '\n')
print(len(frames), 'frames')
