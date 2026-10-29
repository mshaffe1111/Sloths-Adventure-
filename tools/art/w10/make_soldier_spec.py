"""World 10 soldier idle and walk (2026-10-29): Wan 2.2 clips (motion model at 0.5, as the nc-soldier clips) from the SAME start
pictures the General's soldiers' attack/hurt/down clips came from (bucket stills/w5-soldier<v>-idle3-s3-start.png, see
tools/art/gen/spec-creatures-new.json), so the new moves share their canvas, framing, scale and model. "pin" holds the last frame to the
first (Wan's last_image) so each loops. Run by tools/art/hfbatch/hfbgpu.py (-> anim/jobs/animgpu.py) with SUB=hfbatch/w10.
    python3 -I tools/art/w10/make_soldier_spec.py   -> tools/art/w10/spec-w10-soldier.json
"""
import json
from pathlib import Path

M = 'slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion, '
WHO = {'a': 'the plump dark chocolate brown sloth soldier in an olive uniform and a soft field cap, holding a small lantern in his hand, ',
       'b': 'the plump cinnamon brown sloth soldier in an olive uniform and a soft field cap with a rolled grey blanket on his back, '
            'holding a small lantern in his hand, '}
END = 'side view facing right the whole time, he stays in the middle of the frame'
MOVES = {'idle': 'stands at ease on the spot, breathing slowly, his lantern swaying gently from side to side in his hand, he blinks once, ',
         'walk': 'walks in place on the spot with a slow, steady, plodding walking cycle, left foot then right foot, his lantern swinging '
                 'gently with each step, a smooth looping walk, '}
clips = []
for v in 'ab':
    for mv, txt in MOVES.items():
        for s in ((5, 17) if v == 'a' else (5,)):
            clips.append({'name': f'w10-soldier{v}-{mv}-s{s}', 'src': f'../../stills/w5-soldier{v}-idle3-s3-start.png',
                          'prompt': M + WHO[v] + txt + END, 'seed': s, 'w': 832, 'h': 480, 'pin': True})
spec = {'tag': 'w10-soldier', 'motion': {'high': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_high_noise.safetensors'],
                                         'low': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_low_noise.safetensors'],
                                         'scale': 0.5}, 'clips': clips}
p = Path(__file__).resolve().parent / 'spec-w10-soldier.json'
p.write_text(json.dumps(spec, indent=1))
print(p, len(clips))
