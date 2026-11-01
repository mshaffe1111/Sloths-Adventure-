"""hf-props, one piece per picture (the probe w6p showed rough shapes on a grid canvas stay boxes at 0.82): each new piece painted on its
own 1024 picture from a plain key canvas at strength 1.0 with the style model, so the only thing steering it is the prompt and the
style model. Same light and line for all by the shared prompt tail. Cut by the largest blob (cut.py).

    python3 tools/art/hfprops/make_single.py <tag> <commit> <world>[,<world>...] [seeds, e.g. 5,17] [only, e.g. heron,crab]
"""
import json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from pieces import P as W, P2, P3, GRN  # noqa: E402

RAW = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/'
NEG = ('text, letters, numbers, watermark, frame, border, photo, 3d render, blurry, gradient background, cast shadow, floor, ground, '
       'grass ground strip, landscape, scenery, background, perspective, three-quarter view, seen from above, two objects, cropped, '
       'cut off, vignette, pedestal, plinth, base slab, stone base, platform under it, display stand, ground patch, puddle, shadow under it, '
       'tree branch, ceiling, hanging scenery, background trees, pink on the object, magenta on the object')


ANCHOR = '--anchor' in sys.argv
SET2 = '--set2' in sys.argv
SET3 = '--set3' in sys.argv
STRENGTH = next((float(a[11:]) for a in sys.argv if a.startswith('--strength=')), 1.0)
sys.argv = [a for a in sys.argv if not a.startswith('--')]


def prompt(world, desc, hang):
    spec = W[world]
    key = 'green #00FF00' if spec['key'] == GRN else 'magenta #FF00FF'
    where = ('one single isolated hanging piece, nothing above it, no branch, no tree, no ceiling, nothing else in the picture' if hang
             else 'standing on its own, nothing under it at all: no base, no pedestal, no ground slab, no rock under it, no puddle')
    if ANCHOR:
        return (f"slothadv style, two separate game props side by side for a side-scrolling platform game, for {spec['look']}. On the "
                f"left, the existing prop, kept as it is. On the right, a new prop painted in exactly the same hand-painted storybook "
                f"style, same ink line, same painted texture, same light from the upper left: {desc}, {where}. Seen exactly from the "
                f"side, each prop whole with space all round, on one flat plain pure {key} background, nothing else, no cast shadow, "
                f"no ground, no text, no {key.split()[0]} on the props.")
    return (f"slothadv style, one single game prop for a side-scrolling platform game: {desc}, {where}, for {spec['look']}. Hand-painted "
            f"storybook game art with painted texture, soft cel shading, thin dark ink outline, light from the upper left, seen exactly from the side, the "
            f"whole object fully in the picture with space all round, on one flat plain pure {key} background, nothing else, no cast "
            f"shadow, no ground, no water, no puddle, no scenery, no text.")


tag, sha, worlds = sys.argv[1], sys.argv[2], [int(w) for w in sys.argv[3].split(',')]
seeds = [int(s) for s in (sys.argv[4] if len(sys.argv) > 4 else '5,17').split(',')]
only = set(sys.argv[5].split(',')) if len(sys.argv) > 5 else None
items = []
for w in worlds:
    for (n, job, _units, desc) in (P3.get(w, []) if SET3 else P2[w] if SET2 else W[w]['pieces']):
        if only and n not in only:
            continue
        for sd in seeds:
            start = f'anchor-w{w}.png' if ANCHOR else 'plain-grn.png' if W[w]['key'] == GRN else 'plain-mag.png'
            items.append({'name': f'w{w}-{n}-{sd}' + ('a' if ANCHOR else ''), 'start': start,
                          'prompt': prompt(w, desc, job == 'hang'), 'strength': STRENGTH, 'seed': sd,
                          'w': 1536 if ANCHOR else 1024, 'h': 1024, 'steps': 26,
                          'loras': [['style', 0.8]], 'neg': NEG})
spec = {'note': f'hf-props single-piece batch {tag}, 2026-10-31', 'q': 92,
        'base': f'{RAW}{sha}/reference/prop-sheets/qa-notes/hf-props/starts/',
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors']}, 'items': items}
p = HERE / f'spec-{tag}.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(items), 'takes')
