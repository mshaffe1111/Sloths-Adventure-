"""Build the test link and list what changed since the last PUBLISH.

    python3 tools/testlink/build.py "what this build adds"     build, check the file count, write the map
    python3 tools/testlink/build.py --published                after the publish succeeded: keep this build as what is live

1. Builds the game into tools/testlink/dist with vite.testlink.config.ts (the old filesmap.json is deleted first, so a failed build
   leaves no map to publish).
2. Appends an HTML comment to index.html naming the build (so every publish differs).
3. Counts the build's files and FAILS (exit 1, no map written) above MAX_FILES (480; the artifact holds at most 511 a version, R-165.252:
   link #3 built to 523 and was refused only at publish). The count is printed either way.
4. Writes tools/testlink/filesmap.json against tools/testlink/dist-published, the copy of the build that was LAST PUBLISHED (never the
   last local build: a build that was never published, e.g. a pre-build, made the next map miss what was live; D72): every new or
   changed file under assets/ mapped to its path, and every file that is live but not in this build mapped to null (removed).

Then publish with the Artifact tool:
    url        = https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb
    file_path  = <repo>/tools/testlink/dist/index.html
    root       = <repo>/tools/testlink
    files      = the contents of filesmap.json (keys are published paths like "assets/x.webp", values "dist/assets/x.webp" or null)
and once it is published, run `build.py --published` (it copies dist to dist-published). Never run it for a build that was not published.

On a fresh machine there is no dist-published, so the map lists every file and removes none; before that publish, list the artifact's
files (Artifact list, scope "files") and add every published path that is not in tools/testlink/dist to the map as null.
"""
import hashlib, json, shutil, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
# (the artifact takes at most 511 files a version; 480 leaves room for the page and a round's growth, R-165.252)
MAX_FILES = 480


def md5s(root: Path) -> dict:
    if not root.exists():
        return {}
    return {str(p.relative_to(root)): hashlib.md5(p.read_bytes()).hexdigest() for p in root.rglob('*') if p.is_file()}


def count_files(dist: Path) -> int:
    """every file the artifact will hold after this publish: the build's files (its index.html is the page)"""
    return sum(1 for p in dist.rglob('*') if p.is_file())


def files_map(dist: Path, published: Path) -> dict:
    """the Artifact `files` map: new or changed against the published copy -> 'dist/<path>', live but gone -> None (index.html is the page)"""
    a, b = md5s(dist), md5s(published)
    m = {k: f'dist/{k}' for k, v in a.items() if b.get(k) != v and k != 'index.html'}
    for k in b:
        if k not in a and k != 'index.html':
            m[k] = None
    return m


def pack_audio(dist: Path) -> None:
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


def finish(here: Path, note: str, max_files: int = MAX_FILES) -> int:
    """after the vite build: name it, check the count, write the map against the published copy; 0 = ready to publish, 1 = refused"""
    dist, published = here / 'dist', here / 'dist-published'
    with open(dist / 'index.html', 'a') as f:
        f.write(f'\n<!-- test build: {note} -->\n')
    n = count_files(dist)
    if n > max_files:
        print(f'test link: FAIL: {n} files, over the {max_files} limit (the artifact holds at most 511 a version); no map written. '
              'Inline more small files (vite.testlink.config.ts) or pack them before publishing.')
        return 1
    print(f'test link: {n} files (limit {max_files})')
    if not published.exists():
        print('test link: no dist-published (a fresh machine): the map lists every file and removes none; add every live path not in '
              'dist as null first (Artifact list, scope "files"), and run build.py --published once it is published')
    m = files_map(dist, published)
    (here / 'filesmap.json').write_text(json.dumps(m, indent=1))
    print(f'{sum(v is not None for v in m.values())} new/changed, {sum(v is None for v in m.values())} removed against the last publish '
          '-> tools/testlink/filesmap.json')
    # the published page is work-index.html (the Artifact's page): always the fresh build's index.html, so the page never points at
    # assets this publish removes (2026-10-29: a stale page loaded a blank screen on Matt's phone)
    shutil.copyfile(dist / 'index.html', here / 'work-index.html')
    print('work-index.html refreshed from dist/index.html')
    return 0


def mark_published(here: Path) -> int:
    """the publish succeeded: this build is what is live now (the next map diffs against it)"""
    dist, published = here / 'dist', here / 'dist-published'
    if not (dist / 'index.html').exists():
        print('test link: no build in dist to mark published')
        return 1
    if published.exists():
        shutil.rmtree(published)
    shutil.copytree(dist, published)
    print(f'test link: dist-published now holds this build ({count_files(published)} files)')
    return 0


def vite_build() -> None:
    subprocess.run(['npx', 'vite', 'build', '-c', 'tools/testlink/vite.testlink.config.ts'], cwd=REPO, check=True)


def main(argv: list, here: Path = HERE, build=vite_build) -> int:
    """(`here` and `build` are the test's: tools/testlink/build.test.ts runs the whole flow on a folder of its own, with no vite)"""
    if '--published' in argv:
        return mark_published(here)
    args = [a for a in argv[1:] if not a.startswith('--')]
    note = args[0] if args else 'test build'
    # (no map from an earlier build is left to publish if this one fails)
    (here / 'filesmap.json').unlink(missing_ok=True)
    dist = here / 'dist'
    if dist.exists():
        shutil.rmtree(dist)
    build()
    pack_audio(dist)
    return finish(here, note)


if __name__ == '__main__':
    sys.exit(main(sys.argv))
