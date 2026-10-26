"""Train the five new World 5 creature models (Matt's picks, 2026-10-26): the Dangler, the Butler, the Seamstress, the Orchid Mantis and
the Dozer moths. One Qwen-Image LoRA each, the same recipe as the *-qwen-lora character models (queen_qwen_v1, meeca_qwen_v1).
NOT RUN YET: the concept sheets need Matt's approval first. The spec is tools/art/gen/spec-w5creatures-train.json.

    python3 -I tools/art/w5/train_w5creatures.py SPEC --cut [names...]     cut each approved sheet into its poses, with a numbered preview
    python3 -I tools/art/w5/train_w5creatures.py SPEC --build [names...]   the training set: <name>NNN.png on flat grey + caption .txt
    python3 -I tools/art/w5/train_w5creatures.py SPEC --launch [names...]  upload the set and config, start one ai-toolkit job per creature
    add --dry to --launch to print the config and the job command only.

Steps:
  1. Fill `concept_sheets` for each creature with the approved sheet files (paths from the repo root, or absolute).
  2. --cut: every separate figure on a sheet (keyed off the sheet's own border colour) is written to tools/art/w5/train/<name>/blobs/
     as <sheet>-<i>.png, with <sheet>-preview.jpg showing the numbers.
  3. Fill `poses` with {sheet file stem: {"<i>": "pose words"}} for the pieces to train on (8 to 25 is right; the queen had 23).
  4. --build: each piece on a 1024 square of flat grey (127) at up to 80%, caption "<trigger>, <desc>, <pose>, painted storybook
     illustration, plain grey background". Pieces under 400 px are listed in small.txt and upscaled 4x on the GPU first (Real-ESRGAN
     anime 6B from mshaffe111/char-sheets), as the game-look model's set was.
  5. --launch needs a token that can write mshaffe111's repos: Matt's own HF_TOKEN in the environment or `hf auth login` (the Claude
     connector's token cannot write them). The token goes to the job only as its HF_TOKEN secret, never in a file or a commit. Each job
     uploads its checkpoints and samples to the model repo every 15 minutes and at the end. About 1.2 h and $3.30 a creature.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

H = Path(__file__).resolve().parent
ROOT = H.parents[2]
GREY = (127, 127, 127)
TAIL = 'painted storybook illustration, plain grey background'


def args():
    spec = json.loads(Path(sys.argv[1]).read_text())
    mode = next((a for a in sys.argv[2:] if a in ('--cut', '--build', '--launch')), None)
    names = [a for a in sys.argv[2:] if not a.startswith('--')]
    cs = [c for c in spec['creatures'] if not names or c['name'] in names]
    return spec, mode, cs


def sheet_path(p):
    q = Path(p)
    return q if q.is_absolute() else ROOT / q


def pieces(path):
    """the separate figures of a concept sheet, in reading order: keyed off the median border colour, soft edge kept"""
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.float32)
    b = np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3), a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)])
    bg = np.median(b, axis=0)
    d = np.sqrt(((a - bg) ** 2).sum(-1))
    fig = d > 34
    # a light closing joins a figure's thin legs to its body without joining neighbours (keep figures 6+ px apart on the sheet)
    lab, n = ndimage.label(ndimage.binary_closing(fig, iterations=1))
    objs = ndimage.find_objects(lab)
    sizes = ndimage.sum(fig, lab, range(1, n + 1))
    keep = [i for i in range(n) if sizes[i] > max(1500, sizes.max() * 0.04)]
    keep.sort(key=lambda i: (objs[i][0].start // max(1, im.height // 12), objs[i][1].start))
    alpha = np.clip((d - 20) / 30, 0, 1)
    out = []
    for i in keep:
        sl = objs[i]
        m = (lab[sl] == i + 1)
        m = ndimage.binary_dilation(m, iterations=2)
        rgba = np.dstack([a[sl], alpha[sl] * m * 255]).astype(np.uint8)
        out.append((Image.fromarray(rgba, 'RGBA'), (sl[1].start, sl[0].start, sl[1].stop, sl[0].stop)))
    return im, out


def cut(c):
    d = H / 'train' / c['name'] / 'blobs'
    d.mkdir(parents=True, exist_ok=True)
    if not c['concept_sheets']:
        print(c['name'], ': no concept_sheets yet (waiting on Matt)')
        return
    for p in c['concept_sheets']:
        p = sheet_path(p)
        im, ps = pieces(p)
        prev = im.copy()
        dr = ImageDraw.Draw(prev)
        for i, (piece, box) in enumerate(ps):
            piece.save(d / f'{p.stem}-{i}.png')
            dr.rectangle(box, outline=(255, 0, 0), width=3)
            dr.rectangle((box[0], box[1], box[0] + 28, box[1] + 18), fill=(0, 0, 0))
            dr.text((box[0] + 4, box[1] + 3), str(i), fill=(255, 255, 0))
        prev.convert('RGB').save(d / f'{p.stem}-preview.jpg', quality=85)
        print(c['name'], p.name, len(ps), 'pieces ->', d)


def build(c):
    d = H / 'train' / c['name']
    items = d / 'items'
    items.mkdir(parents=True, exist_ok=True)
    small, k = [], 0
    for stem, chosen in c['poses'].items():
        for i, pose in chosen.items():
            piece = Image.open(d / 'blobs' / f'{stem}-{i}.png').convert('RGBA')
            k += 1
            fn = f"{c['name']}{k:03d}"
            if max(piece.size) < 400:
                small.append(fn + '.png')
                side = round(max(piece.size) / 0.8)
            else:
                s = min(1.0, 819 / max(piece.size))
                piece = piece.resize((round(piece.width * s), round(piece.height * s)), Image.LANCZOS)
                side = 1024
            sq = Image.new('RGBA', (side, side), GREY + (255,))
            sq.alpha_composite(piece, ((side - piece.width) // 2, (side - piece.height) // 2))
            sq.convert('RGB').save(items / f'{fn}.png')
            (items / f'{fn}.txt').write_text(f"{c['trigger']}, {c['desc']}, {pose}, {TAIL}")
    (d / 'small.txt').write_text('\n'.join(small))
    print(c['name'], k, 'pictures,', len(small), 'to upscale ->', items)
    if k < 8:
        print('  fewer than 8 poses: the model will be weak; cut more poses or ask for a fuller sheet')


def config(c):
    prompts = '\n'.join(f'          - "{p}"' for p in c['samples'])
    return f'''---
job: extension
config:
  name: "{c['lora_name']}"
  process:
    - type: 'sd_trainer'
      training_folder: "/out"
      device: cuda:0
      network:
        type: "lora"
        linear: {c.get('rank', 32)}
        linear_alpha: {c.get('rank', 32)}
      save:
        dtype: float16
        save_every: 500
        max_step_saves_to_keep: 6
      datasets:
        - folder_path: "/data/{c['name']}"
          caption_ext: "txt"
          caption_dropout_rate: 0.05
          shuffle_tokens: false
          cache_latents_to_disk: true
          resolution: [ 768, 1024 ]
      train:
        batch_size: 1
        cache_text_embeddings: true
        steps: {c.get('steps', 1500)}
        gradient_accumulation: 1
        train_unet: true
        train_text_encoder: false
        gradient_checkpointing: true
        noise_scheduler: "flowmatch"
        optimizer: "adamw8bit"
        lr: 1e-4
        dtype: bf16
      model:
        name_or_path: "Qwen/Qwen-Image"
        arch: "qwen_image"
        quantize: true
        qtype: "qfloat8"
        quantize_te: true
        qtype_te: "qfloat8"
        low_vram: false
      sample:
        sampler: "flowmatch"
        sample_every: 500
        sample_start_step: 0
        width: 1024
        height: 1024
        prompts:
{prompts}
        neg: ""
        seed: 42
        walk_seed: true
        guidance_scale: 3
        sample_steps: 25
meta:
  name: "[name]"
  version: '1.0'
'''


def command(c):
    N, DATA, MODEL = c['lora_name'], c['data_repo'], c['model_repo']
    return f"""
