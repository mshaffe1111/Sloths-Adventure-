"""Write tools/art/hfbatch/spec-hfb-stage-<part>.json (hf-art-stage, 2026-10-29): the every-stage pieces by img2img
(w6to10/img2imggpu.py) from the starts stagestarts.py makes (tools/art/hfbatch/starts/, force-added, read from GitHub raw at a pinned
commit, so the branch is pushed first), two strengths x two seeds each, with the style model.
    python3 tools/art/hfbatch/make_stage_spec.py <commit>
"""
import json, sys
from pathlib import Path

COMMIT = sys.argv[1] if len(sys.argv) > 1 else 'hf-art-stage'
BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{COMMIT}/tools/art/hfbatch/starts/'
STYLE = ('Soft cel shading, thin dark outline, light from the upper left, evenly lit, hand-painted storybook game art, seen straight '
         'from the side, ')
KEYM = 'on one flat plain pure magenta background, no sky, no shadow, no text'
KEYC = 'on one flat plain pure cyan background, no sky, no shadow, no text'
PAIR = 'two versions of the very same object side by side, identical in shape and size, '

GATES = {
    1: 'a rainforest sanctuary gate: two mossy wooden posts wrapped in green vines, a mossy log lintel with a red bromeliad on top, on a '
       'grassy earth step. Left: the way is shut by a woven door of big green monstera leaves tied with vines. Right: the leaves are '
       'drawn aside and the way is open, a dark path inside leading to a warm golden light',
    2: 'a riverbank gate of weathered grey-brown wooden planks and posts lashed with rope, a plank roof, on a wooden plank step. Left: '
       'shut by a lashed plank door barred with a rope. Right: the door is gone and the way stands open, a dark path inside leading to '
       'a warm golden light',
    3: 'an ancient ruined stone gateway in a dark night cave, mossy grey-green stone pillars with glowing cyan water drips, a mossy '
       'stone lintel, on a wet stone step. Left: shut by a heavy carved stone slab door. Right: the slab is gone and the way stands '
       'open, a dark passage inside leading to a soft warm light',
    4: 'a cliff gate of blue-grey slate rock pillars with twisting brown roots, a slate lintel with tufts of grass on top, on a slate '
       'step. Left: shut by a door of stacked slate slabs tied with a vine. Right: the slabs are gone and the way stands open, a dark '
       'passage leading to a warm golden light',
    6: 'a mangrove swamp gate of pale grey-green mangrove wood pillars with shelf fungus, a pale root-wood lintel, on a muddy root step. '
       'Left: shut by a tangled lattice of dark brown mangrove roots. Right: the roots are pulled back and the way stands open, a dark '
       'path inside leading to a warm golden light',
    7: 'an ancient temple gateway of weathered grey-green carved stone pillars with key patterns and moss, a carved stone lintel with '
       'key patterns, on a stone step with dry roots. Left: shut by a carved stone door bound with roots. Right: the stone door is gone '
       'and the way stands open, a dark passage inside leading to a warm golden light',
    8: 'a night forest gate of two dark blue and purple bark tree trunks, a fallen blue log lintel with violet leaves, on a blue mossy '
       'step. Left: shut by a door of blue bark planks bound with a vine. Right: the door is gone and the way stands open, a dark path '
       'inside leading to a warm golden light',
    9: 'a volcanic gate of black hexagonal basalt columns, a cracked black basalt lintel with thin glowing orange lava cracks, on a '
       'basalt step with small red flowers. Left: shut by a door of fitted basalt blocks bound with a vine. Right: the door is gone and '
       'the way stands open, a dark passage leading to a warm golden light',
    10: 'a stronghold gate of rough grey rock pillars and a grey rock lintel, on a grey rock step. Left: shut by a heavy rusty iron '
        'portcullis grate. Right: the portcullis is wound up out of the way, only its bottom spikes show under the lintel, and the way '
        'stands open, a dark passage leading to a warm golden light',
}
WATERS = {
    1: 'murky tea-brown rainforest pit water seen from the side, a few small dead leaves floating on the surface, darker toward the '
       'bottom, soft pale highlight line along the rippled surface',
    3: 'dark blue night water in a cave seen from the side, faint glowing cyan specks in it, nearly black toward the bottom, soft pale '
       'blue highlight line along the rippled surface',
    4: 'cold grey-teal mountain pool water under misty cliffs seen from the side, darker slate toward the bottom, soft pale highlight '
       'line along the rippled surface with a little white foam',
    5: 'still dusky lilac-rose garden pond water seen from the side, a few pale pink petals floating on the surface, deep plum toward '
       'the bottom, soft warm highlight line along the rippled surface',
}
items = []


def add(name, start, prompt, w, h, strengths=(0.55, 0.7), seeds=(7, 23), neg=None):
    for st in strengths:
        for sd in seeds:
            it = {'name': f'{name}-s{round(st * 100)}-{sd}', 'start': start, 'prompt': prompt, 'strength': st, 'seed': sd, 'w': w, 'h': h}
            if neg:
                it['neg'] = neg
            items.append(it)


