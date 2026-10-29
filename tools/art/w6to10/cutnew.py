"""Cut the "creatures-new" clips (tools/art/gen/spec-creatures-new.json, HF jobs creatures-new-0/1, 2026-10-29) into ready-not-drawn clip
sheets, on this machine from the unpacked carrier PNGs (hf_fs attach + tools/art/w5/unpack_carrier.py).

    python3 -I tools/art/w6to10/cutnew.py <unpacked frames dir> <game checkout>

Every 2nd Wan frame (8 fps of the 16 fps clip), keyed off the grey with cutpack.py's key_default. The camera is locked, so every frame of
a clip shares one anchor: the middle of the first frame's feet on its lowest solid row (ax/ay in each frame's own pixels). A soldier's
frames are scaled so he stands as tall as in soldier-anim.webp (draw at SOLDIER_K / SOLDIER_ANIM_UP, like soldierAnimData.ts); the others
stay at clip size (up 1). Writes src/assets/w6to10/creatures/<c>-anim.webp + <c>.json ({sheets, up, seq, frames}) and a "creatures" entry
in src/assets/w6to10/manifest.json. Nothing imports them yet.
"""
import io, json, os, sys
from pathlib import Path
os.environ.setdefault('PIPINSTALL', '0')
import numpy as np
from PIL import Image
from scipy import ndimage  # noqa: F401  (cutpack needs it)

HERE = Path(__file__).resolve().parent
SRC, GAME = Path(sys.argv[1]), Path(sys.argv[2])
import tempfile
_tmp = Path(tempfile.mkdtemp()); (_tmp / 'spec.json').write_text('{"groups": {}}')
os.environ.update(OUT=str(_tmp), SPEC='spec.json', GROUPS='')
sys.path.insert(0, str(HERE))
import cutpack  # noqa: E402  (its top level only makes an empty cutin folder in the temp dir)
key, pack = cutpack.key_default, cutpack.pack

# picks (Matt's verdict rules: on model, reads at a glance); owl defeat dropped (both takes end with the owl sitting up, eyes open)
PICKS = {
    'capuchin': {'defeat': 'nc-capuchin-defeat-s5'},
    'fruitbat': {'defeat': 'nc-fruitbat-defeat-s5', 'roost': 'nc-fruitbat-roost-s17'},
    'howler': {'defeat': 'nc-howler-defeat-s17'},
    'lavalizard': {'defeat': 'nc-lavalizard-defeat-s17'},
    'soldier': {'attack_a': 'nc-soldiera-attack-s17', 'hurt_a': 'nc-soldiera-hurt-s5', 'down_a': 'nc-soldiera-down-s17',
                'attack_b': 'nc-soldierb-attack-s5', 'hurt_b': 'nc-soldierb-hurt-s17', 'down_b': 'nc-soldierb-down-s17'},
}
SOLDIER_H = 301  # soldier-anim.webp idle frame height
OUT = GAME / 'src/assets/w6to10/creatures'
OUT.mkdir(parents=True, exist_ok=True)
man_p = GAME / 'src/assets/w6to10/manifest.json'
man = json.loads(man_p.read_text())
man['creatures'] = {}
for c, seqs in PICKS.items():
    frames, seqd, up = {}, {}, 1.0
    for seq, clip in seqs.items():
        rgbs = [np.asarray(Image.open(SRC / f'{clip}_{i:03d}.webp').convert('RGB')) for i in range(0, 49, 2)]
        a0 = (cutpack.key_tight if seq.endswith('_b') else key)(rgbs[0])
        ys, xs = np.nonzero(a0 > 128)
        foot_y = ys.max() + 1
        foot_x = float(np.median(xs[ys >= foot_y - 6]))
        if c == 'soldier':
            up = SOLDIER_H / (foot_y - ys.min())
        names = []
        for i, rgb in enumerate(rgbs):
            a = (cutpack.key_tight if seq.endswith('_b') else key)(rgb)
            yy, xx = np.nonzero(a > 8)
            x0, y0, x1, y1 = xx.min(), yy.min(), xx.max() + 1, yy.max() + 1
            im = Image.fromarray(np.dstack([rgb, a])[y0:y1, x0:x1], 'RGBA')
            if up != 1.0:
                im = im.resize((max(1, round(im.width * up)), max(1, round(im.height * up))), Image.LANCZOS)
            n = f'{seq}_{i:02d}'
            frames[n] = (im, (foot_x - x0) * up, (foot_y - y0) * up)
            names.append(n)
        seqd[seq] = names
    sheets, data = pack(frames, 4096)
    files = []
    for k, S in enumerate(sheets):
        fn = f'{c}-anim{"-" + str(k) if len(sheets) > 1 else ""}.webp'
        b = io.BytesIO(); S.save(b, 'WEBP', quality=80, method=6)
        (OUT / fn).write_bytes(b.getvalue()); files.append(fn)
        print(fn, S.size, len(b.getvalue()))
    (OUT / f'{c}.json').write_text(json.dumps({'sheets': files, 'up': round(up, 4), 'fps': 8, 'seq': seqd, 'frames': data,
                                               'source': seqs}, separators=(',', ':')))
    man['creatures'][c] = {'sheets': files, 'json': f'{c}.json', 'moves': {s: len(v) for s, v in seqd.items()}, 'source': seqs}
man['creaturesNote'] = ('creatures-new clips (2026-10-29, cutnew.py): frames face RIGHT, ax/ay = the middle of the feet on the ground, '
                        'one anchor per clip (locked camera); soldier frames at soldier-anim.webp scale (draw at SOLDIER_K / up).')
man_p.write_text(json.dumps(man, indent=1))
