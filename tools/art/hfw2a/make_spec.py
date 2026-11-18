"""ART-W2A: write the edit specs for tools/art/hfpokey/pokeygpu.py (Qwen-Image-Edit-2511, no LoRA).
    python3 -I tools/art/hfw2a/make_spec.py 1            -> spec-r1.json (walk A + paddle per little one, the looking heron); src at COMMIT
    python3 -I tools/art/hfw2a/make_spec.py 2 <picks>    -> spec-r2.json (walk B from the picked walk A takes: duck=b:...,otter=...,capy=...)
"""
import json, sys
S = 'gh:COMMIT:reference/art/hfw2a/starts/'
WHO = {
    'duck': ('cartoon duckling', 'the same fluffy yellow feathers, the same orange beak and orange webbed feet, the same little wings, '
             'the same round face and big dark eyes'),
    'otter': ('cartoon baby otter', 'the same dark brown fur, the same cream muzzle and chest, the same small round ears, the same long '
              'tapering tail, the same face, nose and big dark eyes'),
    'capy': ('cartoon baby capybara', 'the same warm brown fur, the same big blunt dark-brown nose, the same small round ears, the same '
             'face and big dark eyes, the same short legs'),
}
KEEP = ('Keep the same {k}: {d}, the same thin dark brown outline, the same soft painted children\'s-book cartoon style, the same colours and '
        'lighting, the same size, on the same flat plain grey background.')
NEG = ('extra limbs, extra legs, extra feet, extra tail, two animals, changed face, different species, water, ripples, shadow on the ground, '
       'grass, ground, scenery, text, border, frame, realistic, 3d render, blurry')
WALK = ('Redraw the {k} in Picture 1 walking along to the right, seen from the side in a three-quarter view, mid-waddle: {legs}, '
        'arms {arms} relaxed at its sides, body upright, a happy content smile, looking ahead to the right. ')
LEGS_A = 'its near foot stepping forward and its far foot pushing off behind'
ARMS = {'duck': '(little wings)', 'otter': '(little paws)', 'capy': '(front paws)'}
PADDLE = ('Redraw the {k} in Picture 1 swimming to the right, seen from the side in a three-quarter view: body low and leaning forward as if '
          'floating, head held up above the water line, {arms} reaching forward paddling, a happy determined smile, looking ahead to the '
          'right. Do not draw any water. ')
HERON = ('Make the heron in Picture 1 alert and watching: it raises its head and stretches its long neck up tall and straight, its head turned '
         'to peer down and to the left at the ground in front of it, beak pointing down to the left, eyes wide and staring. Keep everything '
         'else exactly the same: the same grey-blue heron, the same body, wing feathers and legs standing on the same wooden post with the '
         'same rope, the same cattails and reeds, the same thin dark outline, the same soft painted cartoon style and colours, the same '
         'flat plain grey background.')

def r1():
    ed = []
    for n, (k, d) in WHO.items():
        keep = KEEP.format(k=k, d=d)
        ed.append({'name': f'{n}-walkA', 'src': S + f'{n}-happy.png', 'prompt': WALK.format(k=k, legs=LEGS_A, arms=ARMS[n]) + keep,
                   'neg': NEG, 'seeds': [11, 23, 37], 'w': 1024, 'h': 1024})
        ed.append({'name': f'{n}-paddle', 'src': S + f'{n}-happy.png', 'prompt': PADDLE.format(k=k, arms=ARMS[n]) + keep,
                   'neg': NEG, 'seeds': [11, 23, 37], 'w': 1024, 'h': 1024})
    ed.append({'name': 'heron-look', 'src': S + 'heron.png', 'prompt': HERON, 'neg': 'extra heads, two herons, extra legs, changed post, '
               'missing post, water, scenery, text, border, frame, realistic, 3d render, blurry', 'seeds': [11, 23, 37], 'w': 768, 'h': 1120})
    return {'tag': 'w2a-r1', 'edits': ed}

def r2(picks):
    ed = []
    for kv in picks.split(','):
        n, src = kv.split('=', 1)
        k, d = WHO[n]
        p = (f'Picture 1 shows a {k} walking to the right. Redraw the very same {k} in the very same spot and size, one step later in its '
             'waddle: now its far foot steps forward and its near foot pushes off behind, the body bobbed a tiny bit lower. Keep everything '
             'else exactly the same: ' + KEEP.format(k=k, d=d)[5:])
        tag = src.rsplit('-', 1)[-1].split('.')[0]
        ed.append({'name': f'{n}-walkB-{tag}', 'src': src, 'prompt': p, 'neg': NEG, 'seeds': [11, 23, 37], 'w': 1024, 'h': 1024})
    return {'tag': 'w2a-r2', 'edits': ed}

if __name__ == '__main__':
    sp = r1() if sys.argv[1] == '1' else r2(sys.argv[2])
    json.dump(sp, open(f'tools/art/hfw2a/spec-r{sys.argv[1]}.json', 'w'), indent=1)
    print(len(sp['edits']), 'edits')
