// Sound design (Developer Spec §11.7, P3). Synthesised with Web Audio — no
// sample files. Off by default; never autoplays (only after the user enables it),
// every sound < 1s, volume 0.3.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.3;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return { ctx, out: master! };
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", peak = 0.5) {
  const { ctx, out } = audio();
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sounds = {
  /** Focus moved. */
  tick() {
    tone(2200, 0, 0.035, "triangle", 0.18);
  },
  /** An issue got fixed in Before / After. */
  unlock() {
    tone(392, 0, 0.18, "sine", 0.45);
    tone(587.3, 0.09, 0.32, "sine", 0.4);
  },
  /** Laptop lid opens / closes. */
  whoosh(direction: "open" | "close") {
    const { ctx, out } = audio();
    const dur = 0.6;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.8;
    const t0 = ctx.currentTime;
    const [f0, f1] = direction === "open" ? [400, 2400] : [2400, 400];
    filter.frequency.setValueAtTime(f0, t0);
    filter.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.35, t0 + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(g).connect(out);
    src.start(t0);
    src.stop(t0 + dur);
  },
};

/** Fire-and-forget cues from sections; the sound feature listens when enabled. */
export type Cue = "fix" | "lid-open" | "lid-close";
export const CUE_EVENT = "portfolio:cue";
export function cue(name: Cue) {
  window.dispatchEvent(new CustomEvent<Cue>(CUE_EVENT, { detail: name }));
}
