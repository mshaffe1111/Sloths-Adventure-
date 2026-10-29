"""Write the hf-art-pokey job specs (2026-10-29).

    python3 -I tools/art/hfpokey/make_spec.py edit1 <commit of this branch with starts/>   -> spec-edit1.json
    python3 -I tools/art/hfpokey/make_spec.py args <spec>                                    -> the hf_jobs run args

Upload pokeygpu.py and the spec to hf://buckets/mshaffe111/w5-xfer/hfpokey/jobs/ with hf_fs_write, then run the job.
"""
import json, sys
from pathlib import Path

H = Path(__file__).resolve().parent
SLIDE = '67ae3a9d95fb3c8ca7004a38b08f968f29f32834'  # w7-slide
SLIDE_DIR = 'reference/prop-sheets/gemini-batch-2026-10-29/7-4-slide/'
TREAD_CLIP, TREAD_FR = 'w6-pokey-tread-tread-22-s3', [18, 21, 24, 27, 31, 35]
UNDER_CLIP, UNDER_FR = 'w6-pokey-under-under-44-s11', [22, 25, 28, 31, 34, 37, 40, 43]

KEEP = ('Keep everything else exactly the same: the same sloth, the same pose, the same face and eyes, the same paws and claws, the '
        'same bandage wrist wraps, the same fur colours, the same thin dark outline, the same soft painted cartoon style and the same '
        'flat plain grey background.')
SAT_TREAD = ('Add to the sloth in Picture 1 the brown leather satchel that the sloth in Picture 2 wears, worn the same way: a thin brown '
             'leather strap over his far shoulder running diagonally down across his chest and round belly, and a small brown leather '
             'flap bag with a little brass button resting on his near hip at the front, below his paddling paws. ' + KEEP)
SAT_UNDER = ('Add to the sloth in Picture 1 the brown leather satchel that the swimming sloth in Picture 2 wears, worn the same way: a '
             'thin brown leather strap over his shoulder running diagonally across his chest under his outstretched arms, and the small '
             'brown leather flap bag resting on top of his back at the hip. He is still swimming underwater with puffed cheeks. ' + KEEP)
SAT_NEG = ('extra limbs, extra arms, extra paws, extra sloth, changed face, different eyes, open mouth, missing wrist wraps, water, bubbles, '
           'background scenery, photo, 3d render, text, watermark, blurry, two bags, backpack')
POLES = ('Remove the two tall wooden poles from Picture 1 completely, so only the flat magenta background is where they stood. The '
         'sloth, seen from behind, no longer holds anything: his arms hang relaxed at his sides and each empty paw is a soft brown paw '
         'with three pale curved claws and a pale bandage wrap round the wrist. Keep the sloth seen from behind, his fur, his body, his '
         'legs and feet, the brown leather satchel strap from his left shoulder down to the bag on the right, the colours, the outline, '
         'the painted cartoon style and the flat magenta background exactly the same.')
POLES_NEG = 'wooden poles, sticks, posts, rails, holding a stick, extra limbs, extra arms, face, photo, 3d render, text, watermark, blurry'


