"""Write the spec for skygpu.py (the painted sky above each far strip, upright view, 2026-10-29).
    python3 tools/art/hfbatch/make_sky_spec.py <out.json> <commit> <strength> <seed> [<stem> ...]   (no stems: every far strip)
The source is src/assets/backdrops/<stem>-far.webp at <commit> on GitHub."""
import json, sys
from pathlib import Path

STYLE = ('slothadv style, painted storybook illustration, the upper part of a wide side-scrolling game background, soft cel shading, '
         'thin dark outline, hand-painted gouache brushwork, the same colours and light as the bottom of the picture, no text')
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


def item(stem, strength, seed, commit):
    return {'name': f'{stem}-sky-s{round(float(strength) * 100)}-{seed}', 'strength': float(strength), 'seed': int(seed),
            'src': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/src/assets/backdrops/{stem}-far.webp',
            'prompt': f'{STYLE}. {WHAT[stem]}'}


if __name__ == '__main__':
    out, commit, strength, seed, *stems = sys.argv[1:]
    stems = stems or sorted(WHAT)
    missing = [p.name for p in Path('src/assets/backdrops').glob('w*-far.webp') if p.name[:-9] not in WHAT]
    assert not missing, missing
    spec = {'note': 'painted sky above the far strips, tools/art/hfbatch/skygpu.py, 2026-10-29',
            'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 0.8]}, 'tw': 1024,
            'items': [item(s, st, seed, commit) for s in stems for st in strength.split(',')]}
    open(out, 'w').write(json.dumps(spec, indent=1))
    print(out, len(spec['items']))
