"""World 5 creature prep and packing, run as a CPU job on Hugging Face (2026-10-26).

The session machine cannot download from Hugging Face (the proxy blocks it) and the connector's token cannot write the game's HF repos,
so the job reads the clips from mshaffe111/slothadv-gen and writes everything to the bucket mshaffe111/w5-xfer, mounted at /out
(volumes: ["hf://buckets/mshaffe111/w5-xfer:/out:rw"]). Pictures come back to the session exactly with hf_fs `attach` (it saves the
file under the session's tool-results folder); text with `cat`. Contact sheets go to `stills/w5c-*.jpg`.

env SPEC = a spec in the bucket (jobs/<spec>.json, its "tasks"), or TASKS_B64 = [task, ...]; each task is one of:
  {"do": "sheet", "clip": name}                         contact sheet of a clip, every frame numbered -> stills/w5c-sheet-<clip>.jpg
  {"do": "starts", "atlas": "queen", "frames": [...], "tag": "w5q"}
        start pictures for Wan/edit jobs from the game's own atlas frames, exactly as reanim/extract.py makes them (4x Real-ESRGAN anime
        6B, on a 1024 square of flat grey at 80%), -> stills/<tag>-<frame>.png, and their meta (start px = old px * f + (ox, oy))
        -> stills/<tag>-meta.json. "atlas": "meeca" cuts from src/assets/characters/meeca-standard.webp.
  {"do": "packall", "creature": c, "up": 1.6, "key": "default"|"tight", "seqs": {seq: [clip, [frames] | "all"]}, "meta": {...}?,
   "out": name}
        runs the repo's own reanim/pack.py on the clips and writes xfer/<out>-anim.webp (+ .b64.txt) and xfer/<out>AnimData.ts.
        Extra meta (for start pictures that are not in reanim/meta.json; "meta" inline, or "meta_from": {key: [bucket json, key]})
        is merged in; clips made by w5gpu.py are read from the bucket's clips/. A clip's meta key is its name minus the
        leading 3 characters and the -s<seed> (pack.py start_of), so name clips "<tg>-<creature>-<frame>-s<seed>".
  {"do": "xfer", "path": "stills/x.png"}                 base64 of any repo file -> xfer/<basename>.b64.txt
  {"do": "carry", "files": [bucket paths], "out": "xfer/x.carrier.png"}  files packed into one lossless PNG (unpack_carrier.py)
  packall also writes xfer/<out>.carrier.png holding the sheet and its data file.
The repo's tools come from GitHub (the game repo is public): tools/art/reanim/pack.py, meta.json and tools/art/train/clips.py.
"""
import base64, hashlib, io, json, os, subprocess, sys, urllib.request, zipfile
from pathlib import Path

subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'pillow', 'numpy', 'scipy', 'huggingface_hub'], check=True)
import numpy as np  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402
from huggingface_hub import hf_hub_download  # noqa: E402

tok = os.environ['HF_TOKEN']
REPO = 'mshaffe111/slothadv-gen'
# the job's token can read the game's HF repos but not write them, so results go to a bucket mounted read-write at /out
# (volumes: hf://buckets/mshaffe111/w5-xfer:/out:rw)
OUT = Path(os.environ.get('OUT', '/out'))


def put(path, data):
    p = OUT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    print('PUT', path, len(data), flush=True)

GH = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/' + os.environ.get('GH_REF', 'main') + '/'
if os.environ.get('SPEC'):
    # the spec file uploaded next to the script (jobs/w5/<spec>.json): its "tasks"
    TASKS = json.loads((OUT / os.environ['SPEC']).read_text())['tasks']
else:
    TASKS = json.loads(base64.b64decode(os.environ['TASKS_B64']).decode())
W = Path('/w')


def gh(path):
    dst = W / path
    if not dst.exists():
        dst.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(GH + path, dst)
    return dst


def up_text(text, path):
    put(path, text.encode())


def up_bin_as_text(data, name):
    put(f'xfer/{name}', data)
    up_text(base64.b64encode(data).decode(), f'xfer/{name}.b64.txt')
    print('SHA', name, hashlib.sha256(data).hexdigest(), len(data), flush=True)


