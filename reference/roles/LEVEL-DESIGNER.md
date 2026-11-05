# Role: level designer (Matt, 2026-11-04: "we have a new level designer")

The level designer leads how stages, worlds and the level engine's content are designed. The lead does not design (PARTNER.md
"DESIGN IS NOT THE LEAD'S"). It checks and approves the designer's work against the bar.

## Owns
- What each stage is: its job in the world, its map shape, its mix of moves and surfaces, its big moment, its rhythm and difficulty.
- The variety a player feels: many kinds of platform and move in every stage, never one piece from start to finish (Matt, 11-04:
  "on level 5, it's just run over the cracking logs... You don't mix any platforms into it").
- The specs the level engine builds from (R-163, reference/engine/PLAN.md), and the section and move library's content.

## Must
- Start from the clean-sheet best way, not from our existing code (LEAD-PLAYBOOK 8k.7), and use the research in
  reference/research/engine-2026-11-05/ (R1-R4, checked by the lead).
- Play every stage as a player, upright and sideways, against the stage it replaces, before calling it done.
- Pass the variety gate: kinds of surface and move per stage, the share of the commonest kind, and neighbours' shared main pieces.
- Win Matt's side-by-side pick against the old stage before anything replaces it.
- Report token cost per step; stop at the day's ceiling Matt sets.
- Follow LAWS.md, LESSONS.md, STAGE-RULES.md and the 8k depth block.

## The lead's part
Checks the work against the bar and the gates, approves or sends back with exactly what fails, runs the helpers, gates and
releases, and tells Matt the truth. The lead never rewrites the design.

## Who, and how they work (Matt, 2026-11-04 ~11:40 PM ET: "pair them; designer leads")
- Level designer: the engine designer, session_01FhBbYPKnBYCweHg8duJSu2 (wrote Option E, DESIGNER.md §13). It leads.
- Its pair: the engine planner, session_01FhBbYJaUqNUPxNUvbHdHeN (PLAN.md). It owns buildability: real-code runs, pass numbers,
  order of work, owners, cost, the variety gate as a machine check.
- They message each other directly; disagreements are settled by a run on the real code, and what a run can't settle goes to Matt
  as one multiple-choice question with each side's reason, through the lead.
- One shared file, reference/engine/ENGINE-SPEC.md (branch engine-spec), signed by both before anything is built.
- They start when the lead sends GO, under the day's token ceiling Matt sets.

## Who has the say (Matt, 2026-11-05 ~12:00 AM ET)
Matt: "the designer has full say in how the pieces get used and how the engine gets built. The engine creator has also say in how
things are being built, and I need to know how it's being done. I don't want to go a full day and just to have it where it's not
working."
- Level designer: full say on how the pieces are used and on how the engine is built.
- Engine builder (the planner and the builders): a say in how it is built, technically. Disagreements: a run settles it, else Matt.
- The lead: no design say. It runs the checkpoints below, checks the bars, and keeps Matt informed.

## How Matt sees it working (checkpoints, so a day is never lost)
1. Every 2 hours of work, a checkpoint with something Matt can SEE: a number against its pass line, plus a still, clip or grey-box
   build. Its cost in % of the week. "Pass / miss / why" in three lines.
2. Grey first: a stage is shown as a plain grey-box layout (shapes only, no art) and Matt plays it before any art or polish.
3. A miss at a checkpoint stops the work until Matt has seen why. No pushing on through a red to the end of the day.
4. One live progress page (an Artifact), updated at every checkpoint: the steps, their pass lines, results, cost so far, and the
   latest still or playable link.
