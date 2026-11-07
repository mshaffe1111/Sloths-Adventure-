import sys; sys.path.insert(0, sys.argv[1]+'/pylib')
import numpy as np, glob
from PIL import Image
for f in sorted(glob.glob(sys.argv[1]+'/artraw/W*/*')):
    a=np.asarray(Image.open(f).convert('RGB')).astype(int); h,w,_=a.shape; p=40
    cs=[a[:p,:p],a[:p,-p:],a[-p:,:p],a[-p:,-p:],a[:p,w//2-p:w//2+p],a[-p:,w//2-p:w//2+p]]
    print(f.split('/')[-1], ' '.join('%d,%d,%d'%tuple(np.median(c.reshape(-1,3),0)) for c in cs))