def clip_frames(clip):
    d = W / 'tools/art/gen/clips' / clip
    if not d.exists():
        d.mkdir(parents=True)
        z = OUT / 'clips' / f'{clip}.zip'  # a clip made by w5gpu.py sits in the bucket
        with zipfile.ZipFile(z if z.exists() else hf_hub_download(REPO, f'clips/{clip}.zip', token=tok)) as z:
            z.extractall(d)
    return sorted(d.glob(f'{clip}_*.png'))


def sheet(clip):
    fs = clip_frames(clip)
    ims = [Image.open(f).convert('RGB') for f in fs]
    tw = 220
    th = round(ims[0].height * tw / ims[0].width)
    cols = 7
    rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (cols * tw, rows * th + 24), (40, 40, 40))
    d = ImageDraw.Draw(S)
    d.text((6, 4), clip, fill=(255, 255, 255))
    for i, im in enumerate(ims):
        x, y = (i % cols) * tw, 24 + (i // cols) * th
        S.paste(im.resize((tw, th), Image.LANCZOS), (x, y))
        d.rectangle((x, y, x + 22, y + 13), fill=(0, 0, 0))
        d.text((x + 2, y + 1), str(i), fill=(255, 255, 0))
    b = io.BytesIO(); S.save(b, 'JPEG', quality=82)
    put(f'stills/w5c-sheet-{clip}.jpg', b.getvalue())
    print('SHEET', clip, len(ims), flush=True)


UPSCALER = None


def upscale(im):
    global UPSCALER
    if UPSCALER is None:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'torch', 'torchvision', '--index-url', 'https://download.pytorch.org/whl/cpu'], check=True)
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'spandrel'], check=True)
        pth = W / 'anime6b.pth'
        urllib.request.urlretrieve('https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth', pth)
        up = gh('tools/art/upscale/up.py')
        src = up.read_text().split('for i in range(0, len(pairs), 2):')[0].replace('model_path, *pairs = sys.argv[1:]', f'model_path, pairs = {str(pth)!r}, []')
        g = {}
        exec(compile(src, str(up), 'exec'), g)
        UPSCALER = g['run']
    alpha = im.getchannel('A')
    big = UPSCALER(im)
    big.putalpha(alpha.resize(big.size, Image.LANCZOS))
    return big


def atlas_frames(name):
    import re
    if name == 'meeca':
        src = gh('src/game/meecaStandardData.ts').read_text()
        img = gh('src/assets/characters/meeca-standard.webp')
        pat = r'(\w+): \{ x: ([\d.]+), y: ([\d.]+), w: ([\d.]+), h: ([\d.]+), ax: ([\d.]+), ay: ([\d.]+)'
    else:
        src = gh(f'src/game/{name}AtlasData.ts').read_text()
        img = gh(f'src/assets/enemies/{name}-atlas.webp')
        pat = r'"(\w+)": \{"x": ([\d.]+), "y": ([\d.]+), "w": ([\d.]+), "h": ([\d.]+), "ax": ([\d.]+), "ay": ([\d.]+)'
    fr = {m.group(1): dict(zip(('x', 'y', 'w', 'h', 'ax', 'ay'), (float(v) for v in m.groups()[1:]))) for m in re.finditer(pat, src)}
    return Image.open(img).convert('RGBA'), fr


