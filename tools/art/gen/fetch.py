"""download from mshaffe111/slothadv-gen: python3 -I fetch.py stills [prefix]  |  python3 -I fetch.py clips name ...
stills -> gen/stills/<name>.png (+ a contact sheet gen/stills-<prefix>.jpg); clips -> gen/clips/<name>/<name>_NNN.png + gen/clips/<name>_sheet.jpg"""
import sys, zipfile
from pathlib import Path
from huggingface_hub import HfApi, hf_hub_download
from PIL import Image, ImageDraw
H = Path(__file__).resolve().parent
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
api = HfApi(token=tok)
REPO = 'mshaffe111/slothadv-gen'
if sys.argv[1] == 'stills':
    pre = sys.argv[2] if len(sys.argv) > 2 else ''
    fs = sorted(f for f in api.list_repo_files(REPO) if f.startswith('stills/' + pre) and f.endswith('.png'))
    (H / 'stills').mkdir(exist_ok=True)
    ims = []
    for f in fs:
        p = H / 'stills' / Path(f).name
        if not p.exists():
            Image.open(hf_hub_download(REPO, f, token=tok)).save(p)
        ims.append(p)
    tw, cols = 256, 8
    sheet = Image.new('RGB', (tw * cols, (tw + 14) * ((len(ims) + cols - 1) // cols)), 'black'); d = ImageDraw.Draw(sheet)
    for i, p in enumerate(ims):
        im = Image.open(p).convert('RGB'); im.thumbnail((tw, tw))
        x, y = (i % cols) * tw, (i // cols) * (tw + 14)
        sheet.paste(im, (x, y + 14)); d.text((x + 2, y + 1), p.stem, fill='yellow')
    sheet.save(H / f'stills-{pre or "all"}.jpg', quality=85)
    print(len(ims), 'stills')
else:
    for n in sys.argv[2:]:
        d = H / 'clips' / n; d.mkdir(parents=True, exist_ok=True)
        z = hf_hub_download(REPO, f'clips/{n}.zip', token=tok, force_download=True)
        zipfile.ZipFile(z).extractall(d)
        fs = sorted(d.glob(f'{n}_*.png'))
        tw = 208; im0 = Image.open(fs[0]); th = round(im0.height * tw / im0.width)
        sheet = Image.new('RGB', (tw * 7, th * 7), 'white'); dr = ImageDraw.Draw(sheet)
        for i, f in enumerate(fs[:49]):
            x, y = (i % 7) * tw, (i // 7) * th
            sheet.paste(Image.open(f).convert('RGB').resize((tw, th)), (x, y)); dr.text((x + 3, y + 2), str(i), fill='red')
        sheet.save(H / f'clips/{n}_sheet.jpg', quality=85)
        print(n, len(fs))
