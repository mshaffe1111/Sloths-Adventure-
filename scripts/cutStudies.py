#!/usr/bin/env python3
"""
Cuts Slomatt out of the six action-study sheets (reference/animation-sheets/slomatt/0N_*.jpg) and packs the frames the game uses.

  python3 scripts/cutStudies.py

1. every panel of sheets 1-5 becomes a transparent PNG in reference/animation-sheets/slomatt/cutouts/s<sheet>_<panel>.png
   (the library: all 80 frames, kept whether or not the game uses them)
2. the frames named in USED are packed into src/assets/hero/hero-studies.webp, with their rectangles and feet anchors in
   src/game/heroStudiesData.ts

How a panel is cut: the panel's own border line is painted out, then the background is the cream that can be reached from the
panel's edge without crossing the sloth's dark outline (so his cream belly, enclosed by the outline, stays). Number circles, dust,
sparkles and other detached marks are dropped; the edge colours come from just inside the outline, so there is no cream halo.
Sheet 6 (white cards) is not cut here.
"""
import json
import os
import sys
from pathlib import Path

import cv2
import numpy as np
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SHEETS = ROOT / 'reference' / 'animation-sheets' / 'slomatt'
OUT_LIB = SHEETS / 'cutouts'
FILES = {
    '1': '01_rope-crossing-swinging-leaping.jpg',
    '2': '02_sliding-from-behind-seated-jump.jpg',
    '3': '03_squat-air-flip-falling-mega-kick.jpg',
    '4': '04_mega-punch-climbing-kicking.jpg',
    '5': '05_running-jumping-punching.jpg',
}
# panel rectangles (top, bottom, [(left, right), ...]) for each row, found from the sheets' border lines
GRID = {"01": [[46, 164, [[33, 231], [299, 500], [535, 738], [797, 990]]], [177, 295, [[33, 231], [299, 500], [541, 738], [800, 990]]], [308, 425, [[33, 231], [299, 500], [541, 738], [801, 990]]], [438, 555, [[33, 231], [299, 500], [541, 738], [801, 990]]]], "02": [[49, 198, [[39, 193], [227, 394], [427, 592], [628, 794], [825, 984]]], [217, 369, [[38, 193], [224, 395], [427, 592], [628, 797], [825, 984]]], [387, 539, [[38, 193], [215, 362], [380, 509], [526, 657], [673, 809], [825, 984]]]], "03": [[58, 215, [[41, 245], [286, 491], [532, 737], [778, 982]]], [232, 388, [[41, 245], [286, 491], [532, 737], [778, 982]]], [405, 561, [[41, 245], [286, 491], [532, 737], [778, 982]]], [579, 735, [[41, 245], [287, 491], [532, 737], [778, 982]]]], "04": [[49, 198, [[39, 194], [228, 395], [428, 593], [628, 795], [825, 985]]], [217, 369, [[38, 193], [224, 395], [427, 592], [628, 797], [825, 984]]], [387, 539, [[38, 185], [199, 345], [359, 505], [518, 664], [678, 824], [837, 984]]]], "05": [[58, 215, [[41, 245], [286, 491], [532, 737], [778, 982]]], [232, 388, [[41, 245], [286, 491], [532, 737], [778, 982]]], [405, 561, [[41, 245], [286, 491], [532, 737], [778, 982]]], [579, 735, [[41, 245], [286, 491], [532, 737], [778, 982]]]]}
# the frames the game uses (see src/game/heroStudies.ts), and how many hero-atlas pixels one pixel of the sheet is worth
USED = {"s1_05": 2.7, "s1_06": 2.7, "s1_07": 2.7, "s1_08": 2.7, "s1_09": 2.7, "s1_10": 2.7, "s1_11": 2.7, "s1_12": 2.7, "s3_05": 2.15, "s3_06": 2.15, "s3_07": 2.15, "s3_08": 2.15, "s3_09": 2.15, "s3_10": 2.15, "s3_11": 2.15, "s3_12": 2.15, "s3_13": 2.15, "s3_14": 2.15, "s3_15": 2.15, "s3_16": 2.15, "s4_01": 2.15, "s4_02": 2.15, "s4_03": 2.15, "s4_04": 2.15, "s4_06": 2.15, "s4_07": 2.15, "s4_08": 2.15, "s5_14": 2.15, "s5_15": 2.15}
# the rope in the swing frames is the vine's job in the game, so it is cut away from these
ROPE_FRAMES = ['s1_05', 's1_06', 's1_07', 's1_08', 's1_09']