S = 'slothadv style, painted storybook illustration, '
for w, p in GATES.items():
    add(f'gate-w{w}', f'start-gate-w{w}.webp', S + 'a game exit gate for a side-scrolling platformer, ' + PAIR + p + '. ' + STYLE + KEYM,
        1536, 960)
add('flag', 'start-flag.webp', S + 'a game checkpoint marker, ' + PAIR + 'a small carved wooden post with a pennant woven of green '
    'jungle leaves. Left: unlit, muted dull grey-green leaves, the post plain. Right: lit, the leaves glowing warm golden-green and '
    'the round bead on top of the post glowing warm yellow. ' + STYLE + KEYM, 1024, 768)
WNEG = 'text, letters, watermark, frame, border, photo, 3d render, sky, land, rocks, plants, people, animal, boat, reflection of trees'
for w, p in WATERS.items():
    add(f'water-w{w}', f'start-water-w{w}.webp', S + 'a horizontal tileable strip of ' + p + ', the water fills the lower part of the '
        'picture edge to edge, flat magenta above the water surface. ' + STYLE.replace('seen straight from the side, ', '') +
        'no sky, no text', 1536, 384, neg=WNEG)
add('pickups', 'start-pickups.webp', S + 'six game pickup icons in a grid: a glossy red heart, a red heart wearing a small gold '
    'crown, a green leaf pod with a golden lightning bolt, a shining golden star, a glossy violet-blue magic orb with a pale swirl, '
    'another red heart. Each painted with a thick dark brown outline, a white shine at the upper left. ' + STYLE + KEYC, 1536, 1024)
add('thorn', 'start-thorn.webp', S + 'a magic thorn gate, ' + PAIR + 'a ring of twisted dark purple thorny bramble vines with long '
    'pale sharp thorns pointing outward. Left: shut, the brambles woven across the middle, a dim violet dark inside. Right: open, the '
    'middle clear and glowing bright violet and white. ' + STYLE + KEYC, 1024, 512)
add('net', 'start-net.webp', S + 'old frayed rope netting, ' + PAIR + 'a dome of pale beige knotted twine net pegged down at both '
    'ends with wooden pegs. Left: the net whole. Right: the same net torn open at the top, frayed loose ends hanging. Only the net and '
    'the pegs, nothing under it. ' + STYLE + KEYM, 1024, 384)
add('finds', 'start-finds.webp', S + 'four game story-find icons in a grid: top row a clump of green fern fronds on a mossy mound, '
    'plain on the left and on the right the same fern lit warm golden as if glowing; bottom row a pink bell flower hanging from its '
    'stem, plain on the left and on the right the same bell lit warm as if glowing. ' + STYLE + KEYC, 1024, 1024)

# (round 2: World 5's gate from its own painted totem, start-gate-w5.webp: stagestarts.py gate_w5)
W5P = (S + 'a game exit gate for a side-scrolling platformer, ' + PAIR + 'a carved wooden orchid-garden totem: a tall carved tree '
       'trunk wrapped in a band of cream lace, a small arched door low in the trunk, broad leaves at its top. Left: shut, the orchid on '
       'top closed to a pale green bud, the little door wrapped over with white silk thread, the wood a little dimmer. Right: open, a '
       'big pink orchid in bloom on top and the little door open onto a dark inside. ' + STYLE + KEYM)
items2 = []
for st in (0.42, 0.55):
    for sd in (7, 23):
        items2.append({'name': f'gate-w5-s{round(st * 100)}-{sd}', 'start': 'start-gate-w5.webp', 'prompt': W5P, 'strength': st, 'seed': sd,
                       'w': 1536, 'h': 960})

# (round 2: each world's open gate from its picked shut take, start-gateopen-w<N>.webp: stagestarts.py gate_open_from: the first open
# takes kept the start's flat cone of light, which reads as drawn)
OPEN_P = {w: p.split('Left:')[0].strip() for w, p in GATES.items()}
for w, p in OPEN_P.items():
    pr = (S + 'a game exit gate for a side-scrolling platformer, ' + p + ' The gate stands open: no door, the way through is a dark '
          'passage going back into the gate, its inner walls and floor in soft shadow, a soft warm golden light glowing deep inside. '
          + STYLE + KEYM)
    for st in (0.45, 0.6):
        for sd in (7, 23):
            items2.append({'name': f'gateopen-w{w}-s{round(st * 100)}-{sd}', 'start': f'start-gateopen-w{w}.webp', 'prompt': pr,
                           'strength': st, 'seed': sd, 'w': 768, 'h': 960})

NEG = ('perspective, three-quarter view, isometric, seen from above, top-down, text, letters, numbers, watermark, frame, border, photo, '
       '3d render, blurry, gradient background, sky, cast shadow, people, sloth, animal')
here = Path(__file__).resolve().parent
parts = [items[: len(items) // 2], items[len(items) // 2:], items2]
for k, part in enumerate(parts):
    spec = {'note': 'hf-art-stage every-stage pieces by img2img from stagestarts.py, 2026-10-29',
            'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]},
            'neg': NEG, 'base': BASE, 'items': part}
    p = here / f'spec-hfb-stage-{k}.json'
    p.write_text(json.dumps(spec, indent=1))
    print(p, len(part))
