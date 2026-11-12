# Releasing a build: Matt's steps (plain words; the team's side is reference/methods/release.md)

Written 2026-11-11 for release 0.9.6 (the new 1-1). The same steps work for every release.

## What the lead does first (you don't do these)
1. A release clerk builds the candidate branch `release-<version>` from main plus only the passed work, and runs every gate.
   Nothing goes to you while any gate is red.
2. The lead rebuilds your test link from the candidate, plays it, and opens the pull request (PR) on GitHub.
3. The lead sends you three things: the test link, the PR link, and the list of rough spots that ship with it.

## What you do
1. **Play the candidate** on your test link: https://claude.ai/artifact/EnK5hmtGubQeKhKEdgignb (tap Refresh game on the title if it
   still shows the old build).
2. **Open the PR link** the lead sends (it looks like https://github.com/mshaffe1111/Sloths-Adventure-/pull/NN). Read the top of the
   description: what changed, the gate table, the rough spots.
3. Scroll to the bottom. If it says **"This branch has no conflicts with the base branch"**, tap **Merge pull request**, then
   **Confirm merge**. If it says anything else, don't merge: tell the lead.
4. Tell the lead "merged". That's it.

## What happens after you merge (about 7 to 15 minutes; the lead checks every step)
- GitHub runs three jobs: the full test suite and gates, then it publishes the game; a Pages deploy; and the Android APK build.
- If any test fails, the live site simply stays on the old version (safe) and the lead fixes it in a small follow-up PR.
- When it's live, the lead sends you:
  - the live game: https://mshaffe1111.github.io/Sloths-Adventure-/
  - the testers' link: https://mshaffe1111.github.io/Sloths-Adventure-/?fresh=1#ctest
  - the APK: https://github.com/mshaffe1111/Sloths-Adventure-/releases (named "Sloths Adventure v<version> (<date>)")
- On your phone, open the live game and tap **Refresh game**: the installed app keeps the old copy until it reloads.

## Never needed from you
- No tags, no command line, no branch work. The lead never merges; only you do.
