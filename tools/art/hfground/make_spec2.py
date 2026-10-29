"""Write tools/art/hfground/spec-art2.json (hf-art-ground, 2026-10-29) for groundgpu.py: World 5's props in the kit style (VI-13), the
carved wooden water signs (VI-13), the new dressing (VI-17: World 5's bank, hanging and clutter sets, the hanging sets for Worlds 1 and
2) and World 6's dirty water at 1024 px (VI-18). Starts from starts2.py.
    python3 tools/art/hfground/make_spec2.py <commit>
"""
import json, sys
from pathlib import Path
from PIL import Image

REF = sys.argv[1]
HERE = Path(__file__).resolve().parent
BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{REF}/tools/art/hfground/starts/'
STYLE = 'slothadv style, painted storybook illustration'
KIT = ('painted in soft cel shading with no black outline, the edges drawn in a darker shade of each colour, light from the upper '
       'left, evenly lit, on one flat plain pure magenta background, no shadow, no text')
NEG = ('thick black outline, black lines, sticker, comic, cartoon outline, text, letters, watermark, frame, border, photo, 3d render, '
       'blurry, gradient background, cast shadow, people, sloth, animal')
W5PAL = "in World 5's garden palette: soft rose pink, lilac, cream white and warm honey, a little sage green"
PROPS = {
    'cupcake': 'a cupcake with pink icing, cream and a cherry', 'cupcake2': 'a cupcake with pink icing, cream and a cherry',
    'cakeCherry': 'a small round pink-iced sponge cake with a cherry', 'cakeSponge': 'a round sponge cake with lilac icing and cream',
    'cakeTier': 'a three-tier pink and cream cake on a china plate', 'cakeTier2': 'a three-tier pink and cream cake on a china plate',
    'cakePlate': 'a china plate of five little cupcakes', 'cakePlate2': 'a china plate of four little cupcakes',
    'teapot': 'a cream china teapot with a gold knob and blue pattern band', 'teapot2': 'a cream china teapot with blue flowers',
    'teacup': 'a china teacup of tea on its saucer with a blue pattern', 'teacup2': 'a china teacup of tea on its saucer with blue flowers',
    'armchairRose': 'a soft rose-pink button-back armchair on short wooden legs, seen from the side',
    'armchairRose2': 'a soft rose-pink armchair with a cushion, on short wooden legs, seen from the side',
    'armchairLilac': 'a soft lilac button-back armchair on short wooden legs, seen from the side',
    'armchairLilac2': 'a soft lilac armchair with a cushion, on short wooden legs, seen from the side',
    'teaTable': 'a small round tea table with a white lace tablecloth, two teacups and a little card, one wooden foot',
    'teaTableNapkin': 'a small round tea table with a white lace tablecloth, one teacup and a folded napkin, one wooden foot',
}
DRESS = {
    'w5-bankA1': 'a mossy tangle of roots with a small pink orchid sprouting from it',
    'w5-bankA2': 'a soft green fern tuft spilling over',
    'w5-bankA3': 'a mossy root knot wrapped in a little white spider silk',
    'w5-bankB1': 'a clump of two white orchid sprouts with round green leaves',
    'w5-bankB2': 'a mossy root stump with a forgotten china teacup beside it',
    'w5-bankB3': 'a small fern with a pink orchid flower among it',
    'w5-hang1': 'a white silk-wrapped cocoon hanging from a single silk thread',
    'w5-hang2': 'a mossy bough with a hanging row of small white and pink orchid blooms',
    'w5-clutA1': 'a burst open silk cocoon and a fallen pink orchid flower lying in the moss',
    'w5-clutA2': 'a little white orchid sprout in a tuft of moss',
    'w5-clutA3': 'a small lump of tangled white spider silk on the ground',
    'w5-clutB1': 'a china teacup lying tipped over on its side',
    'w5-clutB2': 'a low mossy root stump',
    'w5-clutB3': 'a tiny cupcake and a fallen pink orchid lying in the moss',
    'w1-hang1': 'a clump of soft green moss with long strands of hanging moss and thin brown vines dangling down, rainforest',
    'w1-hang2': 'a small clump of green moss with a few strands of hanging moss and a thin vine dangling, rainforest',
    'w2-hang1': 'a clump of yellow-green riverside moss with long strands of hanging moss and thin brown roots dangling down',
    'w2-hang2': 'a small clump of yellow-green moss with a few hanging moss strands and a thin root dangling',
}
items = []


