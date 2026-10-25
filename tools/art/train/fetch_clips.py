"""python3 -I fetch_clips.py name ... : download each clip's frames from the model repo into vids/<name>/ and make vids/<name>-strip.jpg"""
import sys, zipfile
from pathlib import Path
from PIL import Image
from huggingface_hub import hf_hub_download

S = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[1]))
tok = (__import__('os').environ.get('HF_TOKEN') or __import__('huggingface_hub').get_token())
V = S / 'train/vids'
for name in sys.argv[1:]:
    for ext in ('zip', 'gif'):
        p = hf_hub_download('mshaffe111/pokey-qwen-lora', f'videos/{name}.{ext}', token=tok, force_download=True)
        (V / f'{name}.{ext}').write_bytes(Path(p).read_bytes())
    d = V / name
    d.mkdir(exist_ok=True)
    with zipfile.ZipFile(V / f'{name}.zip') as z:
        for m in z.namelist():
            if m.endswith('.png') and '/' not in m and '..' not in m:
                (d / m).write_bytes(z.read(m))
    fs = sorted(d.glob('*.png'))
    picks = fs[::4][:12]
    im0 = Image.open(picks[0])
    t = 240
    tw = int(t * im0.width / im0.height)
    g = Image.new('RGB', (tw * 6, t * 2), 'white')
    for i, f in enumerate(picks):
        g.paste(Image.open(f).convert('RGB').resize((tw, t)), ((i % 6) * tw, (i // 6) * t))
    g.save(V / f'{name}-strip.jpg', quality=82)
    print(name, len(fs), 'frames')
