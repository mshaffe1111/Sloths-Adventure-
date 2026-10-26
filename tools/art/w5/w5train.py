"""Train World 5 creature models in one ai-toolkit job, one after another (2026-10-26), from the concept takes on the HF repo
mshaffe111/slothadv-w5art (raw/<sheet>.png: three poses on flat light grey, front view, side view and the warning pose).

Each take is cut into its poses with w5lib.pieces_in_row; the poses go on a 1024 square of the sheet's own grey, captioned
"<trigger>, <variant>, <desc>, <pose>, painted storybook illustration, plain grey background" (every take of a creature is kept: Matt
liked them all, and each take family is its own variant word). Then the same recipe as the *-qwen-lora models. At the end of each run
the model samples every pose of the game's basic sheet (idle, move, tell, attack, hurt, defeated) twice: those are the pose stills.

Results go to the bucket mounted at /out (train/<name>/: the LoRA, its config, the samples and the cut training set) and, when the job's
token may, to the model repo mshaffe111/<name>-qwen-lora.
env SPEC = jobs/<spec>.json in the bucket (spec-w5creatures-train.json), NAMES = the creatures this job trains (comma separated).
"""
import json, os, shutil, subprocess, sys, time
from pathlib import Path

OUT = Path(os.environ.get('OUT', '/out'))
SPEC = json.loads((OUT / os.environ['SPEC']).read_text())
NAMES = [n for n in os.environ.get('NAMES', '').split(',') if n]
tok = os.environ['HF_TOKEN']
from huggingface_hub import HfApi, hf_hub_download  # noqa: E402
api = HfApi(token=tok)
sys.path.insert(0, str(OUT / 'jobs'))
from w5lib import pieces_in_row, config  # noqa: E402
from PIL import Image  # noqa: E402
t0 = time.time()


def build(c):
    d = Path('/data') / c['name']
    d.mkdir(parents=True, exist_ok=True)
    keep = OUT / 'train' / c['name'] / 'set'
    keep.mkdir(parents=True, exist_ok=True)
    k = 0
    for sheet, variant in c['takes']:
        p = hf_hub_download('mshaffe111/slothadv-w5art', f'raw/{sheet}.png', token=tok)
        im, ps = pieces_in_row(p, len(c['sheet_poses']))
        grey = im.getpixel((4, 4))
        poses = c['sheet_poses']
        if len(ps) != len(poses):
            print('NOTE', sheet, len(ps), 'pieces, expected', len(poses), flush=True)
        for i, (piece, box) in enumerate(ps[:len(poses)]):
            k += 1
            s = min(1.0, 819 / max(piece.size))
            piece = piece.resize((round(piece.width * s), round(piece.height * s)), Image.LANCZOS)
            sq = Image.new('RGBA', (1024, 1024), tuple(grey) + (255,))
            sq.alpha_composite(piece, ((1024 - piece.width) // 2, (1024 - piece.height) // 2))
            fn = f"{c['name']}{k:03d}"
            sq.convert('RGB').save(d / f'{fn}.png')
            cap = f"{c['trigger']}, {variant}, {c['desc']}, {poses[i]}, painted storybook illustration, plain grey background"
            (d / f'{fn}.txt').write_text(cap)
            shutil.copy(d / f'{fn}.png', keep / f'{fn}.png')
            (keep / f'{fn}.txt').write_text(cap)
    print('SET', c['name'], k, 'pictures', round(time.time() - t0), flush=True)
    return k


def train(c):
    n = build(c)
    if n == 0:
        print('FAILED', c['name'], 'no pictures', flush=True)
        return
    cfg = config(c).replace('sample_start_step: 0', 'sample_start_step: 0\n        skip_first_sample: true')
    cfg = cfg.replace('training_folder: "/out"', 'training_folder: "/out_train"')  # /out is the bucket
    cfg = cfg.replace('sample_every: 500', f"sample_every: {c.get('steps', 1500)}")
    Path('/cfg.yaml').write_text(cfg)
    dst = OUT / 'train' / c['name']
    (dst / f"{c['lora_name']}.yaml").write_text(cfg)
    r = subprocess.run([sys.executable, 'run.py', '/cfg.yaml'], cwd='/app/ai-toolkit')
    src = Path('/out_train') / c['lora_name']
    print('TRAINED' if r.returncode == 0 else 'TRAIN_FAILED', c['name'], round(time.time() - t0), flush=True)
    if src.exists():
        for f in src.glob('*.safetensors'):
            shutil.copy(f, dst / f.name)
        if (src / 'samples').exists():
            shutil.copytree(src / 'samples', dst / 'samples', dirs_exist_ok=True)
        try:
            api.create_repo(c['model_repo'], repo_type='model', private=True, exist_ok=True)
            api.upload_folder(folder_path=str(src), repo_id=c['model_repo'], repo_type='model',
                              allow_patterns=['*.safetensors', 'samples/*', '*.yaml'], commit_message='w5 creature model v1')
            print('UPLOADED', c['model_repo'], flush=True)
        except Exception as e:
            print('UPLOAD to model repo failed (kept in the bucket)', repr(e)[:200], flush=True)


for c in SPEC['creatures']:
    if not NAMES or c['name'] in NAMES:
        train(c)
print('ALL_DONE', round(time.time() - t0), flush=True)
