# DESIGN-29: the final design for 2-9 "The King's Drum" (World 2's finale; Matt picked it 6:06 PM ET 11-18), with its flights (pitch.md step 6).
Designer, Opus 5.5 high. Written 6:07 PM ET 11-18 (by `date` in the same command). BOX: 2 h from your start or 40% REAL context; cutoff
11:30 PM ET. A FRESH member: not either pitcher.
Role card reference/roles/DESIGNER.md. Read FIRST reference/methods/level.md (Building rules), LEVEL-BAR.md, then the lead's picks
reference/design/PICKS-29-32.md (on this branch: 2-9 = B's core + A's ending, Matt's pick), then both pitches
(`git show origin/t-pitch-29b:reference/design/pitches/PITCH-29B.md` the drum core, and `git show origin/t-pitch-29a:reference/design/pitches/PITCH-29A.md`
the King's Barge + court bell ending, beats 10-12), the format and bar: `git show origin/t-design-24:reference/design/2-4.md` + DESIGN-24-25's
REPORT (the real tap hop is 0.43 s / 106-119 px from InputEngine; never FakeInput's 0.30/83: R-165.284), the finals 2-6/2-7/2-8
(`git show origin/t-design-26:reference/design/2-6.md` etc.: the toys 2-9 re-uses) and 2-5 (`origin/t-design-24:reference/design/2-5.md`:
snap stones bite on four). STAGE-RULES §0-5b, DIFFICULTY.md (paste targets), LESSONS.md once (D57/D87: call ReadNotifications whenever a
notice says pending, at every push and before every report).
THE IDEA (Matt's pick): every World 2 toy keeps ONE beat you can hear: the liana's swing (2.85 s Normal, 3.3 s Easy) is one bar of four
(0.7125 s / 0.825 s, the clocks' own easyStretch); logs, pads, snap stones, the wheel, lianas all on that beat; hop on the beat and the pads
never sink. It ends on the King's Barge drifting into the shrine steps, the court bell rung on the downbeat (A's beats 10-12; NO guards
aboard: A's guards-on-rafts is parked). Nothing new to learn: the old toys make a song.
Write reference/design/2-9.md built-ready, exactly as 2-4.md: one idea; tributes kept (loved, taught, ours, not copied: Rayman Legends'
music levels, Bit.Trip Runner, Donkey Kong; SMB3's airship for the barge ending); beats table (s, bits, what is there, he does, he feels);
how the beat is TAUGHT in the first 30 s (Dot asks for the story keeper, never lines) and how a player who ignores the beat still finishes
(the drum says WHEN, it never kills: Normal never softened for kid play, but no beat-only death); a node string passing checkCode (run it);
Normal + Easy targets pasted (2-9 Normal 20, Easy at most 12, DIFFICULTY.md); EVERY number flown on the real engine through InputEngine
(rule 24): the hop-on-the-beat margin on a sinking pad (B used JUMP_AIRTIME's closed form: fly it at 30 fps), each toy's clock as a whole
number of beats on BOTH settings, the barge's speed and the bell's downbeat window, what a missed beat costs (time, never a life on the
teach). The engine list (2 NEW max: B's tempo check (S-M) and drum cue (S); file, size, the planted toy that proves each) and its order
(2-9 builds after 2-4/2-5/2-6's engine pieces are merged: name which it uses); the hand build it replaces (w2Stages.ts '2-9', its 14-guard
goal: the new goal in words for the keeper) and its pinned tests (grep); art asks (the barge, the court bell, the throne island backdrop:
Hugging Face, described for the lead) and the drum sound (what it must sound like; ART-SOUND).
Branch t-design-29 from origin/main; flight scripts RELATIVE imports (D83). Gates: tsc (your sims), roadmapcheck (unshallow), knowncheck,
timecheck (`node tools/timecheck.mjs` from origin/t-time-168 if not on main: your stamps from `date`).
End with "Learned" and "Pushback". Report to the lead session_01FhBbYN2CVHnFXg7XzqKXpM with your REAL context % and a time from `date`
run in the same command.