set -e
cd /app/ai-toolkit
python - <<'PY'
import os, shutil
from huggingface_hub import snapshot_download
p = snapshot_download('{DATA}', repo_type='dataset', local_dir='/data/raw', token=os.environ['HF_TOKEN'])
os.makedirs('/data/{c['name']}', exist_ok=True)
for f in os.listdir(os.path.join(p, 'items')):
    shutil.copy(os.path.join(p, 'items', f), '/data/{c['name']}/' + f)
shutil.copy(os.path.join(p, 'config/{N}.yaml'), '/cfg.yaml')
shutil.copy(os.path.join(p, 'small.txt'), '/small.txt')
print('images:', len([f for f in os.listdir('/data/{c['name']}') if f.endswith('.png')]), flush=True)
PY
python -m pip install --break-system-packages --no-deps spandrel >/dev/null 2>&1 || true
python - <<'PY'
import os, numpy as np, torch
from PIL import Image
from spandrel import ModelLoader
from huggingface_hub import hf_hub_download
names = [n.strip() for n in open('/small.txt') if n.strip()]
if names:
    m = ModelLoader().load_from_file(hf_hub_download('mshaffe111/char-sheets', 'anime6b.pth', repo_type='dataset', token=os.environ['HF_TOKEN'])).eval().cuda().half()
    for n in names:
        f = '/data/{c['name']}/' + n
        im = Image.open(f).convert('RGB')
        t = torch.from_numpy(np.asarray(im).astype(np.float32) / 255).permute(2, 0, 1).unsqueeze(0).cuda().half()
        with torch.no_grad():
            o = m(t)
        a = (o.squeeze(0).permute(1, 2, 0).float().clamp(0, 1).cpu().numpy() * 255).round().astype(np.uint8)
        big = Image.fromarray(a)
        s = min(1.0, 1024 / max(big.size))
        big.resize((round(big.width * s), round(big.height * s)), Image.LANCZOS).save(f)
