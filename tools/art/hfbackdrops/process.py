"""From a picked take to a game strip (hf-backdrops, 2026-10-31).

  key <take.png> <stem> <mid|near>            key the magenta out and join the ends (scripts/backdrop-strip.py, at the take's own size)
                                              -> reference/prop-sheets/qa-notes/hf-backdrops/keyed/<stem>-<part>.webp (pushed: the HD job
                                              reads it from GitHub)
  hdspec <out.json> <commit> <stem-part> ...  the native-resolution pass (tools/art/hfbatch/striphdgpu.py: Real-ESRGAN, then the style
                                              model at s25 in full-height tiles round the strip, so it stays seamless) to 1302 (mid) /
                                              1736 (near) tall, on grey
  finish <stem> <part> <hd dir> [mode] [haze]      cut2 (tools/art/hfbatch/striphdcut.py: the shape is the keyed strip's own, sharpened),
                                              tools/art/edges/defringe.py (ink line; a middle strip's top 7% faded), then haze.py into
                                              the far strip's light -> src/assets/backdrops/<stem>-<part>.webp
"""
import importlib.util, json, subprocess, sys
from pathlib import Path

H = Path(__file__).resolve().parent
ROOT = H.parents[2]
KEYED = ROOT / 'reference/prop-sheets/qa-notes/hf-backdrops/keyed'
PY = sys.executable


def mod(p, name):
    spec = importlib.util.spec_from_file_location(name, p)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m


def key(take, stem, part):
    KEYED.mkdir(parents=True, exist_ok=True)
    out = KEYED / f'{stem}-{part}.webp'
    done = ROOT / 'scripts/strip-seamless.done'
    before = done.read_text()
    subprocess.run([PY, str(ROOT / 'scripts/backdrop-strip.py'), take, str(out), part, '1'], check=True)
    done.write_text(before)  # (a working file, not a game strip: it is not listed as made seamless)


