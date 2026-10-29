"""The title pair, Pokey and Meeca, animated for real (Matt, 2026-10-28: "polish the actual Pokey and Meeca so they're not just twitching
around"), as GPU jobs on Hugging Face (bucket mshaffe111/w5-xfer at /out; outputs like tools/art/anim/animgpu.py under w6to10/clips/,
starts under w6to10/starts/).

Starts are the game's own title frames: Pokey's title-idle (src/assets/hero/title-idle.webp) and Meeca's idle from her standard sheet
(meeca-standard.webp + meecaStandardData.ts), fetched from the public GitHub repo, upscaled 4x with Real-ESRGAN anime 6B on the GPU
(tools/art/upscale/up.py's model), and laid on the pipeline's flat grey at ONE scale with their feet on ONE ground line, so every clip
cuts together (the pair start is both of them side by side the same way). Wan 2.2 I2V with the motion model then moves them.

env: SUB (w6to10), PART/PARTS, ONLY (moves), SEEDS, MOTION_SCALE (0 = no motion model; clip names get -m<10x scale>), DRY=1
(starts only), NOSTARTS=1 (reuse the starts in the bucket). Locally: DRY=1 NOUP=1 OUT=<dir> REPO=<repo root> python3 titlegpu.py (layout check).
"""
import json, os, re, runpy, subprocess, sys, urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(os.environ.get('OUT', '/out'))
SUB = os.environ.get('SUB', 'w6to10')
REPO = os.environ.get('REPO')
GH = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/main/'
W = Path('/tmp/title')
GREY = (200, 200, 200)
FIG_H = 0.74   # Pokey's height as a share of the clip height (Meeca is drawn at the same world scale, so a little shorter)
GROUND = 0.90  # the ground line, as a share of the clip height
M = 'slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion, '
POKEY = 'a friendly young brown sloth with a cream face, dark eye patches, a brown satchel on a strap across his chest and wrapped wrists, '
MEECA = 'a cheerful young girl sloth in a pink headband, a pink race vest with the number 07 and teal shorts, '
END = ', his feet stay planted on the same spot, the camera does not move, he stays in the middle of the frame'
ENDF = END.replace('his feet', 'her feet').replace('he stays', 'she stays')
SQ, PAIR = (704, 704), (832, 576)
MOVES = {
    'pokey-idle': ('pokey', SQ, POKEY + 'stands in place breathing slowly and calmly, shifting his weight gently from one foot to the other and back, a smooth repeating idle' + END),
    'meeca-idle': ('meeca', SQ, MEECA + 'stands in place full of energy with a small happy bounce in her knees, a smooth repeating idle' + ENDF),
    'pokey-look': ('pokey', SQ, POKEY + 'blinks slowly, turns his head to look over to the right as if at a friend standing beside him, smiles, then turns his head back to the front' + END),
    'meeca-wave': ('meeca', SQ, MEECA + 'waves happily at the camera with one hand, then lowers her hand back down to her side' + ENDF),
    'pokey-cheer': ('pokey', SQ, POKEY + 'throws both arms up high in a happy cheer, then lowers them back down to his sides' + END),
    # second try at the idles (the first two came out as walks: the motion model leans to walking when told about feet and weight):
    # no talk of stepping, run with less or none of the motion model (MOTION_SCALE)
    'pokey-idle2': ('pokey', SQ, POKEY + 'stands still in one place and breathes slowly, his chest and belly gently rising and falling, his arms hanging relaxed, he blinks once, his legs do not move at all, a calm repeating idle, the camera does not move'),
    'meeca-idle2': ('meeca', SQ, MEECA + 'stands in one place, bright and full of energy, bobbing gently up and down on the spot with a tiny happy bounce, her arms swinging a little, she never takes a step, a repeating idle, the camera does not move'),
    'pair-laugh': ('pair', PAIR, 'two young sloth friends standing side by side, on the left ' + POKEY + 'on the right ' + MEECA +
                   'she nudges him playfully with her elbow, they turn to look at each other and laugh together, then both face the front again, '
                   'their feet stay planted, the camera does not move'),
}
SEEDS = (3, 11)


def fetch(path):
    if REPO:
        return Path(REPO) / path
    dst = W / path
    if not dst.exists():
        dst.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(GH + path, dst)
    return dst


