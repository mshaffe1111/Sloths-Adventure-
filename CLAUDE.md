# Sloths Rainforest Adventures

Matt's phone-first side-scrolling sloth platformer. **Read Matt's handoff doc first: [Sloths handoff and roadmap](https://claude.ai/artifact/Y664eSHsuhSWhwQAq52pVa)** (a Claude Docs doc: where we are, the roadmap to go, video and animation status, decisions waiting on Matt, how he works, how to test and release; read it with the Docs connector and tick roadmap items as they ship). `reference/HANDOFF.md` is the same reference kept in the repo. It covers:
- every link (live site, Matt's test link, plans, art lists)
- where stages, props, story and art live
- how to test and release
- where things stand

Matt's Claude memory file `/areas/sloths-adventure.md` has his dated decisions.

## Rules that are easy to break

- **Pushing**: push only when Matt says "push". Then open the PR with `gh api …/pulls` (GraphQL is blocked) and give him the PR link. He merges it himself. Then check the deploy run succeeded (HANDOFF §7).
- **Test link**: after every round of changes, rebuild and republish Matt's test link in place (`python3 tools/testlink/build.py`, then the Artifact tool; HANDOFF §6).
- **New replaces old (Matt, 2026-10-26)**: once something new is tested and passes QA, it replaces the old code outright in the next release. No on/off switches; the old path is deleted. Nothing untested or half-finished goes to `main`.
- **Show first**: show big screen changes as screenshots, a mock-up or a preview video before building them in.
- **Talking to Matt**: ask him one multiple-choice question at a time. Explain in plain spoken terms, give honest pushback, no apologies.
- **Phone game**:
  - touch controls only;
  - every stage works in portrait and landscape;
  - the loop is locked at 30 fps on purpose.
- **Building or checking a stage, puzzle room or generator rule: read `reference/STAGE-RULES.md` first** (Matt's rules, the numbers every stage must meet from his Gemini research `reference/GEMINI-PCG-RESEARCH.md`, puzzle-room rules, using all the art, the checks in order, and the mistakes we already paid for). Pass it on in every helper brief.
- **Stage rules**:
  - crumbling platforms are never required;
  - straight up/down on a vine always climbs;
  - stages take at least 2 minutes;
  - the first appearance of a mechanic is taught;
  - Dot explains any locked exit.
- **Hugging Face token**: it never goes in code, commits, shared files or memory (`tools/README.md`).
- **Before committing**: `git checkout -- dev-dist; rm -f dev-dist/registerSW.js`.
- **Checks**: `npx tsc --noEmit -p .`, then `npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts`, then `npx vite build` (no asset over 4 MiB).
