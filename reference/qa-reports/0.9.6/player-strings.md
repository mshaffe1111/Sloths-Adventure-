# 0.9.6: every player string changed from main 181d2846 (release-0.9.6 @ 06bbd29f)

Found from `git diff 181d2846 06bbd29f -- src` (tests and seed data left out), every added or removed string literal and every JSX
label read. Sent to the lead for the story keeper 11-11; the What's New entry is the story keeper's own words (approved 5:41 PM ET).

## New (INT-1-1: helpLadder.ts, HelpOffer.tsx; the story keeper's words, reference/specs/help-lines.md §1-3)
| Where | Touch | Pad |
|---|---|---|
| Dot, 3 set-backs, single jump | Run first, then flick up and forward! | Run first, then hold Jump. Big one! |
| Dot, 3 set-backs, double jump | Jump, then flick up again in the air! | Jump, then hold Jump again in the air! |
| Dot, 3 set-backs, bounce | Land right on the mushroom. Boing! | Land right on the mushroom. Boing! |
| Easy, 8 set-backs, the steps grow | Ooh, look! A step. Up you go. | (same) |
| Normal, 12 set-backs, the offer card | Want a little step? I won't tell anyone. | (same) |
| Normal, the re-ask 8 set-backs after a no | Still want that step? It's yours. | (same) |
| The offer card, screen-reader labels only | "Dot offers a step"; YES "Yes, a step"; NO "No, I will jump" | (same) |

## Changed (R-165.57, CoachOverlay.tsx COACH_TEXT.pad, the lead's words 5:39 PM ET)
| Step | Was | Now |
|---|---|---|
| jump (sub) | Tap the Jump button to leap. Tap it again in the air for a double jump. | Tap the Jump button to leap. |
| nice (sub) | Hold Jump a little longer to go higher. | In the air, hold Jump again for a double jump. |
Titles "Press Jump" and "Nice jump!" and the run line "Push the pad to run" are unchanged.

## Silenced in 1-1 (words unchanged; still said elsewhere)
- "No soft moss up here!" (engine.ts: every fall in 1-1 is soft now, so the line would be false).
- "This way, Pokey! Try over here." (the old stuck helper is quiet while the help ladder is on).

## The testers' survey (#ctest, QA builds only)
- `w1-fallen-trunk-13` (1-3's copy of the fallen trunk) reuses "the tall steps (double jump)": no new words.

## What's New, 0.9.6 (top entry)
Into the Canopy, rebuilt
- Into the Canopy, the first stage, is rebuilt with new paths to explore.
- Play it again and the paths change, so each run is a new one.
- Stuck on a jump? Dot can help with a little step up.
- The camera follows Pokey smoothly on his big bounces.
