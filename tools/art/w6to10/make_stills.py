"""Round 2 stills for Worlds 5-10 (2026-10-28): write tools/art/gen/spec-w6to10-stills.json for stillsgpu.py.

    python3 -I tools/art/w6to10/make_stills.py [out.json]

(the GPU job runs this same file in the bucket to write its spec next to it, so only this small file goes through the connector)

  lair-<boss>-<calm|rage>-<seed>  the guardians' lairs as one painting each (like lairs/prowler-lair.webp, 2560x1430), calm and in the
                                  last third of the fight, from the lair*.ts descriptions (World 10 from the story's fortress gate)
  far-w<N>-<time>-<seed>          two more times of day for the far strip of Worlds 6-10 (stageBackdrops.ts FAR_BY_STAGE: stages 1-3
                                  and 7-9 play under another far strip; 2048x868 in the game)
  free-<who>-<seed>               the ten guardians and the General with their collars off (Art Still Needed: guardians-free), each
                                  from its own character model
  collar-<k>-<seed>               the iron collar closed, cracked, splitting, falling, lying open
  prop-w<N>-<what>-<seed>         single props for Worlds 7-10 on flat grey (the kits' ground, ledge, hang and climb pieces)
"""
import json, sys
from pathlib import Path

GEN = Path(__file__).resolve().parent.parent / 'gen'
S = 'slothadv style, painted storybook illustration, '
LORAS = {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}
for n in ('venom', 'croc', 'prowler', 'sovereign', 'queen', 'reaver', 'golem', 'monarch', 'drake', 'general', 'thornbark'):
    LORAS[n] = [f'mshaffe111/{n}-qwen-lora', f'{n}_qwen_v1.safetensors', 1.0]

LAIR = ('a wide painted background for a side-scrolling game boss arena, {d}, no characters, no animals, no creatures, no text, a clear '
        'open floor across the bottom quarter, rich deep colour, soft light from the upper left')
LAIRS = {
    'queen': ('the inside of a vast hollow tree cavern, black-green and damp, hung with curtains of white spider silk, a giant orb web filling '
              'the far wall, silk cocoons dangling on single threads, patches of glowing teal fungus giving the only light, a small tea '
              'table set for two with china cups in the middle distance',
              'the egg sacs bursting, the glow turned an angry red, many pairs of small red eyes open all over the dark walls'),
    'reaver': ('a rotting plank dock on the edge of a mangrove swamp at dusk, pewter mist over still brown water, three ranks of stilt-rooted '
               'mangrove trees going back into the haze, a stilt house with lit lanterns far across the water, spear racks hung with fish '
               'at both ends of the dock',
               'the sky turned smoky ember orange, every lantern and torch flaring bright, embers rising off the water'),
    'golem': ('the great hall of a drowned ancient temple, black-blue and cold, a colossal carved stone face set into the far wall with empty '
              'eye sockets holding a slow blue glow, two ranks of rune-carved stone pillars, shafts of pale light falling through holes in '
              'the roof, lianas hanging in the gloom',
              "the giant face's eyes blazing white-blue, every rune on the pillars flaring, dust and grit falling from the roof"),
    'monarch': ('a limestone cavern under a karst tower at night, the roof hung with stalactites and hundreds of sleeping bats, one round '
                'hole in the roof letting a shaft of moonlight fall to the floor, blue and violet fungus glowing along the floor',
                'the moonlight gone and the cave almost dark, many small glowing eyes open across the black roof, bat shadows crossing'),
    'drake': ('a volcanic cavern with a slow river of glowing lava, untidy heaps of tarnished treasure, old cups and teapots and junk, black '
              'basalt columns, smoke and warm orange glow',
              'lava erupting in fountains, the whole cave lit bright red, sparks and ash in the air'),
    'general': ('the courtyard in front of a dark stone mountain fortress gate at night in a thunderstorm, black iron netting with iron '
                'thorns, wet stone steps, crimson claw banners, one warm lit window high in the tower, slanting rain',
                'the banners burning, the sky blood red and torn by lightning, embers and smoke in the rain'),
}
FAR = ('a very wide painted storybook landscape for a side-scrolling game background, only the sky and the far distance, {d}, no '
       'characters, no animals, no text, nothing close to the viewer')