def size(n):
    im = Image.open(HERE / 'starts' / f'{n}.webp')
    return im.width, im.height


for n, what in PROPS.items():
    w, h = size(f'w5p-{n}')
    for st, sd in ((0.5, 7), (0.6, 19)):
        items.append({'kind': 'plain', 'name': f'w5p-{n}-s{round(st * 100)}-{sd}', 'start': f'w5p-{n}.webp', 'strength': st, 'seed': sd,
                      'w': w, 'h': h, 'neg': NEG, 'prompt': f'{STYLE}, a single prop for a side-scrolling platform game, side view: {what}, '
                      f'{W5PAL}, {KIT}'})
SIGN = {'sign-w5': 'pale silver-grey weathered wood, a white orchid and a twist of silk round the post, purple garden grass at its foot',
        'sign-jungle': 'warm brown wood, a green vine winding up the post'}
for n, what in SIGN.items():
    w, h = size(n)
    for st, sd in ((0.62, 7), (0.72, 19)):
        items.append({'kind': 'plain', 'name': f'{n}-s{round(st * 100)}-{sd}', 'start': f'{n}.webp', 'strength': st, 'seed': sd, 'w': w,
                      'h': h, 'neg': NEG + ', paint, painted picture on the board, blue paint, words',
                      'prompt': f'{STYLE}, a carved wooden warning sign on a post for a side-scrolling platform game, side-on: a plank '
                      f'board with a big curling wave carved deep into the wood, the carving darker than the board, {what}, {KIT}'})
for n, what in DRESS.items():
    w, h = size(f'dress-{n}')
    world = n.split('-')[0]
    pal = W5PAL if world == 'w5' else ''
    sts = ((0.55, 7), (0.66, 19)) if world == 'w5' else ((0.74, 7), (0.82, 19))
    for st, sd in sts:
        items.append({'kind': 'plain', 'name': f'dress-{n}-s{round(st * 100)}-{sd}', 'start': f'dress-{n}.webp', 'strength': st, 'seed': sd,
                      'w': w, 'h': h, 'neg': NEG, 'prompt': f'{STYLE}, a single piece of set dressing for a side-scrolling platform game, '
                      f'side view: {what}{", " + pal if pal else ""}, {KIT}'})
WATER = ('dirty, fast, murky brown-green swamp water seen from the side, a choppy surface with small foamy crests and pale current streaks '
         'just under it, getting deeper and darker toward the bottom')
items.append({'kind': 'strip', 'name': 'w6water-chop', 'start': 'w6water-chop.webp', 's1': 0.5, 'seed': 7, 's2': 0.35, 'seeds2': [11],
              'w': 1024, 'h': 528, 'band': 120, 'neg': NEG,
              'prompt': f"{STYLE}, a long horizontal strip for a side-scrolling platform game: {WATER}, the strip's left and right ends "
                        f'continue seamlessly, flat pure magenta above the water line only, soft cel shading, no text'})
for st, sd in ((0.55, 7), (0.65, 19)):
    items.append({'kind': 'plain', 'name': f'w6water-leaves-s{round(st * 100)}-{sd}', 'start': 'w6water-leaves.webp', 'strength': st,
                  'seed': sd, 'w': 512, 'h': 224, 'neg': NEG,
                  'prompt': f'{STYLE}, a floating clump of dead brown and olive leaves and twigs, side view, {KIT}'})
spec = {'note': 'hf-art-ground job 2: W5 props, signs, dressing, W6 water, 2026-10-29',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG, 'base': BASE,
        'items': items}
p = HERE / 'spec-art2.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items))
