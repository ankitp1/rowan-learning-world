import { useEffect, useRef, useState } from 'react';
import { WONDER_TRIVIA_LIBRARY, type WonderTriviaItem } from '../content/wonderTrivia';
import { awardStars } from '../core/engine';
import { sfx, speak, speakThemeEncouragement, speakThemePraise, stopSpeaking } from '../core/speech';
import type { MiniAppProps } from '../core/types';
import { Confetti } from '../ui/Art';
import { GameShell } from '../ui/GameShell';

interface PlayerSetup {
  name: string;
  avatar: string;
  age: number;
}

const AVATAR_OPTIONS = ['🧒', '👧', '👦', '🧑‍🚀', '🦸', '🦊', '🐼', '🦁', '🦄', '🐯'];
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const SEEN_STORAGE_KEY_PREFIX = 'rlw_trivia_seen_';

function getSeenQuestionIds(profileId: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${SEEN_STORAGE_KEY_PREFIX}${profileId}`);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return new Set<string>();
}

function saveSeenQuestionId(profileId: string, id: string) {
  try {
    const set = getSeenQuestionIds(profileId);
    set.add(id);
    localStorage.setItem(`${SEEN_STORAGE_KEY_PREFIX}${profileId}`, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

function formatTriviaSpeech(q: WonderTriviaItem, playerName?: string, isMultiplayer = false): string {
  const intro = isMultiplayer && playerName ? `${playerName}, your turn! ` : '';
  const mainQ = q.say ?? q.question;
  const options = q.choices
    .map((c, i) => {
      const prefix = i === q.choices.length - 1 && q.choices.length > 1 ? 'or ' : '';
      return `${prefix}${c.text}`;
    })
    .join(', ... ');
  return `${intro}${mainQ} ... Is it: ${options}?`;
}

export default function WonderTrivia({ profile, theme, onExit }: MiniAppProps) {
  // Mode selection & 2-player setup
  const [multiplayer, setMultiplayer] = useState<boolean | null>(null);
  const [player1, setPlayer1] = useState<PlayerSetup>({
    name: profile.name || 'Player 1',
    avatar: profile.avatar || '🧒',
    age: profile.age ?? 5,
  });
  const [player2, setPlayer2] = useState<PlayerSetup>({
    name: 'Player 2',
    avatar: '👧',
    age: 7,
  });

  const [activePlayerIdx, setActivePlayerIdx] = useState<0 | 1>(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const totalQuestions = multiplayer ? 8 : 5; // 4 questions each in multiplayer

  const [currentQuestion, setCurrentQuestion] = useState<WonderTriviaItem | null>(null);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Auto-advance countdown
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Session-level asked tracker to guarantee no repeats during the active game
  const sessionAskedIdsRef = useRef<Set<string>>(new Set());

  const activePlayer = activePlayerIdx === 0 ? player1 : player2;

  const clearAutoTimer = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setAutoCountdown(null);
  };

  // Pick question tailored to player's age, preventing repeats across sessions and within the game
  const pickQuestionForAge = (age: number): WonderTriviaItem => {
    const suitable = WONDER_TRIVIA_LIBRARY.filter((q) => age >= q.minAge && age <= q.maxAge);
    const seen = getSeenQuestionIds(profile.id);

    // 1. Fresh questions not asked in this session AND not in persistent history
    let candidates = suitable.filter(
      (q) => !sessionAskedIdsRef.current.has(q.id) && !seen.has(q.id)
    );

    // 2. If all questions in this age tier have been seen, reset history for this tier so cycle begins again
    if (candidates.length === 0) {
      try {
        const suitableIds = new Set(suitable.map((q) => q.id));
        const updated = [...seen].filter((id) => !suitableIds.has(id));
        localStorage.setItem(`${SEEN_STORAGE_KEY_PREFIX}${profile.id}`, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      candidates = suitable.filter((q) => !sessionAskedIdsRef.current.has(q.id));
    }

    const pool = candidates.length > 0 ? candidates : suitable.length > 0 ? suitable : WONDER_TRIVIA_LIBRARY;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    sessionAskedIdsRef.current.add(picked.id);
    saveSeenQuestionId(profile.id, picked.id);
    return picked;
  };

  const nextTurn = () => {
    clearAutoTimer();
    setSelectedChoiceIdx(null);
    setAnswered(false);

    const nextRound = currentRound + 1;
    if (nextRound >= totalQuestions) {
      setGameOver(true);
      sfx.chest();
      return;
    }

    const nextPIdx: 0 | 1 = multiplayer ? (activePlayerIdx === 0 ? 1 : 0) : 0;
    const nextP = nextPIdx === 0 ? player1 : player2;
    setActivePlayerIdx(nextPIdx);
    setCurrentRound(nextRound);

    const nextQ = pickQuestionForAge(nextP.age);
    setCurrentQuestion(nextQ);

    // Read both the question AND the choices aloud
    void speak(formatTriviaSpeech(nextQ, nextP.name, Boolean(multiplayer)));
  };

  const handleStartGame = () => {
    clearAutoTimer();
    sessionAskedIdsRef.current.clear();
    const firstQ = pickQuestionForAge(player1.age);
    setCurrentQuestion(firstQ);
    setActivePlayerIdx(0);
    setScores([0, 0]);
    setCurrentRound(0);
    setGameOver(false);

    // Read question AND choices aloud
    void speak(formatTriviaSpeech(firstQ, player1.name, Boolean(multiplayer)));
  };

  const handleAnswer = (choiceIdx: number) => {
    if (answered || !currentQuestion) return;
    setSelectedChoiceIdx(choiceIdx);
    setAnswered(true);

    const choice = currentQuestion.choices[choiceIdx];
    if (choice.correct) {
      sfx.star();
      setScores((prev) => {
        const next = [...prev] as [number, number];
        next[activePlayerIdx] += 1;
        return next;
      });
      awardStars(profile.id, 1);
      const praiseIdx = Math.floor(Math.random() * (theme.praise?.length || 1));
      void speakThemePraise(theme, praiseIdx).then(() => {
        void speak(currentQuestion.funFact);
      });
    } else {
      sfx.soft();
      const encIdx = Math.floor(Math.random() * (theme.encouragements?.length || 1));
      const correctText = currentQuestion.choices.find((c) => c.correct)?.text;
      void speakThemeEncouragement(theme, encIdx).then(() => {
        if (correctText) void speak(`The correct answer is ${correctText}. ${currentQuestion.funFact}`);
      });
    }

    // Auto-advance countdown (4 seconds, giving child time to hear fact/feedback)
    clearAutoTimer();
    let remaining = 4;
    setAutoCountdown(remaining);
    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearAutoTimer();
        nextTurn();
      } else {
        setAutoCountdown(remaining);
      }
    }, 1000);
  };

  const handleReadAloud = () => {
    if (!currentQuestion) return;
    stopSpeaking();
    void speak(formatTriviaSpeech(currentQuestion, activePlayer.name, Boolean(multiplayer)));
  };

  useEffect(() => {
    return () => {
      clearAutoTimer();
      stopSpeaking();
    };
  }, []);

  // 1. Initial screen: Solo or 2-Player selection & Age Calibration
  if (multiplayer === null) {
    return (
      <GameShell title="Wonder Trivia Library" icon="🌍" onExit={onExit} className="wonder-trivia">
        <div className="card wonder-intro">
          <div className="big-emoji">💡✨</div>
          <h1>Wonder Trivia Quest</h1>
          <p>
            Explore real-world science, animals, space, dinosaurs, and fun riddles inspired by WonderPods!
            Play solo or take turns with family—questions adapt automatically to each player's age!
          </p>
          <div className="row wrap justify-center gap-12">
            <button className="btn primary big" data-autofocus onClick={() => setMultiplayer(false)}>
              🧒 Solo Adventure
            </button>
            <button className="btn big" onClick={() => setMultiplayer(true)}>
              👥 2-Player Challenge (Take Turns)
            </button>
          </div>
        </div>
      </GameShell>
    );
  }

  // 2. Pre-game age calibration for 2 players
  if (currentQuestion === null && !gameOver) {
    return (
      <GameShell title="Player Setup & Age Levels" icon="🎯" onExit={() => setMultiplayer(null)} className="wonder-trivia">
        <div className="card wonder-setup">
          <h2>🎯 Age Calibration</h2>
          <p className="small">Questions match each player's age so everyone has a fair and fun challenge!</p>

          <div className="setup-grid">
            {/* Player 1 */}
            <div className="player-setup-box">
              <h3>{player1.avatar} Player 1 ({player1.name})</h3>
              <label>Name: <input value={player1.name} onChange={(e) => setPlayer1({ ...player1, name: e.target.value })} maxLength={12} /></label>
              <div className="pick">
                {AVATAR_OPTIONS.slice(0, 5).map((a) => (
                  <button key={a} type="button" className={`pick-btn${player1.avatar === a ? ' on' : ''}`} onClick={() => setPlayer1({ ...player1, avatar: a })}>{a}</button>
                ))}
              </div>
              <div className="age-stepper-wrap">
                <span className="small font-bold">Question Level:</span>
                <div className="age-stepper">
                  <button type="button" className="stepper-btn" onClick={() => setPlayer1({ ...player1, age: Math.max(3, player1.age - 1) })} aria-label="Decrease age">−</button>
                  <span className="stepper-val">Age {player1.age}</span>
                  <button type="button" className="stepper-btn" onClick={() => setPlayer1({ ...player1, age: Math.min(10, player1.age + 1) })} aria-label="Increase age">+</button>
                </div>
              </div>
            </div>

            {/* Player 2 (if multiplayer) */}
            {multiplayer && (
              <div className="player-setup-box">
                <h3>{player2.avatar} Player 2 ({player2.name})</h3>
                <label>Name: <input value={player2.name} onChange={(e) => setPlayer2({ ...player2, name: e.target.value })} maxLength={12} /></label>
                <div className="pick">
                  {AVATAR_OPTIONS.slice(5).map((a) => (
                    <button key={a} type="button" className={`pick-btn${player2.avatar === a ? ' on' : ''}`} onClick={() => setPlayer2({ ...player2, avatar: a })}>{a}</button>
                  ))}
                </div>
                <div className="age-stepper-wrap">
                  <span className="small font-bold">Question Level:</span>
                  <div className="age-stepper">
                    <button type="button" className="stepper-btn" onClick={() => setPlayer2({ ...player2, age: Math.max(3, player2.age - 1) })} aria-label="Decrease age">−</button>
                    <span className="stepper-val">Age {player2.age}</span>
                    <button type="button" className="stepper-btn" onClick={() => setPlayer2({ ...player2, age: Math.min(10, player2.age + 1) })} aria-label="Increase age">+</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="row justify-center mt-12 gap-8">
            <button className="btn primary big" data-autofocus onClick={handleStartGame}>
              🚀 Start Trivia!
            </button>
            <button className="btn" onClick={() => setMultiplayer(null)}>
              Back
            </button>
          </div>
        </div>
      </GameShell>
    );
  }

  // 3. Game Over Screen
  if (gameOver) {
    return (
      <GameShell title="Trivia Wrap-Up" icon="🏆" onExit={onExit} className="wonder-trivia">
        <div className="overlay">
          <Confetti />
          <div className="card text-center">
            <div className="big-emoji">🌟🎉</div>
            <h1>Wonder Trivia Complete!</h1>
            {multiplayer ? (
              <div className="multiplayer-scores">
                <div className="score-badge">
                  <span>{player1.avatar} {player1.name}</span>
                  <b>{scores[0]} ⭐</b>
                </div>
                <div className="score-badge">
                  <span>{player2.avatar} {player2.name}</span>
                  <b>{scores[1]} ⭐</b>
                </div>
                <p className="mt-8 font-bold">
                  {scores[0] === scores[1]
                    ? "It's a tie! Fantastic teamwork and knowledge from both of you!"
                    : `${scores[0] > scores[1] ? player1.name : player2.name} took the crown, but both curious minds won big!`}
                </p>
              </div>
            ) : (
              <p>You scored {scores[0]} of {totalQuestions}! Your curious mind is growing every day!</p>
            )}
            <div className="row justify-center mt-12 gap-8">
              <button className="btn primary big" data-autofocus onClick={handleStartGame}>
                Play Again 🔁
              </button>
              <button className="btn" onClick={onExit}>
                All Done
              </button>
            </div>
          </div>
        </div>
      </GameShell>
    );
  }

  // 4. Active Question Turn
  return (
    <GameShell
      title="Wonder Trivia"
      icon="🌍"
      onExit={onExit}
      right={`Q ${currentRound + 1}/${totalQuestions} · ⭐ ${scores[0]}${multiplayer ? ` - ${scores[1]}` : ''}`}
      className="wonder-trivia"
    >
      {/* Sleek Turn / Player Tag (visible in multiplayer or high-contrast solo) */}
      {multiplayer && (
        <div className="trivia-turn-bar">
          <div className={`turn-tag${activePlayerIdx === 0 ? ' active' : ''}`}>
            <span>{player1.avatar} {player1.name}</span>
            <b>{scores[0]} ⭐</b>
          </div>
          <div className={`turn-tag${activePlayerIdx === 1 ? ' active' : ''}`}>
            <span>{player2.avatar} {player2.name}</span>
            <b>{scores[1]} ⭐</b>
          </div>
        </div>
      )}

      {currentQuestion && (
        <div className="trivia-card card">
          {/* Compact Top Header */}
          <div className="trivia-header">
            <span className="trivia-cat-pill">
              {currentQuestion.icon} {currentQuestion.category.toUpperCase()} · Age {activePlayer.age}
            </span>
            <div className="row align-center gap-8">
              <button
                className="icon-btn trivia-speech-btn"
                aria-label="Read question and options aloud"
                title="Tap to hear question and options"
                onClick={handleReadAloud}
              >
                🔊 Tap to Hear
              </button>
            </div>
          </div>

          {/* Question Text */}
          <h2 className="trivia-question">{currentQuestion.question}</h2>

          {/* Options Grid (Adaptive 2-column or 3-column layout) */}
          <div
            className={`choices trivia-choices cols-${Math.min(currentQuestion.choices.length, 3)}`}
            role="group"
            aria-label="Answer options"
          >
            {currentQuestion.choices.map((c, i) => {
              const isSelected = selectedChoiceIdx === i;
              const isCorrect = c.correct;
              const btnClass = answered
                ? isCorrect
                  ? 'choice right'
                  : isSelected
                  ? 'choice gone'
                  : 'choice'
                : 'choice';
              return (
                <button
                  key={i}
                  className={btnClass}
                  disabled={answered}
                  onClick={() => handleAnswer(i)}
                  data-autofocus={i === 0 ? '' : undefined}
                  aria-label={`Option ${OPTION_LETTERS[i]}: ${c.text}`}
                >
                  <span className="choice-badge">{OPTION_LETTERS[i]}</span>
                  {c.emoji && <span className="ce">{c.emoji}</span>}
                  <span className="ct font-bold">{c.text}</span>
                </button>
              );
            })}
          </div>

          {/* Compact Inline Feedback Bar with Auto-Advance Timer */}
          {answered && (
            <div className="trivia-feedback-bar pop">
              <div className="feedback-content">
                <span className="feedback-badge">
                  {currentQuestion.choices[selectedChoiceIdx!]?.correct ? '🌟 Correct!' : '💡 Nice Try!'}
                </span>
                <p className="feedback-fact">{currentQuestion.funFact}</p>
              </div>
              <button
                className="btn primary next-turn-btn"
                data-autofocus
                onClick={() => {
                  clearAutoTimer();
                  nextTurn();
                }}
              >
                {currentRound + 1 >= totalQuestions
                  ? 'Results 🏆'
                  : `Next ➡️ ${autoCountdown !== null ? `(${autoCountdown}s)` : ''}`}
              </button>
            </div>
          )}
        </div>
      )}
    </GameShell>
  );
}
