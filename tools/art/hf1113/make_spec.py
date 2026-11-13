"""ART 11-13 specs for tools/art/hfpokey/pokeygpu.py (edits: Qwen-Image-Edit-2511 + Pokey's character model).

    python3 -I tools/art/hf1113/make_spec.py climb1 <commit with the starts>   -> tools/art/hf1113/spec-climb1.json
    python3 -I tools/art/hf1113/make_spec.py args tools/art/hf1113/spec-climb1.json <commit with the spec>   -> hf_jobs run args
Results: bucket mshaffe111/w5-xfer hfpokey/edits/<name>-s<seed>.png and hfpokey/edits/sheet-<tag>.jpg. The token only as the job secret.
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
KEEP = ('Keep everything else exactly as in the picture: the same face and eyes, the same brown fur and cream belly and cream face, the '
        'same pale bandage wrist wraps, the same thin brown satchel strap across his chest and the small brown bag at his hip, the same '
        'thin dark outline, the same soft painted storybook cartoon style, the same size, the same two vines in the same places, and the '
        'same flat plain grey background. Nothing else in the picture.')
NEG = ('extra limbs, extra arms, extra paws, extra sloth, two sloths, bar between his paws, stick, rope between the vines, branch, '
       'third vine, changed face, different eyes, missing wrist wraps, missing satchel, background scenery, ground, shadow, photo, '
       '3d render, text, watermark, blurry, back view, side view, tail')
BASE = ('The friendly brown three-toed sloth is climbing up between the two vertical vines, facing us, his body hanging in the middle '
        'between them, one paw gripping each vine, his arms stretched out wide to the sides and up, his claws curled round the vines. ')
POSES = {
    'reachL': 'His left arm (on the left of the picture) reaches high up the left vine above his head, gripping it; his other arm is '
              'lower, bent, gripping the right vine at the height of his shoulder; his left knee is raised, his other leg hangs down.',
    'reachR': 'His right arm (on the right of the picture) reaches high up the right vine above his head, gripping it; his other arm is '
              'lower, bent, gripping the left vine at the height of his shoulder; his right knee is raised, his other leg hangs down.',
    'pull': 'Both paws grip the vines at the same height just above his head, his elbows bent out to the sides as he pulls himself up, '
            'both knees tucked up under him.',
    'hang': 'Both paws grip the vines at the same height above his head, his arms straight out in a wide V, his body hanging long and '
            'relaxed between them, his legs hanging down.',
}


def climb1(commit):
    src = f'gh:{commit}:reference/art/hf1113/starts/climb-hang.png'
    edits = [{'name': f'c1-{k}', 'src': src, 'w': 1024, 'h': 1024, 'prompt': BASE + v + ' ' + KEEP, 'neg': NEG,
              'seeds': [1, 2, 3], 'lora': 0.6} for k, v in POSES.items()]
    spec = {'tag': 'climb1', 'edits': edits}
    (H / 'spec-climb1.json').write_text(json.dumps(spec, indent=1))
    print(len(edits) * 3, 'edits')


def args(spec, commit):
    name = Path(spec).name
    gh = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/'
    tag = json.loads(Path(spec).read_text())['tag']
    cmd = (f'mkdir -p /out/hfpokey/jobs && curl -fsSL {gh}hfpokey/pokeygpu.py -o /out/hfpokey/jobs/pokeygpu-1113.py && '
           f'curl -fsSL {gh}hf1113/{name} -o /out/hfpokey/jobs/{name} && '
           'python -c "from diffusers import QwenImageEditPlusPipeline" 2>/dev/null || pip install -q --break-system-packages -U diffusers; '
           f'SPEC=hfpokey/jobs/{name} python /out/hfpokey/jobs/pokeygpu-1113.py')
    print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True,
                      'command': ['bash', '-lc', cmd], 'secrets': {'HF_TOKEN': '$HF_TOKEN'},
                      'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'name': f'art1113-{tag}'}))




# ---- 1-5's set and 1-4's pieces: text to image, Qwen-Image + the style model (tools/art/w6to10/stillsgpu.py) ----
STYLE = ('hand-painted 2D storybook platformer game asset, seen exactly from the side, flat orthographic view, rich saturated colour, '
         'clean dark outline, painterly detail')
MAG = 'isolated on a flat solid magenta background'
GRY = 'isolated on a flat plain mid grey background'
PNEG = ('perspective, three-quarter view, isometric, seen from above, top-down, text, letters, numbers, words, watermark, frame, border, '
        'photo, 3d render, blurry, gradient background, floor, cast shadow, sky, scenery behind, animals, people, sloth')
PROPS1 = {
    # 1-5 (F15 1-5.md:12-20, :57-58): the squirrels' leaf-signs (berry-juice doodles on big living leaves), the leaf curtain, the folded
    # petal, Meeca's mark on living bark, the root tunnel mouth, the rotten fallen trunk
    'leafsign-right': ('a single huge broad tropical leaf growing straight up from a short green stalk out of a small tuft of moss, '
                       'its wide blade held up flat facing us like a little sign, a big simple fat arrow pointing right painted '
                       'roughly on the leaf in dark purple berry juice, finger-painted strokes', MAG, 1328, 1328),
    'leafsign-up': ('a single huge broad tropical leaf growing straight up from a short green stalk out of a small tuft of moss, its '
                    'wide blade held up flat facing us like a little sign, a big simple curved arrow pointing up and over painted '
                    'roughly on the leaf in dark purple berry juice, finger-painted strokes', MAG, 1328, 1328),
    'leafsign-down': ('a single huge broad tropical leaf growing straight up from a short green stalk out of a small tuft of moss, '
                      'its wide blade held up flat facing us like a little sign, a big simple curved arrow pointing down and under '
                      'painted roughly on the leaf in dark purple berry juice, finger-painted strokes', MAG, 1328, 1328),
    'leafcurtain': ('a curtain of long broad green jungle leaves and thin leafy vines hanging straight down side by side from a mossy '
                    'branch along the top edge, a dense hanging leaf curtain, the leaf tips ragged at the bottom', MAG, 1664, 1088),
    'petal-folded': ('one single soft dusty pink blossom petal folded neatly in half, lying on its side, small and delicate with a '
                     'pale cream edge and a soft crease', GRY, 1024, 1024),
    'mark-right': ('a rounded patch of living rainforest tree bark, rough brown bark with green moss at its edges, a capital letter M '
                   'freshly carved into the bark and a carved arrow beside it pointing right, the fresh cuts pale cream wood',
                   MAG, 1024, 1024),
    'mark-up': ('a rounded patch of living rainforest tree bark, rough brown bark with green moss at its edges, a capital letter M '
                'freshly carved into the bark and a carved arrow above it pointing straight up, the fresh cuts pale cream wood',
                MAG, 1024, 1024),
    'roottunnel': ('the arched mouth of a low tunnel under huge tangled rainforest tree roots, thick twisting brown roots arching over '
                   'a dark shadowy opening, moss and ferns on the roots, a flat earth floor running through the tunnel mouth',
                   MAG, 1664, 1088),
    'rottentrunk': ('a huge fallen rotten tree trunk lying flat on its side, very long, its flat mossy top a walkway, a hollow dark '
                    'open end on the left, soft crumbling rotten bark, orange bracket fungus, ferns and moss', MAG, 2048, 832),
    # 1-4 (F15 1-4.md:30, the story keeper 11-13: wild figs, never purple grocery figs)
    'roughbough': ('a long horizontal rainforest tree bough, rotting and spongy, a flat mossy top to walk on, orange-brown bracket '
                   'fungus shelves growing from its side, a cracked notched sagging underside, soft dark rot patches', MAG, 2048, 640),
    'figcluster': ('a small bunch of round orange-red wild figs hanging from a short woody stalk with two green leaves, the figs '
                   'small and round, glossy, some speckled', MAG, 1024, 1024),
    'passiontangle': ('a small tangle of passion-flower vine with curly tendrils, three round orange-red fruits and one white and purple '
                      'passion flower, hanging from a short stem', MAG, 1024, 1024),
    'kapokpod': ('one closed kapok tree seed pod, long oval and woody, brown-green with ridges, hanging from a short twig', MAG, 1024, 1024),
    'kapokpod-burst': ('one kapok seed pod burst open, split woody brown husk with soft white silky fluff spilling out of it, lying on '
                       'its side', MAG, 1024, 1024),
}


def props1(seeds=(11, 23, 37)):
    items = [{'name': f'{k}-{sd}', 'prompt': f'{p}, {STYLE}, {bg}', 'seed': sd, 'w': w, 'h': h}
             for k, (p, bg, w, h) in PROPS1.items() for sd in seeds]
    spec = {'tag': 'props1', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]},
            'neg': PNEG, 'items': items}
    (H / 'spec-props1.json').write_text(json.dumps(spec, indent=1))
    print(len(items), 'stills')



# ---- the fruit pickups (the lead 11-13 10:40 AM ET, the story keeper's list: whole, never bitten, as they really grow) ----
FRUIT = {
    'banana': 'a small bunch of three ripe yellow-green curved bananas joined at a short green stem',
    'mango': 'one whole ripe mango, a red-orange blushed kidney-shaped oval fruit hanging from a long thin stem with one long leaf',
    'papaya': 'one whole ripe papaya, a long oval fruit green turning to orange, smooth skin, a short stub of stem',
    'passionfruit': 'one whole round purple passion fruit with slightly wrinkled glossy skin and a short curly stem and one green leaf',
    'wildfig': 'a small bunch of three small round orange-red wild figs on a short woody stalk with one green leaf',
    'cacao': 'one whole cacao pod, a long ridged oval pod ripening yellow to red, a short woody stem',
    'pineapple': 'one whole golden pineapple with a spiky green leaf crown, diamond-patterned skin',
    'coconut': 'one whole green-to-brown coconut in its smooth husk, round and slightly three-sided',
    'dragonfruit': 'one whole hot pink dragon fruit with green-tipped curling scales',
}


def fruit1(seeds=(11, 23, 37)):
    # 1-5's hidden find first (the lead 11-13 11:07 AM ET: today's stand-in reads as a pear): real guarana, a warm golden light on it;
    # the glow round it is code-drawn like the other finds (a soft halo cannot key off magenta)
    gua = ('a small cluster of four round glossy red-orange guarana fruits on a short stalk, two of them split open showing a shiny '
           'black seed with a white rim like an eye, lit by a warm golden light, golden highlights on the fruit')
    items = [{'name': f'find-guarana-{sd}', 'prompt': f'{gua}, a single game pickup item, whole and fresh, centred, {STYLE}, {MAG}',
              'seed': sd, 'w': 1024, 'h': 1024} for sd in (11, 23, 37, 53)]
    items += [{'name': f'fruit-{k}-{sd}', 'prompt': f'{p}, a single game pickup item, whole and fresh, never bitten, centred, '
                                                    f'{STYLE}, {GRY if k in ("dragonfruit", "passionfruit") else MAG}', 'seed': sd, 'w': 1024, 'h': 1024}
             for k, p in FRUIT.items() for sd in seeds]
    spec = {'tag': 'fruit1', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]},
            'neg': PNEG + ', bitten, cut open, sliced, pile, basket, plate, table', 'items': items}
    (H / 'spec-fruit1.json').write_text(json.dumps(spec, indent=1))
    print(len(items), 'stills')


# ---- climb round 2: the missing opposite reach and dangling legs, edited from round 1's keepers (in the sandbox at /w/hfpokey/edits) ----
STRAP = ('His satchel strap still runs from his shoulder on the right of the picture down to the bag at his hip on the left of the picture, '
         'exactly as now: do not mirror him. ')
LEGS = 'His legs hang down loosely below him, feet dangling with the toes pointing down, never standing as if on the ground. '


def climb2():
    edits = [
        {'name': 'c2-reachLhigh', 'src': 'b:hfpokey/edits/c1-reachR-s3.png', 'w': 1024, 'h': 1024, 'seeds': [1, 2, 3, 4], 'lora': 0.6,
         'neg': NEG + ', mirrored, satchel on the other side', 'prompt':
         'Swap which arm is high. Now his left arm (on the left of the picture) reaches high up the left vine above his head, gripping it, '
         'and his right arm (on the right of the picture) is lower and bent, gripping the right vine at the height of his chest; his '
         'left knee is raised and his right leg hangs down. ' + STRAP + KEEP},
        {'name': 'c2-hangdangle', 'src': 'b:hfpokey/edits/c1-hang-s1.png', 'w': 1024, 'h': 1024, 'seeds': [1, 2, 3], 'lora': 0.6,
         'neg': NEG + ', standing, feet flat', 'prompt': 'Keep his arms and paws exactly where they are on the two vines. ' + LEGS + STRAP + KEEP},
        {'name': 'c2-bothhigh', 'src': 'b:hfpokey/edits/c1-reachL-s3.png', 'w': 1024, 'h': 1024, 'seeds': [1, 2, 3], 'lora': 0.6,
         'neg': NEG + ', standing, feet flat', 'prompt': 'Keep his arms and paws exactly where they are on the two vines. Both knees are '
         'drawn up under him as he pulls himself up, his feet tucked. ' + STRAP + KEEP},
    ]
    (H / 'spec-climb2.json').write_text(json.dumps({'tag': 'climb2', 'edits': edits}, indent=1))
    print(sum(len(e['seeds']) for e in edits), 'edits')


# ---- props2: round-1 redos (leaf sign right: blobs, no arrow; her mark: every take a SAWN stump, a made thing W1 forbids) ----
BARK = ('rough brown living rainforest tree bark texture filling the whole picture edge to edge, deep vertical cracks with a little '
        'green moss, flat front view, {}, the fresh cuts pale cream wood against the dark bark, crisp carving')
PROPS2 = {
    'leafsign-right2': ('a single huge broad tropical leaf growing straight up from a short green stalk out of a small tuft of moss, '
                        'its wide blade held up flat facing us like a little sign, one big bold horizontal arrow pointing to the right '
                        'painted clearly across the middle of the leaf in dark purple berry juice, a clean simple arrow shape with a '
                        'triangle head', MAG, 1328, 1328),
    'markbark-right': (BARK.format('a big capital letter M freshly carved deep into the bark in the middle and a carved arrow pointing '
                                   'to the right beside it'), 'no background, the bark fills the frame', 1024, 1024),
    'markbark-up': (BARK.format('a big capital letter M freshly carved deep into the bark in the middle and a carved arrow pointing '
                                'straight up above it'), 'no background, the bark fills the frame', 1024, 1024),
}


def props2(seeds=(11, 23, 37, 53)):
    items = [{'name': f'{k}-{sd}', 'prompt': f'{p}, {STYLE}, {bg}', 'seed': sd, 'w': w, 'h': h}
             for k, (p, bg, w, h) in PROPS2.items() for sd in (seeds if k == 'leafsign-right2' else seeds[:3])]
    spec = {'tag': 'props2', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]},
            'neg': PNEG.replace('text, letters, numbers, words, ', 'words, writing, ') + ', stump, sawn, cut log, tree rings, top of a log',
            'items': items}
    (H / 'spec-props2.json').write_text(json.dumps(spec, indent=1))
    print(len(items), 'stills')


# ---- props3: 1-4's creatures, LAST (1-4.md:4; the story keeper 11-13: a Montezuma oropendola, leafcutter ants each carrying a leaf bit)
ORO = ('a Montezuma oropendola bird, rich chestnut-brown body, black head, a bare pale blue cheek patch and a small pink wattle, a long '
       'black bill with an orange tip, bright yellow outer tail feathers')
PROPS3 = {
    'oropendola-up': (ORO + ', flying to the right seen exactly from the side, its wings raised high above its back', MAG, 1328, 1024),
    'oropendola-down': (ORO + ', flying to the right seen exactly from the side, its wings swept down below its body', MAG, 1328, 1024),
    'leafcutter': ('one leafcutter ant walking to the right seen exactly from the side, reddish-brown with long legs, carrying a bright '
                   'green cut piece of leaf held up high above its head in its jaws like a little sail', MAG, 1328, 1024),
}


def props3(seeds=(11, 23, 37, 53)):
    items = [{'name': f'{k}-{sd}', 'prompt': f'{p}, {STYLE}, {bg}', 'seed': sd, 'w': w, 'h': h}
             for k, (p, bg, w, h) in PROPS3.items() for sd in seeds]
    spec = {'tag': 'props3', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]},
            'neg': PNEG.replace(', animals', '') + ', two birds, flock, nest, branch, perched, many ants, ant hill', 'items': items}
    (H / 'spec-props3.json').write_text(json.dumps(spec, indent=1))
    print(len(items), 'stills')


# ---- props4: 1-5's dusk (1-5.md:5 "dusk: limbs in last light, roots in shadow"): World 1's own far and sky strips repainted at dusk by
# img2img (tools/art/w6to10/img2imggpu.py), so the canopy and hills stay World 1's; the wrap join is fixed after (hflist1/wrapfix.py)
DUSK = ('the same rainforest canopy valley at dusk, the sun just set behind the far hills, the last warm orange-gold light low on the '
        'horizon, rose and violet clouds, the far hills in cool purple haze, the treetops catching rim light, deep blue-violet higher sky, '
        'hand-painted 2D storybook game background, painterly, no text')
DSKY = ('the same sky at dusk, rose, peach and violet clouds lit from below by the set sun, a deep blue-violet sky, '
        'hand-painted 2D storybook game background, painterly, no text')


def props4(commit):
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/src/assets/backdrops/'
    items = [{'name': f'dusk-far-s{s}-{sd}', 'start': 'w1-far.webp', 'prompt': DUSK, 'strength': s / 100, 'seed': sd, 'w': 2048, 'h': 1008}
             for s in (55, 62) for sd in (11, 23)]
    items += [{'name': f'dusk-sky-s{s}-{sd}', 'start': 'w1-sky.webp', 'prompt': DSKY, 'strength': s / 100, 'seed': sd, 'w': 2048, 'h': 400}
              for s in (55, 65) for sd in (11, 23)]
    spec = {'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'base': base,
            'neg': 'text, letters, watermark, frame, border, photo, 3d render, blurry, people, animals, buildings', 'items': items}
    (H / 'spec-props4.json').write_text(json.dumps(spec, indent=1))
    print(len(items), 'img2img')


# ---- props5: the guarana again ON GREY (red-orange keyed away with the drifted pink: cut-check.jpg) and the down sign with the arrow
# ON the leaf (leafsign-down-11's arrow hangs in the air past the leaf's edge)
def props5(seeds=(11, 23, 37, 53)):
    gua = ('a small cluster of four round glossy red-orange guarana fruits on a short stalk, two of them split open showing a shiny '
           'black seed with a white rim like an eye, lit by a warm golden light, golden highlights on the fruit')
    items = [{'name': f'find-guarana-g-{sd}', 'prompt': f'{gua}, a single game pickup item, whole and fresh, centred, {STYLE}, {GRY}',
              'seed': sd, 'w': 1024, 'h': 1024} for sd in seeds]
    down = ('a single huge broad tropical leaf growing straight up from a short green stalk out of a small tuft of moss, its wide blade '
            'held up flat facing us like a little sign, one big bold arrow pointing straight down painted clearly in the middle of the '
            'leaf in dark purple berry juice, the whole arrow inside the leaf, a clean simple arrow with a triangle head')
    items += [{'name': f'leafsign-down2-{sd}', 'prompt': f'{down}, {STYLE}, {MAG}', 'seed': sd, 'w': 1328, 'h': 1328} for sd in seeds]
    spec = {'tag': 'props5', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]},
            'neg': PNEG, 'items': items}
    (H / 'spec-props5.json').write_text(json.dumps(spec, indent=1))
    print(len(items), 'stills')


# ---- props6: the dusk again from graded starts (duskstarts.py), lower strength so the light stays dusk; oro1: the flyer's frames
# edited from the keeper oropendola-up-37 so every frame is the same bird (pokeygpu.py edits, no Pokey model)
def props6(commit):
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/reference/art/hf1113/starts/'
    items = [{'name': f'dusk2-far-s{s}-{sd}', 'start': 'dusk-far.png', 'prompt': DUSK, 'strength': s / 100, 'seed': sd, 'w': 2048, 'h': 1008}
             for s in (42, 50) for sd in (11, 23)]
    items += [{'name': f'dusk2-sky-s{s}-{sd}', 'start': 'dusk-sky.png', 'prompt': DSKY, 'strength': s / 100, 'seed': sd, 'w': 2048, 'h': 400}
              for s in (42, 50) for sd in (11, 23)]
    spec = {'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'base': base,
            'neg': 'text, letters, watermark, frame, border, photo, 3d render, blurry, people, animals, buildings, daylight, blue daytime sky',
            'items': items}
    (H / 'spec-props6.json').write_text(json.dumps(spec, indent=1))
    keep = ('Keep everything else exactly as in the picture: the same bird, the same chestnut-brown body, black head, pale blue cheek, '
            'black bill with the orange tip, yellow tail, the same outline and painted cartoon style, the same size and place, facing '
            'right, the same flat magenta background. Nothing else in the picture.')
    edits = [{'name': 'oro1-down', 'src': 'b:art1113/stills/oropendola-up-37.png', 'w': 1328, 'h': 1024, 'seeds': [1, 2, 3],
              'prompt': 'Change only its wings: both wings are now swept down below its body at the bottom of a wingbeat. ' + keep,
              'neg': 'two birds, extra wings, extra legs, perched, branch, text, watermark, blurry, photo'},
             {'name': 'oro1-mid', 'src': 'b:art1113/stills/oropendola-up-37.png', 'w': 1328, 'h': 1024, 'seeds': [1, 2, 3],
              'prompt': 'Change only its wings: both wings are now spread straight out level to the sides, gliding. ' + keep,
              'neg': 'two birds, extra wings, extra legs, perched, branch, text, watermark, blurry, photo'}]
    (H / 'spec-oro1.json').write_text(json.dumps({'tag': 'oro1', 'edits': edits}, indent=1))
    print(len(items), 'img2img;', 6, 'edits')


# ---- props7: 1-5's creek hurt floor (the lead 12:01 PM ET): shallow, fast, stony, foamy; knocks you back, never reads as a deep pool
# (World 1's deadly creek is deep murky brown: props/pitwater/w1-creek.webp); dusk light; a side-on band whose top is the water surface
CREEK = ('a long horizontal band of shallow fast-rushing clear rainforest creek water seen exactly from the side at ground level, '
         'white foam and splashing white water along its choppy surface, round smooth grey and brown pebbles and stones clearly visible '
         'through the very shallow water and lying on the stony bed just under it, a few wet stones poking up through the surface, '
         'water rushing to the right, dusk light with violet and warm orange glints on the water, the band runs from the left edge to '
         'the right edge of the picture, flat solid magenta above the water surface')


def props7(seeds=(11, 23, 37, 53)):
    items = [{'name': f'creek-{sd}', 'prompt': f'{CREEK}, hand-painted 2D storybook platformer game asset, rich colour, clean dark '
              f'outline, painterly detail', 'seed': sd, 'w': 1792, 'h': 640} for sd in seeds]
    spec = {'tag': 'props7', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]},
            'neg': PNEG.replace(', floor', '') + ', deep water, dark pool, murky, waterfall, bank, grass, trees, sky, magenta water', 'items': items}
    (H / 'spec-props7.json').write_text(json.dumps(spec, indent=1))
    print(len(items), 'stills')

CMDS = {'climb1': lambda: climb1(sys.argv[2]), 'args': lambda: args(sys.argv[2], sys.argv[3]), 'props1': props1, 'fruit1': fruit1, 'climb2': climb2, 'props2': props2, 'props3': props3, 'props5': props5, 'props7': props7, 'props6': lambda: props6(sys.argv[2]), 'props4': lambda: props4(sys.argv[2])}
if __name__ == '__main__':
    CMDS[sys.argv[1]]()
