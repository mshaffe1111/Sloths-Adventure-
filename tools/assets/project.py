#!/usr/bin/env python3
"""Whole-game projection (task AS-1): images from trial.py's full run (and its resize run, which replaces those files' rows), music
from musictrial.py's measured size ratios per stem kind, applied to every shipped .webm. Writes projection.json for page.py.

    python3 tools/assets/project.py <inventory.json> <trial.json> [resize trial.json] <music mix.json> <music stems.json> <out.json>
"""
import json, sys

inv, trial, *rest = sys.argv[1:]
resize, mixj, stemj, out = (rest if len(rest) == 4 else [None] + rest)
rows = json.load(open(inv))
t = {r['src']: r for r in json.load(open(trial))}
if resize:
    for r in json.load(open(resize)):
        if r['factor'] != 1.0:
            t[r['src']] = r
mix, stems = json.load(open(mixj)), json.load(open(stemj))


def ratio(rs, cur, new):
    return sum(r['enc'][str(new)]['bytes'] for r in rs) / sum(r['enc'][str(cur)]['bytes'] for r in rs)


stereo = [r for r in stems if r['ch'] == 2]
mono = [r for r in stems if r['ch'] == 1]
MUSIC = {  # setting: (mix kbps, stereo stem kbps, mono stem kbps) from today's 80 / 64 / 40
    'M1': (64, 56, 32), 'M2': (56, 48, 28), 'M3': (48, 40, 24)}
MONO = {'drive', 'shine', 'dark', 'boss'}
webm = [r for r in rows if r['dist'].endswith('.webm')]
webp = [r for r in rows if r['dist'].endswith('.webp')]
music_now = sum(r['bytes'] for r in webm)
music = {}
for k, (a, b, c) in MUSIC.items():
    ra, rb, rc = ratio(mix, 80, a), ratio(stereo, 64, b), ratio(mono, 40, c)
    music[k] = sum(r['bytes'] * (ra if '.mix.' in r['src'] else rc if r['src'].rsplit('.', 2)[1] in MONO else rb) for r in webm)
img_now = sum(r['bytes'] for r in webp)
missing = [r['src'] for r in webp if r['src'] not in t]
img = {q: sum(t[r['src']]['out'][str(q)] if r['src'] in t else r['bytes'] for r in webp) for q in (90, 82, 75)}
resized = [s for s, r in t.items() if r['factor'] != 1.0]
WEB_NOW, APP_NOW = 176.9, 188.0  # MB: the vite build of 585ef376, and the 0.9.6 APK (the lead's figure)
MB = 2**20
res = dict(rows=[], resized=len(resized), resized_bytes_before=sum(t[s]['bytes'] for s in resized),
           resized_bytes_after={q: sum(t[s]['out'][str(q)] for s in resized) for q in (90, 82, 75)}, missing=len(missing))
res['rows'].append(dict(name='Today (0.9.6)', images=img_now / MB, music=music_now / MB, saved=0, web=WEB_NOW, app=APP_NOW))
for name, q, m in (('Art q90, music M1', 90, 'M1'), ('Art q82, music M1 (pick)', 82, 'M1'), ('Art q82, music M2', 82, 'M2'),
                   ('Art q75, music M3', 75, 'M3')):
    saved = (img_now - img[q] + music_now - music[m]) / MB
    res['rows'].append(dict(name=name, images=img[q] / MB, music=music[m] / MB, saved=saved, web=WEB_NOW - saved, app=APP_NOW - saved))
res['music_settings'] = {k: dict(kbps=v, mb=music[k] / MB) for k, v in MUSIC.items()}
res['image_settings'] = {q: img[q] / MB for q in img}
json.dump(res, open(out, 'w'), indent=1)
for r in res['rows']:
    print(f"{r['name']:28} images {r['images']:6.1f}  music {r['music']:5.1f}  saved {r['saved']:5.1f}  web {r['web']:6.1f}  app {r['app']:6.1f}")
print('resized files:', len(resized), 'missing from trial:', len(missing))
