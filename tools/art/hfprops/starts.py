"""Start canvases for the hf-props batches (2026-10-31, branch hf-props): new set dressing for Worlds 1-7 (AUDIT.md).

    python3 tools/art/hfprops/starts.py [worlds...]

One 1536x1024 canvas per world, a 4 x 3 grid of 384 x 341 cells, so one img2img pass paints the whole world's new dressing in the same
light. Cells 0-1 hold two of the world's own approved pieces (anchors: they hold the batch to the world's palette, ink line and light;
thrown away at the cut). Cells 2-11 hold a rough flat shape in each new piece's main colours, which the model paints into the piece the
prompt names for that cell. Key: magenta, or green for World 5 (its pieces are pink). Writes
reference/prop-sheets/qa-notes/hf-props/starts/w<N>.png and cells.json ({canvas: {key, size, cells: {name: [x, y, w, h]}}}).
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SRC = ROOT / 'src'
OUT = ROOT / 'reference/prop-sheets/qa-notes/hf-props/starts'
MAG, GRN = (255, 0, 255), (0, 255, 0)
CW, CH = 384, 341


def dress(n):
    t = (SRC / 'game/dressAtlasData.ts').read_text()
    d = json.loads(t[t.index('= {') + 2:t.index('} satisfies') + 1])[n]
    return Image.open(SRC / 'assets/props/dress.webp').convert('RGBA').crop((d['x'], d['y'], d['x'] + d['w'], d['y'] + d['h']))


def made(sheet, n):
    j = json.loads((SRC / f'assets/w6to10/props-made/{sheet}.json').read_text())['frames'][n]
    return Image.open(SRC / f'assets/w6to10/props-made/{sheet}.webp').convert('RGBA').crop((j['x'], j['y'], j['x'] + j['w'], j['y'] + j['h']))


def atlas(img, data, n):
    t = (SRC / 'game' / data).read_text()
    import re
    m = re.search(r"['\"]?" + n + r"['\"]?\s*:\s*\{\s*['\"]?x['\"]?\s*:\s*(\d+)\s*,\s*['\"]?y['\"]?\s*:\s*(\d+)\s*,\s*['\"]?w['\"]?\s*:\s*(\d+)\s*,\s*['\"]?h['\"]?\s*:\s*(\d+)", t)
    x, y, w, h = map(int, m.groups())
    return Image.open(SRC / img).convert('RGBA').crop((x, y, x + w, y + h))


# (name, shape, fill, accent, prompt words for the cell)
# shapes: mound (sits on the ground), tall, wide (low and long), hang (hangs from the top of its cell), small (a little thing on the ground)
W = {
    1: dict(key=MAG, anchors=[lambda: dress('w1Stump'), lambda: dress('w1Fern')],
            look='a sunny rainforest canopy trail, warm bark browns, mossy yellow-greens',
            pieces=[('bromeliad', 'mound', (70, 120, 40), (200, 40, 40), 'a clump of bromeliads with a red flower spike'),
                    ('mossBoulder', 'mound', (110, 115, 90), (90, 140, 40), 'a mossy boulder with little orange mushrooms'),
                    ('termites', 'tall', (130, 90, 55), (100, 70, 40), 'a tall earthy termite mound'),
                    ('orchidHang', 'hang', (90, 130, 50), (250, 240, 200), 'a spray of white and yellow orchids hanging from a root'),
                    ('nestHang', 'hang', (120, 85, 50), (150, 110, 70), 'a small woven bird nest hanging on a vine'),
                    ('leafLitter', 'wide', (160, 100, 40), (120, 70, 30), 'a low pile of fallen orange and brown leaves'),
                    ('seedPods', 'small', (120, 80, 45), (90, 60, 30), 'three big brown seed pods'),
                    ('snail', 'small', (170, 120, 60), (90, 130, 50), 'a snail with a striped shell on a mossy twig'),
                    ('toucan', 'tall', (30, 30, 30), (250, 150, 20), 'a toucan with a big orange beak perched on a short stump'),
                    ('trailPost', 'tall', (140, 100, 60), (90, 130, 50), 'a carved wooden trail marker post with a leaf carved on it')]),
    2: dict(key=MAG, anchors=[lambda: dress('w2Log'), lambda: dress('w2ReedTall')],
            look='a riverside fishing village, weathered grey-brown wood, tan rope, olive reeds',
            pieces=[('heron', 'tall', (100, 115, 135), (220, 200, 90), 'a blue-grey heron standing on one leg'),
                    ('driftwood', 'wide', (150, 135, 115), (120, 105, 90), 'a pile of silver-grey driftwood'),
                    ('cattailFly', 'tall', (100, 110, 50), (60, 140, 200), 'a cattail clump with a blue dragonfly resting on it'),
                    ('mossDrip', 'hang', (90, 120, 60), (70, 100, 50), 'long dripping river moss hanging down'),
                    ('basketHang', 'hang', (170, 130, 80), (140, 100, 60), 'a woven fishing basket hanging from a rope'),
                    ('crab', 'small', (210, 90, 40), (170, 60, 30), 'a little orange river crab'),
                    ('ropeCoil', 'small', (190, 160, 110), (150, 120, 80), 'a coil of tan rope'),
                    ('shells', 'small', (220, 200, 170), (180, 150, 120), 'a few river clam shells and pebbles'),
                    ('raft', 'wide', (140, 110, 70), (180, 160, 110), 'a small beached raft of lashed logs'),
                    ('frog', 'small', (80, 150, 60), (60, 110, 40), 'a little green frog sitting on a flat stone')]),
    3: dict(key=MAG, anchors=[lambda: made_kit(3, 'boulder'),
                              lambda: made_kit(3, 'stump')],
            look='an underground glowworm grotto, evenly lit cool grey-green stone, deep moss greens, teal glow',
            pieces=[('crystals', 'mound', (60, 170, 180), (150, 240, 240), 'a cluster of glowing teal crystals'),
                    ('rootBoulder', 'mound', (100, 110, 105), (110, 80, 50), 'a grey boulder wrapped in old roots'),
                    ('glowStone', 'mound', (90, 100, 100), (150, 230, 200), 'a mossy stone with glowing green glowworm lights on it'),
                    ('rootGlow', 'hang', (100, 75, 50), (150, 230, 200), 'a tangle of roots hanging down with tiny glowing tips'),
                    ('crystalDrip', 'hang', (90, 110, 115), (150, 240, 240), 'a dripping stalactite with little teal crystals'),
                    ('fossil', 'small', (150, 145, 130), (110, 100, 90), 'a flat stone with a spiral fossil shell in it'),
                    ('glowShrooms', 'small', (90, 100, 90), (190, 150, 240), 'small glowing purple mushrooms on pebbles'),
                    ('oldNest', 'wide', (120, 95, 65), (90, 70, 50), 'an old empty nest of twigs in a rock niche'),
                    ('salamander', 'small', (220, 120, 50), (60, 50, 40), 'a spotted orange cave salamander on a rock'),
                    ('moonMoss', 'wide', (80, 120, 90), (150, 230, 200), 'a low mat of glowing moss on stones')]),
    4: dict(key=MAG, anchors=[lambda: made_kit(4, 'boulder'), lambda: made_kit(4, 'stump')],
            look='high misty waterfall cliffs, slate blue-greys, moss greens, slightly warm light',
            pieces=[('cairn', 'tall', (110, 120, 130), (90, 100, 110), 'a stacked cairn of flat slate stones'),
                    ('windShrub', 'mound', (80, 110, 60), (110, 90, 70), 'a small wind-bent mountain shrub'),
                    ('feather', 'tall', (120, 100, 80), (230, 225, 210), 'a big eagle feather stuck upright in a crack in a rock'),
                    ('ivyHang', 'hang', (70, 110, 60), (90, 140, 70), 'a curtain of cliff ivy hanging down'),
                    ('dripRoots', 'hang', (110, 90, 70), (90, 140, 70), 'mossy roots dripping water hanging down'),
                    ('slateChips', 'wide', (110, 125, 140), (90, 100, 115), 'scattered broken slate chips'),
                    ('mtnFlowers', 'small', (80, 120, 60), (90, 120, 220), 'a clump of little blue and yellow mountain flowers'),
                    ('mossStones', 'small', (120, 130, 130), (100, 140, 60), 'two round stones with moss caps'),
                    ('eggNest', 'wide', (140, 110, 70), (170, 210, 220), 'a nest of twigs with three pale blue eggs'),
                    ('lizard', 'small', (100, 140, 70), (70, 100, 50), 'a little green lizard basking on a slate rock')]),
    5: dict(key=GRN, anchors=[lambda: made('w5a', 'orchids'), lambda: made('w5a', 'bromeliad')],
            look="an orchid garden with a tea party, soft pinks, lilac, cream china, mossy greens",
            pieces=[('wateringCan', 'mound', (150, 160, 170), (120, 130, 140), 'an old tin watering can'),
                    ('pots', 'tall', (190, 110, 80), (230, 160, 200), 'stacked clay plant pots with a pink orchid'),
                    ('spool', 'small', (180, 140, 100), (240, 235, 225), 'a wooden spool wound with white silk thread'),
                    ('cocoons', 'hang', (230, 225, 210), (200, 190, 170), 'three silk cocoons hanging on threads'),
                    ('lanterns', 'hang', (240, 200, 150), (200, 120, 160), 'a string of little paper lanterns'),
                    ('teacups', 'small', (240, 235, 230), (220, 130, 170), 'two china teacups and a saucer with pink roses'),
                    ('sugar', 'small', (240, 240, 235), (190, 190, 200), 'sugar cubes and a silver teaspoon'),
                    ('petals', 'wide', (230, 160, 200), (250, 220, 235), 'a drift of fallen orchid petals'),
                    ('bench', 'wide', (150, 110, 80), (120, 85, 60), 'a tiny wooden garden bench'),
                    ('caterpillar', 'small', (160, 200, 80), (250, 200, 60), 'a sleepy caterpillar on a leaf')]),
    6: dict(key=MAG, anchors=[lambda: made('w6c', 'cattails'), lambda: made('w6c', 'mooring-post')],
            look='a deep dim mangrove swamp, dark wet roots, olive greens, misty light',
            pieces=[('oysterRoot', 'mound', (90, 70, 55), (200, 195, 180), 'a mangrove root crusted with pale oysters'),
                    ('fiddler', 'small', (60, 70, 120), (230, 120, 40), 'a fiddler crab with one big orange claw'),
                    ('pitchers', 'tall', (110, 140, 60), (170, 60, 70), 'a clump of pitcher plants'),
                    ('orchidSpray', 'hang', (80, 110, 50), (240, 230, 240), 'a spray of pale swamp orchids hanging from a root'),
                    ('dripVine', 'hang', (70, 90, 50), (110, 140, 70), 'a dripping vine with aerial roots hanging down'),
                    ('pods', 'small', (100, 120, 50), (80, 70, 40), 'long green mangrove seed pods'),
                    ('shells', 'small', (210, 200, 180), (170, 150, 130), 'a few shells and snails on the mud'),
                    ('floats', 'wide', (180, 140, 90), (200, 80, 50), 'old net floats tied on a frayed rope'),
                    ('kingfisher', 'tall', (40, 120, 170), (220, 120, 50), 'a kingfisher perched on a root post'),
                    ('mudskipper', 'small', (120, 110, 80), (90, 80, 60), 'a mudskipper on a lump of mud')]),
    7: dict(key=MAG, anchors=[lambda: made('w7c', 'urn'), lambda: made('w7c', 'stone-brazier')],
            look='ancient jungle temple ruins, mossy grey-green stone, warm worn sandstone, deep greens',
            pieces=[('pillarStub', 'tall', (130, 130, 115), (80, 120, 60), 'a broken stone pillar stub wrapped in vines'),
                    ('offering', 'small', (150, 130, 100), (230, 150, 40), 'a stone offering bowl with fruit'),
                    ('macaw', 'tall', (200, 40, 40), (40, 90, 200), 'a red macaw perched on a broken column'),
                    ('censer', 'hang', (130, 110, 80), (90, 80, 70), 'a bronze censer hanging on a chain'),
                    ('bellVine', 'hang', (80, 110, 60), (140, 140, 125), 'a vine with little carved stone bells hanging down'),
                    ('shards', 'wide', (180, 120, 80), (150, 95, 60), 'broken clay pottery shards'),
                    ('tablet', 'mound', (140, 140, 125), (100, 100, 90), 'a carved stone tablet leaning, a sloth carving on it'),
                    ('tiles', 'wide', (150, 145, 125), (110, 105, 95), 'fallen carved floor tiles'),
                    ('lizardBlock', 'mound', (130, 130, 115), (80, 150, 70), 'a green lizard sunning on a carved stone block'),
                    ('frogIdol', 'small', (120, 140, 110), (100, 120, 90), 'a small mossy stone frog idol')]),
}


def made_kit(world, n):
    t = (SRC / 'game/kitAtlasData.ts').read_text()
    d = json.loads(t[t.index('= {') + 2:].rstrip().rstrip(';'))[str(world)][n]
    return Image.open(SRC / f'assets/kits/w{world}.webp').convert('RGBA').crop((d['x'], d['y'], d['x'] + d['w'], d['y'] + d['h']))


def fit(im, w, h):
    im = im.crop(im.getbbox())
    s = min(w / im.width, h / im.height)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)


def hint(shape, fill, acc):
    c = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
    d = ImageDraw.Draw(c)
    ink = tuple(max(0, v // 3) for v in fill)
    m = 40
    if shape == 'mound':
        box = (m + 20, CH * 0.3, CW - m - 20, CH - m)
    elif shape == 'tall':
        box = (CW * 0.32, m, CW * 0.68, CH - m)
    elif shape == 'wide':
        box = (m, CH * 0.55, CW - m, CH - m)
    elif shape == 'hang':
        box = (CW * 0.3, m, CW * 0.7, CH - m - 30)
    else:
        box = (CW * 0.25, CH * 0.5, CW * 0.75, CH - m)
    d.rounded_rectangle(box, radius=40, fill=fill + (255,), outline=ink + (255,), width=5)
    x0, y0, x1, y1 = box
    # the accent: a patch of the second colour where the eye goes (a flower, a beak, a glow)
    d.ellipse((x0 + (x1 - x0) * 0.25, y0 + (y1 - y0) * 0.12, x0 + (x1 - x0) * 0.6, y0 + (y1 - y0) * 0.42), fill=acc + (255,), outline=ink + (255,), width=4)
    return c


def build(world):
    spec = W[world]
    can = Image.new('RGBA', (CW * 4, CH * 3), spec['key'] + (255,))
    cells = {}
    for i, a in enumerate(spec['anchors']):
        im = fit(a(), CW - 60, CH - 60)
        x, y = i * CW, 0
        can.alpha_composite(im, (x + (CW - im.width) // 2, y + CH - 30 - im.height))
        cells[f'anchor{i}'] = [x, y, CW, CH]
    for j, (n, shape, fill, acc, _) in enumerate(spec['pieces']):
        k = j + 2
        x, y = (k % 4) * CW, (k // 4) * CH
        can.alpha_composite(hint(shape, fill, acc), (x, y))
        cells[n] = [x, y, CW, CH]
    OUT.mkdir(parents=True, exist_ok=True)
    can.convert('RGB').save(OUT / f'w{world}.png')
    return {'key': list(spec['key']), 'size': [CW * 4, CH * 3], 'cells': cells}


def prompt(world):
    spec = W[world]
    key = 'green #00FF00' if spec['key'] == GRN else 'magenta #FF00FF'
    names = [p[4] for p in spec['pieces']]
    return (f"slothadv style, a sheet of twelve separate game props in a 4 by 3 grid, painted in one consistent storybook style, for "
            f"{spec['look']}. Top row: two existing props, then {names[0]}, then {names[1]}. Middle row: {names[2]}, {names[3]}, "
            f"{names[4]}, {names[5]}. Bottom row: {names[6]}, {names[7]}, {names[8]}, {names[9]}. Soft cel shading, thin dark ink outline, "
            f"light from the upper left on every piece, each piece seen exactly from the side for a side-scrolling platform game, every "
            f"piece separate in its own space with room round it, on one flat plain pure {key} background, no cast shadow, no ground "
            f"line, no text.")


if __name__ == '__main__':
    worlds = [int(a) for a in sys.argv[1:] if a.isdigit()] or list(W)
    p = OUT / 'cells.json'
    allc = json.loads(p.read_text()) if p.exists() else {}
    for w in worlds:
        allc[f'w{w}'] = build(w)
        allc[f'w{w}']['prompt'] = prompt(w)
        print('w', w)
    p.write_text(json.dumps(allc, indent=1))


def anchor_canvas(world):
    """1536 x 1024: the world's first approved piece on the left third (the style anchor, painted with the new piece in one pass and
    thrown away), flat key on the right two thirds where the new piece is painted"""
    spec = W[world]
    can = Image.new('RGBA', (1536, 1024), spec['key'] + (255,))
    im = fit(spec['anchors'][0](), 420, 700)
    can.alpha_composite(im, ((512 - im.width) // 2, 900 - im.height))
    OUT.mkdir(parents=True, exist_ok=True)
    can.convert('RGB').save(OUT / f'anchor-w{world}.png')


if __name__ == '__main__' and '--anchors' in sys.argv:
    for w in W:
        anchor_canvas(w)
