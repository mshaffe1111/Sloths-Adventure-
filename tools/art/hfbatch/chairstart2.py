"""Start strip v2 for 7-3's "ring of chairs" (2026-10-29, after the lead's review of v1: nine identical chairs in a straight row read as
copy-pasted). 1536 x 416 on flat magenta, for img2img (tools/art/w6to10/img2imggpu.py).

- A real arc seen side-on, made with depth: the chairs at the two ends are nearest (full size, low on the front floor line, overlapping
  their neighbours a little); the middle ones are farthest (smaller, standing higher on a temple floor that curves away, partly behind
  the near ones). Drawn far to near.
- Every chair its own: back height and top differ (broken off halfway, a cracked top, a carved sloth-face crest, a leaning back, a tall
  capped back, a stepped top, ...), armrests on some (one with its armrest missing), seat and legs from different kit pieces; moss and
  roots per chair (one wrapped in a root, one nearly bare).
- The fourth chair knocked over flat on its back; an eleventh chair at the right end, set apart, smaller and plain (smooth uncarved
  stone only).
All stone is the World 7 kit's own ('wall', 'branch', 'boulder', 'perch', 'bank', 'mossStrip', 'liana') and the carved face from the
painted 'sloth-statue' prop (props-made/w7c), so the style model only repaints it.
    python3 -I tools/art/hfbatch/chairstart2.py <game checkout> <out.webp>
"""
import json, re, sys
from pathlib import Path
from PIL import Image, ImageDraw

GAME, OUT = Path(sys.argv[1]), Path(sys.argv[2])
t = (GAME / 'src/game/kitAtlasData.ts').read_text()
F = json.loads(re.search(r'=\s*(\{.*\})\s*;?\s*$', t, re.S).group(1))['7']
KIT = Image.open(GAME / 'src/assets/kits/w7.webp').convert('RGBA')
PROPS = Image.open(GAME / 'src/assets/w6to10/props-made/w7c.webp').convert('RGBA')
PF = json.loads((GAME / 'src/assets/w6to10/props-made/w7c.json').read_text())['frames']


def piece(n, box=None):
    f = F[n]
    im = KIT.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
    return im.crop(box) if box else im


def prop(n, box=None):
    f = PF[n]
    im = PROPS.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
    return im.crop(box) if box else im


def trim(im):
    return im.crop(im.getchannel('A').getbbox())


def rs(im, w, h):
    return im.resize((max(1, round(w)), max(1, round(h))), Image.LANCZOS)


INK = (34, 30, 30, 255)
W, H = 1536, 416
S = Image.new('RGBA', (W, H), (255, 0, 255, 255))

# --- the floor: a temple floor that curves away (its back edge follows the feet of the arc), then the kit's front edge strip
FRONT = H - 36 + 12           # feet of the nearest chairs
LIFT = 64                     # how much higher the farthest chairs stand
x0, x1 = 70, 1300


def depth(x):
    u = min(1, max(0, (x - x0) / (x1 - x0)))
    return 1 - (2 * u - 1) ** 2  # 0 at the ends (near), 1 in the middle (far)


paving = piece('bank', (0, 12, 560, 60))
floor = Image.new('RGBA', (W, H), (0, 0, 0, 0))
y = FRONT - LIFT - 12
while y < H:
    xx = -((y * 7) % 200)
    while xx < W:
        floor.alpha_composite(paving, (xx, y))
        xx += paving.width - 4
    y += paving.height - 8
mask = Image.new('L', (W, H), 0)
md = ImageDraw.Draw(mask)
md.polygon([(0, H)] + [(x, FRONT - LIFT * depth(x) - 6) for x in range(0, W + 1, 8)] + [(W, H)], fill=255)
fl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
fl.paste(floor, (0, 0), mask)
S.alpha_composite(fl)
edge = trim(piece('mossStrip'))
eh = 36
edge = rs(edge, edge.width * eh / edge.height, eh)
x = 0
while x < W:
    S.alpha_composite(edge, (x, H - eh))
    x += edge.width - 4


