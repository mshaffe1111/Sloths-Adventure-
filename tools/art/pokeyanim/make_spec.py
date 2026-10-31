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


def spec4(commit):
    """the walk (the most-seen move still on painted frames): a slow relaxed walk on the spot, two seeds"""
    what = ('walks slowly and calmly on the spot, a relaxed easy-going cartoon walk cycle, gentle steps, arms swinging softly, his plain '
            'cream bandage wrist wraps and brown fur exactly as in the picture, his body staying in the same place in the middle of the '
            'frame, a smooth repeating loop')
    neg = NEG + ', running, red stripes, back view, turning away, facing away'
    cl = [{'name': f'pa-walk-s{sd}', 'src': f'gh:{commit}:reference/prop-sheets/qa-notes/pokey-anim/starts/walk.png', 'prompt': M + what,
           'neg': neg, 'seed': sd, 'w': 832, 'h': 480} for sd in (3, 11)]
    (H / 'spec-anim4.json').write_text(json.dumps({'tag': 'pokey-anim4', 'motion': MOTION, 'clips': cl}, indent=1))
    print(len(cl), 'clips')


TWEEN = ('Picture 1 and Picture 2 show the same friendly brown three-toed sloth at two moments of one smooth movement: {what}. Draw '
         'this same sloth in the pose exactly halfway between Picture 1 and Picture 2, as the in-between drawing of a hand-drawn '
         'animation: every limb halfway along its way from where it is in Picture 1 to where it is in Picture 2, {grip}. Keep '
         'everything else exactly as in Picture 1: the same face and eyes, the same brown fur and cream belly, the same pale bandage '
         'wrist wraps, the same thin brown satchel strap across his chest and the small brown bag, the same thin dark outline, the same '
         'soft painted cartoon style, the same size, and the same flat plain grey background. Nothing else in the picture.')
TWEEN_NEG = ('extra limbs, extra arms, extra paws, extra sloth, two sloths, rope, vine, branch, pole, changed face, different eyes, '
             'missing wrist wraps, red stripes, background scenery, photo, 3d render, text, watermark, blurry, back view')


def spec5(commit):
    """round 3: Qwen-Edit in-betweens of the rope cells and of the vine poses, and the punch from the cross's own frame"""
    st = f'gh:{commit}:reference/prop-sheets/qa-notes/pokey-anim/starts/'
    rope = ('hanging from a rope just above his head and moving along it hand over hand to the right', 'his paws at the very top, '
            'where the rope runs, at the same height as in both pictures')
    vine = ('hanging by his paws from a vine and swinging on it', 'his top paw gripping at exactly the same point as in both pictures')
    ed = []
    cyc = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6']
    for a, b in zip(cyc, cyc[1:] + cyc[:1]):
        ed.append({'name': f'tw-rope-{a}{b}', 'src': st + f'rope_{a}.png', 'refs': [st + f'rope_{b}.png'], 'w': 768, 'h': 768,
                   'prompt': TWEEN.format(what=rope[0], grip=rope[1]), 'neg': TWEEN_NEG, 'seeds': [1, 2, 3], 'lora': 0.6})
    for a, b in (('still', 'forward'), ('still', 'back')):
        ed.append({'name': f'tw-vine-{a}{b}', 'src': st + f'vine_{a}.png', 'refs': [st + f'vine_{b}.png'], 'w': 768, 'h': 768,
                   'prompt': TWEEN.format(what=vine[0], grip=vine[1]), 'neg': TWEEN_NEG, 'seeds': [1, 2, 3], 'lora': 0.6})
    what = ('stands facing right in a ready guard, throws one quick straight jab forward with his near arm, the fist shooting straight out '
            'to the right at shoulder height, then pulls it straight back into the guard; his body and face stay turned toward us the whole '
            'time, his plain cream bandage wrist wraps and brown fur exactly as in the picture, feet planted in the same spot')
    neg = NEG + ', red stripes, striped wraps, back view, turning away, facing away, turning his back'
    cl = [{'name': f'pa-jab-s{sd}', 'src': st + 'punch_cross.png', 'prompt': M + what, 'neg': neg, 'seed': sd, 'w': 832, 'h': 480}
          for sd in (3, 5, 11)]
    (H / 'spec-anim5.json').write_text(json.dumps({'tag': 'pokey-anim5', 'edits': ed, 'motion': MOTION, 'clips': cl}, indent=1))
    print(len(ed), 'edit items,', len(cl), 'clips')


SLIDE_KEEP = ('Keep him seen exactly from behind as in Picture 1, sitting on his bottom with his legs stretched out in front of him so '
              'only the soles of his feet show below him, the same brown fur seen from the back, the same pale bandage wrist wraps, the '
              'same thin brown satchel strap running from his left shoulder down to the small brown bag on his right hip, the same thin '
              'dark outline, the same soft painted cartoon style, the same size and the same flat plain grey background. Nothing else in '
              'the picture.')
SLIDE_NEG = ('face, front view, side view, standing, extra limbs, extra arms, extra sloth, chute, floor, background scenery, photo, '
             '3d render, text, watermark, blurry, bag on the left hip, two bags')


def spec6(commit):
    """7-4's slide from behind: his grip pose (arms hanging) given a real slide's balance and lean (Qwen-Edit, Pokey model 0.4)"""
    st = f'gh:{commit}:reference/prop-sheets/qa-notes/pokey-anim/starts/'
    poses = {
        'slide': 'The sloth in Picture 1 is sliding fast down a smooth chute away from us, sitting the way the sloth in Picture 2 sits: '
                 'he leans back a little and holds both arms out low to the sides for balance, paws open, elbows slightly bent.',
        'leanR': 'The sloth in Picture 1 is sliding fast down a smooth chute away from us and leaning his whole body over to the right into '
                 'a curve: his head and back tip to the right, his right arm reaches out low to the right for balance, his left arm is '
                 'raised up and out to the left.',
        'leanL': 'The sloth in Picture 1 is sliding fast down a smooth chute away from us and leaning his whole body over to the left into '
                 'a curve: his head and back tip to the left, his left arm reaches out low to the left for balance, his right arm is '
                 'raised up and out to the right.',
    }
    ed = [{'name': f'slide-{n}', 'src': st + 'slide_grip.png', 'refs': [st + 'slide_ref9.png'] if n == 'slide' else [], 'w': 768, 'h': 768,
           'prompt': t + ' ' + SLIDE_KEEP, 'neg': SLIDE_NEG, 'seeds': [1, 2, 3], 'lora': 0.4} for n, t in poses.items()]
    (H / 'spec-anim6.json').write_text(json.dumps({'tag': 'pokey-anim6', 'edits': ed}, indent=1))
    print(len(ed), 'edit items')


def spec2(commit):
    cl = []
    for mv, (what, w, h) in CLIPS2.items():
        for sd in SEEDS2[mv]:
            cl.append({'name': f'pa-{mv}-s{sd}', 'src': f'gh:{commit}:reference/prop-sheets/qa-notes/pokey-anim/starts/{mv}.png',
                       'prompt': M + what, 'neg': NEG2, 'seed': sd, 'w': w, 'h': h})
    (H / 'spec-anim2.json').write_text(json.dumps({'tag': 'pokey-anim2', 'motion': MOTION, 'clips': cl}, indent=1))
    print(len(cl), 'clips')


if __name__ == '__main__':
    {'spec2': spec2, 'spec3': spec3, 'spec4': spec4, 'spec5': spec5, 'spec6': spec6}.get(sys.argv[1], spec)(sys.argv[2])
