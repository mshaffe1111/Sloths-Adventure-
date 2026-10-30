/** cutting a voice file (src/assets/voices/<slug>.mp3, takes with silence between) into its takes: voice.ts and the sample page */
/** the takes of a decoded voice file: the stretches of sound between silences of 40 ms or more */
export function cutTakes(ctx: BaseAudioContext, buf: AudioBuffer): AudioBuffer[] {
  const x = buf.getChannelData(0);
  const quiet = Math.round(0.04 * buf.sampleRate);
  const pad = Math.round(0.004 * buf.sampleRate);
  const out: AudioBuffer[] = [];
  let i = 0;
  while (i < x.length) {
    while (i < x.length && Math.abs(x[i]) < 2e-3) i++;
    if (i >= x.length) break;
    const a = Math.max(0, i - pad);
    let still = 0;
    let j = i;
    for (; j < x.length && still < quiet; j++) still = Math.abs(x[j]) < 2e-3 ? still + 1 : 0;
    const b = Math.min(x.length, j - still + pad);
    if (b - a > 0.02 * buf.sampleRate) {
      const t = ctx.createBuffer(1, b - a, buf.sampleRate);
      t.getChannelData(0).set(x.subarray(a, b));
      out.push(t);
    }
    i = j;
  }
  return out;
}

