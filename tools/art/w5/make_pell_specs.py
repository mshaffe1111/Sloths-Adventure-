"""Write the job specs for the art of Meeca's stage (World 5, after 5-5; Matt approved the mock-ups 2026-10-26): Lieutenant Pell, the
General's soldiers, the blanket and Meeca in it.

    python3 -I tools/art/w5/make_pell_specs.py            -> tools/art/gen/spec-w5pell-edits.json + spec-w5pell-clips.json (GPU)
    python3 -I tools/art/w5/make_pell_specs.py --round2   -> spec-w5pell2-edits.json + spec-w5pell2-clips.json (GPU)
    python3 -I tools/art/w5/make_pell_specs.py --round3   -> spec-w5pell3-edits.json (GPU: the soldiers' plain faces)
    python3 -I tools/art/w5/make_pell_specs.py --round4   -> spec-w5pell4-clips.json (GPU: the soldiers' clips)

Order (2026-10-26): spec-w5pell-starts (CPU, w5cpu.py: Pell's start pictures from his story cels, with the lantern glow cut) ->
spec-w5pell-edits + -clips (GPU) -> pick -> round 2 (Pell's blanket offer and catch takes) -> round 3 -> round 4 -> spec-w5pell-pack
and spec-w5soldier-pack (CPU, every frame) -> repack.py picks the frames into the game's sheets. Clip names are
"w5-<who>-<move>-s<seed>"; the pack spec maps
each "<who>-<move>" to its start picture's meta (meta_from / meta). Pell has no character model, so every edit runs without one: the
model-free edits of Meeca kept her on-model where her own model drifted (meeca_carve.py).
"""
import json, sys
from pathlib import Path

