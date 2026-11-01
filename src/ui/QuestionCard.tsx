import { useEffect, useRef, useState } from 'react';
import { fill } from '../content/generators';
import { focusFirst } from '../core/nav';
import { sfx, soundOut, speak, speakSound, stopSpeaking } from '../core/speech';
import type { Choice, HintMode, Profile, Question, Theme } from '../core/types';
import { HelperAvatar } from './Art';
import { BridgeVisual, MathVisual, ShapeSvg, WordTiles, countSeq } from './Visuals';

export interface AnswerResult {
  correct: boolean;
  given: string;
  expected: string;
  hintsUsed: number;
  tags: string[];
  ms: number;
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

export function Bubble({ theme, text, mood = 'talking' }: { theme: Theme; text: string; mood?: 'idle' | 'talking' | 'cheer' }) {
  return (
    <div className={`bubble${mood === 'cheer' ? ' bubble-cheer' : ''}`} role="status">
      <HelperAvatar theme={theme} size={68} talking mood={mood} />
      <p>{text}</p>
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
  const cancel = useRef<() => void>(() => {});
  const alive = useRef(true);

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
    } else void speak(fill(h.say ?? h.text, theme));
  }

  async function finish(correct: boolean, given: string, tags: string[]) {
    const ms = Date.now() - t0.current;
    const res = { correct, given, expected: q.answer, hintsUsed: level, tags, ms };
    if (placement) { sfx.tap(); setBubble('Thanks! Next one!'); await sleep(500); if (alive.current) onResult(res); return; }
    sfx.good();
    const praise = theme.praise[Math.floor(Math.random() * theme.praise.length)];
    const explain = level > 0 || !correct;
    setBubble(explain ? fill(q.explain.text, theme) : praise);
    cancel.current();
    if (explain) { await speak(praise); await speak(fill(q.explain.say ?? q.explain.text, theme)); await sleep(500); }
    else { await speak(praise); await sleep(350); }
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
    say('Not quite. Try again, you can do it!');
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
    return <MathVisual q={q} theme={theme} hi={hi} />;
  })();

  return (
    <div className="qcard">
      <Bubble theme={theme} mood={done ? 'cheer' : 'talking'} text={bubble || (placement ? 'Take your best guess. You can do it!' : `Take your time, ${profile.name}!`)} />
      <div className="prompt">
        <span>{prompt}</span>
        <button className="icon-btn" aria-label="Read the question aloud" onClick={() => void speak(fill(q.say ?? q.prompt, theme))}>🔊</button>
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
      {!placement && maxHints > 0 && <HelperButton theme={theme} level={level} max={maxHints} onAsk={ask} />}
    </div>
  );
}
