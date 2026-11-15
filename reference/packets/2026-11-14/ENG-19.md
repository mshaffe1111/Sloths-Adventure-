# ENG-19a / ENG-19b: 1-9's engine pieces and bot skills, so 1-9 builds from data in under 2 hours (R-165.257). Opus 5.5 xhigh (engine). Written 7:43 PM ET 11-14.
Role card: reference/roles/ENGINE.md. Read level.md rules 21-22 first, then ONLY: reference/design/1-9.md on origin/t-pitch-b (whole: its
engine list is lines 44-54) and reference/specs/sims/boaFreeze.ts there (the flight); predators/world1.ts:45-75; castPlay.ts and core.ts
where the boa and the eagle step (grep, D66: reuse what exists).
Why: 1-9 is "be the bait". Every piece below is for ANY stage in ANY world (boas live in Worlds 1, 7, 8), planted, proven on a toy.
Story keeper (7:44 PM, lines-1-9.md on t-story@1d541107): a punch is a BOP only in the window after a missed strike (self-defence), the boa
wobbles with stars and an offended head-shake, never hurt, and a bop never beats a boa for good (it passes; only the forest sends it away).
Lead rulings: BOA.tell 0.8 -> 1.0 s (the flight: 13 frames to freeze on Normal, 7 today = unfair); Easy keeps its own row's multiplier.
ENG-19a (first slot, box 2 h): NEW 1 the rear 1.0 s + every boa stage in Worlds 7 and 8 re-run by its bots and its lock (list what moved);
NEW 2 boa cast rows in w1Cast.ts (data, copying the snake rows); NEW 3 the roost lure row in w1.ts + the 'l' node letter (nodeLetters.ts and
its test) + the roost's inventory row (art from the inventory, or ONE Hugging Face job, cap $2, logged in reference/art/HF-SPEND.md: a harpy
nest on a stick platform in a LIVING giant's fork, most often a kapok (story keeper 7:44 PM: never a dead snag), sized to Pokey's 89.1 px); NEW 4 the freeze moment (0.6 s of the existing slow motion when a boa is beaten by
stillness inside its reach; never while the eagle's eye is out).
ENG-19b (next slot, box 2 h): NEW 5 the six bot skills in tools/inspect/castBots.ts / firsttimer.ts: freeze-in-rear, creep, punch-the-miss,
drop-the-load, walk-past-the-roost, call-the-eagle; each on a planted toy that goes red with the skill removed; all five tiers.
Branch: t-eng-19 from origin/t-eng-b6 (its final head, git ls-remote), then merge origin/t-tools-2@19b45a06 (both sit on t-int-9; the per-setting helper src/game/settingDials.ts must be in before you touch any per-setting dial). 19b continues 19a's branch.
Proof (each): planted tests named, the WHOLE suite on your head, lockall --check with every moved stage listed and re-proved, clips of each
piece on a toy upright + sideways with the frame named (D69). NODE-KEY rows set "Now". REPORT reference/qa-reports/ENG-19/REPORT.md with
"Learned", ENGINE-WORTHY and EXACT NEXT STEP for the 1-9 builder. Stop at 40% real context. No shell wait loops. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
