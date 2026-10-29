"""Write the two specs for the boss art batch (hf-art-bosses, 2026-10-29): img2img (tools/art/w6to10/img2imggpu.py) from the starts
bossstarts.py makes, with the style model, two strengths x two seeds each. The starts are force-added under tools/art/hfbatch/starts/ and
read from GitHub raw at a pinned commit, so the branch is pushed before the job runs.
    python3 tools/art/hfbosses/make_spec.py <commit>
"""
import json, sys
from pathlib import Path

BASE = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sys.argv[1]}/tools/art/hfbatch/starts/'
STYLE = ('Soft cel shading, thin dark outline, light from the upper left, painted storybook illustration, slothadv style')
KEYED = ' Evenly lit, on one flat plain pure {key} background, no shadow, no text.'
NEG_PLATE = 'text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, people, animal, character, sloth, crocodile, bird'
NEG_KEY = ('text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, gradient background, scenery, sky, cast shadow, '
           'people, sloth, character')

PLATES = {
    'lair-croc-calm': ('start-lair-croc-calm.webp',
        'slothadv style, a wide painted game backdrop at night: the Moonlit Mire, a broad still jungle river seen from a muddy bank, a big '
        'pale full moon low in a deep blue night sky with a glittering road of moonlight across the dark water, arching mangrove trees '
        'with stilt roots standing in the river in blue-black silhouette, the far jungle tree line dark, low fog lying on the water, '
        'faint stars, one warm lantern glowing on a far post. Moonlit cyan and indigo. ' + STYLE + ', no characters, no text'),
    'lair-croc-rage': ('start-lair-croc-rage.webp',
        'slothadv style, a wide painted game backdrop at night: the Moonlit Mire in flood, a broad jungle river swollen and churning '
        'with white foam, a big pale full moon in a deep blue night sky behind drifting cloud, arching mangrove trees with stilt roots in '
        'blue-black silhouette, many pairs of glowing yellow crocodile eyes watching from the dark water, fog on the river. Moonlit cyan '
        'and indigo, menacing. ' + STYLE + ', no characters, no text'),
    'lair-sov-calm': ('start-lair-sov-calm.webp',
        'slothadv style, a wide painted game backdrop: the Cloud Aerie, high cliffs and tall rock spires rising out of a sea of soft '
        'white cloud at golden sunset, a great eagle nest of sticks on top of the tallest spire, a waterfall pouring off a cliff into the '
        'clouds, a rope bridge between two cliffs, warm orange and lilac sky with long clouds. ' + STYLE + ', no characters, no text'),
    'lair-sov-rage': ('start-lair-sov-rage.webp',
        'slothadv style, a wide painted game backdrop: the Cloud Aerie in a thunderstorm, high cliffs and tall rock spires rising out of '
        'a sea of dark cloud, a great eagle nest of sticks on top of the tallest spire, forked white lightning behind the spires, slanting '
        'rain, a bruised violet and deep purple sky with heavy storm clouds, a rope bridge between two cliffs. ' + STYLE +
        ', no characters, no text'),
}
STRIPS = {
    'fg-croc': ('start-fg-croc.webp', 'magenta',
        'slothadv style, a wide foreground strip for a side-scrolling game at night: along the top edge a fringe of soft hanging swamp '
        'moss and drooping mangrove leaves, dark blue-green; along the bottom edge a row of tall swamp reeds, bulrushes with brown '
        'cattail heads, and a few round lily pads, dark blue-green with a cool moonlit rim. Nothing in the middle. ' + STYLE),
    'fg-sov': ('start-fg-sov.webp', 'magenta',
        'slothadv style, a wide foreground strip for a side-scrolling game: along the bottom edge tufts of dry golden mountain grass all '
        'bent to the left by a strong wind, a few rounded lilac-grey cliff-top stones, and three loose grey eagle feathers caught in the '
        'grass. Nothing above them. ' + STYLE),
}
SHEETS = {
    'marker': ('start-marker.webp', 'green',
        'slothadv style, a sheet of game effect pieces, each separate on the background: at the top a glowing red and orange danger mark '
        'painted on the ground, a flat wide oval seen low from the side, a ring of hot cracked earth glowing red with a bright core; '
        'below it on the left a fat glowing red-orange arrow pointing right with a dark outline and a pale highlight; on the right a fat '
        'glowing red-orange arrow pointing down; along the bottom three long glowing red claw-scratch streaks across the ground. ' + STYLE),
    'fx-croc': ('start-fx-croc.webp', 'magenta',
        'slothadv style, a sheet of game effect pieces for a crocodile boss in a night river, each separate on the background: along the '
        'top a long band of dark teal river water seen from the side with a white foam crest along its top edge; a grey-blue piranha '
        'fish side view facing right with a red belly, a pale eye and sharp white teeth; a curling wave of thick brown mud thrown up from '
        'the ground; a splash of white-cyan water droplets. ' + STYLE),
    'fx-sov': ('start-fx-sov.webp', 'green',
        'slothadv style, a sheet of game effect pieces for a giant eagle boss in a storm, each separate on the background: along the top '
        'a low bank of dark violet storm clouds with lilac highlights; a jagged fork of white-violet lightning; a golden eagle feather '
        'flying right like a dart; swept white-cyan streaks of wind. ' + STYLE),
    'fx-queen': ('start-fx-queen.webp', 'magenta',
        'slothadv style, a sheet of game effect pieces for a giant spider boss, each separate on the background: a ball of white spider '
        'silk wound tight with loose threads; a flat splat of sticky white web stuck on the ground seen from the side; a silk-wrapped '
        'cocoon hanging on a thread; a long jet of green venom spraying to the right, thick at the left and breaking into droplets at the '
        'right end; a low ripple of white silk threads along the ground. ' + STYLE),
    'dust': ('start-dust.webp', 'magenta',
        'slothadv style, an animation strip of eight frames left to right, each separate on the background: a soft puff of tan jungle '
        'dust kicked up from the ground, small and low at first, billowing out round and wide, then thinning and breaking into wisps. '
        + STYLE),
    'spark': ('start-spark.webp', 'magenta',
        'slothadv style, an animation strip of six frames left to right, each separate on the background: a cartoon hit spark, a bright '
        'yellow-white star burst with an orange outline, small, then bursting out big, then breaking into short separate rays. ' + STYLE),
}
KEYNAME = {'magenta': 'magenta', 'green': 'bright green'}

