import sys, glob, os
from PIL import Image, ImageDraw
S=sys.argv[1]; out=sys.argv[2]; frames=[int(x) for x in sys.argv[3].split(',')]; orient=sys.argv[4]; scale=float(sys.argv[5]) if len(sys.argv)>5 else 1.0
rows=[]
for tag in ['before','after']:
    row=[]
    for f in frames:
        g=glob.glob(f'{S}/st/{tag}-*-{orient}-f{f:03d}.png')
        row.append(Image.open(g[0]).convert('RGB') if g else Image.new('RGB',(440,480),'red'))
    rows.append((tag,row))
w,h=rows[0][1][0].size; w=int(w*scale); h=int(h*scale); pad=28
sheet=Image.new('RGB',(w*len(frames),(h+pad)*2),'white'); d=ImageDraw.Draw(sheet)
for r,(tag,row) in enumerate(rows):
    for c,im in enumerate(row):
        sheet.paste(im.resize((w,h),Image.LANCZOS),(c*w,r*(h+pad)+pad))
        d.text((c*w+6,r*(h+pad)+6),f'{tag} {orient} frame {frames[c]}',fill='black')
sheet.save(out,quality=88); print(out, sheet.size)
