"""Build the test link and list what changed since the last publish.

    python3 tools/testlink/build.py "what this build adds"

1. Moves the last build to tools/testlink/dist-prev.
2. Builds the game into tools/testlink/dist with vite.testlink.config.ts.
3. Appends an HTML comment to index.html naming the build (so every publish differs).
4. Writes tools/testlink/filesmap.json: every new or changed file under assets/ mapped to its path, and every file that existed in
   the previous build but not this one mapped to null (removed from the artifact).

Then publish with the Artifact tool:
    url        = https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb
    file_path  = <repo>/tools/testlink/dist/index.html
    root       = <repo>/tools/testlink
    files      = the contents of filesmap.json (keys are published paths like "assets/x.webp", values "dist/assets/x.webp" or null)

The artifact holds at most 511 files per version. If a publish is refused for size, list the artifact's files (Artifact list,
scope "files") and add every published path that is not in tools/testlink/dist to the map as null. Old index-*.js, index-*.css and
orchLoader-*.js copies pile up fastest.

On a fresh machine there is no dist-prev, so the first run maps every file; that first publish needs the stale-file cleanup above.
"""
import hashlib, json, os, shutil, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
note = sys.argv[1] if len(sys.argv) > 1 else 'test build'
dist, prev = HERE / 'dist', HERE / 'dist-prev'
if prev.exists():
    shutil.rmtree(prev)
if dist.exists():
    dist.rename(prev)
subprocess.run(['npx', 'vite', 'build', '-c', 'tools/testlink/vite.testlink.config.ts'], cwd=REPO, check=True)
# the music samples (260-odd small mp3s) go into one pack file, served to the game's fetch() by a few lines in index.html, so the
# artifact stays under its 511-file limit (test link only: the real game and its offline cache are untouched)
# (2026-11-01: the music .webm files too, one pack per type: the new art pushed the build past the artifact's 511 files)
index = {}
for ext, mime in (('mp3', 'audio/mpeg'), ('webm', 'audio/webm')):
    files = sorted((dist / 'assets').glob(f'*.{ext}'))
    if not files:
        continue
    # (packs of at most 15 MB: the artifact takes no single file over 16 MB)
    def flush(blob, part):
        pack = f'audio-pack-{hashlib.md5(blob).hexdigest()[:8]}.{ext}'  # (a joined file of one type keeps a type the artifact accepts)
        (dist / 'assets' / pack).write_bytes(blob)
        for name, (off, ln) in part.items():
            index[name] = [pack, off, ln, mime]
    blob, part = bytearray(), {}
    for p in files:
        data = p.read_bytes()
        if blob and len(blob) + len(data) > 15_000_000:
            flush(blob, part)
            blob, part = bytearray(), {}
        part[p.name] = [len(blob), len(data)]
        blob += data
        p.unlink()
    flush(blob, part)
if index:
    shim = ('<script>(function(){var I=' + json.dumps(index, separators=(',', ':')) + ',P={},F=window.fetch.bind(window);'
            'window.fetch=function(u,o){var s=typeof u==="string"?u:(u&&u.url)||"",n=s.split("?")[0].split("/").pop(),e=I[n];'
            'if(!e)return F(u,o);P[e[0]]=P[e[0]]||F("./assets/"+e[0]).then(function(r){return r.arrayBuffer()});'
            'return P[e[0]].then(function(b){return new Response(b.slice(e[1],e[1]+e[2]),{status:200,headers:{"content-type":e[3]}})})};})();</script>')
    html = (dist / 'index.html').read_text()
    (dist / 'index.html').write_text(html.replace('<head>', '<head>\n    ' + shim, 1))
with open(dist / 'index.html', 'a') as f:
    f.write(f'\n<!-- test build: {note} -->\n')


def md5s(root: Path):
    if not root.exists():
        return {}
    return {str(p.relative_to(root)): hashlib.md5(p.read_bytes()).hexdigest() for p in root.rglob('*') if p.is_file()}


a, b = md5s(dist), md5s(prev)
m = {k: f'dist/{k}' for k, v in a.items() if b.get(k) != v and k != 'index.html'}
for k in b:
    if k not in a:
        m[k] = None
(HERE / 'filesmap.json').write_text(json.dumps(m, indent=1))
print(f'{sum(v is not None for v in m.values())} new/changed, {sum(v is None for v in m.values())} removed -> tools/testlink/filesmap.json')
# the published page is work-index.html (the Artifact's page): always the fresh build's index.html, so the page never points at
# assets this publish removes (2026-10-29: a stale page loaded a blank screen on Matt's phone)
shutil.copyfile(dist / 'index.html', HERE / 'work-index.html')
print('work-index.html refreshed from dist/index.html')
