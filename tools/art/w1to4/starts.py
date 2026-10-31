"""Start canvases for the World 1-4 art batches (2026-10-31, branch w1-4-sheets; the grab bags in
reference/prop-sheets/qa-notes/w<N>/GRAB-BAG.md §"NEW art").

    python3 tools/art/w1to4/starts.py [1 2 3 4]

One canvas holds a whole world kit, so one img2img pass paints every piece in the same light (audit-2: "whole kits generated in one batch
so they share light"). Each canvas also carries 2 of the world's approved pieces (its style sheet's, `stylesheet.py`) as anchors. They
are painted with the rest, which holds the batch to the world's palette, outline and light. They are thrown away at the cut.

Starts are made from the game's own painted pieces (pasted, bent, recoloured) or plain flat shapes where nothing exists, on the key
colour:
  solid pieces          flat magenta #FF00FF
  pink pieces (the net) flat green #00FF00
  see-through effects   flat black (mist, updraft, foam, spore puff, shadow): cut by brightness as alpha, never off a colour key

Writes reference/prop-sheets/qa-notes/w1-4-art/starts/w<N>-<canvas>.png and cells.json there ({canvas: {key, size, cells: {name: [x, y, w, h]}, anchors}}),
which cut.py uses to cut each take back into pieces. Read-only on src/.
"""
import json, math, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from stylesheet import SRC, frames, kit_frames  # noqa: E402

OUT = HERE.parents[2] / 'reference' / 'prop-sheets' / 'qa-notes' / 'w1-4-art' / 'starts'
MAG, GRN, BLK, WHT = (255, 0, 255), (0, 255, 0), (0, 0, 0), (255, 255, 255)
INK = (46, 30, 24)
_atlas = {}


def piece(atlas, ff, key):
    if atlas not in _atlas:
        _atlas[atlas] = Image.open(SRC / atlas).convert('RGBA')
    if ff is None:  # a JSON atlas beside the picture
        j = json.loads((SRC / atlas).with_suffix('.json').read_text())['frames'][key]
        x, y, w, h = j['x'], j['y'], j['w'], j['h']
    else:
        x, y, w, h = (kit_frames(int(ff[3:])) if ff.startswith('kit') else frames(ff))[key]
    return _atlas[atlas].crop((x, y, x + w, y + h))


def P1(k): return piece('assets/proto/props-atlas.webp', 'protoAtlasData.ts', k)
def P2(k): return piece('assets/proto/props2-atlas.webp', 'proto2AtlasData.ts', k)
def PZ(k): return piece('assets/props/puzzle-kit.webp', 'puzzleAtlasData.ts', k)
def W2(k): return piece('assets/props/w2-props.webp', 'w2PropsData.ts', k)
def W3(k): return piece('assets/props/w3-props.webp', 'w3PropsData.ts', k)
def W4(k): return piece('assets/props/w4-props.webp', 'w4PropsData.ts', k)
def K(n, k): return piece(f'assets/kits/w{n}.webp', f'kit{n}', k)


def blank(w, h):
    return Image.new('RGBA', (w, h), (0, 0, 0, 0))


