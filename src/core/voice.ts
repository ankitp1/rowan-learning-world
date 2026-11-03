import { useSyncExternalStore } from 'react';
import { stopSpeaking } from './speech';

export interface AndroidSTTBridge {
  isAvailable?: () => boolean;
  startListening: () => void;
  stopListening: () => void;
}

export interface VoiceState {
  status: 'idle' | 'listening' | 'error';
  lastTranscript: string;
  error?: string;
}

let voiceState: VoiceState = { status: 'idle', lastTranscript: '' };
const listeners = new Set<() => void>();

function setVoiceState(patch: Partial<VoiceState>) {
  voiceState = { ...voiceState, ...patch };
  listeners.forEach((l) => l());
}

export function getVoiceState(): VoiceState {
  return voiceState;
}

export function subscribeVoice(l: () => void): () => void {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function useVoice(): VoiceState {
  return useSyncExternalStore(subscribeVoice, getVoiceState);
}

/** Map of spoken English number words and common child homophones to digits. */
export const SPOKEN_NUMBERS: Record<string, string> = {
  zero: '0', oh: '0', none: '0', nothing: '0',
  one: '1', won: '1',
  two: '2', to: '2', too: '2',
  three: '3', tree: '3', free: '3',
  four: '4', for: '4', fore: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8', ate: '8',
  nine: '9',
  ten: '10',
  eleven: '11',
  twelve: '12',
  thirteen: '13',
  fourteen: '14',
  fifteen: '15',
  sixteen: '16',
  seventeen: '17',
  eighteen: '18',
  nineteen: '19',
  twenty: '20',
};

export interface QuestionVoiceCallbacks {
  onRepeat?: () => void;
  onHint?: () => void;
  onTranscript?: (raw: string, tokens: string[]) => boolean;
}

let activeQuestionHandler: QuestionVoiceCallbacks | null = null;

export function registerQuestionVoiceHandler(handler: QuestionVoiceCallbacks | null) {
  activeQuestionHandler = handler;
  return () => {
    if (activeQuestionHandler === handler) activeQuestionHandler = null;
  };
}

export function normalizeSpokenText(raw: string): { clean: string; tokens: string[] } {
  const clean = raw
    .toLowerCase()
    .replace(/[.,!?'"():;-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = clean ? clean.split(' ') : [];
  const expanded = new Set<string>();
  for (const w of words) {
    expanded.add(w);
    if (SPOKEN_NUMBERS[w] !== undefined) expanded.add(SPOKEN_NUMBERS[w]);
  }
  return { clean, tokens: [...expanded] };
}

/**
 * Matches a spoken transcript against global navigation commands ("go back", "say again", "repeat",
 * "try again", "help") or the active question's choices.
 */
export function handleVoiceTranscript(raw: string): boolean {
  const { clean, tokens } = normalizeSpokenText(raw);
  if (!clean) return false;
  setVoiceState({ lastTranscript: raw.trim() });

  // 1. Check "go back" / "back" / "exit"
  if (
    /\b(go back|back|exit|go home|leave)\b/.test(clean)
  ) {
    const backHook = (window as unknown as { __rlwBack?: () => void }).__rlwBack;
    if (backHook) { backHook(); return true; }
    const backBtn = document.querySelector<HTMLButtonElement>('.back');
    if (backBtn) { backBtn.click(); return true; }
  }

  // 2. Check "say again" / "repeat" / "hear it again" / "read it" / "sound it out"
  if (
    /\b(say again|say it again|repeat|hear it|hear again|read it|read again|sound it out|listen again)\b/.test(clean)
  ) {
    if (activeQuestionHandler?.onRepeat) {
      activeQuestionHandler.onRepeat();
      return true;
    }
    const speakBtn = document.querySelector<HTMLButtonElement>('.speak-btn, [aria-label="Read the question aloud"]');
    if (speakBtn) { speakBtn.click(); return true; }
  }

  // 3. Check "help" / "hint" / "clue" / "show me"
  if (/\b(help|hint|clue|show me|give me a hint)\b/.test(clean)) {
    if (activeQuestionHandler?.onHint) {
      activeQuestionHandler.onHint();
      return true;
    }
    const helpBtn = document.querySelector<HTMLButtonElement>('.helper-btn:not(:disabled)');
    if (helpBtn) { helpBtn.click(); return true; }
  }

  // 4. Check "try again" / "play again" / "new code" / "next" / "start"
  if (/\b(try again|play again|new code|next code|start mission|let s go|lets go|let s play|lets play)\b/.test(clean)) {
    const btns = [...document.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
    const match = btns.find((b) => {
      const txt = (b.textContent || '').toLowerCase();
      if (clean.includes('again') && (txt.includes('again') || txt.includes('new code'))) return true;
      if (clean.includes('mission') && txt.includes('mission')) return true;
      if ((clean.includes('go') || clean.includes('play') || clean.includes('start')) && (txt.includes('go') || txt.includes('play') || txt.includes('start') || txt.includes('next'))) return true;
      return false;
    });
    if (match) { match.click(); return true; }
  }

  // 5. Let the active question card match choices (numbers, words, shapes, rhyming, etc.)
  if (activeQuestionHandler?.onTranscript && activeQuestionHandler.onTranscript(clean, tokens)) {
    return true;
  }

  // 6. Fallback: match any visible button label on the screen (e.g. island names, game cards, choices)
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('.choice:not(:disabled), .app-card:not(:disabled), .island:not(:disabled), .profile-btn:not(:disabled), .btn:not(:disabled)')];
  for (const b of buttons) {
    const label = ((b.getAttribute('aria-label') || '') + ' ' + (b.textContent || '')).toLowerCase().trim();
    if (!label) continue;
    if (tokens.some((t) => t.length >= 2 && label.split(/\s+/).includes(t)) || (clean.length >= 3 && label.includes(clean))) {
      b.click();
      return true;
    }
  }

  return false;
}

function getAndroidSTT(): AndroidSTTBridge | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { AndroidSTT?: AndroidSTTBridge }).AndroidSTT;
}

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onresult: ((e: {
    results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
  }) => void) | null;
}

