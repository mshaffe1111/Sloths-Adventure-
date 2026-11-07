# The team: regulars and one-off helpers (the lead keeps this current; read it at every start)

Matt, 2026-11-07: "Make sure you know and have notes for the team and who are regulars and just true helpers."

## How effort works (Matt, 11-07)
- Cloud sessions run at the effort Matt sets in his app; a brief's "Effort:" line does nothing on its own.
- Jobs the lead starts through the Agent tool set effort for real.
- Levels: low = following written steps; medium = measuring and small fixes; high = stages, engine work, art, reviews; max = only the
  consultant and deep reviews.
- Matt's default for new sessions: medium. The lead tells Matt when a new regular needs a higher setting.

## Regulars (standing roles: they keep their branch and their context, and get work every week)
| Role | Name in Matt's app | Session | Branch | Effort | Owns | How it reports |
|---|---|---|---|---|---|---|
| Lead (Matt's co-creator) | Project lead handoff | session_01FhBbYN2DDsktc7BGtNxPFK | ccr-23292c36-550qmt | (this session) | the team, rulings, releases, the test link | to Matt |
| Supervisor (the old lead) | (previous lead) | session_019iachLiuwNTAZUBSJWUmR3 | - | - | advice on story, taste and past lessons; the release checklist | send_message |
| Engine core | Core Engine Developer | session_01FhBbYNa68MoMsiQdv2EJXg | engine-core | HIGH | the gen2 engine on main, the seed list, the lock, merges of the others' engine work, the GPU (WebGL) move | send_message (works) |
| Planner | engine-planner | session_01FhBbYJaUqNUPxNUvbHdHeN | engine-chunks | HIGH | pipeline verdicts (flags, quiet, forks, branch share), the soft floors, petal arcs per setting, Dot's teach timing | send_message; notes in reference/notes/planner-status.md |
| Level designer | engine-designer | session_01FhBbYPKnBYCweHg8duJSu2 | engine-spec | high | section data: gap sizes, rounds, versions, Easy twins | send_message |
| Art director | art-director | session_01FhBbYLmXQhDLjAzTexXzo3 | art-director | HIGH (Matt 11-07) | the art manifest, the kit, cutting Matt's sheets into the game, the "can it float?" rating page | send_message |
| Testers' page | Tester Data | session_01FhBbYJYzHh5qAsNs8q9u9d | tester-page | medium | the #ctest page, the recorder, the survey, the keyboard check | **Can push only `tester-page`, and its send_message gets stuck on approval.** It reports in reference/notes/tester-page-status.md; the lead re-applies its patches onto other branches. |
| Release clerk | release-clerk | session_01FhBbYNbiMMD4wtzGED2iUK | release-<version> | medium | release candidates, the full gate, PR bodies (reference/methods/release.md) | status note on the release branch |

## Roles run fresh each time (no standing session: their independence or freshness is the point)
| Role | How it runs | When | Doc |
|---|---|---|---|
| Independent consultant | Agent tool at **MAX**, in a folder holding only its pack (never the repo) | after each play window, before a world is called done, or when Matt asks | reference/roles/CONSULTANT.md |
| Data analyst | Agent tool at medium; tools/playtesters/report.py | after each play window (the first is Tuesday 11-10) | reference/roles/DATA-ANALYST.md |
| Consultant packer | one cloud session or Agent at medium: facts only, no rationale | before each consultant run | CONSULTANT.md, "What it gets" |

## One-off helpers (done or single-job; archive when idle, don't reuse for new work)
- Running now (11-07): the consultant deep pass (Agent, max) and the art cutter for Matt's 50 sheets (Agent, high).
- Finished: level-samples / "Matt's Style Sheets Data" (the level picture pack), consultant-packer, the first consultant pass,
  render-stone, gen2-water, engine-pieces, engine-runs, research-pacing, research-moves, research-water-swim, engine-critic,
  engine-critic-spec, engine-render, w1-rhythm, w1-rhythm-b, quality-supervisor, roadmap-keeper, bot-fix, fix-petals, icons-painted,
  dot-box, art-1-1-sunrise.
- New one-offs: Agent tool by default (effort set for real), on their own branch or scratch folder, with a "done means" line in the
  brief, archived when done.

## Traps
- New cloud sessions: permission_mode "auto", never acceptEdits (acceptEdits gets stuck on send_message approvals only Matt can give).
- A helper that says "pushed": check `git ls-remote` before believing it (tester-page, 11-06).
- Times come from `date` in the same step (every helper and the lead slipped on 11-06).
