"""Moving story plates (hf-cutscenes, 2026-10-31): a Wan 2.2 clip of each plate (tools/art/anim/animgpu.py, no motion model: the scene
moves, nobody acts), cut by tools/art/hfstory/livecut.py into only the parts that move, looped, over the sharp still painting
(src/game/livePlates.ts). Starts: the plate at 704 x 752 (its shape), in tools/art/hfstory/livestarts/.

    python3 tools/art/hfstory/make_spec_live.py spec <set> <commit>   -> spec-live-<set>.json
    python3 tools/art/hfstory/make_spec_live.py args <set> <commit>   -> the hf_jobs run args (fetches the starts into the bucket first)
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
TAIL = (' Static locked-off camera, the painting itself does not change, only the gentle natural motion; seamless calm loop, '
        'painted storybook style.')
NEG = ('camera movement, zoom, pan, tilt, dolly, shake, scene change, cut, new objects appearing, characters moving, morphing, '
       'melting, changing art style, text, watermark, blurry, flicker, strobe, fast motion')
SETS = {
    'a': {
        'courtyard': 'A stormy night over a stone castle courtyard: the dark storm clouds turn and drift slowly, light rain falls, '
                     'the lit window glows warmly and softly flickers, the thorn vines barely sway.',
        'nest-night': 'A stormy night in the jungle: the swirling storm clouds turn slowly around the bright eye, rain falls, a soft '
                      'lightning glow pulses in the clouds, the palm leaves and branches sway in the wind.',
        'gates': 'A dark fortress at night in a storm: storm clouds roll slowly, rain falls, the ten small green lights along the '
                 'walls glow and pulse gently, the light in the open gate flickers warmly, a faint lightning glow in the clouds.',
        'gorge': 'A misty gorge: the white mist drifts slowly and rolls between the cliffs, the waterfalls pour and shimmer, the '
                 'sloth hanging from the vine and the hummingbird stay where they are, the hummingbird\'s wings blur.',
        'tea': 'An enchanted forest tea party at night: the silk spider webs hung like chandeliers sway very gently, soft violet '
               'light glimmers, tiny motes of light drift.',
        'drake-cave': 'Inside a cave: the glowing lava crack pulses with warm orange light, heat shimmers, a few embers drift up, '
                      'the gold glints.',
        'village': 'A misty treetop village in the morning: soft mist drifts slowly between the trees, the rope bridges sway '
                   'gently, the colourful laundry flutters, the leaves rustle.',
        'cookhouse': 'A cosy cookhouse: steam curls up from the bubbling pots, the lanterns and the stove fire flicker warmly, the '
                     'hanging pans sway very slightly, a little smoke drifts.',
        'grandma-door': 'A round door in a great tree at dusk: the lantern and the window glow and flicker warmly, fireflies drift, '
                        'the ferns and leaves sway gently in a breeze.',
        'steps': 'A castle courtyard after the storm at night: the storm clouds drift slowly apart, the puddles ripple softly and '
                 'reflect the warm doorway light, a few last raindrops fall.',
    },
}


def spec(name):
    clips = [{'name': f'lv-{k}', 'src': f'starts/{k}.webp', 'prompt': say + TAIL, 'neg': NEG, 'seed': 11, 'w': 704, 'h': 752}
             for k, say in SETS[name].items()]
    return {'tag': f'live-{name}', 'clips': clips}


def args(name, commit):
    raw = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art'
    get = f'mkdir -p /out/hfcut/jobs /out/hfcut/starts && curl -fsSL {raw}/anim/animgpu.py -o /out/hfcut/jobs/animgpu.py && '
    get += f'curl -fsSL {raw}/hfstory/spec-live-{name}.json -o /out/hfcut/jobs/spec-live-{name}.json && '
    for k in SETS[name]:
        get += f'curl -fsSL {raw}/hfstory/livestarts/{k}.webp -o /out/hfcut/starts/{k}.webp && '
    get += 'pip install -q ftfy >/dev/null 2>&1; '
    print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '2h', 'detach': True,
                      'command': ['bash', '-lc', get + f'SUB=hfcut SPEC=hfcut/jobs/spec-live-{name}.json python /out/hfcut/jobs/animgpu.py'],
                      'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'],
                      'name': f'hfcut-live-{name}'}, indent=1))


if __name__ == '__main__':
    if sys.argv[1] == 'spec':
        (H / f'spec-live-{sys.argv[2]}.json').write_text(json.dumps(spec(sys.argv[2]), indent=1))
    else:
        args(sys.argv[2], sys.argv[3])