# --- one chair, side-on, facing right (flipped for the right half); feet at the bottom
def chair(v, k):
    w, h = round(150 * k), round(300 * k * v.get('tall', 1.0))
    seat_y = round(300 * k * 0.5)  # seat height is the same for all; the back above it varies
    h = max(h, seat_y + 40)
    pad = 60
    im = Image.new('RGBA', (w + 2 * pad, h + pad), (0, 0, 0, 0))
    ox, oy = pad, pad  # canvas origin of the chair box
    sy = oy + h - seat_y
    bw = round(w * v.get('bw', 0.28))
    back_src = {'wall': piece('wall', (40, 40, 160, 430)), 'wall2': piece('wall', (250, 30, 380, 420)),
                'perch': piece('perch', (20, 60, 140, 460))}[v.get('back', 'wall')]
    bh = h
    back = rs(back_src, bw, bh)
    top = v.get('top', 'cap')
    if top == 'broken':  # snapped off halfway: a jagged top
        cut = round((sy - oy) * 0.55)
        back = back.crop((0, cut, bw, bh))
        jag = Image.new('L', back.size, 255)
        jd = ImageDraw.Draw(jag)
        brk = [(0, 2), (bw * 0.4, 10 * k), (bw * 0.55, 5 * k), (bw, 22 * k)]  # one slanted break with a chip out of it
        jd.polygon([(0, 0)] + brk + [(bw, 0)], fill=0)
        back.putalpha(Image.fromarray(__import__('numpy').minimum(__import__('numpy').asarray(back.getchannel('A')),
                                                                   __import__('numpy').asarray(jag))))
        d = ImageDraw.Draw(back)
        d.line(brk, fill=INK, width=2)
    bx, by = ox + round(w * 0.02), oy + h - back.height
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
    layer.alpha_composite(back, (bx, by))
    if top in ('cap', 'cracked'):
        cap = rs(piece('branch', (0, 0, 110, 95)), bw * 1.45, 20 * k)
        layer.alpha_composite(cap, (bx - round(bw * 0.2), by - cap.height + 4))
        if top == 'cracked':
            d = ImageDraw.Draw(layer)
            cx = bx + bw * 0.55
            d.line([(cx, by - cap.height + 6), (cx - 6 * k, by + 10 * k), (cx + 4 * k, by + 26 * k), (cx - 3 * k, by + 44 * k)],
                   fill=INK, width=max(2, round(3 * k)))
            d.polygon([(bx + bw * 0.6, by - cap.height + 4), (bx + bw * 1.25, by - cap.height + 4), (bx + bw * 1.25, by + 4)],
                      fill=(0, 0, 0, 0))
    elif top == 'crest':  # the carved sloth face from the painted statue, set on top of the back
        face = trim(prop('sloth-statue', (30, 10, 225, 175)))
        face = rs(face, bw * 1.5, bw * 1.5 * face.height / face.width)
        g = face.convert('LA').convert('RGBA')
        tint = Image.new('RGBA', face.size, (128, 128, 116, 255))
        g = Image.blend(g, tint, 0.35)
        g.putalpha(face.getchannel('A'))
        face = g
        layer.alpha_composite(face, (bx + bw // 2 - face.width // 2, by - face.height + round(10 * k)))
    elif top == 'step':
        for j, f in enumerate((1.3, 1.0)):
            st = rs(piece('branch', (0, 0, 90, 95)), bw * f, 13 * k)
            layer.alpha_composite(st, (bx + round(bw * (1 - f) / 2), by - st.height * (j + 1) + 6))
    if v.get('lean'):
        layer = layer.rotate(v['lean'], center=(bx + bw / 2, oy + h), resample=Image.BICUBIC)
    im.alpha_composite(layer)
    seat_src = {'branch': piece('branch', (0, 0, 220, 95)), 'creak': piece('branchCreak', (0, 0, 230, 119)),
                'boulder': trim(piece('boulder'))}[v.get('seat', 'branch')]
    seat = rs(seat_src, w, (30 if v.get('seat') == 'boulder' else 26) * k)
    leg_src = {'wall': piece('wall', (250, 250, 400, 430)), 'col': piece('bankEnd', (30, 80, 150, 300)),
               'boulder': trim(piece('boulder'))}[v.get('leg', 'wall')]
    legw = round(w * (0.36 if v.get('leg') == 'boulder' else 0.28))
    leg = rs(leg_src, legw, oy + h - (sy + seat.height) + 8)
    im.alpha_composite(leg, (ox + w - legw - round(w * 0.04), oy + h - leg.height))
    im.alpha_composite(seat, (ox, sy))
    if v.get('arm', True):
        post = rs(piece('wall', (250, 250, 300, 430)), 12 * k, 44 * k)
        ax0 = bx + bw - 4
        ax1 = ox + w - round(w * 0.08)
        rail = rs(piece('branch', (0, 0, 120, 95)), ax1 - ax0 + 8, 14 * k)
        im.alpha_composite(post, (ax1 - post.width, sy - post.height + 4))
        im.alpha_composite(rail, (ax0, sy - post.height - rail.height + 10))
    if v.get('moss'):
        ms = trim(piece('mossStrip')).crop((0, 0, 300, 30))
        im.alpha_composite(rs(ms, w * v['moss'], 12 * k), (ox, sy - round(6 * k)))
        if v['moss'] > 0.6:
            im.alpha_composite(rs(ms, bw * 1.3, 10 * k), (bx - 2, by + round(30 * k)))
    if v.get('root'):  # a root wrapped round the back and down the leg
        root = trim(piece('liana', (0, 60, 107, 540)))
        root = rs(root, 30 * k, (oy + h) - by)
        im.alpha_composite(root.rotate(-8, expand=True, resample=Image.BICUBIC), (bx - round(8 * k), by))
        root2 = rs(trim(piece('liana', (0, 300, 107, 648))), 28 * k, leg.height)
        im.alpha_composite(root2, (ox + w - legw - round(w * 0.1), oy + h - root2.height))
    return im, (ox, oy + h)  # the chair image and where its bottom-left foot is on it


def plain_chair(k):
    w, h = round(120 * k), round(220 * k)
    pad = 20
    im = Image.new('RGBA', (w + 2 * pad, h + pad), (0, 0, 0, 0))
    smooth = piece('perch', (35, 110, 105, 290))  # the plain, uncarved face of the broken pillar
    sy = pad + h - round(h * 0.45)
    back = rs(smooth, w * 0.24, h * 0.95)
    im.alpha_composite(back, (pad, pad + h - back.height))
    seat = rs(smooth.rotate(90, expand=True), w, 18 * k)
    leg = rs(smooth, w * 0.22, pad + h - sy - seat.height + 6)
    im.alpha_composite(leg, (pad + w - leg.width, pad + h - leg.height))
    im.alpha_composite(seat, (pad, sy))
    return im, (pad, pad + h)


# ten chairs, each its own
V = [
    dict(tall=1.05, top='cap', moss=0.9, root=True, arm=True, seat='branch', leg='col'),           # 1 near: wrapped in a root
    dict(tall=0.95, top='cracked', moss=0.4, arm=False, seat='creak', leg='wall', back='wall2'),  # 2: cracked top, no armrest
    dict(tall=1.1, top='crest', moss=0.6, arm=True, seat='branch', leg='wall'),                   # 3: carved sloth-face crest
    dict(tall=1.0, top='cap', moss=0.5, arm=True, seat='branch', leg='wall'),                     # 4: knocked over
    dict(tall=0.75, top='broken', moss=0.3, arm=True, seat='branch', leg='col'),             # 5 far: back snapped off halfway
    dict(tall=1.15, top='step', moss=0.0, arm=False, seat='branch', leg='col', back='perch'),     # 6 far: stepped top, nearly bare
    dict(tall=1.0, top='cap', lean=-6, moss=0.7, arm=True, seat='creak', leg='wall'),             # 7: leaning back
    dict(tall=0.9, top='cracked', moss=0.5, root=True, arm=True, seat='branch', leg='wall', back='wall2'),  # 8
    dict(tall=1.2, top='crest', moss=0.3, arm=True, seat='branch', leg='col'),                    # 9: tall, crest
    dict(tall=0.85, top='broken', moss=0.8, arm=False, seat='creak', leg='wall'),                 # 10 near: broken, missing armrest
]
xs = [92, 206, 330, 470, 610, 740, 870, 1010, 1150, 1290]  # the near ends a little closer, so they overlap their neighbours
order = sorted(range(10), key=lambda i: -depth(xs[i]))  # far first
for i in order:
    x = xs[i]
    d = depth(x)
    k = 1.0 - 0.36 * d
    foot = FRONT - LIFT * d
    c, (fx, fy) = chair(V[i], k)
    flip = x > (x0 + x1) / 2
    if i == 3:  # knocked over backwards: the back flat on the floor, seat and leg sticking up
        c = c.rotate(90, expand=True, resample=Image.BICUBIC)
        c = trim(c)
        S.alpha_composite(c, (round(x - c.width / 2), round(foot + 4 - c.height)))
        continue
    if flip:
        c = c.transpose(Image.FLIP_LEFT_RIGHT)
    bb = c.getchannel('A').getbbox()
    cw = bb[2] - bb[0]
    S.alpha_composite(c, (round(x - bb[0] - cw / 2), round(foot - fy)))
c, (fx, fy) = plain_chair(0.78)
c = c.transpose(Image.FLIP_LEFT_RIGHT)
S.alpha_composite(c, (1462 - c.width // 2, round(FRONT - 6 - fy)))
S.convert('RGB').save(OUT, 'WEBP', quality=92)
print(OUT)
