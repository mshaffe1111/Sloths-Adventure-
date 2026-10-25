"""Train the motion model: a Wan 2.2 image-to-video LoRA (both experts) on the clips that came out right, so new clips keep the camera
still, stay side-on and in place, and move smoothly. One ai-toolkit job on an RTX PRO 6000.
  python3 -I launch.py [--dry]
"""
import sys
from pathlib import Path
from huggingface_hub import HfApi, run_job

S = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[1]))
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
api = HfApi(token=tok)
NAME = 'slothadv_motion_v2'
DATA, MODEL = 'mshaffe111/slothadv-motion-data', 'mshaffe111/slothadv-motion-lora'

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
        save_every: 250
        max_step_saves_to_keep: 8
      datasets:
        - folder_path: "/data/motion"
          caption_ext: "txt"
          caption_dropout_rate: 0.05
          num_frames: 33
          resolution: [ 480 ]
      train:
        batch_size: 1
        steps: 2000
        gradient_accumulation: 1
        train_unet: true
        train_text_encoder: false
        gradient_checkpointing: true
        noise_scheduler: "flowmatch"
        timestep_type: 'linear'
        optimizer: "adamw8bit"
        lr: 1e-4
        optimizer_params:
          weight_decay: 1e-4
        disable_sampling: true
        dtype: bf16
        switch_boundary_every: 10
        cache_text_embeddings: true
      model:
        name_or_path: "ai-toolkit/Wan2.2-I2V-A14B-Diffusers-bf16"
        arch: 'wan22_14b_i2v'
        quantize: true
        qtype: "qfloat8"
        quantize_te: true
        qtype_te: "qfloat8"
        low_vram: true
        model_kwargs:
          train_high_noise: true
          train_low_noise: true
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
os.makedirs('/data/motion', exist_ok=True)
for f in os.listdir(os.path.join(p, 'clips2')):
    shutil.copy(os.path.join(p, 'clips2', f), '/data/motion/' + f)
shutil.copy(os.path.join(p, 'config/{NAME}.yaml'), '/cfg.yaml')
print('clips:', len([f for f in os.listdir('/data/motion') if f.endswith('.mp4')]), flush=True)
PY
mkdir -p /out
cat > /up.py <<'PY'
import os
from huggingface_hub import HfApi
api = HfApi(token=os.environ['HF_TOKEN'])
if os.path.isdir('/out/{NAME}'):
    api.upload_folder(folder_path='/out/{NAME}', repo_id='{MODEL}', repo_type='model',
                      allow_patterns=['*.safetensors', '*.yaml', '*.txt'], commit_message='training progress')
    print('uploaded progress', flush=True)
PY
( while true; do sleep 1200; python /up.py || true; done ) &
python run.py /cfg.yaml || echo TRAIN_FAILED
python /up.py
echo ALL_DONE
"""

if __name__ == '__main__':
    (S / f'motion/{NAME}.yaml').write_text(CFG)
    if '--dry' in sys.argv:
        sys.exit()
    api.create_repo(DATA, repo_type='dataset', private=True, exist_ok=True)
    api.create_repo(MODEL, repo_type='model', private=True, exist_ok=True)
    if '--reuse' not in sys.argv:
        api.upload_folder(folder_path=str(S / 'motion/clips'), path_in_repo='clips2', repo_id=DATA, repo_type='dataset', commit_message='clips')
    api.upload_file(path_or_fileobj=CFG.encode(), path_in_repo=f'config/{NAME}.yaml', repo_id=DATA, repo_type='dataset')
    job = run_job(image='ostris/aitoolkit:latest', command=['bash', '-lc', CMD], secrets={'HF_TOKEN': tok}, flavor='rtx-pro-6000', timeout='8h', token=tok)
    (S / 'motion/trainjob.txt').write_text(job.id)
    print('job', job.id, job.status.stage)
