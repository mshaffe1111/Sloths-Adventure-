import sys, time
from pathlib import Path
from huggingface_hub import inspect_job, fetch_job_logs
S=__import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[2]))
tok=(__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
ids=sys.argv[1:]
while True:
    st=[inspect_job(job_id=j, token=tok).status.stage for j in ids]
    if all(s in ('COMPLETED','ERROR','CANCELED','DELETED') for s in st): break
    time.sleep(30)
for j in ids:
    logs=list(fetch_job_logs(job_id=j, token=tok))
    print(j, inspect_job(job_id=j, token=tok).status.stage)
    print('\n'.join(l for l in logs if 'DONE' in l or 'FAIL' in l or 'rror' in l)[-2000:])
