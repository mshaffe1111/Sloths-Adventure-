"""World story plates (hf-cutscenes, 2026-10-31): 73% of the story's panels stood on a world's gameplay scenery, soft and hazy upright.
Each start is that world's own story scenery for one mood, rendered at the plate shape with nobody in it (tools/art/hfstory/worldstarts.mjs),
repainted with Qwen-Image img2img and the style model (tools/art/storyart/storygpu.py), then painted again tile by tile at 2560 x 2720 like
every other plate. The ground strip stays where the cast stand (0.8 of the scene part).

    python3 tools/art/hfstory/make_spec_worldplates.py draft <commit> [keys]   -> spec-wp-draft.json (1280 x 1360, two strengths)
    python3 tools/art/hfstory/make_spec_worldplates.py full <commit> <name,name...> -> spec-wp-full.json (the picks at 2560 x 2720)
    python3 tools/art/hfstory/make_spec_worldplates.py args <draft|full> <commit>
"""
import json, re, sys
from pathlib import Path

H = Path(__file__).resolve().parent
STYLE = ('slothadv style, painted storybook illustration, soft cel shading, thin dark outlines, rich clear colour, crisp detail, '
         'a wide establishing background with nobody in it, ')
TAIL = (' A broad flat mossy floor across the bottom where characters will stand, kept clear. No characters, no animals, no text.')
# round 3 (the floor came out as water, mist or lava on some): the bottom fifth said outright
FLOOR = {
    '2': ' In the foreground across the whole bottom of the picture, a broad flat bank of dry warm sand and short grass in sharp focus, solid ground, the river behind it. No lily pads in the foreground.',
    '1': ' In the foreground across the whole bottom of the picture, a broad flat mossy branch floor in sharp focus. Rich golden light, crisp detail, no flat colour.',
    '4': ' In the foreground across the whole bottom of the picture, a broad flat mossy rock ledge in sharp focus, dry and solid, the pool and the mist behind it.',
    '6': ' In the foreground across the whole bottom of the picture, a broad flat bank of dark mud and thick mangrove roots in sharp focus, solid ground, the water behind it.',
    '8': ' In the foreground across the whole bottom of the picture, a broad flat mossy tree branch walkway in sharp focus. Clear readable shapes, crisp leaves, no blur, no bokeh.',
    '9': ' In the foreground across the whole bottom of the picture, a broad flat ledge of cool dark basalt rock in sharp focus, solid and safe, the lava only far behind it.',
}
NEG = ('characters, people, animals, sloths, birds, creatures, text, letters, watermark, frame, border, photo, 3d render, blurry, '
       'hazy, washed out, foggy grey, low contrast, flat colour, vignette')
