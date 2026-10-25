"""Moving versions of the story plates that are still painted stills (cinemagraph clips for livePlates.ts), two seeds each, three GPUs.
The plate is resized to 860 x 480 and cropped 14 px each side, the same as the live plates already in the game (liveplates.py PW/PH).
  python3 -I launch_plates.py
"""
import base64, json
from pathlib import Path
from PIL import Image
from huggingface_hub import HfApi, run_job

S = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[2]))
G = Path((str(__import__('pathlib').Path(__file__).resolve().parents[4]) + '/src/assets/story/plates'))
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
api = HfApi(token=tok)
REPO = 'mshaffe111/pokey-qwen-lora'
SCENE = 'Static locked-off camera, the scene stays the same painting, nothing new appears, painted storybook illustration, smooth gentle motion.'
NEG = ('camera movement, zoom, pan, tracking shot, scene change, new objects appearing, people, animals, characters, faces, text, watermark, '
       'blurry, flicker, morphing, the walls moving')
P = {
    'cell': 'Night in the stone tower cell: the candle flame on the windowsill flickers, moonlight shimmers through the window, the trees outside sway gently, faint dust drifts in the light.',
    'courtyard': 'A grey rainy evening in the fortress courtyard: light rain falls, the puddles ripple, the lit window flickers warmly, the clouds drift slowly, the thorny vines stir in the wind.',
    'door': 'A stone corridor at night: the two wall lanterns flicker warmly and their light dances on the stones, faint dust drifts in the air.',
    'gates': 'A stormy night at the fortress gates: rain falls, lightning flickers among the purple clouds, the green lights along the walls glow and pulse, firelight flickers in the open gateway.',
    'grandma-door-empty': 'A quiet jungle morning by the tree house: the leaves sway gently in the breeze, the ferns rustle, soft light shifts, a few leaves drift down.',
    'grandma-door': 'Evening by the tree house: the lantern flickers warmly, the round window glows, fireflies drift slowly, the leaves sway gently.',
    'hill': 'Sunset on the hill under the great tree: the hanging moss and leaves sway in a gentle breeze, the clouds drift slowly, golden light shimmers over the valley.',
    'nest-morning': 'A misty jungle morning: mist drifts slowly between the trees, the palm leaves sway gently, sunbeams shimmer, the nest stays still on its branch.',
    'ruins': 'Green light in the old temple courtyard: sunbeams shift through the canopy, leaves drift down, vines sway gently, the faint rune circle on the floor glows softly.',
    'tea': 'The spider-silk tea garden: the silk webs shimmer and sway gently, sparkles twinkle, purple mist drifts, the candles on the table flicker.',
    'warroom': 'The war room at night: the hanging lantern sways slightly and flickers, the banners stir, lightning flashes in the window.',
}
CMD = ("python -m pip install --break-system-packages ftfy >/dev/null 2>&1 || true; "
       "echo $VID_B64 | base64 -d > /vid.py && python /vid.py")

clips = []
for name, prompt in P.items():
    im = Image.open(G / f'{name}.webp').convert('RGB').resize((860, 480), Image.LANCZOS).crop((14, 0, 846, 480))
    p = S / f'cut/plate-{name}.png'
    im.save(p)
    api.upload_file(path_or_fileobj=str(p), path_in_repo=f'inputs/plate-{name}.png', repo_id=REPO)
    for seed in (7, 21):
        clips.append(dict(name=f'plate-{name}-s{seed}', src=f'inputs/plate-{name}.png', w=832, h=480, seed=seed, prompt=f'{prompt} {SCENE}', negfull=NEG))
ids = []
for k in range(3):
    part = clips[k::3]
    env = {'VID_B64': base64.b64encode((S / 'train/infer/vid2.py').read_bytes()).decode(),
           'CLIPS_B64': base64.b64encode(json.dumps(part).encode()).decode()}
    job = run_job(image='ostris/aitoolkit:latest', command=['bash', '-lc', CMD], env=env, secrets={'HF_TOKEN': tok},
                  flavor='rtx-pro-6000', timeout='2h', token=tok)
    ids.append(job.id)
    print(job.id, [c['name'] for c in part], flush=True)
(S / 'train/infer/platejobs.txt').write_text(' '.join(ids))
