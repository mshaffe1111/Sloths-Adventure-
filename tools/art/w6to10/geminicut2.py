"""Cut Matt's second lot of Gemini sheets (reference/prop-sheets/gemini-batch-2026-10-28/, 2026-10-29 pickup) the way geminicut.py does
(its cut_cell / foot_x / pack / checker), each sheet into one atlas with frames anchored at the middle of the foot.

    python3 -I tools/art/w6to10/geminicut2.py <sheets dir> <game checkout>

Cutouts -> src/assets/w6to10/gemini/<sheet>.webp + .json, and a check picture of each on a dark ground in env CHECK (default /tmp).
Nothing imports these yet; src/assets/w6to10/manifest.json lists them under "gemini2".
Cells are fractional boxes (x0, y0, x1, y1) of the sheet, or a cols x rows grid; `label` drops that share of each cell's bottom (the
painted captions). Grey sheets (Pokey climbing, the Queen collar off) are keyed off the grey like geminicut.py's General.
"""
import json, os, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
from geminicut import cut_cell, foot_x, pack, checker  # noqa: E402


def grid(cols, rows, names, label=0.0):
    out = {}
    for i, n in enumerate(names):
        if n:
            cx, cy = i % cols, i // cols
            out[n] = (cx / cols, cy / rows, (cx + 1) / cols, (cy + 1 - label) / rows)
    return out


SHEETS = {
    'story18-squirrels': ('magenta', {'shocked': (0, 0, .33, .6), 'laughing': (.33, 0, .62, .6), 'hammering': (.62, 0, 1, .6),
                                      'kids': (0, .6, .58, 1), 'sign': (.58, .55, 1, 1)}),
    'story21-dot-flour': ('magenta', grid(2, 2, ['puff', 'sneeze', 'stand', 'sulk'])),
    'w2-cages': ('magenta', grid(3, 1, ['whole', 'cracked', 'burst'], label=.25)),
    'river-king-peek': ('magenta', grid(3, 1, ['proud', 'flustered', 'surprised'])),
    'grandma-things': ('magenta', grid(3, 2, ['medal', 'teacup', 'spectacles', 'wool', 'seed-pouch', 'thimble'])),
    'secret-cracks': ('magenta', grid(2, 2, ['floor-crack', 'floor-broken', 'wall-crack', 'wall-net'])),
    'secret-roots-glow-water': ('magenta', grid(3, 2, ['root-hanger', 'root-net', 'glowworms-lit', 'glowworms-asleep', 'flooded-strip',
                                                       'sunk-stone'], label=.2)),
    'secret-tunnel-kit': ('magenta', grid(3, 2, ['tunnel-floor', 'tunnel-ledge', 'tunnel-wall', 'stump-pillar', 'wall-shelf', 'rubble'])),
    'w6-hides-arches': ('magenta', grid(3, 2, ['reed-hide', 'moss-hide', 'log-hide', 'moss-arch', 'root-arch', 'root-mound'])),
    'w9w10-bridges': ('magenta', grid(3, 2, ['plank-ring', 'plank-hanging', 'chain-bridge', 'rope-bridge', 'ember-slab', 'charred-log'])),
    'pokey-climb-back': ('grey', grid(4, 2, [f'climb-{i}' for i in range(8)])),
    'queen-collar-off': ('grey', grid(4, 2, ['stand', 'bow', 'wave', 'settle', 'look-up', 'look-back', 'hop', 'rest'], label=.2)),
}
PANELS = ['story19-raft', 'story20-dot-gorge', 'story22-parents-storm', 'secret-meeca-note', 'secret-pokey-note']


def cut_grey(c):
    a = c.astype(np.float32)
    bgc = np.median(np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)]), axis=0)
    d = np.sqrt(((a - bgc) ** 2).sum(axis=2))
    lab, _ = ndimage.label(d < 16)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    bg = ndimage.binary_opening(bg, iterations=1) | (bg & (d < 8))
    alpha = (~bg).astype(np.float32)
    rim = ndimage.binary_dilation(bg, iterations=1) & ~bg
    alpha = np.where(rim, np.clip((d - 8) / 20, 0, 1), alpha)
    lab, k = ndimage.label(alpha > 0.5)
    if k > 1:
        sizes = ndimage.sum(np.ones_like(alpha), lab, range(1, k + 1))
        alpha[(lab != 1 + int(np.argmax(sizes))) & (lab > 0)] = 0
    im = Image.fromarray(np.dstack([c, alpha * 255]).astype(np.uint8), 'RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    return im.crop(bb) if bb else None


def main():
    SRC, GAME = Path(sys.argv[1]), Path(sys.argv[2])
    CHECK = Path(os.environ.get('CHECK', '/tmp')); CHECK.mkdir(parents=True, exist_ok=True)
    G = GAME / 'src/assets/w6to10/gemini'; ST = GAME / 'src/assets/w6to10/story'
    G.mkdir(parents=True, exist_ok=True); ST.mkdir(parents=True, exist_ok=True)
    man_p = GAME / 'src/assets/w6to10/manifest.json'
    man = json.loads(man_p.read_text())
    man['gemini2'] = {'note': "Matt's Gemini sheets of 2026-10-28, cut 2026-10-29 (tools/art/w6to10/geminicut2.py); nothing draws them yet",
                      'cutouts': {}, 'panels': {}}
    for name, (key, cells) in SHEETS.items():
        sheet = Image.open(SRC / f'{name}.jpg').convert('RGB')
        W, H = sheet.size
        sprites, anchors = {}, {}
        for cn, (x0, y0, x1, y1) in cells.items():
            m = 7
            cell = sheet.crop((round(x0 * W) + m, round(y0 * H) + m, round(x1 * W) - m, round(y1 * H) - m))
            im = cut_cell(cell, key, {}) if key != 'grey' else cut_grey(np.asarray(cell))
            if im is None:
                print('EMPTY', name, cn); continue
            sprites[cn] = im
            anchors[cn] = (foot_x(im) if (np.asarray(im.getchannel("A")) > 128).any() else im.width / 2, im.height)
        atlas, place = pack(sprites)
        atlas.save(G / f'{name}.webp', 'WEBP', quality=90, method=6)
        frames = {n: {'x': place[n][0], 'y': place[n][1], 'w': im.width, 'h': im.height, 'ax': round(float(anchors[n][0]), 1),
                      'ay': anchors[n][1]} for n, im in sprites.items()}
        (G / f'{name}.json').write_text(json.dumps({'sheet': f'{name}.webp', 'size': {'w': atlas.width, 'h': atlas.height},
                                                    'anchor': 'middle of the foot', 'frames': frames}, indent=1))
        bg = Image.new('RGBA', atlas.size, (25, 28, 36, 255)); bg.alpha_composite(atlas)
        bg.convert('RGB').save(CHECK / f'dark-{name}.jpg', quality=85)
        man['gemini2']['cutouts'][name] = {'sheet': f'gemini/{name}.webp', 'json': f'gemini/{name}.json', 'frames': list(frames)}
        print(name, atlas.size, (G / f'{name}.webp').stat().st_size)
    for name in PANELS:
        im = Image.open(SRC / f'{name}.jpg').convert('RGB')
        out = name.split('-', 1)[1] if name.startswith('story') else name
        im.save(ST / f'{out}.webp', 'WEBP', quality=85, method=6)
        man['gemini2']['panels'][out] = {'file': f'story/{out}.webp', 'from': f'{name}.jpg', 'size': im.size}
        print(out, im.size, (ST / f'{out}.webp').stat().st_size)
    man_p.write_text(json.dumps(man, indent=1))


if __name__ == '__main__':
    main()
