# DKC Returns (Wii, 2010) per-level mechanic table, built ONLY from saved Super Mario Wiki pages in sources/:
#  level order + puzzle pieces: dkc-world-jungle-dkcr.txt:20-27, dkc-world-beach-dkcr.txt:30-38, dkc-world-tables-dkcr-dkctf.txt:7-68
#  enemy level lists: dkc-enemy-tiki-goon.txt:20, dkc-enemy-tiki-buzz.txt:15, dkc-enemy-tiki-zing.txt (## Levels),
#    dkc-enemy-tiki-doom.txt:12-18, dkc-enemy-tiki-torch.txt (## Levels), dkc-enemy-tiki-tank.txt (## Levels), dkc-enemy-flaming-tiki-buzz.txt (## Levels)
#  vehicles: dkc-mechanic-mine-cart.txt:21, dkc-mechanic-rocket-barrel.txt:21-28; Rambi: world tables ("first/second/third/fourth level to feature Rambi")
# 3D/HD-only levels and the post-game Golden Temple are left out (not in the Wii level lists).
import re,collections
L="""1-1 Jungle Hijinxs|1-2 King of Cling|1-3 Tree Top Bop|1-4 Sunset Shore|1-5 Canopy Cannons|1-6 Crazy Cart|1-K Platform Panic|1-B Mugly's Mound|
2-1 Poppin' Planks|2-2 Sloppy Sands|2-3 Peaceful Pier|2-4 Cannon Cluster|2-5 Stormy Shore|2-6 Blowhole Bound|2-7 Tidal Terror|2-K Tumblin' Temple|2-B Pinchin' Pirates|
3-1 Wonky Waterway|3-2 Button Bash|3-3 Mast Blast|3-4 Damp Dungeon|3-5 Itty Bitty Biters|3-6 Temple Topple|3-K Shifty Smashers|3-B Ruined Roost|
4-1 Rickety Rails|4-2 Grip 'n' Trip|4-3 Bombs Away|4-4 Mole Patrol|4-5 Crowded Cavern|4-K Jagged Jewels|4-B The Mole Train|
5-1 Vine Valley|5-2 Clingy Swingy|5-3 Flutter Flyaway|5-4 Tippin' Totems|5-5 Longshot Launch|5-6 Springy Spores|5-7 Wigglevine Wonders|5-8 Muncher Marathon|5-K Blast & Bounce|5-B Mangoruby Run|
6-1 Sticky Situation|6-2 Prehistoric Path|6-3 Weighty Way|6-4 Boulder Roller|6-5 Precarious Plateau|6-6 Crumble Canyon|6-7 Tippy Shippy|6-8 Clifftop Climb|6-K Perilous Passage|6-B Thugly's Highrise|
7-1 Foggy Fumes|7-2 Slammin' Steel|7-3 Handy Hazards|7-4 Gear Getaway|7-5 Cog Jog|7-6 Switcheroo|7-7 Music Madness|7-R Lift-off Launch|7-K Treacherous Track|7-B Feather Fiend|
8-1 Furious Fire|8-2 Hot Rocket|8-3 Roasting Rails|8-4 Smokey Peak|8-5 Bobbing Basalt|8-6 Moving Melters|8-7 Red Red Rising|8-K Five Monkey Trial|8-B Tiki Tong Terror"""
lv=[x.strip().split(' ',1) for x in L.replace('\n','').split('|')]
code={n:c for c,n in lv}; order=[c for c,_ in lv]; idx={c:i for i,c in enumerate(order)}
M={
 'Tiki Goon (walker)':"Jungle Hijinxs; Sunset Shore; Platform Panic; Blowhole Bound; Wonky Waterway; Button Bash; Mast Blast; Rickety Rails; Jagged Jewels; Vine Valley; Flutter Flyaway; Tippin' Totems; Springy Spores; Wigglevine Wonders; Precarious Plateau; Foggy Fumes; Treacherous Track; Furious Fire; Roasting Rails; Bobbing Basalt; Moving Melters; Red Red Rising",
 'Tiki Buzz (flyer)':"Crazy Cart; Platform Panic; Poppin' Planks; Cannon Cluster; Tumblin' Temple; Wonky Waterway; Grip 'n' Trip; Vine Valley; Flutter Flyaway; Springy Spores; Blast & Bounce; Prehistoric Path; Weighty Way; Precarious Plateau; Crumble Canyon; Clifftop Climb; Foggy Fumes; Gear Getaway; Cog Jog; Music Madness; Treacherous Track; Furious Fire; Smokey Peak; Red Red Rising",
 'Tiki Zing (saw)':"King of Cling; Canopy Cannons; Platform Panic; Wonky Waterway; Button Bash; Vine Valley; Clingy Swingy; Longshot Launch; Wigglevine Wonders; Blast & Bounce; Sticky Situation; Precarious Plateau; Clifftop Climb; Five Monkey Trial",
 'Tiki Doom (big walker, 3 hits)':"Tree Top Bop; Platform Panic; Vine Valley; Wigglevine Wonders; Bobbing Basalt",
 'Flaming Tiki Buzz (melee-immune)':"Tree Top Bop; Crazy Cart; Longshot Launch; Prehistoric Path; Precarious Plateau; Handy Hazards; Roasting Rails; Red Red Rising; Tiki Tong Terror",
 'Tiki Torch (blow out flames)':"Peaceful Pier; Button Bash; Mast Blast; Furious Fire",
 'Tiki Tank (armoured, pound to flip)':"Button Bash; Temple Topple; Shifty Smashers; Precarious Plateau; Roasting Rails; Smokey Peak; Red Red Rising",
 'Mine cart (vehicle)':"Crazy Cart; Rickety Rails; Grip 'n' Trip; Bombs Away; Prehistoric Path; Roasting Rails",
 'Rocket barrel (vehicle)':"Peaceful Pier; Mole Patrol; Crowded Cavern; Gear Getaway; Lift-off Launch; Hot Rocket; Tiki Tong Terror",
 'Rambi (animal buddy)':"Tree Top Bop; Temple Topple; Precarious Plateau; Smokey Peak",
}
print(f"DKCR: {len(order)} levels (8 worlds, keys and bosses included)\n")
print(f"| mechanic | first | levels | share of later levels | longest absence (levels) | later worlds with it | 3-level windows after first with none |")
print("|---|---|---|---|---|---|---|")
for m,s in M.items():
    st=sorted({code[n.strip()] for n in s.split(';')},key=idx.get); f=idx[st[0]]
    later=len(order)-1-f
    gaps=[idx[b]-idx[a]-1 for a,b in zip(st,st[1:])]+[len(order)-1-idx[st[-1]]]
    fw=int(st[0][0]); ws={int(c[0]) for c in st}; lw=range(fw+1,9)
    win=sum(1 for i in range(f+1,len(order)-2) if not any(idx[c] in (i,i+1,i+2) for c in st)); nw=len(order)-2-(f+1)
    print(f"| {m} | {st[0]} | {len(st)} | {100*(len(st)-1)/later:.0f}% | {max(gaps)} | {sum(w in ws for w in lw)}/{len(lw)} | {win}/{nw} |")
# puzzle pieces by level type
pp={}
for f,rng in (('sources/dkc-world-jungle-dkcr.txt',None),('sources/dkc-world-beach-dkcr.txt',None),('sources/dkc-world-tables-dkcr-dkctf.txt',None)):
    for line in open(f):
        mm=re.match(r"\| ([1-8]-[0-9KBR]) \| ([^|]+) \| ([0-9–-]+) \|",line)
        if mm and mm.group(1) in idx and code.get(mm.group(2).strip().replace('Grip & Trip',"Grip 'n' Trip"))==mm.group(1): pp[mm.group(1)]=mm.group(3)
veh={code[n.strip()] for k in ('Mine cart (vehicle)','Rocket barrel (vehicle)') for n in M[k].split(';')}
g=collections.defaultdict(list)
for c,v in pp.items():
    if c.endswith('B'): continue
    t='vehicle (cart/rocket)' if c in veh else ('key temple' if c.endswith('K') else 'normal')
    g[t].append((c,v))
print("\nPuzzle pieces per level (from the world tables):")
for t,l in g.items(): print(f"  {t}: n={len(l)} pieces " + ', '.join(f'{c}:{v}' for c,v in sorted(l,key=lambda x:idx[x[0]])))
