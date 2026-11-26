"""ART-NEXT batch 1, in the sandbox: pack each PIECE's takes the moment they are all done (the countermeasure for a lost sandbox
token, 11-20: a lost token costs one piece at most). Watches /w/hfpokey/edits; per group writes /w/<group>.tar (WebP q88) split into
95 KB parts by sbx.py, then /w/READY-<group> with the part count. Exits when every group is packed or /w/GEN_DONE exists (then packs
whatever is there, marked PARTIAL)."""
import glob, os, subprocess, tarfile, time, json
from PIL import Image
spec = json.load(open(os.environ.get("SPECF", "/w/hfpokey/jobs/spec-b1.json")))
groups = {}
for it in spec['edits']:
    g = it['name'].split('-')[0].rstrip('B') if not it['name'].endswith('B') else it['name'][:-1]
    g = {'letter': 'letters', 'reply': 'letters'}.get(g, g)
    groups.setdefault(g, []).extend(f"/w/hfpokey/edits/{it['name']}-s{s}.png" for s in it['seeds'])
done = set()
def pack(g, files, partial=False):
    os.makedirs(f'/w/t/{g}', exist_ok=True)
    for f in files:
        Image.open(f).save(f'/w/t/{g}/' + os.path.basename(f)[:-4] + '.webp', quality=88, method=6)
    with tarfile.open(f'/w/{g}.tar', 'w') as t:
        t.add(f'/w/t/{g}', arcname=g)
    n = subprocess.run(['python', '/w/sbx.py', 'parts', f'/w/{g}.tar'], capture_output=True, text=True).stdout.strip()
    open(f'/w/READY-{g}', 'w').write(f"{n}{' PARTIAL' if partial else ''}\n")
    print('READY', g, n, 'parts', len(files), 'takes', flush=True)
while len(done) < len(groups):
    for g, fs in groups.items():
        if g not in done and all(os.path.exists(f) for f in fs):
            time.sleep(2); pack(g, fs); done.add(g)
    if os.path.exists('/w/GEN_DONE'):
        for g, fs in groups.items():
            if g not in done:
                have = [f for f in fs if os.path.exists(f)]
                if have: pack(g, have, True)
                done.add(g)
    time.sleep(5)
open('/w/PACK_DONE', 'w').write('ok\n')
