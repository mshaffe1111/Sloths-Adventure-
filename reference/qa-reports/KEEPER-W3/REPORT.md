# KEEPER-W3: lines-3.md reviewed against World 3's trimmed codes (written 9:23 AM ET 11-27)

## EXACT NEXT STEP
Review DONE for all nine stages and the hidden stage. Next is the lead's, two rulings (my recommendation in brackets):
1. 3-7's trim cut the arch-shadow secret, which was the hidden stage's only door (3-hidden.md:3-4). Does The Glowworm River keep a door
   in this build? [Recommend: no door this release; 3-H's lines stay ready; 3-7.dot.river is held until a door exists.]
2. No trimmed World 3 code lays a jaguar (3-7's C went to one passing ocelot). Where is it met first? [Recommend: the lair 3-10, or
   wherever the lead puts it, with 3.teach.jaguar said 800+ px before it beside a fern.]
Builders: copy lines by id from reference/story/lines-3.md ("Stable ids"); 3-1 and 3-2 are ready now.

## Changed lines, old -> new (verbatim; approved under Matt's 11-13 authority)
| Id | Old | New | Why |
|---|---|---|---|
| 3-1.teach.still | Stop at the edge. Glowworms wake for still sloths! | Stand still. Glowworms wake for still sloths! | Trim a: T is on the dark shelf walk, no drop under it, so there is no edge |
| 3-1.dot.sky | Oh. Oh, Pokey. There's a whole sky down here. | Oh. Oh, Pokey. They all woke up for you. | Trim b (approved with all nine): one big wake on the last rim, no wide sky |
| 3-2.teach.still (NEW) | (none) | Prowlers on the floor! Hold still, they lose you! | V11 fix C r -> g: his first floor with prowlers; "hang high" cannot help there; holding still beats an ocelot, lit or not (world3.ts:18, core.ts:242-243) |
| 3-2.teach.glow (MOVED) | before beat 9 (the combine's root patches) | before S (the den root's patches); words unchanged | Said before a ground C it would tell him the dark floor is safe; lit = seen only lifts their sight UP (t-eng-dark-wip core.ts:258-265) |
| 3-3.sealed | Some prowlers are still up. Ring them home! | Prowlers still up back there! Send them home! | C x -> g: no stone at C, so "Ring" could send him to a stone that is not there |
| 3-5.teach.loud | Thump, and vines wake! Climb down, or land soft. | Shh! Big thumps wake vines. Little drops are quiet! | T h -> g (a walk, no #soft): the root down and the soft drop are gone |
| 3-5.teach.moss | Moss is quiet. Punches are not! | Moss is quiet. Drop onto moss, not stone! | C m -> b: the punch rock and fern nook are cut; said before the first moss landing |
| 3.teach.jaguar (HELD, was 3-7's) | before 3-7 beat 8 | words unchanged; said before the first jaguar any stage lays, beside a fern | &eyes -> one passing ocelot, m -> c: no jaguar and no fern cover in 3-7's C |
| 3-7.dot.river (HELD) | at the arch shadow's secret | words unchanged; said only if a door to the hidden river is built | The shadow puzzle is cut; the guarana sits in a plain fern |
| 3-7.find | the find behind the arch | the find in a plain fern at H; name unchanged "The Golden Guarana" | Trim |
| 3-9.teach.hold (MOVED) | before beat 7 (the preview) | before the last P (V -> P), else before S; words unchanged | The preview is cut; carried light still repels (ENG-WAYS) and S needs it |

Re-pinned by node letter only (words unchanged): every T/W/C/S placement, because the trims moved the beat numbers. Unchanged and true on
the trims: 3-1 puff, mission; 3-2 hang (now over a walkable floor), mission; 3-3 chime, yawn, bait, mission; 3-4 all four lines (no line
promised a soft miss; the respawn to the storey below breaks none); 3-5 wake, oldest (cut, not moved, if S loses the scripted look),
mission; 3-6 all lines (the toss teach on a walk keeps its words); 3-7 listen, mission, names; 3-8 all; 3-9 bait, ring.go, lair,
mission, sealed, ring.open; the hidden stage's lines; every journal tip and Pokey page.

## Ids
Every row in lines-3.md carries one (`3-N.teach.key`, `3-N.dot.key`, `3-N.mission`, `3-N.sealed`, ...; scheme and the off-table ids in
"Stable ids"). A builder's test keeps a verbatim table keyed by id and asserts each shipped string equals it; comment, commit and
REPORT cite "lines-3.md <id>".

## Checks
Every new line counted with wc -w (7, 9, 9, 8, 9, 8: all under 10); no freeze/winter/snow word; Dot is she; no prowler hurt; no new
character; no line repeats another stage's tip (3-7's passing ocelot gets no line: taught in 3-2).
Lessons applied: D130 (beats cited by node letter, not position); D139 (read the engine before writing a rule: core.ts sees/upOf);
D134 (next step pushed and ls-remote checked before the hand-over); D128 (stamps from date). One miss, owned: the first commit's
command wrote this report with a heredoc in the same chain as the commit (D119); the second commit uses no heredoc.

## Learned (for the next keeper)
A trim that swaps one content letter can move a danger from one beat to another: check where each danger is FIRST met in the trimmed
code (3-2's ground prowlers, 3-7's jaguar), not only the beat the trim names.
