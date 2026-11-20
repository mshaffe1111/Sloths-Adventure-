"""ART-NEXT-b batch 2: the Qwen-Image-Edit-2511 spec (tools/art/hfpokey/pokeygpu.py format) for World 3's grotto floor kit (3-1) and
2-8's flood-line reeds REDO. python3 -I tools/art/hfnext/make_spec2.py writes spec-b2.json, CHEAPEST FIRST (the pieces are packed and
pulled in this order, D98): reeds, shelf S, the mat, the sleepy shelf, the lit rims on the in-game shelves, the floor lips; then shelf S's
lit-rim frame chained on EVERY shelf S take (one cell per look, no paid idle wait for a pick). COMMIT is filled in by run.sh."""
import json
ST = 'gh:COMMIT:reference/art/hfnext/starts2/'
REF = ST + 'ref-w3.png'
REF2 = 'gh:COMMIT:reference/art/hfnext/starts/ref-w2.png'
STYLE = ('in exactly the hand-painted storybook style of the pieces in the second image: soft painterly gouache shading with gentle '
         'gradients, fine thin dark linework, cool dark grey-green cave stone with soft moss, muted colours')
NEG = ('photo, 3d render, blurry, text, letters, watermark, frame, border, scenery, sky, cave background, wall, ground plane, '
       'thick black outline, flat vector, clip art, harsh shadow, cast shadow, extra objects')
KEEP = ' Keep its shape and size. Keep the flat plain grey background around it, with empty grey space on every side.'
LIT = ('A soft cool blue-green glowworm light falls on its TOP RIM only: a thin glowing highlight along the front edge of the top face, '
       'fading quickly down the front; the rest of the stone stays dim and shadowed.')
S4, S3, S2 = [11, 23, 37, 41], [11, 23, 37], [11, 23]
r1 = [
    {'name': 'reeds2', 'src': ST + 'reeds2.png', 'refs': [REF2], 'w': 512, 'h': 768, 'seeds': S4,
     'prompt': 'Repaint the first image as these two clumps of river reeds and bulrushes, in exactly the hand-painted storybook style of '
               'the reeds in the second image: soft painterly gouache shading, fine thin dark-brown linework, fresh green and straw '
               'leaves above. Below the wavy flood line every stem and leaf is soaked dark wet brown, glistening, dusted with fine pale '
               'silt specks; the colour change follows each stem with a darker wet edge where the water stood. Dark wet brown, never grey: '
               'no band, no collar, no ring across the clumps.' + KEEP,
     'neg': NEG + ', grey band, grey collar, grey stripe, ring, water, mud puddle'},
    {'name': 'shelfS', 'src': ST + 'shelfS.png', 'refs': [REF], 'w': 768, 'h': 384, 'seeds': S3,
     'prompt': 'Repaint the first image as one short thick slab of grotto stone, a small ledge to stand on, seen exactly side-on, ' + STYLE +
               ', like the stone shelves in the second image: a flat walkable top face, a cracked front face, a rough rock underside '
               'tapering down, a small fern tuft and moss on the top at the left.' + KEEP, 'neg': NEG},
    {'name': 'mat', 'src': ST + 'mat.png', 'refs': [REF], 'w': 768, 'h': 384, 'seeds': S3,
     'prompt': 'Repaint the first image as one low, wide, soft spongy fungus mat, seen side-on, ' + STYLE + ': a cushiony flat top in soft '
               'rings of dusky violet and cool teal, faintly glowing like the mushrooms in the second image, a thin soft edge, nothing '
               'under it. It looks soft and safe to land on.' + KEEP, 'neg': NEG + ', spikes, thorns'},
    {'name': 'sleepy', 'src': ST + 'sleepy.png', 'refs': [REF], 'w': 768, 'h': 512, 'seeds': S3,
     'prompt': 'Repaint the first image as one stone ledge seen exactly side-on with a clump of sleepy glowing mushrooms growing at the '
               'back left of its top, ' + STYLE + ', the mushrooms like those in the second image but drowsy: caps drooping and half-closed, '
               'their glow soft and dim, as if dozing. A flat walkable top face, a cracked front face, a rough rock underside.' + KEEP,
     'neg': NEG},
    {'name': 'rimShort', 'src': ST + 'rimShort.png', 'refs': [REF], 'w': 768, 'h': 384, 'seeds': S2,
     'prompt': 'Keep this exact stone shelf, its fern, moss, cracks and shape unchanged, ' + STYLE + '. ' + LIT + KEEP, 'neg': NEG},
    {'name': 'rimLong', 'src': ST + 'rimLong.png', 'refs': [REF], 'w': 1024, 'h': 384, 'seeds': S2,
     'prompt': 'Keep this exact long stone shelf, its fern, moss, cracks and shape unchanged, ' + STYLE + '. ' + LIT + KEEP, 'neg': NEG},
    {'name': 'lipA', 'src': ST + 'lipA.png', 'refs': [REF], 'w': 1024, 'h': 320, 'seeds': S3,
     'prompt': 'Repaint the first image as one long low strip of grotto floor stone, the edge of the cave floor, seen exactly side-on, ' +
               STYLE + ': a flat walkable top with a little moss and one fern, a short cracked front face, a shallow rough rock skirt '
               'under it, both ends smoothly rounded.' + KEEP, 'neg': NEG},
    {'name': 'lipB', 'src': ST + 'lipB.png', 'refs': [REF], 'w': 1024, 'h': 320, 'seeds': S3,
     'prompt': 'Repaint the first image as one long low strip of grotto floor stone, the edge of the cave floor, seen exactly side-on, ' +
               STYLE + ': a flat walkable top with a little moss and one fern, a short cracked front face, a shallow rough rock skirt '
               'under it, both ends broken off into rough chipped rock.' + KEEP, 'neg': NEG},
]
r2 = [{'name': f'rimS-from{s}', 'src': f'b:hfpokey/edits/shelfS-s{s}.png', 'refs': [REF], 'w': 768, 'h': 384, 'seeds': [s],
       'prompt': 'Keep this exact stone ledge, its fern, moss, cracks and shape unchanged. ' + LIT + KEEP, 'neg': NEG} for s in S3]
spec = {'tag': 'next-b2', 'edits': r1 + r2}
json.dump(spec, open('tools/art/hfnext/spec-b2.json', 'w'), indent=1)
print('spec-b2.json', sum(len(e['seeds']) for e in spec['edits']), 'takes')
