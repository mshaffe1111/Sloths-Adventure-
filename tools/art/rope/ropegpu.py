"""Pokey's rope traverse in-betweens (2026-10-29): Wan 2.2 I2V with the motion model from Gemini cell 1 (both paws on the rope,
prep_start.py), the clip's LAST frame pinned to its first (Wan's last_image, as w6to10/pairgpu.py), so it is a loop that starts and
ends on the Gemini pose. Runs tools/art/anim/animgpu.py (already in the bucket at anim/jobs/) with this spec; outputs like it, under
rope/clips/ in mshaffe111/w5-xfer: <name>.zip, sheet-<name>.jpg, <name>.carrier.png.

Bucket: rope/starts/rope-f1.webp (prep_start.py), rope/jobs/ropegpu.py (this file). Job: image ostris/aitoolkit:latest, flavor
rtx-pro-6000, secrets {"HF_TOKEN"}, volumes ["hf://buckets/mshaffe111/w5-xfer:/out:rw"], command python /out/rope/jobs/ropegpu.py.
The token reaches the job only as the job secret HF_TOKEN.
"""
import json, os, runpy
from pathlib import Path

import diffusers

ROOT = Path(os.environ.get('OUT', '/out'))
SUB = 'rope'
_call = diffusers.WanImageToVideoPipeline.__call__


def _pinned(self, *a, **k):
    if 'image' in k and 'last_image' not in k:
        k['last_image'] = k['image']
    return _call(self, *a, **k)


diffusers.WanImageToVideoPipeline.__call__ = _pinned

M = 'slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion, '
POKEY = 'a friendly young brown sloth with a cream face, dark eye patches, a brown satchel on a strap across his chest and wrapped wrists, '
WHAT = ('hangs by his paws from a long horizontal rope and travels along it hand over hand toward the right in place: he lets go with '
        'his back paw, swings that arm forward past the other and grips the rope ahead, then the other paw does the same, alternating '
        'paws, always at least one paw gripping the rope, his body swaying gently under the rope, his legs dangling, a smooth repeating '
        'hand-over-hand cycle, side view facing right the whole time, he stays in the middle of the frame')
NEG = ('camera movement, zoom, pan, tracking shot, background change, scenery, extra limbs, extra characters, human hands, fingers, '
       'blurry, deformed, text, watermark, flicker, morphing, turning to face the camera, changing art style, leaving the frame, '
       'letting go of the rope, falling, standing on the ground, second rope')
MOTION = {'high': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_high_noise.safetensors'],
          'low': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_low_noise.safetensors'], 'scale': 1.0}
# pass 2 (PASS=2): the first pass's seed 11 travelled hand over hand but lost the wrap on his reaching wrist, stretched his body long
# through the reach and grew a stub of a tail; the wraps, his short round body and no tail said outright, seed 11 again and one more
WRAPS = 'both wrists wrapped in cream bandages, a short round body and short arms, no tail, '
NEG2 = NEG + ', tail, long stretched body, bare wrists, back view'
PASS = os.environ.get('PASS', '1')
if PASS == '2':
    clips = [{'name': f'rope-hoh2-s{s}-n{n}', 'src': 'starts/rope-f1.webp', 'prompt': M + POKEY + WRAPS + WHAT, 'neg': NEG2, 'seed': s,
              'w': 832, 'h': 480, 'frames': n} for s, n in ((11, 41), (19, 41))]
else:
    clips = [{'name': f'rope-hoh-s{s}-n{n}', 'src': 'starts/rope-f1.webp', 'prompt': M + POKEY + WHAT, 'neg': NEG, 'seed': s,
              'w': 832, 'h': 480, 'frames': n} for s, n in ((3, 49), (11, 49), (7, 33))]
spec = {'tag': f'rope-hoh-p{PASS}', 'motion': MOTION, 'clips': clips}
p = ROOT / SUB / 'jobs' / f'spec-rope-p{PASS}.json'
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text(json.dumps(spec, indent=1))
os.environ['SPEC'] = f'{SUB}/jobs/{p.name}'
os.environ['SUB'] = SUB
runpy.run_path(str(ROOT / 'anim/jobs/animgpu.py'), run_name='__main__')
