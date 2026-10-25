"""status and the last log lines of Hugging Face jobs: python3 -I jw.py JOBID [JOBID ...] [-n 6]"""
import re, sys
from pathlib import Path
from huggingface_hub import HfApi
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
api = HfApi(token=tok)
args = sys.argv[1:]
n = 6
if '-n' in args:
    i = args.index('-n'); n = int(args[i + 1]); del args[i:i + 2]
for j in args:
    info = api.inspect_job(job_id=j, token=tok)
    print('==', j, info.status.stage, info.status.message or '')
    try:
        logs = [re.sub(r'\x1b\[[0-9;]*[A-Za-z]', '', l).split('\r')[-1].strip() for l in api.fetch_job_logs(job_id=j, token=tok)]
        logs = [l for l in logs if l]
        for l in logs[-n:]:
            print('  ', l[-220:])
    except Exception as e:
        print('  logs:', str(e)[:200])
