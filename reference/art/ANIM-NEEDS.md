# Pokey's animation needs, 2-6..3-9 + the special stages of Worlds 2 and 3 (ANIM-NEXT, R-165.349)

Written 4:27 PM ET 11-20 (`date`), from origin/main 6e7b85f8 and the designs on origin/t-design-26, -29, -31-32, -33-35, -36-39 (each
stage's "He does" column, its Art section, and the mechanic rows). Pokey is drawn 89.1 px tall (heroSprite.ts:30,32); clips run at 16 fps
(heroClipsData.ts).

## What he has today (the base every row is judged against)
- Standard set (heroStandard.ts): idle/blink, walk_0-7, run_0-7, jump/rise/apex/fall/land, climb_0-7 (frame by height, so down plays it
  backwards), hang_a-c, swing_*, duck (one still), punch/kick/mega/air attacks, stomp, bounce/spring, hurt/ko, cheer_a/b, turn, skid.
- Moving clips (src/assets/hero/clips): idle-yawn, look-around, belly-scratch, wave, doze (the idle chain after 4 s still), hurt, push,
  cheer (exit), step-back, teeter, move-walk/run/climb/cross/jab/hook/kick/kick2/mega.
- Two-vine climb (hero-climb2, ART 11-13: R-165.178's frames, already in game); rope creep upside down + one-paw still (heroRope.ts);
  vine hang and swing (heroVine.ts); swim (heroSwim.ts, World 6 only).
- Puzzle kit (puzzlePlay.ts drawPokey, Matt's pokey-carry sheet): pick p1-p2, carry stand p3, carry air p4, carry walk p5-p8 (4 frames),
  throw p9-p12, set down p13, bell-rope pull p14, World 2 winch crank p15, lever p16 (p14-p16 are single stills held 0.55-0.7 s); empty-hand
  copies e2-e13 so any item (the mushroom cap included) is drawn in his paws.

## The rows (ranked by first stage)
| # | Action (first stage, beat) | Also in | Verdict | What it uses / what is missing |
|---|---|---|---|---|
| 1 | Ride a wheel bucket up (2-6 b1, 8-20 s a ride) | 2-9 b7 | HAVE | stands idle in the bucket; the idle chain (yawn, doze) plays on a long ride: check it reads as calm, not stuck |
| 2 | Run logs, fight upstream, bounce, post a letter on the pass (2-7) | 2-9 | HAVE | run/jump/bounce; posting is automatic (no gesture asked) |
| 3 | Punch a cage open; lead the line; walk shallow water (2-8) | - | HAVE / ADAPT | punch; "come on" when the line lags = the wave clip played toward them (ADAPT, engine's call); shallow water is the walk under the water's front layer |
| 4 | Hop on the beat, bop snappers, board and ride the King's Barge, ring the court bell (2-9) | - | HAVE | jump/punch/stand; the bell is the kit's p14 rope pull (a held still) |
| 5 | Crocus Rex boss (W2) / Shadow Prowler boss (W3): jab, cross, hook, dodge, jump onto its back | - | HAVE | the fights ship on the standard set + move clips; nothing in bossDefs asks for a new pose |
| 6 | World 2's hidden stage "The Rapids" (self-scrolling lily-pad raft; WORLD-MAP only, NO design yet) | - | HAVE (provisional) | stand/hop on a raft; re-check when it is designed |
| 7 | W2/W3 puzzle rooms: carry, throw, set down, bell rope, winch crank, lever | 3-6, 3-9 | HAVE / ADAPT | the kit poses; the crank (p15) and rope pull (p14) are one held still each: a 3-4 frame turn would read better (job 3, optional) |
| 8 | **Drowsy walk in spores, half speed (3-1 b8)** | 3-3 (puffballs), W1/W5 drowsy zones | **NEW** | today the normal walk at half speed under a screen veil: nothing on HIM says sleepy |
| 9 | Stand still to wake the glowworms (3-1 b2) | 3-4, 3-hidden | HAVE | the idle stand (wakes at 0.7 s, before the idle chain at 4 s) |
| 10 | Climb down a root (3-1 b6, 3-5 b2) | 3-4 | HAVE | climb_0-7 played by height (down = backwards) |
| 11 | Creep upside down under roof roots, hang still over a prowler (3-2 b1) | 3-4, 3-5, 3-7, 3-8, 3-9 | HAVE | heroRope.ts creep + one-paw still |
| 12 | Drop into a fern for cover (3-2 b8) | 3-3, 3-7 | HAVE | land + 1-7's moss wash in cover |
| 13 | **Freeze while a watcher looks (3-3 b4/b9: "waits in the fern, still"; taught as THE FREEZE in 3-5 b4)** | 3-5, 3-7, 3-8, 3-9, 3-hidden ("ducks (still)") | **NEW** | today he just stands (or the idle chain starts: a yawn or a wave mid-freeze is the opposite of hiding). Six stages hang on it |
| 14 | Punch a chime stone / a loose rock (3-3 b2, 3-5 b9) | 3-9 | HAVE | punch |
| 15 | Sit in the moonlight at the end (3-4 b10) | - | NEW (low) | no sit pose; the exit cheer works without it (job 2, or the story keeper's cut-in) |
| 16 | Soft vs loud landing (3-5) | 3-8 | HAVE | land; the loudness is a puff/sound touch, not a new pose |
| 17 | Carry the glow cap, kick it, jump it up, toss ahead/up/down, set it down (3-6) | 3-9 | HAVE | kit poses with the cap drawn in his paws (mushroom variant); check the big cap reads at 89 px on the dark |
| 18 | Find Grandma's thing in a fern: crouch, pull it out (3-6 b1, 3-7 b1, x5-6 a stage) | 3-7 | ADAPT | duck -> pick p1/p2 -> cheer_a; NEW only if that reads flat on the stills (job 2) |
| 19 | **Go slow / tiptoe under the quiet line (200 px/s) (3-7 b1-b3, the stage's hook)** | 3-5 b6 (walk past sleepers), 3-9 | **NEW** | under 200 px/s he shows the plain walk; a tiptoe makes "quiet" readable. Honest risk: a thumb tap-walks (53-131 px/s, stop-start), so it must read in short bursts |
| 20 | Grab a thorn vine, swing, let go (3-8) | - | HAVE | heroVine swing |
| 21 | Hidden stage 3 (The Glowworm River): stand on the raft, hop off and on, duck still, hang, climb, take the keepsake | - | HAVE (+ #13) | its "ducks (still)" beat is the freeze |

## NEW, for the clips (first stage first)
| Clip | First stage | Frames | Loop / one-shot | Must read as, at 89 px on a phone in the dark |
|---|---|---|---|---|
| drowsy-walk | 3-1 b8 | 12-16 at 16 fps | loop | heavy-lidded, head nodding, slow dragging steps: "sleepy", not "hurt" |
| freeze | 3-3 b4 | 8-10 in + 4-6 hold | one-shot, then a breathing hold loop | stops dead, shoulders up, paws drawn to his chest, eyes wide to the side: "holding his breath", never a yawn or a wave |
| tiptoe | 3-7 b1 | 12-16 at 16 fps | loop | high careful steps on his toes, arms up a little, a sly look: "sneaking", slower than the walk |
| sit-moon (low) | 3-4 b10 | 10-14 | one-shot to a held sit | sits back and looks up, content |

Job 1 = drowsy-walk, freeze, tiptoe (3 clips x 2 seeds). Job 2 (only if wanted after job 1): sit-moon, the find, a crank turn.
