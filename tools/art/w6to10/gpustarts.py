"""Run tools/art/w5/w5cpu.py (the bucket copy, /out/jobs/w5cpu.py) on a GPU job: its 4x Real-ESRGAN upscale of the atlas poses takes
1.5-3 min a frame on a CPU job, a second or two on the GPU. Patches, in memory only: no CPU torch install (the ostris/aitoolkit image
has CUDA torch), the upscaler on cuda, and the atlas reader also takes the World 5 creatures' -poses sheets. Same env as w5cpu.py."""
src = open('/out/jobs/w5cpu.py').read()
for old, new in [
    ("subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'torch', 'torchvision', '--index-url', 'https://download.pytorch.org/whl/cpu'], check=True)", "pass"),
    ("        exec(compile(src, str(up), 'exec'), g)",
     "        src = src.replace('.eval()', '.eval().cuda()').replace('.unsqueeze(0)', '.unsqueeze(0).cuda()')"
     ".replace('o = model(t[:, :, y0:y1, x0:x1])', 'o = model(t[:, :, y0:y1, x0:x1]).float().cpu()')\n"
     "        exec(compile(src, str(up), 'exec'), g)"),
    ("img = gh(f'src/assets/enemies/{name}-atlas.webp')",
     "img = gh(f'src/assets/enemies/{name}-' + ('poses' if name in ('dangler', 'seamstress', 'mantis', 'dozer', 'butler') else 'atlas') + '.webp')"),
]:
    assert old in src, old
    src = src.replace(old, new)
exec(compile(src, '/out/jobs/w5cpu.py', 'exec'), {'__name__': '__main__'})
