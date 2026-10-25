"""The game-look training set: every kind of painted art the game has, each with a plain caption of what is in it (no character
trigger words, so the model learns how the game is painted rather than who is in it).

  python3 build.py        -> items/NNNN.png (+ .txt), small ones listed in small.txt for upscaling
"""
import json, random, re
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

S = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[1]))
G = Path((str(__import__('pathlib').Path(__file__).resolve().parents[3]) + '/src'))
A = G / 'assets'
OUT = S / 'style/items'
OUT.mkdir(parents=True, exist_ok=True)
TRIG = 'slothadv style, painted storybook illustration'
GREY = (127, 127, 127)
random.seed(7)
items = []  # (image RGBA or RGB, caption, kind)


def sprite(desc):
    return f'{TRIG}, {desc}, plain grey background'


def pick(lst, n):
    if len(lst) <= n:
        return list(lst)
    step = len(lst) / n
    return [lst[int(i * step)] for i in range(n)]


def components(path, n, min_frac=0.15):
    """the separate pieces of a packed atlas (by its transparency), biggest kept, n spread through it"""
    im = Image.open(path).convert('RGBA')
    a = np.asarray(im)[..., 3] > 16
    lab, k = ndimage.label(ndimage.binary_dilation(a, iterations=1))
    objs = ndimage.find_objects(lab)
    sizes = ndimage.sum(a, lab, range(1, k + 1))
    big = sizes.max()
    keep = [(objs[i], sizes[i]) for i in range(k) if sizes[i] > big * min_frac]
    keep.sort(key=lambda t: (t[0][0].start // 40, t[0][1].start))
    out = []
    for sl, _ in pick(keep, n):
        out.append(im.crop((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop)))
    return out


def frames_from(ts, path):
    """named pieces from a generated *Data.ts file: name: { x, y, w, h }"""
    im = Image.open(path).convert('RGBA')
    src = ts.read_text()
    out = {}
    for m in re.finditer(r'"?(\w+)"?: \{\s*"?x"?: (\d+), "?y"?: (\d+), "?w"?: (\d+), "?h"?: (\d+)', src):
        n, x, y, w, h = m.group(1), *map(int, m.groups()[1:])
        out[n] = im.crop((x, y, x + w, y + h))
    return out


def words(name):
    name = re.sub(r'\d+$', '', name)
    return re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', name).lower()


# ── the characters, from their training sets (trigger word dropped, description kept) ──
def from_set(folder, n, desc=None):
    fs = sorted(Path(folder).glob('*.png'))
    for f in pick(fs, n):
        cap = f.with_suffix('.txt').read_text().strip()
        parts = [p.strip() for p in cap.split(',')]
        body = parts[1:]
        if desc:
            body = [desc] + body
        body = [p for p in body if p not in ('painted storybook illustration', 'plain grey background')]
        items.append((Image.open(f), sprite(', '.join(body)), 'char'))


from_set(S / 'train/ds', 30, 'a friendly young brown three-toed sloth with a big smile, a leather satchel strap across his chest and wrist wraps')
from_set(S / 'chars/meeca/ds', 18)
from_set(S / 'chars/dot/ds', 18)
from_set(S / 'chars/general/ds', 14)
for b in ['venom', 'croc', 'prowler', 'sovereign', 'queen', 'reaver', 'golem', 'monarch', 'drake', 'ironclaw', 'thornbark']:
    from_set(S / f'chars/{b}/raw', 10)

# ── the creatures met along the way ──
CREATURES = {
    'boa-atlas': ('a sandy-tan boa constrictor snake with brown blotches', 7),
    'caiman-atlas': ('an olive-green caiman crocodile', 7),
    'eagle-atlas': ('a dark navy-blue eagle with an orange hooked beak, flying', 8),
    'frog-atlas': ('a bright blue poison dart frog', 7),
    'guard-atlas': ('a snapping turtle standing upright like a royal guard, holding a reed spear', 7),
    'harpy-atlas': ('a dark blue harpy eagle with a pale grey crested head', 7),
    'jaguar-atlas': ('a golden spotted jaguar', 8),
    'ocelot-atlas': ('a small spotted ocelot cat', 8),
    'spider-atlas': ('a round teal and orange jungle spider', 6),
    'tayra-atlas': ('a dark brown tayra, a long sleek weasel-like animal', 8),
    'turtle-atlas': ('a green snapping turtle with a ridged shell', 7),
    'venom2-atlas': ('a huge emerald-green tree boa with a pale belly and a small gold crown', 6),
}
for f, (desc, n) in CREATURES.items():
    for c in components(A / f'enemies/{f}.webp', n):
        items.append((c, sprite(desc), 'creature'))
for f, mood in [('goldsnake-head', 'looking curious'), ('goldsnake-sleep', 'asleep with its eyes closed'), ('goldsnake-wake', 'smiling, waking up')]:
    items.append((Image.open(A / f'enemies/{f}.webp').convert('RGBA'), sprite(f'the head of a golden horned snake with big shiny eyes, {mood}'), 'creature'))

# ── plants, birds, butterflies, the heartbloom ──
for f, desc, n in [('birds-atlas', 'a small colourful rainforest bird', 10), ('butterflies-atlas', 'a bright tropical butterfly', 6),
                   ('flowers-atlas', 'a tropical rainforest flower', 12), ('leaves-atlas', 'a cluster of jungle leaves', 6),
                   ('plants-atlas', 'a leafy rainforest plant', 10)]:
    for c in components(A / f'flora/{f}.webp', n):
        items.append((c, sprite(desc), 'flora'))
for f, desc in [('heartbloom-bud', 'a magical heart-shaped crimson flower bud'), ('heartbloom-bloom', 'a magical glowing crimson flower in bloom'),
                ('heartbloom-epic', 'a magical glowing pink lotus flower with sparkles'), ('heartbloom-ultimate', 'a magical glowing crimson and gold lotus flower')]:
    items.append((Image.open(A / f'flora/{f}.webp').convert('RGBA'), sprite(desc), 'flora'))

# ── platform pieces of each world, and the props ──
WORLDS = ['Emerald Canopy', 'Sunlit Riverbank', 'Mossy Grotto', 'Mist Cascades', 'Orchid Sanctuary', 'Deep Mangrove', 'Ancient Ruins',
          'Twilight Treetops', 'Volcanic Jungle', 'Stormy Highlands Fortress']
for w in range(2, 11):
    for c in components(A / f'kits/w{w}.webp', 6, 0.08):
        items.append((c, sprite(f'a platform piece for a side-scrolling game, {WORLDS[w - 1].lower()} style'), 'kit'))
OVER = {'capyHappy': 'a happy capybara', 'capySad': 'a sad capybara', 'duckHappy': 'a happy duck', 'duckSad': 'a sad duck', 'otterHappy': 'a happy otter',
        'otterSad': 'a sad otter', 'cageA': 'a woven reed cage', 'cageB': 'a woven reed cage', 'cageC': 'a woven reed cage', 'catEyes': 'glowing amber cat eyes in the dark',
        'ringWall': 'a low scratched limestone rock', 'pawStrip': 'a strip of pale mud with big pawprints', 'glowLit': 'a glowing glowworm on a silk thread',
        'glowDim': 'a dim glowworm on a silk thread', 'clawRock': 'a boulder with claw scratches', 'thorn': 'a thorny hanging vine with a bud head'}
seen = set()
for ts, atlas, n in [(G / 'game/w2PropsData.ts', A / 'props/w2-props.webp', 40), (G / 'game/w3PropsData.ts', A / 'props/w3-props.webp', 40),
                     (G / 'game/protoAtlasData.ts', A / 'proto/props-atlas.webp', 20), (G / 'game/proto2AtlasData.ts', A / 'proto/props2-atlas.webp', 10),
                     (G / 'game/proto3AtlasData.ts', A / 'proto/props3-atlas.webp', 10)]:
    for name, im in frames_from(ts, atlas).items():
        key = re.sub(r'\d+$', '', name)
        if key in seen and not name.startswith(('glow', 'thorn')):
            continue
        if name.startswith(('glowHang', 'glowWave', 'glowSleep')) or (name.startswith('thorn') and name not in ('thorn0', 'thorn9', 'thorn13')):
            continue
        seen.add(key)
        if im.width * im.height < 900:
            continue
        items.append((im, sprite(OVER.get(name, OVER.get(key, f'a {words(name)}, a game prop'))), 'prop'))
items.append((Image.open(A / 'proto/crown.webp').convert('RGBA'), sprite('a huge mossy treetop platform of tangled branches'), 'prop'))

# ── backdrops: each painted layer cut into two wide frames ──
LAYER = {'far': 'the far background layer, sky and distant scenery', 'mid': 'the middle background layer', 'near': 'the near foreground layer of plants'}
for w in range(1, 11):
    for layer in ['far', 'mid', 'near']:
        im = Image.open(A / f'backdrops/w{w}-{layer}.webp').convert('RGBA')
        W, H = im.size
        cw = min(W, round(H * 16 / 9))
        for k, x in enumerate([0, max(0, W - cw)] if W > cw * 1.3 else [0]):
            items.append((im.crop((x, 0, x + cw, H)), f'{TRIG}, a wide side-scrolling game background, {LAYER[layer]}, {WORLDS[w - 1].lower()}', 'backdrop'))
items.append((Image.open(A / 'backdrops/hollow.webp').convert('RGBA'), f'{TRIG}, a wide background, inside a giant hollow strangler fig tree glowing with mushrooms', 'backdrop'))
items.append((Image.open(A / 'lairs/prowler-lair.webp').convert('RGBA'), f'{TRIG}, a wide background, a huge cave lit by giant glowing mushrooms in pink, cyan, amber and violet, two shafts of moonlight landing on the floor', 'backdrop'))

# ── the story pictures ──
for f in sorted((A / 'story/plates').glob('*.webp')):
    items.append((Image.open(f).convert('RGBA'), f'{TRIG}, a story scene, {words(f.stem.replace("-", " "))}, no characters', 'story'))
for f in sorted((A / 'story').glob('castle*.webp')):
    items.append((Image.open(f).convert('RGBA'), f'{TRIG}, a story scene, a stormy stone fortress on a jungle mountain', 'story'))

# ── write ──
small = []
counts = {}
for i, (im, cap, kind) in enumerate(items):
    opaque = im.mode == 'RGB' or im.convert('RGBA').getchannel('A').getextrema()[0] > 250
    im = im.convert('RGBA')
    if kind not in ('backdrop', 'story') and not opaque:
        # a cutout on flat grey with room around it
        bb = im.getchannel('A').point(lambda v: 255 if v > 16 else 0).getbbox()
        if bb:
            im = im.crop(bb)
        pad = round(max(im.size) * 0.12) + 8
        bg = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), GREY + (255,))
        bg.alpha_composite(im, (pad, pad))
        im = bg
    else:
        bg = Image.new('RGBA', im.size, GREY + (255,))
        bg.alpha_composite(im)
        im = bg
    im = im.convert('RGB')
    if max(im.size) > 1344:
        s = 1344 / max(im.size)
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    p = OUT / f'{i:04d}.png'
    im.save(p)
    p.with_suffix('.txt').write_text(cap)
    if max(im.size) < 640:
        small.append(p.name)
    counts[kind] = counts.get(kind, 0) + 1
(S / 'style/small.txt').write_text('\n'.join(small))
print(len(items), counts, 'small', len(small))