def keyfull(take, stem, part):
    """key at the take's full width, no margin cut: for a take whose ends are already clear (the paste-up left open ground at the
    ends), so it tiles with no join at all and keeps its width (backdrop-strip.py's margin cut left some strips 1272-1571 px wide,
    which repeat twice across a sideways screen)"""
    import numpy as np
    from PIL import Image
    bs = mod(ROOT / 'scripts/backdrop-strip.py', 'bs')
    a = np.asarray(Image.open(take).convert('RGB')).astype(float)
    rgb, al = bs.key_out(a, bs.key_colour(a))
    # (no margin cut: the ends are joined over a 256 px band at the full width, so the strip keeps ~1790 of its 2048 px)
    rgba = np.concatenate([rgb, al[..., None]], axis=-1)
    o = bs.seamless(rgba, 256)
    # (hf-backdrops2: nothing may float: a crown blob or loose leaves the repaint cut off from its tree are dropped, every shape kept
    # is joined to the strip's bottom rows)
    from scipy import ndimage
    lab, n = ndimage.label(o[..., 3] > 0.25)
    keep = np.isin(lab, list(set(np.unique(lab[-max(8, lab.shape[0] // 12):])) - {0}))
    o[..., 3] *= ndimage.binary_dilation(keep, iterations=3)
    KEYED.mkdir(parents=True, exist_ok=True)
    out = KEYED / f'{stem}-{part}.webp'
    Image.fromarray(np.dstack([np.clip(o[..., :3], 0, 255), np.clip(o[..., 3] * 255, 0, 255)]).astype(np.uint8), 'RGBA').save(out, 'WEBP', quality=88, method=6)
    print(out.name, 'full width', a.shape[1], '->', o.shape[1])


def tallkey(take, stem):
    """a text-to-image far + sky picture (make_spec2.py F): joined end to end (no key, it is opaque) -> keyed/<stem>-tall.webp"""
    import numpy as np
    from PIL import Image
    bs = mod(ROOT / 'scripts/backdrop-strip.py', 'bs')
    a = np.asarray(Image.open(take).convert('RGB')).astype(float)
    rgba = np.concatenate([a, np.ones(a.shape[:2] + (1,))], axis=-1)
    o = bs.seamless(rgba, 320)
    KEYED.mkdir(parents=True, exist_ok=True)
    out = KEYED / f'{stem}-tall.webp'
    Image.fromarray(np.clip(o[..., :3], 0, 255).astype(np.uint8)).save(out, 'WEBP', quality=92, method=6)
    print(out.name, a.shape[1], '->', o.shape[1])


def tallsplit(stem, hd):
    """the native-resolution tall picture -> <stem>-far.webp (the bottom 1302 rows) and <stem>-sky.webp (hfbatch/skycut.py --tall)"""
    from PIL import Image
    im = Image.open(Path(hd) / f'{stem}-tall-hd.webp').convert('RGB')
    Hf = 1302
    far = im.crop((0, im.height - Hf, im.width, im.height))
    if far.width > 4096:
        far = far.resize((4096, round(Hf * 4096 / far.width)), Image.LANCZOS)
    q = 88
    while True:
        p = ROOT / f'src/assets/backdrops/{stem}-far.webp'
        far.save(p, 'WEBP', quality=q, method=6)
        if p.stat().st_size < 250_000 or q <= 60:
            break
        q -= 6
    E = int(round(Hf * 0.35 / 16) * 16)
    take = Path('/tmp') / f'hfbd-{stem}-skytake.webp'
    im.crop((0, im.height - Hf - E, im.width, im.height)).save(take, 'WEBP', quality=95)
    subprocess.run([PY, '-I', str(ROOT / 'tools/art/hfbatch/skycut.py'), '--tall', f'{stem}={take}'], check=True)
    print(p.name, far.size, p.stat().st_size // 1024, 'KB q', q)


def hdspec(out, commit, names):
    sys.path.insert(0, str(H))
    from make_spec import MOODS, S
    what = {}
    for stem, w, g, mid, near, l in MOODS:
        what[f'{stem}-mid'] = f'{mid}, {l}'
        what[f'{stem}-near'] = f'{near}, {l}'
    import make_spec2  # (hf-backdrops2: round R's and round M's strips, and the far + sky pictures)
    for r in make_spec2.R + make_spec2.M:
        d, l = make_spec2.what(r[0], r[7], r[8])
        what[r[0]] = f'{d}, {l}'
    for st, w, g, far, *_r, l, trim in make_spec2.MOODS2:
        what[f'{st}-tall'] = f'{far}, {l}, open sky above, the far scenery below'
    style = ('slothadv style, painted storybook illustration, a wide side-scrolling game background layer, soft cel shading, thin dark '
             'outline, crisp clean hand-painted gouache brushwork with fine leaf, bark and stone detail, evenly lit, on one flat plain '
             'grey background, no text')
    HT = {'near': 1736, 'mid': 1302, 'tall': 1760}
    items = [{'name': f'{n}-hd', 'pre': 'esrgan', 'h': HT[n.rsplit('-', 1)[1]], 'strength': 0.25, 'seed': 7,
              'src': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/reference/prop-sheets/qa-notes/hf-backdrops/keyed/{n}.webp',
              'prompt': f'{style}. {what[n]}', 'bg': [128, 128, 128]} for n in names]
    spec = {'tag': Path(out).stem.replace('spec-', 'hfbd2-'), 'note': 'hf-backdrops native-resolution pass', 'loras': {'style': ['mshaffe111/slothadv-style-lora',
            'slothadv_style_v1.safetensors', 0.8]}, 'tw': 1024, 'items': items}
    Path(out).write_text(json.dumps(spec, indent=1))
    print(out, len(items))


def finish(stem, part, hd, mode='mix5', haze=None):
    hd = Path(hd)
    cutm = mod(ROOT / 'tools/art/hfbatch/striphdcut.py', 'shc')
    n = f'{stem}-{part}'
    tmp = Path('/tmp') / f'hfbd-{n}'
    tmp.mkdir(exist_ok=True)
    cutm.cut2(str(KEYED / f'{n}.webp'), str(hd / f'{n}-hd.webp'), str(hd / f'alpha-{n}.webp'), str(tmp / 'cut.webp'),
              str(hd / f'pre-{n}-hd.webp'), mode)
    args = [PY, '-I', str(ROOT / 'tools/art/edges/defringe.py'), str(tmp / 'cut.webp'), str(tmp / 'edge.webp'), '--scale', '1',
            '--ink', '--px', '1.5' if part == 'mid' else '2']
    if part == 'mid':
        args += ['--topfade', '0.07']
    subprocess.run(args, check=True)
    far = ROOT / f'src/assets/backdrops/{stem}-far.webp'
    if not far.exists():  # (w1c, the canopy set, has no far strip of its own: its world's)
        import re
        far = ROOT / f"src/assets/backdrops/w{re.match(r'w(\d+)', stem).group(1)}-far.webp"
    subprocess.run([PY, '-I', str(H / 'haze.py'), str(tmp / 'edge.webp'), str(far), str(ROOT / f'src/assets/backdrops/{n}.webp'),
                    haze or ('0.18' if part == 'mid' else '0.08'), '0.6' if part == 'mid' else '0.45'], check=True)


if __name__ == '__main__':
    c, a = sys.argv[1], sys.argv[2:]
    {'key': lambda: key(*a), 'keyfull': lambda: keyfull(*a), 'hdspec': lambda: hdspec(a[0], a[1], a[2:]), 'finish': lambda: finish(*a), 'tallkey': lambda: tallkey(*a),
     'tallsplit': lambda: tallsplit(*a)}[c]()