def cut(rgb, rect, T0=14.0, T1=30.0, up=12, plate=27, skip_corner=34):
    """rgb: the whole sheet (H, W, 3 uint8); rect: (x0, y0, x1, y1) of the panel border. Returns (RGBA crop, info) or None."""
    """rgb: whole sheet (H,W,3 uint8). rect=(x0,y0,x1,y1) of the panel border. Returns RGBA crop of the sloth or None."""
    x0,y0,x1,y1=rect; H,W,_=rgb.shape
    ya=max(0,y0-up); yb=y1-plate
    xa=x0+4; xb=x1-3
    reg=rgb[ya:yb, xa:xb].copy()
    # the panel's own border line is not the sloth: paint it out from its neighbours (a hand held over it keeps its colour)
    gray=cv2.cvtColor(reg,cv2.COLOR_RGB2GRAY)
    ly=y0-ya
    lm=np.zeros(gray.shape,np.uint8)
    r0=max(0,ly-3); r1=min(gray.shape[0],ly+4)
    lm[r0:r1]=(gray[r0:r1]<82).astype(np.uint8)
    lm=cv2.dilate(lm,np.ones((3,3),np.uint8))
    if lm.any(): reg=cv2.inpaint(reg,lm,4,cv2.INPAINT_TELEA)
    lab=cv2.cvtColor(reg,cv2.COLOR_RGB2LAB).astype(np.float32)
    h,w,_=lab.shape
    ring=np.concatenate([lab[:5].reshape(-1,3), lab[:, :5].reshape(-1,3), lab[:, -5:].reshape(-1,3)])
    # background = the lighter, cream pixels of the ring (not the dark border/ground)
    ring=ring[ring[:,0]>np.percentile(ring[:,0],40)]
    bg=np.median(ring,axis=0)
    # local bg: smooth the per-pixel distance reference with a low-frequency blur of "bg-like" pixels
    dist=np.sqrt(((lab-bg)**2).sum(2))
    non=dist>T1
    # barrier closes 1px gaps in the outline
    bar=cv2.dilate(non.astype(np.uint8),np.ones((3,3),np.uint8))>0
    free=~bar
    lab_cc,_=ndi.label(free)
    # background = free components touching the region's edge
    edge=np.zeros_like(free); edge[0,:]=edge[-1,:]=edge[:,0]=edge[:,-1]=True
    touch=np.unique(lab_cc[edge&free]); touch=touch[touch>0]
    bgmask=np.isin(lab_cc,touch)
    fg=~bgmask
    # undo the dilation: keep fg only where it is near real non-bg pixels
    fg&=cv2.dilate(non.astype(np.uint8),np.ones((3,3),np.uint8))>0
    fg=ndi.binary_fill_holes(fg)
    # components
    cc,n=ndi.label(fg)
    if n==0: return None
    areas=ndi.sum(fg,cc,range(1,n+1)); big=int(np.argmax(areas))+1
    keep=np.zeros_like(fg)
    sl=ndi.find_objects(cc)
    bigsl=sl[big-1]
    by0,by1,bx0,bx1=bigsl[0].start,bigsl[0].stop,bigsl[1].start,bigsl[1].stop
    for i in range(1,n+1):
        a=areas[i-1]
        s=sl[i-1]; cy0,cy1,cx0,cx1=s[0].start,s[0].stop,s[1].start,s[1].stop
        if i==big: keep|=cc==i; continue
        # the number circle sits in the top-left corner
        if cy1<skip_corner+(up) and cx1<skip_corner+2: continue
        # a detached hand / ear: sizeable, and next to the main body
        near = not (cx0>bx1+6 or cx1<bx0-6 or cy0>by1+6 or cy1<by0-6)
        m=reg[cc==i].astype(np.float32).mean(0)
        furlike = 110<m[0]<215 and 60<m[1]<150 and 25<m[2]<110 and m[0]>m[1]+25
        if near and furlike and a>0.02*areas[big-1]: keep|=cc==i
    ys,xs=np.where(keep)
    if len(ys)==0: return None
    # alpha: solid inside, soft along the edge from the colour distance
    a=keep.astype(np.float32)
    edgeband=keep & ~ndi.binary_erosion(keep,iterations=2)
    soft=np.clip((dist-T0)/(T1-T0),0,1)
    a=np.where(edgeband,soft,a)
    # edge colours: take them from just inside (no cream halo)
    inner=ndi.binary_erosion(keep,iterations=2)
    d,(iy,ix)=ndi.distance_transform_edt(~inner,return_indices=True)
    col=reg.astype(np.float32).copy()
    near_col=reg[iy,ix].astype(np.float32)
    band=keep & ~inner
    col[band]=near_col[band]
    rgba=np.dstack([col,(a*255)[...,None]]).astype(np.uint8)
    y0c,y1c,x0c,x1c=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    out=rgba[y0c:y1c,x0c:x1c]
    # zero RGB where fully transparent
    out[out[...,3]==0,:3]=0
    # feet anchor: x of the lowest part of the body, y = bottom
    sub=keep[y0c:y1c,x0c:x1c]; hh=sub.shape[0]
    low=np.where(sub[int(hh*0.88):].any(0))[0]
    ax=float(low.mean()) if len(low) else sub.shape[1]/2
    return out, dict(w=int(out.shape[1]),h=int(out.shape[0]),ax=round(ax,1),ay=float(hh)), (int(xa+x0c),int(ya+y0c))


