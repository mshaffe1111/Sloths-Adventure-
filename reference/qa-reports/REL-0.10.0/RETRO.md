# Release 0.10.0 "Across the river": debrief (the lead, 11-20, written 5:54 PM ET by `date`)

LIVE: PR #75 merged 4:37 PM ET (795c3183); publish run 112 CANCELLED on a CI job limit; PR #76 (seed-list job 25 -> 45 min) merged
5:20 PM ET; publish run 113 SUCCESS 5:43 PM ET, Pages run 203 SUCCESS; gh-pages "Publish 107870f": its bundle carries 0.10.0, "Across the
river" and the #ctest page (the container's network blocks github.io, so the live title was checked in the published files, not a browser).
APK: v0.10.0-45 (and -44 from #75) on Releases.

## Right
- Every gate (THE FULL SET, gates.md) PASS on the exact release head, funcheck's 22 inherited lines named with R-ids, not hidden.
- Matt played the candidate (test link #3) before "push"; the lead played 1-9/2-4/1-6/2-2 itself, both orientations, before publishing.
- The release member's truth check caught three bad What's New lines (2 over 90 chars, "New stage" for existing names, an untrue line).
- Rough spots named in the PR; the 1-6 grass tab proved pre-existing on main before it could hold the release.

## Wrong
- The publish failed on a CI time limit no local gate measured (D99): Matt saw a release that did not go live for 45 minutes.
- Matt could not find the merge button at first (a 446-commit PR; the merge box sits below the whole timeline).
- The lead's What's New draft would have failed its own test and told players something untrue.
- Today's process misses behind the release: D76 REPEAT 2 (a member at 507k read as 330k), D94 (inherited-red mislabel), D96 (the packet
  gate list missing five CI gates), D97 (a member blocked 27 min on a permission prompt), D98 (an HF batch lost, about $2.06).

## Stop
- Stop pointing packets at CLAUDE.md's Checks paragraph (it lacks five CI gates): gates.md THE FULL SET.
- Stop taking any member's context number from its message.
- Stop handing over player words uncounted and unchecked (dispatch-packet.md).

## Continue
- Integration in stages (INT-14 early branches, then late joiners, then a release member on a fresh branch from main): main stayed clean.
- One-batch check-ins with list_sessions (D97) and real context reads.
- Show-first on art and animation; per-piece HF pulls (D98).

## Countermeasures written (each a standard, not a promise)
release.md 4b (CI job times vs limits before the PR) + R-165.352 (shards by measured time; a gate when one nears its limit);
dispatch-packet.md "Player words in a packet"; LESSONS D94-D99; LSW check-in lines; gates.md THE FULL SET.

## Numbers
Members today about $171 (three morning sessions unrecorded) + Hugging Face about $8.1 of today's runs (balance about $44.12 before batch 2).
Escapes to Matt: 1 (the publish delay; caught and fixed by the lead within the hour, Matt merged the fix). Defects found after release: 0 so far.
