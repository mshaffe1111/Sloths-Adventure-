"""Three video jobs at once: Pokey gameplay clips (two GPUs) and cutscene tests (one GPU)."""
import base64, json, sys
from pathlib import Path
from huggingface_hub import HfApi, run_job

S = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[2]))
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
api = HfApi(token=tok)
REPO = 'mshaffe111/pokey-qwen-lora'
STYLE = 'Static camera, flat plain grey background, smooth gentle motion, painted storybook cartoon.'
SCENE = 'Static locked-off camera, the scene stays the same painting, painted storybook illustration, smooth gentle motion.'

GAME_A = [
    dict(name='look-around', src='inputs/pokey-standing.png', prompt=f'The cartoon sloth stands in place, slowly turns his head to look left, then right, blinks curiously, scratches his chin, then smiles back at the viewer. He stays in the same spot. {STYLE}'),
    dict(name='belly-scratch', src='tests/03-belly-scratch.png', prompt=f'The cartoon sloth stands in place and lazily scratches his round belly with one paw, eyes half closed, a content sleepy smile, swaying slightly. He stays in the same spot. {STYLE}'),
    dict(name='doze', src='tests/02-dozing.png', prompt=f'The cartoon sloth sits and dozes, his head slowly nodding forward, then jerks awake with a little start, blinks, and slowly nods off again. He stays in the same spot. {STYLE}'),
    dict(name='cheer', src='inputs/pokey-standing.png', prompt=f'The cartoon sloth throws both arms up and cheers with joy, a big open-mouthed smile, hops once happily, then pumps his fist. He stays in the same spot. {STYLE}'),
]
GAME_B = [
    dict(name='hurt', src='inputs/pokey-standing.png', prompt=f'The cartoon sloth gets bonked and flinches backward, eyes squeezed shut, wobbles dizzily, then shakes his head and recovers. He stays in the same spot. {STYLE}'),
    dict(name='wave', src='tests/10-wave.png', prompt=f'The cartoon sloth waves hello with one paw, slowly and warmly, with a big happy smile, tilting his head. He stays in the same spot. {STYLE}'),
    dict(name='run-in-place', src='inputs/pokey-standing.png', prompt=f'The cartoon sloth turns to face right and jogs in place with an easy running cycle, arms swinging, his body staying in the middle of the frame. {STYLE}'),
    dict(name='climb-loop', src='tests/07-climb-trunk.png', prompt=f'The cartoon sloth climbs slowly up the thick tree trunk, reaching up with one arm then the other, hugging the trunk, in a steady climbing rhythm. {STYLE}'),
]
W, H = 832, 480
CUTS = [
    dict(name='cut-council', src='inputs/cut-council.png', w=W, h=H, prompt=f'Night in the forest clearing: the campfire flickers and crackles, sparks rise, glowing fireflies drift slowly, the hammock sways gently in a breeze, leaves rustle. {SCENE}'),
    dict(name='cut-nest-storm', src='inputs/cut-nest-storm.png', w=W, h=H, prompt=f'A stormy night in the jungle: heavy rain falls, lightning flashes in the distant clouds, palm leaves and branches sway in the wind, the two dark monkey silhouettes creep slowly along the branch toward the nest. {SCENE}'),
    dict(name='cut-village', src='inputs/cut-village.png', w=W, h=H, prompt=f'A misty treetop village in the morning: soft mist drifts slowly between the trees, the rope bridges sway gently, colourful laundry flutters on the line, sunbeams shimmer. {SCENE}'),
    dict(name='cut-cookhouse', src='inputs/cut-cookhouse.png', w=W, h=H, prompt=f'A cosy cookhouse: steam curls up from the bubbling pots, the lanterns flicker warmly, the hanging pans sway slightly, a little smoke drifts from the stove. {SCENE}'),
    dict(name='cut-hug-hill', src='inputs/cut-hug-hill.png', w=W, h=H, prompt=f'At sunset under the great tree, the two cartoon sloths hug tightly and sway happily side to side, smiling with eyes closed, the sparkles twinkle, leaves drift down, clouds move slowly. {SCENE}'),
    dict(name='cut-note-cell', src='inputs/cut-note-cell.png', w=W, h=H, prompt=f'In the stone tower cell at night, the cartoon sloth reads the letter in her paws, then slowly lowers it and looks up hopefully toward the window, the candle flame flickers, moonlight glows. {SCENE}'),
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
    for f in sorted((S / 'cut').glob('cut-*.png')):
        api.upload_file(path_or_fileobj=str(f), path_in_repo=f'inputs/{f.name}', repo_id=REPO)
    ids = {'game-a': go('game-a', GAME_A), 'game-b': go('game-b', GAME_B), 'cuts': go('cuts', CUTS)}
    (S / 'train/infer/vidjobs.json').write_text(json.dumps(ids))
