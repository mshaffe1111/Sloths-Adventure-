"""Show-first stills: a few World 1 keeper cuts set on the ground of a REAL game frame beside the painted kit's log, stump and boulder,
so the style match can be judged before anything goes in the game. A picture only: nothing here changes the game.

    python3 tools/art/w1keepers/showfirst.py <sideways.png> <upright.png> <outDir>

Frames come from tools/art/kitaudit/shoot.mjs (1-5 at 80% along: long flat ground). Sizes are set in Pokey heights (P, measured in the
frame: ~58 px sideways, ~70 px upright at dsf 1); every piece's bottom sits 4 px into the grass line. The kit pieces are cut from
src/assets/proto/props-atlas.webp at their PROTO_FRAMES boxes.
"""
import os
import sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
atlas = Image.open(os.path.join(ROOT, 'src/assets/proto/props-atlas.webp')).convert('RGBA')
KIT = {k: atlas.crop((x, y, x + w, y + h)) for k, (x, y, w, h) in
       {'log': (0, 1364, 475, 217), 'stump': (0, 647, 477, 380), 'boulder': (0, 1583, 379, 199)}.items()}
CUT = {k: Image.open(os.path.join(ROOT, f'reference/art/cut/w1-{k}.png')).convert('RGBA')
       for k in ['thorn-bramble-a', 'stump-wide', 'rock-arch', 'wall-earth-A']}


def H(im, h):
    return im.resize((max(1, round(im.width * h / im.height)), round(h)), Image.LANCZOS)


def compose(frame, ground, P, items, out):
    im = Image.open(frame).convert('RGBA')
    d = ImageDraw.Draw(im)
    for src, x, h, label in items:
        p = H(src, h * P)
        im.alpha_composite(p, (int(x), int(ground - p.height + 4)))
        d.rectangle([x, ground + 8, x + len(label) * 6 + 6, ground + 22], fill=(0, 0, 0, 170))
        d.text((x + 3, ground + 10), label, fill=(255, 235, 120, 255))
    im.convert('RGB').save(out)
    print(out)


if __name__ == '__main__':
    side, up, out = sys.argv[1:4]
    os.makedirs(out, exist_ok=True)
    compose(side, 322, 58, [(KIT['log'], 20, 1.3, 'kit log'), (KIT['stump'], 215, 1.4, 'kit stump'), (KIT['boulder'], 330, 1.0, 'kit boulder'),
                            (CUT['stump-wide'], 455, 1.6, 'NEW wide stump'), (CUT['rock-arch'], 585, 1.9, 'NEW rock arch'),
                            (CUT['thorn-bramble-a'], 715, 0.9, 'NEW thorns')], os.path.join(out, 'sideways-A-kit-vs-cuts.png'))
    compose(side, 322, 58, [(KIT['stump'], 100, 1.4, 'kit stump'), (CUT['wall-earth-A'], 240, 5.0, 'NEW earth wall A'),
                            (CUT['thorn-bramble-a'], 600, 0.9, 'NEW thorns'), (KIT['boulder'], 720, 1.0, 'kit boulder')],
            os.path.join(out, 'sideways-B-wall.png'))
    compose(up, 545, 70, [(KIT['stump'], 10, 1.3, 'kit stump'), (CUT['stump-wide'], 120, 1.5, 'NEW stump'),
                          (CUT['thorn-bramble-a'], 255, 0.8, 'NEW thorns')], os.path.join(out, 'upright-A.png'))
    compose(up, 545, 70, [(KIT['boulder'], 10, 1.0, 'kit boulder'), (CUT['rock-arch'], 120, 1.8, 'NEW arch'),
                          (CUT['wall-earth-A'], 255, 3.4, 'NEW wall')], os.path.join(out, 'upright-B.png'))
