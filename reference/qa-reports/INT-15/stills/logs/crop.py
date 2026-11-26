# 2x crops around Pokey's feet from shoot.mjs logs: python3 crop.py <log> <outdir>
import json, sys, os
from PIL import Image
log, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
lines = open(log).read().splitlines()
pend = None
for l in lines:
    if l.startswith('wrote '):
        f = l.split()[1]; info = json.loads(l[len('wrote ') + len(f) + 1:]); pend = (f, info)
    elif l.startswith('CAM ') and pend:
        f, info = pend; pend = None
        c = json.loads(l[4:]); k = c['z'] * 2
        im = Image.open(f)
        px = info['px'] + 20; feet = info['feet']
        sx = lambda wx: (wx - c['x']) * k; sy = lambda wy: (wy - c['y']) * k
        box = (int(sx(px - 200)), int(sy(feet - 170)), int(sx(px + 200)), int(sy(feet + 80)))
        box = (max(0, box[0]), max(0, box[1]), min(im.width, box[2]), min(im.height, box[3]))
        cr = im.crop(box); cr = cr.resize((cr.width * 2, cr.height * 2), Image.LANCZOS)
        o = os.path.join(out, os.path.basename(f).replace('.jpg', '-crop2x.jpg'))
        cr.save(o, quality=88); print('crop', o, box, cr.size)
