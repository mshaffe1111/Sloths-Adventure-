"""python3 launch.py idle   |   python3 launch.py all REF=collared/idle-a1.png POSES=a,b,c"""
import base64, sys
from pathlib import Path
from huggingface_hub import run_job
S = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[2]))
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
stage = sys.argv[1]
extra = dict(a.split('=', 1) for a in sys.argv[2:])
CMD = "echo $PY_B64 | base64 -d > /job.py && python /job.py"
env = {'PY_B64': base64.b64encode((S / 'prowl/job/collar.py').read_bytes()).decode(), 'STAGE': stage, **extra}
job = run_job(image='ostris/aitoolkit:latest', command=['bash', '-lc', CMD], env=env, secrets={'HF_TOKEN': tok}, flavor='rtx-pro-6000', timeout='2h', token=tok)
print(job.id, job.status.stage)
(S / f'prowl/job/{stage}-{extra.get("TAG", "")}job.txt').write_text(job.id)