G = Path(__file__).resolve().parents[1] / 'gen'
M = 'slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion, '
PELL = 'a gentle sloth soldier with pale grey-beige fur in a rumpled olive green army uniform and an olive peaked cap '
END = ', side view facing right, he stays in the middle of the frame'
MOTION = {'high': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_high_noise.safetensors'],
          'low': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_low_noise.safetensors'], 'scale': 1.0}
KEEP = ('exactly the same painted storybook style, the same soft painted shading and the same thin dark brown outlines, on the same flat '
        'plain grey background. ')
# the General's soldiers (Matt, 2026-10-26): sloths in olive uniform like Pell, plainer (no lieutenant's peaked cap with its badge and
# black visor, no breast pockets), and different individuals at a glance: a bigger, rounder build, darker fur, a soft field cap
SOLDIER = ('a different sloth soldier: a bigger, stockier, rounder sloth with {fur}, wearing a plain olive green army tunic with no '
           'pockets, no badges and no buttons showing, plain olive trousers, and a soft olive field cap with no visor{extra}')
VARIANTS = {'a': dict(fur='dark chocolate-brown fur and a darker brown eye mask', extra=''),
            'b': dict(fur='warm reddish cinnamon-brown fur and a dark brown eye mask', extra=', a rolled grey blanket strapped across his back')}


def edit(name, images, prompt, seed):
    return {'name': name, 'images': images, 'prompt': prompt, 'seed': seed}


def clip(name, src, prompt, seed, wh=(832, 480)):
    return {'name': name, 'src': src, 'prompt': prompt, 'seed': seed, 'w': wh[0], 'h': wh[1]}


def round1():
    ed = []
    for s in (1, 2, 3):
        ed.append(edit(f'w5p-offer-{s}', ['stills/w5p-cap_in_hand.png'],
                       'The same sloth soldier as in the picture, ' + KEEP + 'The same pale grey-beige fur, the same face and the same rumpled olive '
                       'green uniform. Now, in place of the cap, he holds out a folded olive green wool army blanket in both paws, offering it '
                       'kindly and shyly, leaning forward a little. The blanket has one badly darned patch sewn on with big crooked stitches. '
                       'Side view facing right, whole body in frame. One sloth only.', s))
        ed.append(edit(f'w5p-blanket-{s}', ['stills/w5p-mend_coat.png'],
                       'Remove the sloth and the coat. Show only one olive green wool army blanket, folded loosely in a soft heap, ' + KEEP +
                       'The blanket has one badly darned patch: a square of slightly different olive cloth sewn on with big, clumsy, crooked '
                       'stitches in pale thread, and a blanket-stitched hem. Whole blanket in frame, nothing else.', s))
        ed.append(edit(f'w5m-blanket-{s}', ['stills/w5m-idle.png'],
                       'The same young girl sloth as in the picture, ' + KEEP + 'The same face, the same pink headband, the same pink vest with '
                       'the race bib, the same green shorts and the same shoes. Now she has an olive green wool army blanket wrapped around her '
                       'shoulders like a shawl, holding it closed at the front with her paws; the blanket has one badly darned patch sewn on with '
                       'big crooked stitches. Side view facing right, whole body in frame. One sloth only.', s))
        for v, d in VARIANTS.items():
            who = SOLDIER.format(**d)
            ed.append(edit(f'w5s{v}-walk-{s}', ['stills/w5p-lantern_walk.png'],
                           'Replace the sloth in the picture with ' + who + '. ' + KEEP + 'The same walking pose, holding the same lit lantern '
                           'down at his side. Side view facing right, whole body in frame. One sloth only.', s))
            ed.append(edit(f'w5s{v}-stand-{s}', ['stills/w5p-lantern_look.png'],
                           'Replace the sloth in the picture with ' + who + '. ' + KEEP + 'The same standing pose, holding up the same lit '
                           'lantern, a plain stern face. Side view facing right, whole body in frame. One sloth only.', s))
    cl = []
    for s in (3, 11):
        cl.append(clip(f'w5-pell-march-s{s}', 'stills/w5p-lantern_walk.png', M + PELL + 'marches in place with a slow, steady walking cycle, '
                       'holding a lit lantern down at his side that swings gently with each step, a smooth walking cycle' + END, s))
        cl.append(clip(f'w5-pell-look-s{s}', 'stills/w5p-lantern_look.png', M + PELL + 'holding up a lit lantern, slowly turns his head and '
                       'shoulders to look back over his shoulder at something behind him, holds the look, then turns back to face forward' + END, s))
        cl.append(clip(f'w5-pell-catch-s{s}', 'stills/w5p-lantern_look.png', M + PELL + 'holding a lit lantern in one paw, steps forward and '
                       'gently reaches out his other paw as if resting it on a small shoulder in front of him, kind and worried, then holds still' + END, s))
    cl.append(clip('w5-pell-idle-s3', 'stills/w5p-lantern_look.png', M + PELL + 'stands in place holding up a lit lantern, breathing slowly, '
                   'shifting his weight a little and blinking' + END, 3))
    # two jobs side by side, about the same length: the edits, and Pell's clips from his cels
    (G / 'spec-w5pell-edits.json').write_text(json.dumps({'tag': 'w5pell', 'script': 'tools/art/w5/w5gpu.py', 'flavor': 'rtx-pro-6000',
                                                           'edits': ed}))
    (G / 'spec-w5pell-clips.json').write_text(json.dumps({'tag': 'w5pellc', 'script': 'tools/art/w5/w5gpu.py', 'flavor': 'rtx-pro-6000',
                                                           'motion': MOTION, 'clips': cl}))
    print(len(ed), 'edits', len(cl), 'clips')


SOLD = 'a stocky sloth soldier with {fur} in a plain olive green army uniform and a soft olive cap{extra} '
SOLD_FUR = {'a': dict(fur='dark chocolate-brown fur', extra=''), 'b': dict(fur='reddish cinnamon-brown fur', extra=', a rolled grey blanket on his back')}
# the picked round-1 edits (2026-10-26): Pell's offer take 1; soldier A's walk take 1 (his stand takes masked his eyes or drew a
# white sticker outline, so his stand is redrawn from his walk below); soldier B's walk and stand takes 1. Each edit painted a glow
# round the lantern and a shadow under the feet: "clean" paints both back to the grey before the clip (w5gpu.clean_start).
HALO = {'w5sa-walk-1': [600, 480, 900, 820], 'w5sb-walk-1': [600, 500, 900, 860], 'w5sb-stand-1': [600, 300, 900, 660]}


def round2():
    ed = [edit(f'w5sa-stand2-{s}', ['stills/w5sa-walk-1.png', 'stills/w5p-lantern_look.png'],
               'The sloth soldier from the first picture, exactly the same character: the same dark chocolate-brown fur, the same face with '
               'its natural dark eye stripes and open eyes, the same soft olive cap, the same plain olive tunic and trousers, ' + KEEP +
               'Now he stands still in the pose of the sloth in the second picture, holding up the same lantern in one paw, a plain stern '
               'face. Side view facing right, whole body in frame. One sloth only, no glow, no shadow.', s) for s in (1, 2, 3)]
    (G / 'spec-w5pell2-edits.json').write_text(json.dumps({'tag': 'w5pell2', 'script': 'tools/art/w5/w5gpu.py', 'flavor': 'rtx-pro-6000',
                                                            'edits': ed}))
    cl = []
    for s in (3, 11):
        cl.append(clip(f'w5-pell-offer-s{s}', 'stills/w5p-offer-1.png', M + PELL.replace(' and an olive peaked cap', '') + 'holds a folded olive '
                       'green blanket in both paws and slowly offers it forward, holding it out kindly with a shy, gentle smile, then holds still'
                       + END, s) | {'clean': {'shadow': True}})
        cl.append(clip(f'w5-pell-catch2-s{s}', 'stills/w5p-stand_worry.png', M + PELL + 'leans forward and reaches one arm out in front of him, '
                       'gently laying his open paw on a small shoulder at the height of his chest, kind and worried, holds it there, then lowers it'
                       + END, s))
        for v in 'ab':
            who = SOLD.format(**SOLD_FUR[v])
            cl.append(clip(f'w5-soldier{v}-march-s{s}', f'stills/w5s{v}-walk-1.png', M + who + 'marches in place with a slow, steady walking '
                           'cycle, holding a lantern down at his side that swings gently with each step, a smooth walking cycle' + END, s)
                      | {'clean': {'halo': HALO[f'w5s{v}-walk-1'], 'shadow': True}})
        cl.append(clip(f'w5-soldierb-look-s{s}', 'stills/w5sb-stand-1.png', M + SOLD.format(**SOLD_FUR['b']) + 'holding up a lantern, slowly '
                       'turns his head and shoulders to look back over his shoulder at something behind him, holds the look, then turns back '
                       'to face forward' + END, s) | {'clean': {'halo': HALO['w5sb-stand-1'], 'shadow': True}})
    cl.append(clip('w5-soldierb-idle-s3', 'stills/w5sb-stand-1.png', M + SOLD.format(**SOLD_FUR['b']) + 'stands in place holding up a lantern, '
                   'breathing slowly, shifting his weight a little and blinking' + END, 3) | {'clean': {'halo': HALO['w5sb-stand-1'], 'shadow': True}})
    (G / 'spec-w5pell2-clips.json').write_text(json.dumps({'tag': 'w5pell2c', 'script': 'tools/art/w5/w5gpu.py', 'flavor': 'rtx-pro-6000',
                                                            'motion': MOTION, 'clips': cl}))
    print(len(ed), 'edits', len(cl), 'clips')


FACE = ('Change his face: instead of a dark mask across his eyes, he has a plain, friendly sloth face with light cream fur round his '
        'eyes and only a thin, soft brown stripe running from each eye back toward his ear, like a real three-toed sloth, his eyes clearly '
        'visible. ')


def round3():
    """soldier A's stand redrawn from his walk (the two-picture edit of round 2 gave him Pell's peaked cap), and both soldiers' eye
    stripes toned down so they read as plain sloths, not bandit masks (coordinator, 2026-10-26)"""
    same = {'a': 'the same dark chocolate-brown fur, the same soft olive cap, the same plain olive tunic and trousers',
            'b': 'the same reddish cinnamon-brown fur, the same soft olive cap, the same plain olive tunic and trousers, the same rolled grey '
                 'blanket on his back'}
    ed = []
    for s in (1, 2):
        for v, pose, src, what in (('a', 'walk', 'w5sa-walk-1', 'The same walking pose, the same lantern down at his side.'),
                                   ('a', 'stand', 'w5sa-walk-1', 'Now he has stopped walking and stands still, feet together, holding the '
                                                                 'same lantern up in front of him in one paw, a plain stern face.'),
                                   ('b', 'walk', 'w5sb-walk-1', 'The same walking pose, the same lantern down at his side.'),
                                   ('b', 'stand', 'w5sb-stand-1', 'The same standing pose, the same lantern held up.')):
            ed.append(edit(f'w5s{v}-{pose}3-{s}', [f'stills/{src}.png'],
                           'The same sloth soldier as in the picture, ' + same[v] + ', ' + KEEP + FACE + what +
                           ' Side view facing right, whole body in frame. One sloth only.', s))
    (G / 'spec-w5pell3-edits.json').write_text(json.dumps({'tag': 'w5pell3', 'script': 'tools/art/w5/w5gpu.py', 'flavor': 'rtx-pro-6000',
                                                            'edits': ed}))
    print(len(ed), 'edits')


# the picked round-3 edits: take 2 of each (plain sloth faces). Soldier A's takes drew a pale sticker outline: "rim" cuts it.
CLEAN3 = {'w5sa-walk3-2': [600, 480, 900, 820], 'w5sa-stand3-2': [580, 440, 880, 770], 'w5sb-walk3-2': [600, 500, 900, 860],
          'w5sb-stand3-2': [600, 320, 900, 650]}


def round4():
    """the soldiers' clips from their plain-faced starts: march, idle and look back for each"""
    cl = []
    for v in 'ab':
        who = SOLD.format(**SOLD_FUR[v])
        c = lambda pic: {'clean': {'halo': CLEAN3[pic], 'shadow': True, 'rim': True}}
        cl.append(clip(f'w5-soldier{v}-march3-s3', f'stills/w5s{v}-walk3-2.png', M + who + 'marches in place with a slow, steady walking '
                       'cycle, holding a lantern down at his side that swings gently with each step, a smooth walking cycle' + END, 3)
                  | c(f'w5s{v}-walk3-2'))
        cl.append(clip(f'w5-soldier{v}-idle3-s3', f'stills/w5s{v}-stand3-2.png', M + who + 'stands in place holding a lantern, breathing '
                       'slowly, shifting his weight a little and blinking' + END, 3) | c(f'w5s{v}-stand3-2'))
        for s in (3, 11):
            cl.append(clip(f'w5-soldier{v}-look3-s{s}', f'stills/w5s{v}-stand3-2.png', M + who + 'holding a lantern, slowly turns his head and '
                           'shoulders to look back over his shoulder at something behind him, holds the look, then turns back to face forward'
                           + END, s) | c(f'w5s{v}-stand3-2'))
    (G / 'spec-w5pell4-clips.json').write_text(json.dumps({'tag': 'w5pell4', 'script': 'tools/art/w5/w5gpu.py', 'flavor': 'rtx-pro-6000',
                                                            'motion': MOTION, 'clips': cl}))
    print(len(cl), 'clips')


if __name__ == '__main__':
    {'--round2': round2, '--round3': round3, '--round4': round4}.get(next((a for a in sys.argv if a.startswith('--')), ''), round1)()
