"""motion score of clips: python3 -I score.py name... -> step (mean frame-to-frame change inside the figure), drift (first vs last), best loop"""
import sys, numpy as np
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'train'))
from clips import key
H = Path(__file__).resolve().parent
for n in sys.argv[1:]:
    fs = sorted((H / 'clips' / n).glob(f'{n}_*.png'))
    A = [np.asarray(Image.open(f).convert('RGB').resize((416, 240))).astype(np.int16) for f in fs]
    S = [key(a.astype(np.uint8)) > 128 for a in A]
    step = np.mean([((S[i] ^ S[i + 1]).sum()) / max(1, S[i].sum()) for i in range(len(S) - 1)])
    drift = (S[0] ^ S[-1]).sum() / max(1, S[0].sum())
    def iou(i, j): return (S[i] & S[j]).sum() / max(1, (S[i] | S[j]).sum())
    best = max(((iou(s, e), s, e) for s in range(0, 14) for e in range(s + 8, len(S))), default=(0, 0, 0))
    print(f'{n:34s} step {step:.3f} drift {drift:.2f} loop {best[1]}-{best[2]} {best[0]:.3f}')
