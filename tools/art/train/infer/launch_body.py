"""Body-mechanics batch: climb, swing, walk and jump clips of Pokey (two GPUs, four clips each)."""
import base64, json
from pathlib import Path
from huggingface_hub import HfApi, run_job

S = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[2]))
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
api = HfApi(token=tok)
REPO = 'mshaffe111/pokey-qwen-lora'
STYLE = 'Seen from the side. Static locked-off camera, flat plain grey background, smooth natural motion, painted storybook cartoon.'
NEG = ('camera movement, zoom, pan, tracking shot, background change, scenery, tree, extra limbs, extra characters, human hands, fingers, '
       'blurry, deformed, text, watermark, flicker, morphing, turning to face the camera, front view')

CLIMB = ('The cartoon sloth climbs straight up an invisible vertical rope in place, hand over hand: his left paw reaches high above his head '
         'and grips while his right knee lifts, then his right paw reaches high and grips while his left knee lifts, the arms always '
         'taking turns, his body pulling up a little each time, a steady climbing rhythm. He stays in the middle of the frame. ' + STYLE)
SWING = ('The cartoon sloth hangs by both paws from an invisible rope above his head and swings like a pendulum: his arms stay straight '
         'up and his paws never let go, his body swings forward with his legs kicking out in front, then swings back with his knees '
         'bending behind him, back and forth smoothly. ' + STYLE)
WALK = ('The cartoon sloth walks forward in place with a relaxed, natural walking cycle: each arm swings forward as the opposite leg '
        'steps forward, his paws swinging loosely past his hips, his body bobbing gently, heel then toe. He stays in the middle of the frame. ' + STYLE)
JUMP = ('The cartoon sloth crouches down bending his knees with both arms swung back behind him, then springs straight up, both arms '
        'swinging forward and up over his head, tucks his knees at the top of the jump, then comes down and lands softly bending his '
        'knees to absorb the landing, and stands up again. He stays in the middle of the frame. ' + STYLE)

A = [
    dict(name='b-climb-1', src='inputs/anim/start-climb_0.png', prompt=CLIMB, seed=7, negfull=NEG + ', both arms up at once, floating, flying'),
    dict(name='b-climb-2', src='inputs/anim/start-climb_0.png', prompt=CLIMB, seed=21, negfull=NEG + ', both arms up at once, floating, flying'),
    dict(name='b-swing-1', src='inputs/anim/start-swing_grip.png', prompt=SWING, seed=7, negfull=NEG + ', letting go, falling, flying'),
    dict(name='b-swing-2', src='inputs/anim/start-swing_grip.png', prompt=SWING, seed=21, negfull=NEG + ', letting go, falling, flying'),
]
B = [
    dict(name='b-walk-1', src='inputs/anim/start-walk_0.png', prompt=WALK, seed=7, negfull=NEG + ', arms held out in front, stiff arms, zombie walk, shuffling, running'),
    dict(name='b-walk-2', src='inputs/anim/start-walk_0.png', prompt=WALK, seed=21, negfull=NEG + ', arms held out in front, stiff arms, zombie walk, shuffling, running'),
    dict(name='b-jump-1', src='inputs/anim/start-idle.png', prompt=JUMP, seed=7, negfull=NEG + ', leaving the frame, flying away'),
    dict(name='b-jump-2', src='inputs/anim/start-idle.png', prompt=JUMP, seed=21, negfull=NEG + ', leaving the frame, flying away'),
]
CMD = ("python -m pip install --break-system-packages ftfy >/dev/null 2>&1 || true; "
       "echo $VID_B64 | base64 -d > /vid.py && python /vid.py")


def go(tag, clips, flavor='rtx-pro-6000'):
    env = {'VID_B64': base64.b64encode((S / 'train/infer/vid2.py').read_bytes()).decode(),
           'CLIPS_B64': base64.b64encode(json.dumps(clips).encode()).decode()}
    job = run_job(image='ostris/aitoolkit:latest', command=['bash', '-lc', CMD], env=env, secrets={'HF_TOKEN': tok},
                  flavor=flavor, timeout='2h', token=tok)
    print(tag, job.id, job.status.stage, flush=True)
    return job.id


if __name__ == '__main__':
    for n in ['climb_0', 'swing_grip', 'walk_0']:
        api.upload_file(path_or_fileobj=str(S / f'anim/start-{n}.png'), path_in_repo=f'inputs/anim/start-{n}.png', repo_id=REPO)
    ids = {'body-a': go('body-a', A), 'body-b': go('body-b', B)}
    (S / 'anim/bodyjobs.json').write_text(json.dumps(ids))
