#!/usr/bin/env python3
"""The biggest animation sheets, frame by frame (task AS-1, lead's addition): would fewer frames or a different kind of animation save
more than compression?

    python3 tools/assets/sheets.py <out.json> name [name ...]     (name: the sheet's file stem, e.g. jaguar-anim)

Reads the frame rectangles from src/game/<x>AnimData.ts ({"x":..,"y":..,"w":..,"h":..} entries) and the clip/sequence lists, then
measures on the sheet itself: frame count and sizes; packing (frame area / sheet area: the rest is empty sheet); inside the frames, how
much is see-through; frames used by no clip; frames listed more than once in clips; and near-duplicate frames (same size, mean pixel
difference under 2 levels of 255 against another frame of the same clip, alpha included).
"""
import glob, json, os, re, sys
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
RECT = re.compile(r'"([^"]+)":\s*\{\s*"x":\s*(\d+),\s*"y":\s*(\d+),\s*"w":\s*(\d+),\s*"h":\s*(\d+)')


def find(stem):
    img = glob.glob(os.path.join(ROOT, 'src/assets/**', stem + '.webp'), recursive=True)[0]
    for p in glob.glob(os.path.join(ROOT, 'src/game/**/*AnimData.ts'), recursive=True):
        if f'{stem}.webp' in open(p).read():
            return img, p
    # (some sheets' URL lives in the sprite file: fall back to <name>AnimData.ts)
    by_name = glob.glob(os.path.join(ROOT, 'src/game/**', stem.split('-')[0] + 'AnimData.ts'), recursive=True)
    return img, by_name[0] if by_name else None


def main():
    out = []
    for stem in sys.argv[2:]:
        img, data = find(stem)
        src = open(data).read()
        rects = {}
        for m in RECT.finditer(src):
            rects.setdefault(m.group(1), tuple(int(v) for v in m.groups()[1:]))
        # clip lists: every array of frame names
        uses = []
        for arr in re.findall(r'\[([^\[\]]*)\]', src):
            names = re.findall(r'"([^"]+)"', arr)
            if names and all(n in rects for n in names):
                uses.append(names)
        listed = [n for u in uses for n in u]
        im = Image.open(img).convert('RGBA')
        a = np.asarray(im)
        W, H = im.size
        area = sum(w * h for (_, _, w, h) in rects.values())
        alpha_in = sum(int((a[y:y + h, x:x + w, 3] > 8).sum()) for (x, y, w, h) in rects.values())
        # near duplicates: within each clip, frames of equal size against the frame before
        dups = 0
        for u in uses:
            for p, q in zip(u, u[1:]):
                if p == q:
                    continue
                (x1, y1, w1, h1), (x2, y2, w2, h2) = rects[p], rects[q]
                if (w1, h1) != (w2, h2):
                    continue
                d = np.abs(a[y1:y1 + h1, x1:x1 + w1].astype('i2') - a[y2:y2 + h2, x2:x2 + w2].astype('i2')).mean()
                if d < 2:
                    dups += 1
        ws = sorted(w for (_, _, w, _) in rects.values()); hs = sorted(h for (_, _, _, h) in rects.values())
        row = dict(sheet=os.path.relpath(img, ROOT), data=os.path.relpath(data, ROOT), bytes=os.path.getsize(img), w=W, h=H,
                   frames=len(rects), frame_w=[ws[0], ws[len(ws) // 2], ws[-1]], frame_h=[hs[0], hs[len(hs) // 2], hs[-1]],
                   clips=len(uses), listed=len(listed), unused=len(set(rects) - set(listed)), repeats=len(listed) - len(set(listed)),
                   packing=round(area / (W * H), 2), opaque_in_frames=round(alpha_in / max(1, area), 2), near_dups=dups,
                   bytes_per_frame=round(os.path.getsize(img) / max(1, len(rects))))
        out.append(row)
        print(json.dumps(row))
    json.dump(out, open(sys.argv[1], 'w'), indent=1)


if __name__ == '__main__':
    main()
