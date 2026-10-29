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
