# engine-critic notes

Job (lead session_019iachLiuwNTAZUBSJWUmR3, 2026-11-05 ~10:16 AM ET): critic of reference/engine/ENGINE-SPEC.md (engine-spec 7f4373c0)
and the engine code (engine-mixer 7d9ad9a9). Branch engine-critic-spec; push only it; no PR; no HF spend. Report to the lead by
send_message only. Due for the lead's plan: 12:45 PM ET.

Done (files on this branch): reference/engine/CRITIC-SPEC.md (the report), CRITIC-TRACE.md (1,632 rows), tools/engine/trace-rows.mjs +
trace-check.mjs (the count gate), reference/engine/critic-runs/ (every script I ran), reference/research/critic-2026-11-05/ (primary
source read: SMBF Refenes).

Pitfalls I hit: the persisted STAGE-RULES read had a 3-line offset (wc header): cite STAGE-RULES lines from grep -n, never from a saved
dump. STAGE-RULES on ccr-0d59a91c-oy3imz is newer than engine-spec's copy (§0c exists only on ccr).

Open after the report: the spec moved to e0f4f978 (L1636-1734 added: every-world labels, the 1-1 acceptance test, rocks never float),
reviewed in CRITIC-SPEC §3.4; anything later is not reviewed.
