# FIX-CARD-DOWN: Dot's card never covers the way on (on a down stage it sits above Pokey) (R-165.456; before BUILD-31)
Engine (UI), Opus 5.5 high. A FRESH member. **BUDGET 1 h; HARD STOP start + 2 h.** Hand over on the 28-minute clock with an EXACT NEXT STEP,
pushed and ls-remote-confirmed first (D134). NEVER a shell '&'; no heredoc in a commit chain (D119); stamps from `date` (D128); no stage id in
engine code; the vite rule for stills (CI #78: refuse a busy port, kill it after each tree, check the served tree).
READ LEAN: ROADMAP R-165.456; ENG-DARK's stills on t-eng-dark-wip (reference/qa-reports/ENG-DARK/stills/3-1-port-rim0-asleep.jpg and
-rim1-lit.jpg: the card under Pokey hides the woken worm and the ledge below); where Dot's card is placed (grep the card layout in src/components
and the stage's travel field: stagePlan / gen2 travel 'down'); tools/perf/clipcheck.mjs (the screen checks); PLAY-STORE-RULES (tap targets);
LESSONS D136 (a look gate tests what is drawn).
BASE: t-eng-w3 at its latest landing (3-1's down row lives there).
1. The card's place follows the way on: on a stage travelling DOWN it sits ABOVE Pokey (upright and sideways); every other stage unchanged
   (lockall + clipcheck prove it). General: read from the stage's travel, no stage id.
2. A planted check: on a down stage, a card covering the landing below him is RED; GREEN after the fix.
3. Stills of 3-1's first dark stop, upright and sideways, before and after, looked at as Matt would on a phone; the paths to the lead.
4. clipcheck (every menu and card, upright and sideways, no new debt), tsc, the suite + the CI tool line; land on t-eng-w3 (merge, no force).
REPORT: reference/qa-reports/FIX-CARD-DOWN/REPORT.md on t-fix-card-down. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock times.
