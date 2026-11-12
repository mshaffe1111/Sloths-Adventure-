"""Cut the chosen trap-piece takes (ART-W1, 2026-11-12). The style model paints a bough above and a pool below most hanging pieces, both
touching the picture's edge, so each take has a hand-set box (fractions of the take: x0, y0, x1, y1) that leaves them out; inside the
box the piece is keyed on its own background (hfprops/cut.py key_own, biggest blob only).

    python3 -I tools/art/w1traps/cuts.py <takes root (holds r1/, r2/, ...)> <out dir>          the cuts, <name>.png
    python3 -I tools/art/w1traps/cuts.py starts <cuts dir> <starts dir>                         round 3's paste-up starts
"""
import importlib.util, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
_sp = importlib.util.spec_from_file_location('hfcut', ROOT / 'tools/art/hfprops/cut.py')
_m = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_m)
key_own = _m.key_own
MAG = (255, 0, 255)

BOX = {
    'r2/hiveHang-67': (0.25, 0.2, 0.8, 0.86), 'r1/hiveHang-29': (0.25, 0.19, 0.75, 0.86),
    'r1/stoneHang-17': (0.2, 0.2, 0.7, 0.82), 'r2/stoneHang-41': (0.25, 0.22, 0.75, 0.82),
    'r1/handleSet-29': (0.2, 0.07, 0.8, 0.9), 'r2/handleSet-67': (0.37, 0.14, 0.75, 0.9),
    'r2/handleSprung-67': (0.3, 0.12, 0.85, 0.85), 'r2/handleSprung-41': (0, 0, 1, 0.95),
    'r1/tendrilSet-29': (0.25, 0.07, 0.75, 0.888), 'r1/tendrilSet-5': (0.3, 0.14, 0.8, 0.93),
    'r2/tendrilCut-67': (0.2, 0.15, 0.8, 0.82), 'r2/tendrilCut-79': (0.2, 0.15, 0.8, 0.82),
    'r2/anchor-53': (0.15, 0, 1, 0.82), 'r1/anchor-29': (0.1, 0, 1, 0.82),
    'r2/vineLink-53': (0.15, 0.32, 0.85, 0.78), 'r2/vineLink-79': (0.2, 0.3, 0.83, 0.8),
    'r3b/anchorArm-41': (0.04, 0.02, 0.98, 0.9), 'r3b/anchorArch-5': (0.1, 0.05, 0.95, 0.875),
    'r2/leafClump-41': (0.1, 0.12, 0.85, 0.75), 'r2/leafClump-67': (0.08, 0.08, 0.92, 0.6),
    # ART-W1B: the round-3 landed takes (img2img of paste-ups: clean magenta round them) and the second sapling
    'r3/hiveDown-down-hiveHang-67-s42-7': (0.03, 0.03, 0.97, 0.97), 'r3/stoneDown-down-stoneHang-17-s42-31': (0.03, 0.03, 0.97, 0.97),
    'r3b/anchorArch-41': (0.1, 0.05, 0.95, 0.875),
    # round 4: the living root hoop (no made things in World 1); the snapped root's stump (rootCut-17's right) is left off by the
    # biggest-blob key, its pool by the box
    'r4/rootSet-5': (0.12, 0.4, 0.88, 0.918), 'r4/rootSet-17': (0.12, 0.25, 0.88, 0.94), 'r4/rootCut-17': (0.03, 0.05, 0.97, 0.872),
}


def cut(src, box):
    im = Image.open(src).convert('RGB')
    W, H = im.size
    c = im.crop((round(box[0] * W), round(box[1] * H), round(box[2] * W), round(box[3] * H)))
    import numpy as np
    a = np.asarray(c)
    ring = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    own = tuple(int(v) for v in np.median(ring, 0))  # (the take's own drifted key, not pure magenta: key_own reads the ring)
    pad = Image.new('RGB', (c.width + 40, c.height + 40), own)
    pad.paste(c, (20, 20))
    return key_own(pad, solo=True)


def on_key(piece, size, at, rot=0):
    """a piece pasted on flat magenta: `at` its middle as fractions of `size`, turned `rot` degrees (no half-clear pixels left)"""
    p = piece.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else piece
    a = p.getchannel('A').point(lambda v: 255 if v > 128 else 0)
    p.putalpha(a)
    bg = Image.new('RGBA', size, MAG + (255,))
    bg.alpha_composite(p, (round(at[0] * size[0] - p.width / 2), round(at[1] * size[1] - p.height / 2)))
    return bg.convert('RGB')


if sys.argv[1] == 'starts':
    C, O = Path(sys.argv[2]), Path(sys.argv[3])
    O.mkdir(parents=True, exist_ok=True)
    fit = lambda p, h: p.resize((round(p.width * h / p.height), h), Image.LANCZOS)
    for n in ('hiveHang-67', 'hiveHang-29'):  # the landed hive: the hanging one laid on its side, whole
        h = fit(Image.open(C / f'{n}.png'), 600)
        on_key(h, (1024, 1024), (0.5, 0.52), rot=-78).save(O / f'down-{n}.png')
    for n in ('stoneHang-17', 'stoneHang-41'):  # the landed stone: the slung one without its loop, settled a little
        s = Image.open(C / f'{n}.png')
        s = s.crop((0, round(s.height * 0.3), s.width, s.height))
        on_key(fit(s, 520), (1024, 1024), (0.5, 0.55), rot=8).save(O / f'down-{n}.png')
    a = Image.open(C / 'anchor-53.png')  # the anchor with room above, so its crown can be painted whole
    on_key(fit(a, 900), (1536, 1280), (0.5, 0.62)).save(O / 'tall-anchor-53.png')
    print(sorted(p.name for p in O.iterdir()))
else:
    T, O = Path(sys.argv[1]), Path(sys.argv[2])
    O.mkdir(parents=True, exist_ok=True)
    # (paint the model left touching a piece, cleared by hand: fractions of the cut piece; stone A's bough tip at its top right)
    ERASE = {'r1/stoneHang-17': [(0.74, 0, 1, 0.1)]}
    for k, b in BOX.items():
        p = cut(T / f'{k}.webp', b)
        for e in ERASE.get(k, []):
            a = p.getchannel('A')
            a.paste(0, (round(e[0] * p.width), round(e[1] * p.height), round(e[2] * p.width), round(e[3] * p.height)))
            p.putalpha(a)
        p.save(O / f"{k.split('/')[1]}.png")
        print(k, p.size)
