"""ART-NEXT batch 1: the Qwen-Image-Edit-2511 spec (tools/art/hfpokey/pokeygpu.py format). python3 -I tools/art/hfnext/make_spec.py
writes spec-b1.json: every piece's first frames, then the SECOND frame of the two-frame pieces, an edit of EVERY round-1 take:
one cell per animation, hf-art.md; chained in the same run so no paid idle wait for a pick). COMMIT is filled in by run.sh."""
import json
ST = 'gh:COMMIT:reference/art/hfnext/starts/'
REF, COURT = ST + 'ref-w2.png', ST + 'ref-court.png'
STYLE = ('in exactly the hand-painted storybook style of the pieces in the second image: soft painterly gouache shading with gentle '
         'gradients, fine thin dark-brown linework, weathered warm grey-brown wood with visible grain, muted warm colours, soft even light '
         'from the upper left')
NEG = ('photo, 3d render, blurry, text, letters, watermark, frame, border, scenery, sky, ground, grass, background trees, '
       'thick black outline, flat vector, clip art, harsh shadow, cast shadow, extra objects')
KEEP = ' Keep the flat plain grey background around it.'
S4, S3 = [11, 23, 37, 41], [11, 23, 37]
r1 = [
    {'name': 'boat', 'src': ST + 'boat.png', 'refs': [REF], 'w': 1024, 'h': 640, 'seeds': S4,
     'prompt': 'Repaint the first image as a small wooden river rowing boat seen exactly side-on, ' + STYLE + '. The sloth mailman (the '
               'grey-brown sloth in the peaked postman cap and brown satchel strap from the second image) sits inside the boat facing '
               'right, both hands on the long wooden oar, leaning forward with the oar blade reaching forward into the water at the front. '
               'A bulging tied brown sack of post sits in the bow. Keep the boat\'s shape and size. No rock, just a thin ripple of water '
               'under the hull.' + KEEP, 'neg': NEG},
    {'name': 'letter', 'src': ST + 'letter.png', 'refs': [COURT], 'w': 512, 'h': 512, 'seeds': S3,
     'prompt': 'Repaint the first image as one cream paper envelope seen front-on, ' + STYLE + ', the paper like the letter in the second '
               'image: soft creases, a slightly lifted corner, a round red wax seal in the middle where the flap meets. A clear, simple '
               'shape that reads at a small size.' + KEEP, 'neg': NEG + ', stamp, writing'},
    {'name': 'reply', 'src': ST + 'reply.png', 'refs': [COURT], 'w': 512, 'h': 512, 'seeds': S3,
     'prompt': 'Repaint the first image as one pale blue-grey paper envelope seen front-on, ' + STYLE + ', the paper like the letter in '
               'the second image: soft creases, a slightly lifted corner, sealed in the middle with a small green leaf pressed into green '
               'wax. A clear, simple shape that reads at a small size.' + KEEP, 'neg': NEG + ', stamp, writing'},
    {'name': 'door', 'src': ST + 'door.png', 'refs': [REF], 'w': 768, 'h': 512, 'seeds': S3,
     'prompt': 'Keep this exact earth mound, its stone ring and roots unchanged, ' + STYLE + '. The round wooden door is now swung OPEN '
               'inward on its hinge: the doorway shows a warm dark inside with a soft amber glow deep within, and the edge of the opened '
               'door is visible inside the frame on the left.' + KEEP, 'neg': NEG},
    {'name': 'weir', 'src': ST + 'weir.png', 'refs': [REF], 'w': 1024, 'h': 512, 'seeds': S4,
     'prompt': 'Repaint the first image as a low river weir seen exactly side-on: three broad steps of rounded brown river boulders like '
               'the boulder in the second image, ' + STYLE + ', mossy on top, with clear blue-green river water pouring over each '
               'step\'s lip in thin glassy sheets that turn to white foam where they land, a calm teal pool below. Warm brown and '
               'ochre rock, never grey.' + KEEP, 'neg': NEG + ', grey stone, slate, concrete, fence, railing, pipes'},
    {'name': 'reeds', 'src': ST + 'reeds.png', 'refs': [REF], 'w': 512, 'h': 768, 'seeds': S3,
     'prompt': 'Keep these exact cattail reed clumps unchanged above, ' + STYLE + '. After a flood: the lower half of every stem is wet '
               'and darker, with a clear muddy flood line across all the stems at the same height, a little grey silt and a few bits '
               'of drift caught on the stems at that line.' + KEEP, 'neg': NEG + ', water'},
    {'name': 'barge', 'src': ST + 'barge.png', 'refs': [COURT], 'w': 1280, 'h': 512, 'seeds': S4,
     'prompt': 'Repaint the first image as the river king\'s royal barge seen exactly side-on, in exactly the hand-painted storybook style '
               'of the throne and boat in the second image: soft painterly gouache shading, fine thin dark-brown linework. A long low '
               'wooden hull of dark planks with teal and gold painted bands, a long FLAT, LEVEL plank deck along the top, a carved wooden '
               'crocodile head with a gold eye rising at the prow on the right, a canopy of woven reeds on four carved poles at the stern '
               'on the left, little flower and leaf ornaments like the throne\'s. Keep the shape and the flat deck exactly level.'
               + KEEP, 'neg': NEG + ', people, animals, water, sail, mast'},
]
r2 = []
for it, pr in [('boat', 'Keep this exact boat, the sloth mailman, his cap, the sack and the style unchanged. Only his rowing pose changes: '
                        'he now leans back with his arms pulled in to his chest, the oar swept back so its blade trails out behind the '
                        'boat at the back. Keep the flat plain grey background.'),
               ('letter', 'Keep this exact envelope, its paper and its red seal unchanged. It now flutters: tilted about 15 degrees, '
                          'the near corner lifted and the flap curling up a little, as if caught by a breeze. Same size. Keep the flat '
                          'plain grey background.'),
               ('reply', 'Keep this exact envelope, its paper and its green leaf seal unchanged. It now flutters: tilted about 15 degrees, '
                         'the near corner lifted and the flap curling up a little, as if caught by a breeze. Same size. Keep the flat '
                         'plain grey background.')]:
    src = next(x for x in r1 if x['name'] == it)
    for s in src['seeds']:
        r2.append({'name': f'{it}B-from{s}', 'src': f'b:hfpokey/edits/{it}-s{s}.png', 'refs': [src['refs'][0]], 'w': src['w'],
                   'h': src['h'], 'seeds': [s], 'prompt': pr, 'neg': src['neg']})
# cheapest first (the lead 4:25 PM): letters, door, reeds, weir, then the boats and the barge; each frame B right after its A's
by = {i['name']: i for i in r1 + r2}
order = ['letter', 'letterB', 'reply', 'replyB', 'door', 'reeds', 'weir', 'boat', 'boatB', 'barge']
items = [i for o in order for i in r1 + r2 if i['name'] == o or i['name'].startswith(o + '-from')]
assert len(items) == len(r1 + r2)
json.dump({'tag': 'next-b1', 'edits': items}, open('tools/art/hfnext/spec-b1.json', 'w'), indent=1)  # ONE load: r2 runs after r1
print([i['name'] for i in items]); print(len(r1 + r2), 'items', sum(len(i['seeds']) for i in r1 + r2), 'takes')
