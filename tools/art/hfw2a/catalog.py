"""ART-W2A: write (or rewrite) the 10 catalog rows for 2-3's follow poses in reference/art/CATALOG-MASTER.csv from the packed frames
(W2_FRAMES), modelled on Matt's otterHappy / w2Heron rows; then run `python3 tools/art/catalog_master.py --emit`.
    python3 -I tools/art/hfw2a/catalog.py
"""
import csv, io, re
P = 'reference/art/CATALOG-MASTER.csv'
raw = open(P, newline='').read()
rows = list(csv.reader(io.StringIO(raw)))
h = rows[0]; ix = {k: i for i, k in enumerate(h)}
F = {m[0]: tuple(map(int, m[1:])) for m in re.findall(r'(\w+): \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+) \}', open('src/game/w2PropsData.ts').read())}
LOOK_W = float(re.search(r'export const HERON_LOOK_W = ([\d.]+);', open('src/game/followArt.ts').read())[1])
MINE = {f'w2-props#{k}{p}' for k in ('duck', 'otter', 'capy') for p in ('WalkA', 'WalkB', 'Paddle')} | {'w2-props#w2HeronLook', 'dressnew-w2#w2HeronLook'}
rows = [r for r in rows if r[0] not in MINE]
tl = next(r for r in rows if r[0] == 'w2-props#otterHappy'); th = next(r for r in rows if r[0] == 'dressnew-w2#w2Heron')
HAP = {'duck': 185, 'otter': 190, 'capy': 182}
USE = {'WalkA': 'waddle frame A (the stride), swapped by ground covered (followArt.ts followerPose, FOLLOW_STRIDE)',
       'WalkB': 'waddle frame B (the passing step: legs together, body up), swapped by ground covered (followArt.ts followerPose)',
       'Paddle': 'paddling over splash-back water, drawn sunk to the chest under a code ripple (followArt.ts drawFollower)'}
WORLDS = 'USED 2 reeds, lilies and river water: the riverbank (2-3 Walk Them Home) | COULD 6 swamp water and reeds of the mangrove; 5 garden pond'
def row(t, n, src, kind, slot, onscreen, uh, notes):
    x, y, w, hh = F[n]; r = list(t)
    vals = dict(id=f'w2-props#{n}', source=src, file=f'src/assets/props/w2-props.webp#{n} ({x},{y} {w}x{hh})', kind=kind, w=str(w),
                h=str(hh), worlds=WORLDS, engine_slot=slot, footing='none (an actor: walks his trail / wades at a watched stretch)',
                layer='actor', on_screen_px=onscreen, ship_px=str(hh), file_kb='', file_kb_ship='',
                draw_cost='one drawImage of an atlas part: src/game/riverArt.ts drawW2Piece (part of w2-props)', used_in='2-3',
                status='in game', notes=notes, part='W2A', pokey_scale=f'{uh / 89.1:.2f}', scale_ok='y', scale_basis='drawn')
    for k, v in vals.items(): r[ix[k]] = v
    return r
new = []
for kind in ('duck', 'otter', 'capy'):
    for pose in ('WalkA', 'WalkB', 'Paddle'):
        n = kind + pose; w, hh = F[n][2:]; k = 33 / HAP[kind]
        new.append(row(tl, n, "World 2 props (props/w2-props.webp; ART-W2A 2026-11-18, HF Qwen-Image-Edit from Matt's Happy pose)",
                       'follower (2-3 little one walking home)', f'proto.follow (followArt.ts drawFollowers: {USE[pose]})',
                       f"{w * k:.0f}x{hh * k:.0f} (units: the Happy pose's scale, FOLLOWER_W 33 for Happy)", hh * k,
                       "ART-W2A: colour-matched to the Happy pose (tools/art/hfw2a/pack.py)"))
w, hh = F['w2HeronLook'][2:]; uh = LOOK_W * hh / w
new.append(row(th, 'w2HeronLook', 'World 2 props (props/w2-props.webp; ART-W2A 2026-11-18, HF Qwen-Image-Edit from w2Heron)',
               'animal (2-3 heron: head-up looking pose)', 'proto.watch with proto.follow (followArt.ts drawHerons: heronPose, while it warns or '
               'looks; dressnew-w2#w2Heron while calm)', f"{LOOK_W:.0f}x{uh:.0f} (units: HERON_LOOK_W, w2Heron's px a unit, its post on w2Heron's)",
               uh, "ART-W2A: an actor pose, so on w2-props (a dressing sheet holds set pieces only); its post body, rope, water and cattails "
               "are w2Heron's own pixels; packed at 0.72 (tools/art/hfw2a/pack.py)"))
last = max(i for i, r in enumerate(rows) if r[0].startswith('w2-props#'))
rows = rows[:last + 1] + new + rows[last + 1:]
b = io.StringIO(); csv.writer(b, lineterminator='\r\n' if '\r\n' in raw[:2000] else '\n').writerows(rows)
open(P, 'w', newline='').write(b.getvalue())
print('rows written', len(new))
