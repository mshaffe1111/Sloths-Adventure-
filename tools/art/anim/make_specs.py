"""Write the clip specs for the new Gemini characters (2026-10-27): spec-w5anim.json (Flicker, Meeca, the beetle, the Butler) and
spec-w6anim.json (the otter runners, the caiman root). Start pictures come from prep_starts.py (STARTS there, same names).

    python3 -I tools/art/anim/make_specs.py

Put animgpu.py in hf://buckets/mshaffe111/w5-xfer/<sub>/jobs/, the starts in <sub>/starts/, the spec in <sub>/jobs/, then run
(hf_jobs run, image ostris/aitoolkit:latest, flavor rtx-pro-6000, secrets {"HF_TOKEN": "$HF_TOKEN"}, volumes
["hf://buckets/mshaffe111/w5-xfer:/out:rw"]):  SUB=<sub> SPEC=<sub>/jobs/spec-<sub>.json PART=k PARTS=n python /out/<sub>/jobs/animgpu.py
"""
import json
from pathlib import Path

from prep_starts import STARTS

H = Path(__file__).resolve().parent
M = 'slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion, '
MOTION = {'high': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_high_noise.safetensors'],
          'low': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_low_noise.safetensors'], 'scale': 1.0}
NEG = ('camera movement, zoom, pan, tracking shot, background change, scenery, extra limbs, extra characters, human hands, fingers, '
       'blurry, deformed, text, watermark, flicker, morphing, turning to face the camera, changing art style, leaving the frame')
WATER_NEG = NEG + ', water, waves, ripples, splashes'
WHO = {
    'flicker': 'a tiny round brown firefly with big shiny eyes, an orange and brown striped body, pink see-through wings and a glowing tail ',
    'meeca': 'a young girl sloth in a pink headband, a pink race vest with the number 07 and green shorts ',
    'beetle': 'a big round teal-blue beetle with a shiny domed shell, short dark legs, a sleepy face and a little gold bow tie ',
    'butler': 'a fluffy lilac spider butler with big black eyes, a striped purple waistcoat, a black bow tie, a white lace apron and long thin black legs ',
    'otter': 'a sleek dark brown river otter ',
    'caiman': 'a caiman disguised as a mossy tree root, ',
}
END = ', side view facing right the whole time, it stays in the middle of the frame'
# move: what it does (the start picture and clip size are in prep_starts.STARTS)
MOVES = {
    'flicker-hover': 'hovers in place, its pink see-through wings flapping up and down in clear strokes, always clearly visible, its round body bobbing gently up and down, a smooth repeating cycle',
    'flicker-fly': 'flies forward in place, leaning forward, its pink see-through wings flapping hard in big clear strokes, always clearly visible, its body bobbing, a smooth repeating flying cycle',
    'flicker-perch': 'flutters down a little and settles as if onto a perch, folds its wings down along its back, closes its eyes contentedly, then sits still',
    'meeca-carry': 'walks forward in place hugging a big pinecone to her chest with both arms, a steady happy walking cycle',
    'meeca-throw': 'winds up and throws the pinecone forward overarm with a big swing, follows through and watches it fly away',
    'beetle-waddle': 'waddles forward in place on its six short legs, its round shell rocking from side to side, a smooth repeating walking cycle',
    'beetle-eat': 'chews happily with its cheeks stuffed full, munching, then swallows and licks its lips',
    'beetle-sleepy': 'yawns a huge yawn, its eyelids droop, it sinks down low on its legs and falls asleep, breathing slowly',
    'beetle-sleep': 'sleeps peacefully with its eyes shut, its shell rising and falling with slow deep breaths, a smooth repeating cycle',
    'butler-walk': 'walks forward in place in a huffy dignified strut, nose in the air and eyes closed, holding a silver tray up high on one hand, a smooth repeating walking cycle',
    'butler-horror': 'stares in horror at the tea splashed all over his tray, recoils with wide eyes and an open mouth, his legs trembling, then droops in despair',
    'otter-scamper': 'with a woven basket of fish on its back scampers forward in place on all fours in a quick bounding run, its long tail swaying, a smooth repeating running cycle',
    'otter-swim': 'swims forward in place at the surface, its long body undulating and its tail sweeping, its paws paddling, a smooth repeating swimming cycle',
    'otter-jab': 'with a woven basket of fish on its back stands up and jabs its spear forward hard, then pulls it back to the ready',
    'caiman-snap': 'lies perfectly still with its eyes shut, then suddenly opens a yellow eye, lifts its long jaws and snaps them shut hard, then settles back down flat and closes its eye, looking like a mossy root again',
}
SEEDS = (3, 11)


def spec(sub, prefix):
    cl = []
    for mv, what in MOVES.items():
        if not mv.startswith(prefix):
            continue
        who = WHO[mv.split('-')[0]]
        w, h = STARTS[mv][2]
        for s in SEEDS:
            c = {'name': f'{sub}-{mv}-s{s}', 'src': f'starts/{mv}.webp', 'prompt': M + who + what + END, 'seed': s, 'w': w, 'h': h}
            if mv in ('otter-swim',):
                c['neg'] = WATER_NEG
            cl.append(c)
    (H / f'spec-{sub}.json').write_text(json.dumps({'tag': sub, 'motion': MOTION, 'clips': cl}, indent=1))
    print(sub, len(cl), 'clips')


if __name__ == '__main__':
    spec('anim', ('flicker', 'meeca', 'beetle', 'butler', 'otter', 'caiman'))  # one spec, split over PARTS jobs
