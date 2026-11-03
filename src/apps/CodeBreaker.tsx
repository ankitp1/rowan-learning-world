import { useEffect, useMemo, useRef, useState } from 'react';
import { awardStars } from '../core/engine';
import { sfx, speak, stopSpeaking } from '../core/speech';
import type { MiniAppProps, Theme } from '../core/types';
import { Confetti } from '../ui/Art';
import { GameShell, useStoredLevel } from '../ui/GameShell';
import { Bubble, HelperButton } from '../ui/QuestionCard';
import { GEMS, absentGem, codeSpec, makeSecret, score } from './codeBreaker';

const Gem = ({ i, dim = false }: { i: number | null; dim?: boolean }) =>
  i === null ? <span className="gem empty" /> : <span className={`gem${dim ? ' dim' : ''}`} style={{ background: GEMS[i].color }} aria-label={GEMS[i].name}>{GEMS[i].glyph}</span>;

const Feedback = ({ exact, near, len }: { exact: number; near: number; len: number }) => (
  <span className="fb" aria-label={`${exact} right spot, ${near} wrong spot`}>
    {Array.from({ length: len }, (_, i) => <i key={i} className={i < exact ? 'ex' : i < exact + near ? 'nr' : ''} />)}
  </span>
);

function Game({ level, theme, onWin, onNext, onExit }: {
  level: number; theme: Theme; onWin: (stars: number) => void; onNext: (won: boolean) => void; onExit: () => void;
}) {
  const spec = codeSpec(level);
  const secret = useMemo(() => makeSecret(spec.len, spec.colors, spec.repeats), [spec.len, spec.colors, spec.repeats]);
  const [guess, setGuess] = useState<(number | null)[]>(Array(spec.len).fill(null));
  const [locked, setLocked] = useState<boolean[]>(Array(spec.len).fill(false));
  const [history, setHistory] = useState<{ guess: number[]; exact: number; near: number }[]>([]);
  const [status, setStatus] = useState<'play' | 'won' | 'lost'>('play');
  const [help, setHelp] = useState(0);
  const [nope, setNope] = useState<number | null>(null);
  const [bubble, setBubble] = useState(`Crack the code! It has ${spec.len} gems. ${spec.repeats ? 'A gem can be used more than once.' : 'Every gem is different.'}`);
  const historyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = historyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history.length]);

  const put = (g: number) => {
    const i = guess.findIndex((x) => x === null);
    if (i < 0 || status !== 'play') return;
    sfx.tap();
    setGuess(guess.map((x, k) => (k === i ? g : x)));
  };
  const clear = (i: number) => { if (!locked[i] && status === 'play') setGuess(guess.map((x, k) => (k === i ? null : x))); };

  const submit = () => {
    if (guess.some((g) => g === null) || status !== 'play') return;
    const g = guess as number[];
    const sc = score(secret, g);
    const next = [...history, { guess: g, ...sc }];
    setHistory(next);
    if (sc.exact === spec.len) {
      setStatus('won'); sfx.chest();
      const stars = help === 0 ? 3 : 2;
      onWin(stars);
      void speak(theme.praise[Math.floor(Math.random() * theme.praise.length)]);
    } else if (next.length >= spec.maxTries) {
      setStatus('lost'); onWin(1);
      setBubble("That was a tough one! Let's try a new code.");
      void speak("That was a tough one! Let's try a new code.");
    } else {
      sfx.soft();
      setGuess(secret.map((s, i) => (locked[i] ? s : null)));
      const msg = sc.exact === 0 && sc.near === 0 ? 'None of those gems are in the code. That helps a lot!' : `${sc.exact} in the right spot, ${sc.near} in the wrong spot.`;
      setBubble(msg); void speak(msg);
    }
  };

  const ask = () => {
    if (help >= 3 || status !== 'play') return;
    const l = help + 1;
    setHelp(l);
    if (l === 1) setBubble('Green dots: right gem in the right spot. Yellow rings: right gem, wrong spot.');
    else if (l === 2) {
      const a = absentGem(secret, spec.colors);
      if (a !== undefined) { setNope(a); setBubble(`The ${GEMS[a].name} gem is NOT in the code.`); }
      else setBubble('Every gem is in the code. Try mixing up their order!');
    } else {
      const idx = secret.findIndex((s, i) => !locked[i] && guess[i] !== s);
      if (idx >= 0) {
        setLocked(locked.map((x, k) => (k === idx ? true : x)));
        setGuess(guess.map((x, k) => (k === idx ? secret[idx] : x)));
        setBubble(`Spot ${idx + 1} is the ${GEMS[secret[idx]].name} gem. I locked it in!`);
      }
    }
    void speak('Here is a hint.');
  };

  const full = guess.every((g) => g !== null);
  return (
    <GameShell title="Code Breaker" icon="🔐" onExit={onExit} right={`Code ${level + 1}`} className="codebreaker">
      <Bubble theme={theme} text={bubble} />
      <div className="vault">
        <span className="vault-emoji">{theme.container.emoji}</span>
        {Array.from({ length: spec.len }, (_, i) => <span key={i} className="gem secret">{status === 'play' ? '?' : <Gem i={secret[i]} />}</span>)}
      </div>
      <div className="code-history-wrap">
        <div className="code-history-header">
          <span>{history.length > 0 ? `Attempts (${history.length}/${spec.maxTries})` : `Attempts (0/${spec.maxTries})`}</span>
          {history.length > 2 && (
            <div className="history-scroll-btns">
              <button
                type="button"
                className="scroll-btn"
                onClick={() => historyRef.current?.scrollBy({ top: -80, behavior: 'smooth' })}
                aria-label="Scroll up to older attempts"
                title="Older attempts"
              >
                ▲
              </button>
              <button
                type="button"
                className="scroll-btn"
                onClick={() => historyRef.current?.scrollBy({ top: 80, behavior: 'smooth' })}
                aria-label="Scroll down to recent attempts"
                title="Recent attempts"
              >
                ▼
              </button>
            </div>
          )}
        </div>
        <div ref={historyRef} className="code-history" aria-label="your guesses" tabIndex={0}>
          {history.length === 0 && <span className="history-empty">Your guesses will appear here</span>}
          {history.map((h, i) => (
            <div key={i} className="code-row" tabIndex={0} aria-label={`Guess ${i + 1}: ${h.exact} right spot, ${h.near} wrong spot`}>
              <b>{i + 1}</b>{h.guess.map((g, k) => <Gem key={k} i={g} />)}<Feedback exact={h.exact} near={h.near} len={spec.len} />
            </div>
          ))}
        </div>
      </div>
      {status === 'play' && (
        <>
          <div className="code-row current">
            {guess.map((g, i) => (
              <button key={i} className={`slot-btn${locked[i] ? ' locked' : ''}`} onClick={() => clear(i)} aria-label={`spot ${i + 1}`}>
                <Gem i={g} />{locked[i] && <span className="lock">🔒</span>}
              </button>
            ))}
            <button className="btn primary" disabled={!full} onClick={submit}>Try it!</button>
          </div>
          <div className="palette">
            {GEMS.slice(0, spec.colors).map((g, i) => (
              <button key={i} className={`gem-btn${nope === i ? ' nope' : ''}`} onClick={() => put(i)} aria-label={g.name}><Gem i={i} dim={nope === i} /></button>
            ))}
          </div>
          <HelperButton theme={theme} level={help} max={3} onAsk={ask} />
        </>
      )}
      {status !== 'play' && (
        <div className="overlay">
          {status === 'won' && <Confetti />}
          <div className="card">
            <div className="big-emoji">{status === 'won' ? '🔓🎉' : theme.container.emoji}</div>
            <h1>{status === 'won' ? `Code cracked in ${history.length}!` : 'The code was...'}</h1>
            {status === 'lost' && <div className="code-row">{secret.map((g, k) => <Gem key={k} i={g} />)}</div>}
            <div className="row">
              <button className="btn primary" data-autofocus onClick={() => onNext(status === 'won')}>{status === 'won' ? 'Next code' : 'New code'}</button>
              <button className="btn" onClick={onExit}>Done</button>
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}

/** Code Breaker: Mastermind with gems. Codes grow from 3 gems / 4 colours to 5 gems / 6 colours with repeats. */
export default function CodeBreaker({ profile, theme, onExit }: MiniAppProps) {
  const [level, setLevel] = useStoredLevel(`rlw.code.${profile.id}`);
  const [round, setRound] = useState(0);
  return (
    <Game
      key={`${level}-${round}`} level={level} theme={theme}
      onWin={(stars) => { awardStars(profile.id, stars); }}
      onNext={(won) => { stopSpeaking(); if (won) setLevel(level + 1); else setRound(round + 1); }}
      onExit={onExit}
    />
  );
}
