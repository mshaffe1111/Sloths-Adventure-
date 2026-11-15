"""ART-678 (1-6..1-8 batch + two look fixes): ONE prompt file per model, run back to back in one HF sandbox (hf-art.md §10).

    python3 -I tools/art/hf678/make_spec.py t2i      -> tools/art/hf678/spec-t2i.json   (tools/art/w6to10/stillsgpu.py: Qwen-Image + style)
    python3 -I tools/art/hf678/make_spec.py edit <commit with reference/art/hf678/starts>
                                                     -> tools/art/hf678/spec-edit.json  (tools/art/hfpokey/pokeygpu.py: Qwen-Image-Edit-2511)
Sheets, not single pieces: related pieces share one canvas (same light and palette by construction), 4 seeds a sheet (picking pass).
Sizes are game units against Pokey's DRAWN 89.1 (D41); every piece is cut and sized on this side (cutprops-style, 3 px per unit).
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
STYLE = ('hand-painted 2D storybook platformer game asset sheet, every piece seen exactly from the side, flat orthographic view, rich '
         'saturated colour, clean dark outline, painterly detail, soft warm rainforest light from the upper left')
MAG = 'each piece separate and well spaced apart with wide empty gaps between them, isolated on a flat solid magenta background'
GRY = 'each piece separate and well spaced apart with wide empty gaps between them, isolated on a flat plain mid grey background'
NEG = ('perspective, three-quarter view, isometric, seen from above, top-down, text, letters, numbers, words, labels, watermark, frame, '
       'border, grid lines, photo, 3d render, blurry, gradient background, cast shadow, sky, scenery behind, people, sloth, '
       'overlapping pieces, cropped, cut off at the edge')
SEEDS = (11, 23, 37, 53)

SHEETS = {
    # 1. 1-6: the BROWN vine snake (Oxybelis aeneus), never golden, never a cobra or an Asian snake; 4 poses on one canvas.
    'snake': ('a sheet of four poses of the same very long, very thin brown vine snake, a slender whip-like rainforest snake with a '
              'long pointed narrow head, vine-brown body shading to olive green, a thin pale cream belly line, small golden-brown eyes '
              'with a dark stripe through each eye. Top left: the snake hanging straight down head-first, its tail curled once round '
              'nothing at the top, its long body hanging vertical and its pointed head at the bottom. Top right: the snake sliding '
              'flat along to the right in long low S curves, head raised a little. Bottom: the snake lying stiff and straight along '
              'a short mossy bough, coiled once round it, perfectly still, looking just like a brown liana vine. Bottom right: the '
              'snake raised in an S with its mouth open in a hiss, showing the dark inside of its mouth, a cartoon warning pose, '
              'friendly storybook style not scary', MAG, 1792, 1344),
    # 2. 1-7 / 1-8: moss cover (Pokey hides in it): carpet top, patch, Spanish-moss drape, mossy liana, fork moss.
    'moss': ('a sheet of five separate pieces of thick green rainforest moss. Top: a long flat horizontal strip of thick moss carpet '
             'growing on top of a branch, soft rounded cushion top, straight running left to right across the whole width. Middle '
             'left: a low wide rounded patch of cushion moss with tiny fern sprigs. Middle right: a long hanging curtain of grey-green '
             'Spanish moss and old man\'s beard draping straight down in long stringy tassels from a short mossy twig. Bottom left: '
             'a straight vertical liana vine wrapped all over in soft green moss. Bottom right: a Y-shaped branch fork filled with a '
             'thick round clump of moss and small leaves', MAG, 1792, 1344),
    # 3. 1-7 / 1-8: the dead snag the harpy perches on (~300 units tall).
    'snag': ('a sheet of two tall dead rainforest snags, each a single bare dead tree trunk standing straight up, grey-brown weathered '
             'wood with peeling bark, broken jagged top, two or three short bare broken side branches near the top that a big eagle '
             'could perch on, a little green moss and a thin vine at the base, the base cut off flat at the bottom', MAG, 1344, 1792),
    # 4. 1-8: branch hazards: palm nut, cannonball fruit, the fruit split open, a cracked nut, squirrel tracks.
    'nuts': ('a sheet of five separate rainforest pieces. Top left: one round hard brown palm nut with a rough fibrous husk. Top '
             'middle: one big round heavy brown cannonball tree fruit, rough woody shell. Top right: the same cannonball fruit split '
             'in half, its two halves of woody shell lying open with pale green-white flesh inside. Bottom left: one round brown nut '
             'cracked open with jagged broken shell pieces. Bottom: a long thin horizontal strip of small squirrel paw prints in a '
             'row running left to right, little dark four-toed prints pressed in green moss', MAG, 1792, 1344),
    # 5a. R-165.224: World 1 earth-and-roots underlayer band (opaque below a ragged keyed top; tiles sideways after wrapfix).
    'under': ('a wide horizontal side-on cut-away band of rainforest earth going down under the forest floor: a ragged dark grassy '
              'soil edge along the top, then rich dark brown earth with tangled thick tree roots running across and down, a few '
              'buried mossy stones and pebbles, small root tendrils, getting darker and deeper toward the bottom, filling the whole '
              'width edge to edge, above the top edge a flat solid magenta background', None, 1792, 896),
    # 5b. R-165.209: LIVING-wood posts to replace the square-cut posts (1-1, 1-4, 1-5).
    'post': ('a sheet of three separate upright living tree stumps of different heights side by side, each one a short thick round '
             'rainforest trunk standing straight up, rough brown living bark with deep grooves, a broken jagged natural top with '
             'splinters and a little moss, wrapped round and round by a thin green leafy vine, a fern sprout at the base, the bottom '
             'cut off flat, never sawn or square', MAG, 1792, 1344),
}


def t2i():
    items = []
    for k, (p, bg, w, h) in SHEETS.items():
        prompt = f'{p}, {STYLE}' + (f', {bg}' if bg else '')
        items += [{'name': f'{k}-{sd}', 'prompt': prompt, 'seed': sd, 'w': w, 'h': h} for sd in SEEDS]
    spec = {'tag': 't2i678', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]},
            'neg': NEG, 'items': items}
    (H / 'spec-t2i.json').write_text(json.dumps(spec, indent=1))
    print(len(items), 'stills')


# 3. The perched harpy: Qwen-Edit from the game's own harpy (walkB, standing, eyes open), so it is the same bird as the enemy.
KEEP = ('Keep everything else exactly as in the picture: the same cartoon harpy eagle, the same dark navy feathers, the same pale grey '
        'and white head and crest, the same big round orange-brown eyes, the same grey hooked beak, the same orange feet, the same '
        'thin dark outline, the same soft painted storybook cartoon style, the same size, and the same flat plain grey background. '
        'Nothing else in the picture.')
ENEG = 'two birds, extra wings, extra legs, extra head, branch, perch, ground, text, watermark, blurry, photo, 3d render, flying'
POSES = {
    'ahead': 'The eagle stands perched upright and still, wings folded tight at its sides, gripping with both feet, head level, '
             'looking straight ahead to the right, alert.',
    'down': 'The eagle stands perched upright, wings folded, and bends its head down low, looking straight down at the ground below '
            'its feet, eyes wide and watchful.',
    'turn': 'The eagle stands perched upright, wings folded, and has turned its head right round to face us, looking straight out of '
            'the picture at us with both big eyes.',
    'blink': 'The eagle stands perched upright, wings folded, head level facing right, its eyes shut in a slow sleepy blink.',
}


def edit(commit):
    src = f'gh:{commit}:reference/art/hf678/starts/harpy-walkB.png'
    edits = [{'name': f'harpy-{k}', 'src': src, 'w': 1024, 'h': 1024, 'prompt': v + ' ' + KEEP, 'neg': ENEG, 'seeds': [1, 2, 3]}
             for k, v in POSES.items()]
    (H / 'spec-edit.json').write_text(json.dumps({'tag': 'edit678', 'edits': edits}, indent=1))
    print(len(edits) * 3, 'edits')


if __name__ == '__main__':
    {'t2i': t2i, 'edit': lambda: edit(sys.argv[2])}[sys.argv[1]]()
