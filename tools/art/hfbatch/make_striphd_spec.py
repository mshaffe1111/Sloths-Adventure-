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
