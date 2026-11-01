/**
 * Voice + sound effects.
 *
 * Supports 3 speech backends in priority order:
 * 1. Native Android TV / Chromecast TTS bridge (`window.AndroidTTS`)
 * 2. Browser Web Speech API (`window.speechSynthesis`) when voices are available
 * 3. HTML5 Audio cloud TTS stream fallback for WebViews without Web Speech API
 */
import { SOUND_TEXT } from '../content/phonics';

interface AndroidTTSBridge {
  isReady?: () => boolean;
  speak: (text: string, rate: number, pitch: number, flush: boolean) => void;
  stop: () => void;
}

declare global {
  interface Window {
    AndroidTTS?: AndroidTTSBridge;
    webkitAudioContext?: typeof AudioContext;
  }
}

let rate = 0.9;
export const setSpeechRate = (r: number) => { rate = r; };

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
let recorded = new Set<string>();
let loaded = false;
let activeAudio: HTMLAudioElement | null = null;

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

export function stopSpeaking() {
  try { window.AndroidTTS?.stop(); } catch { /* ignore */ }
  try { synth?.cancel(); } catch { /* ignore */ }
  if (activeAudio) {
    try { activeAudio.pause(); activeAudio = null; } catch { /* ignore */ }
  }
}

/** Speak text. Resolves when finished (or after estimated duration on TV bridge). */
export function speak(text: string, opts: { rate?: number; pitch?: number; interrupt?: boolean } = {}): Promise<void> {
  return new Promise((resolve) => {
    const clean = text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g, '').trim();
    if (!clean) return resolve();

    const finalRate = (opts.rate ?? 1) * rate;
    const finalPitch = opts.pitch ?? 1.1;
    const estMs = Math.min(7500, 550 + (clean.length * 95) / (finalRate || 1));

    // 1. Native Android TV / Chromecast TTS bridge
    if (typeof window !== 'undefined' && window.AndroidTTS && (!window.AndroidTTS.isReady || window.AndroidTTS.isReady())) {
      try {
        window.AndroidTTS.speak(clean, finalRate, finalPitch, opts.interrupt !== false);
        setTimeout(resolve, estMs);
        return;
      } catch {
        // Fall through if native bridge throws
      }
    }

    // 2. Standard Web Speech API (if supported and not on Android WebView stub)
    const isAndroidWebView = typeof navigator !== 'undefined' && /Android|CrKey|RowanAndroidTV/i.test(navigator.userAgent);
    if (synth && (!isAndroidWebView || (synth.getVoices()?.length ?? 0) > 0)) {
      if (opts.interrupt !== false) synth.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.rate = finalRate;
      u.pitch = finalPitch;
      const v = pickVoice();
      if (v) u.voice = v;
      let finished = false;
      const done = () => { if (!finished) { finished = true; clearTimeout(guard); resolve(); } };
      const guard = setTimeout(done, estMs + 300);
      u.onend = done;
      u.onerror = done;
      synth.speak(u);
      return;
    }

    // 3. HTML5 Audio TTS fallback for WebViews where Web Speech API is missing
    if (typeof Audio !== 'undefined') {
      try {
        if (opts.interrupt !== false && activeAudio) {
          activeAudio.pause();
          activeAudio = null;
        }
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(clean.slice(0, 180))}`;
        const a = new Audio(url);
        a.playbackRate = Math.max(0.65, Math.min(1.5, finalRate));
        activeAudio = a;
        let finished = false;
        const done = () => { if (!finished) { finished = true; clearTimeout(guard); resolve(); } };
        const guard = setTimeout(done, estMs + 500);
        a.onended = done;
        a.onerror = done;
        a.play().catch(done);
        return;
      } catch {
        return resolve();
      }
    }

    resolve();
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
  if (interrupt) stopSpeaking();
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
    stopSpeaking();
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
  return () => { cancelled = true; stopSpeaking(); };
}

/* ---------------- sound effects (all gentle, never a harsh buzzer) ---------------- */

let ctx: AudioContext | undefined;
function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.16) {
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    ctx ??= new Ctor();
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t0 = ctx.currentTime + start;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  } catch { /* audio not available */ }
}

export const sfx = {
  tap: () => tone(660, 0, 0.08),
  note: (freq: number, dur = 0.35) => tone(freq, 0, dur, 'triangle', 0.22),
  good: () => { tone(523, 0, 0.12); tone(659, 0.1, 0.12); tone(784, 0.2, 0.2); },
  soft: () => tone(330, 0, 0.18, 'sine', 0.1),
  star: () => { tone(880, 0, 0.1, 'triangle'); tone(1175, 0.09, 0.18, 'triangle'); },
  chest: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.2, 'triangle')); },
};
