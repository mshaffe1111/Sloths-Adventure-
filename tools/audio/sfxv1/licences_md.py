"""LICENCES.md for the recorded effect set (polish-sfx, 2026-10-29): every Freesound recording the build uses, with its licence as named
by benjamin-paine/freesound-laion-640k (licheck.py), its uploader and title, and the effects it went into.

    python3 tools/audio/sfxv1/licences_md.py <licences.json> <takes dir>/sources.json <build.py> <out.md>
"""
import json, re, sys

lic, used, build, out = json.load(open(sys.argv[1])), json.load(open(sys.argv[2])), open(sys.argv[3]).read(), sys.argv[4]
# which effects use a recording: the def blocks that name its id
blocks = re.split(r'\n(?=def |[A-Z]+ = )', build)
where = {}
for b in blocks:
    m = re.match(r'def (\w+)|([A-Z]+) = ', b)
    if not m:
        continue
    name = m.group(1) or m.group(2)
    for fid in set(re.findall(r'\b(\d{4,6})\b', b)):
        where.setdefault(fid, set()).add(name)
rows, bad = [], []
for fid in sorted(used, key=int):
    L = lic.get(fid) or lic.get(int(fid))
    if not L or L.get('license') != 'CC0-1.0':
        bad.append(fid)
    t = (L or {}).get('title', '?').replace('|', '/').strip()
    rows.append(f"| [{fid}](https://freesound.org/s/{fid}/) | {(L or {}).get('user', '?')} | {t} | {(L or {}).get('license', 'NOT FOUND')} | "
                f"{', '.join(sorted(where.get(fid, []))) or '—'} |")
head = f"""# Licences: the recorded effect set (sfx v1)

Every sound in the new effect set is cut from these Freesound recordings. All {len(rows)} are **CC0 1.0** (public domain dedication: free
for any use, commercial included, no attribution required). They were found in laion/freesound-commercially-permissive-subset-with-captions
(Hugging Face; its clips marked "no attribution required") and each licence was then confirmed by Freesound id against
benjamin-paine/freesound-laion-640k, which names the licence of every clip (tools/audio/sfxv1/licheck.py; hfbatch/sfx/licences*.json in
the w5-xfer bucket). Crediting the uploaders isn't required; they're listed here with thanks.

No Stable Audio Open or MusicGen output is used. The Kenney CC0 recordings already in src/assets/sfx (CREDITS.txt there) are not used
by the new set.

{'**Not CC0 or not found: ' + ', '.join(bad) + '. These must be replaced before wiring.**' if bad else 'Not CC0 or not found: none.'}

| Freesound id | Uploader | Title | Licence | Used in (build.py) |
|---|---|---|---|---|
"""
open(out, 'w').write(head + '\n'.join(rows) + '\n')
print(len(rows), 'rows; not CC0:', bad)
