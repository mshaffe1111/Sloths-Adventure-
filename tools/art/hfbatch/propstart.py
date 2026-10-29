"""Start sheet for World 8's roost branch and seed pods (2026-10-29), for img2img (tools/art/w6to10/img2imggpu.py): a 3 x 2 grid of
512 px cells on flat magenta. Top row: two short mossy roost branches pasted up from the World 8 kit's own bark ('branch',
'branchCreak') with its moss ('mossStrip') along the top, and a single seed pod; bottom row: a pile of pods, an open pod, a smaller pile.
The pods are plain painted shapes in the night palette, for the style model to repaint.
    python3 -I tools/art/hfbatch/propstart.py <game checkout> <out.webp>
"""
import json, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

GAME, OUT = Path(sys.argv[1]), Path(sys.argv[2])
t = (GAME / 'src/game/kitAtlasData.ts').read_text()
KF = json.loads(t[t.index('{'):t.rindex('}') + 1]) if t.strip().startswith('{') else None
if KF is None:
    m = re.search(r'=\s*(\{.*\})\s*;?\s*$', t, re.S)
    KF = json.loads(m.group(1))
KIT = Image.open(GAME / 'src/assets/kits/w8.webp').convert('RGBA')
F = KF['8']


def piece(n):
    f = F[n]
    return KIT.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


def trim(im):
    return im.crop(im.getchannel('A').getbbox())


MAG = (255, 0, 255, 255)
S = Image.new('RGBA', (1536, 1024), MAG)


def place(im, cx, cy, maxw=470, maxh=460):
    im = trim(im)
    k = min(maxw / im.width, maxh / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    S.alpha_composite(im, (cx - im.width // 2, cy - im.height // 2))


def branch(name, x0, x1):
    b = piece(name)
    # the log body only (rows between the leaf tufts): its own rounded left end joined to its own right end, x0/x1 px of each
    l = b.crop((0, 40, x0, b.height - 40)); r = b.crop((b.width - x1, 40, b.width, b.height - 40))
    seg = Image.new('RGBA', (l.width + r.width - 6, l.height), (0, 0, 0, 0))
    seg.alpha_composite(r, (l.width - 6, 0)); seg.alpha_composite(l, (0, 0))
    seg = trim(seg)
    moss = trim(piece('mossStrip'))
    moss = moss.crop((0, 0, moss.width, moss.height // 2))
    moss = moss.resize((seg.width, max(8, round(moss.height * seg.width / moss.width))), Image.LANCZOS)
    out = Image.new('RGBA', (seg.width, seg.height + moss.height // 2), (0, 0, 0, 0))
    out.alpha_composite(seg, (0, moss.height // 2))
    out.alpha_composite(moss, (0, 0))
    return out


place(branch('branch', 260, 280), 256, 256)
place(branch('branchCreak', 200, 300), 768, 256)
INK = (30, 24, 34, 255)


def pod(w, h, ang, fill=(78, 52, 82, 255), open_=False):
    im = Image.new('RGBA', (w + 40, h + 60), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((20, 30, 20 + w, 30 + h), fill=fill, outline=INK, width=5)
    d.arc((20 + w * 0.3, 30, 20 + w * 0.7, 30 + h), 100, 260, fill=(52, 34, 58, 255), width=4)
    d.arc((20 + w * 0.15, 30 + h * 0.08, 20 + w * 0.5, 30 + h * 0.9), 110, 250, fill=(120, 96, 140, 255), width=3)
    d.line((20 + w / 2, 30, 20 + w / 2 + 6, 6), fill=(70, 90, 60, 255), width=7)
    if open_:
        d.ellipse((20 + w * 0.3, 30 + h * 0.2, 20 + w * 0.7, 30 + h * 0.8), fill=(214, 200, 160, 255), outline=INK, width=4)
        for k in range(4):
            yy = 30 + h * (0.28 + k * 0.13)
            d.ellipse((20 + w * 0.4, yy, 20 + w * 0.6, yy + h * 0.1), fill=(150, 120, 80, 255), outline=INK, width=2)
    return im.rotate(ang, expand=True, resample=Image.BICUBIC)


place(pod(150, 300, -20), 1280, 256, 300, 380)


def pile(n, cx, cy, maxw):
    im = Image.new('RGBA', (1000, 900), (0, 0, 0, 0))
    spots = [(150, 330, 70), (330, 330, -60), (520, 330, 80), (700, 330, -75), (240, 180, 35), (430, 170, -30), (610, 190, 50),
             (340, 40, 5)][:n]
    cols = [(78, 52, 82, 255), (88, 60, 74, 255), (70, 50, 92, 255)]
    for i, (x, y, a) in enumerate(spots):
        p = pod(130, 260, a, cols[i % 3])
        im.alpha_composite(p, (x - p.width // 2 + 60, y - p.height // 2 + 200))
    place(im, cx, cy, maxw, 400)


pile(8, 256, 768, 470)
place(pod(170, 300, 15, open_=True), 768, 768, 320, 380)
pile(5, 1280, 768, 400)
S.convert('RGB').save(OUT, 'WEBP', quality=92)
print(OUT)
