import { useEffect, useRef, useState } from 'react';
import story from '../content/story.json';
import { soundsOf, tilesOf } from '../content/phonics';
import { awardStars, logAttempt } from '../core/engine';
import { sfx, soundOut, speak, stopSpeaking } from '../core/speech';
import type { MiniAppProps, Question } from '../core/types';
import QuestionCard, { Bubble, type AnswerResult } from '../ui/QuestionCard';

type Stage = 'read' | 'ask' | 'done';

const toQuestion = (raw: (typeof story.questions)[number], i: number): Question => ({
  id: `story-${i}`,
  skill: raw.skill,
  kind: 'story',
  prompt: raw.prompt,
  say: raw.prompt,
  choices: raw.choices,
  answer: raw.answer,
  hints: [
    { text: raw.nudge, say: raw.nudge },
    { text: 'Let me take one answer away.', effect: 'eliminate' },
    { text: "Here's the answer!", effect: 'reveal' },
  ],
  explain: { text: raw.explain, say: raw.explain },
});

const clean = (w: string) => w.replace(/[^a-zA-Z']/g, '').toLowerCase();

/**
 * Mystery story (Missing Map): short decodable pages. Tap any word for help
 * (say it or sound it out), tap the magnifier to collect clues, then solve the
 * case with three comprehension questions that feed the skill map.
 */
export default function MysteryStory({ profile, theme, onExit, onComplete }: MiniAppProps) {
  const [stage, setStage] = useState<Stage>('read');
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [clues, setClues] = useState<string[]>([]);
  const [qi, setQi] = useState(0);
  const [right, setRight] = useState(0);
  const [bubble, setBubble] = useState('');
  const cancel = useRef<() => void>(() => {});
  const questions = useRef(story.questions.map(toQuestion)).current;
  const pg = story.pages[page];
  const text = pg.text.replace('{name}', profile.name);

  useEffect(() => () => { cancel.current(); stopSpeaking(); }, []);
  useEffect(() => {
    if (stage === 'done') {
      sfx.chest();
      if (onComplete) { const id = setTimeout(() => onComplete({ correct: right, total: questions.length }), 1200); return () => clearTimeout(id); }
    }
  }, [stage, onComplete, right, questions.length]);

  const sayWord = () => { if (sel) void speak(sel); };
  const sound = () => {
    if (!sel) return;
    const w = clean(sel);
    cancel.current();
    const silentE = /^[a-z]+[^aeiou]e$/.test(w) && w.length <= 5 && !['the', 'were', 'here'].includes(w);
    cancel.current = soundOut(soundsOf(w, silentE), w, undefined, 400);
  };
  const readPage = () => { cancel.current(); void speak(text, { rate: 0.85 }); };
  const getClue = () => {
    if (!pg.clue) return;
    sfx.star();
    if (!clues.includes(pg.clue)) setClues((c) => [...c, pg.clue!]);
    setBubble(`Clue found: ${pg.clue}`);
    void speak(pg.clue);
  };

  const onResult = (r: AnswerResult) => {
    const q = questions[qi];
    logAttempt(profile.id, {
      skillIds: [q.skill], appId: 'mystery-story', correct: r.correct, given: r.given, expected: r.expected,
      hintsUsed: r.hintsUsed, ms: r.ms, errorTags: r.tags,
    });
    if (r.correct) { setRight((n) => n + 1); awardStars(profile.id, 1); }
    if (qi + 1 >= questions.length) setStage('done'); else setQi(qi + 1);
  };

  return (
    <div className="screen story">
      <header className="topbar">
        <button className="back" onClick={onExit} aria-label="Back">⬅</button>
        <h2>{theme.mystery.emoji} {story.title}</h2>
        <div className="clues" aria-label="clue notebook">📓 {clues.length}</div>
      </header>

      {stage === 'read' && (
        <div className="story-page">
          <Bubble theme={theme} text={bubble || 'Read the page. Tap a word if you need help.'} />
          <div className="story-art">{pg.art}</div>
          <p className="story-text">
            {text.split(' ').map((w, i) => (
              <button key={`${page}-${i}`} className={`word${sel === w ? ' sel' : ''}`} onClick={() => setSel(w)}>{w}</button>
            ))}
          </p>
          {sel && (
            <div className="word-help">
              <b>{clean(sel)}</b>
              <button className="btn" onClick={sayWord}>🔊 Say it</button>
              {tilesOf(clean(sel)).length > 1 && <button className="btn" onClick={sound}>🧩 Sound it out</button>}
            </div>
          )}
          <div className="row">
            <button className="btn" disabled={page === 0} onClick={() => { setPage(page - 1); setSel(null); setBubble(''); }}>⬅ Back</button>
            <button className="btn" onClick={readPage}>🔊 Read to me</button>
            {pg.clue && <button className="btn clue" onClick={getClue}>🔍 Clue</button>}
            {page < story.pages.length - 1
              ? <button className="btn primary" data-autofocus onClick={() => { setPage(page + 1); setSel(null); setBubble(''); }}>Next ➡</button>
              : <button className="btn primary" data-autofocus onClick={() => { setStage('ask'); setBubble(''); }}>Solve the case! 🕵️</button>}
          </div>
        </div>
      )}

      {stage === 'ask' && (
        <div className="round-body">
          {clues.length > 0 && <div className="notebook">📓 {clues.join(' · ')}</div>}
          <QuestionCard key={questions[qi].id} q={questions[qi]} theme={theme} profile={profile} onResult={onResult} />
        </div>
      )}

      {stage === 'done' && (
        <div className="round-done">
          <div className="big-emoji">🕵️🎉</div>
          <h1>Case solved!</h1>
          <p>Gus had the map. You got {right} of {questions.length}.</p>
          {!onComplete && <button className="btn primary" data-autofocus onClick={onExit}>All done</button>}
        </div>
      )}
    </div>
  );
}
