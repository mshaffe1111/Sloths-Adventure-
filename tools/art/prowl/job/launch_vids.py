"""the Shadow Prowler's moves as Wan 2.2 clips, three GPUs at once. usage: python3 launch_vids.py idle=collared/idle-c1.png walk=... """
import base64, json, sys
from pathlib import Path
from huggingface_hub import run_job
S = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[2]))
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
src = dict(a.split('=') for a in sys.argv[1:])
STYLE = 'Seen from the side. Static locked-off camera, flat plain grey background, smooth weighty motion, painted storybook cartoon.'
NEG = ('camera movement, zoom, pan, tracking shot, background change, scenery, extra animals, extra legs, human, hands, blurry, deformed, '
       'text, watermark, flicker, morphing, the collar disappearing, turning to face the camera, red glowing lines on the body')
CAT = 'the huge blue-black panther with glowing green eyes and an iron collar around his neck'
C = CAT[0].upper() + CAT[1:]
CLIPS = {
    'idle': f'{C} stands low and watchful, breathing slowly so his flanks rise and fall, the tip of his long tail twitching and curling, his ears turning, he blinks his glowing eyes. He stays in the same spot. {STYLE}',
    'walk': f'{C} prowls forward in place with a slow, low, stalking cat walk: his legs step in turn, shoulders rolling, head low and steady, tail swaying behind him. He stays in the middle of the frame. {STYLE}',
    'run': f'{C} gallops in place at full speed, a fast bounding big-cat run, his body stretching out and bunching up, legs reaching far forward and back, tail streaming behind. He stays in the middle of the frame. {STYLE}',
    'pounce': f'{C} crouches low with his hindquarters wiggling, then springs up into a long leap with his front paws stretched forward and claws out, and lands heavily on all four paws. He stays near the middle of the frame. {STYLE}',
    'claw': f'{C} swipes forward hard with one front paw, claws out, then the other paw, then snaps his jaws in a quick bite, his shoulders driving forward each time. He stays in the same spot. {STYLE}',
    'roar': f'{C} rears his head back and roars with his jaws wide open, his whole body tensed, his collar tight on his neck, then lowers his head with a snarl. He stays in the same spot. {STYLE}',
    'hurt': f'{C} flinches back from a hard hit, eyes squeezed shut and ears flat, jaws open in a pained snarl, then shakes his head and glares. He stays in the same spot. {STYLE}',
    'stagger': f'{C} is dizzy: he wobbles and sways unsteadily on his legs, his head drooping and circling, his eyes dazed and half closed. He stays in the same spot. {STYLE}',
    'defeated': f'{C} is beaten: his legs give way and he slowly sinks down and lies on his side, tired, his glowing eyes dimming and closing, his tail curling around him. {STYLE}',
}
SIZE = {'roar': (768, 576), 'pounce': (832, 576)}
def clip(name, seed=7):
    w, h = SIZE.get(name, (832, 480))
    return dict(name=name, src=src[name], prompt=CLIPS[name], negfull=NEG, seed=seed, w=w, h=h)
GROUPS = [['idle', 'walk', 'run'], ['pounce', 'claw', 'roar'], ['hurt', 'stagger', 'defeated']]
CMD = ("python -m pip install --break-system-packages ftfy >/dev/null 2>&1 || true; echo $VID_B64 | base64 -d > /vid.py && python /vid.py")
ids = []
for i, g in enumerate(GROUPS):
    g = [n for n in g if n in src]
    if not g: continue
    env = {'VID_B64': base64.b64encode((S / 'prowl/job/vidprowl.py').read_bytes()).decode(),
           'CLIPS_B64': base64.b64encode(json.dumps([clip(n) for n in g]).encode()).decode()}
    job = run_job(image='ostris/aitoolkit:latest', command=['bash', '-lc', CMD], env=env, secrets={'HF_TOKEN': tok}, flavor='rtx-pro-6000', timeout='2h', token=tok)
    ids.append(job.id)
    print(i, g, job.id, job.status.stage, flush=True)
(S / 'prowl/job/vidjobs.txt').write_text(' '.join(ids))
