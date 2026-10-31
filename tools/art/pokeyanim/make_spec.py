"""Pokey's animation clips (pokey-anim, 2026-10-30): Wan 2.2 + the motion model from his own standard frames (starts.py), run by
tools/art/hfpokey/pokeygpu.py (results in the bucket mshaffe111/w5-xfer under hfpokey/clips/).

    python3 -I tools/art/pokeyanim/make_spec.py spec <commit with the starts>   -> spec-anim1.json (spec2 -> spec-anim2.json)
    python3 -I tools/art/hfpokey/make_spec.py args tools/art/pokeyanim/spec-anim1.json <commit>   (then fix the raw path: see jobs.txt)
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
M = ('slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion, '
     'a friendly brown three-toed sloth with a leather satchel strap and wrist wraps, side view facing right, ')
NEG = ('extra limbs, extra arms, extra sloth, turning around, facing left, facing the camera, background scenery, ground, floor line, '
       'shadow, text, watermark, blurry, photo, 3d render, camera movement, zoom, motion blur, smear')
MOTION = {'high': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_high_noise.safetensors'],
          'low': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_low_noise.safetensors'], 'scale': 1.0}
CLIPS = {
    'jump': ('bends his knees into a quick crouch, then springs straight up into a big jump with both arms reaching up, rises, '
             'tucks his legs a little at the very top, then falls back down with his arms out for balance and lands on the same spot in a '
             'soft crouch, then stands up again; he stays in the middle of the frame', 704, 704),
    'run': ('runs fast on the spot, a bouncy energetic cartoon run cycle with long strides, arms pumping, leaning forward, his body '
            'staying in the same place in the middle of the frame, a smooth repeating loop', 832, 480),
    'flip': ('in mid-air, curled into a tight ball, does one full forward somersault, rolling head over heels forward one complete turn, '
             'then opens up with his arms and legs out, still in the middle of the frame', 704, 704),
    'slide': ('drops low and slides forward on his bottom with his feet stretched out in front of him and his arms back for balance, '
              'a quick playful slide, then gets back up onto his feet; he stays in the middle of the frame', 832, 480),
    'skid': ('running fast, he plants his feet and skids to a sudden stop, leaning far back with his feet braced out in front and arms '
             'thrown back, his body staying in the middle of the frame, then turns his head to look back over his shoulder', 832, 480),
}
SEEDS = {'jump': [3, 11], 'run': [3, 11], 'flip': [3, 11], 'slide': [3], 'skid': [3]}
# round 2 (the lead's 9:30 list): the game draws the trunk and the rope, so the clip shows him gripping nothing on the grey
CLIPS2 = {
    'climb': ('climbs straight up a tall smooth tree trunk that is right in front of him, hand over hand, one paw reaching high and gripping '
              'while the opposite foot pushes up, then the other paw and foot, a steady repeating climbing cycle; his body stays in the '
              'middle of the frame as if the camera climbs with him; the trunk is invisible, only the plain grey', 704, 704),
    'climbdown': ('climbs carefully down a tall smooth tree trunk that is right in front of him, looking down past his feet, one foot '
                  'reaching down and gripping, then the opposite paw letting go and gripping lower, a steady repeating climbing-down cycle; '
                  'his body stays in the middle of the frame as if the camera climbs down with him; the trunk is invisible, only the plain grey', 704, 704),
    'rope': ('hangs by both paws from a rope stretched horizontally just above his head and moves along it to the right hand over hand, '
             'one paw letting go and reaching forward to grip the rope again further along, then the other paw, his legs swinging gently '
             'below, a smooth repeating cycle; he stays in the middle of the frame; the rope is invisible, only the plain grey', 704, 704),
    'punch': ('throws one strong forward punch: he winds up, turning his shoulders and pulling his far fist back by his cheek, then punches '
              'straight forward to the right with his arm fully stretched, holds it a moment, then pulls back into a ready guard, feet planted '
              'in the same spot', 832, 480),
}
SEEDS2 = {'climb': [3, 11], 'climbdown': [3], 'rope': [3, 11], 'punch': [3, 11]}
NEG2 = NEG + ', tree, trunk, pole, rope, branch, ladder, wall'


def spec(commit):
    cl = []
    for mv, (what, w, h) in CLIPS.items():
        for s in SEEDS[mv]:
            cl.append({'name': f'pa-{mv}-s{s}', 'src': f'gh:{commit}:reference/prop-sheets/qa-notes/pokey-anim/starts/{mv}.png',
                       'prompt': M + what, 'neg': NEG, 'seed': s, 'w': w, 'h': h})
    (H / 'spec-anim1.json').write_text(json.dumps({'tag': 'pokey-anim1', 'motion': MOTION, 'clips': cl}, indent=1))
    print(len(cl), 'clips')


def spec3(commit):
    """the punch re-rolled (pa-punch-s3 striped his wrist wraps red, pa-punch-s11 turned his back): his plain wraps spelled out"""
    what = CLIPS2['punch'][0].replace('throws one strong forward punch', 'throws one strong forward punch, his plain cream bandage wrist wraps '
                                      'and brown fur exactly as in the picture')
    neg = NEG2 + ', red stripes, striped wraps, red wraps, back view, turning away, facing away'
    cl = [{'name': f'pa-punch-s{sd}', 'src': f'gh:{commit}:reference/prop-sheets/qa-notes/pokey-anim/starts/punch.png', 'prompt': M + what,
           'neg': neg, 'seed': sd, 'w': 832, 'h': 480} for sd in (5, 7)]
    (H / 'spec-anim3.json').write_text(json.dumps({'tag': 'pokey-anim3', 'motion': MOTION, 'clips': cl}, indent=1))
    print(len(cl), 'clips')


def spec2(commit):
    cl = []
    for mv, (what, w, h) in CLIPS2.items():
        for sd in SEEDS2[mv]:
            cl.append({'name': f'pa-{mv}-s{sd}', 'src': f'gh:{commit}:reference/prop-sheets/qa-notes/pokey-anim/starts/{mv}.png',
                       'prompt': M + what, 'neg': NEG2, 'seed': sd, 'w': w, 'h': h})
    (H / 'spec-anim2.json').write_text(json.dumps({'tag': 'pokey-anim2', 'motion': MOTION, 'clips': cl}, indent=1))
    print(len(cl), 'clips')


if __name__ == '__main__':
    {'spec2': spec2, 'spec3': spec3}.get(sys.argv[1], spec)(sys.argv[2])
