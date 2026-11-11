"""B1 frame table: every frame of every World 1-4 / shared stage atlas, read from the game's own frame lists."""
import json, os
S = os.environ.get('B1_SCRATCH', os.path.dirname(os.path.abspath(__file__)))
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../..'))
D = json.load(open(f'{S}/frames.json'))
def J(p): return json.load(open(f'{R}/{p}'))
rows = []  # (atlas_id, file, frame, rect dict, extra dict, datafile)
def add(atlas, file, data, frames, keep=lambda n, f: True):
    items = frames.items() if isinstance(frames, dict) else enumerate(frames)
    for n, f in items:
        if keep(str(n), f): rows.append(dict(atlas=atlas, file=file, frame=str(n), rect=f, data=data))
add('w1-cut', 'src/assets/w1to4art/w1-cut.webp', 'src/assets/w1to4art/w1-cut.json', J('src/assets/w1to4art/w1-cut.json'))
for w in (1, 2, 3, 4):
    add(f'w{w}-new', f'src/assets/w1to4art/w{w}-new.webp', f'src/assets/w1to4art/w{w}-new.json', J(f'src/assets/w1to4art/w{w}-new.json'))
add('proto', 'src/assets/proto/props-atlas.webp', 'src/game/protoAtlasData.ts', D['protoAtlasData']['PROTO_FRAMES'])
add('proto2', 'src/assets/proto/props2-atlas.webp', 'src/game/proto2AtlasData.ts', D['proto2AtlasData']['PROTO2_FRAMES'])
add('proto3', 'src/assets/proto/props3-atlas.webp', 'src/game/proto3AtlasData.ts', D['proto3AtlasData']['PROTO3_FRAMES'])
rows.append(dict(atlas='crown', file='src/assets/proto/crown.webp', frame='crown', rect={'x': 0, 'y': 0, 'w': 1200, 'h': 577}, data='src/game/protoArt.ts'))
for w in (2, 3, 4):
    add(f'kit{w}', f'src/assets/kits/w{w}.webp', 'src/game/kitAtlasData.ts', D['kitAtlasData']['KIT_FRAMES'][str(w)])
for w in (1, 2, 3, 4):
    g = D['groundAtlasData']['GROUND_FRAMES'][str(w)]
    fr = {}
    for i, f in enumerate(g['fills']): fr[f'fill{i}'] = f
    for i, f in enumerate(g['lips']): fr[f'lip{i}'] = f
    for i, f in enumerate(g['ends']): fr[f'end{i}'] = f
    add(f'ground{w}', f'src/assets/ground/w{w}.webp', 'src/game/groundAtlasData.ts', fr)
add('w2props', 'src/assets/props/w2-props.webp', 'src/game/w2PropsData.ts', D['w2PropsData']['W2_FRAMES'])
add('w3props', 'src/assets/props/w3-props.webp', 'src/game/w3PropsData.ts', D['w3PropsData']['W3_FRAMES'])
add('w4props', 'src/assets/props/w4-props.webp', 'src/game/w4PropsData.ts', D['w4PropsData']['W4_FRAMES'])
add('w4grit', 'src/assets/props/w4-grit.webp', 'src/game/w4GritData.ts', {f'pebble{i}': f for i, f in enumerate(D['w4GritData']['W4_PEBBLES'])} | {f'chip{i}': f for i, f in enumerate(D['w4GritData']['W4_CHIPS'])})
add('w4falls', 'src/assets/w4/falls.webp', 'src/game/w4FallsData.ts', D['w4FallsData']['FALL_FRAMES'])
for w in (1, 2, 3, 4):
    add(f'dressnew{w}', f'src/assets/props/dressnew-w{w}.webp', 'src/game/dressNewData.ts', D['dressNewData']['DRESS_NEW_FRAMES'], lambda n, f, w=w: f['world'] == w)
add('dress', 'src/assets/props/dress.webp', 'src/game/dressAtlasData.ts', D['dressAtlasData']['DRESS_FRAMES'], lambda n, f: __import__('re').match(r'w[12][A-Z]', n) is not None)
for w in (1, 2, 3, 4):
    g = D['stageArtData']['GATE_FRAMES'][str(w)]
    add(f'gate{w}', f'src/assets/props/gates/w{w}.webp', 'src/game/stageArtData.ts', {'shut': g['shut'], 'open': g['open']})
for w in (1, 3, 4):
    g = D['stageArtData']['PIT_WATER'][str(w)]
    add(f'pitwater{w}', f'src/assets/props/pitwater/w{w}.webp', 'src/game/stageArtData.ts', {'strip': g['strip'], 'shine': g['shine']})
for n, wh in (('w1-creek', (884, 1232)), ('w1-mud-splash', (280, 221))):
    rows.append(dict(atlas=n, file=f'src/assets/props/pitwater/{n}.webp', frame=n, rect={'x': 0, 'y': 0, 'w': wh[0], 'h': wh[1]}, data='src/game/w1Creek.ts'))
for n, wh in (('w1-drop', (512, 585)), ('w1-lip', (256, 475)), ('w1-bed', (512, 175))):
    rows.append(dict(atlas=n, file=f'src/assets/props/pits/{n}.webp', frame=n, rect={'x': 0, 'y': 0, 'w': wh[0], 'h': wh[1]}, data='src/game/w1Pits.ts'))
rows.append(dict(atlas='w1-bootprint', file='src/assets/props/w1-bootprint.webp', frame='bootprint', rect={'x': 0, 'y': 0, 'w': 440, 'h': 112}, data='src/game/w1NewArt.ts'))
add('stageart', 'src/assets/props/stage-art.webp', 'src/game/stageArtData.ts', D['stageArtData']['STAGE_ART_FRAMES'])
add('bounce', 'src/assets/props/bounce.webp', 'src/game/bounceAtlasData.ts', D['bounceAtlasData']['BOUNCE_FRAMES'], lambda n, f: n.endswith(('-w1', '-w2', '-w3', '-w4')))
add('watersigns', 'src/assets/props/water-signs.webp', 'src/game/waterSignData.ts', D['waterSignData']['WATER_SIGN_FRAMES'], lambda n, f: 'jungle' in n)
add('puzzlekit', 'src/assets/props/puzzle-kit.webp', 'src/game/puzzleAtlasData.ts', D['puzzleAtlasData']['KIT_ART'])
add('ropekit', 'src/assets/props/rope-kit.webp', 'src/game/ropeKitData.ts', D['ropeKitData']['ROPE_KIT'])
add('dotprops', 'src/assets/props/dot-props.webp', 'src/game/dotPropsData.ts', D['dotPropsData']['DOT_PROP_FRAMES'])
add('dotbridges', 'src/assets/props/dot-bridges.webp', 'src/assets/props/dot-bridges.json', J('src/assets/props/dot-bridges.json'))
add('plants', 'src/assets/flora/plants-atlas.webp', 'src/game/plantAtlasData.ts', D['plantAtlasData']['PLANT_FRAMES'])
add('flowers', 'src/assets/flora/flowers-atlas.webp', 'src/game/flowerAtlasData.ts', D['flowerAtlasData']['FLOWER_FRAMES'])
add('leaves', 'src/assets/flora/leaves-atlas.webp', 'src/game/leafAtlasData.ts', D['leafAtlasData']['LEAF_FRAMES'])
add('petals', 'src/assets/flora/petals.webp', 'src/game/petalData.ts', {f'petal{i}': f for i, f in enumerate(D['petalData']['PETALS'])})
if __name__ == '__main__':
    import collections
    print(len(rows)); print(collections.Counter(r['atlas'] for r in rows))
