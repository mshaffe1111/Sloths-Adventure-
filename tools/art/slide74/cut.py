"""Cut Matt's six Gemini sheets for 7-4's flume (2026-10-29) into the slide's atlases.

    python3 tools/art/slide74/cut.py   -> src/assets/w7slide/flume-*.webp + flume-atlas.json, and tools/art/slide74/cut/contact.png

The sheets live in reference/prop-sheets/gemini-batch-2026-10-29/7-4-slide/ (sheet1-flume ... sheet6-pokey-falling), each a grid on
flat magenta. Each cell is keyed with the shared cutter (tools/art/w5puzzle/cut.py cut_cell: a soft edge, de-spill, specks dropped,
trimmed), pink-tinted pixels are turned neutral where nothing is meant to be pink (the flume's worn middle, the cave mouth's rim, the
webs), and the pieces are packed into a few atlases with their boxes in flume-atlas.json.

Pokey (sheet 5): frames 1-4 grip two vertical poles that stand for the flume's rails; the game's flume is three lanes wide, so the poles
are painted out (pole pixels: the long near-vertical dark-wood strips at each side, found above and below his body and joined by a
line), keeping his hands. The satchel check (strap from the screen-left shoulder to a bag at screen-right): 1, 2, 4, 5, 6 are right;
3 (lean left) and 7 (hurt) have it mirrored, so 7 is used flipped; 8 faces the camera with the bag on his left hip and is not used;
3 is not used (no correct lean left yet: the lead has asked Matt for a re-do).
"""
import json
import os
import sys
import numpy as np
from PIL import Image, ImageOps
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art', 'w5puzzle'))
from cut import cut_cell  # noqa: E402

SRC = os.path.join(ROOT, 'reference', 'prop-sheets', 'gemini-batch-2026-10-29', '7-4-slide')
OUT = os.path.join(ROOT, 'src', 'assets', 'w7slide')
# sheet: (cols, rows, de-pink, names in reading order; None = not used)
SHEETS = {
    'sheet1-flume': (4, 2, True, ['bed', 'bedMoss', 'brokenFront', 'brokenBack', 'barrier', 'beam', 'crates', 'trestle']),
    'sheet2-lights': (4, 4, False, ['torchWall', 'torchWall2', 'torchPost', 'torchPost2', 'lantern', 'lanternL', 'lanternR', 'lanternBeam',
                                     'fungusG', 'fungusP', 'fungusRock', 'fungusRubble', 'glowworms', 'eyesHole', 'eyesRoots', 'eyesThorns']),
    'sheet3-side-props': (4, 4, False, ['signSkull', 'signTurnBack', 'signBroken', 'signArrow', 'scaffoldTall', 'scaffoldShort', 'ropeBridge',
                                        'rope', 'webCorner', 'webRoots', 'thornUp', 'thornDown', 'rootsHang', 'stalactites', 'stalagmites',
                                        'boulder']),
    'sheet4-cave': (2, 2, True, ['mouth', 'wallL', 'wallR', 'ceiling']),
    'sheet5-pokey-behind': (4, 2, False, ['grip', 'grip2', None, 'leanR', 'jump', 'duck', 'hurt', None]),
    'sheet6-pokey-falling': (2, 1, False, ['fallOh', 'fallCurl']),
}
INSET = 5
DEPINK_NAMES = {'webCorner', 'webRoots'}


def depink(img):
    a = np.asarray(img).astype(np.float32)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    pink = (r > g + 22) & (b > g + 8)
    grey = (r + g + b) / 3
    for ch, tint in ((0, 6), (1, 4), (2, -4)):
        a[..., ch] = np.where(pink, np.clip(grey + tint, 0, 255), a[..., ch])
    a[..., 3] = np.where(pink & (al < 230), al * 0.6, al)
    return Image.fromarray(a.astype(np.uint8))


def remove_poles(img):
    """Paint out the two vertical poles in a sheet-5 grip frame. The poles are the same brown as his fur, so they are found by shape:
    in each row, the outermost run of solid pixels on each side, when it is narrow and has background between it and his body, is pole.
    Where his hand closes round a pole the runs join; that short piece stays, under his hand (he grips it like a handle)."""
    a = np.asarray(img).astype(np.float32)
    h, w = a.shape[:2]
    solid = a[..., 3] > 100
    out = a.copy()
    for y in range(h):
        xs = np.nonzero(solid[y])[0]
        if len(xs) == 0:
            continue
        # runs of solid pixels in this row
        cuts = np.nonzero(np.diff(xs) > 2)[0]
        starts = np.concatenate([[xs[0]], xs[cuts + 1]])
        ends = np.concatenate([xs[cuts], [xs[-1]]])
        if len(starts) < 2:
            continue
        for i in (0, len(starts) - 1):
            width = ends[i] - starts[i] + 1
            outer = starts[i] < w * 0.3 if i == 0 else ends[i] > w * 0.7
            if width <= max(30, w * 0.12) and outer:
                out[y, max(0, starts[i] - 2):ends[i] + 3, 3] = 0
    # what is left of the poles above and below his body: bits not joined to him
    solid = out[..., 3] > 40
    lab, n = ndimage.label(solid)
    if n:
        sizes = ndimage.sum(solid, lab, range(1, n + 1))
        big = np.isin(lab, [i + 1 for i in range(n) if sizes[i] >= sizes.max() * 0.05])
        out[..., 3] = np.where(big, out[..., 3], 0)
    im = Image.fromarray(out.astype(np.uint8))
    return im.crop(im.getbbox())