print('upscaled', len(names), flush=True)
PY
mkdir -p /out
cat > /up.py <<'PY'
import os
from huggingface_hub import HfApi
api = HfApi(token=os.environ['HF_TOKEN'])
if os.path.isdir('/out/{N}'):
    api.upload_folder(folder_path='/out/{N}', repo_id='{MODEL}', repo_type='model',
                      allow_patterns=['*.safetensors', 'samples/*', '*.yaml', '*.txt'], commit_message='training progress')
    print('uploaded progress', flush=True)
PY
( while true; do sleep 900; python /up.py || true; done ) &
python run.py /cfg.yaml || echo TRAIN_FAILED
python /up.py
echo ALL_DONE
"""


def launch(c, dry):
    cfg = config(c)
    d = H / 'train' / c['name']
    if dry:
        print(cfg)
        print(command(c))
        return
    if not (d / 'items').exists() or not any((d / 'items').glob('*.png')):
        sys.exit(f"{c['name']}: no training set; run --cut and --build first (and only after Matt approves the sheet)")
    from huggingface_hub import HfApi, get_token, run_job
    import os
    tok = os.environ.get('HF_TOKEN') or get_token()
    if not tok:
        sys.exit('no Hugging Face token: set HF_TOKEN or run `hf auth login` (Matt\'s token; never write it into a file)')
    api = HfApi(token=tok)
    api.create_repo(c['data_repo'], repo_type='dataset', private=True, exist_ok=True)
    api.create_repo(c['model_repo'], repo_type='model', private=True, exist_ok=True)
    api.upload_folder(folder_path=str(d / 'items'), path_in_repo='items', repo_id=c['data_repo'], repo_type='dataset', commit_message='training set')
    api.upload_file(path_or_fileobj=str(d / 'small.txt'), path_in_repo='small.txt', repo_id=c['data_repo'], repo_type='dataset')
    api.upload_file(path_or_fileobj=cfg.encode(), path_in_repo=f"config/{c['lora_name']}.yaml", repo_id=c['data_repo'], repo_type='dataset')
    job = run_job(image='ostris/aitoolkit:latest', command=['bash', '-lc', command(c)], secrets={'HF_TOKEN': tok}, flavor='rtx-pro-6000',
                  timeout='3h', token=tok)
    print(c['name'], 'job', job.id)
    with open(ROOT / 'tools/art/gen/jobs.txt', 'a') as f:
        f.write(f"w5train-{c['name']} {job.id}\n")


if __name__ == '__main__':
    spec, mode, cs = args()
    for c in cs:
        if mode == '--cut':
            cut(c)
        elif mode == '--build':
            build(c)
        elif mode == '--launch':
            launch(c, '--dry' in sys.argv)
        else:
            sys.exit(__doc__)
