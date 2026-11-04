# w8-rope2 notes (helper; branch w8-rope2 only)

Updated: 2026-11-04 08:00 ET. Base: origin/ccr-0d59a91c-oy3imz at 4d458021.

## The job now: R-159.1, the combat triangle for World 1 (lead brief, 2026-11-04)
- Stomp vaults and bounces higher (hold jump) over pits; punch stuns (~1.5 s) and knocks back shots; kick breaks shields/armour and sends
  an enemy rolling into others or a switch. One readable trick per World 1 species with a ~0.5 s warning, tied to platform roles; ~1/3
  of each stage enemy-free; no enemy within 150 px of a landing. Easy stays a cruise; Normal bites (STAGE-RULES §0.5).
- **Plan first.** No game code until the plan is approved AND GPU stage 0 is merged into the lead branch; then I hold engine.ts (order:
  R-159.1, then R-160.1). Merge the latest base before starting and before every push.
- Plan (one page) goes to the quality supervisor (session_01FhBbYNn4i5tFfFZiFroKoi) AND the lead. Show-first: a mock-up clip or stills of
  the new moves before building them in. HF art: a picture list for Matt with cost; no spend without his approval ($72 left in all).
- Method: none exists for enemies. I write reference/methods/enemies.md.
- Status: lead OK'd the onboarding (2026-11-04 08:00 ET); plan written (reference/plans/R-159.1-combat-triangle.md) and sent to the lead and the quality supervisor. No game code yet.
- Lead, 11-04: put a "Polish check" section in every report; World 1 bot runs with rescues don't count until R-150.7 (mushroom walls).

## Facts checked in code (2026-11-04)
- engine.ts ~4170-4178: a kick doubles the score (`* (kick ? 2 : 1)`) and the burst; `airKick` sets vy -420 (bounces him up). Melee
  results already carry `armored` ("TOUGH!") and `interrupt` (staggerPredator). Stomps: resolveStomps / stompTest / stompChain.
- World 1's animals (validator mechanics-world1.md): snakes (1-3, 1-5, 1-6, 1-8, 1-9), boas and a snake ring (1-9), eagle (1-7),
  little snakes in the Venom Fang fight. Every snake today is a roadblock answered by one punch (world1-baseline.md).

## Pitfalls I have paid for (and how I avoid them)
- Trusting a bot's numbers (Nov 1: the old first-timer's hops made a bloom "fix" look needed). Watch the bot move before using it.
- A fix right for one world can be wrong in another (the rope catch caught him on lower ropes in climbs). Run every stage with the
  changed thing before and after.
- Changing a shared section re-curates every stage that draws it (8-5). List every user of a piece before changing it.
- Times and ids are pasted from a command, never typed (I gave the lead a wrong commit prefix on Nov 1).
- Never force-push: w8-rope2 is reset to the lead branch only when the old work is already in it (a fast-forward), as on 11-04.
