"""w5-rebuild (2026-10-29): World 5 as one painted style. hf-art-ground repainted 18 of the prop sheet's 72 pieces (the cakes, pots, cups,
chairs and tea tables: no black outline, darker-hue edges, light from the upper left); the other 54 kept the old sticker look (a thick
black outline, flat fills). This repaints the 42 of them the game draws, from the same pipeline (hfground/starts2.py deline + on_mag, its
groundgpu.py on the GPU with the style LoRA), and deletes the 12 it never draws.

    python3 tools/art/w5rebuild/art.py starts            # starts/w5r-<piece>.webp (force-add, commit, push, then:)
    python3 tools/art/w5rebuild/art.py spec <commit>     # spec-w5r.json, read by groundgpu.py from GitHub raw at <commit>
"""
import json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'hfground'))

# the pieces the game draws, what each is (the prompt), and which of World 5's palettes it wears
REPAINT = {
    'arch': 'a round grey stone arch doorway into the dark, wound with a brown vine and small pink orchid flowers',
    'arch2': 'a round grey stone arch doorway into the dark, mossy, with green ivy and small pink orchid flowers',
    'bell': 'a single pink bell-shaped flower hanging from its curved stem',
    'bell2': 'a single deep pink bell-shaped flower bud hanging from its curved stem',
    'cocoonHanging': 'a white silk cocoon wrapped tight, hanging from one silk thread',
    'cocoonHangingTorn': 'a white silk cocoon hanging from one silk thread, torn open in the middle, empty inside',
    'cocoonTorn': 'a white silk cocoon lying on its side, burst open on top, empty inside',
    'cocoonWrapped': 'a white silk cocoon lying on its side, wrapped round and round with silk bands',
    'doily': 'a round white lace doily seen from the side, laid flat, a fine web-like lace pattern',
    'doilyStool': 'a round white lace doily on a low round wooden stool top, a drip of silk hanging from its edge',
    'fern': 'a soft green fern clump growing out of a little mound of moss',
    'flag': 'a small cream lace pennant flag on a thin twisted wooden pole',
    'flag2': 'a small cream lace pennant flag with a little heart, on a thin wooden pole, a pink orchid at its foot',
    'lantern': 'a small grey stone garden lantern with a warm glowing candle flame inside',
    'lantern2': 'a small stone garden lantern on a carved stem with a warm glowing flame and a pink orchid bud on top',
    'mossRoot': 'a low mossy tree stump with roots spreading on the ground',
    'mossRoot2': 'a short mossy tree stump with roots spreading on the ground, moss dripping over its top',
    'orchidClosed': 'a single closed white orchid bud on a short green stem, pale green and cream petals folded shut',
    'orchidHalf': 'a single white orchid flower half closed, petals folding in, on a short green stem, seen from the side',
    'orchidHalf2': 'a single white orchid flower half closed, petals drooping, on a curved green stem, seen from the side',
    'orchidOpen': 'a single big white moth orchid flower wide open, a yellow and orange centre',
    'orchidOpen2': 'a single big white moth orchid flower wide open, a soft yellow centre',
    'orchidPink': 'a single big pink moth orchid flower wide open, darker pink veins',
    'orchidPink2': 'a single big pink moth orchid flower wide open, a deep magenta centre',
    'orchidRow': 'a mossy brown branch with a hanging row of small white and pink orchid blooms',
    'orchidRow2': 'a mossy brown branch with a hanging row of small white orchid blooms',
    'orchidSprout': 'a small white orchid plant with two flowers on a stem, broad green leaves, growing from a little mound of soil',
    'orchidSprout2': 'a small white orchid plant with one flower on a curved stem, broad green leaves, growing from a little mound of soil',
    'silkBridge': 'a short rope bridge of white silk ropes and pale wooden slats between two small posts, seen from the side',
    'silkLump': 'a low soft lump of tangled white spider silk lying on the ground',
    'silkSheet': 'a white silk cloth with a lace edge draped over a thin branch, hanging down, a few silk drips',
    'silkThread': 'a thick white silk rope thread stretched straight across, tiny dew drops on it',
    'totem': 'a carved wooden garden totem post wrapped in cream lace, a big pink orchid flower blooming on top, a small arched door at its foot',
    'totem2': 'a carved wooden garden totem post wrapped in cream lace with a pink orchid blooming on top, a small door at its foot',
    'trunkShort': 'a short smooth brown tree trunk cut flat on top, a small twig at one side, plain smooth bark on its front',
    'trunkTall': 'a tall smooth brown tree trunk cut flat on top, a small twig and moss, plain smooth bark on its front',
    'wrappedArmchair2': 'a cream armchair wrapped round and round in white silk bands, a soft silk bundle on its seat',
    'wrappedChair': 'a thin wooden chair wrapped in white silk bands crossing over its back and legs',
    'wrappedChair2': 'a carved wooden chair wrapped in white silk bands crossing over its back and legs',
    'wrappedCup': 'a white china teacup wrapped in bands of white silk',
    'wrappedCup2': 'a white china teacup on its saucer wrapped in bands of white silk',
    'wrappedStool': 'a tall wooden stool wrapped round and round in white silk bands',
}
# never drawn by the game: deleted from the sheet and its data
UNUSED = ['cakeCherry', 'cakeSponge', 'doilyLong', 'fernStump', 'orchidBack', 'orchidIcon', 'silkSpan', 'totemDark', 'trunkA', 'trunkB',
          'trunkC', 'wrappedArmchair']

STYLE = 'slothadv style, painted storybook illustration'
KIT = ('painted in soft cel shading with no black outline, the edges drawn in a darker shade of each colour, light from the upper '
       'left, evenly lit, on one flat plain pure magenta background, no shadow, no text')
NEG = ('thick black outline, black lines, sticker, comic, cartoon outline, text, letters, watermark, frame, border, photo, 3d render, '
       'blurry, gradient background, cast shadow, people, sloth, animal, face, eyes')
W5PAL = "in World 5's garden palette: soft rose pink, lilac, cream white and warm honey, a little sage green"
TAKES = ((0.55, 7), (0.65, 19))

if __name__ == '__main__':
    if sys.argv[1] == 'starts':
        from starts2 import deline, on_mag, size16, w5
        for n in REPAINT:
            im = deline(w5(n))
            on_mag(im, size16(im.width, im.height)).save(HERE / 'starts' / f'w5r-{n}.webp', quality=92)
        print(len(REPAINT), 'starts')
    elif sys.argv[1] == 'spec':
        from PIL import Image
        base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[2]}/tools/art/w5rebuild/starts/'
        items = []
        for n, what in REPAINT.items():
            im = Image.open(HERE / 'starts' / f'w5r-{n}.webp')
            for st, sd in TAKES:
                items.append({'kind': 'plain', 'name': f'w5r-{n}-s{round(st * 100)}-{sd}', 'start': f'w5r-{n}.webp', 'strength': st, 'seed': sd,
                              'w': im.width, 'h': im.height, 'neg': NEG,
                              'prompt': f'{STYLE}, a single prop for a side-scrolling platform game, side view: {what}, {W5PAL}, {KIT}'})
        spec = {'note': 'w5-rebuild: World 5 props in one style, 2026-10-29', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]},
                'neg': NEG, 'base': base, 'items': items}
        (HERE / 'spec-w5r.json').write_text(json.dumps(spec, indent=1))
        print(len(items), 'items')
