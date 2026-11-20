# before/after side by side per still + a 2x crop around the bank end: python3 bacmp.py <tag> <endx> <top> <cutWas>
import json,sys,re,glob,os
from PIL import Image, ImageDraw
tag,endx,top,cutwas=sys.argv[1],float(sys.argv[2]),float(sys.argv[3]),float(sys.argv[4])
os.makedirs('ba/cmp',exist_ok=True)
for orient in ('sideways','upright'):
    pair=[]
    for n in ('before','after'):
        log=open(f'ba/{n}-{tag}.log').read()
        cams=[json.loads(l[4:]) for l in log.splitlines() if l.startswith('CAM ')]
        files=[l.split()[1] for l in log.splitlines() if l.startswith('wrote ')]
        idx=[i for i,f in enumerate(files) if orient in f]
        if not idx: print('missing',n,orient); break
        i=idx[0]; f=files[i]; c=cams[i]; im=Image.open(f)
        k=c['z']*2
        sx=lambda wx:(wx-c['x'])*k; sy=lambda wy:(wy-c['y'])*k
        box=(int(sx(endx-160)),int(sy(top-30)),int(sx(endx+160)),int(sy(cutwas+60)))
        box=(max(0,box[0]),max(0,box[1]),min(im.width,box[2]),min(im.height,box[3]))
        pair.append((im,box,f))
    if len(pair)<2: continue
    W,H=pair[0][0].size
    s=Image.new('RGB',(W*2+10,H),(255,255,255))
    for j,(im,box,f) in enumerate(pair):
        s.paste(im,(j*(W+10),0)); d=ImageDraw.Draw(s); d.rectangle((box[0]+j*(W+10),box[1],box[2]+j*(W+10),box[3]),outline=(255,0,255),width=3)
        d.text((j*(W+10)+10,H-40),('BEFORE 453b69c2' if j==0 else 'AFTER t-fix-tab'),fill=(255,255,0))
    s.save(f'ba/cmp/{tag}-{orient}.jpg',quality=85)
    cw=max(1,pair[0][1][2]-pair[0][1][0]); ch=max(1,pair[0][1][3]-pair[0][1][1])
    cr=Image.new('RGB',(cw*4+10,ch*2),(255,255,255))
    for j,(im,box,f) in enumerate(pair): cr.paste(im.crop(box).resize((cw*2,ch*2)),(j*(cw*2+10),0))
    cr.save(f'ba/cmp/{tag}-{orient}-crop2x.jpg',quality=90)
    print(tag,orient,'ok',os.path.basename(pair[0][2]))
