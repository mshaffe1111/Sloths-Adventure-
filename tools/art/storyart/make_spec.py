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
    """the General, every frame: the edit model redraws each old frame in his new look from one written description (the same words and
    seed for every frame, so he stays one sloth), then his own models take him back on model at a low strength"""
    meta = json.loads((H.parent / 'hfbatch/starts/storyart/meta-cel.json').read_text())
    it = []

    def st(key):
        m = meta[key]
        return {'src': m['src'], 'scale': m['scale'], 'ox': m['ox'], 'oy': m['oy'], 'size': m['size']}

    WAR = ('Redraw this same sloth as a grieving old grandfather who has become a war general. Keep exactly his pose, his size and position, '
           'his expression and his eyes as they are in the picture (open and glowing red, half shut, or closed), his spiked wooden club, the spiked '
           'silver plate on his shoulder, his red scarf and his torn deep crimson-red cape. Dress him in a long dark green soldier\'s greatcoat with '
           'two rows of brass buttons and a wide leather belt, worn under the cape. Give him thick, real, shaggy brown sloth fur with darker tips, '
           'an old lined face, grey in his brows and around his muzzle. He is a sloth, not a robot: no helmet, no metal suit, no plume.')
    PLAIN = ('Redraw this same old sloth in the same pose, size and position, with the same expression: thick, real, shaggy brown sloth fur with '
             'darker tips, an old lined gentle face, grey in his brows and around his muzzle, sad tired brown eyes, his rust-coloured scarf, wrapped '
             'wrists, and an old unbuttoned dark green soldier\'s greatcoat with brass buttons hanging open.')
    YOUNG = ('Redraw this same sloth in the same pose, size and position, with the same expression, as a strong kind grandfather in his prime: '
             'thick, real, shaggy dark brown sloth fur with darker tips and no grey, a warm kind face, gentle brown eyes, his rust-coloured scarf, '
             'wrapped wrists, no coat.')
    TAIL = ' Same painted storybook style with dark ink outlines and soft cel shading. Plain flat grey background, no white outline, no sticker border.'
    jobs = [(k, st(f'cel-{k}'), WAR) for k in ('gn.dim', 'gn.glare', 'gn.lids', 'gn.narrow', 'gn.ready_a', 'gn.ready_b', 'gn.ready_c', 'gn.shut', 'gn.sleep_b', 'gb.stare')]
    jobs += [(f'gn.card_{n}', f'r2-gen-{n}.png', WAR + (' He lies beaten face down in the heap of broken stone rubble, exactly as in the picture.' if n == 'fallen' else ''))
             for n in ('idle', 'roar', 'fallen')]
    jobs += [(k, st(f'cel-{k}'), PLAIN) for k in ('gv.letter', 'gv.reach_a', 'gv.scout', 'gv.sit', 'gv.sorrow', 'gv.sorrow_b', 'gv.stand', 'gv.stand_m', 'gv.tea', 'gv.walk_a', 'gv.wipe_eye', 'gp.calm')]
    jobs += [(k, st(f'cel-{k}'), YOUNG) for k in ('gy.smile', 'gy.stand', 'gy.stand_b', 'gy.turn_away')]
    jobs.append(('gc.hand', st('cel-gc.hand'), YOUNG.replace('Redraw this same sloth', 'Redraw the big sloth') + ' Keep the little sloth girl holding '
                 'his hand exactly as she is, with her pink headband, pink vest with the race bib 07, teal shorts and pink shoes.'))
    for k, start, words in jobs:
        for sd in ((3, 8) if k == 'gn.card_fallen' else (3,)):
            tag = f'{k}-{sd}' if k == 'gn.card_fallen' else k
            it.append({'name': f'gen-{tag}-e', 'edit': True, 'start': start, 'prompt': words + TAIL, 'seed': sd, 'neg': EDIT_NEG})
            war = k.startswith(('gn', 'gb'))
            it.append({'name': f'gen-{tag}-s30', 'then': f'gen-{tag}-e', 'strength': 0.3, 'seed': 7, 'w': 1024, 'h': 1024,
                       'prompt': (GENERAL if war else 'generalsloth, a huge old broad sloth with a rust-coloured scarf, ') + 'in the same pose' + END,
                       'neg': NEG_GEN + SOFT, 'loras': [['ironclaw', 0.5], ['general', 0.5], ['style', 0.35]] if war else [['general', 0.8], ['style', 0.35]]})
    return it


