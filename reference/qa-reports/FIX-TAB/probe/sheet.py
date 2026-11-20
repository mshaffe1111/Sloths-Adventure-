import json,sys
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
only = sys.argv[3] if len(sys.argv) > 3 else 'hit'
tiles=[]
for l in open(src):
    r=json.loads(l)
    for o in r['runs']:
        if 'shot' not in o: continue
        hit = o['orphan'] is not None and o['art'] and o['visPx'] > 20
        if only=='hit' and not hit: continue
        im=Image.open(o['shot']); X0,Y0,X1,Y1=o['box']
        c=im.crop((X0-90,Y0-60,X1+90,Y1+30)).resize(((X1-X0+180)*2,(Y1-Y0+90)*2))
        d=ImageDraw.Draw(c); d.text((4,4),f"{r['job']} {r['diff']} f{o['floor']}{o['side']} x{o['x0']} px{o['visPx']}",fill=(255,255,0))
        tiles.append(c)
if not tiles: print('none'); sys.exit()
w=max(t.width for t in tiles); h=max(t.height for t in tiles); cols=4; rows=(len(tiles)+cols-1)//cols
s=Image.new('RGB',(w*cols,h*rows))
for i,t in enumerate(tiles): s.paste(t,((i%cols)*w,(i//cols)*h))
s.save(out); print(len(tiles), s.size)
