"""Run tools/art/w5/w5cpu.py (the copy in the bucket, /out/jobs/w5cpu.py) with its atlas reader pointed at the World 5 creatures'
pose sheets (src/assets/enemies/<c>-poses.webp) as well as the usual <c>-atlas.webp, so its "starts" task can cut their poses.
Same env as w5cpu.py (SPEC = the spec's bucket path)."""
src = open('/out/jobs/w5cpu.py').read()
old = "img = gh(f'src/assets/enemies/{name}-atlas.webp')"
assert old in src
src = src.replace(old, "img = gh(f'src/assets/enemies/{name}-' + ('poses' if name in ('dangler', 'seamstress', 'mantis', 'dozer', 'butler') else 'atlas') + '.webp')")
exec(compile(src, '/out/jobs/w5cpu.py', 'exec'), {'__name__': '__main__'})
