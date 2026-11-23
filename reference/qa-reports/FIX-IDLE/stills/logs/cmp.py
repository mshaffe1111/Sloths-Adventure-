# FIX-IDLE: feet-anchored overlay of the plain 'idle' frame against each clip's first/last frame (best shift + overlap). python3 cmp.py <dir with frames.json>; frames.json = {idle: STD_FRAMES.idle, clips: HERO_CLIPS}
import json,sys
from PIL import Image, ImageChops
import numpy as np
S=sys.argv[1]; R='/home/user/Sloths-Adventure-/src/assets/hero/'
d=json.load(open(S+'/frames.json'))
std=Image.open(R+'hero-standard.webp').convert('RGBA')
i=d['idle']; base=std.crop((i['x'],i['y'],i['x']+i['w'],i['y']+i['h']))
W,H=320,240; FX,FY=160,225
def place(im,ax,ay):
    c=Image.new('RGBA',(W,H)); c.paste(im,(int(round(FX-ax)),int(round(FY-ay)))); return c
B=place(base,i['ax'],i['ay'])
rows=[]
for n in ['idle-yawn','look-around','belly-scratch','wave','doze','hurt','cheer','step-back','teeter']:
    c=d['clips'][n]; sh=Image.open(R+'clips/'+n+'.webp').convert('RGBA')
    out=[]
    for k in [0,c['n']-1]:
        x=(k%c['cols'])*c['w']; y=(k//c['cols'])*c['h']
        F=place(sh.crop((x,y,x+c['w'],y+c['h'])),c['ax'],c['ay'])
        a=np.array(B)[:,:,3]>128; b=np.array(F)[:,:,3]>128
        iou=(a&b).sum()/max(1,(a|b).sum())
        # best shift
        best=(iou,0,0)
        for dx in range(-12,13):
          for dy in range(-6,7):
            bb=np.roll(np.roll(b,dx,1),dy,0); v=(a&bb).sum()/max(1,(a|bb).sum())
            if v>best[0]: best=(v,dx,dy)
        out.append((k,round(iou,3),best))
        rows.append((n,k,F))
    print(n,out)
# contact sheet: base vs clip frames overlaid
sheet=Image.new('RGBA',(W*len(rows)//2*1, H*2),(255,255,255,255))
for j,(n,k,F) in enumerate(rows):
    col=j//2; row=j%2
    cell=Image.new('RGBA',(W,H),(255,255,255,255))
    t=B.copy(); t.putalpha(Image.eval(B.getchannel('A'),lambda v:v//2))
    cell.alpha_composite(F); cell.alpha_composite(t)
    sheet.paste(cell,(col*W,row*H))
sheet.convert('RGB').save(S+'/overlay.jpg',quality=85)
