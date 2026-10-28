"""Pack the pieces of Meeca's stage (5-M, "On the March North") into one atlas, from Matt's cut-out sheets.

    python3 -I tools/art/w5puzzle/packmeeca.py

Reads Matt's sheets in reference/prop-sheets/w5puzzle/ and cuts each wanted cell the way cut.py does (cut.py w5puzzle writes the same
cuts for looking at): her sixteen new poses (meeca-poses: the cake, the armchair and its silk, popping free, the silk line, the
teapot, tiptoe, wonder, caught), her pinecone carry poses (meeca-carry), the stage's props (meeca-props: the vine ladder rolled and
hanging, the snapped knot, the troughs, the basket empty and full, the teapot upright and tipped, the tea stain, the moonflower shut and
open, the lantern stakes, the cake), Flicker, the Butler, the night camp (camp), the leaf plates and the sapling (pieces) and the tea
pour (tea). Writes src/assets/props/meeca-night.webp and src/game/meecaNightData.ts.

Per frame:
  ax  the middle of its feet / its base across the frame (atlas px);
  k   game px per atlas px (packed a little larger than drawn, for sharpness on a phone).
The open moonflower's cut keeps a faint grey ring from the painted glow: it is faded out here (the game draws the glow itself).
"""
import importlib.util
import os
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
spec = importlib.util.spec_from_file_location('cut', os.path.join(HERE, 'cut.py'))
cut = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cut)
REF = os.path.join(ROOT, 'reference', 'prop-sheets', 'w5puzzle')
SHEETS = cut.FOLDERS['w5puzzle']

# Meeca is 90 game px standing (jennifurSprite.ts MEECA_UNITS); her standing cuts are about 200 px tall
MEECA = 0.45
WANT = []  # (sheet, cell 1.., name, game px per cut px, options)
for i in range(1, 17):
    WANT.append(('meeca-poses', i, f'mp{i}', MEECA, {}))
for i in (1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13):
    WANT.append(('meeca-carry', i, f'mc{i}', MEECA, {'largest': i in (9, 10, 11)}))
PROPS = {1: ('ladderRolled', 0.5), 2: ('ladder', 1.0), 3: ('knotSnapped', 0.36), 4: ('trough', 0.7), 5: ('trough2', 0.7),
         6: ('troughEnd', 0.6), 7: ('basket', 0.5), 8: ('basketFull', 0.5), 9: ('teapot', 0.4), 10: ('teapotTipped', 0.4),
         11: ('stain', 0.45), 12: ('moonBud', 0.6), 13: ('moonOpen', 0.62), 14: ('stake', 0.55), 15: ('stakeLit', 0.55), 16: ('cakePlate', 0.36)}
for i, (n, g) in PROPS.items():
    WANT.append(('meeca-props', i, n, g, {'moon': i == 13}))
for i in (1, 2, 3, 5, 8, 13, 14, 15, 16):
    WANT.append(('flicker', i, f'fl{i}', 0.24, {}))
for i in (1, 3, 5, 6, 7, 13, 14, 15):
    WANT.append(('butler', i, f'bu{i}', 0.5, {}))
CAMP = {1: ('guard1', 0.5), 2: ('guard2', 0.5), 3: ('guard3', 0.5), 4: ('guard4', 0.5), 5: ('guardStump', 0.5), 6: ('guard6', 0.5),
        8: ('guard8', 0.5), 9: ('bedroll', 0.45), 10: ('packs', 0.55), 11: ('fire', 0.5), 12: ('embers', 0.5), 15: ('tent', 1.0),
        16: ('rope', 0.45)}
for i, (n, g) in CAMP.items():
    WANT.append(('camp', i, n, g, {}))
for i, n, g in ((2, 'leafPlate', 0.55), (3, 'leafPlateDown', 0.55), (6, 'sapling', 1.0), (7, 'saplingBent', 1.0)):
    WANT.append(('pieces', i, n, g, {}))
