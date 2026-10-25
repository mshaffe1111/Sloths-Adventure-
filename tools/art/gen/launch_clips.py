"""Launch clip jobs: python3 -I launch_clips.py <spec.json> [gpus]   spec = {"tag", "clips": [...], "motion"?: {...}}
The clips are split over `gpus` jobs (default: one per 6 clips)."""
import base64, json, math, sys
from pathlib import Path
from huggingface_hub import run_job
S = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[1]))
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
spec = json.loads(Path(sys.argv[1]).read_text())
clips = spec['clips']
n = int(sys.argv[2]) if len(sys.argv) > 2 else max(1, math.ceil(len(clips) / 6))
CMD = ("python -m pip install --break-system-packages ftfy >/dev/null 2>&1 || true; "
       "echo $VID_B64 | base64 -d > /vid.py && python /vid.py")
for k in range(n):
    part = clips[k::n]
    env = {'VID_B64': base64.b64encode((S / 'gen/gen_clips.py').read_bytes()).decode(),
           'CLIPS_B64': base64.b64encode(json.dumps(part).encode()).decode()}
    if spec.get('motion'):
        env['MOTION_B64'] = base64.b64encode(json.dumps(spec['motion']).encode()).decode()
    job = run_job(image='ostris/aitoolkit:latest', command=['bash', '-lc', CMD], env=env, secrets={'HF_TOKEN': tok},
                  flavor='rtx-pro-6000', timeout='3h', token=tok)
    print(spec['tag'], k, job.id, len(part), 'clips', flush=True)
    with open(S / 'gen/jobs.txt', 'a') as f:
        f.write(f"{spec['tag']}-{k} {job.id}\n")
