/**
 * runnerLianaPiece — 1-8 NEW 4 on the piece hook (ENG-B6; runnerLiana.ts): every liana the stage's data marks `runner` is solved once
 * at the stage's start (the moment of its swing a full-run jump off its lip catches it best), then, each fixed step while he runs toward
 * its lip, its phase is eased (never jumped) so that moment comes as he gets there at his top run. Never while he holds it, never once
 * he is past its lip or off the ground before it; put back as laid when he respawns. It draws nothing (the liana is drawn where its
 * swing puts it, as every liana is) and never hurts him. No stage id, world, seed or x here: all of it is the stage's data.
 */
import { PHYS } from '../physics.ts';
import { easePhase, phaseFor, RUNNER, runnerLip, runnerMoment } from '../runnerLiana.ts';
import type { PieceHost, PieceKind, PieceLayer, StagePiece } from '../stagePiece.types.ts';
import type { Vine } from '../types.ts';

interface Runner {
  v: Vine;
  /** its lip's far end (px) and the moment of its swing a run off it meets best (0..1) */
  lipEnd: number;
  at: number;
  /** the phase it was laid with (put back at a respawn) */
  phase0: number;
}

class RunnerLianaPiece implements StagePiece {
  readonly kind = 'runnerLiana';
  readonly layers: readonly PieceLayer[] = [];

  constructor(readonly runners: readonly Runner[]) {}

  step(dt: number, host: PieceHost) {
    const p = host.player;
    for (const r of this.runners) {
      // (only while he RUNS at it, at his top run, on the ground before its lip, within the easing's reach; never while he holds it. A
      // walk or a stop holds its phase where it is: eased for a run that is not coming, the swing would be worse than its plain luck)
      if (!p.grounded || (p.isVineSwinging && p.swingVineId === r.v.id) || p.vx < RUNNER.atRun * PHYS.maxRun) continue;
      const toLip = r.lipEnd - RUNNER.takeoffs[0] - p.x;
      if (toLip < 0 || toLip > RUNNER.from) continue;
      const want = phaseFor(r.v, r.at, host.vineClock + toLip / PHYS.maxRun);
      r.v.swingPhase = easePhase(r.v.swingPhase ?? 0, want, dt);
    }
  }

  respawn() {
    for (const r of this.runners) r.v.swingPhase = r.phase0;
  }
}

export const RUNNER_LIANA_PIECE: PieceKind = {
  id: 'runnerLiana',
  start(stage, host) {
    const out: Runner[] = [];
    for (const v of stage.vines ?? []) {
      if (!v.runner || v.vineType === 'tree_climb') continue;
      const lip = runnerLip(v, host.platforms);
      const m = lip && runnerMoment(v, lip.x + lip.width, lip.y);
      // (a runner liana no run catches is named, never eased at random: the lay's own check, runnerProblems, refuses it first)
      if (!lip || !m) {
        console.error(`runner liana at ${Math.round(v.x)} refused: no full-run jump off a lip catches it`);
        continue;
      }
      out.push({ v, lipEnd: lip.x + lip.width, at: m.at, phase0: v.swingPhase ?? 0 });
    }
    return out.length ? new RunnerLianaPiece(out) : null;
  },
};
