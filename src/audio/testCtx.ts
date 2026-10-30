/**
 * A stand-in audio context for tests: every node and parameter exists and does nothing, except that gain automation is recorded, so a test
 * can see when and how a part was faded. Only the tests import it.
 */
export interface ParamCall {
  fn: string;
  value: number;
  time: number;
  tau?: number;
}

export interface FakeParam {
  value: number;
  calls: ParamCall[];
  setValueAtTime(v: number, t: number): FakeParam;
  setTargetAtTime(v: number, t: number, tau: number): FakeParam;
  linearRampToValueAtTime(v: number, t: number): FakeParam;
  exponentialRampToValueAtTime(v: number, t: number): FakeParam;
  cancelScheduledValues(t: number): FakeParam;
}

function param(): FakeParam {
  const p: FakeParam = {
    value: 1,
    calls: [],
    setValueAtTime(v, t) {
      p.calls.push({ fn: 'set', value: v, time: t });
      return p;
    },
    setTargetAtTime(v, t, tau) {
      p.calls.push({ fn: 'target', value: v, time: t, tau });
      return p;
    },
    linearRampToValueAtTime(v, t) {
      p.calls.push({ fn: 'linear', value: v, time: t });
      return p;
    },
    exponentialRampToValueAtTime(v, t) {
      p.calls.push({ fn: 'exp', value: v, time: t });
      return p;
    },
    cancelScheduledValues() {
      return p;
    },
  };
  return p;
}

const NOOP = new Set(['connect', 'disconnect', 'start', 'stop', 'addEventListener', 'removeEventListener', 'getFloatTimeDomainData', 'getByteTimeDomainData', 'setPeriodicWave']);

function node(): Record<string, unknown> {
  const store: Record<string | symbol, unknown> = { channelCount: 2 };
  return new Proxy(store, {
    get(t, k) {
      if (k in t) return t[k];
      if (typeof k !== 'string') return undefined;
      if (NOOP.has(k)) return () => undefined;
      if (k === 'fftSize') return 2048;
      if (k === 'curve' || k === 'buffer') return null;
      // anything else a node has is an AudioParam
      const p = param();
      t[k] = p;
      return p;
    },
    set(t, k, v) {
      t[k] = v;
      return true;
    },
  });
}

export interface FakeCtx {
  currentTime: number;
  sampleRate: number;
  state: string;
  /** every gain node made, in order */
  gains: Array<Record<string, unknown>>;
}

export function fakeCtx(): BaseAudioContext & FakeCtx {
  const gains: Array<Record<string, unknown>> = [];
  const base: Record<string | symbol, unknown> = {
    currentTime: 0,
    sampleRate: 44100,
    state: 'running',
    gains,
    destination: node(),
    createBuffer: (ch: number, len: number, rate: number) => {
      const data = Array.from({ length: ch }, () => new Float32Array(len));
      return { length: len, duration: len / rate, sampleRate: rate, numberOfChannels: ch, getChannelData: (i: number) => data[i] };
    },
    createGain: () => {
      const g = node();
      gains.push(g);
      return g;
    },
  };
  return new Proxy(base, {
    get(t, k) {
      if (k in t) return t[k];
      if (typeof k === 'string' && k.startsWith('create')) return () => node();
      return undefined;
    },
    set(t, k, v) {
      t[k] = v;
      return true;
    },
  }) as unknown as BaseAudioContext & FakeCtx;
}
