"""The title pair's shared moment, second try (2026-10-28). The first pair-laugh drifted off-model by its end (Pokey's face went rounder,
the line style changed) and finished closer together facing front, so it could not chain back to the idles. This try:
  - the clip's LAST frame is pinned to its first (Wan 2.2 I2V's last_image, patched into tools/art/anim/animgpu.py's pipeline call),
    so it starts and ends on the two idle poses at their idle positions (the same pair start as before: title-idle and Meeca's idle at
    one scale on one ground line, titlegpu.py);
  - shorter: 33 frames (~2 s at 16 fps);
  - a smaller gesture: a nudge, a glance, a smile, back to the front.
env: SUB (w6to10), MOTION_SCALE (1 = the motion model, 0 = none), SEEDS. Outputs like animgpu.py: w6t-title-pair2-m<10x>-s<seed>.
"""
import json, os, runpy
from pathlib import Path

import diffusers

ROOT = Path(os.environ.get('OUT', '/out'))
SUB = os.environ.get('SUB', 'w6to10')
_call = diffusers.WanImageToVideoPipeline.__call__


def _pinned(self, *a, **k):
    if 'image' in k and 'last_image' not in k:
        k['last_image'] = k['image']
    return _call(self, *a, **k)


diffusers.WanImageToVideoPipeline.__call__ = _pinned

M = 'slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion, '
POKEY = 'a friendly young brown sloth with a cream face, dark eye patches, a brown satchel on a strap across his chest and wrapped wrists, '
MEECA = 'a cheerful young girl sloth in a pink headband, a pink race vest with the number 07 and teal shorts, '
WHAT = ('two young sloth friends standing side by side, on the left ' + POKEY + 'turned toward her, on the right ' + MEECA +
        'facing the front; she gives him a playful little nudge with her elbow, he glances at her and they both smile and laugh softly, '
        'then they settle back exactly as they were, both stay on the same spot, the camera does not move')
ms = float(os.environ.get('MOTION_SCALE', '1'))
seeds = [int(s) for s in os.environ.get('SEEDS', '3,11').split(',') if s]
clips = [{'name': f'w6t-title-pair2-m{int(ms * 10)}-s{s}', 'src': 'starts/title-pair.png', 'prompt': M + WHAT, 'seed': s,
          'w': 832, 'h': 576, 'frames': 33} for s in seeds]
spec = {'tag': 'w6to10-pair2', 'clips': clips}
if ms > 0:
    spec['motion'] = {'high': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_high_noise.safetensors'],
                      'low': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_low_noise.safetensors'], 'scale': ms}
p = ROOT / SUB / 'jobs' / f'x-pair2-m{int(ms * 10)}.json'
p.write_text(json.dumps(spec))
os.environ['SPEC'] = f'{SUB}/jobs/{p.name}'
os.environ['SUB'] = SUB
runpy.run_path(str(ROOT / 'anim/jobs/animgpu.py'), run_name='__main__')
