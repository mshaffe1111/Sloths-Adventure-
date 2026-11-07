import sys
ROOT=sys.argv[1]; sys.path.insert(0, ROOT+'/pylib')
from PIL import Image
# args: pieceid x0 y0 x1 y1 [scale]
pid=sys.argv[2]; x0,y0,x1,y1=map(int,sys.argv[3:7]); sc=float(sys.argv[7]) if len(sys.argv)>7 else 1
im=Image.open(f'{ROOT}/artcut/pieces/{pid}.png').crop((x0,y0,x1,y1))
out=Image.new('RGB',(im.width*2+10,im.height),(0,0,0))
for k,c in enumerate([(40,40,40),(230,230,220)]):
    b=Image.new('RGB',im.size,c); b.paste(im,(0,0),im); out.paste(b,(k*(im.width+10),0))
if sc!=1: out=out.resize((int(out.width*sc),int(out.height*sc)),Image.NEAREST)
out.save(f'{ROOT}/artcut/_debug/zoom.png')
