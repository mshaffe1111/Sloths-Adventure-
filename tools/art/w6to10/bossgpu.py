"""The World 6-10 guardians' clips as GPU jobs (2026-10-28): expands the compact spec make_specs.py writes (spec-w6to10-bosses.json)
for one boss into the clip list of tools/art/anim/animgpu.py and runs that script (same Wan 2.2 + motion model step, same outputs:
<SUB>/clips/<name>.zip, sheet-<name>.jpg, <name>.carrier.png in the bucket mshaffe111/w5-xfer mounted at /out).
env: SPEC = the compact spec's bucket path, BOSS = boss name (or several, comma separated), SUB = w6to10, PART/PARTS optional,
ONLY = optional comma list of moves (re-runs), SEEDS = optional comma list of seeds overriding the spec's. A start picture
that is not in the bucket yet is waited for (up to 20 min), so this can be launched beside the job that makes the starts.
"""
import json, os, runpy, time
from pathlib import Path

from PIL import Image

_open = Image.open


def _wait_open(fp, *a, **k):
    # the start pictures may still be on their way (a starts job running beside this one): wait up to 20 min for each
    if isinstance(fp, (str, Path)):
        t = time.time()
        while not Path(fp).exists() and time.time() - t < 1200:
            time.sleep(10)
    return _open(fp, *a, **k)


Image.open = _wait_open

ROOT = Path(os.environ.get('OUT', '/out'))
C = json.loads((ROOT / os.environ['SPEC']).read_text())
only = [m for m in os.environ.get('ONLY', '').split(',') if m]
seeds = [int(s) for s in os.environ.get('SEEDS', '').split(',') if s] or C['seeds']
clips = []
for boss in os.environ['BOSS'].split(','):
    B = C['bosses'][boss]
    for mv, (fr, (w, h), what) in B['moves'].items():
        if only and mv not in only:
            continue
        for s in seeds:
            clips.append({'name': f'w6t-{boss}-{mv}-s{s}', 'src': f"../stills/{B['tag']}-{fr}.png", 'prompt': C['M'] + B['who'] + what + C['END'],
                          'seed': s, 'w': w, 'h': h})
name = f"jobs/x-{os.environ['BOSS'].replace(',', '_')}-{os.environ.get('PART', '0')}{('-' + '_'.join(only)) if only else ''}.json"
p = ROOT / os.environ['SUB'] / name
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text(json.dumps({'tag': 'w6to10', 'motion': C['motion'], 'clips': clips}))
print('CLIPS', len(clips), [c['name'] for c in clips], flush=True)
os.environ['SPEC'] = f"{os.environ['SUB']}/{name}"
runpy.run_path(str(ROOT / 'anim/jobs/animgpu.py'), run_name='__main__')
