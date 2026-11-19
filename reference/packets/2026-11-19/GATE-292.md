# GATE-292: a gate that fails when a block with a painted style draws through code-drawn terrain (R-165.292), and the fix at its cause.
Tools + engine draw, Opus 5.5 high. Written 7:56 PM ET 11-18 (by `date` in the same command); pulled forward into tonight's free slot.
BOX: hash by 11:15 PM ET (cutoff 11:30) or 400k REAL context, with the EXACT NEXT STEP pushed. A FRESH member. Keep reads lean.
Role card reference/roles/ENGINE.md. Read FIRST: LESSONS.md once (D57/D87: call ReadNotifications whenever a notice says pending, at every
push and before every report; long commands in the BACKGROUND; D59, D81, D86, D88: a new gate plants the repo's look-alike shapes and is
run over every open branch before approval), the ROADMAP row R-165.292, VAR-1b's finding in origin/t-var-1 reference/qa-reports/VAR-1/REPORT.md
(1-7's landing:true log grew to 53 px and drew as terrain 'ground', a flat code slab, 16/16 rolls), STAGE-RULES §4 (painted, never
code-drawn), src/game/protoArt.ts paintedPlatforms (a 'log' paints only under 50 px), isPaintedRock (exactly 50 px).
WHY (Matt's hard rule): anything that carries the look is painted. Tonight 1-8's knot rests drew as grey slabs and 1-7's grown log drew
as a code slab; nothing caught either: a size crossed a painter's limit and the block fell through to code terrain silently.
BASE: branch t-gate-292 from t-int-12 @ ce4ad461 (tonight's test-link tree).
1. The gate (a lay verdict or drawcheck, your call with a reason): for every stage, every listed seed, both settings, any block whose
   style has a painter that then draws through code terrain (the fall-through) is a breach, printed with stage, seed, x, style, size and
   the painter's limit. Planted: a 53 px landing:true log (RED), a 49 px log (GREEN), a 50 px rock at the isPaintedRock edge, a style with
   no painter at all (not a breach: say why). Run it over every shipped stage and every open branch's stages (D88) and list what it finds.
2. The cause: either the painter covers the sizes the lay makes (art scales within its look) or the lay refuses a size its painter can't
   draw: pick at the root and say why; never loosen the gate. If shipped stages breach today, list them with stills; fix only what is
   small and planted here, the rest named for the lead (no level data changed without a ruling).
3. Checks: the CLAUDE.md list for a draw change (tsc, the suite in the background, BASE_PATH build + chunkcheck, artcheck, drawcheck,
   knowncheck, generality, roadmapcheck, timecheck from origin/t-time-168b if not on main, the CI tool line with your test added,
   lockall vs main: no layout may move unless the lead rules).
REPORT reference/qa-reports/GATE-292/REPORT.md: hash, the rule as coded (file:line), planted results, every breach found (stage, seed, x,
style, size) with stills, the root fix, gate table, Learned. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM; every message carries REAL
context % and a time from `date` run in the same command.
