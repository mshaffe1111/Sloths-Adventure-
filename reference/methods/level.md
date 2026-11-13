# How to make a level (the method every level builder reads, all of it). First written by W1C after making 1-3, 2026-11-12
A level is DESIGNED by a person, then built as data, then PLAYED by the bots and LOOKED AT on a phone, before anyone is told it is done.
`reference/STAGE-RULES.md` holds Matt's numbers; `reference/design/LEVEL-BAR.md` is the score sheet; this is the order of work.

## Building rules (ranked; each with the check that enforces it)
1. **One idea, said in one sentence a player could repeat.** Write it first. Check: top of `reference/design/<stage>.md`; LEVEL-BAR A1.
2. **The idea is taught safely, used, turned, then asked for in full, in that order on EVERY roll.** One graph, one piece a beat, each with a job no other piece in the pool has. Check: the stage's plan test (`tools/engine/library13.test.ts` "the arc beat for beat").
3. **Matt's verdict-enforced rules beat your design table** (flags, hearts, reach, fairness). If your table disagrees, the table is wrong; say so in the doc. Never loosen a rule to fit a level.
4. **Nobody is hurt in the story, and Easy is never harder than Normal in any number.** Check: the kit's fairness tests; count both settings.
5. **Nothing strands him.** Nothing one-way before an exit that can seal; every goal item can be reached from where he meets it. Check: the bots end `shrine`, never `stranded` (`castBots.ts`).
6. **Dot teaches BEFORE the thing, with time to read:** a teach line 800 px or more before what it teaches (3 s at a walk), nothing that hurts in between, listed in the kit's `teachTips`. Check: a distance test on the built stage.
7. **The first of everything is safe** (first enemy asleep or with the tool beside it; first use of a mechanic cannot fail).
8. **Each beat's whole question fits ONE upright phone screen from where he decides** (the tool, what it acts on, the danger), and nothing he needs is behind the HUD sideways. Check: stills of every beat, 412x915 and 915x412, judged by you as a player; put the measured px in a test.
9. **Every piece in the stage is the stage's own**, links and rests included. Check: the pool test refuses another stage's section; `npx tsx tools/validate/funcheck.ts` "looks like".
10. **What the name promises is on screen** (Branch Snakes had no branch for half a day). Check: your own eyes on a still.
11. **Look at every new piece at every size it is laid.** A style name is not a picture. Check: a still per piece.
12. **Every rule you add comes from a failing test, and every test is proven by a planted fault.** Check: `python3 reference/qa-reports/<you>/planted-faults.py`: all CAUGHT.
13. **After a stage changes builder, the WHOLE suite runs before anyone plays it.** Its own tests are not enough.
14. **Every gate runs on the exact head you report; cut scope, never a check.** Say which head each number is from.
15. **Read the result before you commit.** Never chain a test and `git commit` in one command; never `git add -A` in a side worktree.
16. **No stage id, seed or x in engine code;** a level's facts live in its world's data. Check: `npx tsx tools/engine/generalitycheck.ts`.
17. **No player words but the story keeper's.** Ask the lead for lines; hold them verbatim in a test.
18. **Name every rough spot plainly in the report.** Stand-in art, a bot that cannot do something, a number you did not measure.

## The steps (in the order I would do them now)
1. **Design doc** `reference/design/<stage>.md` (60 lines or fewer): the sentence, the beat table (what is there, what he does, what he feels), the rules as checks. Score it on LEVEL-BAR.md before building.
2. **Arc file** `src/game/gen2/worlds/<world>Arc<nn>.ts`: the graph code (`A T P M R X R W R S R C E` style), the brief (`dealExact: true`, its `cast`), one brick per beat, the stage's own arrival, rests and exit, its lines. Hook it in the world's kit (`w1.ts`) and give it a row in `stageTable.ts`. Delete the old stage (new replaces old).
3. **Roll it:** `npx tsx tools/engine/library13.ts --seeds 24` (copy this tool for your stage): CLEAN on both settings, the same beats in order, and READ the counts (animals, traps) on both settings every time you change anything.
4. **Tests as you go** (`tools/engine/library13.test.ts` is the model): the plan, the counts, each phone number, each line, Easy against Normal. Plant a fault for each.
5. **Stills from the real game:** `npx vite --port 5199`; `PW=/opt/node-tools/node_modules/playwright/index.mjs node tools/engine/runs/trap-stills.mjs 5199 <out> game <stage> 1 <n>` and `stills-at.mjs ... <x>:low`. Do not save any file in the repo while it shoots (the page reloads). Judge every still upright and sideways; fix; shoot again.
6. **Bots:** `npx tsx tools/inspect/castBots.ts --stage <stage> --seeds 1-6` (then 1-40): every tier ends at the shrine on both settings, no run under 2:00, the lesson is used (first trap sprung), hits per run.
7. **The whole suite, the lock, the gates** (CLAUDE.md "Checks") on frozen worktrees (`git worktree add --detach`), so you can keep working. The lock must show ONLY your stage changed.
8. **Report:** REPORT.md with "EXACT NEXT STEP" first, the numbers with their heads, a polish check naming each still, your mistakes and the standard each changed.

## Traps (what went wrong on 1-3, and what catches it now)
- **Filing a stage under another stage's id** to borrow its flown rows hid that its pool held the other stage's sections: 119 of 120 rolls "clean", and not a level. Give the stage its own id, row and pool from the first roll.
- **Placement against reading time:** a line placed where the thing comes into view is read too late. Rule 6.
- **A design table against Matt's rules:** I designed 3 flags; his rule lays 12. Rule 3.
- **Links that are another stage's:** funcheck read 1-3 as 1-1 until it had its own rests. Rule 9.
- **A kit hook that moves an animal after the lay** made Easy drop it silently. Count both settings after every change (step 3).
- **A block ON a piece is `main` unless told:** a flag stood on a snake's log and emptied its socket.
- **Easy lays Normal's kinds, then cuts by count:** the piece your level is built round may be what it cuts. `Socket.easy: 'stay'`.
- **Green tests with the wiring missing; a tool script outside tsc crashing in the background.** Rule 12; run a tool once in the foreground after editing it.

## World 1 notes (World 1's own; later worlds add their own section)
- World 1 paints a log-style block 24-26 px thick as its fallen log; 50 px thick it is a green hedge, and over 400 px long it is two pieces with a seam.
- An upright phone shows about 425 px of stage, 270 px past where he stands at a handle; sideways about 150 px over his head is behind the goal sign.
- No made things in World 1 (no posts, no rope): a rope is a vine between living trunks (the lead, 11-12).
- The snake: shy, 0.5 s rear, strikes where he WAS; every ending is the glide. Drop traps: `predator-kit.md`.

## Learned, level by level
| Level | Builder | Better or worse than the last level | Rule changed |
|---|---|---|---|
| 1-3 | W1C (Fable), 11-12 | First level designed before it was built; first with a cast and traps by data | Rules 1-18 written |

Rule changes are proposed by builders in their REPORT's Learned section and approved by the lead after each level's retro.
