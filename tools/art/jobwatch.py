import sys, time
from huggingface_hub import inspect_job, fetch_job_logs
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
jid = sys.argv[1]; wait = int(sys.argv[2]) if len(sys.argv) > 2 else 600
t0 = time.time()
while time.time() - t0 < wait:
    j = inspect_job(job_id=jid, token=tok)
    st = j.status.stage
    if st in ('COMPLETED', 'ERROR', 'CANCELED', 'DELETED'):
        break
    time.sleep(15)
print('status:', j.status.stage, j.status.message or '')
try:
    logs = list(fetch_job_logs(job_id=jid, token=tok))
    print('\n'.join(logs[-int(sys.argv[3]) if len(sys.argv) > 3 else -40:]))
except Exception as e:
    print('logs error', e)
