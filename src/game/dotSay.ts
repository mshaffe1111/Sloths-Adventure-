/**
 * What Dot's help setting lets her say, and what counts as heard (the game's guide, components/dot/DotGuide.tsx, and the pacing tool,
 * tools/inspect/dotPace.ts, both go through this, so the tool measures what the game does).
 *
 *   - a line goes into her queue only if the setting lets it (dotGuideHelp.ts helpAllows; Tips: dotTips.ts);
 *   - Tips keeps 30 s between lines that can wait (dotGuide.ts TIPS_GAP_MS), Help 15 s; a first-time line never waits;
 *   - a line counts as heard once it has been up GUIDE.minShowMs (DOT-1): only then are its stage tip, its lesson and the thing it
 *     teaches written down, so a line the setting dropped, or that waited until it was old news, is taught another time.
 */
import { CALM, GUIDE, TIPS_GAP_MS, isUrgent, type GuideLine, type GuideQueue } from './dotGuide.ts';
import { thingOf } from './dotTips.ts';
import { helpAllows, knownMoveTip, markSkillSeen, tipsSkill, type DotHelp } from './dotGuideHelp.ts';
import { confirmHeard } from './tipMemory.ts';
import { lessonOfLine, markLessonSeen } from './lessons.ts';

/** Help keeps a little more room than the calm 10 s between the lines that can wait (Matt, 2026-10-29: less on every setting) */
export const HELP_GAP_MS = 15000;
/** the same words at most this many times a stage (a plain line, a warning) */
export const REPEAT = { plain: 1, warn: 2 } as const;
export const gapFor = (help: DotHelp): number => (help === 'reminders' ? TIPS_GAP_MS : help === 'teach' ? HELP_GAP_MS : CALM.gapMs);

export class DotSay {
  /** the line (its n) whose minimum time has been seen to */
  private keptN = -1;
  /** the things said in this run of the stage (Help says each once: dotTips.ts thingOf) */
  readonly stageThings = new Set<string>();
  constructor(
    readonly queue: GuideQueue,
    public help: DotHelp,
    readonly seen: Set<string>,
    readonly movesBefore: ReadonlySet<string>,
    public storyOn = true,
  ) {
    this.setHelp(help);
  }

  /** the setting changed (back from the menu) */
  setHelp(h: DotHelp): void {
    this.help = h;
    this.queue.gapMs = gapFor(h);
    // (the same words once a stage, a warning twice: less on every setting, Matt 2026-10-29)
    this.queue.repeatMax = REPEAT.plain;
    this.queue.repeatWarn = REPEAT.warn;
  }

  /** may this line be said now? */
  allows(l: GuideLine): boolean {
    // (the control test's lines are the test: on Tips and Help alike, never cut as known; Quiet is quiet)
    if (l.ctest) return this.help !== 'quiet';
    if (!helpAllows(l, this.help, this.seen, this.storyOn)) return false;
    // (Tips: not a stage tip for a move already done in an earlier stage)
    if (this.help !== 'teach' && this.queue.calm && knownMoveTip(l, this.movesBefore)) return false;
    // Help: a thing once a stage, its first time or one reminder of it from an earlier stage, never twice (Matt, 2026-10-29). Not the
    // warnings (a second eagle pass may still be warned of, at most twice: REPEAT.warn), nor a lesson's next step, nor a puzzle's
    // nudge and move
    if (this.help === 'teach' && !isUrgent(l) && !l.step && !/:\d+$/.test(l.key)) {
      const t = thingOf(l);
      if (t && this.stageThings.has(t)) return false;
    }
    return true;
  }

  /** queue a line if the setting lets it through */
  say(l: GuideLine, now: number): boolean {
    if (!this.allows(l)) return false;
    // (a line about a thing already taught is a reminder: it waits its turn like any other)
    if (l.mech && this.seen.has(`mech:${l.mech}`)) l = { ...l, mech: undefined };
    this.queue.push(l, now);
    return true;
  }

  /** after each tick: the line up has been read its minimum time, so it is heard (its tip, its lesson and its thing are kept) */
  keep(now: number): void {
    const cur = this.queue.cur;
    if (!cur || cur.n === this.keptN || now - cur.startedAt < GUIDE.minShowMs) return;
    this.keptN = cur.n;
    const l = cur.line;
    if (l.said) confirmHeard(l.said);
    const lesson = lessonOfLine(l);
    if (lesson) markLessonSeen(lesson);
    // (a lesson that teaches a move has taught that move: a stage tip for it later says it again in other words, DOT-13)
    if (lesson && l.move) this.mark(`move:${l.move}`);
    const k = tipsSkill(l);
    if (k) this.mark(k);
    // (said in this stage: Help does not say it again here, and another line about it waiting behind this one goes)
    const t = thingOf(l);
    if (t) {
      this.stageThings.add(t);
      if (lesson && l.move) this.stageThings.add(`move:${l.move}`);
      if (this.help === 'teach' && !isUrgent(l)) this.queue.dropWaiting((w) => !isUrgent(w) && !w.step && thingOf(w) === t);
    }
    // (Tips: another line about the same new thing, waiting behind this one, has nothing new to say)
    if (l.mech && this.help === 'reminders') this.queue.dropWaiting((w) => w.mech === l.mech && w.kind !== 'must');
  }

  private mark(k: string): void {
    if (this.seen.has(k)) return;
    this.seen.add(k);
    markSkillSeen(k);
  }
}