FARS = {
    'w6': {'dawn': 'a flat still grey mangrove swamp at dawn, pale pink-grey mist lying low over black water, tall mangrove trees on '
                   'arching roots standing in the water, a pale sun low on the horizon',
           'dusk': 'a still dark mangrove swamp at dusk, deep blue-green light, many fireflies glowing among the arching roots, the '
                   'warm lights of a stilt house far away across the black water'},
    'w7': {'dawn': 'an overgrown jungle temple city at dawn, pale gold light through mist, carved stone towers with great stone faces '
                   'wrapped in strangler fig roots',
           'dusk': 'an overgrown jungle temple city at dusk, dim green-grey and lonely, brown dead vines hanging on the carved towers, '
                   'the last light low behind them'},
    'w8': {'sunset': 'the high jungle canopy at sunset, a violet and orange sky with the first stars, round treetops rolling away to '
                     'the horizon, tall limestone karst towers',
           'night': 'the high jungle canopy deep in the night, a low silver moon over a sea of clouds, moonlit treetops and karst towers, '
                    'many stars'},
    'w9': {'dawn': 'a scorched volcanic valley at dawn, a pink-grey ash sky, a smoking volcano far away, black lava fields with young '
                   'green trees growing back',
           'night': 'a volcanic valley at night, rivers of lava glowing bright orange under a dark red smoky sky, a volcano erupting far away'},
    'w10': {'dusk': 'bare rocky mountains at dusk before a storm, heavy purple clouds gathering, a long zigzag of stone steps climbing to a '
                    'small dark fortress on the highest summit',
            'after': 'bare rocky mountains at dawn after a storm, the clouds breaking and a clear gold sky, wet rock glinting, a small '
                     'dark fortress on the highest summit with one lit window'},
}
FREE = 'relaxed and free, head lifted, eyes soft, standing at ease, no collar, no armour, side view facing right, painted storybook illustration, plain grey background'
WHO = {
    'venom': 'venomfang, a huge emerald-green tree boa snake with pale jagged markings and a small gold crown, coiled calmly',
    'croc': 'crocusrex, a huge dark olive-green crocodile with rows of spiked scales and a crown of petals',
    'prowler': 'shadowprowler, a huge blue-black panther with faint spots and glowing green eyes, sitting calmly',
    'sovereign': 'skysovereign, a huge grey harpy eagle with a feathered crest and yellow talons, perched calmly',
    'queen': 'tarantulaqueen, a giant hairy tarantula spider, a little lace doily on her head',
    'reaver': 'marshreaver, a huge grey-brown giant otter standing upright, his spear set down',
    'golem': 'stonegolem, a huge stone golem of mossy carved stone with softly glowing blue runes, his hammer set down',
    'monarch': 'nightmonarch, a huge dark bat with red eyes and wide leathery wings folded',
    'drake': 'magmadrake, a huge green spiky lizard drake with a long tail, lying down calmly',
    'general': 'generalsloth, a huge old broad sloth with a rust-coloured scarf, a plain grandfather, no armour, standing at ease',
    'thornbark': 'thornbarksloth, a huge dark sloth healed and gentle, the thorns gone, resting on his bone club',
}
COLLAR = {
    'closed': 'a heavy black iron collar with small thorns on the inside, closed',
    'cracked': 'a heavy black iron collar with small thorns on the inside, a bright crack across it',
    'split': 'a heavy black iron collar with thorns on the inside splitting in two, a few sparks at the break',
    'falling': 'the two halves of a broken black iron collar with thorns on the inside, falling apart in the air',
    'open': 'the two halves of a broken black iron collar with thorns on the inside, lying open on the ground',
}
PROP = ('a single game prop for a side-scrolling platform game, seen straight from the side, {d}, alone and centred on a flat plain '
        'mid grey background, no shadow on the background, no text')
PROPS = {
    'w7': {'beam': 'a long carved grey temple stone beam with moss along its top', 'column': 'a broken carved grey stone column with moss',
           'block': 'a big carved grey temple flagstone block with moss in the cracks', 'vine': 'a long dry brown dead hanging vine with a knot at the top'},
    'w8': {'bough': 'a broad flat-topped mossy tree bough with a silver rim of moonlight', 'liana': 'a long hanging liana vine in blue moonlight',
           'burl': 'a round bark burl with moss and one pale night flower'},
    'w9': {'column': 'one tall hexagonal black basalt column with ash on top', 'slab': 'a flat slab of cooled black lava crust with thin glowing orange cracks',
           'stump': 'a charred black tree stump with a young green shoot and one small red pompom flower', 'vine': 'a tough dark scorched vine hanging down with small green leaves near the top'},
    'w10': {'grate': 'a black iron grate walkway section with square holes', 'chain': 'a heavy black iron chain hanging from an iron ring',
            'stair': 'one carved wet stone stair block', 'post': 'a black iron post with a short iron bracket sticking out',
            'netting': 'a strip of black iron netting with a big square mesh and small blunt thorns'},
}


def write():
    it = []
    for b, (calm, rage) in LAIRS.items():
        for s in (5, 17):
            it.append({'name': f'lair-{b}-calm-{s}', 'prompt': S + LAIR.format(d=calm), 'seed': s, 'w': 1664, 'h': 928})
            it.append({'name': f'lair-{b}-rage-{s}', 'prompt': S + LAIR.format(d=calm + ', ' + rage), 'seed': s, 'w': 1664, 'h': 928})
    for w, times in FARS.items():
        for t, d in times.items():
            for s in (5, 17):
                it.append({'name': f'far-{w}-{t}-{s}', 'prompt': S + FAR.format(d=d), 'seed': s, 'w': 1792, 'h': 768})
    for who, d in WHO.items():
        for s in (5, 17):
            it.append({'name': f'free-{who}-{s}', 'prompt': d + ', ' + FREE, 'seed': s, 'lora': who})
    for k, d in COLLAR.items():
        for s in (5, 17):
            it.append({'name': f'collar-{k}-{s}', 'prompt': S + d + ', a game item, alone and centred on a flat plain mid grey background, no text', 'seed': s})
    for w, ps in PROPS.items():
        for k, d in ps.items():
            for s in (5, 17):
                it.append({'name': f'prop-{w}-{k}-{s}', 'prompt': S + PROP.format(d=d), 'seed': s})
    spec = {'tag': 'w6to10-stills', 'script': 'tools/art/w6to10/stillsgpu.py', 'flavor': 'rtx-pro-6000', 'loras': LORAS, 'items': it}
    (Path(sys.argv[1]) if len(sys.argv) > 1 else GEN / 'spec-w6to10-stills.json').write_text(json.dumps(spec, separators=(',', ':')))
    print(len(it), 'stills')


if __name__ == '__main__':
    write()
