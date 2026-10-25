"""best loop in a clip: python3 loopfind.py name minlen -> (start, end) pairs whose silhouettes match best"""
import sys, numpy as np
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'train'))
from clips import key
H = Path(__file__).resolve().parent
n = sys.argv[1]; mn = int(sys.argv[2])
fs = sorted((H / 'vids' / n).glob(f'{n}_*.png'))
sil = [key(np.asarray(Image.open(f).convert('RGB'))) > 128 for f in fs]
def iou(i, j): a, b = sil[i], sil[j]; return (a & b).sum() / max(1, (a | b).sum())
res = sorted(((iou(s, e), s, e) for s in range(0, 12) for e in range(s + mn, len(sil))), reverse=True)[:6]
print(n, [(s, e, round(v, 3)) for v, s, e in res])
