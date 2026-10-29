"""7-4 The Slide, Pokey from behind (hf-art-pokey, 2026-10-29): put the pole-free paws into the 2x sheets the slide builder's cut.py reads.

    python3 -I tools/art/hfpokey/slidefix.py <up dir> <edits dir> <out dir> <review dir>

<up dir>     sheet1-flume.png, sheet5-pokey-behind.png, sheet6-pokey-falling.png: Matt's Gemini sheets (w7-slide,
             reference/prop-sheets/gemini-batch-2026-10-29/7-4-slide/*.jpg) through Real-ESRGAN x4 anime, brought to 2x (2048 x 1118)
<edits dir>  the Qwen-Image-Edit takes (edits/<name>-s<seed>.png, 1024 x 1120 crops of one sheet-5 cell)
<out dir>    the drop-in sheets, same names as Matt's, same 4 x 2 / 2 x 1 grids on flat magenta, at 2x (PNG, lossless)

Sheet 5 cells 1, 2, 4 (grip, grip2, leanR) are replaced by the chosen take: scaled so his head is as wide as in the original cell, his
head top and middle where they were, and every background pixel set to the sheet's own magenta (so cut.py's key and its INSET still
work). Cells 3, 5-8 and sheet 6 are the upscales as they are. Satchels are as Matt drew them (cut.py mirrors hurt and cheer itself).
NOTE for the builder: with these sheets cut.py's remove_poles() must not run on grip/grip2/leanR any more (there are no poles; it would
clip his arms): delete that step.
"""
import os, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

UP, ED, OUT, REV = (Path(a) for a in sys.argv[1:5])
OUT.mkdir(parents=True, exist_ok=True); REV.mkdir(parents=True, exist_ok=True)
PICKS = {'grip': (0, 'slide2-grip-s1'), 'grip2': (1, 'slide2-grip2-s1'), 'leanR': (3, 'slide2-leanR-s1')}
if len(sys.argv) > 5:  # name=take,...
    for kv in sys.argv[5].split(','):
        k, v = kv.split('='); PICKS[k] = (PICKS[k][0], v)
CW, CH = 512, 559


def magenta_mask(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (r > 170) & (b > 140) & (g < 110) & (r - g > 110)


def fig_mask(a):
    m = ~magenta_mask(a)
    lab, n = ndimage.label(m)
    if n > 1:
        sz = ndimage.sum(m, lab, range(1, n + 1))
        m = np.isin(lab, 1 + np.flatnonzero(sz > sz.max() * 0.02))
    return m


def head(a):
    """(top y, middle x, width) of his head: the figure's row 34 px (2x) below its top"""
    m = fig_mask(a)
    ys = np.nonzero(m.any(1))[0]
    top = ys[0]
    row = m[top + 70]
    xs = np.nonzero(row)[0]
    # the run under the top of his head (the poles stand apart from it at this height)
    cx = int(np.median(np.nonzero(m[top + 8])[0]))
    lab, _ = ndimage.label(row)
    run = np.nonzero(lab == lab[cx])[0] if lab[cx] else xs
    return top, (run.min() + run.max()) / 2, run.max() - run.min()


def place(sheet, c, take):
    cell = np.asarray(sheet.crop((CW * c, 0, CW * (c + 1), CH)))
    t0, x0, w0 = head(cell)
    ed = Image.open(ED / f'{take}.png').convert('RGB').resize((CW, 560), Image.LANCZOS)
    e = np.asarray(ed)
    t1, x1, w1 = head(e)
    k = w0 / w1
    big = ed.resize((round(CW * k), round(560 * k)), Image.LANCZOS)
    bm = Image.fromarray((fig_mask(np.asarray(big)) * 255).astype(np.uint8)).filter(__import__('PIL.ImageFilter', fromlist=['x']).GaussianBlur(0.6))
    bg = tuple(int(v) for v in np.median(cell[magenta_mask(cell)], 0))
    out = Image.new('RGB', (CW, CH), bg)
    ox, oy = round(x0 - x1 * k), round(t0 - t1 * k)
    out.paste(big, (ox, oy), bm)
    sheet.paste(out, (CW * c, 0))
    print(take, 'scale', round(k, 3), 'offset', ox, oy, 'bg', bg)
    return np.asarray(Image.open(ED / f'{take}.png').convert('RGB'))


sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'w5puzzle'))
from cut import cut_cell  # noqa: E402  (the shared cutter the slide's cut.py uses)


