"""Pack the cut World 3 pieces (w3/cut) into src/assets/props/w3-props.webp and src/game/w3PropsData.ts.
Pairs that swap in place (glowworms lit/asleep, the fern still/rustling) share one scale so they line up."""
from PIL import Image
import json
GAME = (str(__import__('pathlib').Path(__file__).resolve().parents[3]) + '')
# name -> ('w'|'h', atlas px), or ('as', other): the same scale as `other`
T = {
    'glowLit': ('h', 420), 'glowDim': ('as', 'glowLit'), 'stalactite': ('h', 400), 'stalagmites': ('w', 420), 'mushrooms': ('w', 300),
    'grottoMouth': ('h', 440), 'fern': ('w', 380), 'fernRustle': ('as', 'fern'), 'mossCurtain': ('h', 440), 'hollowLog': ('w', 420),
    'pawprint': ('w', 320), 'clawRock': ('w', 320),
    # the glowworms (Matt's glowworm sheets): one scale for the awake ones, the sleepers sized to match the arms-up hang
    'glowHang1': ('h', 200), 'glowHang0': ('as', 'glowHang1'), 'glowHang2': ('as', 'glowHang1'),
    'glowWave0': ('as', 'glowHang1'), 'glowWave1': ('as', 'glowHang1'), 'glowWave2': ('as', 'glowHang1'), 'glowWave3': ('as', 'glowHang1'),
    'glowSleep0': ('h', 200), 'glowSleep1': ('as', 'glowSleep0'),
    # the sleeping thorn vine (Matt's sheet, 2026-10-25): sixteen frames in one shared box, its top at the top edge
    'thorn0': ('h', 300), **{f'thorn{i}': ('as', 'thorn0') for i in range(1, 16)},
    # the Prowler's ring (3-9): the pillar whole, cracked and broken share a scale
    'pillar': ('h', 360), 'pillarCracked': ('as', 'pillar'), 'pillarBroken': ('as', 'pillar'), 'ringWall': ('w', 360), 'bones': ('w', 220),
    'catEyes': ('w', 200), 'pawStrip': ('w', 420),
    # the sinkhole (3-4)
    'rim': ('w', 520), 'wallTile': ('w', 340), 'trickle': ('h', 420), 'ledge': ('w', 360), 'rootBridge': ('w', 420), 'rootLadder': ('h', 420),
}
src = {n: Image.open(f'cut/{n}.png').convert('RGBA') for n in T}
k = {}
for n, (ax, v) in T.items():
    if ax == 'as': continue
    k[n] = v / (src[n].width if ax == 'w' else src[n].height)
for n, (ax, v) in T.items():
    if ax == 'as': k[n] = k[v]
ims = {n: src[n].resize((max(1, round(src[n].width * k[n])), max(1, round(src[n].height * k[n]))), Image.LANCZOS) for n in T}
W, pad = 2048, 4
order = sorted(ims, key=lambda n: -ims[n].height)
x = y = rowh = 0
pos = {}
for n in order:
    im = ims[n]
    if x + im.width + pad > W: x = 0; y += rowh + pad; rowh = 0
    pos[n] = (x, y, im.width, im.height); x += im.width + pad; rowh = max(rowh, im.height)
H = y + rowh
atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for n, (px, py, w, h) in pos.items(): atlas.paste(ims[n], (px, py))
atlas.save(f'{GAME}/src/assets/props/w3-props.webp', 'WEBP', quality=82, method=6)
ts = "// generated from Matt's World 3 sheets (2026-10-24: the grotto pieces, ferns and hiding places, the glowworms; 2026-10-25: the thorn vine, the Prowler's ring, the sinkhole) by scratchpad/w3/pack.py: where each piece sits in w3-props.webp\n"
ts += 'export interface W3Frame { x: number; y: number; w: number; h: number }\n'
ts += 'export const W3_FRAMES = {\n' + ''.join(f'  {n}: {{ x: {px}, y: {py}, w: {w}, h: {h} }},\n' for n, (px, py, w, h) in sorted(pos.items())) + '} as const satisfies Record<string, W3Frame>;\n'
open(f'{GAME}/src/game/w3PropsData.ts', 'w').write(ts)
print(W, H)
