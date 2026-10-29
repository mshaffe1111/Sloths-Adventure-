"""World 6-10 guardians animated (2026-10-28): write the specs for the start pictures (CPU) and the boss clips (GPU).

    python3 -I tools/art/w6to10/make_specs.py

Writes tools/art/gen/spec-w6to10-starts.json (tasks for tools/art/w5/w5cpu.py: each boss's own painted atlas poses, 4x Real-ESRGAN,
on a 1024 square of flat grey -> bucket stills/<tag>-<frame>.png + stills/<tag>-meta.json + stills/w5c-starts-<tag>.jpg) and
tools/art/gen/spec-w6to10-clips-<boss>.json (one GPU job per boss for tools/art/anim/animgpu.py, SUB=w6to10: Wan 2.2 I2V with the
motion model v1, two seeds a move; results in the bucket under w6to10/clips/). Clip names are "w6t-<boss>-<move>-s<seed>" so
reanim/pack.py's start_of finds the meta key "<boss>-<frame>" ... see START below for the frame each move starts from.

Every move that attacks is one clip from its warning pose: it winds up, HOLDS (the tell, ~1 s), then strikes, so the tell frames and
the act frames come from the same clip (the Queen's pattern, spec-w5qclips.json).
"""
import json
from pathlib import Path

