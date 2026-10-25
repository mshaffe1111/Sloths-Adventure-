"""download plate clips from pokey-qwen-lora videos/: python3 -I fetch_plates.py name ... -> train/vids/<name>/ + a 6-frame strip"""
import sys, zipfile
from pathlib import Path
from huggingface_hub import hf_hub_download
from PIL import Image
H = Path(__file__).resolve().parent
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
for n in sys.argv[1:]:
    d = H / 'vids' / n
    if not d.exists():
        d.mkdir(parents=True)
        zipfile.ZipFile(hf_hub_download('mshaffe111/pokey-qwen-lora', f'videos/{n}.zip', token=tok, force_download=True)).extractall(d)
    fs = sorted(d.glob(f'{n}_*.png'))
    pick = [fs[i] for i in (0, 12, 24, 36, 48) if i < len(fs)]
    tw = 400; th = 231
    s = Image.new('RGB', (tw * len(pick), th))
    for k, f in enumerate(pick):
        s.paste(Image.open(f).convert('RGB').resize((tw, th)), (k * tw, 0))
    s.save(H / 'vids' / f'{n}-strip.jpg', quality=82)
    print(n, len(fs))
