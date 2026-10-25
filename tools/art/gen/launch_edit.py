"""Launch an image-edit job: python3 -I launch_edit.py <spec.json>   spec = {"tag", "items": [...]}"""
import base64, json, sys
from pathlib import Path
from huggingface_hub import run_job
S = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[1]))
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
spec = json.loads(Path(sys.argv[1]).read_text())
CMD = 'echo $GEN_B64 | base64 -d > /gen.py && python /gen.py'
env = {'GEN_B64': base64.b64encode((S / 'gen/gen_edit.py').read_bytes()).decode(),
       'JOB_B64': base64.b64encode(json.dumps(spec).encode()).decode()}
job = run_job(image='ostris/aitoolkit:latest', command=['bash', '-lc', CMD], env=env, secrets={'HF_TOKEN': tok},
              flavor='rtx-pro-6000', timeout='2h', token=tok)
print(spec['tag'], job.id, len(spec['items']), 'edits', flush=True)
with open(S / 'gen/jobs.txt', 'a') as f:
    f.write(f"{spec['tag']} {job.id}\n")