def upscaler():
    if os.environ.get('NOUP'):  # a local layout check without torch: plain 4x resize
        return lambda im: im.resize((im.width * 4, im.height * 4), Image.LANCZOS)
    import torch
    from spandrel import ModelLoader
    pth = W / 'anime6b.pth'
    if not pth.exists():
        pth.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve('https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth', pth)
    dev = 'cpu' if os.environ.get('CPU') else 'cuda'
    model = ModelLoader().load_from_file(str(pth)).eval().to(dev)

    def run(im):
        rgb = np.asarray(im.convert('RGB')).astype(np.float32) / 255.0
        t = torch.from_numpy(rgb).permute(2, 0, 1).unsqueeze(0).to(dev)
        with torch.no_grad():
            o = model(t).float().cpu()
        big = Image.fromarray((o.squeeze(0).permute(1, 2, 0).clamp(0, 1).numpy() * 255).round().astype(np.uint8))
        big.putalpha(im.getchannel('A').resize(big.size, Image.LANCZOS))
        return big
    return run


def trim(im):
    a = np.asarray(im.getchannel('A')) > 16
    ys, xs = np.nonzero(a)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def starts():
    up = upscaler()
    pokey = trim(up(Image.open(fetch('src/assets/hero/title-idle.webp')).convert('RGBA')))
    src = fetch('src/game/meecaStandardData.ts').read_text()
    g = [int(float(v)) for v in re.search(r'\bidle: \{ x: ([\d.]+), y: ([\d.]+), w: ([\d.]+), h: ([\d.]+)', src).groups()]
    sheet = Image.open(fetch('src/assets/characters/meeca-standard.webp')).convert('RGBA')
    meeca = trim(up(sheet.crop((g[0], g[1], g[0] + g[2], g[1] + g[3]))))
    # one world scale for both: in the game the hero and Meeca are about the same height (her frames carry the headband)
    out = ROOT / SUB / 'starts'
    out.mkdir(parents=True, exist_ok=True)
    meta = {}

    def lay(figs, wh, name):
        w, h = wh
        s = FIG_H * h / pokey.height
        cv = Image.new('RGBA', (w, h), GREY + (255,))
        ims = [f.resize((round(f.width * s * k), round(f.height * s * k)), Image.LANCZOS) for f, k in figs]
        gap = round(0.04 * w)
        tot = sum(i.width for i in ims) + gap * (len(ims) - 1)
        x = (w - tot) // 2
        for im in ims:
            cv.alpha_composite(im, (x, round(GROUND * h) - im.height))
            x += im.width + gap
        cv.convert('RGB').save(out / f'title-{name}.png')
        meta[name] = {'w': w, 'h': h, 'ground': round(GROUND * h), 'scale': s}
        print('START', name, flush=True)

    mk = 0.86  # Meeca a little shorter than Pokey, as on the title
    lay([(pokey, 1.0)], SQ, 'pokey')
    lay([(meeca, mk * pokey.height / meeca.height)], SQ, 'meeca')
    lay([(pokey, 1.0), (meeca, mk * pokey.height / meeca.height)], PAIR, 'pair')
    (out / 'title-meta.json').write_text(json.dumps(meta, indent=1))


if not os.environ.get('NOSTARTS'):
    starts()
if os.environ.get('DRY'):
    sys.exit(0)
only = [m for m in os.environ.get('ONLY', '').split(',') if m]
seeds = [int(s) for s in os.environ.get('SEEDS', '').split(',') if s] or SEEDS
ms = float(os.environ.get('MOTION_SCALE', '1'))
tagm = '' if ms == 1 else f"-m{int(ms * 10)}"
clips = [{'name': f'w6t-title-{mv}{tagm}-s{s}', 'src': f'starts/title-{who}.png', 'prompt': M + what, 'seed': s, 'w': wh[0], 'h': wh[1]}
         for mv, (who, wh, what) in MOVES.items() if (mv in only if only else not mv.endswith('2')) for s in seeds]
spec = {'tag': 'w6to10-title', 'clips': clips}
if ms > 0:
    spec['motion'] = {'high': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_high_noise.safetensors'],
                      'low': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_low_noise.safetensors'], 'scale': ms}
p = ROOT / SUB / 'jobs' / f"x-title{tagm}-{os.environ.get('PART', '0')}{('-' + '_'.join(only)) if only else ''}.json"
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text(json.dumps(spec))
os.environ['SPEC'] = f'{SUB}/jobs/{p.name}'
os.environ['SUB'] = SUB
print('CLIPS', len(clips), flush=True)
runpy.run_path(str(ROOT / 'anim/jobs/animgpu.py'), run_name='__main__')
