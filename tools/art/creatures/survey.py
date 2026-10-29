"""Survey the overnight creature clips (2026-10-29): copy every cr-*/m1k-* clip and new-* design still from the model repo
mshaffe111/slothadv-gen into the bucket (w6to10/clips, w6to10/newstills), and draw one check sheet per creature (each clip as a row
of 8 frames, then its six design stills) to w6to10/survey/<creature>.jpg. CPU job; the token reaches it only as HF_TOKEN."""
import io, os, subprocess, sys, zipfile
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'pillow', 'huggingface_hub'], check=True)
from pathlib import Path
from PIL import Image, ImageDraw
from huggingface_hub import HfApi, hf_hub_download
tok = os.environ['HF_TOKEN']
OUT = Path('/out/w6to10')
(OUT / 'clips').mkdir(parents=True, exist_ok=True); (OUT / 'newstills').mkdir(parents=True, exist_ok=True); (OUT / 'survey').mkdir(parents=True, exist_ok=True)
api = HfApi(token=tok)
files = api.list_repo_files('mshaffe111/slothadv-gen')
clips = sorted(f for f in files if f.startswith('clips/') and (f.split('/')[-1].startswith('cr-') or f.split('/')[-1].startswith('m1k-')))
stills = sorted(f for f in files if f.startswith('stills/new-'))
by = {}
for f in clips:
    p = hf_hub_download('mshaffe111/slothadv-gen', f, token=tok)
    name = Path(f).stem
    (OUT / 'clips' / f'{name}.zip').write_bytes(Path(p).read_bytes())
    with zipfile.ZipFile(p) as z:
        ns = sorted(z.namelist())
        pick = [ns[round(i * (len(ns) - 1) / 7)] for i in range(8)]
        ims = [Image.open(io.BytesIO(z.read(n))).convert('RGB') for n in pick]
        print('CLIP', name, len(ns), ims[0].size, flush=True)
    by.setdefault(name.split('-')[1], []).append((name, ims))
for f in stills:
    p = hf_hub_download('mshaffe111/slothadv-gen', f, token=tok)
    (OUT / 'newstills' / Path(f).name).write_bytes(Path(p).read_bytes())
    by.setdefault(Path(f).stem.split('-')[1], []).append((Path(f).stem, [Image.open(p).convert('RGB')]))
for c, rows in by.items():
    cw = 180
    clip_rows = [r for r in rows if len(r[1]) > 1]; st = [r for r in rows if len(r[1]) == 1]
    ch = round(cw * clip_rows[0][1][0].height / clip_rows[0][1][0].width) if clip_rows else cw
    H = len(clip_rows) * (ch + 14) + (cw + 14) * ((len(st) + 7) // 8)
    S = Image.new('RGB', (8 * cw, H), (40, 40, 40)); d = ImageDraw.Draw(S); y = 0
    for n, ims in clip_rows:
        d.text((2, y), n, fill=(255, 255, 0))
        for i, im in enumerate(ims):
            S.paste(im.resize((cw, ch)), (i * cw, y + 14))
        y += ch + 14
    for i, (n, ims) in enumerate(st):
        x = (i % 8) * cw; yy = y + (i // 8) * (cw + 14)
        d.text((x + 2, yy), n, fill=(0, 255, 255)); S.paste(ims[0].resize((cw, cw)), (x, yy + 14))
    b = io.BytesIO(); S.save(b, 'JPEG', quality=80); (OUT / 'survey' / f'{c}.jpg').write_bytes(b.getvalue())
    print('SHEET', c, S.size, flush=True)
print('ALL_DONE', flush=True)