EXTRA_NEG = {'2': ', chinese characters, writing, calligraphy, lily pads in front', '1': ', big flat leaf, cyan leaf', '7': ', doorway, glowing gate, target symbol, sign', '4': ', feather', '3': ', dotted lines, rows of dots, code, moths, butterflies, black slab, monolith, flat dark shape', '8': ', two moons'}
LORAS = {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']}

P = {
    '1-day': 'a lush emerald rainforest canopy in clear morning light: a great mossy old tree trunk, hanging lianas, big ferns and '
             'bromeliads, pink petals on the moss, warm sunbeams slanting through green leaves, a sweep of jungle hills far behind.',
    '1-storm': 'the same emerald rainforest canopy as a storm breaks: a dark green-blue sky, wind tossing the leaves, slanting rain, '
               'the great mossy trunk wet and gleaming, leaves torn loose in the air, dramatic but readable.',
    '1-dusk': 'the emerald rainforest canopy at golden dusk: the great mossy trunk lit warm orange from the side, long shadows, '
              'fireflies starting, a peach and violet sky between the leaves.',
    '2-day': 'a sunny wide riverbank, the near bank of warm sand, mossy rocks and grass across the bottom, behind it in warm afternoon light: tall reeds and cattails, a reed-thatched village hut on stilts '
             'and a big shady tree, a slow muddy river with soft painted ripples and reflections, lily pads, a dry sandy bank in front.',
    '3-night': 'a deep mossy grotto cave at night: glowing blue-green mushrooms, glowworms hanging from the cave ceiling as soft '
               'glowing strands of light beads, damp mossy rocks, a faint teal glow, cool dark blues with warm-free shadows.',
    '3-glow': 'a mossy grotto cave glowing softly: luminous blue and violet mushrooms, glowworm strands, a still pool reflecting the '
              'glow, mossy stones, magical and calm.',
    '3-storm': 'a mossy grotto cave mouth in a storm: rain pouring past the opening, wet glistening rocks, glowing mushrooms in the '
               'dark, cold blue light.',
    '4-day': 'misty cascades: tall grey-green cliffs, a big white waterfall pouring down into soft mist, mossy rock ledges, '
             'twisted cliff trees, cool clear daylight, layered mist between the cliffs.',
    '5-day': 'an orchid sanctuary in bright warm light: giant pink and white orchids, huge glossy leaves, golden light through the '
             'canopy, a mossy forest floor with small flowers.',
    '5-dusk': 'an orchid sanctuary at amber dusk: giant orchids glowing in low golden light, huge leaves in silhouette, warm haze '
              'of pollen sparkles, long soft shadows.',
    '5-glow': 'an orchid sanctuary at twilight, glowing: luminous orchids and soft floating sparkles, deep green leaves, warm '
              'lantern-like light from the flowers.',
    '6-dusk': 'a deep mangrove swamp at dusk: arching mangrove roots over dark still water, hanging moss, fireflies, a low copper '
              'sunset through the trees, green-brown shadows with warm rim light.',
    '6-day': 'a deep mangrove swamp by day: arching mangrove roots, still green water with lily pads, hanging moss, soft green light.',
    '7-day': 'ancient jungle ruins in warm daylight: mossy carved stone pillars and an archway, roots growing over old steps, '
             'sun shafts through tall trees.',
    '7-dusk': 'ancient jungle ruins at amber dusk: mossy carved stone pillars, a stone gateway, roots over old steps, warm '
              'low light and long shadows.',
    '8-night': 'twilight treetops at night: a high wide branch walk among giant leaves, a big soft moon behind thin clouds, '
               'deep blue and violet sky, glowing fireflies and pale night flowers, silver moonlight on the leaves.',
    '9-dusk': 'a volcanic jungle at dusk: a smoking volcano behind charred trees, glowing orange lava cracks in dark rock, embers '
              'drifting, red-orange sky, warm firelight on dark stone.',
    '9-night': 'a volcanic jungle at night: a sheltered hollow of warm dark rock, a dull red glow from far lava, embers in the '
               'air, dark trees, a deep night sky with a few stars.',
    '10-storm': 'stormy highlands: a dark spired fortress on a crag far behind, heavy grey-violet storm clouds, slanting rain, wet '
                'heather and rocks, a lightning glow in the clouds, dramatic but readable.',
    '10-day': 'the highlands after the storm in clear daylight: green heather hills, wet rocks shining, a dark fortress on the '
              'crag far behind, broken clouds and blue sky.',
    '10-dusk': 'the highlands at dusk: heather hills, a dark fortress on the crag far off, a warm orange and violet sky, '
               'clearing clouds.',
}


def draft(commit, keys=None):
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfstory/starts/'
    it = []
    for k, say in P.items():
        if keys and k not in keys:
            continue
        for s in (0.5, 0.64):
            it.append({'name': f'wp-{k}-s{round(s * 100)}', 'start': f'w{k.replace("-", "-")}.webp', 'prompt': STYLE + say + TAIL,
                       'neg': NEG + EXTRA_NEG.get(k.split('-')[0], ''), 'strength': s, 'seed': 7, 'w': 1280, 'h': 1360, 'loras': [['style', 1.0]]})
    return {'tag': 'wpd', 'loras': LORAS, 'base': base, 'items': it, 'q': 90,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': [x['name'] for x in it]}


def redo(commit, keys, strengths=(0.62, 0.72), tag='r'):
    """round 2: the starts rendered again without the stage's foreground overlay (hanging fronds, glowworm dots), W2's flat water band
    painted out (starts2/)"""
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfstory/'
    st = lambda k: f'starts2/w{k}.webp' if (H / f'starts2/w{k}.webp').exists() else f'starts/w{k}.webp'
    it = [{'name': f'wp-{k}-{tag}{round(s * 100)}', 'start': st(k), 'prompt': STYLE + P[k] + FLOOR.get(k.split('-')[0], '') + TAIL,
           'neg': NEG + EXTRA_NEG.get(k.split('-')[0], ''), 'strength': s, 'seed': 13, 'w': 1280, 'h': 1360, 'loras': [['style', 1.0]]}
          for k in keys for s in strengths]
    return {'tag': 'wpr', 'loras': LORAS, 'base': base, 'items': it, 'q': 90,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': [x['name'] for x in it]}


def full(commit, names):
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfstory/picks/'
    it = []
    for n in names:
        k = re.sub(r'-[srtuv]\d+$', '', n[3:])
        it.append({'name': f'{n}-full', 'start': f'bucket:hfcut/out/{n}.png', 'prompt': STYLE + P[k] + FLOOR.get(k.split('-')[0], '') + TAIL, 'neg': NEG + EXTRA_NEG.get(k.split('-')[0], ''),
                   'strength': 0.28, 'seed': 5, 'w': 2560, 'h': 2720, 'tile': [1280, 256], 'loras': [['style', 1.0]]})
    return {'tag': 'wpf', 'loras': LORAS, 'base': base, 'items': it, 'q': 90,
            'repo': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/', 'keep': [x['name'] for x in it]}


def args(name, commit):
    raw = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art'
    get = (f'mkdir -p /out/hfcut/jobs && curl -fsSL {raw}/storyart/storygpu.py -o /out/hfcut/jobs/storygpu.py && '
           f'curl -fsSL {raw}/hfstory/spec-wp-{name}.json -o /out/hfcut/jobs/spec-wp-{name}.json && ')
    print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '2h', 'detach': True,
                      'command': ['bash', '-lc', get + f'SUB=hfcut SPEC=hfcut/jobs/spec-wp-{name}.json TAG=wp{name} '
                                  'python /out/hfcut/jobs/storygpu.py'],
                      'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'],
                      'name': f'hfcut-wp-{name}'}, indent=1))


if __name__ == '__main__':
    if sys.argv[1] == 'args':
        args(sys.argv[2], sys.argv[3])
    elif sys.argv[1] == 'draft':
        spec = draft(sys.argv[2], sys.argv[3].split(',') if len(sys.argv) > 3 else None)
        (H / 'spec-wp-draft.json').write_text(json.dumps(spec, indent=1))
        print(len(spec['items']), 'items')
    elif sys.argv[1] == 'redo':
        spec = redo(sys.argv[2], sys.argv[3].split(','), tag=sys.argv[4] if len(sys.argv) > 4 else 'r')
        (H / f'spec-wp-redo{sys.argv[4] if len(sys.argv) > 4 else ""}.json').write_text(json.dumps(spec, indent=1))
        print(len(spec['items']), 'items')
    elif sys.argv[1] == 'full':
        spec = full(sys.argv[2], sys.argv[3].split(','))
        (H / 'spec-wp-full.json').write_text(json.dumps(spec, indent=1))
        print(len(spec['items']), 'items')
