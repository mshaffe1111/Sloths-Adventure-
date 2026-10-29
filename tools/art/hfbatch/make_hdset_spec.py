"""The one batched job for the upright fix (X-16, Matt 2026-10-29: "no upscaling, get the higher-resolution art from Hugging Face"):
every far strip and the World 5 mood and World 1 canopy middle and near strips repainted at native resolution (striphdgpu.py, the way the
native near and mid strips were made: a Real-ESRGAN start repainted at 0.25 with the style model, in tiles round the strip so it stays
seamless), then the painted sky above each new far strip (skygpu.py, from the native strip itself).

    python3 tools/art/hfbatch/make_hdset_spec.py <commit>     writes tools/art/hfbatch/specs/spec-hdset.json and spec-hdsky.json
Job: tools/art/hfbatch/hdset.sh (both steps in one GPU job)."""
import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_sky_spec import NEG, STYLE as SKY_STYLE, WHAT as SKY  # noqa: E402

ROOT = Path(__file__).resolve().parents[3]
STYLE = ('slothadv style, painted storybook illustration, a wide side-scrolling game background layer, soft cel shading, thin dark '
         'outline, crisp clean hand-painted gouache brushwork with fine detail, light from the upper left')
CUTS = {
    'w1c-mid': 'the rainforest canopy high in the trees: big mossy branches, dense leaves, hanging lianas',
    'w1c-near': 'dense broad rainforest leaves high in the canopy',
    'w5gold2-mid': 'tall golden-barked trees covered in big white and pink orchids, spider webs between the trees, ferns',
    'w5gold2-near': 'a mossy golden orchid grove floor: twisted roots, ferns, white and pink orchids, falling pink petals',
    'w5dusk1-mid': 'tall purple-barked trees covered in big white and pink orchids at dusk, spider webs, ferns',
    'w5dusk1-near': 'a mossy orchid grove floor at dusk: twisted purple roots, ferns, white and pink orchids, falling petals',
    'w5dusk2-mid': 'tall purple-barked trees covered in big white and pink orchids at dusk, spider webs, ferns',
    'w5dusk2-near': 'a mossy fallen log at dusk with ferns, white orchids and pink petals',
    'w5twi1-mid': 'tall violet trees with pale orchids at twilight, spider webs, ferns',
    'w5twi1-near': 'a mossy orchid grove floor at twilight: violet roots, ferns, pale orchids, small white flowers',
    'w5twi2-mid': 'tall violet trees with pale orchids at twilight, spider webs, ferns',
    'w5twi2-near': 'a mossy orchid grove floor at twilight: violet roots, ferns, pale orchids, small white flowers',
    'w5night-mid': 'tall dark blue trees at night with blue orchids',
    'w5night-near': 'a dark blue night grove floor with blue orchids, ferns and roots',
}


def main(commit):
    base = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/src/assets/backdrops/'
    items = []
    for stem in sorted(SKY):
        items.append({'name': f'{stem}-far-hd', 'pre': 'esrgan', 'src': f'{base}{stem}-far.webp', 'h': 1302, 'strength': 0.25,
                      'seed': 7, 'steps': 24, 'prompt': f'{STYLE}. {SKY[stem].split(",")[0]}, the far distance of the scene',
                      'bg': [128, 128, 128]})
    for name, what in CUTS.items():
        items.append({'name': f'{name}-hd', 'pre': 'esrgan', 'src': f'{base}{name}.webp', 'h': 1736 if name.endswith('near') else 1302,
                      'strength': 0.25, 'seed': 7, 'steps': 24, 'prompt': f'{STYLE}, on one flat plain grey background, no text. {what}',
                      'bg': [128, 128, 128]})
    hd = {'note': 'X-16 native-resolution far and mood strips, striphdgpu.py, 2026-10-29',
          'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 0.8]}, 'tw': 1024, 'items': items}
    sky = {'note': 'X-16 the painted sky above each native far strip, skygpu.py, 2026-10-29',
           'loras': hd['loras'], 'tw': 1024,
           'items': [{'name': f'{stem}-sky', 'src': f'/out/hfbatch/hdset/{stem}-far-hd.webp', 'strength': 1.0, 'seed': 7, 'steps': 20,
                      'ext': 0.35, 'ctx': 0.3, 'prompt': f'{SKY_STYLE}. {SKY[stem]}', 'neg': NEG} for stem in sorted(SKY)]}
    out = ROOT / 'tools/art/hfbatch/specs'
    (out / 'spec-hdset.json').write_text(json.dumps(hd, indent=1))
    (out / 'spec-hdsky.json').write_text(json.dumps(sky, indent=1))
    print(len(items), 'strips,', len(sky['items']), 'skies')


if __name__ == '__main__':
    main(sys.argv[1])
