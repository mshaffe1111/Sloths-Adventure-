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

CMDS = {'climb1': lambda: climb1(sys.argv[2]), 'args': lambda: args(sys.argv[2], sys.argv[3]), 'props1': props1, 'fruit1': fruit1, 'climb2': climb2, 'props2': props2}
if __name__ == '__main__':
    CMDS[sys.argv[1]]()
