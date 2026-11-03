import { useEffect, useRef, useState } from 'react';
import { fill } from '../content/generators';
import { focusFirst } from '../core/nav';
import { sfx, soundOut, speak, speakSound, speakThemeEncouragement, speakThemePraise, stopSpeaking } from '../core/speech';
import type { Choice, HintMode, Profile, Question, Theme, TimerMode } from '../core/types';
import { isVoiceSupported, registerQuestionVoiceHandler, toggleVoiceListening, useVoice } from '../core/voice';
import { HelperAvatar } from './Art';
import { BridgeVisual, MathVisual, ShapeSvg, WordTiles, countSeq } from './Visuals';

export interface AnswerResult {
  correct: boolean;
  given: string;
  expected: string;
  hintsUsed: number;
  tags: string[];
  ms: number;
  starsEarned?: number;
}

export function timerSecondsForQuestion(q: Question, mode?: TimerMode): number {
  if (!mode || mode === 'off') return 0;
  const d = q.support ?? 1;
  if (mode === 'relaxed') return d === 0 ? 35 : d === 1 ? 30 : 25;
  if (mode === 'standard') return d === 0 ? 24 : d === 1 ? 18 : 14;
  if (mode === 'fast') return d === 0 ? 16 : d === 1 ? 12 : 9;
  // 'auto': scales automatically with difficulty level
  return d === 0 ? 30 : d === 1 ? 22 : 15;
}

export function computeSpeedStars(ms: number, limitSec: number, cleanFirstTry: boolean): number {
  if (!cleanFirstTry) return 1;
  if (limitSec <= 0) return 1;
  const ratio = 1 - ms / (limitSec * 1000);
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.2) return 2;
  return 1;
}

export const MAX_HINTS: Record<HintMode, number> = { full: 3, limited: 2, 'nudge-only': 1 };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Hint ladder shared by every game: 1 Nudge, 2 Narrow, 3 Show me, then Explain after the answer. */
export function HelperButton({ theme, level, max, onAsk }: { theme: Theme; level: number; max: number; onAsk: () => void }) {
  const left = max - level;
  return (
    <button className="helper-btn" onClick={onAsk} disabled={left <= 0} aria-label="Ask the helper for a hint">
      <HelperAvatar theme={theme} size={46} />
      <span>{left > 0 ? 'Help' : 'No more hints'}</span>
      <span className="pips">{Array.from({ length: max }, (_, i) => <i key={i} className={i < level ? 'used' : ''} />)}</span>
    </button>
  );
}

export function Bubble({
  theme,
  text,
  mood = 'talking',
  hintInfo,
}: {
  theme: Theme;
  text: string;
  mood?: 'idle' | 'talking' | 'cheer';
  hintInfo?: { level: number; max: number; onAsk: () => void };
}) {
  return (
    <div className={`bubble${mood === 'cheer' ? ' bubble-cheer' : ''}`} role="status">
      <div className="bubble-avatar-wrap">
        <HelperAvatar theme={theme} size={64} talking mood={mood} />
      </div>
      <div className="bubble-text">
        <p>{text}</p>
      </div>
      {hintInfo && hintInfo.max > 0 && (
        <button
          className="bubble-hint-btn"
          onClick={hintInfo.onAsk}
          disabled={hintInfo.max - hintInfo.level <= 0}
          aria-label="Ask the helper for a hint"
          title="Need a hint?"
        >
          <span>💡 Hint</span>
          <span className="pips mini-pips">
            {Array.from({ length: hintInfo.max }, (_, i) => (
              <i key={i} className={i < hintInfo.level ? 'used' : ''} />
            ))}
          </span>
        </button>
      )}
    </div>
  );
}

/**
 * One multiple-choice question, any skill. Handles speech, tap-to-hear letters,
 * the hint ladder, gentle wrong-answer feedback and the explain step.
 * variant "plank": the sounds slide together before the child picks a picture.
 */
