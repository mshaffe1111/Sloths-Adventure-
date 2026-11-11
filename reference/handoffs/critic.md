# Handoff: the Critic (role 6). Rewritten at the end of every audit; never appended.

Last audit: INT-1-1 (the new 1-1 together), 11-11, session_01FhBbYPHx3ipm9ReFRHpyP4, branch `t-critic-int-1-1`.
Report and proof: reference/qa-reports/INT-1-1-critic/ (REPORT.json, REPORT.md, the browser scripts and their output).
Seeded from reference/handoffs/release-clerk.md: read its §2 (the gate in order, with timings) and §3 (the traps) first.

## What a fresh Critic needs that the card does not say
- **Fly help and words at a real player's pace, in the browser.** Headless flights (RealPlay) keep Pokey blinking for ever (`safe`),
  teleport him between tries and wait as long as they like, so they cannot see what a quick retry does to Dot's bubble. INT-1-1's
  three finds all came from holding right and walking off a ledge again and again (a set-back every 1.7-2 s) and then standing still:
  `wait.mjs` (the pace sweep: what her bubble showed, and when) and `proof.mjs` (stills at +1..+14 s after a line is sent).
- **Measure the camera per engine frame.** Poll by `requestAnimationFrame` and keep one sample per `gameTime`; a 20 ms `sleep` poll
  misses the frame that matters (the builder's 22 px was 0-3 px). `cam.mjs` does it and compares two builds; run the base in a
  detached worktree on another port.
- **Run the gates in a detached worktree at the exact SHA** (`git worktree add --detach <dir> <sha>`, symlink node_modules). The
  builder pushed two new heads during this audit; the first run was on a head that no longer mattered.
- **kbdcheck rewrites its stills** (reference/qa/tester-page-1106/keyboard/*.png): `git checkout --` them before any commit.
- **buildcheck is a timing gate**: red at p95 151 ms beside three test shards, green alone (90 ms). Re-run it alone before calling it.
- **Playwright cannot rotate a phone context here** (`setViewportSize` fails: "restore it to normal state first"), and it leaves the
  viewport broken for the rest of the page. Rotation with a pop-up up is still unflown: name it as not attempted.
- **Read the notification queue (ReadNotifications) every 20 minutes.** The lead's "audit this head instead" sat unread for an hour.
- A spec the builder cites may live only on the lead's branch (reference/specs/help-lines.md is on ccr-ca657d3c-n09zty, not on the
  task branch): `git show origin/<lead branch>:<path>`.

## Open at hand-over (INT-1-1)
- The verdict and every open violation: reference/qa-reports/INT-1-1-critic/REPORT.json. A delta re-audit starts from its
  `violations` list and re-runs `wait.mjs`, `proof.mjs` (LINE='A step') and `cam.mjs` on the new head.
- Not flown: rotation with the offer up; a real phone (every number here is headless Chromium at 412x915 and 915x412).

## Gates still to build (from the card; not started)
1. Fail when the candidate has more `todo:` test markers than main (today counted by hand: `git grep -c "todo:" <ref> -- 'src/*.test.ts'`).
2. Add funknown.json to knowncheck's LISTS.
3. New, from this audit: a browser pace gate for Dot's lines in 1-1 (wait.mjs as a pass/fail check), so a help line that is sent
   but not shown fails automatically.
