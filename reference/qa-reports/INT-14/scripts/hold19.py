# INT-14 hold-back of 1-9: the player's 1-9 = main 6e7b85f8's hand-built 1-9 (routing, list, Dot lines, journal, mission, sheets)
import subprocess,sys
def main_line(path, needle):
    s=subprocess.run(['git','show','origin/main:'+path],capture_output=True,text=True,check=True).stdout
    hits=[l for l in s.split('\n') if needle in l]; assert len(hits)==1,(path,needle,len(hits)); return hits[0]
def sub(path, old, new, count=1):
    s=open(path).read(); n=s.count(old); assert n==count,(path,old[:60],n); open(path,'w').write(s.replace(old,new)); 
# 1 routing: the hand-built plan again (protoStage HAND_STAGES), and the stage table's 1-9 row out
sub('src/game/protoStage.ts',"{ '1-1': '1-1', '3-1': '3-1',","{ '1-1': '1-1', '1-9': '1-9', '3-1': '3-1',")
s=open('src/game/gen2/worlds/stageTable.ts').read()
a=s.index("  // (1-9 The Boa's Branches: the designed arc"); b=s.index("  '1-9': { kit: 'w1-19', judged: 'normal-1-9' },\n")+len("  '1-9': { kit: 'w1-19', judged: 'normal-1-9' },\n")
s=s[:a]+"  // (1-9 The Boa's Branches: its designed arc (w1Arc19.ts, kit 'w1-19', judged 'normal-1-9') is held back from release 1 (INT-14): the\n  //  hand-built 1-9 (protoStage HAND_STAGES) ships as main had it until VAR-19's variety is green; its row comes back with it)\n"+s[b:]
open('src/game/gen2/worlds/stageTable.ts','w').write(s)
# 2 its proven list out of the index (the list belongs to the row)
s=open('src/game/gen2/provenIndex.ts').read(); l=[x for x in s.split('\n') if x.startswith("  '1-9':")]; assert len(l)==1; s=s.replace(l[0]+'\n',''); open('src/game/gen2/provenIndex.ts','w').write(s)
# 3 main's Dot lines, journal pages, mission and sheets for the hand-built 1-9
s=open('src/game/dotLinesData.ts').read()
g=main_line('src/game/dotLinesData.ts','["hint.1-9.guard"'); r=main_line('src/game/dotLinesData.ts','["lock.ring.snakes"')
m=subprocess.run(['git','show','origin/main:src/game/dotLinesData.ts'],capture_output=True,text=True).stdout.split('\n')
for row in (g,r):
    i=m.index(row); prev=m[i-1]; assert s.count(prev+'\n')==1,(prev[:60]); s=s.replace(prev+'\n',prev+'\n'+row+'\n')
open('src/game/dotLinesData.ts','w').write(s)
s=open('src/game/movesJournal.ts').read()
old="""    // (it opened on clearing the hand-built 1-9's ring; the new 1-9 (BUILD-19) drops no snakes, so nothing opens it until R-165.281
    //  re-homes it to the first stage that really drops them: the lead's ruling 10:35 AM ET 11-18)
    open: { tip: [], cleared: [] },"""
assert s.count(old)==1; s=s.replace(old,main_line('src/game/movesJournal.ts',"open: { tip: [['1-9', 'ring:go']], cleared: ['1-9'] },")); open('src/game/movesJournal.ts','w').write(s)
s=open('src/game/pokeyJournal.ts').read(); l=[x for x in s.split('\n') if x.startswith("  '1-9':")]; assert len(l)==1; s=s.replace(l[0],main_line('src/game/pokeyJournal.ts',"  '1-9':")); open('src/game/pokeyJournal.ts','w').write(s)
s=open('src/game/stagePlan.ts').read()
old=[x for x in s.split('\n') if "S('gauntlet', \"The Boa's Branches\"" in x]; assert len(old)==1
i=s.index(old[0]); c=s.rfind("    // (1-9 rolls on gen2 from 11-18",0,i); assert c>0
s=s[:c]+main_line('src/game/stagePlan.ts',"S('gauntlet', \"The Boa's Branches\"")+s[i+len(old[0]):]
old2="  // (World 1's only gauntlet is 1-9: the story keeper's (i), reference/story/lines-1-9.md, w1Arc19.ts SEALED_19)\n  '1:gauntlet': 'We passed some of her petals. Back we creep!',\n"
assert s.count(old2)==1; s=s.replace(old2,''); open('src/game/stagePlan.ts','w').write(s)
s=open('src/game/stageSheets.ts').read(); l=[x for x in s.split('\n') if x.startswith("  '1-9':")]; assert len(l)==1; s=s.replace(l[0],main_line('src/game/stageSheets.ts',"  '1-9':")); open('src/game/stageSheets.ts','w').write(s)
print('ok')
# 4 (added) main's first-of tip and the boa's journal tip (BUILD-19 e098427d3 changed both with the routing)
s=open('src/game/dotTips.ts').read(); prev=None
m=subprocess.run(['git','show','origin/main:src/game/dotTips.ts'],capture_output=True,text=True).stdout.split('\n')
row=main_line('src/game/dotTips.ts',"'hint.1-9.guard'"); i=m.index(row); prev=m[i-1]; assert s.count(prev+'\n')==1
s=s.replace(prev+'\n',prev+'\n'+row+'\n'); open('src/game/dotTips.ts','w').write(s)
s=open('src/game/journal.ts').read(); l=[x for x in s.split('\n') if x.startswith("  boa: { id: 'boa'")]; assert len(l)==1
s=s.replace(l[0],main_line('src/game/journal.ts',"  boa: { id: 'boa'")); open('src/game/journal.ts','w').write(s)
print('ok2')
