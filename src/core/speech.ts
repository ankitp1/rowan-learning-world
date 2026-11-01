/**
 * Voice + sound effects.
 *
 * Phonics sounds: browser TTS can't say a clean /k/ or /sh/, so each sound key
 * first looks for a recorded clip at public/audio/phonemes/<key>.mp3 (listed in
 * public/audio/phonemes/index.json) and only falls back to a TTS respelling.
 * Drop in recordings later and nothing else changes.
 */
import { SOUND_TEXT } from '../content/phonics';

let rate = 0.9;
export const setSpeechRate = (r: number) => { rate = r; };

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
let recorded = new Set<string>();
let loaded = false;

export function loadRecordedSounds() {
  if (loaded) return;
  loaded = true;
  fetch('./audio/phonemes/index.json')
    .then((r) => (r.ok ? r.json() : []))
    .then((keys: string[]) => { recorded = new Set(keys); })
    .catch(() => {});
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = synth?.getVoices() ?? [];
  return voices.find((v) => /en[-_]US/i.test(v.lang) && /samantha|ava|allison|google us|natural/i.test(v.name))
    ?? voices.find((v) => /^en/i.test(v.lang));
}

export function stopSpeaking() { synth?.cancel(); }

/** Speak text. Resolves when finished (or immediately if TTS is unavailable). */
export function speak(text: string, opts: { rate?: number; pitch?: number; interrupt?: boolean } = {}): Promise<void> {
  return new Promise((resolve) => {
    if (!synth) return resolve();
    if (opts.interrupt !== false) synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = (opts.rate ?? 1) * rate;
    u.pitch = opts.pitch ?? 1.1;
    const v = pickVoice();
    if (v) u.voice = v;
    // Browsers sometimes never fire onend (dropped utterance after cancel(), voices not ready,
    // autoplay rules). Never let the game wait on that: fall back to an estimated duration.
    let finished = false;
    const done = () => { if (!finished) { finished = true; clearTimeout(guard); resolve(); } };
    const guard = setTimeout(done, Math.min(8000, 700 + (text.length * 120) / (u.rate || 1)));
    u.onend = done;
    u.onerror = done;
    synth.speak(u);
  });
}

function playClip(key: string): Promise<boolean> {
  return new Promise((resolve) => {
    const a = new Audio(`./audio/phonemes/${key}.mp3`);
    a.onended = () => resolve(true);
    a.onerror = () => resolve(false);
    a.play().catch(() => resolve(false));
  });
}

/** Speak one phonics sound by key ("sh", "a", "a_e"...). */
export async function speakSound(key: string, interrupt = true) {
  if (interrupt) synth?.cancel();
  if (recorded.has(key) && (await playClip(key))) return;
  await speak(SOUND_TEXT[key] ?? key, { rate: 0.75, interrupt: false });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Sound out a word: each sound with a gap, then the whole word.
 * onStep(i) fires as each sound starts (i = -1 when blending the whole word).
 * Returns a cancel function.
 */
export function soundOut(sounds: string[], word: string, onStep?: (i: number) => void, gap = 450) {
  let cancelled = false;
  (async () => {
    synth?.cancel();
    for (let i = 0; i < sounds.length; i++) {
      if (cancelled) return;
      onStep?.(i);
      await speakSound(sounds[i], false);
      await sleep(gap);
    }
    if (cancelled) return;
    onStep?.(-1);
    await speak(word, { rate: 0.7, interrupt: false });
    if (!cancelled) onStep?.(-2);
  })();
  return () => { cancelled = true; synth?.cancel(); };
}

/* ---------------- sound effects (all gentle, never a harsh buzzer) ---------------- */

let ctx: AudioContext | undefined;
function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.08) {
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t0 = ctx.currentTime + start;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  } catch { /* audio not available */ }
}

export const sfx = {
  tap: () => tone(660, 0, 0.08),
  note: (freq: number, dur = 0.35) => tone(freq, 0, dur, 'triangle', 0.14),
  good: () => { tone(523, 0, 0.12); tone(659, 0.1, 0.12); tone(784, 0.2, 0.2); },
  soft: () => tone(330, 0, 0.18, 'sine', 0.05),
  star: () => { tone(880, 0, 0.1, 'triangle'); tone(1175, 0.09, 0.18, 'triangle'); },
  chest: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.2, 'triangle')); },
};
