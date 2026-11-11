# Handoff: the Critic (role 6). Rewritten at the end of every audit; never appended.

Last audit: INT-1-1 (the new 1-1 together), 11-11, session_01FhBbYPHx3ipm9ReFRHpyP4, branch `t-critic-int-1-1`.
Report and proof: reference/qa-reports/INT-1-1-critic/ (REPORT.json, REPORT.md, the browser scripts, a folder of output per head).
Seeded from reference/handoffs/release-clerk.md: read its §2 (the gate in order, with timings) and §3 (the traps) first.

## What a fresh Critic needs that the card does not say
- **Fly help and words at a real player's pace, in the browser.** Headless flights (RealPlay) keep Pokey blinking for ever (`safe`),
  teleport him between tries and wait as long as they like, so they cannot see what a quick retry, or stopping to look, does to
  Dot's bubble. INT-1-1's finds all came from holding right off a ledge again and again (a set-back every 1.7-2 s) and then standing:
  `wait.mjs` (the pace sweep: every line her bubble showed, and when), `proof.mjs` (stills at +1..+14 s after a line is sent;
  LINE='A step' for the step line), `overlap.mjs` (her bubble against Pokey and the grown steps), `wall.mjs` (stuck with no set-back).
- **A builder's proof that keeps the put-backs going, or puts him on the step, proves less than it looks.** Ask what the player does
  next (stops, looks, walks back) and fly that.
- **Measure the camera per engine frame.** Sample in `requestAnimationFrame`, one sample per `gameTime`; a 20 ms `sleep` poll misses
  the frame that matters (a reported 22 px was 0-3). `cam.mjs` does it; run the base build in a detached worktree on another port.
  A sample whose time step is 2-3 updates long is a late frame, not a snap: judge px per update.
- **Rotation with a pop-up up can be flown**: not with Playwright's `setViewportSize` (it fails on a phone context and breaks the
  page), but with CDP `Emulation.setDeviceMetricsOverride` (`rotate.mjs`).
- **Run the gates in a detached worktree at the exact SHA** (`git worktree add --detach <dir> <sha>`, symlink node_modules;
  the chain is `gates.sh <worktree> <log prefix>` in the report folder). The builder pushed five heads during this audit: check
  `git ls-remote` before every report, and stop a run the moment its head is superseded by a code change. A later commit that
  changes only documents keeps the code gates (prove it: `git diff --stat <a> <b> -- . ':!reference'` is empty).
- **buildcheck is a timing gate**: red at p95 151-161 ms straight after or beside the test shards, green alone (90 ms). Run it last,
  alone. **kbdcheck rewrites its stills** (reference/qa/tester-page-1106/keyboard/*.png): `git checkout --` them before a commit.
- **Read the notification queue (ReadNotifications) every 20 minutes.** The lead's "audit this head instead" sat unread for an hour.
- A spec the builder cites may live only on the lead's branch (reference/specs/help-lines.md is on ccr-ca657d3c-n09zty):
  `git show origin/<lead branch>:<path>`.
- Tell the builder each find the moment it is proven (the lead allowed direct deltas): three of four were fixed before the verdict.

## Open at hand-over (INT-1-1)
- The verdict and anything still open: reference/qa-reports/INT-1-1-critic/REPORT.json.
- Never seen on a real phone: every number is headless Chromium at 412x915 and 915x412.

## Gates still to build (from the card; not started)
1. Fail when the candidate has more `todo:` test markers than main (today counted by hand: `git grep -c "todo:" <ref> -- 'src/*.test.ts'`).
2. Add funknown.json to knowncheck's LISTS.
3. From this audit: a browser pace gate for Dot's lines in 1-1 (wait.mjs and overlap.mjs as pass/fail), so a help line that is sent
   but not shown, or that covers what it names, fails by itself.
