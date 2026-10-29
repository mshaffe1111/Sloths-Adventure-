"""Write the story-art job specs (storygpu.py) and print the job args.

    python3 -I tools/art/storyart/make_spec.py <set> <commit>     -> tools/art/storyart/spec-<set>.json
    python3 -I tools/art/storyart/make_spec.py args <set> <commit> -> the hf_jobs run args
Commit and push the spec first: the job fetches storygpu.py and the spec from GitHub raw at that commit.
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
LORAS = {
    'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors'],
    'pokey': ['mshaffe111/pokey-qwen-lora', 'pokey_qwen_v1.safetensors'],
    'meeca': ['mshaffe111/meeca-qwen-lora', 'meeca_qwen_v1.safetensors'],
    'dot': ['mshaffe111/dot-qwen-lora', 'dot_qwen_v1.safetensors'],
    'general': ['mshaffe111/general-qwen-lora', 'general_qwen_v1.safetensors'],
    'ironclaw': ['mshaffe111/ironclaw-qwen-lora', 'ironclaw_qwen_v1.safetensors'],
}
END = ', full body, painted storybook illustration, crisp clean dark outlines, soft cel shading, light from the upper left, plain flat grey background'
POKEY = ('pokeysloth, a friendly young three-toed sloth with warm orange-brown fur, a cream face and belly, dark brown eye patches, '
         'a brown leather satchel on a strap over his left shoulder with the bag at his right hip, white bandage wraps on both wrists, ')
GENERAL = ('ironclawwar, generalsloth, a huge old broad brown sloth general, thick shaggy brown fur, an old weathered grieving face with '
           'heavy brows and tired glowing red eyes, a long dark green soldier\'s greatcoat with brass buttons and a leather belt, a spiked '
           'silver pauldron on one shoulder, a red scarf, a torn crimson cape, ')
NEG_FIG = ('background scenery, floor, ground, cast shadow, text, letters, watermark, frame, photo, 3d render, blurry, extra limbs, '
           'extra arms, extra legs, extra fingers, two heads, deformed, cropped')
NEG_GEN = NEG_FIG + ', robot, metal body, full plate armour, helmet, plume, toy, mask, tin can'
PLATE_NEG = 'characters, people, animals, sloths, creatures, text, letters, watermark, frame, border, photo, 3d render, blurry'


def calib(commit):
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    it = []
    pose = {'idle': 'standing relaxed and smiling', 'worried': 'standing worried, hands on top of his head',
            'duck': 'crouching low and scared, gripping the ground with both paws', 'talk_b': 'standing and talking, one paw raised'}
    for n, st, lo in [('idle', 0.35, [['pokey', 1.0]]), ('idle', 0.5, [['pokey', 1.0]]), ('idle', 0.5, [['pokey', 1.0], ['style', 0.5]]),
                      ('worried', 0.35, [['pokey', 1.0]]), ('worried', 0.5, [['pokey', 1.0]]), ('worried', 0.5, [['pokey', 1.0], ['style', 0.5]]),
                      ('duck', 0.42, [['pokey', 1.0]]), ('talk_b', 0.42, [['pokey', 1.0]])]:
        it.append({'name': f'pk-{n}-s{round(st * 100)}-{len(lo)}', 'start': f'calib-pokey-{n}.png', 'prompt': POKEY + pose[n] + END,
                   'neg': NEG_FIG, 'strength': st, 'seed': 7, 'w': 1024, 'h': 1024, 'loras': lo})
    gp = {'idle': 'standing tall, holding a spiked wooden club over his shoulder, glaring', 'roar': 'roaring in anger, club raised high',
          'fallen': 'lying beaten face down in a heap of broken stone rubble, eyes shut'}
    for n, st in [('idle', 0.55), ('idle', 0.7), ('roar', 0.55), ('roar', 0.7), ('fallen', 0.55)]:
        it.append({'name': f'gn-{n}-s{round(st * 100)}', 'start': f'calib-gen-{n}.png', 'prompt': GENERAL + gp[n] + END, 'neg': NEG_GEN,
                   'strength': st, 'seed': 7, 'w': 1024, 'h': 1024, 'loras': [['ironclaw', 0.8], ['general', 0.5]]})
    cp = ('slothadv style, painted storybook illustration, a stormy evening courtyard of an old stone fortress high in the mountains, a tall '
          'round grey stone tower rising high on the left up into the storm clouds with one small warm lit arched window, black thorn vines '
          'climbing the stone walls, broken stone rubble, wet flagstones, heavy dark blue storm clouds, rain, no characters, no text')
    for sd in (5, 9):
        it.append({'name': f'pl-courtyard-a{sd}', 'start': 'calib-plate-courtyard.png', 'mask': 'calib-plate-courtyard-mask.png', 'prompt': cp,
                   'neg': PLATE_NEG, 'strength': 1.0, 'seed': sd, 'w': 1280, 'h': 1360, 'loras': [['style', 1.0]]})
    it.append({'name': 'pl-courtyard-a5-full', 'then': 'pl-courtyard-a5', 'prompt': cp, 'neg': PLATE_NEG, 'strength': 0.3, 'seed': 5,
               'w': 2560, 'h': 2720, 'tile': [1280, 256], 'loras': [['style', 1.0]]})
    gr = ('slothadv style, painted storybook illustration, a long thick mossy tree branch seen exactly from the side, running straight across '
          'the whole picture, its top covered in soft green moss with tiny orange and pink flowers and little fern sprouts, brown bark with '
          'grooves below, plain flat grey background above the branch, no characters, no text')
    for st in (0.7, 0.85):
        it.append({'name': f'gr-w1-s{round(st * 100)}', 'start': 'calib-ground-w1.png', 'prompt': gr, 'neg': PLATE_NEG, 'strength': st,
                   'seed': 3, 'w': 2048, 'h': 512, 'loras': [['style', 1.0]]})
    return {'tag': 'calib', 'loras': LORAS, 'base': base, 'items': it}


SOFT = ', blurry, soft focus, airbrushed, smooth gradient shading, low detail'
MEECA = ('meecasloth, a young female sloth with soft brown fur and a cream face, a pink headband, a pink running vest with a white race bib '
         'number 07, teal shorts and pink running shoes, ')
EDIT_GEN = ('Redraw this same sloth as a grieving old grandfather who has become a war general. Keep exactly his pose, his size and position, '
            'his spiked wooden club, the spiked silver plate on his shoulder, his red scarf and torn crimson cape, and his glowing red eyes. '
            'Dress him in a long dark green soldier\'s greatcoat with two rows of brass buttons and a wide leather belt, worn under the cape and '
            'open over his belly. Give him thick, real, shaggy brown sloth fur with darker tips, an old lined face, grey in his brows and around '
            'his muzzle, heavy tired eyes. He is a sloth, not a robot: no helmet, no metal suit, no plume. Same painted storybook style with '
            'dark ink outlines and soft cel shading. Plain flat grey background.')
EDIT_GV = ('Redraw this same old sloth in the same pose, size and position: thick, real, shaggy brown sloth fur with darker tips, an old lined '
           'gentle face, grey in his brows and around his muzzle, sad tired brown eyes, his rust-coloured scarf, wrapped wrists, and an old '
           'unbuttoned dark green soldier\'s greatcoat with brass buttons hanging open. Same painted storybook style with dark ink outlines '
           'and soft cel shading. Plain flat grey background.')


def round2(commit):
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    it = []
    pose = {'idle': 'standing relaxed and smiling', 'worried': 'standing worried, hands on top of his head',
            'duck': 'crouching low and scared, gripping the ground with both paws'}
    for n in pose:
        for st in (0.5, 0.62):
            it.append({'name': f'r2-pk-{n}-s{round(st * 100)}', 'start': f'r2-pokey-{n}.png', 'prompt': POKEY + pose[n] + END,
                       'neg': NEG_FIG + SOFT, 'strength': st, 'seed': 7, 'w': 1024, 'h': 1024, 'loras': [['pokey', 1.0], ['style', 0.35]]})
    for k, words in (('mc-sing_reach', 'standing and reaching one paw out in front of him, palm open, offering his hand, eyes soft'),
                     ('mx-petal_glow', 'holding up his wrist in both paws where a small glowing pink petal is tied with a ribbon, looking at it in wonder')):
        for st in (0.55, 0.68):
            it.append({'name': f'r2-{k}-s{round(st * 100)}', 'start': f'r2-cel-{k}.png', 'prompt': POKEY + words + END,
                       'neg': NEG_FIG + SOFT, 'strength': st, 'seed': 7, 'w': 1024, 'h': 1024, 'loras': [['pokey', 1.0], ['style', 0.35]]})
    for st in (0.5, 0.62):
        it.append({'name': f'r2-meeca-idle-s{round(st * 100)}', 'start': 'r2-meeca-idle.png', 'prompt': MEECA + 'standing relaxed and smiling' + END,
                   'neg': NEG_FIG + SOFT, 'strength': st, 'seed': 7, 'w': 1024, 'h': 1024, 'loras': [['meeca', 1.0], ['style', 0.35]]})
    it.append({'name': 'r2-grandma-s55', 'start': 'r2-cel-gr-stand_hands.png', 'strength': 0.55, 'seed': 7, 'w': 1024, 'h': 1024,
               'prompt': 'slothadv style, a kind old grandmother sloth with pale grey-white fur, a cream face, a green gardening apron, standing with her paws folded in front of her, smiling warmly' + END,
               'neg': NEG_FIG + SOFT, 'loras': [['style', 1.0]]})
    # the General: the edit model puts the coat and the real fur on him, then his own models bring him back on model
    for n, src in (('idle', 'r2-gen-idle.png'), ('roar', 'r2-gen-roar.png'), ('fallen', 'r2-gen-fallen.png'), ('ready_a', 'r2-cel-gn-ready_a.png')):
        for sd in (3, 8):
            it.append({'name': f'r2-ged-{n}-{sd}', 'edit': True, 'start': src, 'prompt': EDIT_GEN, 'seed': sd,
                       'neg': 'robot, armour suit, helmet, plume, toy, text, watermark, extra limbs, blurry'})
    for sd in (3, 8):
        it.append({'name': f'r2-ged-gv-{sd}', 'edit': True, 'start': 'r2-cel-gv-stand.png', 'prompt': EDIT_GV, 'seed': sd,
                   'neg': 'robot, armour, helmet, text, watermark, extra limbs, blurry'})
    for n in ('idle', 'roar', 'ready_a'):
        it.append({'name': f'r2-gen-{n}-on', 'then': f'r2-ged-{n}-3', 'prompt': GENERAL + 'a tired grieving old soldier' + END, 'neg': NEG_GEN + SOFT,
                   'strength': 0.35, 'seed': 7, 'w': 1024, 'h': 1024, 'loras': [['ironclaw', 0.7], ['general', 0.6]]})
    cp = ('slothadv style, painted storybook illustration, a stormy evening courtyard of an old stone fortress, a tall round grey stone tower '
          'on the left rising high up into heavy dark blue storm clouds, its top a pointed slate roof, one small warm lit arched window, black '
          'thorn vines climbing the stone, rain, no characters, no text')
    for st, sd in ((0.85, 5), (0.95, 5), (0.85, 11)):
        it.append({'name': f'r2-pl-courtyard-s{round(st * 100)}-{sd}', 'start': 'r2-plate-courtyard.png', 'mask': 'r2-plate-courtyard-mask.png',
                   'prompt': cp, 'neg': PLATE_NEG, 'strength': st, 'seed': sd, 'w': 1280, 'h': 1360, 'loras': [['style', 1.0]]})
    for sd in (2, 6):
        it.append({'name': f'r2-pl-courtyard-edit-{sd}', 'edit': True, 'start': 'r2-plate-courtyard-canvas.png', 'seed': sd, 'w': 1280, 'h': 1360,
                   'prompt': ('Fill the empty white top of this picture so the painting carries on upward: the round grey stone tower on the left '
                              'goes on up past the lit window to a pointed slate roof, the stone wall on the right goes up a little and ends in '
                              'battlements, and above everything heavy dark blue storm clouds with rain. Keep the painted bottom part exactly as it '
                              'is. Same painted storybook style. No characters, no text.'),
                   'neg': 'white, blank, frame, border, text, characters'})
    gr = ('slothadv style, painted storybook illustration, the top edge of a lush rainforest floor seen from the side: soft dark green moss and '
          'leaf litter with small fern sprouts, a few pink petals and tiny red mushrooms, tufts of grass along its top edge, plain flat grey '
          'background above the ground, no characters, no text')
    for st in (0.4, 0.55):
        it.append({'name': f'r2-gr-w1-s{round(st * 100)}', 'start': 'r2-ground-w1.png', 'prompt': gr, 'neg': PLATE_NEG, 'strength': st,
                   'seed': 3, 'w': 2048, 'h': 512, 'loras': [['style', 1.0]]})
    return {'tag': 'r2', 'loras': LORAS, 'base': base, 'items': it}


DOT = ('dothummingbird, a small hummingbird with an emerald-green back, a magenta throat and a little brown pouch on a strap at her side, ')
FIG = {'pokey': (POKEY + 'in the same pose and expression', [['pokey', 1.0], ['style', 0.35]]),
       'meeca': (MEECA + 'in the same pose and expression', [['meeca', 1.0], ['style', 0.35]]),
       'dot': (DOT + 'in the same pose', [['dot', 1.0], ['style', 0.35]])}


def figures(commit, which='pokey', strength=0.55, only=None):
    """every frame of a set (starts.py figures <set>): the job builds each start from the game's own atlas at this commit"""
    meta = json.loads((H.parent / f'hfbatch/starts/storyart/meta-{which}.json').read_text())
    words, loras = FIG[which]
    it = []
    for key, m in meta.items():
        name = key[len(which) + 1:]
        if only and name not in only:
            continue
        face = name.startswith('face_')
        prompt = words + (', a close-up of his face' if face and which == 'pokey' else '') + END.replace(', full body', '' if face else ', full body')
        it.append({'name': f'{key}-s{round(strength * 100)}', 'start': {'src': m['src'], 'scale': m['scale'], 'ox': m['ox'], 'oy': m['oy'], 'size': m['size']},
                   'prompt': prompt, 'neg': NEG_FIG + SOFT, 'strength': strength, 'seed': 7, 'w': m['size'][0], 'h': m['size'][1], 'loras': loras})
    return {'tag': which, 'loras': {k: LORAS[k] for k in {'style', loras[0][0]}}, 'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/',
            'base': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/', 'items': it}


# what each plate goes on up into, above its old top edge, for the upright phones (the edit model paints it and keeps the rest)
PLATE_UP = {
    'hill': 'the great old tree goes on up into its huge spreading crown of leaves and hanging moss, and above it a wide golden dusk sky with a few soft pink clouds',
    'cell': 'the stone walls of the round tower cell go on up to a ceiling of heavy dark wooden beams, a cobweb in one corner, the arched window keeps its night sky',
    'warroom': 'the stone walls and pillars go on up to a high vaulted stone ceiling with dark beams, the hanging banners and the iron lantern on its chain from the ceiling',
    'door': 'the stone corridor walls and arches go on up to a vaulted stone ceiling in shadow, a little warm lantern light on the stones',
    'courtyard': 'the round grey stone tower on the left goes on up past the lit window to a pointed slate roof, the wall on the right ends in battlements, and above everything heavy dark blue storm clouds with rain',
    'nest-storm': 'the dark rainforest trees go on up into their tangled stormy canopy, and above it a dark purple storm sky turning and swirling, a far flash of lightning',
    'gates': 'the black fortress goes on up into its dark towers and spires with thorns, under a dark purple storm sky with lightning',
    'grandma-door': 'the trunk of the great tree goes on up into its huge leafy crown, with the deep green rainforest canopy and a little evening light coming through the leaves',
    'grandma-door-empty': 'the trunk of the great tree goes on up into its huge leafy crown, with the deep green rainforest canopy and a little grey after-storm light coming through the leaves',
    'tea': 'the silk-hung trees go on up into a dark violet canopy hung with great glowing spider webs like chandeliers and dangling silk threads',
    'cookhouse': 'the cookhouse walls go on up to a high roof of dark wooden rafters hung with more copper pots, bundles of herbs and strings of onions, warm firelight',
    'ruins': 'the mossy ruined stone pillars and the jungle go on up into a tall green rainforest canopy with soft shafts of light falling through',
    'village': 'the treehouses and the giant trees go on up into a misty rainforest canopy with more little round houses high in the branches and rope bridges between them, a soft morning sky',
}
PLATE_SAY = {
    'hill': 'a grassy hill with the oldest tree at golden dusk, a fortress far off on the right', 'cell': "a round stone tower cell at night",
    'warroom': "a fortress war room with a round map table", 'door': 'a stone fortress corridor with a wooden door',
    'courtyard': 'a stormy fortress courtyard with a round stone tower', 'nest-storm': 'a big woven nest on a rainforest branch in a night storm, two grown sloths far off along the branch',
    'gates': 'a black fortress at the top of a long stair, its gates open', 'grandma-door': "a round door in the hollow of a great tree at dusk",
    'grandma-door-empty': "a round door standing open in the hollow of a great tree after a storm", 'tea': "a long tea table under silk-hung trees",
    'cookhouse': 'a warm fortress kitchen with a black stove and copper pots', 'ruins': 'mossy jungle ruins with ten stone seats in a ring',
    'village': 'a rainforest treehouse village the morning after a storm',
}


def plates(commit, keys=None):
    """every plate: the edit model paints the room above it (and keeps the rest), then a tiled pass at 2560 wide with the game's style
    model paints it at full size"""
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    it = []
    for k, sd in [(k, sd) for k in (keys or PLATE_UP) for sd in (2, 6)]:
        it.append({'name': f'pl-{k}-up{sd}', 'edit': True, 'start': f'canvas-{k}.png', 'seed': sd, 'w': 1280, 'h': 1360,
                   'prompt': (f'Fill the empty white top of this picture so the painting carries on upward: {PLATE_UP[k]}. Keep the painted bottom part '
                              'as it is, with everything in the same place. Same painted storybook style. No characters, no text.'),
                   'neg': 'white, blank, frame, border, text, characters, people'})
        it.append({'name': f'pl-{k}-{sd}', 'then': f'pl-{k}-up{sd}', 'prompt': f'slothadv style, painted storybook illustration, {PLATE_SAY[k]}, no characters, no text',
                   'neg': PLATE_NEG, 'strength': 0.3, 'seed': 5, 'w': 2560, 'h': 2720, 'tile': [1280, 256], 'loras': [['style', 1.0]]})
    return it


WAR_REF = 'bucket:storyart/out/r2-ged-ready_a-3.png'
PLAIN_REF = 'bucket:storyart/out/r2-ged-gv-3.png'
LOOK_WAR = ('dressed and looking exactly like the old sloth general in the second picture: the long dark green soldier\'s greatcoat with two rows '
            'of brass buttons and the wide leather belt, the spiked silver shoulder plate, the red scarf, the torn crimson-red cape, thick real '
            'shaggy brown fur, the same old lined face with grey in his brows and around his muzzle')
LOOK_PLAIN = ('looking exactly like the old sloth in the second picture: the same old lined gentle face with grey in his brows and around his '
              'muzzle, thick real shaggy brown fur, the rust-coloured scarf and the old unbuttoned dark green soldier\'s greatcoat hanging open')
EDIT_END = (' Keep exactly the pose, the size and the position of the first picture, and its expression and eyes. Same painted storybook style '
            'with dark ink outlines and soft cel shading. Plain flat grey background, no white outline, no sticker border.')
EDIT_NEG = 'robot, armour suit, helmet, plume, toy, white outline, sticker, border, text, watermark, extra limbs, extra arms, blurry'


def general(commit):
    """the General, every frame: the edit model redraws each old frame in his new look (a design picture as the second reference), then his
    own models take him back on model at a low strength"""
    meta = json.loads((H.parent / 'hfbatch/starts/storyart/meta-cel.json').read_text())
    bm = json.loads((H.parent / 'hfbatch/starts/storyart/meta-r2.json').read_text())
    it = []

    def st(key, src=None):
        if src:
            return src
        m = meta[key]
        return {'src': m['src'], 'scale': m['scale'], 'ox': m['ox'], 'oy': m['oy'], 'size': m['size']}

    jobs = []
    for k in ('gn.dim', 'gn.glare', 'gn.lids', 'gn.narrow', 'gn.ready_a', 'gn.ready_b', 'gn.ready_c', 'gn.shut', 'gn.sleep_b', 'gb.stare'):
        jobs.append((k, st(f'cel-{k}'), WAR_REF, 'Redraw the sloth in the first picture ' + LOOK_WAR + ', with glowing red eyes where the first picture has them open.'))
    for n in ('idle', 'roar', 'fallen'):
        jobs.append((f'gn.card_{n}', f'r2-gen-{n}.png', WAR_REF, 'Redraw the sloth in the first picture ' + LOOK_WAR + ', with glowing red eyes.'
                     + (' He lies face down in the heap of broken stone rubble exactly as in the first picture.' if n == 'fallen' else '')))
    for k in ('gv.letter', 'gv.reach_a', 'gv.scout', 'gv.sit', 'gv.sorrow', 'gv.sorrow_b', 'gv.stand', 'gv.stand_m', 'gv.tea', 'gv.walk_a', 'gv.wipe_eye', 'gp.calm'):
        jobs.append((k, st(f'cel-{k}'), PLAIN_REF, 'Redraw the sloth in the first picture ' + LOOK_PLAIN + ', with sad tired brown eyes.'))
    for k in ('gy.smile', 'gy.stand', 'gy.stand_b', 'gy.turn_away'):
        jobs.append((k, st(f'cel-{k}'), PLAIN_REF, 'Redraw the sloth in the first picture as the sloth in the second picture when he was younger: '
                     'the same face but younger and kinder, darker brown fur with no grey, the rust-coloured scarf, no coat.'))
    jobs.append(('gc.hand', st('cel-gc.hand'), PLAIN_REF, 'Redraw the big sloth in the first picture as the sloth in the second picture when he '
                 'was younger: the same face but younger and kinder, darker brown fur with no grey, the rust-coloured scarf, no coat. Keep the little '
                 'sloth girl holding his hand exactly as she is, with her pink headband, pink vest with the race bib 07, teal shorts and pink shoes.'))
    for k, start, ref, words in jobs:
        it.append({'name': f'gen-{k}-e', 'edit': True, 'start': start, 'refs': [ref], 'prompt': words + EDIT_END, 'seed': 3, 'neg': EDIT_NEG})
        war = k.startswith(('gn', 'gb'))
        it.append({'name': f'gen-{k}-s30', 'then': f'gen-{k}-e', 'strength': 0.3, 'seed': 7, 'w': 1024, 'h': 1024,
                   'prompt': (GENERAL if war else 'generalsloth, a huge old broad sloth with a rust-coloured scarf, ') + 'in the same pose' + END,
                   'neg': NEG_GEN + SOFT, 'loras': [['ironclaw', 0.5], ['general', 0.5], ['style', 0.35]] if war else [['general', 0.8], ['style', 0.35]]})
    return it


def round3a(commit):
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    it = general(commit) + plates(commit)
    return {'tag': 'r3a', 'loras': {k: LORAS[k] for k in ('style', 'general', 'ironclaw')}, 'base': base,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'items': it,
            'keep': [x['name'] for x in it if not x['name'].endswith('-e') and '-up' not in x['name']], 'q': 90}


GRANDMA = 'slothadv style, a kind old grandmother sloth with pale grey-white fur, a cream face, round spectacles and a green gardening apron, '
PELL = 'slothadv style, a nervous gentle young sloth lieutenant with grey-brown fur in a neat olive-green army uniform and a peaked cap, '
CRIER = 'slothadv style, a small pompous old tamarin monkey town crier with a white mane and a patterned brown coat, '
MAIL = 'slothadv style, a calm grey sloth mail carrier with a brown postbag on a strap and a flat cap, '
PAIR = ('a friendly young sloth with orange-brown fur and a cream face, a brown satchel and bandaged wrists, together with a young female sloth '
        'with a pink headband, a pink vest with the race bib 07 and teal shorts, ')
CUB = ('pokeysloth as a small cub, a friendly little three-toed sloth with orange-brown fur and a cream face, a little pink bow on his head, a '
       'small satchel strap, ')
CEL_LOOK = {  # prefix: (words, loras, key colour)
    'pk': (MEECA, [['meeca', 1.0], ['style', 0.35]], None), 'face': (MEECA + 'a close-up of her face, ', [['meeca', 1.0], ['style', 0.35]], None),
    'mc': (POKEY, [['pokey', 1.0], ['style', 0.35]], None), 'mx': (POKEY, [['pokey', 1.0], ['style', 0.35]], None),
    'mb': (CUB, [['pokey', 0.8], ['style', 0.4]], None),
    'da': (PAIR, [['pokey', 0.55], ['meeca', 0.55], ['style', 0.4]], None), 'db': (PAIR, [['pokey', 0.55], ['meeca', 0.55], ['style', 0.4]], None),
    'hug': (PAIR, [['pokey', 0.55], ['meeca', 0.55], ['style', 0.4]], None),
    'gr': (GRANDMA, [['style', 1.0]], (60, 170, 90)), 'lp': (PELL, [['style', 1.0]], (210, 80, 200)), 'tc': (CRIER, [['style', 1.0]], None),
    'po': (MAIL, [['style', 1.0]], (60, 170, 90)),
}


def cels(commit, strength=0.55):
    """every story-sheet cel but the General's (general()), on its character's model (or the style model for the folk)"""
    meta = json.loads((H.parent / 'hfbatch/starts/storyart/meta-cel.json').read_text())
    it = []
    for key, m in meta.items():
        pre, pose = key[4:].split('.')
        if pre not in CEL_LOOK:
            continue
        words, loras, kc = CEL_LOOK[pre]
        raw = m['cel'].get('c') == 'raw'
        st = {'src': m['src'], 'scale': m['scale'], 'ox': m['ox'], 'oy': m['oy'], 'size': m['size']}
        if kc:
            st['key'] = list(kc)
        it.append({'name': f'{key}-s{round(strength * 100)}', 'start': st, 'seed': 7, 'w': m['size'][0], 'h': m['size'][1],
                   'prompt': words + f'{pose.replace("_", " ")}, in the same pose and expression' + (', painted storybook illustration' if raw else END),
                   'neg': NEG_FIG + SOFT, 'strength': 0.45 if raw else strength, 'loras': loras})
    return it


def grounds(commit):
    """each world's ground strip, from the floor of its own near backdrop (starts.py band)"""
    words = {1: 'soft dark green moss and leaf litter with small fern sprouts, a few pink petals and tiny red mushrooms',
             2: 'a muddy river bank with smooth brown pebbles, tufts of reeds and wet sand', 3: 'dark wet cave stone with glowing teal mushrooms and moss',
             4: 'flat grey cliff stones with moss and little ferns, mountain grass', 5: 'bright green moss over tangled tree roots with white flowers and pink petals',
             6: 'dark mangrove mud with roots and wet stones', 7: 'old cracked temple paving stones with roots and leaves',
             8: 'a dark night forest floor of blue-green ferns and pale star flowers', 9: 'black volcanic rock with glowing orange cracks and red flowers',
             10: 'wet dark slate stones of a mountain path in the rain'}
    return [{'name': f'gr-w{w}-s{round(st * 100)}', 'start': f'band-w{w}.png', 'strength': st, 'seed': 3, 'w': 2048, 'h': 512, 'loras': [['style', 1.0]],
             'prompt': (f'slothadv style, painted storybook illustration, the top edge of the ground seen from the side: {d}, its top edge uneven and '
                        'natural with little tufts, plain flat grey background above the ground, no characters, no text'), 'neg': PLATE_NEG}
            for w, d in words.items() for st in (0.4, 0.55)]


def round3b(commit):
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    it = grounds(commit) + cels(commit)
    return {'tag': 'r3b', 'loras': {k: LORAS[k] for k in ('style', 'pokey', 'meeca')}, 'base': base,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'items': it, 'q': 92}


def args(name, commit):
    raw = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/storyart'
    get = (f'mkdir -p /out/storyart/jobs && curl -fsSL {raw}/storygpu.py -o /out/storyart/jobs/storygpu.py && '
           f'curl -fsSL {raw}/spec-{name}.json -o /out/storyart/jobs/spec-{name}.json && sha256sum /out/storyart/jobs/storygpu.py && ')
    print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '3h', 'detach': True,
                      'command': ['bash', '-lc', get + f'SUB=storyart SPEC=storyart/jobs/spec-{name}.json '
                                  f'TAG={name} python /out/storyart/jobs/storygpu.py'],
                      'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'name': f'storyart-{name}'}, indent=1))


if __name__ == '__main__':
    if sys.argv[1] == 'args':
        args(sys.argv[2], sys.argv[3])
    elif sys.argv[1] == 'figures':
        spec = figures(sys.argv[2], sys.argv[3], float(sys.argv[4]) if len(sys.argv) > 4 else 0.55)
        (H / f'spec-{sys.argv[3]}.json').write_text(json.dumps(spec, indent=1))
        print(len(spec['items']), 'items')
    else:
        spec = globals()[sys.argv[1]](sys.argv[2])
        (H / f'spec-{sys.argv[1]}.json').write_text(json.dumps(spec, indent=1))
        print(len(spec['items']), 'items')
