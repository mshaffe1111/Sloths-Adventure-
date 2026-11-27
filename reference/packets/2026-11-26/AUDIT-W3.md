# AUDIT-W3: every World 3 design (3-1 to 3-9) run through the REAL engine, so every missing piece is known at once (Matt 11-26: "Shouldn't you be telling the helpers to make sure that they're getting all the pieces in?"; R-165.497/.498)
Architect, Opus 5.5 high. A FRESH member each box. **3-1 to 3-4 by 9:45 PM ET Thursday; 3-5 to 3-9 by 11:15 PM ET (or Friday 10 AM ET at the
latest).** Hand over on the 28-minute clock or at 300k with the EXACT NEXT STEP pushed and ls-remote-confirmed first (D134). NEVER a shell '&';
long runs with run_in_background AND timeout 7200000; no heredoc in a commit chain (D119); stamps from `date` (D128); NEVER a force-push. A wait
for a ruling times out at 20 minutes on your own reversible recommendation (CI #89). NO engine or level code lands from this lane: scratch
trees only; your output is the REPORT and the codes.
WHY: we keep finding missing engine pieces one at a time, inside builds (2-8's fork count on its third box; 2-9's six gaps G1-G6 and the
stone; 3-1's dark piece 26 boxes). Each one stops a build for hours. READY checked a design on paper; it never rolled the design's node
string through the pipeline. Matt chose (R-165.498): find every missing piece up front; trim each design to the pieces we have plus at most
ONE new one; build the pieces side by side; then the levels build straight through.
READ LEAN: the nine designs (origin/t-design-31-32: 3-1.md, 3-2.md; t-design-33-35: 3-3..3-5; t-design-36-39: 3-6..3-9) and PICKS-19-22.md
there; reference/methods/level.md (the Building rules; how a designed code is written: nodeLetters.ts, the 2-3/2-7 brick form, w2Arc28.ts);
the World 3 kit on origin/t-eng-w3 (88592a9c4; ENG-DARK-z's 3-1 fix lands there tonight) and origin/t-eng-spore-wip (5dd854b15, the spore
piece, approved code 8477445a5); the inventory (src/game/art/inventory.ts) for World 3's art.
FOR EACH LEVEL, 3-1 first, in order:
1. Write its designed node string on today's kit (a code file in reference/qa-reports/AUDIT-W3/codes/, the builder's starting code), every
   beat mapped to a brick, piece or cast row that EXISTS, or marked MISSING with what it needs.
2. ROLL IT for real in a scratch tree (t-eng-w3 + t-eng-spore-wip merged; the level registered only in scratch): libstage (or the stage's
   pipeline) --seeds 4, both settings. Every throw and refusal named with its line. A beat that rolls is PROVEN; a beat that cannot is MISSING
   with the engine line that refuses it. Paper is not proof.
3. The art: every piece the design draws, in the inventory or MISSING (Hugging Face job named, with size against Pokey).
4. The lines: is reference/story/lines-3-N.md written (the keeper's)?
5. THE TRIM (for the lead to rule): the level's ONE signature new piece (the one that makes the level), and for every other MISSING piece the
   nearest existing piece that keeps the beat's job, or 'cut the beat' with what the level loses.
THE TABLE (top of the REPORT, one row per level): level | beats proven / total | MISSING pieces (engine / art / lines) each with size S/M/L
and the lane it needs | its signature piece | the trim proposal | build-ready: YES / after <pieces>.
Send the lead 3-1 to 3-4's rows as soon as they are done (the lead rules the trims and starts the piece lanes at once), then 3-5 to 3-9's.
REPORT reference/qa-reports/AUDIT-W3/REPORT.md on a branch t-audit-w3 (cut from origin/t-eng-w3). Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
Messages carry no clock times. Never a model name in a commit beyond the standard attribution line.
