"""Full-bandwidth originals for the recorded set (polish-sfx, 2026-10-29). The captioned archive's clips stop at 8 kHz (they are 16 kHz
copies), so the takes sounded dull; benjamin-paine/freesound-laion-640k carries each clip as uploaded. This CPU job (python:3.12, volumes
["hf://buckets/mshaffe111/w5-xfer:/out:rw"]) finds the ids in IDS (one per line), reads only the row groups that hold them (range reads),
reports each clip's real sample rate and bandwidth, and packs them as mono Opus 160 kbps at 48 kHz (first MAXS seconds; beds up to 40 s)
into carriers hfbatch/sfx/carriers/carrier-<TAG>-<n>.png with full-<TAG>.jsonl. Unpack with tools/art/w5/unpack_carrier.py.
"""
import io, json, os, subprocess, sys
subprocess.run(['apt-get', 'update', '-qq'], check=True, stdout=subprocess.DEVNULL)
subprocess.run(['apt-get', 'install', '-y', '-qq', 'ffmpeg'], check=True, stdout=subprocess.DEVNULL)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'pyarrow', 'huggingface_hub', 'fsspec', 'pillow', 'numpy'], check=True)
import numpy as np
import pyarrow.parquet as pq
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
from huggingface_hub import HfFileSystem

ids = {int(l) for l in open(os.environ['IDS']) if l.strip()} if os.environ.get('IDS') else set()
# TAGS mode: instead of ids, every CC0 clip whose own tags include one of TAGS (and none of NOT), up to LIMIT (the caiman's voice)
TAGS = set(filter(None, os.environ.get('TAGS', '').split(',')))
NOT = set(filter(None, os.environ.get('NOT', '').split(',')))
LIMIT = int(os.environ.get('LIMIT', '40'))
TAG = os.environ.get('TAG', 'fb')
OUT = '/out/hfbatch/sfx/carriers'
os.makedirs(OUT, exist_ok=True)
fs = HfFileSystem()
files = sorted(fs.glob('datasets/benjamin-paine/freesound-laion-640k/**/*.parquet'))
print('files', len(files), 'ids', len(ids), flush=True)


def scan(f):
    """the row groups of a file that hold a wanted id"""
    try:
        with fs.open(f, 'rb', block_size=256 * 1024) as fh:
            pf = pq.ParquetFile(fh)
            hits = []
            for g in range(pf.num_row_groups):
                if TAGS:
                    t = pf.read_row_group(g, columns=['freesound_id', 'license', 'tags']).to_pydict()
                    for fid, lic, tags in zip(t['freesound_id'], t['license'], t['tags']):
                        tg = {x.lower() for x in (tags or [])}
                        if lic == 0 and tg & TAGS and not tg & NOT:
                            ids.add(int(fid))
                            if g not in hits:
                                hits.append(g)
                    continue
                col = pf.read_row_group(g, columns=['freesound_id']).column(0).to_pylist()
                if ids.intersection(int(x) for x in col):
                    hits.append(g)
            return f, hits
    except Exception as e:
        print('ERR scan', f, e, flush=True)
        return f, []


def enc(raw, secs):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'pipe:0', '-t', str(secs), '-ac', '1', '-ar', '48000', '-c:a', 'libopus', '-b:a', '160k', '-f', 'ogg', 'pipe:1'],
                       input=raw, capture_output=True)
    return p.stdout if p.returncode == 0 and len(p.stdout) > 500 else None


def probe(raw):
    p = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=sample_rate,channels,codec_name', '-of', 'json', 'pipe:0'], input=raw, capture_output=True)
    try:
        return json.loads(p.stdout)['streams'][0]
    except Exception:
        return {}


def bandwidth(raw):
    """the frequency under which 99.5% of the energy of the clip's first 10 s lies"""
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'pipe:0', '-t', '10', '-ac', '1', '-ar', '48000', '-f', 'f32le', 'pipe:1'], input=raw, capture_output=True)
    x = np.frombuffer(p.stdout, np.float32)
    if len(x) < 4096:
        return None
    X = np.abs(np.fft.rfft(x)) ** 2
    c = np.cumsum(X) / X.sum()
    return int(np.searchsorted(c, 0.995) * 24000 / len(X))


found, meta, chunk, size, k = set(), [], [], 0, 0


def carrier(items):
    head = json.dumps([[n, len(x)] for n, x in items]).encode() + b'\n'
    data = head + b''.join(x for _, x in items)
    w = 2048
    h = (len(data) + w - 1) // w
    arr = np.zeros(w * h, np.uint8)
    arr[:len(data)] = np.frombuffer(data, np.uint8)
    b = io.BytesIO()
    Image.fromarray(arr.reshape(h, w), 'L').save(b, 'PNG', compress_level=9)
    return b.getvalue()


with ThreadPoolExecutor(16) as pool:
    for i, (f, groups) in enumerate(pool.map(scan, files)):
        for g in groups:
            with fs.open(f, 'rb', block_size=1024 * 1024) as fh:
                t = pq.ParquetFile(fh).read_row_group(g, columns=['freesound_id', 'audio', 'title', 'license', 'tags']).to_pylist()
            for row in t:
                fid = int(row['freesound_id'])
                if fid not in ids or fid in found or (TAGS and len(found) >= LIMIT) or (TAGS and row['license'] != 0):
                    continue
                raw = (row['audio'] or {}).get('bytes')
                if not raw:
                    continue
                pr = probe(raw)
                o = enc(raw, 40)
                if not o:
                    continue
                found.add(fid)
                m = {'freesound_id': fid, 'title': row['title'], 'license': row['license'], 'tags': row.get('tags'), 'src_rate': pr.get('sample_rate'), 'codec': pr.get('codec_name'),
                     'bw99': bandwidth(raw), 'bytes_in': len(raw)}
                meta.append(m)
                print('GOT', json.dumps(m), flush=True)
                if size + len(o) > 6_300_000:
                    open(f'{OUT}/carrier-{TAG}-{k}.png', 'wb').write(carrier(chunk))
                    k += 1
                    chunk, size = [], 0
                chunk.append((f'full__{fid}.ogg', o))
                size += len(o)
        if i % 100 == 0:
            print(i, len(found), flush=True)
chunk.append(('meta.jsonl', '\n'.join(json.dumps(m) for m in meta).encode()))
open(f'{OUT}/carrier-{TAG}-{k}.png', 'wb').write(carrier(chunk))
open(f'{OUT}/full-{TAG}.jsonl', 'w').write('\n'.join(json.dumps(m) for m in meta))
print('ALL_DONE', len(found), 'of', len(ids), 'carriers', k + 1, 'missing', sorted(ids - found)[:40], flush=True)
