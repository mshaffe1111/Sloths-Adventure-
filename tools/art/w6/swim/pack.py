"""Pack Pokey's swim frames (reference/animation-sheets/pokey-swim/, cut by cut.py) into the game's swim atlas (2026-10-29):

    python3 -I tools/art/w6/swim/pack.py

src/assets/hero/pokey-swim.webp   one row per move (surf, tread, under, first), the frames side by side at the sheet's own scale (his
                                  standing height = 200 px, the standard hero's: heroStandardData.ts STD_STAND_H)
src/game/heroSwimData.ts          per move: the frames' boxes in the atlas, the anchor (ax: the middle of his torso; ay: the waterline,
                                  or the middle of his body underwater), fps and loop, from meta.json (heroSwim.ts draws it)
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
SRC = ROOT / 'reference/animation-sheets/pokey-swim'
OUT = ROOT / 'src/assets/hero/pokey-swim.webp'
DATA = ROOT / 'src/game/heroSwimData.ts'
MOVES = ['surf', 'tread', 'under', 'first']
GAP = 2


def main():
    meta = json.loads((SRC / 'meta.json').read_text())
    rows = []
    for m in MOVES:
        fs = sorted((SRC / m).glob('*.png'))
        assert len(fs) == meta[m]['n'], m
        rows.append((m, [Image.open(f).convert('RGBA') for f in fs]))
    W = max(sum(im.width + GAP for im in ims) for _, ims in rows)
    H = sum(max(im.height for im in ims) + GAP for _, ims in rows)
    atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    y = 0
    lines = []
    for m, ims in rows:
        x = 0
        boxes = []
        for im in ims:
            atlas.paste(im, (x, y))
            boxes.append(f'[{x}, {y}]')
            x += im.width + GAP
        md = meta[m]
        lines.append(f"  {m}: {{ w: {md['w']}, h: {md['h']}, ax: {md['ax']}, ay: {md['ay']}, fps: {md['fps']}, loop: {str(md['loop']).lower()}, "
                     f"at: [{', '.join(boxes)}] }},")
        y += max(im.height for im in ims) + GAP
    atlas.save(OUT, 'WEBP', quality=90, method=6)
    DATA.write_text(
        '/**\n'
        " * Pokey's swim frames in src/assets/hero/pokey-swim.webp (written by tools/art/w6/swim/pack.py from\n"
        ' * reference/animation-sheets/pokey-swim/meta.json: do not edit by hand). Each move: the frame size, the anchor (ax the middle of\n'
        ' * his torso, ay the waterline, or the middle of his body underwater), fps, whether it loops, and each frame\'s top-left in the atlas.\n'
        ' * The sheet is at the standard hero\'s scale (his standing height is 200 px).\n'
        ' */\n'
        'export interface SwimMove { w: number; h: number; ax: number; ay: number; fps: number; loop: boolean; at: Array<[number, number]> }\n'
        'export type SwimMoveName = \'surf\' | \'tread\' | \'under\' | \'first\';\n'
        'export const SWIM_MOVES: Record<SwimMoveName, SwimMove> = {\n' + '\n'.join(lines) + '\n};\n')
    print(OUT, atlas.size, OUT.stat().st_size)


if __name__ == '__main__':
    main()
