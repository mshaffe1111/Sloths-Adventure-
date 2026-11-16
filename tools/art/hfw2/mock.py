"""ART-W2: the beside-Pokey sheet. Pastes the new pieces at GAME SCALE onto real 2-1 frames (kitaudit/shoot.mjs, this branch's base):
the river band across the bottom (deep w2-props#water on the left as riverArt.ts draws it, the new shallow strip on the right, each
with its fill below), the long log on the deep side, the lily states and the crown lily on the shallow side, the bent-bamboo bounce on
the bank. NOT an engine render (nothing is wired; BUILD-21/ENG-22 own the slots): a mock-up to judge size, colour and read.

    python3 -I tools/art/hfw2/mock.py <land.png> <port.png> <cut dir> <shallow tile> <out.jpg>

Scale: Pokey's drawn 89.1 units measured on the frames: 54 px sideways, 78 px upright.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw

land, port, cut, shal, out = sys.argv[1:6]
W2 = Image.open('src/assets/props/w2-props.webp').convert('RGBA')
DEEP = W2.crop((0, 1262, 640, 1548))
M02 = Image.open('src/assets/w1-1109/M-02-a.png').convert('RGBA')
M03 = Image.open('src/assets/w1-1109/M-03-a.png').convert('RGBA')
SH = Image.open(shal).convert('RGBA')
P = lambda n: Image.open(f'{cut}/{n}.webp').convert('RGBA')
# world-unit widths (Pokey 89.1)
U = dict(deepTile=300, shalTile=476, band=134, log=450, padS=90, padB=170, crown=300, open=110, bud=46, bounce=150, ripS=120)
shal_fill = tuple(int(v) for v in np.asarray(SH)[-3:, :, :3].reshape(-1, 3).mean(0))


def sized(im, w_units, k):
    w = max(1, round(w_units * k)); return im.resize((w, max(1, round(im.height * w / im.width))), Image.LANCZOS)


def scene(frame, k, surf, place):
    """place: list of (piece, width units, x px, sink as a fraction of its height under the surface, or None = stands at `surf`)"""
    f = Image.open(frame).convert('RGBA'); W, H = f.size
    mid = W // 2
    # deep left, shallow right, each tile at its world width, and each fill below (RIVER_DEEP; the shallow strip's BED)
    dt, st = sized(DEEP, U['deepTile'], k), sized(SH, U['shalTile'], k)
    top = surf - round(dt.height * 0.045)
    d = ImageDraw.Draw(f)
    d.rectangle((0, min(H, top + dt.height - 2), mid, H), fill=(0x26, 0x42, 0x47, 255))
    d.rectangle((mid, min(H, top + st.height - 2), W, H), fill=shal_fill + (255,))
    x = 0
    while x < mid:
        f.alpha_composite(dt.crop((0, 0, min(dt.width, mid - x), dt.height)), (x, top)); x += dt.width - 1
    x = mid
    while x < W:
        f.alpha_composite(st.crop((0, 0, min(st.width, W - x), st.height)), (x, top)); x += st.width - 1
    for n, u, x, sink, *yy in place:
        im = n if isinstance(n, Image.Image) else P(n)
        im = sized(im, u, k)
        y = (yy[0] - im.height) if yy else surf - round(im.height * sink)
        f.alpha_composite(im, (round(x), y))
    return f


def crown(f, k, x, surf, open_=True):
    cr = sized(M02, U['crown'], k)
    y = surf - round(cr.height * 0.6)
    f.alpha_composite(cr, (x, y))
    fl = sized(P('crown-open-11' if open_ else 'crown-bud-11'), U['open'] if open_ else U['bud'], k)
    f.alpha_composite(fl, (x + cr.width // 2 - fl.width // 2, y + round(cr.height * 0.45) - fl.height))


kl, kp = 54 / 89.1, 78 / 89.1
# river scenes: deep with the long log | shallow with a small pad, a sunk small pad and the ripple left where one went under
a1 = scene(land, kl, 296, [('loglong', U['log'], 90, 0.45), ('pad-small-23', U['padS'], 470, 0.5), ('pad-small-sunk-23', U['padS'], 580, 0.4),
                           ('ripple-under-11', U['ripS'], 690, 0.5)])
b1 = scene(port, kp, 640, [('loglong', U['log'], -150, 0.45), ('pad-small-23', U['padS'], 205, 0.5), ('pad-small-sunk-23', U['padS'], 290, 0.4),
                           ('ripple-under-11', U['ripS'], 230, 0.5 - 0.9)])
# pond scenes: a big Victoria (M-03-a) beside the big sunk pad, the crown lily (bud on one, open on the other), the bamboo bounce on the bank
a2 = scene(land.replace('-20', '-80'), kl, 296, [(M03, U['padB'], 40, 0.5), ('pad-big-sunk-23', U['padB'], 170, 0.5),
                                                ('bamboo-bounce-11', U['bounce'], 330, 0, 270)])
crown(a2, kl, 470, 296, False); crown(a2, kl, 640, 296, True)
b2 = scene(port, kp, 640, [('pad-big-sunk-23', U['padB'], 20, 0.5), ('bamboo-bounce-11', U['bounce'], 160, 0, 566)])
crown(b2, kp, 215, 700, True)
rows = [(a1, b1), (a2, b2)]
RW = a1.width + b1.width + 8
S = Image.new('RGB', (RW, 2 * (max(a1.height, b1.height) + 22)), (20, 20, 20))
dd = ImageDraw.Draw(S)
for r, (a, b) in enumerate(rows):
    y = r * (max(a1.height, b1.height) + 22)
    S.paste(a.convert('RGB'), (0, y + 22)); S.paste(b.convert('RGB'), (a.width + 8, y + 22))
    dd.text((4, y + 4), ['RIVER: deep (as today) | SHALLOW backwater (new); long log on deep; small pad, sunk pad, ripple where one went under',
                         'POND: big Victoria (M-03-a) + big sunk pad (new); bent-bamboo bounce (new) on the bank; crown lily = M-02-a + bud / open flower (new)'][r],
            fill=(255, 255, 0))
S.save(out, quality=88)
print(out, S.size, 'shallow fill', shal_fill)
