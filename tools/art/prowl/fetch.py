"""download finished clips: python3 fetch.py idle crawl ... -> vids/<name>/<name>_NNN.png and vids/<name>.gif, plus a contact sheet"""
import sys, zipfile
from pathlib import Path
from huggingface_hub import hf_hub_download
from PIL import Image, ImageDraw
H = Path(__file__).resolve().parent
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
for n in sys.argv[1:]:
    d = H / 'vids' / n; d.mkdir(parents=True, exist_ok=True)
    z = hf_hub_download('mshaffe111/prowler-qwen-lora', f'videos/{n}.zip', token=tok, local_dir=H / 'dl', force_download=True)
    zipfile.ZipFile(z).extractall(d)
    fs = sorted(d.glob(f'{n}_*.png'))
    tw = 208; im0 = Image.open(fs[0]); th = round(im0.height * tw / im0.width)
    sheet = Image.new('RGB', (tw * 7, th * 7), 'white'); dr = ImageDraw.Draw(sheet)
    for i, f in enumerate(fs[:49]):
        x, y = (i % 7) * tw, (i // 7) * th
        sheet.paste(Image.open(f).convert('RGB').resize((tw, th)), (x, y)); dr.text((x + 3, y + 2), str(i), fill='red')
    sheet.save(H / f'vids/{n}_sheet.jpg', quality=85)
    print(n, len(fs))