for i, n, g in ((4, 'troughPour', 0.55), (6, 'splash', 0.4), (7, 'trayTipped', 0.4), (9, 'stream', 0.5)):
    WANT.append(('tea', i, n, g, {}))


def cell(sheet, idx, opt):
    cols, rows, key = SHEETS[sheet]
    im = np.asarray(Image.open(os.path.join(REF, sheet + '.jpg')).convert('RGB')).astype(np.float32)
    h, w = im.shape[:2]
    cw, ch = w / cols, h / rows
    r, c = (idx - 1) // cols, (idx - 1) % cols
    x0, y0 = int(c * cw) + cut.INSET, int(r * ch) + cut.INSET
    x1, y1 = int((c + 1) * cw) - cut.INSET, int((r + 1) * ch) - cut.INSET
    img = cut.cut_cell(im[y0:y1, x0:x1], key, depink=sheet in cut.DEPINK)
    a = np.asarray(img).astype(np.float32)
    if opt.get('largest'):
        m = a[..., 3] > 40
        lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=2))
        if n > 1:
            sz = ndimage.sum(m, lab, range(1, n + 1))
            a[..., 3] = np.where(lab == np.argmax(sz) + 1, a[..., 3], 0)
    if opt.get('moon'):
        # the painted glow round the open flower: grey and low in colour, faded out from the petals' edge (the game draws the glow)
        hh, ww = a.shape[:2]
        yy, xx = np.mgrid[0:hh, 0:ww]
        d = np.hypot(xx - ww * 0.5, yy - hh * 0.44)
        r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
        green = (g_ > r_ + 6) & (g_ > b_ + 4)
        luma = 0.3 * r_ + 0.59 * g_ + 0.11 * b_
        sat = a[..., :3].max(-1) - a[..., :3].min(-1)
        glow = (sat < 16) & ~green & (luma < 228)
        fade = np.clip((86 - d) / 26, 0, 1)
        k = np.where(green | (yy > hh * 0.8), 1, np.where(glow, fade ** 2, np.clip((98 - d) / 12, 0, 1)))
        a[..., 3] *= k
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    return out.crop(out.getbbox())


frames = []
for sheet, idx, name, game, opt in WANT:
    img = cell(sheet, idx, opt)
    sc = min(1.0, game * 1.7)
    img = img.resize((max(1, round(img.width * sc)), max(1, round(img.height * sc))), Image.LANCZOS)
    a = np.asarray(img)[..., 3].astype(np.float32) / 255
    rows = max(2, int(img.height * 0.12))
    foot = a[-rows:].sum(axis=0)
    ax = float((foot * np.arange(img.width)).sum() / max(1e-6, foot.sum()))
    frames.append((name, img, ax, game / sc))

W, PAD = 2048, 3
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
out = os.path.join(ROOT, 'src/assets/props/meeca-night.webp')
atlas.save(out, 'WEBP', quality=86, method=6)
print('atlas', atlas.size, os.path.getsize(out), 'bytes')

lines = [
    "// generated by tools/art/w5puzzle/packmeeca.py from Matt's sheets for Meeca's stage (reference/prop-sheets/w5puzzle): where each",
    '// picture sits in meeca-night.webp. ax: the middle of its feet or base across the frame; k: game px per atlas px.',
    'export interface NightFrame { x: number; y: number; w: number; h: number; ax: number; k: number }',
    'export const NIGHT_ART = {',
]
for name, im, ax, k in frames:
    px, py = pos[name]
    lines.append(f'  {name}: {{ x: {px}, y: {py}, w: {im.width}, h: {im.height}, ax: {ax:.0f}, k: {k:.3f} }},')
lines.append('} as const satisfies Record<string, NightFrame>;')
lines.append('export type NightArtName = keyof typeof NIGHT_ART;')
open(os.path.join(ROOT, 'src/game/meecaNightData.ts'), 'w').write('\n'.join(lines) + '\n')
print(len(frames), 'frames')
