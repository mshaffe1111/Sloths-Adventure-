"""Cut the clean-sweep batch (2026-10-29 evening, CLEAN-SWEEP S1, S2, S4) from its Hugging Face takes (spec-hfb-clean.json, starts
cleanstarts.py):
  deep-water.webp  World 2's deep river and the murky deep, each a 1024 take scaled to 512 (the game mirrors copies both ways, so no
                   seam shows) -> src/assets/props/deep-water.webp (deepWaterArt.ts)
  w6-water2.webp   the dirty water's chop variants: keyed off the magenta above the water, their left and right edge columns faded into
                   the original strip's so any variant meets any other with no seam; and the debris, keyed and trimmed
                   -> src/assets/props/w6-water2.webp with src/game/badWater2Data.ts
  rubble.webp      W9 obsidian lumps and W10 iron junk, keyed and trimmed -> src/assets/props/rubble.webp with src/game/rubbleData.ts
Then a review sheet of every piece on dark and mid-grey.
    python3 -I tools/art/hazard/cleancut.py <takes dir> <game checkout> <review.jpg> <picks.json>
picks.json: {"deep2": take, "deep6": take, "chop": [take, ...], "debris": [[take, cell], ...], "obsidian": [[take, cell], ...],
             "ironthorn": [[take, cell], ...]}
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'w6to10'))
from geminicut import cut_cell  # noqa: E402

TAKES, GAME, REVIEW, PICKS = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]), json.loads(Path(sys.argv[4]).read_text())


def take(n):
    return Image.open(TAKES / f'{n}.webp').convert('RGB')


def despill(sp):
    a = np.asarray(sp).astype(np.float32)
    ex = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1] - 4, 0, None) * (np.abs(a[..., 0] - a[..., 2]) < 50)
    a[..., 0] -= ex
    a[..., 2] -= ex
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def cell(n, c, size):
    im = take(n)
    cs = im.width // 4
    sp = despill(cut_cell(im.crop(((c % 4) * cs, (c // 4) * cs, (c % 4 + 1) * cs, (c // 4 + 1) * cs)), 'magenta', {}))
    a = np.asarray(sp)
    lab, k = ndimage.label(a[..., 3] > 60)
    if k > 1:
        sizes = ndimage.sum(np.ones(lab.shape), lab, range(1, k + 1))
        keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= max(200, sizes.max() * 0.08)])
        keep = ndimage.binary_dilation(keep, iterations=2)
        b = a.copy()
        b[..., 3] = (b[..., 3] * keep).astype(np.uint8)
        sp = Image.fromarray(b, 'RGBA')
    sp = sp.crop(sp.getchannel('A').getbbox())
    k = size / max(sp.size)
    return sp.resize((max(1, round(sp.width * k)), max(1, round(sp.height * k))), Image.LANCZOS)


def pack(pieces, W):
    x, y, rowh, frames = 0, 0, 0, []
    for p in pieces:
        if x + p.width > W:
            x, y, rowh = 0, y + rowh + 2, 0
        frames.append(dict(x=x, y=y, w=p.width, h=p.height))
        x += p.width + 2
        rowh = max(rowh, p.height)
    S = Image.new('RGBA', (W, y + rowh), (0, 0, 0, 0))
    for p, f in zip(pieces, frames):
        S.alpha_composite(p, (f['x'], f['y']))
    return S, frames


review = []
# deep water
D = Image.new('RGB', (1026, 512))
# (World 2's take paints stones along its bottom edge: cropped off, or the mirrored copies would set a row of stones mid-water)
d2 = np.asarray(take(PICKS['deep2']).crop((0, 0, 1024, 900))).astype(np.float32)
# (its light shafts, mirrored copy to copy, lined up into stripes. So: blurred along the current, which softens the shafts' edges and draws
# the specks into short streaks of drifting silt, and made seamless left to right by crossfading with a copy shifted half its width, so the
# game repeats it without mirroring it sideways; deepWaterArt.ts mirrors it top to bottom only)
# (first the shafts themselves: each column's own brightness, smoothed down its length, taken back to the mean)
colm = ndimage.gaussian_filter1d(d2, sigma=120, axis=0, mode='nearest')
d2 = d2 - (colm - ndimage.gaussian_filter1d(colm, sigma=200, axis=1, mode='wrap'))
d2 = ndimage.gaussian_filter1d(d2, sigma=7, axis=1, mode='wrap')
sh = np.roll(d2, d2.shape[1] // 2, axis=1)
wx = np.abs(np.linspace(-1, 1, d2.shape[1]))[None, :, None]
d2 = d2 * (1 - wx) + sh * wx
D.paste(Image.fromarray(np.clip(d2, 0, 255).astype(np.uint8)).resize((512, 512), Image.LANCZOS), (0, 0))
D.paste(take(PICKS['deep6']).resize((512, 512), Image.LANCZOS), (514, 0))
D.save(GAME / 'src/assets/props/deep-water.webp', 'WEBP', quality=88, method=6)
review.append(('deep water (each tiled 2x2, mirrored)', None))

# chop variants: keyed, then the edge columns faded to the original's
orig = Image.open(GAME / 'src/assets/props/w6-water.webp').convert('RGBA').crop((0, 0, 1024, 528))
oa = np.asarray(orig).astype(np.float32)
chops = []
for n in PICKS['chop']:
    v = despill(cut_cell(take(n), 'magenta', {})).resize((1024, 528), Image.LANCZOS)
    va = np.asarray(v).astype(np.float32)
    ramp = np.clip(np.minimum(np.arange(1024), 1023 - np.arange(1024)) / 96, 0, 1)[None, :, None]
    out = va * ramp + oa * (1 - ramp)
    # (the outline, the alpha, is the first strip's everywhere: the variants' crests sit where its crests are, and a blended outline smeared
    # the corners; and r and b brought down to g where the key bled pink onto the crests)
    out[..., 3] = oa[..., 3]
    ex = np.clip(np.minimum(out[..., 0], out[..., 2]) - out[..., 1], 0, None) * (np.abs(out[..., 0] - out[..., 2]) < 60)
    out[..., 0] -= ex
    out[..., 2] -= ex
    chops.append(Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGBA'))
debris = [cell(n, c, 240) for n, c in PICKS['debris']]
S2, f_debris = pack(debris, 1024)
W2 = Image.new('RGBA', (1024, 528 * len(chops) + 2 * len(chops) + S2.height), (0, 0, 0, 0))
f_chop = []
for i, c in enumerate(chops):
    W2.alpha_composite(c, (0, i * 530))
    f_chop.append(dict(x=0, y=i * 530, w=1024, h=528))
dy = 530 * len(chops)
W2.alpha_composite(S2, (0, dy))
for f in f_debris:
    f['y'] += dy
W2.save(GAME / 'src/assets/props/w6-water2.webp', 'WEBP', quality=88, method=6)
(GAME / 'src/game/badWater2Data.ts').write_text(
    '// generated by tools/art/hazard/cleancut.py (2026-10-29): the dirty water\'s painted variants in src/assets/props/w6-water2.webp\n'
    '// (Hugging Face img2img, spec-hfb-clean.json): more choppy strips (edges faded into the first strip\'s, so any meets any) and the\n'
    '// things riding the current\n'
    'export interface WaterFrame { x: number; y: number; w: number; h: number }\n'
    f'export const CHOP_VARIANTS: WaterFrame[] = {json.dumps(f_chop)};\n'
    f'export const DEBRIS: WaterFrame[] = {json.dumps(f_debris)};\n')

# rubble
ob = [cell(n, c, 120) for n, c in PICKS['obsidian']]
it = [cell(n, c, 140) for n, c in PICKS['ironthorn']]
SR, fr = pack(ob + it, 1024)
SR.save(GAME / 'src/assets/props/rubble.webp', 'WEBP', quality=90, method=6)
(GAME / 'src/game/rubbleData.ts').write_text(
    '// generated by tools/art/hazard/cleancut.py (2026-10-29): the painted ground clutter in src/assets/props/rubble.webp (Hugging Face\n'
    '// img2img, spec-hfb-clean.json): World 9\'s obsidian lumps and World 10\'s rusty iron junk, lying low (not spikes: they do not hurt)\n'
    'export interface RubbleFrame { x: number; y: number; w: number; h: number }\n'
    f'export const OBSIDIAN: RubbleFrame[] = {json.dumps(fr[:len(ob)])};\n'
    f'export const IRON_JUNK: RubbleFrame[] = {json.dumps(fr[len(ob):])};\n')

# review
deep = Image.open(GAME / 'src/assets/props/deep-water.webp').convert('RGB')
tiles = Image.new('RGB', (1024 * 2 + 20, 1024))
for k, (fx, fy) in enumerate(((0, 0), (1, 0), (0, 1), (1, 1))):
    for j in range(2):
        t = deep.crop((j * 514, 0, j * 514 + 512, 512))
        if fx: t = t.transpose(Image.FLIP_LEFT_RIGHT)
        if fy: t = t.transpose(Image.FLIP_TOP_BOTTOM)
        tiles.paste(t, (j * 1044 + fx * 512, fy * 512))
rows = [tiles.resize((1034, 512))]
for col in ((20, 16, 24), (128, 128, 128)):
    for S in (W2, SR):
        bg = Image.new('RGBA', S.size, col + (255,))
        bg.alpha_composite(S)
        k = 1034 / bg.width
        rows.append(bg.convert('RGB').resize((1034, round(bg.height * k))))
H = sum(r.height + 8 for r in rows)
R = Image.new('RGB', (1034, H), (24, 24, 24))
y = 0
for r in rows:
    R.paste(r, (0, y))
    y += r.height + 8
REVIEW.parent.mkdir(parents=True, exist_ok=True)
R.save(REVIEW, 'JPEG', quality=86)
print('chops', len(chops), 'debris', len(debris), 'obsidian', len(ob), 'iron', len(it), W2.size, SR.size)
