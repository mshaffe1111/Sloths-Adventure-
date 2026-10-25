"""Poll the training job and print one line per meaningful change (status, step milestones, errors, finish)."""
import re, time
from huggingface_hub import inspect_job, fetch_job_logs

S = (str(__import__('pathlib').Path(__file__).resolve().parents[0]) + '/')
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
jid = open(S + 'train/trainjob.txt').read().strip()
last_stage, last_mark, seen_err = None, -1, set()
while True:
    try:
        st = inspect_job(job_id=jid, token=tok).status
    except Exception as e:
        time.sleep(60); continue
    if st.stage != last_stage:
        print(f'status {st.stage} {st.message or ""}', flush=True); last_stage = st.stage
    if st.stage == 'RUNNING' or st.stage in ('COMPLETED', 'ERROR', 'CANCELED'):
        try:
            logs = list(fetch_job_logs(job_id=jid, token=tok))
        except Exception:
            logs = []
        text = '\n'.join(logs[-400:])
        steps = [int(m) for m in re.findall(r'(\d+)/2500 \[', text)]
        if steps:
            s = max(steps)
            mark = s // 250
            if mark > last_mark:
                rate = re.findall(r'(\d+\.\d+)s/it|(\d+\.\d+)it/s', text)
                print(f'step {s}/2500 {rate[-1] if rate else ""}', flush=True); last_mark = mark
        for line in logs[-200:]:
            if re.search(r'Traceback|Error|OutOfMemory|TRAIN_FAILED|Killed', line) and line not in seen_err:
                seen_err.add(line); print('ERR ' + line[:300], flush=True)
            if 'ALL_DONE' in line and 'done' not in seen_err:
                seen_err.add('done'); print('ALL_DONE', flush=True)
            if 'uploaded progress' in line and line not in seen_err:
                seen_err.add(line); print('progress uploaded', flush=True)
    if st.stage in ('COMPLETED', 'ERROR', 'CANCELED', 'DELETED'):
        break
    time.sleep(45)
