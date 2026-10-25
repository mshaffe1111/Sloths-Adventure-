"""redo the two clips that failed: a gallop (started from a stretched mid-leap frame) and a claw swipe that stays side-on.
Two seeds each, one GPU. usage: python3 launch_redo.py"""
import base64, json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from huggingface_hub import HfApi, run_job
S = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[2]))
sys.path.insert(0, str(S / 'train'))
from clips import key  # noqa: E402
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
REPO = 'mshaffe111/prowler-qwen-lora'

# the gallop starts from the pounce clip's stretched frame, set on the same grey as the other start pictures
rgb = np.asarray(Image.open(S / 'prowl/vids/pounce/pounce_022.png').convert('RGB'))
a = key(rgb)
ys, xs = np.nonzero(a > 128)
grey = tuple(int(v) for v in np.median(np.concatenate([rgb[:4].reshape(-1, 3), rgb[-4:].reshape(-1, 3)]), axis=0))
cut = Image.fromarray(np.dstack([rgb, a]).astype(np.uint8), 'RGBA').crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
s = 819 / cut.width
cut = cut.resize((819, round(cut.height * s)), Image.LANCZOS)
start = Image.new('RGB', (1024, 1024), grey)
start.paste(cut, ((1024 - cut.width) // 2, 560 - cut.height // 2), cut)
start.save(S / 'prowl/dl/collared/gallop-start.png')
HfApi(token=tok).upload_file(path_or_fileobj=str(S / 'prowl/dl/collared/gallop-start.png'), path_in_repo='collared/gallop-start.png', repo_id=REPO)

STYLE = 'Seen exactly from the side, facing right the whole time. Static locked-off camera, flat plain grey background, smooth weighty motion, painted storybook cartoon.'
NEG = ('camera movement, zoom, pan, tracking shot, background change, scenery, extra animals, extra legs, human, hands, blurry, deformed, '
       'text, watermark, flicker, morphing, the collar disappearing, turning to face the camera, looking at the camera, front view, '
       'leaving the frame, walking out of frame, standing still, red glowing lines on the body')
C = 'The huge blue-black panther with glowing green eyes and an iron collar around his neck'
P = {
    'gallop': f'{C} runs flat out on a treadmill, galloping fast in place: his body stretches long and bunches up again and again, front legs reaching far forward, back legs driving, tail streaming out behind. He stays in the middle of the frame and never leaves it. {STYLE}',
    'swat': f'{C} stands side-on and swats forward hard with one front paw, claws out, then pulls it back and swats again with the other paw, snarling, his head staying in profile pointing right. He stays in the same spot. {STYLE}',
}
SRC = {'gallop': 'collared/gallop-start.png', 'swat': 'collared/idle-d1.png'}
clips = [dict(name=f'{n}{seed}', src=SRC[n], prompt=P[n], negfull=NEG, seed=seed, w=832, h=480) for n in P for seed in (3, 11)]
CMD = ("python -m pip install --break-system-packages ftfy >/dev/null 2>&1 || true; echo $VID_B64 | base64 -d > /vid.py && python /vid.py")
env = {'VID_B64': base64.b64encode((S / 'prowl/job/vidprowl.py').read_bytes()).decode(), 'CLIPS_B64': base64.b64encode(json.dumps(clips).encode()).decode()}
job = run_job(image='ostris/aitoolkit:latest', command=['bash', '-lc', CMD], env=env, secrets={'HF_TOKEN': tok}, flavor='rtx-pro-6000', timeout='2h', token=tok)
(S / 'prowl/job/redo.txt').write_text(job.id)
print(job.id, job.status.stage, [c['name'] for c in clips])