def fit(im, w, h, anchor='bottom'):
    """im scaled to fit (w, h) on a transparent cell, centred, feet on the bottom"""
    im = im.crop(im.getbbox()) if im.getbbox() else im
    s = min(w / im.width, h / im.height)
    im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    c = blank(w, h)
    c.alpha_composite(im, ((w - im.width) // 2, h - im.height if anchor == 'bottom' else (h - im.height) // 2))
    return c


def stretch(im, w, h):
    return im.resize((w, h), Image.LANCZOS)


def tint(im, rgb, amt):
    a = np.asarray(im).astype(np.float32)
    a[..., :3] = a[..., :3] * (1 - amt) + np.array(rgb, np.float32) * amt
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')


def shape(w, h, draw):
    c = blank(w, h)
    draw(ImageDraw.Draw(c), w, h)
    return c


# ---------------------------------------------------------------- shapes drawn where the game has nothing close

def stone(w, h, top=(120, 112, 98), body=(92, 86, 78), moss=(110, 130, 60), rim=None):
    def d(g, w, h):
        g.rounded_rectangle((6, h * 0.25, w - 6, h - 6), radius=h * 0.3, fill=body + (255,), outline=INK + (255,), width=5)
        g.ellipse((10, h * 0.12, w - 10, h * 0.48), fill=top + (255,), outline=INK + (255,), width=5)
        if moss:
            for x in range(24, w - 24, 22):
                g.ellipse((x - 14, h * 0.13, x + 14, h * 0.27), fill=moss + (255,))
        if rim:
            g.arc((10, h * 0.12, w - 10, h * 0.48), 160, 360, fill=rim + (255,), width=6)
    return shape(w, h, d)


def knot(w, h, col=(120, 84, 60)):
    def d(g, w, h):
        g.chord((4, 4, w - 4, h * 1.6), 180, 360, fill=col + (255,), outline=INK + (255,), width=5)
        g.arc((w * 0.2, h * 0.3, w * 0.8, h * 1.2), 200, 340, fill=(80, 56, 40, 255), width=4)
    return shape(w, h, d)


def squirrel(w, h, pose):
    """a plain red-brown squirrel sketch (body, head, ear, eye, white belly, a big curled tail) in one of the five poses"""
    body, belly, tail = (168, 82, 40, 255), (240, 222, 196, 255), (186, 98, 48, 255)
    def d(g, w, h):
        cx, cy = w * 0.5, h * 0.62
        if pose == 'run':
            g.ellipse((w * 0.05, h * 0.2, w * 0.45, h * 0.6), fill=tail, outline=INK + (255,), width=4)
            g.ellipse((w * 0.25, h * 0.5, w * 0.8, h * 0.78), fill=body, outline=INK + (255,), width=4)
            g.ellipse((w * 0.68, h * 0.38, w * 0.92, h * 0.62), fill=body, outline=INK + (255,), width=4)
            g.polygon([(w * 0.74, h * 0.4), (w * 0.78, h * 0.28), (w * 0.82, h * 0.4)], fill=body, outline=INK + (255,))
            g.ellipse((w * 0.8, h * 0.45, w * 0.84, h * 0.49), fill=(20, 12, 10, 255))
            for fx in (0.32, 0.45, 0.62, 0.72):
                g.line((w * fx, h * 0.74, w * (fx - 0.04), h * 0.86), fill=INK + (255,), width=6)
            return
        g.ellipse((w * 0.04, h * 0.12, w * 0.5, h * 0.82), fill=tail, outline=INK + (255,), width=4)  # tail behind
        g.ellipse((cx - w * 0.2, cy - h * 0.2, cx + w * 0.2, cy + h * 0.28), fill=body, outline=INK + (255,), width=4)
        g.ellipse((cx - w * 0.11, cy - h * 0.08, cx + w * 0.11, cy + h * 0.24), fill=belly)
        hx, hy = cx + w * 0.06, cy - h * 0.3
        g.ellipse((hx - w * 0.14, hy - h * 0.12, hx + w * 0.14, hy + h * 0.12), fill=body, outline=INK + (255,), width=4)
        g.polygon([(hx - w * 0.06, hy - h * 0.1), (hx - w * 0.02, hy - h * 0.24), (hx + w * 0.03, hy - h * 0.09)], fill=body, outline=INK + (255,))
        g.ellipse((hx + w * 0.04, hy - h * 0.03, hx + w * 0.08, hy + h * 0.01), fill=(20, 12, 10, 255))
        arm = {'sit': [(cx + w * 0.05, cy), (cx + w * 0.14, cy + h * 0.05)],
               'wave': [(cx + w * 0.1, cy - h * 0.05), (cx + w * 0.26, cy - h * 0.3)],
               'haul': [(cx + w * 0.08, cy - h * 0.02), (cx + w * 0.22, cy - h * 0.42)],
               'tip': [(cx + w * 0.1, cy + h * 0.02), (cx + w * 0.34, cy + h * 0.06)]}[pose]
        g.line(arm, fill=body, width=int(w * 0.06))
        if pose == 'haul':
            g.line((cx + w * 0.22, 0, cx + w * 0.22, h), fill=(170, 140, 90, 255), width=8)
        if pose == 'tip':
            g.ellipse((cx + w * 0.3, cy - h * 0.02, cx + w * 0.42, cy + h * 0.12), fill=(150, 100, 50, 255), outline=INK + (255,), width=3)
    return shape(w, h, d)


def bat(w, h, pose):
    fur, wing = (104, 92, 84, 255), (70, 60, 58, 255)
    def d(g, w, h):
        cx = w / 2
        if pose in ('asleep', 'stir'):
            g.line((cx, 0, cx, h * 0.12), fill=(60, 50, 40, 255), width=6)
            g.ellipse((cx - w * 0.16, h * 0.1, cx + w * 0.16, h * 0.62), fill=wing, outline=INK + (255,), width=4)
            hy = h * 0.66 if pose == 'asleep' else h * 0.6
            g.ellipse((cx - w * 0.11, hy - h * 0.1, cx + w * 0.11, hy + h * 0.1), fill=fur, outline=INK + (255,), width=4)
            for s in (-1, 1):
                g.polygon([(cx + s * w * 0.05, hy + h * 0.06), (cx + s * w * 0.13, hy + h * 0.2), (cx + s * w * 0.1, hy + h * 0.04)], fill=fur, outline=INK + (255,))
            if pose == 'stir':
                for s in (-1, 1):
                    g.ellipse((cx + s * w * 0.05 - 6, hy - 6, cx + s * w * 0.05 + 6, hy + 6), fill=(250, 220, 120, 255))
            return
        up = pose == 'flap1'
        g.ellipse((cx - w * 0.1, h * 0.38, cx + w * 0.1, h * 0.66), fill=fur, outline=INK + (255,), width=4)
        for s in (-1, 1):
            tip = (cx + s * w * 0.46, h * (0.12 if up else 0.78))
            g.polygon([(cx + s * w * 0.06, h * 0.45), tip, (cx + s * w * 0.3, h * (0.42 if up else 0.62)), (cx + s * w * 0.08, h * 0.6)],
                      fill=wing, outline=INK + (255,))
            g.polygon([(cx + s * w * 0.03, h * 0.38), (cx + s * w * 0.08, h * 0.26), (cx + s * w * 0.09, h * 0.4)], fill=fur, outline=INK + (255,))
    return shape(w, h, d)


def wisps(w, h, kind, seed):
    """see-through effects on black: mist bank, updraft column, current foam, spore puff, a soft shadow"""
    rng = np.random.default_rng(seed)
    c = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    g = ImageDraw.Draw(c)
    if kind == 'mist':
        for _ in range(26):
            x, y, r = rng.uniform(0.15, 0.85) * w, rng.uniform(0.35, 0.7) * h, rng.uniform(0.12, 0.22) * h
            g.ellipse((x - r * 1.6, y - r, x + r * 1.6, y + r), fill=(226, 232, 240, 90))
    elif kind == 'updraft':
        for _ in range(16):
            x = rng.uniform(0.2, 0.8) * w
            y0 = rng.uniform(0, 0.6) * h
            g.line([(x + 14 * math.sin((y0 + t) / 60 + seed), y0 + t) for t in range(0, int(0.4 * h), 8)], fill=(250, 236, 200, 120), width=10)
        for _ in range(6):
            x, y = rng.uniform(0.2, 0.8) * w, rng.uniform(0.1, 0.9) * h
            g.ellipse((x - 14, y - 7, x + 14, y + 7), fill=(150, 170, 70, 255), outline=INK + (255,), width=3)
    elif kind == 'foam':
        for _ in range(40):
            x, y = rng.uniform(0, 1) * w, rng.uniform(0.25, 0.75) * h
            g.ellipse((x - 26, y - 6, x + 26, y + 6), fill=(236, 250, 248, 170))
    elif kind == 'spore':
        r0 = {0: 0.2, 1: 0.34, 2: 0.42}[seed % 3]
        for _ in range(14):
            a, d = rng.uniform(0, 2 * math.pi), rng.uniform(0, r0) * w
            x, y, r = w / 2 + d * math.cos(a), h * 0.55 + d * math.sin(a) * 0.8, rng.uniform(0.06, 0.12) * w
            g.ellipse((x - r, y - r, x + r, y + r), fill=(216, 180, 254, 110 if seed % 3 < 2 else 60))
    elif kind == 'shadow':
        g.ellipse((w * 0.36, h * 0.38, w * 0.64, h * 0.62), fill=(40, 40, 60, 200))
        g.polygon([(w * 0.02, h * 0.42), (w * 0.4, h * 0.36), (w * 0.4, h * 0.6), (w * 0.12, h * 0.62)], fill=(40, 40, 60, 200))
        g.polygon([(w * 0.98, h * 0.42), (w * 0.6, h * 0.36), (w * 0.6, h * 0.6), (w * 0.88, h * 0.62)], fill=(40, 40, 60, 200))
    return c.filter(ImageFilter.GaussianBlur(3))


def crack(im, gone=False):
    """a cracking (or broken to rubble) version of a ledge piece"""
    im = im.copy()
    g = ImageDraw.Draw(im)
    w, h = im.size
    pts = [(w * 0.5, 0), (w * 0.46, h * 0.3), (w * 0.55, h * 0.55), (w * 0.48, h)]
    g.line(pts, fill=INK + (255,), width=max(4, w // 90))
    g.line([(w * 0.46, h * 0.3), (w * 0.3, h * 0.45)], fill=INK + (255,), width=max(3, w // 120))
    if gone:
        a = np.asarray(im).copy()
        a[: int(h * 0.55), :, 3] = 0
        im = Image.fromarray(a, 'RGBA')
        im = im.resize((w, h // 2 + 1)).resize((w, h))
    return im


def rotate(im, deg):
    return im.rotate(deg, resample=Image.BICUBIC, expand=True)


# ---------------------------------------------------------------- the canvases: name -> (key colour, size, [(cell, box, maker)], anchors)

def canvases(world):
    C = {}
    if world == 1:
        C['w1-props'] = (MAG, (1536, 1024), [
            ('bough-up', (640, 10, 560, 190), lambda w, h: fit(P1('branch'), w, h)),
            ('bough-down', (660, 220, 560, 220), lambda w, h: fit(rotate(stretch(P1('branch'), 598, 170), -6), w, h)),
            ('acorn-slope', (0, 230, 640, 280), lambda w, h: fit(_slope(), w, h)),
            ('vine-rope', (1220, 20, 300, 90), lambda w, h: stretch(rotate(P1('liana'), 90).crop((0, 0, 400, 120)), w, h)),
            ('knot-a', (1220, 130, 140, 90), lambda w, h: knot(w, h)),
            ('knot-b', (1380, 130, 140, 90), lambda w, h: knot(w, h, (150, 120, 80))),
            ('stump-a', (0, 560, 240, 220), lambda w, h: fit(P1('stump'), w, h)),
            ('stump-b', (250, 600, 340, 180), lambda w, h: stretch(P1('stump'), w, h)),
            ('stump-c', (20, 820, 220, 160), lambda w, h: stretch(P1('stump'), w, h)),
            ('log-hide', (620, 560, 520, 300), lambda w, h: fit(_loghide(), w, h)),
            ('root-gate-shut', (1150, 480, 180, 300), lambda w, h: _rootgate(w, h, True)),
            ('root-gate-open', (1345, 480, 180, 300), lambda w, h: _rootgate(w, h, False)),
        ], [('log', (0, 0, 330, 170), lambda w, h: fit(P1('log'), w, h)),
            ('curtain', (340, 0, 290, 200), lambda w, h: fit(P1('curtain'), w, h))])
        C['w1-squirrels'] = (MAG, (1536, 1024), [
            (f'squirrel-{p}', (20 + i * 300, 40, 280, 340), (lambda p: lambda w, h: squirrel(w, h, p))(p))
            for i, p in enumerate(['sit', 'wave', 'haul', 'tip', 'run'])
        ] + [('squirrel-sit2', (20, 440, 280, 340), lambda w, h: squirrel(w, h, 'sit'))],
            [('stump', (700, 520, 330, 300), lambda w, h: fit(P1('stump'), w, h)),
             ('log', (1060, 640, 440, 200), lambda w, h: fit(P1('log'), w, h))])
    if world == 2:
        C['w2-props'] = (MAG, (1536, 1024), [
            ('stone-a', (0, 260, 260, 150), lambda w, h: stone(w, h)),
            ('stone-b', (280, 270, 300, 140), lambda w, h: stone(w, h, (128, 120, 108))),
            ('stone-c', (600, 280, 200, 130), lambda w, h: stone(w, h, moss=None)),
            ('reed-isle-a', (820, 220, 340, 200), lambda w, h: fit(_reedisle(), w, h)),
            ('reed-isle-b', (1180, 220, 340, 200), lambda w, h: fit(_reedisle(True), w, h)),
            ('sandbar', (0, 440, 600, 150), lambda w, h: stone(w, h, (222, 200, 150), (190, 168, 120), None)),
            ('mooring-post', (620, 440, 200, 560), lambda w, h: fit(_mooring(), w, h)),
            ('lily-half', (850, 470, 300, 110), lambda w, h: fit(_sinkpad(0.45), w, h)),
            ('lily-under', (1180, 470, 300, 110), lambda w, h: fit(_sinkpad(0.85), w, h)),
            ('barrel-up', (0, 640, 200, 190), lambda w, h: _barrel(w, h, 0)),
            ('barrel-down', (210, 640, 200, 190), lambda w, h: _barrel(w, h, 1)),
            ('crate-up', (0, 830, 200, 190), lambda w, h: _barrel(w, h, 0, True)),
            ('crate-down', (210, 830, 200, 190), lambda w, h: _barrel(w, h, 1, True)),
            ('reed-gate-shut', (850, 600, 300, 410), lambda w, h: _reedgate(w, h, True)),
            ('reed-gate-open', (1180, 600, 300, 410), lambda w, h: _reedgate(w, h, False)),
            ('cage-whole', (420, 640, 190, 260), lambda w, h: fit(W2('cageA'), w, h)),
        ], [('jetty', (0, 0, 470, 230), lambda w, h: fit(W2('jetty'), w, h)),
            ('reedTall', (480, 0, 150, 260), lambda w, h: fit(W2('reedTall'), w, h))])
        C['w2-net'] = (GRN, (1024, 1024), [
            ('net-empty', (40, 120, 440, 760), lambda w, h: fit(PZ('net'), w, h)),
            ('net-full', (540, 120, 440, 760), lambda w, h: fit(PZ('netFull'), w, h)),
        ], [])
        C['w2-water'] = (BLK, (1536, 1024), [
            ('foam-1', (0, 40, 512, 120), lambda w, h: wisps(w, h, 'foam', 1)),
            ('foam-2', (0, 200, 512, 120), lambda w, h: wisps(w, h, 'foam', 2)),
            ('foam-3', (0, 360, 512, 120), lambda w, h: wisps(w, h, 'foam', 3)),
            ('waterline', (560, 40, 512, 80), lambda w, h: wisps(w, h, 'foam', 4)),
        ], [])
    if world == 3:
        C['w3-props'] = (MAG, (1536, 1024), [
            ('stone-a', (0, 250, 280, 170), lambda w, h: stone(w, h, (120, 136, 130), (84, 98, 96), (60, 110, 80), (120, 230, 215))),
            ('stone-b', (300, 270, 240, 150), lambda w, h: stone(w, h, (128, 140, 134), (90, 102, 98), (60, 110, 80), (120, 230, 215))),
            ('stone-c', (560, 280, 200, 140), lambda w, h: stone(w, h, (116, 130, 126), (80, 94, 92), None, (120, 230, 215))),
            ('shelf-short', (780, 250, 360, 140), lambda w, h: stretch(W3('ledge'), w, h)),
            ('shelf-long', (0, 460, 620, 150), lambda w, h: stretch(W3('ledge'), w, h)),
            ('crack-whole', (640, 460, 400, 140), lambda w, h: stretch(K(3, 'branch'), w, h)),
            ('crack-cracking', (1060, 460, 400, 140), lambda w, h: crack(stretch(K(3, 'branch'), w, h))),
            ('crack-gone', (1060, 620, 400, 140), lambda w, h: crack(stretch(K(3, 'branch'), w, h), True)),
            ('stalactite-hang', (0, 640, 150, 360), lambda w, h: fit(W3('stalactite'), w, h, 'top')),
            ('stalactite-fall', (170, 640, 150, 360), lambda w, h: fit(rotate(W3('stalactite'), 8), w, h, 'mid')),
            ('stalactite-shards', (340, 820, 260, 180), lambda w, h: fit(_shards(), w, h)),
            ('root-basket', (640, 780, 220, 220), lambda w, h: fit(tint(PZ('basket'), (90, 70, 50), 0.35), w, h)),
            ('counterweight', (880, 800, 200, 200), lambda w, h: fit(K(3, 'boulder'), w, h)),
        ], [('grottoMouth', (0, 0, 400, 230), lambda w, h: fit(W3('grottoMouth'), w, h)),
            ('fern', (420, 0, 300, 200), lambda w, h: fit(W3('fern'), w, h))])
        C['w3-bats'] = (MAG, (1536, 1024), [
            (f'bat-{p}', (20 + i * 300, 60, 280, 300), (lambda p: lambda w, h: bat(w, h, p))(p))
            for i, p in enumerate(['asleep', 'stir', 'flap1', 'flap2'])
        ], [('hollowLog', (100, 560, 420, 300), lambda w, h: fit(W3('hollowLog'), w, h)),
            ('stalactite', (900, 480, 200, 400), lambda w, h: fit(W3('stalactite'), w, h, 'top'))])
        C['w3-fx'] = (BLK, (1536, 1024), [
            (f'spore-{i}', (40 + i * 340, 100, 300, 300), (lambda i: lambda w, h: wisps(w, h, 'spore', i))(i)) for i in range(3)
        ], [])
    if world == 4:
        C['w4-props'] = (MAG, (1536, 1024), [
            ('knot', (680, 20, 200, 200), lambda w, h: _knot4(w, h, True)),
            ('peg', (900, 20, 200, 200), lambda w, h: _knot4(w, h, False)),
            ('veil-closed', (0, 280, 260, 560), lambda w, h: _veil(w, h, False)),
            ('veil-parting', (280, 280, 260, 560), lambda w, h: _veil(w, h, True)),
            ('slung-log', (560, 280, 620, 180), lambda w, h: fit(_slung(), w, h)),
            ('rope-anchor', (1200, 260, 160, 220), lambda w, h: fit(_anchor(), w, h)),
            ('ledge-whole', (560, 520, 460, 150), lambda w, h: stretch(K(4, 'branch'), w, h)),
            ('ledge-cracking', (1040, 520, 460, 150), lambda w, h: crack(stretch(K(4, 'branch'), w, h))),
            ('ledge-gone', (1040, 700, 460, 150), lambda w, h: crack(stretch(K(4, 'branch'), w, h), True)),
        ], [('fallCliff', (0, 0, 300, 260), lambda w, h: fit(W4('fallCliff'), w, h)),
            ('chimesStill', (320, 0, 200, 260), lambda w, h: fit(W4('chimesStill'), w, h))])
        C['w4-fx'] = (BLK, (1536, 1024), [
            ('updraft-1', (20, 40, 240, 720), lambda w, h: wisps(w, h, 'updraft', 1)),
            ('updraft-2', (280, 40, 240, 720), lambda w, h: wisps(w, h, 'updraft', 2)),
            ('updraft-3', (540, 40, 240, 720), lambda w, h: wisps(w, h, 'updraft', 3)),
            ('mist-1', (800, 20, 700, 300), lambda w, h: wisps(w, h, 'mist', 1)),
            ('mist-2', (800, 340, 700, 300), lambda w, h: wisps(w, h, 'mist', 2)),
            ('mist-3', (800, 660, 700, 300), lambda w, h: wisps(w, h, 'mist', 3)),
            ('sov-shadow', (20, 800, 760, 200), lambda w, h: wisps(w, h, 'shadow', 1)),
        ], [])
    return C


def canvases2(world):
    """round 2 (2026-10-31): the pieces round 1 missed"""
    C = {}
    if world == 1:
        C['w1-knots'] = (MAG, (1024, 512), [
            ('knot-a', (60, 140, 400, 240), lambda w, h: _bracket(w, h, (150, 104, 70))),
            ('knot-b', (560, 160, 400, 200), lambda w, h: _bracket(w, h, (176, 136, 96), True)),
        ], [('stump', (20, 330, 200, 170), lambda w, h: fit(P1('stump'), w, h))])
        C['w1-squirrel-ref'] = (MAG, (1024, 1024), [
            ('ref', (212, 162, 600, 700), lambda w, h: fit(piece('assets/w6to10/gemini/story18-squirrels.webp', None, 'laughing'), w, h))], [])
    if world == 2:
        C['w2-gate'] = (GRN, (1024, 768), [
            ('reed-gate-shut', (80, 120, 380, 560), lambda w, h: _reedgate(w, h, True)),
            ('reed-gate-open', (560, 120, 380, 560), lambda w, h: _reedgate(w, h, False)),
        ], [('reedTall', (20, 560, 120, 200), lambda w, h: fit(W2('reedTall'), w, h))])
    if world == 4:
        C['w4-veil'] = (BLK, (1024, 1024), [
            ('veil-closed', (120, 60, 320, 900), lambda w, h: _veil(w, h, False)),
            ('veil-parting', (580, 60, 320, 900), lambda w, h: _veil(w, h, True)),
        ], [])
        C['w4-mist'] = (BLK, (1536, 1024), [
            ('mist-1', (40, 60, 700, 300), lambda w, h: _mist(w, h, 1)),
            ('mist-2', (800, 60, 700, 300), lambda w, h: _mist(w, h, 2)),
            ('mist-3', (400, 560, 700, 300), lambda w, h: _mist(w, h, 3)),
        ], [])
        C['w4-shadow'] = (WHT, (1536, 640), [
            ('sov-shadow', (80, 80, 1376, 480), lambda w, h: _eagleshadow(w, h)),
        ], [])
    return C


def _bracket(w, h, col, moss=False):
    def d(g, w, h):
        g.chord((6, -h * 0.9, w - 6, h - 6), 0, 180, fill=col + (255,), outline=INK + (255,), width=6)
        for k in range(1, 4):
            g.arc((6 + k * 18, -h * 0.9 + k * 12, w - 6 - k * 18, h - 6 - k * 16), 20, 160, fill=(110, 76, 52, 255), width=4)
        g.rectangle((6, 0, w - 6, 14), fill=(120, 150, 60, 255) if moss else col + (255,))
    return shape(w, h, d)


def _mist(w, h, seed):
    rng = np.random.default_rng(seed)
    a = np.zeros((h, w), np.float32)
    yy, xx = np.mgrid[0:h, 0:w]
    for _ in range(40):
        cx, cy = rng.uniform(0.12, 0.88) * w, rng.uniform(0.35, 0.65) * h
        rx, ry = rng.uniform(0.08, 0.16) * w, rng.uniform(0.18, 0.3) * h
        a = np.maximum(a, np.exp(-(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)))
    a = (a * 230).clip(0, 230).astype(np.uint8)
    rgb = np.dstack([np.full_like(a, 236), np.full_like(a, 240), np.full_like(a, 246)])
    return Image.fromarray(np.dstack([rgb, a]), 'RGBA')


def _eagleshadow(w, h):
    s = piece('assets/enemies/sovereign-atlas.webp', 'sovereignAtlasData.ts', _sov_key())
    a = np.asarray(s)[..., 3]
    sil = Image.fromarray(np.dstack([np.full_like(a, 40), np.full_like(a, 44), np.full_like(a, 64), (a * 0.8).astype(np.uint8)]), 'RGBA')
    return fit(sil.filter(ImageFilter.GaussianBlur(4)), w, h, 'mid')


def _sov_key():
    fr = frames('sovereignAtlasData.ts')
    for k in ('glide', 'soar', 'fly', 'spread'):
        for n in fr:
            if k in n.lower():
                return n
    return max(fr, key=lambda n: fr[n][2] / max(1, fr[n][3]))


def _slope():
    b = rotate(P1('branch'), 14)
    pile = PZ('acornPile').resize((180, 112), Image.LANCZOS)
    c = blank(b.width + 40, b.height + 60)
    c.alpha_composite(b, (0, 60))
    c.alpha_composite(pile, (b.width - 230, 30))
    return c


def _loghide():
    lg = P1('log').resize((520, 238), Image.LANCZOS)
    fern = P2('fernClump')
    c = blank(560, 330)
    c.alpha_composite(fit(fern, 200, 160), (0, 170))
    c.alpha_composite(fit(fern, 200, 160), (360, 170))
    g = ImageDraw.Draw(c)
    g.ellipse((150, 260, 410, 330), fill=(40, 26, 30, 255))
    c.alpha_composite(lg, (20, 40))
    return c


def _rootgate(w, h, shut):
    def d(g, w, h):
        g.rounded_rectangle((4, 10, w - 4, h - 4), radius=40, outline=(96, 68, 48, 255), width=26)
        g.rounded_rectangle((4, 10, w - 4, h - 4), radius=40, outline=INK + (255,), width=4)
        for x in range(20, w - 20, 36):
            g.ellipse((x - 18, 0, x + 18, 30), fill=(110, 140, 60, 255))
        if shut:
            for i in range(5):
                x = 30 + i * (w - 60) / 4
                g.line([(x, 30), (x + 18, h * 0.4), (x - 10, h * 0.7), (x + 6, h - 10)], fill=(120, 86, 58, 255), width=14)
            for y in (h * 0.35, h * 0.65):
                g.line([(20, y), (w - 20, y + 12)], fill=(110, 78, 52, 255), width=12)
        else:
            for s in (0, 1):
                x = 26 if s == 0 else w - 26
                g.line([(x, 30), (x + (12 if s == 0 else -12), h * 0.5), (x, h - 10)], fill=(120, 86, 58, 255), width=16)
    return shape(w, h, d)


def _reedisle(wide=False):
    c = blank(380, 220)
    g = ImageDraw.Draw(c)
    g.chord((10, 120, 370, 260), 180, 360, fill=(104, 82, 56, 255), outline=INK + (255,), width=5)
    g.rectangle((10, 186, 370, 220), fill=(104, 82, 56, 255))
    r = W2('reedShort')
    c.alpha_composite(fit(r, 200, 150), (30 if wide else 90, 30))
    if wide:
        c.alpha_composite(fit(r, 160, 120), (200, 60))
    return c


def _mooring():
    return K(2, 'perch')


def _sinkpad(depth):
    p = W2('lily').resize((300, 94))
    a = np.asarray(p).copy()
    cut = int(94 * (1 - depth))
    a[cut:, :, :3] = (a[cut:, :, :3] * 0.4 + np.array([40, 110, 110]) * 0.6).astype(np.uint8)
    c = Image.fromarray(a, 'RGBA')
    g = ImageDraw.Draw(c)
    g.arc((10, cut - 20, 290, cut + 20), 0, 180, fill=(236, 250, 248, 255), width=4)
    return c


def _barrel(w, h, bob, crate=False):
    def d(g, w, h):
        y = 20 + bob * 26
        if crate:
            g.rectangle((30, y, w - 30, y + 120), fill=(150, 112, 70, 255), outline=INK + (255,), width=5)
            g.line((30, y, w - 30, y + 120), fill=(110, 80, 50, 255), width=8)
        else:
            g.rounded_rectangle((36, y, w - 36, y + 130), radius=30, fill=(140, 96, 56, 255), outline=INK + (255,), width=5)
            for yy in (y + 26, y + 104):
                g.line((36, yy, w - 36, yy), fill=(80, 76, 80, 255), width=9)
    im = shape(w, h, d)
    return im.rotate(-8, resample=Image.BICUBIC) if bob else im


def _reedgate(w, h, shut):
    def d(g, w, h):
        for x in (14, w - 14):
            g.rectangle((x - 12, 0, x + 12, h), fill=(126, 104, 80, 255), outline=INK + (255,), width=4)
        g.rectangle((0, 8, w, 34), fill=(126, 104, 80, 255), outline=INK + (255,), width=4)
        if shut:
            for x in range(40, w - 30, 14):
                g.line((x, 34, x + 3, h - 6), fill=(186, 150, 80, 255), width=11)
                g.line((x, 34, x + 3, h - 6), fill=INK + (255,), width=2)
            for y in (h * 0.4, h * 0.75):
                g.line((26, y, w - 26, y), fill=(196, 160, 110, 255), width=8)
    return shape(w, h, d)


def _shards():
    s = W3('stalactite')
    c = blank(300, 180)
    for i, (x, y, deg) in enumerate([(10, 90, 70), (110, 110, -50), (180, 70, 20)]):
        part = s.crop((0, i * 120, s.width, i * 120 + 140))
        c.alpha_composite(fit(rotate(part, deg), 110, 90), (x, y))
    return c


def _knot4(w, h, tied):
    def d(g, w, h):
        g.rectangle((w * 0.42, h * 0.1, w * 0.58, h * 0.95), fill=(120, 96, 70, 255), outline=INK + (255,), width=4)
        if tied:
            g.ellipse((w * 0.2, h * 0.3, w * 0.8, h * 0.7), fill=(110, 140, 50, 255), outline=INK + (255,), width=5)
            g.line((w * 0.75, h * 0.6, w * 0.95, h * 0.95), fill=(110, 140, 50, 255), width=16)
            g.arc((w * 0.3, h * 0.38, w * 0.7, h * 0.62), 0, 360, fill=(70, 96, 30, 255), width=5)
    return shape(w, h, d)


def _veil(w, h, parting):
    try:
        f = piece('assets/w4/falls.webp', 'w4FallsData.ts', 'fallNarrow')
        c = stretch(f, w, h)
        if parting:
            a = np.asarray(c).copy(); a[:, int(w * 0.3):int(w * 0.7), 3] = 0; c = Image.fromarray(a, 'RGBA')
        return c
    except Exception as e:
        print('veil fallback', e)
    def d(g, w, h):
        g.rectangle((0, 0, w, h), fill=(40, 52, 62, 255)) if not parting else None
        for i in range(12):
            x = 10 + i * (w - 20) / 11
            if parting and 0.3 * w < x < 0.7 * w:
                continue
            g.line((x, 0, x + 4, h), fill=(200, 236, 246, 255), width=14)
        g.rectangle((0, h - 30, w, h), fill=(236, 250, 248, 255))
    return shape(w, h, d)


def _slung():
    lg = W4('brokenLog') if W4('brokenLog').width > 140 else P1('log')
    c = blank(640, 200)
    c.alpha_composite(stretch(P1('log'), 520, 150), (60, 40))
    g = ImageDraw.Draw(c)
    for x in (110, 520):
        g.line((x, 0, x, 70), fill=(196, 160, 110, 255), width=8)
    return c


def _anchor():
    def d(g, w, h):
        g.rectangle((w * 0.35, h * 0.2, w * 0.65, h), fill=(120, 96, 70, 255), outline=INK + (255,), width=4)
        g.line((w * 0.5, h * 0.3, w, 0), fill=(196, 160, 110, 255), width=8)
        for k in range(3):
            g.line((w * 0.3, h * (0.3 + k * 0.05), w * 0.7, h * (0.32 + k * 0.05)), fill=(196, 160, 110, 255), width=6)
    return shape(160, 220, d)


def build(world, rnd=1):
    OUT.mkdir(exist_ok=True)
    meta = json.loads((OUT / 'cells.json').read_text()) if (OUT / 'cells.json').exists() else {}
    for name, (keyc, size, cells, anchors) in (canvases if rnd == 1 else canvases2)(world).items():
        cv = Image.new('RGBA', size, keyc + (255,))
        info = {'key': list(keyc), 'size': list(size), 'cells': {}, 'anchors': {}}
        for group, tgt in ((cells, 'cells'), (anchors, 'anchors')):
            for cname, (x, y, w, h), mk in group:
                im = mk(w, h)
                if im.size != (w, h):
                    im = fit(im, w, h)
                cv.alpha_composite(im, (x, y))
                info[tgt][cname] = [x, y, w, h]
        out = cv.convert('RGB')
        out.save(OUT / f'{name}.png')
        meta[name] = info
        print(OUT / f'{name}.png', len(cells), 'cells')
    (OUT / 'cells.json').write_text(json.dumps(meta, indent=1))


if __name__ == '__main__':
    rnd = 2 if '--round2' in sys.argv else 1
    for w in [int(a) for a in sys.argv[1:] if a.isdigit()] or [1, 2, 3, 4]:
        build(w, rnd)
