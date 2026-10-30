"""Pokey with the jar of fireflies for 8-4 Lantern Run (2026-10-29): key the Hugging Face picks (round 2: his carry poses repainted with
the jar in his paws) off the magenta, scale them all by one factor so the standing hug is as tall as his standard idle frame (205 atlas
px: heroStandardData.ts, so they draw at his usual size), and pack src/assets/w8/pokey-jar.webp with POKEY_JAR_FRAMES (StdFrame: feet
anchor ax, ay; torso middle hx) appended to src/game/w8LanternAtlas.ts. Then the review sheet: each frame on dark and mid-grey, at
packed size and at about phone size, with the standard idle beside them for size and colour.
    python3 -I tools/art/hfbatch/lanternhero.py <takes dir> <review.jpg> hold=<take> walk_0=<take> ... air=<take>
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'w6to10'))
from geminicut import cut_cell  # noqa: E402

ROOT = Path(__file__).resolve().parents[3]
TAKES, REVIEW = Path(sys.argv[1]), Path(sys.argv[2])
picks = [a.split('=') for a in sys.argv[3:]]
# how much wider than painted the jar frames from the carry poses are packed (2026-10-30: matches the standard idle's girth; the tuck
# is painted from his standard frame already)
WIDEN = 1.2


def cut(stem):
    sp = cut_cell(Image.open(TAKES / f'{stem}.webp').convert('RGB'), 'magenta', {})
    a = np.asarray(sp).astype(np.float32)
    # (only the biggest piece: stray sparkles the model painted round him go)
    lab, n = ndimage.label(a[..., 3] > 40)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        keep = 1 + int(np.argmax(sizes))
        a[..., 3] *= ndimage.binary_dilation(lab == keep, iterations=2)
    band = ndimage.binary_dilation(a[..., 3] < 128, iterations=4) & (a[..., 3] > 0)
    ex = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1] - 6, 0, None) * band
    a[..., 0] -= ex
    a[..., 2] -= ex
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


cuts = {name: cut(stem) for name, stem in picks}
# (the carry poses came out a darker, redder brown than his standard frames: match each to the standard idle's colours, channel by
# channel over the painted pixels, so nothing pops when the game switches between a jar frame and a standard one (a swing, a climb))
ref = np.asarray(Image.open(ROOT / 'src/assets/hero/hero-standard.webp').convert('RGBA').crop((674, 478, 674 + 127, 478 + 209))).astype(np.float32)
rm = ref[..., 3] > 200
for name, im in cuts.items():
    a = np.asarray(im).astype(np.float32)
    m = a[..., 3] > 200
    for c in range(3):
        mu, sd = a[..., c][m].mean(), a[..., c][m].std() + 1e-3
        a[..., c] = (a[..., c] - mu) / sd * ref[..., c][rm].std() + ref[..., c][rm].mean()
    cuts[name] = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')
hold = cuts['hold']
k = 205 / hold.crop(hold.getchannel('A').getbbox()).height
cells = []
for name, im in cuts.items():
    bb = im.getchannel('A').getbbox()
    im = im.crop(bb)
    # (widened: the carry poses are a slimmer sloth than his standard set, about 0.72 of its girth below the jar and 0.83 at the head;
    # the lead's review asked for his standard build)
    im = im.resize((round(im.width * k * (1 if name == 'tuck' else WIDEN)), round(im.height * k)), Image.LANCZOS)
    a = np.asarray(im)[..., 3]
    # feet: the middle of the lowest 8% of the picture's painted pixels
    rows = np.nonzero(a.max(axis=1) > 60)[0]
    low = a[rows[-1] - max(2, round(0.08 * im.height)):rows[-1] + 1]
    xs = np.nonzero(low.max(axis=0) > 60)[0]
    ax = float((xs.min() + xs.max()) / 2)
    mid = a[round(im.height * 0.45):round(im.height * 0.6)]
    xm = np.nonzero(mid.max(axis=0) > 60)[0]
    hx = float((xm.min() + xm.max()) / 2)
    cells.append((name, im, ax, float(rows[-1]), hx))
W = sum(c[1].width + 4 for c in cells)
H = max(c[1].height for c in cells)
sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
frames = {}
x = 0
for name, im, ax, ay, hx in cells:
    sheet.alpha_composite(im, (x, 0))
    frames[name] = {'x': x, 'y': 0, 'w': im.width, 'h': im.height, 'ax': round(ax, 1), 'ay': round(ay, 1), 'hx': round(hx, 1)}
    x += im.width + 4
out = ROOT / 'src/assets/w8/pokey-jar.webp'
sheet.save(out, 'WEBP', quality=90, method=6)
ts = ROOT / 'src/game/w8LanternAtlas.ts'
src = ts.read_text()
src = re.sub(r"\n/\*\* Pokey with the jar.*", '', src, flags=re.S)
src += ('\n/** Pokey with the jar (tools/art/hfbatch/lanternhero.py): src/assets/w8/pokey-jar.webp, as heroStandardData.ts StdFrame (feet ax, ay; '
        'torso hx), at the standard frames\' scale */\n'
        f'export const POKEY_JAR_FRAMES: Record<string, {{ x: number; y: number; w: number; h: number; ax: number; ay: number; hx: number }}> = {json.dumps(frames)};\n')
ts.write_text(src)
print(out, sheet.size, out.stat().st_size, round(k, 3))

# the review
std = Image.open(ROOT / 'src/assets/hero/hero-standard.webp').convert('RGBA').crop((674, 478, 674 + 127, 478 + 209))
row_items = [('standard idle', std)] + [(n, im) for n, im, *_ in cells]
tw = sum(im.width + 16 for _, im in row_items)
R = Image.new('RGB', (tw, 3 * (H + 30) + 20), (24, 24, 24))
d = ImageDraw.Draw(R)
for r, col in enumerate(((20, 16, 24), (128, 128, 128))):
    xx = 0
    for n, im in row_items:
        bg = Image.new('RGBA', im.size, col + (255,))
        bg.alpha_composite(im)
        R.paste(bg.convert('RGB'), (xx, r * (H + 30) + 24 + H - im.height))
        d.text((xx + 2, r * (H + 30) + 4), n, fill=(255, 230, 0))
        xx += im.width + 16
xx = 0
for n, im in row_items:
    sm = im.resize((max(1, im.width // 2), max(1, im.height // 2)), Image.LANCZOS)
    bg = Image.new('RGBA', sm.size, (20, 16, 24, 255))
    bg.alpha_composite(sm)
    R.paste(bg.convert('RGB'), (xx, 2 * (H + 30) + 24))
    xx += im.width + 16
REVIEW.parent.mkdir(parents=True, exist_ok=True)
R.save(REVIEW, 'JPEG', quality=88)
print(REVIEW)
