from PIL import Image
import json
# name -> target (w or h): ('w', px) or ('h', px)
T = {
 'logLong':('w',440),'logShort':('w',300),'lily':('w',300),'reedTall':('h',420),'reedShort':('h',240),'reedLean':('h',330),
 'water':('w',640),'door':('w',480),'window':('w',240),'sign':('h',280),'mailbox':('h',260),'chimney':('h',300),
 'jetty':('w',560),'laundry':('w',520),
 'capySad':('h',220),'capyHappy':('h',260),'duckSad':('h',210),'duckHappy':('h',260),'otterSad':('h',220),'otterHappy':('h',260),
 'cageA':('h',300),'cageB':('h',300),'cageC':('h',290),
 'limbShort':('w',560),'canopy':('w',520),'swingFrame':('h',380),'pole':('h',380),'ladder':('h',620),'porch':('w',260),'steps':('w',360),
 'bell':('h',230),'lift':('h',380),'lantern':('h',150),'doorRoof':('w',420),'rooftop':('w',300),
 'throne':('h',420),'banner':('h',380),'gong':('h',220),'lilyCarpet':('w',460),'archway':('h',380),'dais':('w',420),
}
ims={}
for n,(ax,v) in T.items():
    im=Image.open(f'cut/{n}.png').convert('RGBA')
    k=v/(im.width if ax=='w' else im.height)
    ims[n]=im.resize((max(1,round(im.width*k)),max(1,round(im.height*k))),Image.LANCZOS)
W=2048; pad=4
order=sorted(ims,key=lambda n:-ims[n].height)
x=y=rowh=0; pos={}
for n in order:
    im=ims[n]
    if x+im.width+pad>W: x=0; y+=rowh+pad; rowh=0
    pos[n]=(x,y,im.width,im.height); x+=im.width+pad; rowh=max(rowh,im.height)
H=y+rowh
atlas=Image.new('RGBA',(W,H),(0,0,0,0))
for n,(x,y,w,h) in pos.items(): atlas.paste(ims[n],(x,y))
atlas.save((str(__import__('pathlib').Path(__file__).resolve().parents[3]) + '/src/assets/props/w2-props.webp'),'WEBP',quality=80,method=6)
ts='// generated from Matt\'s World 2 sheets (2026-10-24: river pieces, village pieces, the little ones, the reed cages, the boughs, the village up the bank and the river king court) by scratchpad/w2art/pack.py: where each piece sits in w2-props.webp\n'
ts+='export interface W2Frame { x: number; y: number; w: number; h: number }\n'
ts+='export const W2_FRAMES = {\n'+''.join(f'  {n}: {{ x: {x}, y: {y}, w: {w}, h: {h} }},\n' for n,(x,y,w,h) in sorted(pos.items()))+'} as const satisfies Record<string, W2Frame>;\n'
open((str(__import__('pathlib').Path(__file__).resolve().parents[3]) + '/src/game/w2PropsData.ts'),'w').write(ts)
print(W,H)
