"""Pick frames out of an "all frames" sheet made by w5cpu.py packall (every frame of every clip, reanim/pack.py's format) and pack the
chosen sequences into the game's sheet: src/assets/enemies/<c>-anim.webp + src/game/<c>AnimData.ts, the same format pack.py writes
(frames keep their own anchors, so nothing about the drawing changes).

    python3 -I tools/art/w5/repack.py <all.webp>[+<all2.webp>] <allAnimData.ts>[+<all2AnimData.ts>] <creature> '<json {seq: [source seq, [frame numbers]]}>' [--loops]
    --loops prints the best loop of each source sequence (outline match), to choose frames.
    --derim seq,seq cuts a pale "sticker" outline (an edit's, carried into its clip) off those sequences' frames: pale, nearly grey
    pixels joined to the transparent outside, within a few pixels of it, stopping at the dark outline.
    --ground sets every frame's anchor height to its own feet (its lowest solid row), so a clip that drifts in depth stays on the line.
    --k K --units U adds <C>_K (world units per old px: draw a frame at K / ANIM_UP) and <C>_UNITS (his standing height) to the data.
    env W (default 2048) sheet width, Q (default 80) WebP quality, OUTDIR (default the game) where to write.
"""
import json, os, re, sys
from pathlib import Path
import numpy as np
from PIL import Image

# several all-frames sheets of one creature (one packall per variant, so no sheet grows past WebP's 16383 px) join with '+':
# a.webp+b.webp a.ts+b.ts, stacked one under the other (their sequence names must differ)
sheets = [Image.open(p).convert('RGBA') for p in sys.argv[1].split('+')]
srcs = [Path(p).read_text() for p in sys.argv[2].split('+')]
src = srcs[0]
c = sys.argv[3]
up = float(re.search(r'_ANIM_UP = ([\d.]+);', src).group(1))
atlas = Image.new('RGBA', (max(s.width for s in sheets), sum(s.height for s in sheets)), (0, 0, 0, 0))
seqs, fr, oy = {}, {}, 0
for sh, s in zip(sheets, srcs):
    assert float(re.search(r'_ANIM_UP = ([\d.]+);', s).group(1)) == up, 'the sheets share one scale'
    atlas.paste(sh, (0, oy))
    seqs.update(json.loads(re.search(r'_SEQ: Record<string, readonly string\[\]> = (\{.*?\});', s).group(1)))
    for n, f in json.loads(re.search(r'_ANIM: Record<string, AnimFrame> = (\{.*\});', s).group(1)).items():
        fr[n] = dict(f, y=f['y'] + oy)
    oy += sh.height


def crop(n):
    f = fr[n]
    return atlas.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


def sil(n, box):
    """the frame's outline placed by its anchor in a shared box"""
    f = fr[n]
    a = np.zeros(box, bool)
    im = np.asarray(crop(n).getchannel('A')) > 128
    ox, oy = int(round(box[1] / 2 - f['ax'])), int(round(box[0] * 0.8 - f['ay']))
    h, w = im.shape
    y0, x0 = max(0, oy), max(0, ox)
    y1, x1 = min(box[0], oy + h), min(box[1], ox + w)
    a[y0:y1, x0:x1] = im[y0 - oy:y1 - oy, x0 - ox:x1 - ox]
    return a


if '--loops' in sys.argv:
    for s, names in seqs.items():
        box = (int(max(fr[n]['h'] for n in names) * 1.6), int(max(fr[n]['w'] for n in names) * 1.6))
        S = [sil(n, box) for n in names]
        iou = lambda i, j: (S[i] & S[j]).sum() / max(1, (S[i] | S[j]).sum())
        best = sorted(((iou(a, b), a, b) for a in range(0, 16) for b in range(a + 10, len(S))), reverse=True)[:4]
        print(s, [(a, b, round(v, 3)) for v, a, b in best])
    sys.exit()

