"""From a picked take to a game strip (hf-backdrops, 2026-10-31).

  key <take.png> <stem> <mid|near>            key the magenta out and join the ends (scripts/backdrop-strip.py, at the take's own size)
                                              -> reference/prop-sheets/qa-notes/hf-backdrops/keyed/<stem>-<part>.webp (pushed: the HD job
                                              reads it from GitHub)
  hdspec <out.json> <commit> <stem-part> ...  the native-resolution pass (tools/art/hfbatch/striphdgpu.py: Real-ESRGAN, then the style
                                              model at s25 in full-height tiles round the strip, so it stays seamless) to 1302 (mid) /
                                              1736 (near) tall, on grey
  finish <stem> <part> <hd dir> [mode]        cut2 (tools/art/hfbatch/striphdcut.py: the shape is the keyed strip's own, sharpened),
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


def hdspec(out, commit, names):
    sys.path.insert(0, str(H))
    from make_spec import MOODS, S
    what = {}
    for stem, w, g, mid, near, l in MOODS:
        what[f'{stem}-mid'] = f'{mid}, {l}'
        what[f'{stem}-near'] = f'{near}, {l}'
    style = ('slothadv style, painted storybook illustration, a wide side-scrolling game background layer, soft cel shading, thin dark '
             'outline, crisp clean hand-painted gouache brushwork with fine leaf, bark and stone detail, evenly lit, on one flat plain '
             'grey background, no text')
    items = [{'name': f'{n}-hd', 'pre': 'esrgan', 'h': 1736 if n.endswith('near') else 1302, 'strength': 0.25, 'seed': 7,
              'src': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/reference/prop-sheets/qa-notes/hf-backdrops/keyed/{n}.webp',
              'prompt': f'{style}. {what[n]}', 'bg': [128, 128, 128]} for n in names]
    spec = {'note': 'hf-backdrops native-resolution pass', 'loras': {'style': ['mshaffe111/slothadv-style-lora',
            'slothadv_style_v1.safetensors', 0.8]}, 'tw': 1024, 'items': items}
    Path(out).write_text(json.dumps(spec, indent=1))
    print(out, len(items))


def finish(stem, part, hd, mode='mix5'):
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
    subprocess.run([PY, '-I', str(H / 'haze.py'), str(tmp / 'edge.webp'), str(far), str(ROOT / f'src/assets/backdrops/{n}.webp'),
                    '0.18' if part == 'mid' else '0.08', '0.6' if part == 'mid' else '0.45'], check=True)


if __name__ == '__main__':
    c, a = sys.argv[1], sys.argv[2:]
    {'key': lambda: key(*a), 'hdspec': lambda: hdspec(a[0], a[1], a[2:]), 'finish': lambda: finish(*a)}[c]()
