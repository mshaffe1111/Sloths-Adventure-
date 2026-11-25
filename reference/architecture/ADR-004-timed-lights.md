# ADR-004: a dark-zone light may carry a clock (World 3: the spore puff's light; R-165.449, 2026-11-25)

**Decided by:** the lead, standing in for the Architect on a one-field change, so as not to start a session for it. ENG-DARK proposed it
(t-eng-dark-wip f0a79bc1f, REPORT: "Light API for ENG-SPORE"). **Types:** src/game/gen2/types.ts, Zone.lights. **Built on:** ENG-DARK's
one dark brick (gen2/dark.ts; World 6's darkZone lifted). **Replaced this sprint by:** nothing (D40).

## Context
- 3-1's design (t-design-31-32 3-1.md :12, :49): a spore puff lights the shaft only while it glows (warn 1.0 s + active 2.2 s of a 6.4 s
  cycle), and the player drops on that light. Today a dark-zone light is always on or woken by stillness; nothing has a clock.
- The 'every gap lit 1 s ahead' verdict (darkGaps) must count a timed light only when its lit window covers the drop.

## Decision
- A Zone.lights entry gains ONE OPTIONAL field: a clock (period, the lit window's start and length, an offset). With the field unset, a
  light behaves exactly as today, so every shipped light is unchanged (lockall proves it at ENG-SPORE's landing).
- The draw lights a clocked light only inside its window. RimWatch's lit() returns the window's start. darkGaps counts a clocked light
  only when its window is at least DARK_AHEAD plus the drop's air time.
- No per-frame allocation, so the light ring's cost is unchanged (PERFORMANCE-RULES §1; drawcheck at the landing).

## What it rules out
- A second light system for spores or any later timed light (3-4's moving moonbeam ENG-MOON uses the same field and adds motion).
- A light that is lit on a clock but never judged: darkGaps reads the same field.

## Consequences
- ENG-SPORE adds the field and its readers; toy: the light off, the bot waits forever (RED); no warn, fairness RED (3-1.md :49-50).
