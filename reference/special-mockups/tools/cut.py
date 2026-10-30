# cut an atlas into alpha islands; write crops/<name>/<i>.png and an indexed sheet look/cut-<name>.jpg
import sys, os
import numpy as np
from PIL import Image, ImageDraw
from collections import deque
src=sys.argv[1]; name=sys.argv[2]; minpx=int(sys.argv[3]) if len(sys.argv)>3 else 24; S=int(sys.argv[4]) if len(sys.argv)>4 else 4
im=Image.open(src).convert('RGBA'); a=np.array(im)[:,:,3]
H,W=a.shape; h,w=H//S,W//S
m=a[:h*S,:w*S].reshape(h,S,w,S).max(axis=(1,3))>24
lab=np.zeros((h,w),int); boxes=[]; n=0
for y in range(h):
  for x in range(w):
    if m[y,x] and not lab[y,x]:
      n+=1; q=deque([(y,x)]); lab[y,x]=n; x0=x1=x; y0=y1=y
      while q:
        cy,cx=q.popleft()
        for dy in (-1,0,1):
          for dx in (-1,0,1):
            ny,nx=cy+dy,cx+dx
            if 0<=ny<h and 0<=nx<w and m[ny,nx] and not lab[ny,nx]:
              lab[ny,nx]=n; q.append((ny,nx)); x0=min(x0,nx);x1=max(x1,nx);y0=min(y0,ny);y1=max(y1,ny)
      if (x1-x0+1)*S>=minpx and (y1-y0+1)*S>=minpx: boxes.append((x0*S,y0*S,(x1+1)*S,(y1+1)*S))
boxes.sort(key=lambda b:(b[1]//64,b[0]))
os.makedirs(f'crops/{name}',exist_ok=True)
T=150; cols=8; rows=(len(boxes)+cols-1)//cols
sheet=Image.new('RGB',(cols*T,max(1,rows)*(T+14)),(70,70,70)); d=ImageDraw.Draw(sheet)
for i,b in enumerate(boxes):
  c=im.crop(b); c.save(f'crops/{name}/{i}.png')
  t=c.copy(); t.thumbnail((T-4,T-4)); x=(i%cols)*T; y=(i//cols)*(T+14)
  bg=Image.new('RGBA',t.size,(110,110,110,255)); bg.alpha_composite(t); sheet.paste(bg.convert('RGB'),(x+2,y+2))
  d.text((x+2,y+T),f'{i} {b[2]-b[0]}x{b[3]-b[1]}',fill=(255,255,0))
sheet.save(f'look/cut-{name}.jpg',quality=80); print(name,len(boxes))
