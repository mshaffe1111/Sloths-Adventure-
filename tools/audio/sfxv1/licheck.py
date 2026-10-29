"""Check the licence of every scanned clip against benjamin-paine/freesound-laion-640k, which names it (CC0-1.0, CC-BY-4.0, ...) with the
uploader and the title (polish-sfx, 2026-10-29). CPU job, python:3.12, volumes
["hf://datasets/benjamin-paine/freesound-laion-640k:/lic:ro", "hf://buckets/mshaffe111/w5-xfer:/out:rw"]; reads only the small columns of
each parquet file. env IDS = a file of Freesound ids (one per line; scan-ids.txt, fetched beside this script). Writes hfbatch/sfx/licences.json.
"""
import glob, json, subprocess, sys
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'pyarrow'], check=True)
import os
import pyarrow.parquet as pq
ids = {int(l) for l in open(os.environ['IDS']) if l.strip()}
NAMES = ["CC0-1.0", "CC-BY-4.0", "CC-BY-3.0", "CC-BY-NC-3.0", "CC-BY-NC-4.0", "CC-Sampling+"]
files = sorted(glob.glob('/lic/**/*.parquet', recursive=True))
print('files', len(files), flush=True)
found = {}
for i, f in enumerate(files):
    try:
        t = pq.read_table(f, columns=['freesound_id', 'license', 'attribution_required', 'commercial_use', 'username', 'title'])
    except Exception as e:
        print('ERR', f, e, flush=True)
        continue
    d = t.to_pydict()
    for k, fid in enumerate(d['freesound_id']):
        if int(fid) in ids:
            lic = d['license'][k]
            found[int(fid)] = {'license': NAMES[lic] if isinstance(lic, int) else lic, 'attribution_required': d['attribution_required'][k],
                               'commercial_use': d['commercial_use'][k], 'user': d['username'][k], 'title': d['title'][k]}
    if i % 100 == 0:
        print(i, len(found), flush=True)
json.dump(found, open('/out/hfbatch/sfx/licences.json', 'w'), indent=0)
print('ALL_DONE', len(found), 'of', len(ids), flush=True)
