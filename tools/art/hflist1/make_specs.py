"""Picture list 1 (R-165.100): the four img2img job specs for tools/art/w6to10/img2imggpu.py, and the job args.
usage: python3 make_specs.py specs  |  python3 make_specs.py args <spec name> <commit>"""
import sys, json
from pathlib import Path
from PIL import Image
H = Path(__file__).parent
STYLE = ('hand-painted 2D platformer game asset, seen exactly from the side, flat orthographic view, rich saturated colour, '
         'clean dark outline, painterly detail, isolated on a flat solid magenta background')
NEG = ('perspective, three-quarter view, isometric, seen from above, top-down, text, letters, numbers, watermark, frame, border, photo, '
       '3d render, blurry, gradient background, floor, cast shadow, sky, scenery behind')
P1 = {'P-08-c': 'mossy ancient stone ruin stairs, three worn steps', 'P-08-d': 'ancient carved stone ruin archway with a dark doorway, moss on the stones',
      'P-10-a': 'overhanging mossy rock cliff ledge with water drips falling from its underside', 'P-10-d': 'a hanging curtain of tangled jungle roots from a mossy branch',
      'P-11-a': 'a wooden pole scaffold lashed together with rope', 'P-11-c': 'a wooden palisade wall of sharpened stakes lashed with rope',
      'P-11-d': 'a wooden plank dock on posts standing in dark blue river water'}
P2 = {'P-03-a': 'a long strip of jungle ground: dark soil with tangled roots and a thick moss top, flat top edge, seamless horizontal tile',
      'P-03-b': 'a long strip of jungle ground: dark soil with roots, a moss top covered in fallen autumn leaves, flat top edge, seamless horizontal tile',
      'P-04-c': 'a thin long strip of dark jungle soil with fine roots and a moss top edge, seamless horizontal tile',
      'P-01-a': 'a strip of brown forest floor soil scattered with fallen leaves, flat top edge, seamless horizontal tile'}
P3 = 'a natural rainforest tree stump broken off and rotted down to a level top, a thick cushion of green moss on its flat top, spreading roots, weathered bark, no saw cuts, no tree rings, no cut face'
P4 = {'P-02-a': 'a block of earth seen exactly from the side, a flat grassy top edge, layered brown soil with small stones on its front',
      'P-02-b': 'a block of earth seen exactly from the side, a flat gravel top edge, layered brown soil on its front',
      'P-02-c': 'a block of earth seen exactly from the side, a row of weathered wooden planks laid flat on its top edge, layered brown soil on its front',
      'P-02-d': 'a block of earth seen exactly from the side, a flat top edge with scattered pebbles, layered brown soil on its front'}
SEEDS = (11, 23)


def it(start, prompt, strengths):
    w, h = Image.open(H.parents[2] / 'reference/art-incoming/hf-list1/starts' / start).size  # starts live in reference/ (tools/ ignores pictures)
    return [{'name': f"{start[:-4]}-s{s}-{sd}", 'start': start, 'prompt': f'{prompt}, {STYLE}', 'strength': s / 100, 'seed': sd, 'w': w, 'h': h}
            for s in strengths for sd in SEEDS]


def specs():
    jobs = {'A': [x for p in ['P-08-c', 'P-08-d', 'P-10-a', 'P-10-d'] for x in it(f'i1-{p}.jpg', P1[p], (52, 60))],
            'B': [x for p in ['P-11-a', 'P-11-c', 'P-11-d'] for x in it(f'i1-{p}.jpg', P1[p], (52, 60))],
            'C': [x for p in P2 for x in it(f'i2-{p}.jpg', P2[p], (52, 60))],
            'D': [x for n in ['stump-short', 'stump-medium', 'stump-tall'] for x in it(f'i3-{n}.jpg', P3, (60, 68))] +
                 [x for p in P4 for x in it(f'i4-{p}.jpg', P4[p], (62, 68))]}
    for k, items in jobs.items():
        spec = {'tag': f'hfl1-{k}', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG,
                'base': 'BASE', 'items': items}
        (H / f'spec-{k}.json').write_text(json.dumps(spec, indent=1)); print(f'spec-{k}.json', len(items))


def args(name, sha):
    gh = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sha}/tools/art/'
    spec = json.loads((H / name).read_text()); tag = spec['tag']
    fetch = (f'mkdir -p /out/hflist1 && curl -sSfL {gh}hflist1/{name} | sed "s#\\"BASE\\"#\\"{gh[:-len('tools/art/')]}reference/art-incoming/hf-list1/starts/\\"#" > /out/hflist1/{name} && ')
    print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True,
                      'command': ['bash', '-lc', fetch + f'curl -sSfL {gh}w6to10/img2imggpu.py -o /tmp/g.py && SPEC=hflist1/{name} '
                                  f'SUB=hflist1/{tag} TAG={tag} python /tmp/g.py'],
                      'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'name': tag}))




def hd(sha):  # item 2's circular native pass (hfbatch/striphdgpu.py, hf-art.md §4: s25, tile 1024) on the 4 picked strips
    raw = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sha}/reference/art-incoming/hf-list1/strip-src/'
    src = H.parents[2] / 'reference/art-incoming/hf-list1/strip-src'
    items = []
    for f in sorted(src.glob('*.png')):
        pid = f.stem[3:9]
        items.append({'name': f'hd-{f.stem}', 'src': raw + f.name, 'h': Image.open(f).height, 'prompt': f'{P2[pid]}, {STYLE}',
                      'strength': 0.25, 'seed': 7, 'bg': [255, 0, 255]})
    spec = {'tag': 'hfl1-hd', 'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'tw': 1024,
            'items': items}
    (H / 'spec-hd.json').write_text(json.dumps(spec, indent=1)); print('spec-hd.json', len(items))


def hdargs(sha):
    gh = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{sha}/tools/art/'
    fetch = f'mkdir -p /out/hflist1 && curl -sSfL {gh}hflist1/spec-hd.json -o /out/hflist1/spec-hd.json && '
    print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True,
                      'command': ['bash', '-lc', fetch + f'curl -sSfL {gh}hfbatch/striphdgpu.py -o /tmp/g.py && SPEC=hflist1/spec-hd.json '
                                  'SUB=hflist1/hfl1-hd TAG=hfl1-hd python /tmp/g.py'],
                      'secrets': {'HF_TOKEN': '$HF_TOKEN'}, 'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'name': 'hfl1-hd'}))


if __name__ == '__main__':
    c = sys.argv[1]
    specs() if c == 'specs' else hd(sys.argv[2]) if c == 'hd' else hdargs(sys.argv[2]) if c == 'hdargs' else args(sys.argv[2], sys.argv[3])
