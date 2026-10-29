"""Flicker's moves for the rest of the game (2026-10-28, Matt: "make sure we have enough Flicker animations that we can get through
the game"), as one GPU job on Hugging Face (bucket mshaffe111/w5-xfer at /out; outputs like tools/art/anim/animgpu.py under
w6to10/clips/, starts under w6to10/starts/).

Every start is one of Matt's own 16 Flicker cells (reference/prop-sheets/w5puzzle/flicker.jpg, cut exactly as tools/art/w5puzzle/cut.py
cuts them, fetched from the public GitHub repo), turned to face right and laid on the pipeline's flat grey; Wan 2.2 I2V with the
motion model then moves it (two seeds a move). The hover, fly and perch loops already exist (tools/art/anim/, 2026-10-28) and are
not redone. MOVES below: move -> (cell number 1-16, clip size, share of the frame height he fills, what he does).

env: SUB (w6to10), PART/PARTS, ONLY (comma list of moves), DRY=1 (starts only, no clips). Locally: DRY=1 OUT=<dir> REPO=<repo root>
python3 flickergpu.py makes the starts from the repo's own files (to check them before spending).
"""
import io, json, os, runpy, sys, urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(os.environ.get('OUT', '/out'))
SUB = os.environ.get('SUB', 'w6to10')
REPO = os.environ.get('REPO')
GH = 'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/main/'
W = Path('/tmp/flk')
GREY = (200, 200, 200)
SQ = (704, 704)
WHO = 'slothadv motion, painted storybook cartoon, static locked-off camera, flat plain grey background, smooth weighty motion, ' \
      'a tiny round brown firefly with big shiny eyes, curly antennae, an orange and brown striped body, pink see-through wings and a glowing yellow-green tail, '
END = ', side view facing right the whole time, he stays in the middle of the frame'
MOVES = {
    'talk': (13, SQ, 0.5, 'chatters away, his little mouth opening and closing as he talks, bobbing in the air, his wings buzzing, a smooth repeating cycle'),
    'happy': (14, SQ, 0.5, 'laughs happily with his eyes squeezed shut, bouncing up and down in the air, his wings buzzing fast'),
    'sad': (15, SQ, 0.5, 'droops sadly with his eyes down, sinking a little lower in the air, his tail glow dimming and his wings slowing'),
    'show': (16, SQ, 0.45, 'flies one small slow circle in the air, his glowing tail drawing a ring of light behind him, then stops and hovers'),
    'glow': (5, SQ, 0.5, 'hovers in place while his round tail glows brighter and brighter and then softly fades, pulsing, a smooth repeating cycle'),
    'lead': (1, SQ, 0.5, 'flies forward eagerly, then looks back over his shoulder and waves with a tiny leg as if saying come on, his wings buzzing'),
    'turn': (5, SQ, 0.5, 'turns around in the air to face the other way, pauses, then turns back again'),
    'worried': (5, SQ, 0.5, 'looks around nervously, his antennae drooping, fidgeting in the air, his wings fluttering fast'),
    'startled': (5, SQ, 0.5, 'jumps back in fright, his eyes going wide and his antennae shooting straight up, then calms down'),
    'smug': (4, SQ, 0.5, 'gives a sly sideways look with half-closed eyes and a little smirk, bobbing in the air, his wings buzzing'),
    'shrug': (7, SQ, 0.5, 'shrugs his tiny shoulders and tilts his head, then bobs back level, his wings buzzing'),
    'doze': (10, SQ, 0.5, 'with his eyes closed slowly sinks down and dozes off, breathing slowly, his tail glow dimming to a soft ember'),
    'blink': (5, SQ, 0.5, 'hovers in place and blinks slowly, twice, his wings buzzing, a smooth repeating cycle'),
    'dart': (12, SQ, 0.45, 'darts quickly forward and up in a burst of speed, his glowing tail streaking, then slows to a hover'),
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


def starts():
    sys.path.insert(0, str(fetch('tools/art/w5puzzle/cut.py').parent))
    import cut  # noqa: E402  (the repo's own cutter: cut_cell, INSET)
    im = np.asarray(Image.open(fetch('reference/prop-sheets/w5puzzle/flicker.jpg')).convert('RGB')).astype(np.float32)
    h, w = im.shape[:2]
    cw, ch = w / 4, h / 4
    cells = {}
    for idx in range(1, 17):
        r, c = divmod(idx - 1, 4)
        x0, y0 = int(c * cw) + cut.INSET, int(r * ch) + cut.INSET
        x1, y1 = int((c + 1) * cw) - cut.INSET, int((r + 1) * ch) - cut.INSET
        cells[idx] = cut.cut_cell(im[y0:y1, x0:x1], 'magenta', depink=True)
    out = ROOT / SUB / 'starts'
    out.mkdir(parents=True, exist_ok=True)
    thumbs = []
    for mv, (cell, (cw2, ch2), share, _) in MOVES.items():
        f = cells[cell].transpose(Image.FLIP_LEFT_RIGHT)  # Matt's cells look left; the pipeline's figures face right
        s = min(share * ch2 / f.height, 0.8 * cw2 / f.width)
        f = f.resize((max(1, round(f.width * s)), max(1, round(f.height * s))), Image.LANCZOS)
        cv = Image.new('RGBA', (cw2, ch2), GREY + (255,))
        cv.alpha_composite(f, ((cw2 - f.width) // 2, (ch2 - f.height) // 2))
        cv = cv.convert('RGB')
        cv.save(out / f'flicker-{mv}.png')
        thumbs.append(cv.resize((176, 176), Image.LANCZOS))
        print('START', mv, cell, flush=True)
    S = Image.new('RGB', (7 * 176, 2 * 176), (40, 40, 40))
    for i, t in enumerate(thumbs):
        S.paste(t, ((i % 7) * 176, (i // 7) * 176))
    S.save(out / 'starts-flicker.jpg', quality=85)


starts()
if os.environ.get('DRY'):
    sys.exit(0)
only = [m for m in os.environ.get('ONLY', '').split(',') if m]
clips = [{'name': f'w6t-flicker-{mv}-s{s}', 'src': f'starts/flicker-{mv}.png', 'prompt': WHO + what + END, 'seed': s, 'w': wh[0], 'h': wh[1]}
         for mv, (_, wh, _, what) in MOVES.items() if not only or mv in only for s in SEEDS]
spec = {'tag': 'w6to10-flicker', 'motion': {'high': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_high_noise.safetensors'],
                                            'low': ['mshaffe111/slothadv-motion-lora', 'slothadv_motion_v1_low_noise.safetensors'], 'scale': 1.0},
        'clips': clips}
p = ROOT / SUB / 'jobs' / f"x-flicker-{os.environ.get('PART', '0')}.json"
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text(json.dumps(spec))
os.environ['SPEC'] = f'{SUB}/jobs/{p.name}'
os.environ['SUB'] = SUB
print('CLIPS', len(clips), flush=True)
runpy.run_path(str(ROOT / 'anim/jobs/animgpu.py'), run_name='__main__')
