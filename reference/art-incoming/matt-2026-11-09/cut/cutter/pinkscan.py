import sys, glob, os
ROOT=sys.argv[1]; sys.path.insert(0, ROOT+'/pylib')
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
pat = sys.argv[2] if len(sys.argv)>2 else '*'
for f in sorted(glob.glob(f'{ROOT}/artcut/pieces/{pat}.png')):
    a=np.asarray(Image.open(f)).astype(np.float32)
    r,g,b,al=a[...,0],a[...,1],a[...,2],a[...,3]
    mg=(r-g>45)&(b-g>35)&(al>60)&(np.maximum(r,b)>110)
    op=(al>60)
    edge = op & ~ndi.binary_erosion(op, iterations=4)
    print(os.path.basename(f)[:-4], 'pink px', int(mg.sum()), 'on-edge', int((mg&edge).sum()), 'frac %.4f'%(mg.sum()/max(op.sum(),1)))
