"""Check the licence of every scanned clip against benjamin-paine/freesound-laion-640k, which names it (CC0-1.0, CC-BY-4.0, ...) with the
uploader and the title (polish-sfx, 2026-10-29). CPU job, python:3.12, volumes
["hf://buckets/mshaffe111/w5-xfer:/out:rw"]; reads only the small columns of each parquet file, by range requests (a mount of the
dataset fetched whole 450 MB files). env IDS = a file of Freesound ids (one per line; scan-ids.txt, fetched beside this script). Writes hfbatch/sfx/licences.json.
"""
import json, subprocess, sys
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'pyarrow', 'huggingface_hub', 'fsspec'], check=True)
import os
import pyarrow.parquet as pq
ids = {int(l) for l in open(os.environ['IDS']) if l.strip()}
NAMES = ["CC0-1.0", "CC-BY-4.0", "CC-BY-3.0", "CC-BY-NC-3.0", "CC-BY-NC-4.0", "CC-Sampling+"]
from concurrent.futures import ThreadPoolExecutor
from huggingface_hub import HfFileSystem
fs = HfFileSystem()
files = sorted(fs.glob('datasets/benjamin-paine/freesound-laion-640k/**/*.parquet'))
print('files', len(files), flush=True)
found = {}


def cols(f):
    with fs.open(f, 'rb', block_size=256 * 1024) as fh:
        return pq.read_table(fh, columns=['freesound_id', 'license', 'attribution_required', 'commercial_use', 'username', 'title']).to_pydict()


def safe(f):
    try:
        return cols(f)
    except Exception as e:
        print('ERR', f, e, flush=True)
        return None


with ThreadPoolExecutor(16) as pool:
    for i, d in enumerate(pool.map(safe, files)):
        if d is None:
            continue
        for k, fid in enumerate(d['freesound_id']):
            if int(fid) in ids:
                lic = d['license'][k]
                found[int(fid)] = {'license': NAMES[lic] if isinstance(lic, int) else lic, 'attribution_required': d['attribution_required'][k],
                                   'commercial_use': d['commercial_use'][k], 'user': d['username'][k], 'title': d['title'][k]}
        if i % 100 == 0:
            print(i, len(found), flush=True)
json.dump(found, open('/out/hfbatch/sfx/licences.json', 'w'), indent=0)
print('ALL_DONE', len(found), 'of', len(ids), flush=True)
