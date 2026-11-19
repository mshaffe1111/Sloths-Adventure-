"""ART-W2B: the Qwen-Image-Edit-2511 spec (tools/art/hfpokey/pokeygpu.py format). python3 -I tools/art/hfw2b/make_spec.py <round>
writes tools/art/hfw2b/spec-r<round>.json; COMMIT is filled in by run.sh. Round 1: the wheel, the dry bucket, the lip (and a spill
fallback from the start). Round 2: the spilling frame made FROM the picked dry take (hf-art.md: an animation's frames from ONE cell)."""
import json, sys
R = sys.argv[1]
ST = 'gh:COMMIT:reference/art/hfw2b/starts/'
REF = ST + 'ref-w2wood.png'
STYLE = ('in exactly the hand-painted storybook style of the wooden pieces in the second image: weathered warm grey-brown planks with '
         'visible wood grain, soft painterly gouache shading, fine thin dark-brown linework, rope lashings like the ladder, muted colours, '
         'soft even light')
NEG = ('photo, 3d render, blurry, text, watermark, frame, border, scenery, sky, ground, grass, water background, people, animals, '
       'sloth, extra objects, thick black outline, flat vector, harsh shadow')
items = []
if R == '1':
    items += [
        {'name': 'wheel', 'src': ST + 'wheel.png', 'refs': [REF], 'w': 1024, 'h': 1024, 'seeds': [11, 23, 37, 41],
         'prompt': 'Repaint the wooden wheel in the first image as an old wooden water wheel (a noria) seen exactly front-on, ' + STYLE +
                   '. Keep the exact shape and size: a perfectly round rim of plank segments, exactly six straight spokes meeting at '
                   'a round hub, rope lashing where each spoke meets the rim. Dark wet wood, a little green moss and damp streaks on the '
                   'rim. Keep the flat plain grey background around it and inside it between the spokes.', 'neg': NEG},
        {'name': 'bucket', 'src': ST + 'bucket.png', 'refs': [REF], 'w': 1024, 'h': 512, 'seeds': [11, 23, 37],
         'prompt': 'Repaint the box in the first image as an empty wooden water-wheel bucket trough seen exactly side-on, ' + STYLE +
                   '. Keep the exact shape and size: a long open trough of horizontal planks with a thick end post at each end, a '
                   'thick flat floor board along the bottom, a rope band round it. Damp dark wood at the bottom. It is dry and '
                   'empty. Keep the flat plain grey background.', 'neg': NEG + ', water'},
        {'name': 'spillA', 'src': ST + 'bucket.png', 'refs': [REF], 'w': 1024, 'h': 512, 'seeds': [11, 23],
         'prompt': 'Repaint the box in the first image as a wooden water-wheel bucket trough seen exactly side-on, ' + STYLE +
                   '. Keep the exact shape and size. Clear blue-green river water spills over its right end in a thin curling '
                   'stream with a few drops falling, and drips from its floor. Keep the flat plain grey background.', 'neg': NEG},
        {'name': 'lip', 'src': ST + 'lip.png', 'refs': [REF], 'w': 1024, 'h': 384, 'seeds': [11, 23, 37],
         'prompt': 'Repaint the planks in the first image as the wooden lip of a village millrace channel seen exactly side-on, ' + STYLE +
                   '. Keep the exact shape: a long flat coping board along the top on squat wooden posts, a planked side under it, '
                   'wet and darker at the bottom with a little moss. Keep the flat plain grey background above and below.', 'neg': NEG},
    ]
else:
    pick = sys.argv[2]  # e.g. bucket-s23
    items += [{'name': 'spill', 'src': f'b:hfpokey/edits/{pick}.png', 'refs': [REF], 'w': 1024, 'h': 512, 'seeds': [11, 23, 37],
               'prompt': 'Keep this exact wooden bucket trough unchanged, the same planks, posts and rope. Add clear blue-green river '
                         'water spilling over its right end in a thin curling stream falling down past its floor, a few drops, and '
                         'two drips falling from its floor. Keep the flat plain grey background.', 'neg': NEG}]
json.dump({'tag': f'w2b-r{R}', 'edits': items}, open(f'tools/art/hfw2b/spec-r{R}.json', 'w'), indent=1)
print(len(items), sum(len(i['seeds']) for i in items), 'takes')
