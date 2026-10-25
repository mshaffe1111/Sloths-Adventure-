"""Train the game-look model (Qwen-Image LoRA, trigger 'slothadv style') on style/items: upload the set, one ai-toolkit job on an
RTX PRO 6000. The small pictures are upscaled 4x on the GPU first (Real-ESRGAN anime 6B), keeping their shape.

  python3 -I launch.py [--dry]
"""
import sys
from pathlib import Path
from huggingface_hub import HfApi, run_job

S = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[1]))
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
api = HfApi(token=tok)
NAME = 'slothadv_style_v1'
DATA, MODEL = 'mshaffe111/slothadv-style-data', 'mshaffe111/slothadv-style-lora'
T = 'slothadv style, painted storybook illustration'
PROMPTS = [
    f'{T}, a chubby capybara village guard holding a wooden spear, standing, side view, plain grey background',
    f'{T}, a howler monkey leaping with its arms out, angry, side view, plain grey background',
    f'{T}, a toucan with a bright orange beak perched on a branch, plain grey background',
    f'{T}, a young sloth in a red scarf waving hello, front view, plain grey background',
    f'{T}, a mossy carved stone temple doorway, a game prop, plain grey background',
    f'{T}, a wide side-scrolling game background, the far background layer, misty waterfalls and cliffs at dawn',
]

CFG = f'''---
job: extension
config:
  name: "{NAME}"
  process:
    - type: 'sd_trainer'
      training_folder: "/out"
      device: cuda:0
      network:
        type: "lora"
        linear: 32
        linear_alpha: 32
      save:
        dtype: float16
        save_every: 500
        max_step_saves_to_keep: 8
      datasets:
        - folder_path: "/data/style"
          caption_ext: "txt"
          caption_dropout_rate: 0.05
          shuffle_tokens: false
          cache_latents_to_disk: true
          resolution: [ 768, 1024 ]
      train:
        batch_size: 1
        cache_text_embeddings: true
        steps: 3000
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
{chr(10).join(f'          - "{p}"' for p in PROMPTS)}
        neg: ""
        seed: 42
        walk_seed: true
        guidance_scale: 3
        sample_steps: 25
meta:
  name: "[name]"
  version: '1.0'
'''

CMD = f"""
set -e
cd /app/ai-toolkit
python - <<'PY'
import os, shutil
from huggingface_hub import snapshot_download
p = snapshot_download('{DATA}', repo_type='dataset', local_dir='/data/raw', token=os.environ['HF_TOKEN'])
os.makedirs('/data/style', exist_ok=True)
for f in os.listdir(os.path.join(p, 'items')):
    shutil.copy(os.path.join(p, 'items', f), '/data/style/' + f)
shutil.copy(os.path.join(p, 'config/{NAME}.yaml'), '/cfg.yaml')
shutil.copy(os.path.join(p, 'small.txt'), '/small.txt')
print('images:', len([f for f in os.listdir('/data/style') if f.endswith('.png')]), flush=True)
PY
python -m pip install --break-system-packages --no-deps spandrel >/dev/null 2>&1 || true
python - <<'PY'
import os, numpy as np, torch
from PIL import Image
from spandrel import ModelLoader
from huggingface_hub import hf_hub_download
m = ModelLoader().load_from_file(hf_hub_download('mshaffe111/char-sheets', 'anime6b.pth', repo_type='dataset', token=os.environ['HF_TOKEN'])).eval().cuda().half()
names = [n.strip() for n in open('/small.txt') if n.strip()]
for n in names:
    f = '/data/style/' + n
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
if os.path.isdir('/out/{NAME}'):
    api.upload_folder(folder_path='/out/{NAME}', repo_id='{MODEL}', repo_type='model',
                      allow_patterns=['*.safetensors', 'samples/*', '*.yaml', '*.txt'], commit_message='training progress')
    print('uploaded progress', flush=True)
PY
( while true; do sleep 900; python /up.py || true; done ) &
python run.py /cfg.yaml || echo TRAIN_FAILED
python /up.py
echo ALL_DONE
"""

if __name__ == '__main__':
    (S / f'style/{NAME}.yaml').write_text(CFG)
    if '--dry' in sys.argv:
        print(CFG)
        sys.exit()
    api.create_repo(DATA, repo_type='dataset', private=True, exist_ok=True)
    api.create_repo(MODEL, repo_type='model', private=True, exist_ok=True)
    api.upload_folder(folder_path=str(S / 'style/items'), path_in_repo='items', repo_id=DATA, repo_type='dataset', commit_message='training set')
    api.upload_file(path_or_fileobj=str(S / 'style/small.txt'), path_in_repo='small.txt', repo_id=DATA, repo_type='dataset')
    api.upload_file(path_or_fileobj=CFG.encode(), path_in_repo=f'config/{NAME}.yaml', repo_id=DATA, repo_type='dataset')
    job = run_job(image='ostris/aitoolkit:latest', command=['bash', '-lc', CMD], secrets={'HF_TOKEN': tok}, flavor='rtx-pro-6000', timeout='4h', token=tok)
    (S / 'style/trainjob.txt').write_text(job.id)
    print('job', job.id, job.status.stage)
