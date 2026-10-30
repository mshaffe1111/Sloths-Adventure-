"""Write the spec for striphdgpu.py (VI-2 native-resolution backdrop strips, 2026-10-29).
    python3 tools/art/hfbatch/make_striphd_spec.py <out.json> <commit> <item> [<item> ...]
item = <file stem>:<strength>:<seed>[:<pre>], e.g. w1-near:0.35:7 (pre: esrgan, the default, a Real-ESRGAN anime 6B pass
first so the repaint starts from crisp lines; none: a plain Lanczos scale, the first try, which stayed soft). The source is the strip at <commit> on GitHub (src/assets/backdrops/), so
the strip as it was before the edges rebuild; near strips go to 1736 px tall, mid strips to 1302 (the game draws strips by height)."""
import json, sys

STYLE = ('slothadv style, painted storybook illustration, a wide side-scrolling game background layer, soft cel shading, thin dark '
         'outline, crisp clean hand-painted gouache brushwork with fine leaf and bark detail, light from the upper left, evenly lit, '
         'on one flat plain grey background, no text')
WHAT = {
    'w1-near': 'sunny lowland rainforest undergrowth: lush ferns and broad leaves, a mossy fallen log, small red-capped mushrooms, pink petals on a mossy forest floor',
    'w1-mid': 'big mossy rainforest trees with a spreading green canopy, hanging lianas, bromeliads and small purple orchids on the trunks, wide buttress roots',
    'w2-near': 'a riverbank: tall cattail reeds and grasses, orange flowers, a wooden post tied with rope, smooth brown river stones, broad leaves',
    'w2-mid': 'a sloth village: thatched round huts in and under big trees, rope bridges between the trees, palms, a long bench, a dirt bank with round wooden doors and little signs',
    'w3-near': 'a dark mossy grotto floor at night: dark ferns and leaves, wet stones, a little stream, small glowing teal mushrooms',
    'w3-mid': 'a dark cave mouth with mossy rock arches, twisting dark roots, dark leaves, glowworm threads hanging from the cave roof with tiny glowing dots',
    'w4-near': 'misty mountain ledges: grey slate rocks, a thin waterfall stream, dark ferns, a white feather on the rocks',
    'w4-mid': 'grey cliff crags with waterfalls, wind-bent small trees on top of the rocks, a twig nest on a tall rock pillar',
    'w5-near': 'a mossy golden orchid grove floor: twisted roots, ferns, white and pink orchids, small white flowers, falling pink petals',
    'w5-mid': 'tall golden-barked trees covered in big white and pink orchids, spider webs strung between the trees, ferns at their feet, moss',
    'w6-near': 'a murky grey-green mangrove swamp edge: arching mangrove roots, reeds, a fallen log, still dark water with lily pads and ripples, mossy stones',
    'w6-mid': 'grey-green mangrove trees standing in still swamp water on tall arching stilt roots, hanging grey moss, a broken stump, an old spear stuck in the water',
    'w7-near': 'a ruined jungle temple floor: cracked grey-green flagstones, toppled carved stone blocks, a fallen carved stone head, ferns, dry roots and leaves',
    'w7-mid': 'a ruined jungle temple: a carved stone tower with faces, stone stairs, broken arches and pillars, stone chairs, roots and red vines creeping over the stone',
    'w8-near': 'a dark blue night jungle floor: dark blue-green leaves and ferns, white star-shaped night flowers, tiny glowing fireflies',
    'w8-mid': 'a dark blue night forest: huge banyan trees with hanging aerial roots, moonlit blue leaves, white night flowers at their feet, tiny fireflies',
    'w9-near': 'a volcanic ground: black ash soil, cracked dark lava rock slabs with glowing orange cracks, a small smoking vent, red flowers',
    'w9-mid': 'volcanic land: a tall dark basalt column rock with orange lava glow and steam, smoking vents, a dead twisted tree, basalt columns, a few green shoots and red flowers',
    'w10-near': 'a dark wet slate highland at night in the rain: dark jagged rocks, wet shining stone, stone steps, dry grass tufts',
    'w10-mid': 'a dark rainy slate highland: jagged standing stones, stone stairs, wooden posts with rope nets and small blue lanterns, bare thorny branches, wet rocks',
}


def item(stem, strength, seed, commit, pre='esrgan'):
    world, part = stem.rsplit('-', 1)
    return {'name': f'{stem}-s{round(float(strength) * 100)}-{seed}' + ('' if pre == 'esrgan' else '-' + pre), 'pre': pre,
            'src': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/src/assets/backdrops/{stem}.webp',
            'h': 1736 if part == 'near' else 1302, 'strength': float(strength), 'seed': int(seed),
            'prompt': f'{STYLE}. {WHAT[stem]}', 'bg': [128, 128, 128]}


if __name__ == '__main__':
    out, commit = sys.argv[1], sys.argv[2]
    spec = {'note': 'VI-2 native-resolution strips, tools/art/hfbatch/striphdgpu.py, 2026-10-29',
            'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 0.8]}, 'tw': 1024,
            'items': [item(*a.split(':'), commit) for a in sys.argv[3:]]}
    open(out, 'w').write(json.dumps(spec, indent=1))
    print(out, len(spec['items']))