def depink_soft(img):
    """as w7-slide tools/art/slide74/cut.py depink_soft (what the builder's cut runs on sheet 5)"""
    a = np.asarray(img).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    pink = (r > g + 30) & (b > g + 15) & (b - r < 25) & (r - b < 70)
    grey = (r + g + b) / 3
    for ch, tint in ((0, 10), (1, 2), (2, -8)):
        a[..., ch] = np.where(pink, np.clip(grey * 0.85 + tint, 0, 255), a[..., ch])
    return Image.fromarray(a.astype(np.uint8))


def on_dark(im, k=1.0):
    """the cell cut as the builder's cut.py cuts it (INSET 5, cut_cell on magenta, depink_soft), on dark"""
    a = np.asarray(im.convert('RGB')).astype(np.float32)[5:-5, 5:-5]
    fg = depink_soft(cut_cell(a, 'magenta'))
    fg = fg.crop(fg.getbbox())
    if k != 1.0:
        fg = fg.resize((max(1, round(fg.width * k)), max(1, round(fg.height * k))), Image.LANCZOS)
    c = Image.new('RGBA', (fg.width + 16, fg.height + 16), (24, 28, 36, 255)); c.alpha_composite(fg, (8, 8))
    return c.convert('RGB')


s5 = Image.open(UP / 'sheet5-pokey-behind.png').convert('RGB')
before = s5.copy()
for name, (c, take) in PICKS.items():
    place(s5, c, take)
SUFFIX = os.environ.get('SUFFIX', '')
s5.save(OUT / f'sheet5-pokey-behind{SUFFIX}.jpg', quality=95, subsampling=0)  # .jpg like Matt's, so cut.py reads it as it is
if not SUFFIX:
    for n in ('sheet6-pokey-falling', 'sheet1-flume'):
        Image.open(UP / f'{n}.png').convert('RGB').save(OUT / f'{n}.jpg', quality=95, subsampling=0)

# review: before (the original sheet as cut.py saw it, 1x) / the builder's stubs (v4) / after (2x), on dark, at full and game size
names = ['grip', 'grip2', None, 'leanR', 'jump', 'duck', 'hurt', 'cheer']
cells_b = [before.crop((CW * (i % 4), CH * (i // 4), CW * (i % 4 + 1), CH * (i // 4 + 1))) for i in range(8)]
cells_a = [s5.crop((CW * (i % 4), CH * (i // 4), CW * (i % 4 + 1), CH * (i // 4 + 1))) for i in range(8)]
rows = []
for lab, cells in (('BEFORE: Matt\'s sheet (2x upscale) with the poles', cells_b), ('AFTER, 2x, on dark', cells_a)):
    rows.append((lab, [on_dark(c) for i, c in enumerate(cells) if names[i]]))
if len(sys.argv) > 6:  # w7-slide's current flume-pokey.webp: the builder's own pole removal (stumps), at 2x of its size
    fp = Image.open(sys.argv[6]).convert('RGBA')
    v4 = []
    for bx in ((0, 0, 109, 192), (113, 0, 109, 192), (226, 0, 110, 187)):
        p = fp.crop((bx[0], bx[1], bx[0] + bx[2], bx[1] + bx[3])).resize((bx[2] * 2, bx[3] * 2), Image.LANCZOS)
        c = Image.new('RGBA', (p.width + 16, p.height + 16), (24, 28, 36, 255)); c.alpha_composite(p, (8, 8)); v4.append(c.convert('RGB'))
    rows.insert(1, ('NOW on w7-slide (v4): the builder\'s pole removal cut his paws off (grip, grip2, leanR, shown 2x)', v4))
rows.append(('AFTER at game size (about 0.25 of the 2x sheet)', [on_dark(c, 0.25) for i, c in enumerate(cells_a) if names[i]]))
W = max(sum(t.width + 8 for t in ts) for _, ts in rows) + 10
H = 30 + sum(max(t.height for t in ts) + 24 for _, ts in rows)
S = Image.new('RGB', (W, H), (14, 14, 18)); d = ImageDraw.Draw(S)
d.text((6, 6), '7-4 slide, Pokey from behind: poles out, empty paws (hf-art-pokey). Labels: ' + ', '.join(n for n in names if n), fill=(255, 255, 255))
y = 30
for lab, ts in rows:
    d.text((6, y), lab, fill=(255, 220, 0)); y += 16
    x = 5
    for t in ts:
        S.paste(t, (x, y)); x += t.width + 8
    y += max(t.height for t in ts) + 8
S.save(REV / f'sheet5-before-after{SUFFIX}.jpg', quality=90)
print('review', S.size)
