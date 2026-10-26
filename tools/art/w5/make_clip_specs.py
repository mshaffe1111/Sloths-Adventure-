"""Write the World 5 clip specs: the Tarantula Queen's boss moves from her own atlas poses (spec-w5qclips.json), and her tea-party
gestures and Meeca's carving from the picked edits (spec-w5tea.json, after the edit job).

    python3 -I tools/art/w5/make_clip_specs.py [--tea SIT_STILL POUR_STILL CARVE_STILL]

Clip names are "w5-<creature>-<move>-s<seed>": reanim/pack.py reads the start picture's meta under "<creature>-<move>" (see the
packall meta_from in spec-w5qpack.json). Every attack has a wind-up the game can hold for its tell (at least 0.6 s).
"""
import json, sys
from pathlib import Path

G = Path(__file__).resolve().parents[1] / 'gen'
M = 'slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion, '
Q = 'a giant hairy dark brown tarantula with orange bands and orange eyes '
END = ', side view facing right, she stays in the middle of the frame'
MOTION = {'high': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_high_noise.safetensors'],
          'low': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_low_noise.safetensors'], 'scale': 1.0}
# move: (start frame, what she does, seeds, size)
QUEEN = {
    'idle': ('idle', 'stands in place, breathing slowly, shifting her legs a little and twitching her fangs', (3, 11), (832, 480)),
    'skitter': ('walk_0', 'scuttles in place with a quick eight-legged walking cycle, a smooth walking cycle', (3, 11), (832, 480)),
    'silk': ('idle2', 'slowly rears back and lifts her front legs, holds still, then lunges forward and spits a thick strand of white silk', (3, 11), (832, 480)),
    'slam': ('stomp', 'holds her two front legs raised high, then slams them down hard onto the ground', (3, 11), (832, 576)),
    'net': ('screech', 'rears up tall with her front legs spread wide above her head, holds, then flings them forward as if throwing a net', (3, 11), (832, 576)),
    'hurt': ('hurt', 'jolts back from a hit, legs flinching, then steadies herself', (3,), (832, 480)),
    'stunned': ('dizzy', 'sways dazedly in place, her legs wobbling and her head lolling', (3, 11), (832, 480)),
    'defeat': ('hurt', 'is beaten: she slumps down, her legs curl up underneath her and she lies still', (3, 11), (832, 480)),
}


def clip(name, src, prompt, seed, wh):
    return {'name': name, 'src': src, 'prompt': prompt, 'seed': seed, 'w': wh[0], 'h': wh[1]}


def queen():
    cl = [clip(f'w5-queen-{mv}-s{s}', f'stills/w5q-{fr}.png', M + Q + what + END, s, wh)
          for mv, (fr, what, seeds, wh) in QUEEN.items() for s in seeds]
    (G / 'spec-w5qclips.json').write_text(json.dumps({'tag': 'w5qclips', 'script': 'tools/art/w5/w5gpu.py', 'flavor': 'rtx-pro-6000',
                                                       'parts': 2, 'motion': MOTION, 'clips': cl}, indent=1))
    print(len(cl), 'queen clips')


def tea(sit, pour, carve):
    cl = []
    for s in (3, 11):
        cl.append(clip(f'w5-queen-sit-s{s}', sit, M + Q + 'holds one front leg out in a gracious welcoming gesture, gently sweeps it toward an unseen chair, then lowers it politely' + END, s, (832, 480)))
        cl.append(clip(f'w5-queen-pour-s{s}', pour, M + Q + 'holds a small china teapot in her front legs and slowly tilts it to pour, then sets it level again' + END, s, (832, 480)))
        cl.append(clip(f'w5-meeca-carve-s{s}', carve, M + 'a young girl sloth in a pink vest with a race bib, green shorts and a pink headband scratches letters into an unseen surface in front of her with a tiny hairpin, her arm moving in quick small strokes, glancing back over her shoulder, side view facing right, she stays in the middle of the frame', s, (704, 704)))
    (G / 'spec-w5tea.json').write_text(json.dumps({'tag': 'w5tea', 'script': 'tools/art/w5/w5gpu.py', 'flavor': 'rtx-pro-6000',
                                                    'motion': MOTION, 'clips': cl}, indent=1))
    print(len(cl), 'tea and carve clips')


if __name__ == '__main__':
    if '--tea' in sys.argv:
        i = sys.argv.index('--tea')
        tea(*sys.argv[i + 1:i + 4])
    else:
        queen()