def starts(t):
    atlas, fr = atlas_frames(t['atlas'])
    tag = t['tag']
    meta = {}
    thumbs = []
    for n in t['frames']:
        f = fr[n]
        x, y, w, h = (int(f[k]) for k in ('x', 'y', 'w', 'h'))
        crop = atlas.crop((x, y, x + w, y + h))
        big = upscale(crop)
        upf = big.width / w
        s = 819 / max(big.size)
        big = big.resize((round(big.width * s), round(big.height * s)), Image.LANCZOS)
        ox, oy = (1024 - big.width) // 2, (1024 - big.height) // 2
        c2 = Image.new('RGBA', (1024, 1024), (127, 127, 127, 255))
        c2.alpha_composite(big, (ox, oy))
        c2 = c2.convert('RGB')
        b = io.BytesIO(); c2.save(b, 'PNG')
        put(f'stills/{tag}-{n}.png', b.getvalue())
        meta[f'{t["atlas"]}-{n}'] = dict(creature=t['atlas'], frame=n, **f, f=upf * s, ox=ox, oy=oy)
        thumbs.append(c2.resize((256, 256), Image.LANCZOS))
        print('START', tag, n, flush=True)
    up_text(json.dumps(meta, indent=1), f'stills/{tag}-meta.json')
    cols = 6
    S = Image.new('RGB', (cols * 256, ((len(thumbs) + cols - 1) // cols) * 256), (40, 40, 40))
    for i, im in enumerate(thumbs):
        S.paste(im, ((i % cols) * 256, (i // cols) * 256))
    b = io.BytesIO(); S.save(b, 'JPEG', quality=85)
    put(f'stills/w5c-starts-{tag}.jpg', b.getvalue())


def packall(t):
    pack = gh('tools/art/reanim/pack.py')
    gh('tools/art/train/clips.py')
    mp = gh('tools/art/reanim/meta.json')
    m = json.loads(mp.read_text())
    m.update(t.get('meta', {}))
    # meta_from: {meta key: [bucket json, key in it]}: a clip's start picture made by the "starts" task (or an edit given its own entry)
    for k, (f, k2) in t.get('meta_from', {}).items():
        m[k] = json.loads((OUT / f).read_text())[k2]
    mp.write_text(json.dumps(m))
    seqs = {}
    for seq, (clip, idx) in t['seqs'].items():
        fs = clip_frames(clip)
        seqs[seq] = [clip, list(range(len(fs))) if idx == 'all' else idx]
    (W / 'src/assets/enemies').mkdir(parents=True, exist_ok=True)
    (W / 'src/game').mkdir(parents=True, exist_ok=True)
    env = dict(os.environ, UP=str(t.get('up', 1.5)))
    if t.get('key') == 'tight':
        env['KEY'] = 'tight'
    c = t['creature']
    subprocess.run([sys.executable, str(pack), c, json.dumps(seqs)], check=True, env=env)
    out = t.get('out', c)
    up_bin_as_text((W / f'src/assets/enemies/{c}-anim.webp').read_bytes(), f'{out}-anim.webp')
    up_text((W / f'src/game/{c}AnimData.ts').read_text(), f'xfer/{out}AnimData.ts')
    put(f'xfer/{out}.carrier.png', carrier([(f'{out}-anim.webp', (W / f'src/assets/enemies/{c}-anim.webp').read_bytes()),
                                             (f'{out}AnimData.ts', (W / f'src/game/{c}AnimData.ts').read_bytes())]))


def carrier(files):
    """several files packed losslessly into one greyscale PNG (hf_fs `attach` brings a picture back byte for byte; `unpack_carrier.py`
    reads it): a JSON header line [[name, size], ...] then the bytes, one per pixel, 2048 wide"""
    head = json.dumps([[n, len(b)] for n, b in files]).encode() + b'\n'
    data = head + b''.join(b for _, b in files)
    w = 2048
    h = (len(data) + w - 1) // w
    arr = np.zeros(w * h, np.uint8)
    arr[:len(data)] = np.frombuffer(data, np.uint8)
    b = io.BytesIO(); Image.fromarray(arr.reshape(h, w), 'L').save(b, 'PNG', optimize=False, compress_level=9)
    return b.getvalue()


def carry(t):
    """{"do": "carry", "files": [bucket paths], "out": "xfer/<name>.carrier.png"}"""
    put(t['out'], carrier([(Path(f).name, (OUT / f).read_bytes()) for f in t['files']]))


def xfer(t):
    p = hf_hub_download(REPO, t['path'], token=tok)
    up_bin_as_text(Path(p).read_bytes(), Path(t['path']).name)


for t in TASKS:
    try:
        {'sheet': lambda t: sheet(t['clip']), 'starts': starts, 'packall': packall, 'xfer': xfer, 'carry': carry}[t['do']](t)
    except Exception as e:
        import traceback; traceback.print_exc()
        print('FAILED', json.dumps(t)[:200], repr(e)[:300], flush=True)
print('ALL_DONE', flush=True)
