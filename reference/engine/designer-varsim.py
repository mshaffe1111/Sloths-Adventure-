# Variety vs library size, measured with the validator's own measure: cosine of move 3-gram counts (tools/validate/core.ts:221-237),
# neighbour limit 0.45 (evaluate.ts NEIGHBOUR_MAX), any-earlier limit 0.55 (core.ts SIMILAR_MAX).
import random, math, itertools, collections, sys
random.seed(7)
def grams(s,n=3):
    c=collections.Counter()
    for i in range(len(s)-n+1): c[tuple(s[i:i+n])]+=1
    return c
def cos(a,b):
    dot=sum(a[k]*b.get(k,0) for k in a); na=math.sqrt(sum(v*v for v in a.values())); nb=math.sqrt(sum(v*v for v in b.values()))
    return dot/(na*nb) if na and nb else 0
JOBS=['intro','ramp','spike','rest','counter','climax','climax','cool']   # 8 nodes a stage
def make_room(alpha, motifbias):
    # a room: 5-9 move tokens; real rooms repeat a motif (BIT.TRIP's lesson), so tokens come from a 3-token motif with variation
    motif=[random.choice(alpha) for _ in range(3)]
    L=random.randint(5,9); out=[]
    for i in range(L):
        out.append(motif[i%3] if random.random()<motifbias else random.choice(alpha))
    return out
def world(K, alpha_n, socket_k, motifbias=0.6, shared_alpha=None):
    alpha=list(range(alpha_n))
    rooms={j:[make_room(alpha,motifbias) for _ in range(K)] for j in set(JOBS)}
    rooms['rest']=[['R']]*K
    socks=[[random.choice(alpha)] for _ in range(socket_k)] if socket_k else None
    return rooms,socks,alpha
def roll_stage(rooms,socks,used,cap=3,rng=random):
    s=[]; picks=[]
    for j in JOBS:
        deck=[i for i in range(len(rooms[j])) if used[(j,i)]<cap] or list(range(len(rooms[j])))
        i=rng.choice(deck); picks.append((j,i)); r=list(rooms[j][i])
        if socks and j!='rest':
            # a hazard block slot replaces one token with a block's token (Spelunky obstacle blocks)
            p=rng.randrange(len(r)); r[p]=rng.choice(socks)[0]
        if rng.random()<0.5 and j!='rest': r=r[::-1]   # mirror / reversed direction reads as a different order
        s+=r
    return s,picks
def experiment(K, alpha_n, socket_k, trials=60, cap=3):
    over45=0; over55=0; pairs=0; replay=[]
    for t in range(trials):
        rooms,socks,_=world(K,alpha_n,socket_k)
        used=collections.Counter(); stages=[]
        for st in range(9):
            s,p=roll_stage(rooms,socks,used,cap); stages.append(s)
            for x in p: used[x]+=1
        g=[grams(s) for s in stages]
        for i in range(1,9):
            c=cos(g[i],g[i-1]); pairs+=1; over45+= c>0.45
            over55+= max(cos(g[i],g[k]) for k in range(i))>0.55
        # replay: same stage spec rolled twice (no cap memory), distance
        a,_=roll_stage(rooms,socks,collections.Counter(),99); b,_=roll_stage(rooms,socks,collections.Counter(),99)
        replay.append(1-cos(grams(a),grams(b)))
    return over45/pairs, over55/pairs, sum(replay)/len(replay)
print('| rooms per job (K) | move alphabet in a world | hazard blocks | neighbour pairs over 0.45 | stages alike an earlier one (>0.55) | replay distance (1 - cos) |')
print('|---|---|---|---|---|---|')
for alpha_n in (5,8,12):
    for K in (1,2,3,4,6,8,12):
        for sk in (0,8):
            a,b,r=experiment(K,alpha_n,sk)
            print(f'| {K} | {alpha_n} | {sk} | {a:.0%} | {b:.0%} | {r:.2f} |')