def opt(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def derim(im, band=5):
    from scipy import ndimage
    a = np.asarray(im).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3]
    lum, sat = rgb.mean(-1), rgb.max(-1) - rgb.min(-1)
    out = al < 40
    near = ndimage.binary_dilation(out, iterations=band)
    pale = near & ~out & (sat < 45) & (lum > 120)
    lab, _ = ndimage.label(out | pale)
    k = np.unique(lab[out])
    cut = np.isin(lab, k[k > 0]) & pale
    a[..., 3] = np.where(cut, 0, al)
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


SEL = json.loads(sys.argv[4])
DERIM = set((opt('--derim') or '').split(',')) - {''}
frames, out_seqs = {}, {}
for seq, (srcseq, idxs) in SEL.items():
    names = []
    for i in idxs:
        n = f'{seq}_{i:02d}'
        im = crop(f'{srcseq}_{i:02d}')
        frames[n] = (derim(im) if seq in DERIM else im, fr[f'{srcseq}_{i:02d}'])
        names.append(n)
    out_seqs[seq] = names
Wd, pad = int(os.environ.get('W', '2048')), 2
order = sorted(frames, key=lambda n: -frames[n][0].height)
x = y = rowh = 0
pos = {}
for n in order:
    im = frames[n][0]
    if x + im.width + pad > Wd:
        x = 0; y += rowh + pad; rowh = 0
    pos[n] = (x, y); x += im.width + pad; rowh = max(rowh, im.height)
sheet = Image.new('RGBA', (Wd, y + rowh), (0, 0, 0, 0))
for n, p in pos.items():
    sheet.paste(frames[n][0], p)
G = Path(os.environ.get('OUTDIR', str(Path(__file__).resolve().parents[3])))
(G / 'src/assets/enemies').mkdir(parents=True, exist_ok=True)
(G / 'src/game').mkdir(parents=True, exist_ok=True)
out = G / f'src/assets/enemies/{c}-anim.webp'
sheet.save(out, 'WEBP', quality=int(os.environ.get('Q', '80')), method=6)
def feet(im):
    """one past the lowest solid row: a clip that drifts toward or away from the camera (a step forward, a turn) sinks or floats a
    few pixels off its start picture's ground line; --ground puts every frame's feet back on it"""
    return float(np.nonzero((np.asarray(im.getchannel('A')) > 128).any(1))[0].max() + 1)


GROUND = '--ground' in sys.argv
data = {n: {'x': pos[n][0], 'y': pos[n][1], 'w': frames[n][0].width, 'h': frames[n][0].height, 'ax': frames[n][1]['ax'],
            'ay': feet(frames[n][0]) if GROUND else frames[n][1]['ay']} for n in sorted(frames)}
Cap = c.upper()
head = src.split('import type')[0].rstrip() + '\n'
ts = head.replace('Generated by scratchpad/reanim/pack.py', 'Generated by tools/art/w5/repack.py (frames picked from reanim/pack.py\'s sheet)')
ts += "import type { AnimFrame } from './creatureAnim.ts';\n"
ts += f'export const {Cap}_ANIM_UP = {up};\n'
ts += f"export const {Cap}_ANIM_URL = new URL('../assets/enemies/{c}-anim.webp', import.meta.url).href;\n"
ts += f'export const {Cap}_ANIM_SIZE = {{ w: {Wd}, h: {sheet.height} }};\n'
if opt('--k'):
    ts += f'/** world units per old (start-picture) pixel: draw a frame at {Cap}_K / {Cap}_ANIM_UP; he stands about {Cap}_UNITS tall */\n'
    ts += f'export const {Cap}_K = {opt("--k")};\nexport const {Cap}_UNITS = {opt("--units")};\n'
ts += f'export const {Cap}_SEQ: Record<string, readonly string[]> = ' + json.dumps(out_seqs) + ';\n'
ts += f'export const {Cap}_ANIM: Record<string, AnimFrame> = ' + json.dumps(data) + ';\n'
(G / f'src/game/{c}AnimData.ts').write_text(ts)
print('sheet', Wd, sheet.height, len(frames), 'frames', round(out.stat().st_size / 1024), 'KB ->', out)
