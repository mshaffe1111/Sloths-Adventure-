"""Pack the recorded effect takes into one file for the game (polish-sfx, 2026-10-29): 270 separate mp3s took 11 s to arrive on the dev
server, and a phone pays a round trip for each. The pack is [4-byte little-endian header length][JSON header: [[name, bytes], ...]][the
mp3s, back to back]; sfxRecLoader.ts splits it and decodes each take. The world beds (bed<n>_0.mp3) stay separate: each is fetched only
when its world starts.

    python3 tools/audio/sfxv1/pack.py <takes dir> <src/assets/sfxrec>
"""
import glob, json, os, re, shutil, struct, sys

src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
for f in glob.glob(os.path.join(dst, '*.mp3')):
    os.remove(f)
takes = sorted(f for f in glob.glob(os.path.join(src, '*.mp3')) if not re.match(r'bed\d+_', os.path.basename(f)))
items = [(os.path.basename(f), open(f, 'rb').read()) for f in takes]
head = json.dumps([[n, len(b)] for n, b in items]).encode()
with open(os.path.join(dst, 'takes.mp3'), 'wb') as out:
    out.write(struct.pack('<I', len(head)) + head + b''.join(b for _, b in items))
for f in glob.glob(os.path.join(src, 'bed*_0.mp3')):
    shutil.copy(f, dst)
print(len(items), 'takes,', os.path.getsize(os.path.join(dst, 'takes.mp3')), 'bytes; beds', len(glob.glob(os.path.join(dst, 'bed*'))))