def edit1(commit):
    ref_stand = f'gh:{commit}:tools/art/hfpokey/starts/ref-stand-satchel.png'
    ref_surf = f'gh:{commit}:tools/art/hfpokey/starts/ref-surf-satchel.png'
    ed = []
    # 1. the clip starts (re-run the loops from them)
    ed.append({'name': 'tread-start', 'src': f'b:w6swim/clips/{TREAD_CLIP}-start.png', 'refs': [ref_stand], 'prompt': SAT_TREAD,
               'neg': SAT_NEG, 'seeds': [1, 2, 3], 'w': 1024, 'h': 1024})
    ed.append({'name': 'tread-start-lora', 'src': f'b:w6swim/clips/{TREAD_CLIP}-start.png', 'refs': [ref_stand], 'prompt': SAT_TREAD,
               'neg': SAT_NEG, 'seeds': [1, 2], 'w': 1024, 'h': 1024, 'lora': 0.7})
    ed.append({'name': 'under-start', 'src': 'b:w6swim/stills/under-44.png', 'refs': [ref_surf], 'prompt': SAT_UNDER, 'neg': SAT_NEG,
               'seeds': [1, 2, 3], 'w': 1248, 'h': 720})
    ed.append({'name': 'under-start-lora', 'src': 'b:w6swim/stills/under-44.png', 'refs': [ref_surf], 'prompt': SAT_UNDER,
               'neg': SAT_NEG, 'seeds': [1, 2], 'w': 1248, 'h': 720, 'lora': 0.7})
    # 2. every loop frame edited as it is (one seed), the other route
    for f in TREAD_FR:
        ed.append({'name': f'tread-f{f:03d}', 'src': f'z:w6swim/clips/{TREAD_CLIP}.zip#{TREAD_CLIP}_{f:03d}.png', 'refs': [ref_stand],
                   'prompt': SAT_TREAD, 'neg': SAT_NEG, 'seeds': [1], 'w': 1024, 'h': 1024, 'steps': 30})
    for f in UNDER_FR:
        ed.append({'name': f'under-f{f:03d}', 'src': f'z:w6swim/clips/{UNDER_CLIP}.zip#{UNDER_CLIP}_{f:03d}.png', 'refs': [ref_surf],
                   'prompt': SAT_UNDER, 'neg': SAT_NEG, 'seeds': [1], 'w': 1248, 'h': 720, 'steps': 30})
    # 3. 7-4: the grip frames of sheet 5, on the 2x sheet (cells 512 x 559)
    for n, c in (('grip', 0), ('grip2', 1), ('leanR', 3)):
        ed.append({'name': f'slide-{n}', 'src': 'b:hfpokey/up/sheet5-pokey-behind.png', 'crop': [512 * c, 0, 512 * (c + 1), 559],
                   'prompt': POLES, 'neg': POLES_NEG, 'seeds': [1, 2, 3], 'w': 1024, 'h': 1120})
    up = [{'name': n, 'src': f'gh:{SLIDE}:{SLIDE_DIR}{n}.jpg'} for n in ('sheet5-pokey-behind', 'sheet6-pokey-falling', 'sheet1-flume')]
    names = [f"edits/{e['name']}-s{s}.png" for e in ed for s in e['seeds']]
    carry = [['edit1-swimstarts', [n for n in names if 'start' in n]],
             ['edit1-tread', [n for n in names if 'tread-f' in n]],
             ['edit1-under', [n for n in names if 'under-f' in n]],
             ['edit1-slide', [n for n in names if 'slide-' in n]]]
    spec = {'tag': 'pokey-edit1', 'upscale': up, 'edits': ed, 'carry': carry}
    (H / 'spec-edit1.json').write_text(json.dumps(spec, indent=1))
    print(len(ed), 'edit items', sum(len(e['seeds']) for e in ed), 'images')


def args(spec):
    name = Path(spec).name
    tag = json.loads(Path(spec).read_text())['tag']
    cmd = ('python -c "from diffusers import QwenImageEditPlusPipeline" 2>/dev/null || pip install -q -U diffusers; '
           'pip install -q spandrel; python -c "import diffusers; print(diffusers.__version__)"; '
           f'sha256sum /out/hfpokey/jobs/pokeygpu.py && SPEC=hfpokey/jobs/{name} python /out/hfpokey/jobs/pokeygpu.py')
    print(json.dumps({'image': 'ostris/aitoolkit:latest', 'flavor': 'rtx-pro-6000', 'timeout': '2h', 'detach': True,
                      'command': ['bash', '-lc', cmd], 'secrets': {'HF_TOKEN': '$HF_TOKEN'},
                      'volumes': ['hf://buckets/mshaffe111/w5-xfer:/out:rw'], 'name': tag}, indent=1))


if __name__ == '__main__':
    if sys.argv[1] == 'edit1':
        edit1(sys.argv[2])
    else:
        args(sys.argv[2])
