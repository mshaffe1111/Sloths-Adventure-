"""Cut and pack round 4 of the boss art batch (hf-art-bosses, 2026-10-29) from its takes (unpacked from carrier-r4-0.png):

  src/assets/lairs/fg-croc.webp       the Mire's foreground strip: the new hanging moss on top (fg-moss), the round-1 reeds below
  src/assets/bosses/boss-fx.webp      the effects atlas, repacked with the new pieces: rowboat, signNo, helmets, cattail0-1 (Crocus
  + src/game/bossFxData.ts            Rex's bank), pennant0-2 and pole (the Sky Sovereign's pennants), screech (her screech wave),
                                      weakRing (the weak-point ring every boss uses)
  reference/prop-sheets/qa-notes/hf-art-bosses/review-r4-*.jpg   every take and the picks, on dark and mid-grey

The pieces already in the atlas are lifted back out of it as they are (bossFxData.ts), so nothing from rounds 1-3 is re-cut. Run it
after bosscut.py (which writes the round-1 strip whose reed band it keeps), never twice in a row on its own output.
    python3 -I tools/art/hfbosses/bosscut4.py <takes dir> <game checkout>
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
TAKES, GAME = Path(sys.argv[1]), Path(sys.argv[2])
sys.argv = [sys.argv[0], str(TAKES), str(GAME)]
from bosscut_lib import cut, keyness, review, QA  # noqa: E402


def take(name):
    return Image.open(TAKES / f'{name}.webp').convert('RGB')


# ───── every take, side by side (the review of the round) ─────
for grp in ('fg-moss', 'croc-props', 'fx3'):
    names = sorted(p.stem for p in TAKES.glob(f'{grp}-s*.webp'))
    ims = [take(n) for n in names]
    s = 900 / ims[0].width
    th = round(ims[0].height * s)
    S = Image.new('RGB', (2 * 904, ((len(ims) + 1) // 2) * (th + 22)), (30, 30, 30))
    d = ImageDraw.Draw(S)
    for i, (n, im) in enumerate(zip(names, ims)):
        x, y = (i % 2) * 904, (i // 2) * (th + 22)
        S.paste(im.resize((900, th), Image.LANCZOS), (x, y + 20))
        d.text((x + 4, y + 4), n, fill=(255, 230, 0))
    S.save(QA / f'review-r4-takes-{grp}.jpg', quality=84)

# ───── the moss: keyed, squashed to 288 rows, over the round-1 strip's reed band ─────
MOSS = 'fg-moss-s70-23'
im = take(MOSS)
moss = cut(im, 'magenta', crumbs=30, trim=False).resize((2048, 288), Image.LANCZOS)
# (the grey strands took a lilac cast from the key: re-grade every pixel to the Mire's grey-green by its own lightness)
a = np.asarray(moss).astype(np.float32)
L = a[..., :3].mean(axis=2)
a[..., 0], a[..., 1], a[..., 2] = L * 0.84, L * 1.02, L * 0.9
moss = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')
old = Image.open(GAME / 'src/assets/lairs/fg-croc.webp').convert('RGBA')
reeds = old.crop((0, round(old.height * 0.45), old.width, old.height))
fg = Image.new('RGBA', (2048, 288 + reeds.height), (0, 0, 0, 0))
fg.alpha_composite(moss, (0, 0))
fg.alpha_composite(reeds, (0, 288))
fg.save(GAME / 'src/assets/lairs/fg-croc.webp', 'WEBP', quality=86, method=6)
print('fg-croc', fg.size, 'split', round(288 / fg.height, 4), (GAME / 'src/assets/lairs/fg-croc.webp').stat().st_size)

# ───── the new pieces: (name, take, box, options, the widest it is kept) ─────
NEW = [
    ('rowboat', 'croc-props-s75-7', (0, 0, 1024, 540), {'mainOnly': True}, 420),
    ('signNo', 'croc-props-s75-7', (1024, 0, 1700, 540), {'mainOnly': True}, 220),
    ('helmets', 'croc-props-s75-7', (0, 560, 1024, 1024), {'crumbs': 400}, 440),
    ('cattail0', 'croc-props-s75-7', (1024, 560, 1540, 1024), {'crumbs': 200}, 280),
    ('cattail1', 'croc-props-s75-7', (1540, 560, 2048, 1024), {'crumbs': 200}, 280),
    ('pennant0', 'fx3-s72-7', (0, 0, 610, 340), {'mainOnly': True}, 300),
    ('pennant1', 'fx3-s72-7', (610, 0, 1225, 340), {'mainOnly': True}, 300),
    ('pennant2', 'fx3-s72-7', (1225, 0, 1880, 340), {'mainOnly': True}, 300),
    ('pole', 'fx3-s72-7', (1880, 0, 2048, 1024), {'mainOnly': True}, 40),
    ('screech', 'fx3-s72-7', (0, 340, 1640, 600), {'mainOnly': True}, 900),
    ('weakRing', 'fx3-s85-23', (480, 570, 1040, 1024), {'mainOnly': True}, 260),
]
def grade(name, p):
    a = np.asarray(p).astype(np.float32)
    if name == 'rowboat':
        # (the start's mud block came through as a flat slab: cut the boat off where the slab starts, so it sinks into the floor)
        full = (a[..., 3] > 128).mean(axis=1) > 0.88
        rows = np.nonzero(full)[0]
        if len(rows):
            return p.crop((0, 0, p.width, int(rows[0]) + 3))
    if name == 'weakRing':
        # (its glow took a pink cast: back to gold)
        a[..., 1] = np.maximum(a[..., 1], a[..., 0] * 0.78)
        a[..., 2] = np.minimum(a[..., 2], a[..., 1] * 0.55)
    if name == 'screech':
        # (a grey core: everything to pale cyan-white by its lightness, the dark parts fading out so it reads as light and air)
        L = a[..., :3].max(axis=2)
        a[..., 0], a[..., 1], a[..., 2] = L * 0.86, L * 0.98, L * 1.05
        a[..., 3] *= np.clip((L - 60) / 150, 0, 1)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


new = []
for name, src, box, opts, mw in NEW:
    p = grade(name, cut(take(src), 'magenta', box, **opts))
    if p.width > mw:
        p = p.resize((mw, max(1, round(p.height * mw / p.width))), Image.LANCZOS)
    new.append((name, p))
    print(name, p.size)

# ───── the pieces already in the atlas, lifted back out ─────
data = (GAME / 'src/game/bossFxData.ts').read_text()
frames0 = json.loads(re.search(r'BOSS_FX: Record<string, FxFrame> = (\{.*\});', data).group(1))
atlas0 = Image.open(GAME / 'src/assets/bosses/boss-fx.webp').convert('RGBA')
names_new = {n for n, _ in new}
packed = [(n, atlas0.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))) for n, f in frames0.items() if n not in names_new] + new

# shelf pack, 2048 wide (as bosscut.py)
W = 2048
x = y = rowh = 0
frames = {}
for name, p in sorted(packed, key=lambda t: -t[1].height):
    if x + p.width > W:
        x, y, rowh = 0, y + rowh + 4, 0
    frames[name] = {'x': x, 'y': y, 'w': p.width, 'h': p.height}
    x += p.width + 4
    rowh = max(rowh, p.height)
H = y + rowh
atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for name, p in packed:
    f = frames[name]
    atlas.paste(p, (f['x'], f['y']))
out = GAME / 'src/assets/bosses'
atlas.save(out / 'boss-fx.webp', 'WEBP', quality=88, method=6)
(out / 'boss-fx.json').write_text(json.dumps(frames, indent=0))
(GAME / 'src/game/bossFxData.ts').write_text(
    '// generated by tools/art/hfbosses/bosscut.py and bosscut4.py (2026-10-29): where each painted boss effect and lair prop sits in\n'
    '// src/assets/bosses/boss-fx.webp (Hugging Face img2img takes with the style model; the picks and boxes are in the scripts)\n'
    'export interface FxFrame { x: number; y: number; w: number; h: number }\n'
    f'export const BOSS_FX_SIZE = {{ w: {W}, h: {H} }};\n'
    'export const BOSS_FX: Record<string, FxFrame> = ' + json.dumps(frames, separators=(',', ':')) + ';\n')
print('atlas', atlas.size, (out / 'boss-fx.webp').stat().st_size)
review('r4-pieces', new)
review('r4-fg', [('fg-croc (new moss over the round-1 reeds)', fg)], game_h=200)
