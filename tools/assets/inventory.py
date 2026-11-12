#!/usr/bin/env python3
"""Asset inventory (task AS-1, test-side only).

    python3 tools/assets/inventory.py dist /tmp/out.json [probe-port.json probe-land.json]

Every .webp and .webm the build ships (dist/ after `npx vite build`), matched to its file under src/assets by content hash, with
pixel size, alpha, lossy/lossless, frames, bytes; for .webm the codec, channels, bitrate and length. With probe results
(tools/assets/drawprobe.mjs) it adds the largest scale each image is ever drawn at on a 3x phone screen (device px per stored px)
and whether it is fetched at startup (the title screen). Prints totals by folder.
"""
import hashlib, json, os, subprocess, sys
from collections import defaultdict
from urllib.parse import unquote, urlparse

from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
dist, out = sys.argv[1], sys.argv[2]
probes = [json.load(open(p)) for p in sys.argv[3:]]

h = lambda p: hashlib.md5(open(p, 'rb').read()).hexdigest()
src = {}
for d, _, fs in os.walk(os.path.join(ROOT, 'src', 'assets')):
    for f in fs:
        if f.endswith(('.webp', '.webm')):
            p = os.path.join(d, f)
            src.setdefault(h(p), os.path.relpath(p, ROOT))

def webp_info(p):
    b = open(p, 'rb').read()
    kind = 'lossless' if b'VP8L' in b[12:64] else 'lossy'
    if b'ANIM' in b[12:64]: kind += '+anim'
    alpha = b'ALPH' in b or (b'VP8L' in b[12:64])
    im = Image.open(p)
    return dict(w=im.width, h=im.height, frames=getattr(im, 'n_frames', 1), kind=kind, alpha=alpha and im.mode in ('RGBA', 'LA', 'PA'))

def webm_info(p):
    j = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', p]))
    s = j['streams']
    f = j['format']
    return dict(streams=[(x['codec_type'], x['codec_name'], x.get('channels'), x.get('width'), x.get('height')) for x in s],
                dur=float(f['duration']), kbps=round(int(f['bit_rate']) / 1000))

# probe: the largest scale per src path (dev server urls are /src/assets/...), walking canvas -> canvas -> screen chains per page life
key = lambda u: unquote(urlparse(u).path).lstrip('/')
scale, startup, domsz, via = defaultdict(float), set(), {}, {}
for pr in probes:
    for u in pr.get('startup', []):
        startup.add(key(u))
    for life in pr['lives']:
        scr = {int(k): v for k, v in life['screens'].items()}
        edges = {int(k): {int(t): m for t, m in e.items()} for k, e in life['edges'].items()}
        memo = {}

        def reach(c, depth=0):
            if c in memo:
                return memo[c]
            memo[c] = 0.0  # (a cycle counts as nothing)
            v = scr.get(c, 0.0)
            if depth < 6:
                for t, m in edges.get(c, {}).items():
                    v = max(v, m * reach(t, depth + 1))
            memo[c] = v
            return v

        for u, at in life['raw'].items():
            k = key(u)
            for c, kk in at.items():
                v = kk * reach(int(c))
                if v > scale[k]:
                    scale[k] = v
                    via[k] = (int(c) in scr, round(kk, 3), round(reach(int(c)), 3))
        for u, r in life['dom'].items():
            k = key(u)
            domsz[k] = max(domsz.get(k, (0, 0)), (r['w'], r['h']), key=lambda t: t[0] * t[1])

rows = []
for d, _, fs in os.walk(dist):
    for f in fs:
        if not f.endswith(('.webp', '.webm')):
            continue
        p = os.path.join(d, f)
        s = src.get(h(p), '?' + f)
        r = dict(dist=os.path.relpath(p, dist), src=s, bytes=os.path.getsize(p), folder=os.path.dirname(s).replace('src/assets/', ''))
        if f.endswith('.webp'):
            r.update(webp_info(p))
            sc = scale.get(s, 0.0)
            if s in domsz:
                dw, dh = domsz[s]
                sc = max(sc, min(dw / r['w'], dh / r['h']))  # a DOM box: at least "contain"
            r['drawn_scale'] = round(sc, 3)
            r['seen'] = s in scale or s in domsz
            r['via'] = via.get(s)
        else:
            r.update(webm_info(p))
        r['startup'] = s in startup
        rows.append(r)
rows.sort(key=lambda r: -r['bytes'])
json.dump(rows, open(out, 'w'), indent=1)

tot = defaultdict(lambda: [0, 0])
for r in rows:
    t = tot[(r['dist'].rsplit('.', 1)[1], r['folder'].split('/')[0])]
    t[0] += 1; t[1] += r['bytes']
print(f"{'type':5} {'folder':14} {'files':>5} {'MB':>7}")
for (e, fo), (n, b) in sorted(tot.items(), key=lambda kv: -kv[1][1]):
    print(f"{e:5} {fo:14} {n:5} {b / 2**20:7.2f}")
print('total', sum(r['bytes'] for r in rows) / 2**20, 'MB in', len(rows), 'files; unmatched to src:', sum(r['src'].startswith('?') for r in rows))
