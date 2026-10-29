"""Write the spec for skygpu.py (the painted sky above each far strip, upright view, 2026-10-29).
    python3 tools/art/hfbatch/make_sky_spec.py <out.json> <commit> <strength> <seed> [<stem> ...]
(no stems: every far strip and every middle strip in MID; <stem>:mid is a middle strip)
The source is src/assets/backdrops/<stem>-far.webp at <commit> on GitHub."""
import json, sys
from pathlib import Path

STYLE = ('slothadv style, painted storybook illustration, the upper part of a wide landscape painting, soft cel shading, '
         'thin dark outline, hand-painted gouache brushwork, the same colours and light as the bottom of the picture, no text')
# (the words "side-scrolling game" brought a row of stone ledge blocks with them, pilot 3: nothing up there is a platform)
NEG = ('ledge, platform, stone blocks, bricks, wall, ground, floor, path, bridge, text, letters, watermark, frame, border, photo, 3d '
       'render, people, animal, sloth, horizontal band, seam, blurry, smeared')
SKY = 'open sky with a few soft painted clouds'
# what carries on above each far strip's top edge (looked at, 2026-10-29: tools/art/edges contact sheet of the far strips)
WHAT = {
    'w1': f'a bright morning {SKY}, pale blue fading to warm near the horizon',
    'w1kapok': 'the great kapok tree\'s leafy green canopy overhead with lilac orchids, patches of blue sky between the leaves',
    'w1sunrise': f'a sunrise {SKY}, pale gold and blue',
    'w2': f'a warm hazy golden afternoon {SKY}',
    'w2evening': f'a warm orange evening {SKY}',
    'w2rapids': 'the green jungle canopy and hanging vines overhead, a bright pale sky glowing between the leaves',
    'w3': 'a dark cave roof overhead: dark teal rock, hanging roots and glowworm threads with tiny glowing dots',
    'w3cavern': 'a dark cave roof overhead: dark teal rock, hanging roots and glowworm threads with tiny glowing dots',
    'w3sinkhole': 'the grey-green rock wall of the sinkhole rising overhead with hanging vines, misty',
    'w4': f'a pale misty grey-white mountain {SKY}',
    'w4mist': f'a warm orange dusk {SKY} over misty mountains',
    'w4terraces': f'a pale bright misty {SKY} with soft sun rays',
    'w5': f'a soft peach and gold afternoon {SKY}',
    'w5gold2': f'a soft peach and gold afternoon {SKY}, orchid branches at the edges',
    'w5dusk1': f'a pink and lilac dusk {SKY}',
    'w5dusk2': f'a pink and lilac dusk {SKY}, orchid branches at the edges',
    'w5twi1': 'a lilac and violet twilight sky with soft clouds, dark tree tops at the edges',
    'w5twi2': 'a lilac and violet twilight sky with soft clouds, dark tree tops at the edges',
    'w5night': 'a deep blue night sky with a few stars, dark blue tree canopy at the edges',
    'w6': 'a grey misty swamp sky, the dark mangrove trees and hanging moss rising out of the top',
    'w6dawn': 'a pale pink dawn sky over the swamp, the dark mangrove trees and hanging moss rising out of the top',
    'w6dusk': 'a dark teal dusk sky with a few stars, dark tree canopy at the edges',
    'w7': 'a grey-green overcast sky over the jungle ruins, soft clouds',
    'w7dawn': 'a warm pale dawn sky over the ruins, the great carved tree and its leaves rising out of the top',
    'w7dusk': 'a dim green-gold dusk sky over the ruins, soft clouds',
    'w8': 'a deep blue night sky with soft moonlit clouds and a few stars',
    'w8night': 'a deep blue night sky full of stars, dark leaves at the edges',
    'w8sunset': 'a violet and orange sunset sky with a few stars and a shooting star',
    'w9': 'a smoky brown-orange sky full of drifting volcanic smoke and ash clouds',
    'w9dawn': 'a soft pink dawn sky with a thin trail of volcanic smoke',
    'w9night': 'a dark red night sky full of ash clouds lit orange from below',
    'w10': 'a dark stormy night sky with heavy rain clouds and a flash of lightning',
    'w10after': 'a stormy golden sky with heavy dark clouds breaking up',
    'w10dusk': 'a stormy purple dusk sky with heavy clouds and lightning',
}


