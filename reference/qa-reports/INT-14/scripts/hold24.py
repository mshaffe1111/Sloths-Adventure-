# INT-14 hold-back of 2-4: the player's 2-4 = main 6e7b85f8's hand-built 2-4 (plan, routing, list, Dot lines, clue, journal, mission)
import subprocess
def show(path): return subprocess.run(['git','show','origin/main:'+path],capture_output=True,text=True,check=True).stdout
def main_line(path, needle):
    hits=[l for l in show(path).split('\n') if needle in l]; assert len(hits)==1,(path,needle,len(hits)); return hits[0]
def swap_line(path, startswith, needle):
    s=open(path).read(); l=[x for x in s.split('\n') if x.startswith(startswith)]; assert len(l)==1,(path,startswith,len(l))
    s=s.replace(l[0],main_line(path,needle)); open(path,'w').write(s)
# 1 the hand-built plan (w2Sections.ts differs from main only by BUILD-24's deletion 81b152fa5) and its W2_STAGES entry
open('src/game/w2Sections.ts','w').write(show('src/game/w2Sections.ts'))
s=open('src/game/w2Stages.ts').read(); old="  '2-3': '2-3',\n  '2-5': '2-5',"; assert s.count(old)==1; s=s.replace(old,"  '2-3': '2-3',\n  '2-4': '2-4',\n  '2-5': '2-5',"); open('src/game/w2Stages.ts','w').write(s)
# 2 the stage table's 2-4 row out, its proven list out of the index
s=open('src/game/gen2/worlds/stageTable.ts').read()
a=s.index("  // (2-4 Never Touch the Bank: the designed arc"); r="  '2-4': { kit: 'w2-24', judged: 'normal-2-4' },\n"; b=s.index(r)+len(r)
s=s[:a]+"  // (2-4 Never Touch the Bank: its designed arc (w2Arc24.ts, kit 'w2-24', judged 'normal-2-4') is held back from release 1 (INT-14):\n  //  the hand-built 2-4 (w2Stages.ts W2_STAGES) ships as main had it until ENG-24's river work is green; its row comes back with it)\n"+s[b:]
open('src/game/gen2/worlds/stageTable.ts','w').write(s)
s=open('src/game/gen2/provenIndex.ts').read(); l=[x for x in s.split('\n') if x.startswith("  '2-4':")]; assert len(l)==1; s=s.replace(l[0]+'\n',''); open('src/game/gen2/provenIndex.ts','w').write(s)
# 3 main's Dot lines (4 rows), clue, Pokey's page and mission for the hand-built 2-4
m=show('src/game/dotLinesData.ts').split('\n'); s=open('src/game/dotLinesData.ts').read()
for key in ('"hint.2-4.deep"','"hint.2-4.vine"','"hint.2-4.island"','"hint.2-4.missed"'):
    row=[x for x in m if key in x]; assert len(row)==1; i=m.index(row[0]); prev=m[i-1]
    assert s.count(prev+'\n')==1,(key,prev[:60]); s=s.replace(prev+'\n',prev+'\n'+row[0]+'\n')
open('src/game/dotLinesData.ts','w').write(s)
swap_line('src/components/stageClue.ts',"  '2-4':","  '2-4':")
swap_line('src/game/pokeyJournal.ts',"  '2-4':","  '2-4':")
s=open('src/game/stagePlan.ts').read()
old=[x for x in s.split('\n') if "S('vine_runner', 'Over the Water'" in x]; assert len(old)==1
i=s.index(old[0]); c=s.rfind("    // (the story keeper's line 6, reference/story/lines-2-4.md",0,i); assert c>0
s=s[:c]+main_line('src/game/stagePlan.ts',"S('vine_runner', 'Over the Water'")+s[i+len(old[0]):]; open('src/game/stagePlan.ts','w').write(s)
print('ok')
# 4 (added) main's w2Stages.test.ts (it differs from main only by BUILD-24's 2-4 removal); vineSnake.test runs 2-4 again beside 1-6 (applied by hand, see INT-14 REPORT)
