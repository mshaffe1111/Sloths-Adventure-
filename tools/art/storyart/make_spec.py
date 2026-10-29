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
    else:
        spec = globals()[sys.argv[1]](sys.argv[2])
        (H / f'spec-{sys.argv[1]}.json').write_text(json.dumps(spec, indent=1))
        print(len(spec['items']), 'items')