H = Path(__file__).resolve().parent
GEN = H.parent / 'gen'
M = 'slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion, '
MOTION = {'high': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_high_noise.safetensors'],
          'low': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_low_noise.safetensors'], 'scale': 1.0}
END = ', side view facing right the whole time, it stays in the middle of the frame'
SEEDS = (3, 11)
SQ, WIDE, TALL = (704, 704), (832, 480), (832, 576)

# boss -> (atlas, start tag, who, {move: (atlas frame, clip size, what it does)})
BOSSES = {
    'ironclaw': ('ironclaw', 'w10ic',
                 'a big stocky brown sloth warlord with glowing red eyes, a spiked silver shoulder plate, a red scarf and a long torn crimson cape, holding a spiked wooden club, ', {
        'idle': ('idle', TALL, 'stands in place breathing heavily and glaring, the club resting on his shoulder, his cape stirring, a smooth repeating idle'),
        'march': ('march1', TALL, 'marches forward in place with heavy stomping steps, swinging the club at his side, his cape swaying, a smooth repeating walking cycle'),
        'charge': ('charge', WIDE, 'charges forward in place, running hard with his head down and the club held low, his cape flying behind him, a smooth repeating running cycle'),
        'slam': ('overhead1', TALL, 'holds the spiked club raised high over his head, holds perfectly still for a moment, then slams it straight down hard onto the ground in front of him'),
        'slash': ('armed', WIDE, 'draws the club back slowly behind him and holds it there, then swings it in a wide fast sideways slash in front of him and follows through'),
        'roar': ('roar', TALL, 'throws his head back and roars a furious war cry, his arms spread wide and his cape flaring out'),
        'stomp': ('stomp1', TALL, 'lifts one foot high and holds it there, then stomps it down hard on the ground'),
        'hurt': ('hurt', TALL, 'jolts back from a hit, flinching and grimacing, then steadies himself'),
        'stunned': ('stunned', TALL, 'stands dazed and dizzy, swaying and wobbling while leaning on his club, his eyes unfocused, a smooth repeating cycle'),
        'defeat': ('knockback', WIDE, 'is knocked backwards, staggers, falls flat onto his back on the ground and lies still'),
    }),
    'golem': ('golem', 'w7g',
              'a giant stone golem built of mossy grey carved blocks with glowing blue runes and glowing blue eyes, holding a huge stone hammer, ', {
        'awaken': ('idle', WIDE, 'sits dormant and still, covered in moss, then its blue eyes light up, its stones crack and it slowly rises up to stand tall'),
        'march': ('march2', TALL, 'lumbers forward in place with slow heavy stone steps, its hammer in one hand, a smooth repeating walking cycle'),
        'charge': ('charge2', WIDE, 'rushes forward in place in heavy pounding strides, leaning forward, a smooth repeating running cycle'),
        'slam': ('overhead', WIDE, 'lifts its huge stone hammer high overhead and holds it there, then slams it down onto the ground'),
        'roar': ('roar', SQ, 'throws its arms wide and roars, the blue runes on its body blazing brighter'),
        'beam': ('shards', WIDE, 'slowly raises one arm and points it forward, holds still, then blasts a beam of bright blue light from its hand'),
        'quake': ('tremor', WIDE, 'lifts one huge foot and holds it up, then stamps it down sending a shockwave along the ground'),
        'hurt': ('hurt', WIDE, 'jolts back from a hit, chips of stone flying off it, then steadies itself'),
        'stunned': ('stunned', TALL, 'stands dazed, swaying and wobbling, its blue glow flickering dimly, a smooth repeating cycle'),
        'defeat': ('defeat1', WIDE, 'slumps forward, its blue glow fading out, and crumbles down into a heap of mossy stone blocks'),
    }),
    'drake': ('drake', 'w9d',
              'a huge dark green armoured lizard drake with a row of pale bony spikes down its back, a long thick tail and glowing yellow eyes, ', {
        'idle': ('idle', WIDE, 'stands in place on four legs breathing slowly, its sides heaving and its tail swaying, a smooth repeating idle'),
        'walk': ('idle', WIDE, 'walks forward in place on four heavy legs with a slow powerful lizard gait, its tail swaying, a smooth repeating walking cycle'),
        'breath': ('jawsnap', WIDE, 'rears its head back with its jaws wide open and holds, then breathes a long stream of orange fire straight forward'),
        'tail': ('tailcrush', WIDE, 'lifts its long tail high behind it and holds it there, then whips it down hard onto the ground behind it'),
        'stomp': ('stomp', WIDE, 'rears up on its hind legs and holds, then stamps both front feet down hard, rocks bursting up from the ground'),
        'leap': ('leapprep', WIDE, 'crouches low and holds, then leaps up and forward and lands heavily'),
        'roar': ('enrage', WIDE, 'raises its head and roars, the spikes on its back glowing bright yellow-orange'),
        'hurt': ('recoil', WIDE, 'jolts back from a hit, flinching, then steadies itself'),
        'stunned': ('stunned', WIDE, 'stands dazed and dizzy, swaying its head from side to side, a smooth repeating cycle'),
        'defeat': ('knockback', WIDE, 'topples over onto its side, its legs kick weakly, then it lies still'),
    }),
    'reaver': ('reaver', 'w6r',
               'a giant dark grey-brown river otter warrior standing on his hind legs, holding a long wooden spear with a pale stone tip, ', {
        'idle': ('idle', TALL, 'stands upright holding his spear, breathing, his whiskers twitching and his tail swaying, a smooth repeating idle'),
        'advance': ('adv_1', WIDE, 'walks forward in place in a low crouch with the spear held level in front of him, a smooth repeating walking cycle'),
        'thrust': ('guard', WIDE, 'draws his spear back and holds it there, then thrusts it forward hard and pulls it back'),
        'swipe': ('swipe', TALL, 'raises his spear high and holds, then swings it down in a big arc in front of him'),
        'vault': ('vault', SQ, 'plants his spear and vaults up into the air, then comes down smashing the spear onto the ground'),
        'mud': ('mudsling', WIDE, 'scoops up a big ball of mud with his paws, holds it back, then flings it forward'),
        'roar': ('roar', TALL, 'rears up tall and roars, his chest puffed out'),
        'hurt': ('hurt', WIDE, 'jolts back from a hit, flinching, then steadies himself'),
        'stunned': ('stunned', TALL, 'stands dazed and dizzy, swaying and wobbling, a smooth repeating cycle'),
        'defeat': ('hurt', WIDE, 'staggers, falls over backwards onto his back on the ground and lies still'),
    }),
    'thornbark': ('thornbark', 'wtb',
                  'a hulking dark brown sloth with burning red eyes, a rusted spiked shoulder plate, leather straps, a torn purple cape and a tattered purple banner on a pole on his back, ', {
        'idle': ('idle', WIDE, 'prowls in place hunched low, breathing heavily, his cape stirring, a smooth repeating idle'),
        'march': ('march2', WIDE, 'stalks forward in place with heavy hunched steps, a smooth repeating walking cycle'),
        'gallop': ('gallop1', WIDE, 'gallops forward in place on all fours, fast and low, a smooth repeating running cycle'),
        'roar': ('roar', WIDE, 'rears back and roars furiously, his arms spread wide'),
        'whip': ('hook', WIDE, 'draws his arm back and holds, then lashes a long thorny briar whip forward and pulls it back'),
        'slam': ('overhead', TALL, 'raises both fists high above his head and holds, then slams them down onto the ground'),
        'claw': ('claw', WIDE, 'rakes the air in front of him with his claws in a fast flurry of swipes'),
        'leap': ('leapprep', WIDE, 'crouches low and holds, then leaps up and lands heavily'),
        'guard': ('block', WIDE, 'crosses his arms in front of his face in a guard and braces, trembling, a smooth repeating cycle'),
        'rest': ('rest', TALL, 'stands calmly with his bone club resting on his shoulder, breathing slowly, his face gentle and tired, a smooth repeating idle'),
    }),
    'monarch': ('monarch', 'w8m',
                'a giant dark grey bat with wide leathery dark wings, big pointed ears and glowing red eyes, ', {
        'hover': ('hover', SQ, 'hovers in place beating its wide leathery wings in big slow strokes, its body bobbing gently, a smooth repeating flying cycle'),
        'fly': ('fl_2', SQ, 'flies forward in place, beating its wings hard in big clear strokes, a smooth repeating flying cycle'),
        'glide': ('glide', SQ, 'glides forward with its wings spread wide, tilting gently and flapping once'),
        'screech': ('screech', SQ, 'spreads its wings wide and holds, then opens its mouth wide and screeches, its whole body shaking'),
        'dive': ('diveprep', SQ, 'pulls its wings up and holds, then swoops down and forward in a steep dive and pulls back up'),
        'hurt': ('hurt', SQ, 'jolts back in the air from a hit, wings crumpling, then flaps and steadies itself'),
        'fall': ('deadfall', SQ, 'goes limp, folds its wings and tumbles down, landing in a crumpled heap on the ground'),
        'roost': ('perched', SQ, 'hangs upside down wrapped in its wings, breathing slowly, then opens its red eyes and stretches its wings'),
    }),
}

# World 5's four posed creatures (trained models, pose sheets only: src/assets/enemies/<c>-poses.webp), animated from their own poses
# (starts via cpuwrap.py, which points w5cpu.py's atlas reader at the -poses sheets)
CREATURES = {
    'dangler': ('dangler', 'w5dg', 'a round fuzzy spider with a big black and yellow striped abdomen, a tan furry body, long brown legs and big shiny black eyes, ', {
        'idle': ('idle', WIDE, 'stands in place bobbing gently, its legs twitching and its big eyes blinking, a smooth repeating idle'),
        'move': ('move', SQ, 'hangs from a single silk thread and climbs up it and lowers itself back down, legs paddling, a smooth repeating cycle'),
        'attack': ('tell', SQ, 'rears back with its front legs raised and holds still, then lunges forward and snaps'),
        'hurt': ('hurt', WIDE, 'jolts back from a hit with a dizzy frown, legs flinching, then steadies itself'),
    }),
    'seamstress': ('seamstress', 'w5sm', 'a fluffy round pink spider grandma with round glasses, a white lace apron, thin black legs and two knitting needles, ', {
        'idle': ('idle', TALL, 'sits knitting busily, her needles clicking back and forth, a smooth repeating cycle'),
        'move': ('move', TALL, 'scuttles forward in place on her thin black legs, a smooth repeating walking cycle'),
        'attack': ('tell', TALL, 'raises her knitting needles high and holds still, then flings a long strip of white lace forward'),
        'hurt': ('hurt', TALL, 'jolts back from a hit, her glasses askew, then steadies herself'),
    }),
    'mantis': ('mantis', 'w5mt', 'a pink and white orchid mantis with petal-shaped legs, big green eyes and spiky pink forelegs, ', {
        'idle': ('idle', WIDE, 'sways gently from side to side like a flower in a breeze, its forelegs folded, a smooth repeating idle'),
        'move': ('move', WIDE, 'walks forward in place on four thin legs, swaying, a smooth repeating walking cycle'),
        'attack': ('tell', WIDE, 'raises its spiky forelegs and holds perfectly still, then strikes forward fast and pulls back'),
        'hurt': ('hurt', WIDE, 'jolts back from a hit, flinching, then steadies itself'),
    }),
    'dozer': ('dozer', 'w5dz', 'a fluffy lilac and cream moth with big soft wings with purple eye spots, feathery antennae and sleepy closed eyes, ', {
        'idle': ('idle', SQ, 'hovers sleepily in place, beating its soft wings slowly up and down, bobbing gently, a smooth repeating flying cycle'),
        'move': ('move', SQ, 'flies forward in place, beating its wings in big clear strokes, a smooth repeating flying cycle'),
        'attack': ('tell', SQ, 'puffs up and holds still, then blows a cloud of glittering golden sleep dust forward'),
        'hurt': ('hurt', SQ, 'jolts back in the air from a hit, wings crumpling, then flutters and steadies itself'),
    }),
}


def write():
    tasks, ctasks = [], []
    for boss, (atlas, tag, who, moves) in {**BOSSES, **CREATURES}.items():
        frames = sorted({f for f, _, _ in moves.values()})
        (tasks if boss in BOSSES else ctasks).append({'do': 'starts', 'atlas': atlas, 'tag': tag, 'frames': frames})
        clips = []
        for mv, (fr, (w, h), what) in moves.items():
            for s in SEEDS:
                clips.append({'name': f'w6t-{boss}-{mv}-s{s}', 'src': f'../stills/{tag}-{fr}.png', 'prompt': M + who + what + END,
                              'seed': s, 'w': w, 'h': h})
        spec = {'tag': f'w6to10-{boss}', 'script': 'tools/art/anim/animgpu.py', 'flavor': 'rtx-pro-6000', 'motion': MOTION,
                'start': {mv: fr for mv, (fr, _, _) in moves.items()}, 'clips': clips}
        (GEN / f'spec-w6to10-clips-{boss}.json').write_text(json.dumps(spec, indent=1))
        print(boss, len(clips), 'clips')
    (GEN / 'spec-w6to10-starts.json').write_text(json.dumps({'tag': 'w6to10-starts', 'script': 'tools/art/w5/w5cpu.py',
                                                             'flavor': 'cpu-upgrade', 'tasks': tasks}, indent=1))
    (GEN / 'spec-w6to10-starts-w5c.json').write_text(json.dumps({'tag': 'w6to10-starts-w5c', 'script': 'tools/art/w6to10/cpuwrap.py',
                                                                 'flavor': 'cpu-upgrade', 'tasks': ctasks}, indent=1))
    print('starts', sum(len(t['frames']) for t in tasks), 'frames')
    # the compact form bossgpu.py expands in the job (one small file to put through the connector instead of six big ones)
    compact = {'M': M, 'END': END, 'seeds': list(SEEDS), 'motion': MOTION,
               'bosses': {b: {'tag': tag, 'who': who, 'moves': {mv: [fr, list(wh), what] for mv, (fr, wh, what) in moves.items()}}
                          for b, (_, tag, who, moves) in {**BOSSES, **CREATURES}.items()}}
    (GEN / 'spec-w6to10-bosses.json').write_text(json.dumps(compact, separators=(',', ':')))


if __name__ == '__main__':
    write()
