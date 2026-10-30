"""Cut and pack the Drake's teacup ending and the new 9-10 / 10-10 boss art (hf-art-bosses, 2026-10-30) from the takes of hfdrake1,
hfboss910a and hfboss910b (all unpacked into one folder):

  src/assets/enemies/drake-atlas.webp + drakeAtlasData.ts        the Drake's frames, repacked with his new poses: tea (sitting grey over a
  src/assets/enemies/ironclaw-atlas.webp + ironclawAtlasData.ts  mug), breathdown, winded, cling; Iron-Claw's with aboutface, chairlift,
                                                                 throw, peek, paw (each pose scaled by its source still's own factor, so
                                                                 it matches his other frames; ax is the middle of the feet, ay the ground)
  src/assets/bosses/boss-910.webp + src/game/boss910Data.ts      9-10's set pieces: the tea things, six hoard shelves, three ribs, the lava
                                                                 crust (5 states x 3), the rising lava surface
  src/assets/bosses/boss-1010.webp + src/game/boss1010Data.ts    10-10's: the council table (standing, wall, broken), eleven chairs and a
                                                                 wreck, four netting panels, the thorn hedge (tile, end), rubble, the
                                                                 broken battlement, the wall cracking and burst open
  src/assets/w6to10/lairs/hall-wide.webp, hall-tall.webp         the council hall backdrops
  reference/prop-sheets/qa-notes/hf-art-bosses/review-910-*.jpg  every pick on dark and mid-grey, full and game size
Nothing here is drawn by the game yet: the new 9-10 and 10-10 fights (reference/boss-design/9-10-and-10-10.md) are not built.
    python3 -I tools/art/hfdrake/cut910.py <takes dir> <game checkout>
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'hfbosses'))
sys.path.insert(0, str(HERE))
TAKES, GAME = Path(sys.argv[1]), Path(sys.argv[2])
POSE_FLAG = '--poses' in sys.argv
from bosscut_lib import cut, review  # noqa: E402
from keyfix import flatten_key  # noqa: E402

META = json.loads((HERE / 'stillmeta.json').read_text())
PICK = json.loads((HERE / 'picks910.json').read_text())


def take(n, flat=False):
    im = Image.open(TAKES / f'{n}.webp').convert('RGB')
    return flatten_key(im) if flat else im


def fit(p, mw=None, mh=None):
    s = min(1.0, (mw or 1e9) / p.width, (mh or 1e9) / p.height)
    return p if s >= 1 else p.resize((max(1, round(p.width * s)), max(1, round(p.height * s))), Image.LANCZOS)


def shelf(pieces, W):
    x = y = rowh = 0
    frames = {}
    for name, p in sorted(pieces, key=lambda t: -t[1].height):
        if x + p.width > W:
            x, y, rowh = 0, y + rowh + 4, 0
        frames[name] = {'x': x, 'y': y, 'w': p.width, 'h': p.height}
        x += p.width + 4
        rowh = max(rowh, p.height)
    atlas = Image.new('RGBA', (W, y + rowh), (0, 0, 0, 0))
    for name, p in pieces:
        atlas.paste(p, (frames[name]['x'], frames[name]['y']))
    assert atlas.height <= 4096, atlas.size
    return atlas, frames


# ───── the poses, into each boss's own atlas ─────
POSES = {
    'drake': [('tea', 'drake-tea', 'w9d-idle'), ('breathdown', 'drake-breathdown', 'w9d-enrage'), ('winded', 'drake-winded', 'w9d-stunned'),
              ('cling', 'drake-cling', 'w9d-leapprep')],
    'ironclaw': [('aboutface', 'gen-aboutface', 'w10ic-idle'), ('chairlift', 'gen-chairlift', 'w10ic-overhead1'),
                 ('throw', 'gen-throw', 'w10ic-overhead1'), ('peek', 'gen-peek', 'w10ic-idle'), ('paw', 'gen-paw', 'w10ic-charge')],
}
up = {'drake': 1.0, 'ironclaw': 1.0}
posed = []
# (the poses go into the boss atlases only once the new fights draw them: run with --poses then; until then posecut.py keeps them)
for boss, rows in (POSES.items() if POSE_FLAG else []):
    dts = GAME / f'src/game/{boss}AtlasData.ts'
    src = dts.read_text()
    frames0 = json.loads(re.search(r'_FRAMES: Record<string, BossFrame> = (\{.*\});', src).group(1))
    atlas0 = Image.open(GAME / f'src/assets/enemies/{boss}-atlas.webp').convert('RGBA')
    names_new = {n for n, _, _ in rows}
    pieces = [(n, atlas0.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))) for n, f in frames0.items() if n not in names_new]
    anchors = {n: (f['ax'], f['ay']) for n, f in frames0.items()}
    for name, stem, still in rows:
        tk = PICK['poses'].get(stem)
        if not tk:
            continue
        im = take(tk, flat=True)
        box = (0, 0, 745, 1024) if stem == 'drake-tea' else None  # (the tea pose without its mug: Pokey sets the cup down in the game)
        p = cut(im, 'magenta', box, mainOnly=True)
        p = p.resize((max(1, round(p.width / META[still]['f'])), max(1, round(p.height / META[still]['f']))), Image.LANCZOS)
        a = np.asarray(p)[..., 3] > 128
        rows_on = np.nonzero(a.any(axis=1))[0]
        foot = a[max(0, rows_on[-1] - max(3, p.height // 8)):rows_on[-1] + 1]
        cols = np.nonzero(foot.any(axis=0))[0]
        anchors[name] = (round(float(cols.mean()), 1), p.height)
        pieces.append((name, p))
        posed.append((f'{boss} {name} ({tk})', p))
    atlas, frames = shelf(pieces, 1024)
    for n in frames:
        frames[n]['ax'], frames[n]['ay'] = anchors[n]
    atlas.save(GAME / f'src/assets/enemies/{boss}-atlas.webp', 'WEBP', quality=90, method=6)
    size = re.search(r'_ATLAS_SIZE = \{[^}]*\}', src).group(0)
    src = src.replace(size, re.sub(r'\{[^}]*\}', '{ w: %d, h: %d }' % atlas.size, size))
    src = re.sub(r'(_FRAMES: Record<string, BossFrame> = )\{.*\};', lambda m: m.group(1) + json.dumps(frames) + ';', src)
    dts.write_text(src)
    print(boss, atlas.size, (GAME / f'src/assets/enemies/{boss}-atlas.webp').stat().st_size)


# ───── the set pieces ─────
def pieces_from(spec):
    out = []
    for name, tk, box, opts, mw, mh in spec:
        if not tk:
            continue
        flat = opts.pop('flat', False)
        p = cut(take(tk, flat), 'magenta', box, **opts)
        out.append((name, fit(p, mw, mh)))
    return out


T, L, R, X = PICK.get('tea'), PICK.get('ledges'), PICK.get('ribs'), PICK.get('crust')
S910 = [(f'mug{k}', T, (110 + k * 190 - 80, 200, 110 + k * 190 + 110, 430), {'mainOnly': True}, 64, None) for k in range(6)]
S910 += [('mugBig', T, (1140, 130, 1520, 470), {'mainOnly': True}, 140, None), ('potTin', T, (1520, 110, 2040, 470), {'mainOnly': True}, 200, None),
         ('cup0', T, (180, 660, 540, 940), {'mainOnly': True}, 90, None), ('cup1', T, (530, 660, 880, 940), {'mainOnly': True}, 90, None),
         ('potChina', T, (960, 600, 1420, 930), {'mainOnly': True}, 120, None)]
S910 += [(f'shelf{k}', L, (x - 14, top - 140, x + w + 14, 1024), {'crumbs': 300}, 360, None)
         for k, (x, top, w) in enumerate([(30, 520, 360), (400, 380, 300), (740, 600, 280), (1060, 300, 340), (1440, 470, 300), (1780, 560, 240)])]
S910 += [(f'rib{k}', R, (x - 40, 0, x + 210, 1024), {'mainOnly': True}, None, 700) for k, x in enumerate((200, 700, 1200))]
S910 += [(f'crust{r}{c}', X, (30 + c * 560 - 12, 30 + r * 196 + 22, 30 + c * 560 + 540, 30 + r * 196 + 122), {'crumbs': 40}, 420, None)
         for r in range(5) for c in range(3)]
p910 = pieces_from(S910)
if PICK.get('lava'):
    lava = cut(take(PICK['lava']), 'magenta', trim=False)
    p910.append(('lavaTop', lava.resize((1024, 256), Image.LANCZOS)))
B, C, N, H, U = PICK.get('table'), PICK.get('chairs'), PICK.get('net'), PICK.get('hedge'), PICK.get('rubble')
S1010 = [('table', B, (20, 30, 2028, 330), {'mainOnly': True}, 2040, None), ('tableWall', B, (50, 350, 620, 1024), {'mainOnly': True}, 360, None),
         ('tableBroken', B, (660, 680, 2048, 1024), {'crumbs': 300}, 1000, None)]
S1010 += [(f'chair{k}', C, (30 + (k % 5) * 190 - 22, 0 if k < 5 else 500, 30 + (k % 5) * 190 + 152, 460 if k < 5 else 990), {'mainOnly': True}, 110, None)
          for k in range(10)]
S1010 += [('chairHead', C, (975, 0, 1190, 460), {'mainOnly': True}, 140, None), ('chairTumble', C, (1190, 20, 1660, 520), {'mainOnly': True}, 200, None),
          ('chairWreck', C, (1590, 480, 2048, 1024), {'crumbs': 300}, 240, None)]
S1010 += [('netS', N, (0, 30, 490, 1024), {'mainOnly': True}, None, 640), ('netM', N, (390, 30, 1050, 1024), {'mainOnly': True}, None, 640),
          ('netL', N, (950, 30, 1770, 1024), {'mainOnly': True}, None, 640), ('netTorn', N, (1765, 100, 2048, 1024), {'crumbs': 300}, None, 640)]
S1010 += [('hedgeTile', H, (0, 0, 1600, 512), {'trim': False}, 1024, None), ('hedgeEnd', H, (1640, 0, 2048, 512), {'mainOnly': True}, 260, None)]
S1010 += [('rubble0', U, (10, 640, 440, 1015), {'crumbs': 200}, 260, None), ('rubble1', U, (470, 780, 790, 1015), {'crumbs': 200}, 180, None),
          ('rubble2', U, (780, 560, 1270, 1015), {'crumbs': 200}, 300, None), ('battlement', U, (1270, 250, 2048, 1024), {'mainOnly': True}, 480, None)]
p1010 = pieces_from(S1010)
for k in ('crack', 'open'):
    if PICK.get('break-' + k):
        p1010.append(('wall' + k.title(), fit(cut(take(PICK['break-' + k], True), 'magenta', mainOnly=True), 640, 640)))

out = GAME / 'src/assets/bosses'
for tag, pieces, what in (('910', p910, "9-10's set pieces (the Drake's tea things, hoard shelves, ribs, lava crust, the lava top)"),
                          ('1010', p1010, "10-10's set pieces (the council table and chairs, iron netting, thorn hedge, rubble, the wall break)")):
    if not pieces:
        continue
    atlas, frames = shelf(pieces, 2048)
    atlas.save(out / f'boss-{tag}.webp', 'WEBP', quality=88, method=6)
    (GAME / f'src/game/boss{tag}Data.ts').write_text(
        f'// generated by tools/art/hfdrake/cut910.py (2026-10-30): where each of {what} sits in src/assets/bosses/boss-{tag}.webp\n'
        '// (Hugging Face img2img takes with the style model; the picks are in tools/art/hfdrake/picks910.json). Not drawn yet: the new\n'
        '// fight (reference/boss-design/9-10-and-10-10.md) is not built.\n'
        'export interface PieceFrame { x: number; y: number; w: number; h: number }\n'
        f'export const BOSS{tag}_SIZE = {{ w: {atlas.width}, h: {atlas.height} }};\n'
        f'export const BOSS{tag}: Record<string, PieceFrame> = ' + json.dumps(frames, separators=(',', ':')) + ';\n')
    print(tag, atlas.size, (out / f'boss-{tag}.webp').stat().st_size)
    review(f'910-{tag}', pieces, game_h=None)

lairs = GAME / 'src/assets/w6to10/lairs'
for k in ('wide', 'tall'):
    if PICK.get('hall-' + k):
        im = take(PICK['hall-' + k])
        im.save(lairs / f'hall-{k}.webp', 'WEBP', quality=86, method=6)
        print('hall', k, im.size, (lairs / f'hall-{k}.webp').stat().st_size)
if posed:
    review('910-poses', posed)