function getBrowserSpeechRecognitionCtor(): (new () => BrowserSpeechRecognition) | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function isVoiceSupported(): boolean {
  if (getAndroidSTT()) return true;
  return Boolean(getBrowserSpeechRecognitionCtor());
}

let browserRec: BrowserSpeechRecognition | null = null;

// Register global callbacks for Android TV native SpeechRecognizer / RecognizerIntent bridge
if (typeof window !== 'undefined') {
  const w = window as unknown as {
    __rlwOnVoiceResult?: (transcript: string, isFinal: boolean) => void;
    __rlwOnVoiceState?: (state: 'listening' | 'idle' | 'error', err?: string) => void;
  };
  w.__rlwOnVoiceResult = (transcript: string, isFinal: boolean) => {
    if (!transcript) return;
    setVoiceState({ lastTranscript: transcript });
    if (isFinal) {
      handleVoiceTranscript(transcript);
      setVoiceState({ status: 'idle' });
    }
  };
  w.__rlwOnVoiceState = (st: 'listening' | 'idle' | 'error', err?: string) => {
    setVoiceState({ status: st, error: err });
  };
}

export function startVoiceListening() {
  stopSpeaking();
  const androidStt = getAndroidSTT();
  if (androidStt) {
    try {
      setVoiceState({ status: 'listening', error: undefined });
      androidStt.startListening();
      return;
    } catch {
      // Fall through to browser speech recognition if available
    }
  }

  const Ctor = getBrowserSpeechRecognitionCtor();
  if (!Ctor) {
    setVoiceState({ status: 'error', error: 'Voice input is not supported on this browser.' });
    return;
  }

  try {
    if (browserRec) {
      try { browserRec.abort(); } catch { /* ignore */ }
    }
    const rec = new Ctor();
    browserRec = rec;
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;

    let handled = false;
    rec.onstart = () => setVoiceState({ status: 'listening', error: undefined });
    rec.onresult = (e) => {
      if (handled) return;
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res[0]?.transcript ?? '';
        if (text) setVoiceState({ lastTranscript: text });
        if (res.isFinal && text) {
          handled = true;
          handleVoiceTranscript(text);
        }
      }
    };
    rec.onerror = (e) => {
      setVoiceState({ status: 'error', error: e.error || 'Could not hear clearly' });
      setTimeout(() => {
        if (voiceState.status === 'error') setVoiceState({ status: 'idle' });
      }, 2000);
    };
    rec.onend = () => {
      if (voiceState.status === 'listening') setVoiceState({ status: 'idle' });
    };
    rec.start();
  } catch {
    setVoiceState({ status: 'idle' });
  }
}

export function stopVoiceListening() {
  const androidStt = getAndroidSTT();
  if (androidStt) {
    try { androidStt.stopListening(); } catch { /* ignore */ }
  }
  if (browserRec) {
    try { browserRec.stop(); } catch { /* ignore */ }
    browserRec = null;
  }
  setVoiceState({ status: 'idle' });
}

export function toggleVoiceListening() {
  if (voiceState.status === 'listening') stopVoiceListening();
  else startVoiceListening();
}