def round3a(commit):
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    it = general(commit) + poses(commit)
    return {'tag': 'r3a', 'loras': {k: LORAS[k] for k in ('style', 'general', 'ironclaw', 'pokey')}, 'base': base,
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


GRIP = ('Redraw this same young sloth seen from behind, standing close in front of a wall (do not draw the wall) and gripping it with both '
        'paws raised flat in front of him at head height, holding on tight, shoulders hunched, head down, scared of the thunder. The brown leather '
        'satchel strap runs over his left shoulder and across his back to the bag on his right hip: seen from behind it runs from the left of '
        'the picture down to the bag at the right of the picture. White bandage wraps on both wrists.')
REACH = ('Redraw this same young sloth seen from behind and a little from the side: his left paw still flat on the wall in front of him at head '
         'height (do not draw the wall), his body half turned to the right, and his right arm held straight out to the right with the paw open, '
         'offering his hand to someone; he looks over his right shoulder with a brave, gentle face. The brown leather satchel strap runs over '
         'his left shoulder and across his back to the bag on his right hip. White bandage wraps on both wrists.')
FIG_END = ' Same size and position. Same painted storybook style with dark ink outlines and soft cel shading. Plain flat grey background.'


def poses(commit):
    """the pictures the new scenes need that had none: Pokey holding the tower wall with both paws, and the reach (the played let-go)"""
    meta = json.loads((H.parent / 'hfbatch/starts/storyart/meta-pokey.json').read_text())
    away = meta['pokey-away']
    st = {'src': away['src'], 'scale': away['scale'], 'ox': away['ox'], 'oy': away['oy'], 'size': away['size']}
    it = []
    for n, words in (('grip_wall', GRIP), ('reach_back', REACH)):
        for sd in (3, 9):
            it.append({'name': f'new-{n}-{sd}-e', 'edit': True, 'start': st, 'prompt': words + FIG_END, 'seed': sd, 'neg': EDIT_NEG + ', wall, bricks, stones'})
            it.append({'name': f'new-{n}-{sd}', 'then': f'new-{n}-{sd}-e', 'strength': 0.3, 'seed': 7, 'w': 1024, 'h': 1024, 'loras': [['pokey', 1.0], ['style', 0.35]],
                       'prompt': POKEY + 'seen from behind' + END, 'neg': NEG_FIG + SOFT})
    return it


def round3c(commit):
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    it = plates(commit)
    return {'tag': 'r3c', 'loras': {'style': LORAS['style']}, 'base': base, 'items': it, 'q': 90,
            'keep': [x['name'] for x in it if '-up' not in x['name']]}


def pairs(commit):
    """Pokey and Meeca together (da, db, hug): at 0.55 with both models the two came out alike (her headband and vest lost), so lower"""
    meta = json.loads((H.parent / 'hfbatch/starts/storyart/meta-cel.json').read_text())
    it = []
    for key, m in meta.items():
        pre, pose = key[4:].split('.')
        if pre not in ('da', 'db', 'hug'):
            continue
        raw = m['cel'].get('c') == 'raw'
        it.append({'name': f'{key}-s40', 'start': {'src': m['src'], 'scale': m['scale'], 'ox': m['ox'], 'oy': m['oy'], 'size': m['size']}, 'seed': 7,
                   'w': m['size'][0], 'h': m['size'][1], 'strength': 0.4, 'loras': [['pokey', 0.35], ['meeca', 0.35], ['style', 0.5]],
                   'prompt': ('two young sloths together: the boy with warm orange-brown fur, a brown leather satchel and white bandaged wrists, and the '
                              'girl with a pink headband, a pink vest with a white race bib 07, teal shorts and pink shoes, keep each of them exactly as they '
                              f'are, {pose.replace("_", " ")}') + (', painted storybook illustration' if raw else END), 'neg': NEG_FIG + SOFT})
    return it


def derived(commit, nest_pick, court_pick):
    """two plates made from repainted ones: the nest in the storm with nobody on the branch (the singing-storm memory, before and after
    the parents go), and the courtyard with the wet stone steps down from the tower door (the reunion: they sit on the wet steps)"""
    it = [{'name': 'pl-nest-night-e', 'edit': True, 'start': f'bucket:storyart/r3c/out/{nest_pick}.png', 'seed': 4, 'w': 1280, 'h': 1360,
           'prompt': ('Remove the two sloths on the far branch, so the long branch is empty, and keep everything else in the picture exactly as it is: '
                      'the nest, the trees, the storm sky. Same painted storybook style. No characters, no text.'), 'neg': 'sloths, animals, characters, text'},
          {'name': 'pl-steps-e', 'edit': True, 'start': f'bucket:storyart/r3c/out/{court_pick}.png', 'seed': 4, 'w': 1280, 'h': 1360,
           'prompt': ('Add a short wide flight of five worn wet stone steps coming down from a small arched wooden door at the foot of the round tower '
                      'onto the courtyard flagstones, in the lower left of the picture, puddles on the steps reflecting the warm window light. Keep '
                      'everything else exactly as it is. Same painted storybook style. No characters, no text.'), 'neg': 'characters, people, text'}]
    it.append({'name': 'pl-parents-e', 'edit': True, 'start': f'bucket:storyart/r3c/out/{nest_pick}.png', 'seed': 4, 'w': 1280, 'h': 1360,
               'prompt': ('Change only the two sloths on the far branch: make them two grown-up sloths of the same size, a mother and a father, seen from '
                          'behind as dark shapes against the storm, heads down, holding on, going away along the branch into the wind and rain. Keep '
                          'everything else exactly as it is: the nest, the trees, the turning storm sky, the lightning. Same painted storybook style. No text.'),
               'neg': 'cub, child, small sloth, faces, text'})
    for n, say in (('parents', 'a big woven nest on a rainforest branch in a night storm, two grown sloths far off along the branch'),
                   ('nest-night', 'a big woven nest on a rainforest branch in a night storm, nobody on the branch'),
                   ('steps', 'a stormy fortress courtyard with a round stone tower and wet stone steps down from its door')):
        it.append({'name': f'pl-{n}', 'then': f'pl-{n}-e', 'prompt': f'slothadv style, painted storybook illustration, {say}, no characters, no text',
                   'neg': PLATE_NEG, 'strength': 0.3, 'seed': 5, 'w': 2560, 'h': 2720, 'tile': [1280, 256], 'loras': [['style', 1.0]]})
    return it


EYES = {'glare': 'his red eyes wide open, glowing bright red and glaring', 'narrow': 'his glowing red eyes narrowed, the glow a little softer',
        'dim': 'his eyes half open, the red glow in them fading to a dull dark red', 'lids': 'his heavy eyelids drooping low over tired eyes, only a faint red left',
        'shut': 'his eyes gently closed', 'sleep_b': 'his eyes closed and his head bowed a little lower, as if he is falling asleep on his feet'}


def eyes(commit, base_pick):
    """the General's eyes going out as the song reaches him (GN:soften): every state an edit of ONE picture of him (only the eyes change),
    so the act does not jump from face to face"""
    it = []
    for n, words in EYES.items():
        it.append({'name': f'gen-gn.{n}-x', 'edit': True, 'start': f'bucket:storyart/r3a2/out/{base_pick}.png', 'seed': 3,
                   'prompt': f'Change only his eyes: {words}. Keep everything else in the picture exactly the same, every line and colour, his face, his pose, his clothes. Plain flat grey background.',
                   'neg': EDIT_NEG})
        it.append({'name': f'gen-gn.{n}-xs', 'then': f'gen-gn.{n}-x', 'strength': 0.25, 'seed': 7, 'w': 1024, 'h': 1024, 'prompt': GENERAL + 'in the same pose' + END,
                   'neg': NEG_GEN + SOFT, 'loras': [['ironclaw', 0.5], ['general', 0.5], ['style', 0.35]]})
    return it


def round4(commit, nest_pick='pl-nest-storm-6', court_pick='pl-courtyard-6', gen_base='gen-gn.ready_a-s30'):
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    it = derived(commit, nest_pick, court_pick) + pairs(commit) + eyes(commit, gen_base)
    return {'tag': 'r4', 'loras': {k: LORAS[k] for k in ('style', 'pokey', 'meeca', 'ironclaw', 'general')}, 'base': base, 'items': it, 'q': 90,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': [x['name'] for x in it if not x['name'].endswith('-e')]}


PK_FIX = {'alarm': 'alarmed and shocked, eyes wide open, mouth open', 'crossed': 'arms crossed, grumpy and stubborn, frowning',
          'impatient': 'arms crossed, impatient and annoyed, frowning, tapping his foot', 'point_a': 'pointing ahead, frowning and serious',
          'point_b': 'pointing ahead, upset and crying out, mouth open', 'tired': 'exhausted and sad, tears in his eyes, slumped',
          'wipe': 'wiping a tear from his eye with one paw, crying', 'slump': 'slumped down sitting exhausted, head hanging, eyes closed',
          'worried': 'worried and wincing, both paws on top of his head, one eye squeezed shut'}


def round4a(commit):
    """fixes after the first look: Pokey's frames whose face drifted (named expressions, lower strength), the General's eyes from one picture,
    his two story cards with the crimson cape and the shoulder plate, Pokey and Meeca together, and the wall grip and reach on his model"""
    meta = json.loads((H.parent / 'hfbatch/starts/storyart/meta-pokey.json').read_text())
    it = []
    for n, words in PK_FIX.items():
        m = meta[f'pokey-{n}']
        it.append({'name': f'pokey-{n}-s42', 'start': {'src': m['src'], 'scale': m['scale'], 'ox': m['ox'], 'oy': m['oy'], 'size': m['size']},
                   'prompt': POKEY + words + END, 'neg': NEG_FIG + SOFT, 'strength': 0.42, 'seed': 7, 'w': m['size'][0], 'h': m['size'][1],
                   'loras': [['pokey', 1.0], ['style', 0.35]]})
    it += eyes(commit, 'gen-gn.glare-s30')
    for n in ('card_idle', 'card_roar'):
        it.append({'name': f'gen-gn.{n}-f', 'edit': True, 'start': f'bucket:storyart/r3a2/out/gen-gn.{n}-s30.png', 'seed': 3, 'neg': EDIT_NEG,
                   'prompt': ('Change only two things: make his long cape a torn deep crimson-red, and put a spiked silver plate on his shoulder. Keep '
                              'everything else exactly the same: his face, his eyes, his pose, his greatcoat, his club. Plain flat grey background.')})
        it.append({'name': f'gen-gn.{n}-fs', 'then': f'gen-gn.{n}-f', 'strength': 0.25, 'seed': 7, 'w': 1024, 'h': 1024, 'prompt': GENERAL + 'in the same pose' + END,
                   'neg': NEG_GEN + SOFT, 'loras': [['ironclaw', 0.5], ['general', 0.5], ['style', 0.35]]})
    for n in ('grip_wall', 'reach_back'):
        it.append({'name': f'new-{n}-9-on', 'start': f'bucket:storyart/r3a2/out/new-{n}-9.png', 'strength': 0.45, 'seed': 7, 'w': 1024, 'h': 1024,
                   'loras': [['pokey', 1.0], ['style', 0.35]], 'prompt': POKEY + ('seen from behind, both paws raised holding on to a wall' if n == 'grip_wall' else
                   'reaching one paw out to the side, offering his hand') + END, 'neg': NEG_FIG + SOFT + ', wall'})
    it += pairs(commit)
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    return {'tag': 'r4a', 'loras': {k: LORAS[k] for k in ('style', 'pokey', 'meeca', 'ironclaw', 'general')}, 'base': base, 'items': it, 'q': 92,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': [x['name'] for x in it if not x['name'].endswith(('-e', '-x', '-f'))]}


PAIR_EDIT = ('Change only the sloth with the brown leather satchel: he wears no clothes at all, no vest, no race bib, no shorts, no shoes, just his '
             'warm orange-brown fur, cream belly, the satchel on its strap over his left shoulder to his right hip, and white bandages on his '
             'wrists. Keep the other sloth, the girl with the pink headband, exactly as she is in her pink vest with the race bib 07, teal shorts '
             'and pink shoes. Keep the pose, the size and the position of both of them exactly the same. Plain flat grey background.')


def pair_edits(commit):
    """Pokey and Meeca together: the old pair sheets drew him in her running kit (the first concept); the edit model takes it off him"""
    it = []
    for f in sorted((H.parent / 'hfbatch/starts/storyart').glob('meta-cel.json')):
        meta = json.loads(f.read_text())
    for key in meta:
        pre = key[4:].split('.')[0]
        if pre not in ('da', 'db', 'hug') or meta[key]['cel'].get('c') == 'raw':
            continue
        it.append({'name': f'{key}-pe', 'edit': True, 'start': f'bucket:storyart/r4a/out/{key}-s40.png', 'seed': 3, 'prompt': PAIR_EDIT, 'neg': EDIT_NEG})
        it.append({'name': f'{key}-ps', 'then': f'{key}-pe', 'strength': 0.28, 'seed': 7, 'w': 1024, 'h': 1024, 'loras': [['pokey', 0.4], ['meeca', 0.4], ['style', 0.4]],
                   'prompt': 'two young sloths together, the boy with orange-brown fur and a satchel, the girl in a pink headband, pink vest with bib 07 and teal shorts' + END,
                   'neg': NEG_FIG + SOFT})
    return it


def round4b(commit, nest_pick='pl-nest-storm-6', court_pick='pl-courtyard-6'):
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    it = derived(commit, nest_pick, court_pick) + pair_edits(commit)
    return {'tag': 'r4b', 'loras': {k: LORAS[k] for k in ('style', 'pokey', 'meeca')}, 'base': base, 'items': it, 'q': 90,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': [x['name'] for x in it if not x['name'].endswith(('-e', '-pe'))]}


def round4c(commit):
    """Grandma's door, lit: both repaints of it showed the seam where the old picture met the new sky, so it is made from the clean empty
    one (the same tree and door) by closing the door and lighting her lamp, then painted at full size like the others"""
    it = [{'name': 'pl-grandma-door-e', 'edit': True, 'start': 'bucket:storyart/r3c/out/pl-grandma-door-empty-2.png', 'seed': 4, 'w': 1280, 'h': 1360,
           'prompt': ('Close the round wooden door so it is shut, remove the chair, and light the house: the lantern beside the door and the round '
                      'window glow warm golden yellow, warm light spills onto the door, the path and the ferns, a potted fern by the door, a few '
                      'glowing fireflies. Keep everything else exactly as it is: the great tree, the forest, the sky, the composition. Same painted '
                      'storybook style. No characters, no text.'), 'neg': 'characters, people, animals, text'},
          {'name': 'pl-grandma-door', 'then': 'pl-grandma-door-e', 'neg': PLATE_NEG, 'strength': 0.3, 'seed': 5, 'w': 2560, 'h': 2720, 'tile': [1280, 256],
           'loras': [['style', 1.0]], 'prompt': ('slothadv style, painted storybook illustration, a round wooden door in the roots of a great rainforest '
                                                 'tree at dusk, warm lantern light, fireflies, no characters, no text')}]
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    return {'tag': 'r4c', 'loras': {'style': LORAS['style']}, 'base': base, 'items': it, 'q': 90,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': ['pl-grandma-door']}


PAIR_FIX = {
    # cel: [(mask, who, words)]: the figure in the wrong clothes painted again in place, on its own character model
    'da.kneel_tie': [('r', 'pokey', 'kneeling, holding out his bandaged wrist to her'), ('l', 'meeca', 'kneeling, tying a small petal on his wrist')],
    'db.side_by_side': [('l', 'meeca', 'standing beside him, looking at him')],
    'db.tie_stand': [('l', 'meeca', 'standing, reaching out to tie a small petal on his wrist')],
    'hug.hug_a': [('r', 'meeca', 'hugging him happily, her eyes closed')],
}


def round4d(commit):
    """the last four pair cels: the figure in the wrong clothes (Pokey in her running kit, or a second Pokey where Meeca should be, or Meeca
    gone grey) inpainted in place on its own character model, two seeds each"""
    it = []
    for key, fixes in PAIR_FIX.items():
        for sd in (3, 8):
            prev = None
            for i, (side, who, words) in enumerate(fixes):
                last = i == len(fixes) - 1
                name = f'cel-{key}-pi{sd}' if last else f'cel-{key}-pa{sd}'
                look = (POKEY.replace('warm orange-brown fur', 'warm muted caramel-brown fur') + 'no clothes, ') if who == 'pokey' else MEECA
                x = {'name': name, 'mask': f'pairmask-{key}-{side}.png', 'prompt': look + words + END, 'neg': NEG_FIG + SOFT, 'strength': 0.9,
                     'seed': sd, 'w': 1024, 'h': 1024, 'loras': [[who, 1.0], ['style', 0.35]]}
                if prev:
                    x['then'] = prev
                else:
                    x['start'] = f'bucket:storyart/r4b/out/cel-{key}-ps.png'
                it.append(x)
                prev = name
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    return {'tag': 'r4d', 'loras': {k: LORAS[k] for k in ('style', 'pokey', 'meeca')}, 'base': base, 'items': it, 'q': 92,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': [x['name'] for x in it]}


def round4e(commit):
    """kneel_tie again: r4d's Meeca (seed 8) kept, and Pokey painted again more gently (at 0.9 the model gave him a girl's face and hair)"""
    it = []
    for sd, st in ((4, 0.7), (9, 0.78)):
        it.append({'name': f'cel-da.kneel_tie-pj{sd}', 'start': 'bucket:storyart/r4d/out/cel-da.kneel_tie-pi8.png', 'mask': 'pairmask-da.kneel_tie-r.png',
                   'prompt': POKEY.replace('warm orange-brown fur', 'warm muted caramel-brown fur') + 'a sloth face with a dark brown eye patch, bare fur with '
                   'no vest, kneeling and holding out his bandaged wrist to her' + END,
                   'neg': NEG_FIG + SOFT + ', human, girl, hair, hairstyle, vest, shirt, clothes', 'strength': st, 'seed': sd, 'w': 1024, 'h': 1024,
                   'loras': [['pokey', 1.0], ['style', 0.35]]})
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    return {'tag': 'r4e', 'loras': {k: LORAS[k] for k in ('style', 'pokey')}, 'base': base, 'items': it, 'q': 92,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': [x['name'] for x in it]}


def round5b(commit):
    """the cards again at 16:9, 1920 x 1080 (story-a: upright shows the middle 4:3, sideways the middle band), with story-a's lines"""
    spec = round5(commit)
    spec['tag'] = 'r5b'
    for x in spec['items']:
        if x['name'].startswith('card-'):
            x['w'], x['h'] = 1920, 1080
    return spec


def round5(commit):
    """the finale's ending cards (S-7; starts from cards.py: the game's own pictures of each character on its world) and The Notch, the
    parents' find (a twig with growth notches in two hands), two strengths each"""
    meta = json.loads((H.parent / 'hfbatch/starts/storyart/meta-cards.json').read_text())
    who = {'venom-fang': ['pokey'], 'shadow-prowler': ['pokey'], 'night-wing-monarch': ['pokey'], 'magma-drake': ['pokey', 'meeca'], 'general': ['general']}
    it = []
    for k, m in meta.items():
        for st, sd in ((0.5, 3), (0.62, 6)):
            lo = [['style', 0.9]] + [[w, 0.35] for w in who.get(k, [])]
            it.append({'name': f'card-{k}-s{round(st * 100)}', 'start': f'card-{k}.png', 'strength': st, 'seed': sd, 'w': 1280, 'h': 960, 'loras': lo,
                       'prompt': f"slothadv style, painted storybook illustration, {m['words']}, warm and gentle, crisp clean outlines, rich painted detail, no text, no letters",
                       'neg': 'text, letters, words, signature, watermark, frame, border, photo, 3d render, blurry, extra limbs, deformed, humans, people'})
    for st, sd in ((0.7, 3), (0.8, 6)):
        it.append({'name': f'notch-s{round(st * 100)}', 'start': 'notch.png', 'strength': st, 'seed': sd, 'w': 768, 'h': 1024, 'loras': [['style', 1.0]],
                   'prompt': ('slothadv style, painted storybook illustration of a single small twig with a few tiny leaves, standing upright, many short '
                              'growth notches cut across it one above another, the lower notches small and neat, the upper ones rougher and deeper, '
                              'each upper notch with a tiny fern scratched beside it, pale wood showing in each cut, crisp clean dark outlines, soft cel '
                              'shading, plain flat grey background'),
                   'neg': 'text, letters, numbers, hand, person, animal, background scenery, table, floor, shadow, blurry'})
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    return {'tag': 'r5', 'loras': {k: LORAS[k] for k in ('style', 'pokey', 'meeca', 'general')}, 'base': base, 'items': it, 'q': 90,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': [x['name'] for x in it]}


def round5c(commit):
    """the second look at the cards: the squirrels and the croc's passengers without the sheet's white outline, the Queen with her tea
    table, the Reaver gentler (at 0.5 he stopped being himself); The Notch from a clearer start, gently; the snail (story-a's find), two
    creep frames"""
    meta = json.loads((H.parent / 'hfbatch/starts/storyart/meta-cards.json').read_text())
    it = []
    for k, sts in (('squirrels', (0.5, 0.58)), ('crocus-rex', (0.55, 0.62)), ('tarantula-queen', (0.45, 0.52)), ('marsh-reaver', (0.36, 0.42))):
        for st, sd in zip(sts, (4, 9)):
            lo = [['style', 0.9]] + ([['pokey', 0.35]] if k == 'tarantula-queen' else [])
            it.append({'name': f'card-{k}-t{round(st * 100)}', 'start': f'card-{k}.png', 'strength': st, 'seed': sd, 'w': 1920, 'h': 1080, 'loras': lo,
                       'prompt': f"slothadv style, painted storybook illustration, {meta[k]['words']}, warm and gentle, crisp clean outlines, rich painted detail, no text, no letters",
                       'neg': 'text, letters, words, writing, signature, watermark, frame, border, photo, 3d render, blurry, extra limbs, deformed, humans, people, white outline, sticker'})
    for st, sd in ((0.38, 3), (0.48, 6)):
        it.append({'name': f'notch-t{round(st * 100)}', 'start': 'notch.png', 'strength': st, 'seed': sd, 'w': 768, 'h': 1024, 'loras': [['style', 1.0]],
                   'prompt': ('slothadv style, painted storybook illustration of a single small brown twig standing upright with two little leaves, a long '
                              'row of growth notches cut across it one above another showing pale wood, the lower notches small and neat, the upper ones '
                              'rougher, a tiny fern scratched beside each upper notch, crisp clean dark outlines, soft cel shading, plain flat grey background'),
                   'neg': 'text, letters, numbers, hand, person, animal, background scenery, table, floor, shadow, blurry, ladder'})
    for f in ('stretch', 'bunch'):
        for st, sd in ((0.5, 3), (0.62, 6)):
            it.append({'name': f'snail-{f}-t{round(st * 100)}', 'start': f'snail-{f}.png', 'strength': st, 'seed': sd, 'w': 768, 'h': 512, 'loras': [['style', 1.0]],
                       'prompt': ('slothadv style, painted storybook illustration of one small friendly garden snail seen from the side facing right, a soft '
                                  'garden brown spiral shell, a pale tan body ' + ('stretched out long as it creeps' if f == 'stretch' else 'bunched up short as it creeps') +
                                  ', two eye stalks up, crisp clean dark outlines, soft cel shading, a clean simple silhouette, plain flat grey background'),
                       'neg': 'text, background scenery, ground, floor, shadow, slime trail, blurry, extra eyes, two snails'})
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    return {'tag': 'r5c', 'loras': {k: LORAS[k] for k in ('style', 'pokey')}, 'base': base, 'items': it, 'q': 90,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': [x['name'] for x in it]}


def round5d(commit):
    """the lead's redo of nine cards (each must show what its line names) and The Notch from a twig-like start"""
    meta = json.loads((H.parent / 'hfbatch/starts/storyart/meta-cards.json').read_text())
    who = {'night-wing-monarch': ['pokey'], 'magma-drake': ['pokey', 'meeca']}
    sts = {'flicker': (0.42, 0.52), 'marsh-reaver': (0.4, 0.48)}
    it = []
    for k in ('crocus-rex', 'magma-drake', 'night-wing-monarch', 'squirrels', 'flicker', 'mailman', 'pell', 'stone-golem', 'marsh-reaver'):
        for st, sd in zip(sts.get(k, (0.5, 0.6)), (5, 8)):
            lo = [['style', 0.9]] + [[w, 0.35] for w in who.get(k, [])]
            it.append({'name': f'card-{k}-u{round(st * 100)}', 'start': f'card-{k}.png', 'strength': st, 'seed': sd, 'w': 1920, 'h': 1080, 'loras': lo,
                       'prompt': f"slothadv style, painted storybook illustration, {meta[k]['words']}, warm and gentle, crisp clean outlines, rich painted detail",
                       'neg': 'readable text, words, signature, watermark, frame, border, photo, 3d render, blurry, extra limbs, deformed, humans, people, white outline, sticker, bee, wasp'})
    for st, sd in ((0.32, 3), (0.42, 6)):
        it.append({'name': f'notch-u{round(st * 100)}', 'start': 'notch.png', 'strength': st, 'seed': sd, 'w': 768, 'h': 1024, 'loras': [['style', 1.0]],
                   'prompt': ('slothadv style, painted storybook illustration of a single small crooked brown twig standing upright with two little leaves, rough '
                              'bark, small uneven notches cut into its sides one above another showing pale wood, tiny fern drawings scratched beside the '
                              'higher notches, crisp clean dark outlines, soft cel shading, plain flat grey background'),
                   'neg': 'text, letters, numbers, ladder, rungs, hand, person, animal, background scenery, table, floor, shadow, blurry'})
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    return {'tag': 'r5d', 'loras': {k: LORAS[k] for k in ('style', 'pokey', 'meeca')}, 'base': base, 'items': it, 'q': 90,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': [x['name'] for x in it]}


GUARD = {'croc': 'a big green crocodile with a small crooked gold crown', 'reaver': 'a big shaggy brown marsh otter warrior with a long wooden spear', 'golem': 'a huge mossy stone golem made of ancient carved rocks',
         'queen': 'a big black tarantula queen with a small gold crown', 'sovereign': 'a great harpy eagle with grey and white feathers and a crest',
         'monarch': 'a huge night butterfly monarch with dark patterned wings', 'drake': 'a big red and green scaled lava dragon'}


def round6(commit):
    """the guardians as the story shows them (2026-10-30 audit: their game frames were drawn up to 4.2 screen px per painted px in the boss
    scenes and read soft): each frame a story uses, from the game atlas, repainted at 4x on the style model, the same pose and outline"""
    meta = json.loads((H.parent / 'hfbatch/starts/storyart/meta-guard.json').read_text())
    it = []
    for key, m in meta.items():
        who = key.split('-', 1)[1].split('.')[0]
        it.append({'name': f'{key}-s34', 'start': {'src': m['src'], 'scale': m['scale'], 'ox': m['ox'], 'oy': m['oy'], 'size': m['size']},
                   'prompt': f'slothadv style, {GUARD[who]}, in the same pose' + END, 'neg': NEG_FIG + SOFT, 'strength': 0.34, 'seed': 7,
                   'w': 1024, 'h': 1024, 'loras': [['style', 0.8]]})
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    return {'tag': 'r6', 'loras': {'style': LORAS['style']}, 'base': base, 'items': it, 'q': 92,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': [x['name'] for x in it]}


FIX = {'magma-drake': 'two used china teacups with saucers standing on a flat dark rock beside the dragon, lit warm orange by the lava glow, a ring of tea in each, thin steam rising, painted at the same scale as the scene',
       'squirrels': 'a hand-made wooden sign board on a post with a carved and painted acorn symbol in the middle, rough painted wood grain',
       'pell': 'a crooked hanging wooden shop sign on two ropes with a painted needle and red thread symbol, rough painted wood grain'}


def round7(commit):
    """the lead's last three fixes: the Drake's cups painted into the scene, the two signs carry a painted symbol (no fake writing), and
    the snail painted the way the game's creatures are (outline, shading, a face), two frames"""
    it = []
    for k, words in FIX.items():
        for st, sd in (((0.72, 4), (0.84, 9)) if k == 'magma-drake' else ((0.58, 4), (0.68, 9))):
            it.append({'name': f'card-{k}-v{round(st * 100)}', 'start': f'fix-{k}.png', 'mask': f'cardmask-{k}.png', 'strength': st, 'seed': sd,
                       'w': 1920, 'h': 1080, 'loras': [['style', 0.9]],
                       'prompt': f'slothadv style, painted storybook illustration, {words}, crisp clean outlines, rich painted detail',
                       'neg': 'text, letters, words, writing, zigzag, signature, watermark, flat clip art, vector, photo, 3d render, blurry'})
    for f in ('stretch', 'bunch'):
        for st, sd in ((0.5, 3), (0.6, 6)):
            it.append({'name': f'snail-{f}-v{round(st * 100)}', 'start': f'snail-{f}.png', 'strength': st, 'seed': sd, 'w': 768, 'h': 512, 'loras': [['style', 1.0]],
                       'prompt': ('slothadv style, painted storybook illustration of one small friendly garden snail seen from the side facing right, a '
                                  'soft garden brown spiral shell with painted shading and highlights, a pale tan body ' + ('stretched out long as it creeps'
                                  if f == 'stretch' else 'bunched up short as it creeps') + ', two eye stalks with shiny eyes, a small content smile, '
                                  'crisp clean dark outlines, soft cel shading, plain flat grey background'),
                       'neg': 'text, background scenery, ground, floor, shadow, slime trail, blurry, flat vector, clip art, extra eyes, two snails'})
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    return {'tag': 'r7', 'loras': {'style': LORAS['style']}, 'base': base, 'items': it, 'q': 90,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': [x['name'] for x in it]}


def round7b(commit):
    """the Drake's cups again, from the earlier take of his card that had none: a rock and two cups by him, painted in gently"""
    spec = round7(commit)
    spec['tag'] = 'r7b'
    it = [x for x in spec['items'] if x['name'].startswith('card-magma-drake')]
    for x, (st, sd) in zip(it, ((0.58, 4), (0.68, 9))):
        x['strength'], x['seed'], x['name'] = st, sd, f'card-magma-drake-w{round(st * 100)}'
    spec['items'], spec['keep'] = it, [x['name'] for x in it]
    return spec


def round8(commit):
    """the lead's round after the audit: Crocus Rex's story stills at 4x (the guard set), Venom Fang's body tile at 4x, Pokey crouched with
    both paws gripping the branch (prologue 22-23), and the cubs with her paw over both of his (the singing storm 9)"""
    meta = json.loads((H.parent / 'hfbatch/starts/storyart/meta-guard.json').read_text())
    it = []
    for key, m in meta.items():
        if not key.startswith('guard-croc.'):
            continue
        it.append({'name': f'{key}-s34', 'start': {'src': m['src'], 'scale': m['scale'], 'ox': m['ox'], 'oy': m['oy'], 'size': m['size']},
                   'prompt': f'slothadv style, {GUARD["croc"]}, in the same pose' + END, 'neg': NEG_FIG + SOFT, 'strength': 0.34, 'seed': 7,
                   'w': 1024, 'h': 1024, 'loras': [['style', 0.8]]})
    it.append({'name': 'venom-body-4x-s30', 'start': 'venom-body-4x.png', 'strength': 0.3, 'seed': 5, 'w': 1280, 'h': 288, 'loras': [['style', 0.7]],
               'prompt': 'slothadv style, painted green snake scales, a seamless band of glossy scales, crisp painted detail, flat grey background',
               'neg': 'text, blurry, eyes, head'})
    for n, words, who in (('hold_branch', 'Make him crouch lower and hold on tight: both front paws gripping the branch under his feet, his eyes '
                           'squeezed shut with worry. Keep his face, his fur, the satchel strap over his left shoulder and the bandages on his wrists exactly the same. '
                           'Plain flat grey background.', [['pokey', 0.6], ['style', 0.4]]),
                          ('hands_rim', 'Make the girl sloth with the pink headband put one paw gently over both of the boy sloth\'s paws, which are '
                           'held together in front of him as if holding on to something, the boy looking worried and the girl smiling kindly at him. Keep '
                           'both of them exactly the same otherwise, their faces, their fur, her pink vest with bib 07, his satchel. Plain flat grey background.',
                           [['pokey', 0.4], ['meeca', 0.4], ['style', 0.4]])):
        it.append({'name': f'new-{n}-e', 'edit': True, 'start': f'new-{n}.png', 'seed': 3, 'prompt': words, 'neg': EDIT_NEG})
        it.append({'name': f'new-{n}-s', 'then': f'new-{n}-e', 'strength': 0.28, 'seed': 7, 'w': 1024, 'h': 1024, 'loras': who,
                   'prompt': (POKEY + 'crouching, both paws gripping the branch, worried' if n == 'hold_branch' else
                              'two young sloths together, the girl in a pink headband and pink vest with bib 07 puts her paw over both paws of the boy with the satchel') + END,
                   'neg': NEG_FIG + SOFT})
        it.append({'name': f'new-{n}-e2', 'edit': True, 'start': f'new-{n}.png', 'seed': 11, 'prompt': words, 'neg': EDIT_NEG})
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/storyart/'
    return {'tag': 'r8', 'loras': {k: LORAS[k] for k in ('style', 'pokey', 'meeca')}, 'base': base, 'items': it, 'q': 92,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': [x['name'] for x in it]}


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
