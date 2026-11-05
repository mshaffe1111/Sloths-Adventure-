# Moves research 2026-11-05: our measured move ladder (tools/engine/moveladder.json at commit 7d9ad9a9, engine-mixer: every stage of
# all ten worlds as the engine builds it, 2 layouts, Normal) checked against three return rules:
#  ES   ENGINE-SPEC.md:1319 "every core move appears in at least 1 of every 3 stages" (read as a sliding window of 3 stages after the
#       teach stage; a window with none fails).
#  CORE the envelope measured on DKC Returns' two commonest enemies (ours-dkcr-table-output.txt: Tiki Goon / Tiki Buzz): in >= 30% of
#       the later stages, in every later world, longest absence <= 8 stages.
#  SIG  the envelope measured on DKC Returns' signature pieces (mine cart, rocket barrel, Rambi: same file): longest absence <= 25
#       stages and present in >= 3/7 (43%) of the later worlds.
# Usage: python3 -I returncheck.py <moveladder.json>
import json,sys
d=json.load(open(sys.argv[1])); order=max((r['stages'] for r in d['rows']),key=len); idx={s:i for i,s in enumerate(order)}
W=lambda s:int(s.split('-')[0])
print(f"{len(order)} stages (ours, incl. bosses and 5-M)\n")
print("| mechanic | first | stages | share of later | longest absence | later worlds | ES 1-in-3 window | CORE (DKCR commonest) | SIG (DKCR signature) |")
print("|---|---|---|---|---|---|---|---|---|")
tot={'ES':0,'CORE':0,'SIG':0}; n=0
for r in d['rows']:
    st=sorted(r['stages'],key=idx.get); f=idx[st[0]]; later=len(order)-1-f
    if later<6: continue
    n+=1
    share=(len(st)-1)/later
    gaps=[idx[b]-idx[a]-1 for a,b in zip(st,st[1:])]+[len(order)-1-idx[st[-1]]]; mg=max(gaps)
    lw=list(range(W(st[0])+1,11)); ws={W(s) for s in st}; cov=sum(w in ws for w in lw)
    empty=sum(1 for i in range(f+1,len(order)-2) if not any(idx[s] in (i,i+1,i+2) for s in st)); nwin=len(order)-2-(f+1)
    es=empty==0; core=share>=0.30 and cov==len(lw) and mg<=8; sig=mg<=25 and (cov/len(lw) if lw else 1)>=3/7
    tot['ES']+=es; tot['CORE']+=core; tot['SIG']+=sig
    yn=lambda b:'pass' if b else 'FAIL'
    print(f"| {r['id']} | {st[0]} | {len(st)} | {100*share:.0f}% | {mg} | {cov}/{len(lw)} | {yn(es)} ({empty}/{nwin} empty) | {yn(core)} | {yn(sig)} |")
print(f"\n{n} mechanics with 6+ later stages: ES window passes {tot['ES']}, CORE passes {tot['CORE']}, SIG passes {tot['SIG']}")
# --- echo (ES 1317): present in either of the next 2 stages after the first, lairs (X-10) skipped ---
nl=[s for s in order if not s.endswith('-10')]; ni={s:i for i,s in enumerate(nl)}; e=0; m=0; miss=[]
for r in d['rows']:
    st=[s for s in r['stages'] if s in ni]
    if not st: continue
    f=min(ni[s] for s in st); nxt=nl[f+1:f+3]
    if len(nxt)<2: continue
    m+=1; hit=any(s in st for s in nxt); e+=hit
    if not hit: miss.append(f"{r['id']}({nl[f]})")
print(f"echo (ES 1317, present in either of the next 2 non-lair stages): {e} of {m} mechanics; not echoed: {', '.join(miss)}")
