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