def depink_soft(img):
    """the pink fringe the key leaves on the props' outlines and ropes, without touching the purple mushrooms (bluer than pink)"""
    a = np.asarray(img).astype(np.float32)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    pink = (r > g + 30) & (b > g + 15) & (b - r < 25) & (r - b < 70)
    grey = (r + g + b) / 3
    for ch, tint in ((0, 10), (1, 2), (2, -8)):
        a[..., ch] = np.where(pink, np.clip(grey * 0.85 + tint, 0, 255), a[..., ch])
    return Image.fromarray(a.astype(np.uint8))


def main():
    os.makedirs(os.path.join(HERE, 'cut'), exist_ok=True)
    pieces = {}
    for name, (cols, rows, pink, names) in SHEETS.items():
        im = np.asarray(Image.open(os.path.join(SRC, name + '.jpg')).convert('RGB')).astype(np.float32)
        h, w = im.shape[:2]
        cw, ch = w / cols, h / rows
        for r in range(rows):
            for c in range(cols):
                n = names[r * cols + c]
                if n is None:
                    continue
                x0, y0 = int(c * cw) + INSET, int(r * ch) + INSET
                x1, y1 = int((c + 1) * cw) - INSET, int((r + 1) * ch) - INSET
                cell = cut_cell(im[y0:y1, x0:x1], 'magenta', depink=pink)
                if cell is None:
                    print('empty', name, n)
                    continue
                if n in DEPINK_NAMES:
                    cell = depink(cell)
                elif not pink:
                    cell = depink_soft(cell)
                if name == 'sheet5-pokey-behind' and n in ('grip', 'grip2', 'leanR'):
                    cell = remove_poles(cell)
                if n == 'hurt':
                    cell = ImageOps.mirror(cell)  # (drawn with the satchel mirrored: flipped, it is right)
                pieces[n] = cell
                cell.save(os.path.join(HERE, 'cut', n + '.png'))
    # atlases: the flume and cave (big), the props and lights, Pokey
    groups = {
        'flume-cave': ['mouth', 'wallL', 'wallR', 'ceiling', 'bed', 'bedMoss', 'brokenFront', 'brokenBack', 'barrier', 'beam', 'crates', 'trestle'],
        'flume-props': [n for n in SHEETS['sheet2-lights'][3] + SHEETS['sheet3-side-props'][3] if n],
        'flume-pokey': ['grip', 'grip2', 'leanR', 'jump', 'duck', 'hurt', 'fallOh', 'fallCurl'],
    }
    atlas = {'from': os.path.relpath(SRC, ROOT), 'note': __doc__.strip().splitlines()[0], 'sheets': {}}
    for g, names in groups.items():
        maxw = 2048
        x = y = rowh = 0
        boxes = {}
        for n in names:
            p = pieces[n]
            if x + p.width > maxw:
                x, y, rowh = 0, y + rowh + 4, 0
            boxes[n] = [x, y, p.width, p.height]
            x += p.width + 4
            rowh = max(rowh, p.height)
        sheet = Image.new('RGBA', (maxw, y + rowh), (0, 0, 0, 0))
        for n, (bx, by, _, _) in boxes.items():
            sheet.alpha_composite(pieces[n], (bx, by))
        sheet = sheet.crop((0, 0, max(b[0] + b[2] for b in boxes.values()), sheet.height))
        sheet.save(os.path.join(OUT, g + '.webp'), quality=90, method=6)
        atlas['sheets'][g] = {'file': g + '.webp', 'w': sheet.width, 'h': sheet.height, 'frames': boxes}
    with open(os.path.join(OUT, 'flume-atlas.json'), 'w') as f:
        json.dump(atlas, f, indent=1)
    # the same boxes for the game (src/game/w7SlideAtlas.ts)
    ts = ['/** Generated by tools/art/slide74/cut.py from Matt\'s 7-4 Gemini sheets: where each piece sits in src/assets/w7slide/flume-*.webp. Do not edit by hand. */',
          'export const FLUME_SHEETS = {']
    for g, v in atlas['sheets'].items():
        fr = ', '.join(f"{n}: [{', '.join(str(int(q)) for q in b)}]" for n, b in v['frames'].items())
        ts.append(f"  '{g}': {{ {fr} }},")
    ts.append('} as const;')
    with open(os.path.join(ROOT, 'src', 'game', 'w7SlideAtlas.ts'), 'w') as f:
        f.write('\n'.join(ts) + '\n')
    # a contact sheet on dark (key fringe shows up)
    S, per = 180, 10
    names = list(pieces)
    contact = Image.new('RGBA', (per * S, ((len(names) + per - 1) // per) * S), (24, 30, 40, 255))
    for i, n in enumerate(names):
        t = pieces[n].copy()
        t.thumbnail((S - 12, S - 12))
        contact.alpha_composite(t, ((i % per) * S + (S - t.width) // 2, (i // per) * S + (S - t.height) // 2))
    contact.convert('RGB').save(os.path.join(HERE, 'cut', 'contact.png'))
    print(len(pieces), 'pieces')


if __name__ == '__main__':
    main()
