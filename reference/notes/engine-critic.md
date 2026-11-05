# engine-critic notes

Job (lead session_019iachLiuwNTAZUBSJWUmR3, 2026-11-05 ~10:16 AM ET): critic of reference/engine/ENGINE-SPEC.md (engine-spec 7f4373c0)
and the engine code (engine-mixer 7d9ad9a9). Branch engine-critic-spec; push only it; no PR; no HF spend. Report to the lead by
send_message only. Due for the lead's plan: 12:45 PM ET.

Done (files on this branch): reference/engine/CRITIC-SPEC.md (the report), CRITIC-TRACE.md (1,632 rows), tools/engine/trace-rows.mjs +
trace-check.mjs (the count gate), reference/engine/critic-runs/ (every script I ran), reference/research/critic-2026-11-05/ (primary
source read: SMBF Refenes).

Pitfalls I hit: the persisted STAGE-RULES read had a 3-line offset (wc header): cite STAGE-RULES lines from grep -n, never from a saved
dump. STAGE-RULES on ccr-0d59a91c-oy3imz is newer than engine-spec's copy (§0c exists only on ccr).

Done 10:56 AM ET: §9 (the lead's a, b). Done 11:20 AM ET: §10 (era all worlds both settings, CP1 + move counts on old W2-W4, Smith 2009 fetched). Next: re-review of the designer's rulings 1:00-1:45 PM ET (send_later trigger trig_01XJPM2rS5CWvmBGDR9x5u6Y). Local-only patch in both worktrees: eraRoll.ts:264,:344 ERA_EASY switch.
Lead 12:46 PM ET for the 1:00 re-review: send the report to the designer (session_01FhBbYPKnBYCweHg8duJSu2) AND the lead; polish
(pictures, backgrounds) moved to next week, judge the CORE engine only (rules, gates, data, root fixes); review branch engine-core (new,
from main, D40) if it exists, else engine-spec + engine-mixer src/game/mixer and tools/engine. Due 1:45 PM ET.
