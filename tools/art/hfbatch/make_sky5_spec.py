"""Write the spec for skyt2i.py (X-16 round 5, 2026-10-29): the 11 skies still on the cover fit after round 4, two seeds each, the worlds
Matt plays most upright first.
    python3 tools/art/hfbatch/make_sky5_spec.py <commit>     writes tools/art/hfbatch/specs/spec-hdsky5.json
The far strip is src/assets/backdrops/<stem>-far.webp at <commit> on GitHub."""
import json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from make_sky_spec import STYLE, WHAT  # noqa: E402

ORDER = ['w1kapok', 'w1sunrise', 'w3sinkhole', 'w5dusk2', 'w5twi1', 'w5twi2', 'w7', 'w7dawn', 'w7dusk', 'w10after', 'w6dawn']
SKY_STYLE = ('slothadv style, painted storybook illustration, soft cel shading, thin dark outline, hand-painted gouache brushwork, '
             'looking up at the sky, the whole picture is sky')
# the picture painted from text: sky only (what the strip's top would run on into); nothing with a horizon, so no second landscape
SKY_ONLY = {
    'w1kapok': 'a bright clear blue morning sky with soft white cumulus clouds',
    'w1sunrise': 'a soft sunrise sky, pale blue above fading to warm gold, soft pink and gold clouds',
    'w3sinkhole': 'a dim grey-green mossy rock cave roof seen from below, hanging vines and roots, soft mist, dark and calm',
    'w5dusk2': 'a pink and lilac dusk sky with soft painted pink clouds',
    'w5twi1': 'a lilac and violet twilight sky with soft pink clouds and a few first stars',
    'w5twi2': 'a lilac and violet twilight sky with soft pink clouds and a few first stars',
    'w6dawn': 'a pale pink and lavender dawn sky with soft misty clouds',
    'w7': 'a grey-green overcast sky with soft layered clouds',
    'w7dawn': 'a warm pale dawn sky, soft blue above fading to cream and gold, a few soft clouds',
    'w7dusk': 'a dim green-gold dusk sky with soft dark teal clouds',
    'w10after': 'a stormy golden sky, heavy dark storm clouds breaking up, soft rain streaks',
}
NEG_SKY = ('ground, land, horizon, hills, mountains, trees, landscape, buildings, ruins, water, sea, frame, border, panel, text, letters, '
           'watermark, photo, 3d render, people, animal, sloth, bird, blurry')
NEG_JOIN = ('second landscape, stacked scenes, horizon line, ground, frame, border, panel, picture in picture, horizontal band, seam, '
            'straight line, text, letters, watermark, people, animal, sloth, blurry')


def items(commit):
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/src/assets/backdrops/'
    out = []
    for stem in ORDER:
        for seed in (11, 23):
            out.append({'name': f'{stem}-r5-{seed}', 'src': f'{base}{stem}-far.webp', 'seed': seed, 'neg': NEG_SKY,
                        'sky': f'{SKY_STYLE}. {SKY_ONLY[stem]}',
                        'join': f'{STYLE}. {WHAT[stem]}; the trees, branches, rock and smoke at the top of the scene carry on up into it, '
                                'one continuous painting'})
            out[-1]['neg_join'] = NEG_JOIN
    return out


if __name__ == '__main__':
    spec = {'note': 'X-16 round 5, skyt2i.py, 2026-10-29', 'loras': {'style': ['mshaffe111/slothadv-style-lora',
            'slothadv_style_v1.safetensors', 0.8]}, 'items': items(sys.argv[1])}
    p = HERE / 'specs' / 'spec-hdsky5.json'
    p.write_text(json.dumps(spec, indent=1))
    print(p, len(spec['items']))
