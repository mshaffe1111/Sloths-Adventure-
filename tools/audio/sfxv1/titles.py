"""Every scanned clip's real Freesound title and licence, packed into a carrier PNG (polish-sfx, 2026-10-29). The archive's AI captions
proved unreliable (a synth drum captioned as a thud, a pint glass as crumbling rock), so sources are chosen by their uploaders' titles.

CPU job, python:3.12, volumes ["hf://buckets/mshaffe111/w5-xfer:/out:rw"]: looks up the ids in hfbatch/sfx/carriers/meta-*.jsonl that
licences.json lacks (licheck.py's way), then writes hfbatch/sfx/carriers/titles.png (unpack with tools/art/w5/unpack_carrier.py).
"""
import glob, io, json, subprocess, sys
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'pyarrow', 'huggingface_hub', 'fsspec', 'pillow', 'numpy'], check=True)
import numpy as np
import pyarrow.parquet as pq
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
from huggingface_hub import HfFileSystem

lic = json.load(open('/out/hfbatch/sfx/licences.json'))
meta = {}
for f in glob.glob('/out/hfbatch/sfx/carriers/meta-*.jsonl'):
    for l in open(f):
        if l.strip():
            m = json.loads(l)
            meta.setdefault(str(m['freesound_id']), m['cat'])
need = {int(i) for i in meta if i not in lic}
print('known', len(lic), 'need', len(need), flush=True)
NAMES = ["CC0-1.0", "CC-BY-4.0", "CC-BY-3.0", "CC-BY-NC-3.0", "CC-BY-NC-4.0", "CC-Sampling+"]
if need:
    fs = HfFileSystem()
    files = sorted(fs.glob('datasets/benjamin-paine/freesound-laion-640k/**/*.parquet'))

    def cols(f):
        try:
            with fs.open(f, 'rb', block_size=256 * 1024) as fh:
                return pq.read_table(fh, columns=['freesound_id', 'license', 'username', 'title']).to_pydict()
        except Exception as e:
            print('ERR', f, e, flush=True)
            return None

    with ThreadPoolExecutor(16) as pool:
        for i, d in enumerate(pool.map(cols, files)):
            if d:
                for k, fid in enumerate(d['freesound_id']):
                    if int(fid) in need:
                        l_ = d['license'][k]
                        lic[str(int(fid))] = {'license': NAMES[l_] if isinstance(l_, int) else l_, 'user': d['username'][k], 'title': d['title'][k]}
            if i % 200 == 0:
                print(i, flush=True)
rows = [f"{i}\t{meta.get(i, '')}\t{v.get('license')}\t{v.get('user')}\t{(v.get('title') or '').strip()}" for i, v in lic.items()]
data = ('\n'.join(rows)).encode()
files_ = [('titles.tsv', data)]
head = json.dumps([[n, len(x)] for n, x in files_]).encode() + b'\n'
blob = head + data
w = 2048
h = (len(blob) + w - 1) // w
arr = np.zeros(w * h, np.uint8)
arr[:len(blob)] = np.frombuffer(blob, np.uint8)
Image.fromarray(arr.reshape(h, w), 'L').save('/out/hfbatch/sfx/carriers/titles.png', compress_level=9)
print('ALL_DONE', len(rows), flush=True)