lairs = []
for n, (st, p) in PLATES.items():
    for s in (0.55, 0.68):
        for sd in (7, 23):
            lairs.append({'name': f'{n}-s{round(s * 100)}-{sd}', 'start': st, 'prompt': p, 'neg': NEG_PLATE, 'strength': s, 'seed': sd,
                          'w': 2048, 'h': 1152})
for n, (st, key, p) in STRIPS.items():
    for s in (0.62, 0.75):
        for sd in (7, 23):
            lairs.append({'name': f'{n}-s{round(s * 100)}-{sd}', 'start': st, 'prompt': p + KEYED.format(key=KEYNAME[key]), 'neg': NEG_KEY,
                          'strength': s, 'seed': sd, 'w': 2048, 'h': 512})
fx = []
for n, (st, key, p) in SHEETS.items():
    w, h = {'dust': (2048, 256), 'spark': (1536, 256)}.get(n, (1536, 1024))
    ss = (0.5, 0.62) if n in ('dust', 'spark') else (0.62, 0.75)
    for s in ss:
        for sd in (7, 23):
            fx.append({'name': f'{n}-s{round(s * 100)}-{sd}', 'start': st, 'prompt': p + KEYED.format(key=KEYNAME[key]), 'neg': NEG_KEY,
                       'strength': s, 'seed': sd, 'w': w, 'h': h})
here = Path(__file__).resolve().parent
for tag, items in (('hfboss-lairs', lairs), ('hfboss-fx', fx)):
    spec = {'note': f'{tag}: boss art batch, hf-art-bosses, 2026-10-29', 'base': BASE,
            'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'items': items}
    (here / f'spec-{tag}.json').write_text(json.dumps(spec, indent=1))
    print(tag, len(items))