# the middle strips whose trees, roots or cave roof run off their top edge (upright that edge is on screen): carried on upward on flat
# magenta, keyed by skycut.py into <stem>-midtop.webp
CUT = ('slothadv style, painted storybook illustration, a cut-out layer of a landscape painting, soft cel shading, thin '
       'dark outline, hand-painted gouache brushwork, the same colours and light as below, isolated on one flat solid pure {key} '
       'background filling every gap, no sky, no haze, no glow, no gradient, no text')
# the key the middle strip is painted on: magenta, or green where the strip itself is pink (World 5: the model turned magenta into a
# pink sunset haze, pilot 3)
KEY = {'w5': ('green', [0, 255, 0])}
MID = {
    'w1': 'the tall mossy rainforest trees carry on up: trunks, spreading leafy green canopy, hanging lianas and little orchids',
    'w1c': 'the dense leafy green rainforest canopy carries on up: leaves, branches, hanging lianas',
    'w3': 'the dark cave roof carries on up: dark mossy rock, twisting roots, glowworm threads with tiny glowing dots',
    'w5': 'the tall golden orchid trees carry on up: trunks and branches with big white and pink orchids, fine spider webs',
    'w5gold2': 'the tall golden orchid trees carry on up: trunks and branches with big white and pink orchids, fine spider webs',
    'w5dusk1': 'the tall purple-barked orchid trees carry on up: trunks and branches with big white and pink orchids, fine spider webs',
    'w5dusk2': 'the tall purple-barked orchid trees carry on up: trunks and branches with big white and pink orchids, fine spider webs',
    'w5twi1': 'the tall violet orchid trees carry on up: trunks and dark branches with pale orchids, fine spider webs',
    'w5twi2': 'the tall violet orchid trees carry on up: trunks and dark branches with pale orchids, fine spider webs',
    'w5night': 'the tall dark blue trees carry on up: trunks and branches with blue orchids',
    'w6': 'the grey-green mangrove tree tops carry on up: branches and hanging grey moss',
    'w7': 'the ruined jungle temple carries on up: the tops of carved stone towers, hanging roots and red vines',
}


def item(stem, strength, seed, commit):
    st = round(float(strength) * 100)
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/src/assets/backdrops/'
    if stem.endswith(':mid'):
        w = stem[:-4]
        kname, kcol = KEY.get('w5' if w.startswith('w5') else w, ('magenta', [255, 0, 255]))
        return {'name': f'{w}-midtop-s{st}-{seed}', 'strength': float(strength), 'seed': int(seed), 'src': f'{base}{w}-mid.webp',
                'prompt': f'{CUT.format(key=kname)}. {MID[w]}', 'bg': kcol, 'ext': 0.45, 'neg': NEG}
    return {'name': f'{stem}-sky-s{st}-{seed}', 'strength': float(strength), 'seed': int(seed), 'src': f'{base}{stem}-far.webp',
            'prompt': f'{STYLE}. {WHAT[stem]}', 'neg': NEG}


if __name__ == '__main__':
    out, commit, strength, seed, *stems = sys.argv[1:]
    stems = stems or sorted(WHAT) + [f'{m}:mid' for m in sorted(MID)]
    missing = [p.name for p in Path('src/assets/backdrops').glob('w*-far.webp') if p.name[:-9] not in WHAT]
    assert not missing, missing
    spec = {'note': 'painted sky above the far strips, tools/art/hfbatch/skygpu.py, 2026-10-29',
            'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 0.8]}, 'tw': 1024,
            'items': [item(s, st, seed, commit) for s in stems for st in strength.split(',')]}
    open(out, 'w').write(json.dumps(spec, indent=1))
    print(out, len(spec['items']))