def drop_rope(im, info, thin=7, long_run=22):
    """remove the rope in the swing frames (the vine is drawn by the game): pixels that are thin across and stay thin for a long
    vertical run are the rope; the small gap it leaves where it crosses a hand or arm is closed again"""
    a = im[..., 3] > 128
    h, w = a.shape
    # horizontal thickness of the solid run each pixel sits in
    thick = np.zeros((h, w), np.int32)
    for y in range(h):
        x = 0
        while x < w:
            if a[y, x]:
                x2 = x
                while x2 < w and a[y, x2]:
                    x2 += 1
                thick[y, x:x2] = x2 - x
                x = x2
            else:
                x += 1
    thin_px = a & (thick <= thin)
    lab, n = ndi.label(thin_px, structure=np.ones((3, 3)))
    rope = np.zeros_like(a)
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        if sl[0].stop - sl[0].start >= long_run and (sl[1].stop - sl[1].start) <= thin + 4:
            rope |= lab == i
    if not rope.any():
        return im, info
    keep = a & ~ndi.binary_dilation(rope, iterations=1)
    # close the slit where the rope crossed the body: only fill where fur is on both sides
    closed = ndi.binary_closing(keep, structure=np.ones((5, 5)))
    fill = closed & ~keep & ndi.binary_dilation(rope, iterations=2)
    keep |= fill
    out = im.copy()
    # filled pixels borrow the colour of their nearest kept neighbour
    d, (iy, ix) = ndi.distance_transform_edt(~(a & ~ndi.binary_dilation(rope, iterations=1)), return_indices=True)
    out[fill, :3] = im[iy[fill], ix[fill], :3]
    out[..., 3] = np.where(keep, np.maximum(im[..., 3], 255 * fill), 0)
    out[~keep, :3] = 0
    ys, xs = np.where(out[..., 3] > 8)
    out = out[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    sub = out[..., 3] > 128
    hh = sub.shape[0]
    low = np.where(sub[int(hh * 0.88):].any(0))[0]
    info = dict(w=int(out.shape[1]), h=int(out.shape[0]), ax=round(float(low.mean()) if len(low) else out.shape[1] / 2, 1), ay=float(hh))
    return out, info


def main():
    OUT_LIB.mkdir(parents=True, exist_ok=True)
    frames = {}
    for key, fname in FILES.items():
        rgb = cv2.cvtColor(cv2.imread(str(SHEETS / fname)), cv2.COLOR_BGR2RGB)
        n = 0
        for t, b, pr in GRID['0' + key]:
            for l, r in pr:
                n += 1
                name = f's{key}_{n:02d}'
                res = cut(rgb, (l, t, r, b))
                if res is None:
                    print('could not cut', name)
                    continue
                im, info, _ = res
                if name in ROPE_FRAMES:
                    im, info = drop_rope(im, info)
                cv2.imwrite(str(OUT_LIB / f'{name}.png'), cv2.cvtColor(im, cv2.COLOR_RGBA2BGRA))
                frames[name] = (im, info)
    print(len(frames), 'cutouts in', OUT_LIB)

    # pack the frames the game uses
    from PIL import Image
    W = 1024
    x = y = rowh = 0
    pos = {}
    for name in USED:
        im, info = frames[name]
        h, w = im.shape[:2]
        if x + w > W:
            x = 0
            y += rowh + 2
            rowh = 0
        pos[name] = (x, y)
        x += w + 2
        rowh = max(rowh, h)
    H = y + rowh
    atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    data = {}
    for name, sc in USED.items():
        im, info = frames[name]
        atlas.paste(Image.fromarray(im, 'RGBA'), pos[name])
        data[name] = dict(x=pos[name][0], y=pos[name][1], w=info['w'], h=info['h'], ax=info['ax'], ay=info['ay'], sc=sc)
    out_img = ROOT / 'src' / 'assets' / 'hero' / 'hero-studies.webp'
    atlas.save(out_img, 'WEBP', quality=92, method=6, alpha_quality=100)
    ts = ROOT / 'src' / 'game' / 'heroStudiesData.ts'
    ts.write_text(
        '/** Generated by scripts/cutStudies.py from the six action-study sheets (reference/animation-sheets/slomatt). Do not edit by hand. */\n'
        '/** a frame of the studies atlas: its rectangle, the feet anchor (ax, ay) in atlas pixels, and `sc`, how many hero-atlas pixels one of its pixels is worth */\n'
        'export interface StudyFrame { x: number; y: number; w: number; h: number; ax: number; ay: number; sc: number }\n'
        f'export const STUDY_ATLAS_SIZE = {{ w: {W}, h: {H} }};\n'
        f'export const STUDY_FRAMES: Record<string, StudyFrame> = {json.dumps(data, indent=1)};\n'
    )
    print('atlas', atlas.size, round(os.path.getsize(out_img) / 1e3), 'KB;', len(data), 'frames')


if __name__ == '__main__':
    main()
