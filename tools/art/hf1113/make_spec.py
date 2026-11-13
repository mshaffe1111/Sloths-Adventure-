"""ART 11-13 specs for tools/art/hfpokey/pokeygpu.py (edits: Qwen-Image-Edit-2511 + Pokey's character model).

    python3 -I tools/art/hf1113/make_spec.py climb1 <commit with the starts>   -> tools/art/hf1113/spec-climb1.json
    python3 -I tools/art/hf1113/make_spec.py args tools/art/hf1113/spec-climb1.json <commit with the spec>   -> hf_jobs run args
Results: bucket mshaffe111/w5-xfer hfpokey/edits/<name>-s<seed>.png and hfpokey/edits/sheet-<tag>.jpg. The token only as the job secret.
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
KEEP = ('Keep everything else exactly as in the picture: the same face and eyes, the same brown fur and cream belly and cream face, the '
        'same pale bandage wrist wraps, the same thin brown satchel strap across his chest and the small brown bag at his hip, the same '
        'thin dark outline, the same soft painted storybook cartoon style, the same size, the same two vines in the same places, and the '
        'same flat plain grey background. Nothing else in the picture.')
NEG = ('extra limbs, extra arms, extra paws, extra sloth, two sloths, bar between his paws, stick, rope between the vines, branch, '
       'third vine, changed face, different eyes, missing wrist wraps, missing satchel, background scenery, ground, shadow, photo, '
       '3d render, text, watermark, blurry, back view, side view, tail')
BASE = ('The friendly brown three-toed sloth is climbing up between the two vertical vines, facing us, his body hanging in the middle '
        'between them, one paw gripping each vine, his arms stretched out wide to the sides and up, his claws curled round the vines. ')
POSES = {
    'reachL': 'His left arm (on the left of the picture) reaches high up the left vine above his head, gripping it; his other arm is '
              'lower, bent, gripping the right vine at the height of his shoulder; his left knee is raised, his other leg hangs down.',
    'reachR': 'His right arm (on the right of the picture) reaches high up the right vine above his head, gripping it; his other arm is '
              'lower, bent, gripping the left vine at the height of his shoulder; his right knee is raised, his other leg hangs down.',
    'pull': 'Both paws grip the vines at the same height just above his head, his elbows bent out to the sides as he pulls himself up, '
            'both knees tucked up under him.',
    'hang': 'Both paws grip the vines at the same height above his head, his arms straight out in a wide V, his body hanging long and '
            'relaxed between them, his legs hanging down.',
}


def climb1(commit):
    src = f'gh:{commit}:reference/art/hf1113/starts/climb-hang.png'
    edits = [{'name': f'c1-{k}', 'src': src, 'w': 1024, 'h': 1024, 'prompt': BASE + v + ' ' + KEEP, 'neg': NEG,
              'seeds': [1, 2, 3], 'lora': 0.6} for k, v in POSES.items()]
    spec = {'tag': 'climb1', 'edits': edits}
    (H / 'spec-climb1.json').write_text(json.dumps(spec, indent=1))
    print(len(edits) * 3, 'edits')


def args(spec, commit):
    name = Path(spec).name
    gh = f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/'
    tag = json.loads(Path(spec).read_text())['tag']
    cmd = (f'mkdir -p /out/hfpokey/jobs && curl -fsSL {gh}hfpokey/pokeygpu.py -o /out/hfpokey/jobs/pokeygpu-1113.py && '
           f'curl -fsSL {gh}hf1113/{name} -o /out/hfpokey/jobs/{name} && '
           'python -c "from diffusers import QwenImageEditPlusPipeline" 2>/dev/null || pip install -q --break-system-packages -U diffusers; '
           f'SPEC=hfpokey/jobs/{name} python /out/hfpokey/jobs/pokeygpu-1113.py')
    print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '1h', 'detach': True,
                      'command': ['bash', '-lc', cmd], 'secrets': {'HF_TOKEN': '$HF_TOKEN'},
                      'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'name': f'art1113-{tag}'}))


if __name__ == '__main__':
    {'climb1': lambda: climb1(sys.argv[2]), 'args': lambda: args(sys.argv[2], sys.argv[3])}[sys.argv[1]]()