export default function QuestionCard({ q, theme, profile, mode = 'practice', proactive = false, variant, onResult }: {
  q: Question;
  theme: Theme;
  profile: Profile;
  mode?: 'practice' | 'placement';
  proactive?: boolean;
  variant?: 'plank' | 'bridge' | 'ropes' | 'groups';
  onResult: (r: AnswerResult) => void;
}) {
  const placement = mode === 'placement';
  const maxHints = placement ? 0 : MAX_HINTS[profile.settings.hintMode];
  const t0 = useRef(Date.now());
  const [level, setLevel] = useState(0);
  const [gone, setGone] = useState<string[]>([]);
  const [reveal, setReveal] = useState(false);
  const [bubble, setBubble] = useState('');
  const [wrong, setWrong] = useState<Choice | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [hi, setHi] = useState<number | null>(null);
  const [soundIdx, setSoundIdx] = useState<number | undefined>();
  const [joined, setJoined] = useState(false);
  const [lastPick, setLastPick] = useState<number | null>(null);
  const [bonusStars, setBonusStars] = useState<number | null>(null);
  const [showStarFly, setShowStarFly] = useState(false);
  const cancel = useRef<() => void>(() => {});
  const alive = useRef(true);
  const voice = useVoice();

  const limitSec = placement ? 0 : timerSecondsForQuestion(q, profile.settings.timerMode);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (limitSec <= 0 || done) return;
    const iv = setInterval(() => {
      setElapsedMs(Date.now() - t0.current);
    }, 200);
    return () => clearInterval(iv);
  }, [limitSec, done]);

  // Re-arm on mount: React StrictMode runs the cleanup once in dev, which must not leave this false.
  useEffect(() => { alive.current = true; return () => { alive.current = false; cancel.current(); stopSpeaking(); }; }, []);

  const say = (text: string) => { setBubble(text); void speak(text); };
  const prompt = fill(variant === 'plank' ? 'Listen to the sounds. Which picture is it?' : variant === 'bridge' ? 'Fix the bridge! How many planks make 10?' : q.prompt, theme);

  const playBlend = () => {
    if (!q.sounds || !q.word) return;
    cancel.current();
    setJoined(false);
    cancel.current = soundOut(q.sounds, q.word, (i) => {
      if (!alive.current) return;
      setSoundIdx(i >= 0 ? i : undefined);
      if (i === -1) setJoined(true);
    }, variant === 'plank' ? 650 : 450);
  };

  const runCount = async () => {
    const seq = countSeq(q);
    for (let i = 0; i < seq.length; i++) {
      if (!alive.current) return;
      setHi(i + 1);
      await speak(String(seq[i]), { rate: 0.9 });
      await sleep(250);
    }
  };

  // Speak the question once it appears, and put D-pad focus on the first answer choice.
  useEffect(() => {
    const focusId = setTimeout(focusFirst, 60);
    const id = setTimeout(() => {
      if (variant === 'plank') playBlend();
      else if (!q.silent) void speak(fill(q.say ?? q.prompt, theme));
    }, 350);
    return () => { clearTimeout(focusId); clearTimeout(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Two misses in a row last question: offer help without being asked.
  useEffect(() => {
    if (!proactive || !maxHints) return;
    const id = setTimeout(() => ask(), 2500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wrongChoices = () => q.choices.filter((c) => c.id !== q.answer && !gone.includes(c.id));

  function ask() {
    if (done || level >= maxHints) return;
    const lvl = level + 1;
    setLevel(lvl);
    const h = q.hints[lvl - 1];
    if (!h) return;
    cancel.current();
    setBubble(fill(h.text, theme));
    if (lvl >= 2) {
      const w = wrongChoices();
      if (w.length) setGone((g) => [...g, w[Math.floor(Math.random() * w.length)].id]);
    }
    if (h.effect === 'soundOut') playBlend();
    else if (h.effect === 'count') void speak(fill(h.text, theme)).then(runCount);
    else if (h.effect === 'repeat') void speak(q.word ?? '');
    else if (h.effect === 'reveal') {
      setReveal(true);
      if (q.kind === 'word') playBlend();
      else if (countSeq(q).length) void runCount();
      else void speak(fill(h.text, theme));
    } else {
      void speak(fill(h.say ?? h.text, theme));
      if (lvl === 1 && (q.kind === 'add' || q.kind === 'sub' || q.kind === 'make10' || q.kind === 'count')) {
        void runCount();
      }
    }
  }

  async function finish(correct: boolean, given: string, tags: string[]) {
    const ms = Date.now() - t0.current;
    const starsEarned = correct ? computeSpeedStars(ms, limitSec, level === 0) : 0;
    if (correct && limitSec > 0 && starsEarned > 1) setBonusStars(starsEarned);
    const res = { correct, given, expected: q.answer, hintsUsed: level, tags, ms, starsEarned };
    if (placement) { sfx.tap(); setBubble('Thanks! Next one!'); await sleep(500); if (alive.current) onResult(res); return; }
    if (correct) setShowStarFly(true);
    sfx.good();
    const praiseIdx = Math.floor(Math.random() * (theme.praise?.length || 1));
    const praise = theme.praise[praiseIdx] || 'Great job!';
    const explain = level > 0 || !correct;
    const starNote = limitSec > 0 && starsEarned > 1 ? ` ⚡ +${starsEarned} Stars Speed Bonus!` : '';
    setBubble((explain ? fill(q.explain.text, theme) : praise) + starNote);
    cancel.current();
    if (explain) {
      await speakThemePraise(theme, praiseIdx);
      await speak(fill(q.explain.say ?? q.explain.text, theme));
      await sleep(500);
    } else {
      await speakThemePraise(theme, praiseIdx);
      await sleep(350);
    }
    if (alive.current) onResult(res);
  }

  function pick(c: Choice) {
    if (done || gone.includes(c.id)) return;
    if (variant === 'bridge') setLastPick(Number(c.id));
    if (c.id === q.answer) {
      setDone(c.id);
      void finish(!wrong, wrong ? wrong.id : c.id, wrong?.tags ?? []);
      return;
    }
    if (placement) { setDone(c.id); void finish(false, c.id, c.tags ?? []); return; }
    sfx.soft();
    setWrong((w) => w ?? c);
    setGone((g) => [...g, c.id]);
    const encList = theme.encouragements || [];
    const encIdx = Math.floor(Math.random() * (encList.length || 1));
    const encouragement = encList[encIdx] ?? "That was a good try! Let's listen closely and try another choice!";
    setBubble(fill(encouragement, theme));
    void speakThemeEncouragement(theme, encIdx);
  }

  const tapTile = (i: number) => {
    if (!q.sounds || !q.tiles) return;
    setSoundIdx(i);
    const key = q.sounds.length === q.tiles.length ? q.sounds[i] : q.sounds[i];
    if (key) void speakSound(key);
    setTimeout(() => setSoundIdx(undefined), 600);
  };

  const visual = (() => {
    if (q.kind === 'word' && q.tiles) {
      return (
        <div className="wordvisual">
          <WordTiles
            tiles={q.tiles}
            active={soundIdx}
            joined={variant === 'plank' ? joined : undefined}
            spread={variant === 'plank' && !joined}
            onTile={placement || variant === 'plank' ? undefined : tapTile}
          />
          {!placement && (
            <button className="speak-btn" onClick={() => (variant === 'plank' ? playBlend() : playBlend())}>
              {variant === 'plank' ? '🔁 Again' : '🔊 Sound it out'}
            </button>
          )}
        </div>
      );
    }
    if (q.kind === 'sight') {
      return <button className="speak-btn big" onClick={() => void speak(q.word ?? '')}>🔊 Hear it again</button>;
    }
    if (q.kind === 'rhyme') {
      return (
        <div className="rhyme-target">
          <span className="ce">{q.emoji}</span>
          <b>{q.word}</b>
          <button className="speak-btn" onClick={() => void speak(q.word ?? '')}>🔊</button>
        </div>
      );
    }
    if (q.kind === 'group') {
      const e = q.emoji ?? '';
      // b === 1: plural question (one, then lots). Otherwise a crowd of the same thing.
      return q.b === 1 ? (
        <div className="group-visual plural">
          <div><span className="ce">{e}</span><small>one {q.word}</small></div>
          <b>→</b>
          <div><span className="ce">{e}{e}{e}</span><small>two or more</small></div>
        </div>
      ) : (
        <div className="group-visual crowd">
          <span className="ce">{e}{e}{e}{e}{e}</span>
          <small>{q.word}</small>
        </div>
      );
    }
    if (q.kind === 'follow') return null;
    if (variant === 'bridge' && q.kind === 'make10') return <BridgeVisual a={q.a ?? 0} gap={q.b ?? 0} pick={reveal ? (q.b ?? 0) : lastPick} />;
    return <MathVisual q={q} theme={theme} hi={hi} hintLevel={level} />;
  })();

  // Register voice command & spoken-answer matcher for this question
  useEffect(() => {
    return registerQuestionVoiceHandler({
      onRepeat: () => {
        if (variant === 'plank' || q.kind === 'word') playBlend();
        else if (q.kind === 'sight' && q.word) void speak(q.word);
        else void speak(fill(q.say ?? q.prompt, theme));
      },
      onHint: () => ask(),
      onTranscript: (clean, tokens) => {
        const active = q.choices.filter((c) => !gone.includes(c.id));
        // Support ordinal picks: "first", "second", "third"
        if (tokens.includes('first') && active[0]) { pick(active[0]); return true; }
        if (tokens.includes('second') && active[1]) { pick(active[1]); return true; }
        if (tokens.includes('third') && active[2]) { pick(active[2]); return true; }
        if (q.kind === 'compare') {
          if (tokens.includes('left')) { const c = active.find((x) => x.id === 'L' || x.id === '>'); if (c) { pick(c); return true; } }
          if (tokens.includes('right')) { const c = active.find((x) => x.id === 'R' || x.id === '<'); if (c) { pick(c); return true; } }
          if (tokens.includes('same') || tokens.includes('equal')) { const c = active.find((x) => x.id === 'S' || x.id === '='); if (c) { pick(c); return true; } }
        }
        // Match choice id or text against spoken tokens
        for (const c of active) {
          const cid = c.id.toLowerCase();
          const ctxt = (c.text ?? '').toLowerCase();
          if (tokens.includes(cid) || (ctxt && tokens.includes(ctxt)) || (ctxt.length >= 2 && clean.includes(ctxt))) {
            pick(c);
            return true;
          }
          // Captain's log shape matching (e.g. "big-red-star")
          if (q.kind === 'follow') {
            const parts = cid.split('-');
            if (parts.every((p) => tokens.includes(p)) || parts.slice(1).every((p) => tokens.includes(p))) {
              pick(c);
              return true;
            }
          }
        }
        return false;
      },
    });
  });

  const remRatio = limitSec > 0 ? Math.max(0, 1 - elapsedMs / (limitSec * 1000)) : 0;
  const remSec = limitSec > 0 ? Math.max(0, Math.ceil(limitSec - elapsedMs / 1000)) : 0;
  const liveStars = computeSpeedStars(elapsedMs, limitSec, !wrong && level === 0);

  return (
    <div className="qcard">
      {showStarFly && (
        <div className="flying-stars-burst" aria-hidden>
          <span className="star-fly s1">⭐</span>
          {bonusStars && bonusStars > 1 && <span className="star-fly s2">⭐</span>}
          {bonusStars && bonusStars > 2 && <span className="star-fly s3">⭐</span>}
        </div>
      )}
      <div className="qcard-top-row">
        {limitSec > 0 && (
          <div className={`qtimer tier-${liveStars}`} aria-label={`${remSec} seconds for speed bonus`}>
            <div className="qtimer-bar">
              <i style={{ width: `${Math.round(remRatio * 100)}%` }} />
            </div>
            <span className="qtimer-lbl">
              {bonusStars ? `⚡ +${bonusStars} ⭐ Bonus!` : remSec > 0 ? `⏱️ ${remSec}s · ${'⭐'.repeat(liveStars)}` : '⏱️ Take your time · ⭐'}
            </span>
          </div>
        )}
        {isVoiceSupported() && (
          <button
            type="button"
            className={`voice-indicator-chip${voice.status === 'listening' ? ' listening' : ''}`}
            onClick={toggleVoiceListening}
            aria-label={voice.status === 'listening' ? 'Stop listening' : 'Voice command or speak answer'}
            title="Voice commands (or say your answer)"
          >
            <span>{voice.status === 'listening' ? '🎙️ Listening...' : '🎤 Voice'}</span>
            {voice.lastTranscript && <small className="voice-heard">"{voice.lastTranscript}"</small>}
          </button>
        )}
      </div>

      <Bubble
        theme={theme}
        mood={done ? 'cheer' : 'talking'}
        text={bubble || (placement ? 'Take your best guess. You can do it!' : `Take your time, ${profile.name}!`)}
        hintInfo={!placement && maxHints > 0 ? { level, max: maxHints, onAsk: ask } : undefined}
      />

      <div
        className="prompt"
        role="button"
        tabIndex={0}
        onClick={() => void speak(fill(q.say ?? q.prompt, theme))}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); void speak(fill(q.say ?? q.prompt, theme)); } }}
        aria-label={`${prompt}. Tap to read question aloud`}
        title="Tap to hear question again"
      >
        <span className="prompt-text">{prompt}</span>
        <span className="prompt-sound-cue" aria-hidden>🔊</span>
      </div>

      <div className="visual">{visual}</div>

      <div className={`choices n${q.choices.length}${variant === 'ropes' ? ' ropes' : ''}${q.kind === 'follow' ? ' deck' : ''}`}>
        {q.choices.map((c, idx) => {
          const isGone = gone.includes(c.id);
          const glow = reveal && c.id === q.answer;
          const cls = `choice${isGone ? ' gone' : ''}${glow ? ' glow' : ''}${done === c.id && c.id === q.answer ? ' right' : ''}`;
          return (
            <button key={c.id} className={cls} data-autofocus={idx === 0 ? '' : undefined} disabled={isGone} onClick={() => pick(c)} aria-label={c.text ?? c.id}>
              {c.shape && <ShapeSvg shape={c.shape} />}
              {c.emoji && <span className="ce">{c.emoji}</span>}
              {c.text && !(q.kind === 'word') && <span className="ct">{c.text}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
