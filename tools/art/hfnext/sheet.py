"""ART-NEXT batch 1 (and batch 2) takes sheet: every take as it came back (on grey), and beside it the take keyed (cut.py's border flood, a preview
only, not the ship cut) at GAME size next to Pokey's drawn height (89.1 px, D41) on World 2's dusk river colour.
    python3 -I tools/art/hfnext/sheet.py <takes dir> <out.jpg>
A take with paint on a frame edge (over 1% of it) gets a red border and 'FRAME EDGE: ...' on the sheet, and is printed: reject it before
the pick (ART-NEXT-b, the lead 11-20)."""
import sys, subprocess, tempfile, glob, os, re
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
# game length (px, long side) per piece, from the designs: boat ~240, letter 28, door as w2-props#door (86 tall), weir ~400 wide,
# reeds as reedTall (130 tall), barge 387 long
GAME = {'boat': ('w', 240), 'letter': ('w', 28), 'reply': ('w', 28), 'door': ('h', 86), 'weir': ('w', 400), 'reeds': ('h', 130),
        'barge': ('w', 387),
        # batch 2 (WORLD-3-PLAN §2): shelf S 120, the mat ~130, the sleepy shelf 200, the lit rims as shelf-short 130 / -long 220, lips ~400
        'shelfS': ('w', 120), 'mat': ('w', 130), 'sleepy': ('w', 200), 'rimShort': ('w', 130), 'rimLong': ('w', 220), 'lip': ('w', 400)}
import numpy as np
def frame_paint(im, tol=26):
    """share of each frame edge (top, bottom, left, right) the take paints on: anything over 1% is a piece the frame cut off (11-20:
    barge s23 had paint on 44% of its left edge and the takes sheet's game-size previews hid it; the lead: reject before the pick)"""
    a = np.asarray(im).astype(int)
    bg = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]), axis=0)
    f = lambda e: float((np.abs(e - bg).max(axis=1) > tol).mean())
    return dict(top=f(a[0]), bottom=f(a[-1]), left=f(a[:, 0]), right=f(a[:, -1]))
TW = 250
files = sorted(glob.glob(d + '/*.webp')) or sorted(glob.glob(d + '/*.png'))
tiles = []
tmp = tempfile.mkdtemp()
for f in files:
    name = os.path.splitext(os.path.basename(f))[0]
    base = re.match(r'[a-z]+', name).group(0).rstrip('B') if not name.startswith('boatB') else 'boat'
    base = 'letter' if name.startswith('letter') else 'reply' if name.startswith('reply') else base
    base = next((k for k in ('shelfS', 'rimShort', 'rimLong', 'lip', 'sleepy', 'mat') if name.startswith(k)), base)
    raw = Image.open(f).convert('RGB')
    r = raw.resize((TW, round(raw.height * TW / raw.width)))
    png = os.path.join(tmp, name + '.png'); raw.save(png)
    cutp = os.path.join(tmp, name + '-cut.png')
    subprocess.run([sys.executable, '-I', 'tools/art/hfnext/cut.py', png, cutp, '1'], capture_output=True)
    side, L = GAME[base]
    g = Image.open(cutp).convert('RGBA')
    s = L / (g.width if side == 'w' else g.height); g = g.resize((max(1, round(g.width * s)), max(1, round(g.height * s))), Image.LANCZOS)
    gw = max(160, g.width + 40)
    T = Image.new('RGB', (TW + gw + 6, max(r.height, 150) + 16), (24, 24, 28))
    T.paste(r, (0, 16))
    G = Image.new('RGBA', (gw, 150), (52, 70, 78, 255)); dd = ImageDraw.Draw(G)
    dd.rectangle((6, 150 - 8 - 89, 14, 150 - 8), fill=(240, 200, 60, 255))
    G.alpha_composite(g, (24, 150 - 8 - g.height if g.height < 142 else 0))
    T.paste(G.convert('RGB'), (TW + 6, 16))
    ImageDraw.Draw(T).text((3, 2), name + '   (right: game size, yellow = Pokey 89 px)', fill=(255, 230, 90))
    cutoff = {k: v for k, v in frame_paint(raw).items() if v > 0.01}
    if cutoff:   # a red frame and the edges named: this take is cut off by its frame
        dr = ImageDraw.Draw(T); dr.rectangle((0, 0, T.width - 1, T.height - 1), outline=(230, 40, 40), width=4)
        dr.text((3, T.height - 14), 'FRAME EDGE: ' + ', '.join(f'{k} {v:.0%}' for k, v in cutoff.items()), fill=(255, 80, 80))
        print('FRAME EDGE', name, cutoff)
    tiles.append(T)
W = 1900; x = y = rh = 0; pos = []
for t in tiles:
    if x + t.width > W: x = 0; y += rh + 6; rh = 0
    pos.append((x, y)); x += t.width + 6; rh = max(rh, t.height)
S = Image.new('RGB', (W, y + rh), (10, 10, 12))
for t, p in zip(tiles, pos): S.paste(t, p)
S.save(out, quality=82); print(out, S.size, len(tiles), 'takes')
