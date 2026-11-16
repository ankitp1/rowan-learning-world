import { useEffect, useRef, useState } from 'react';
import { FLAG_CAPITAL_LIBRARY, type FlagCapitalItem } from '../content/flagsCapitals';
import { awardStars } from '../core/engine';
import { awardPassportStamp } from '../core/passport';
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
const SEEN_STORAGE_KEY_PREFIX = 'rlw_flag_trivia_seen_';

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

function formatTriviaSpeech(q: FlagCapitalItem, playerName?: string, isMultiplayer = false): string {
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

export default function FlagCapitalTrivia({ profile, theme, onExit, onComplete }: MiniAppProps) {
  // Mode selection & 2-player setup
  const [multiplayer, setMultiplayer] = useState<boolean | null>(null);
  const [player1, setPlayer1] = useState<PlayerSetup>({
    name: profile.name || 'Player 1',
    avatar: profile.avatar || '🧒',
    age: profile.age ?? 6,
  });
  const [player2, setPlayer2] = useState<PlayerSetup>({
    name: 'Player 2',
    avatar: '👧',
    age: 7,
  });

  const isMission = Boolean(onComplete);
  const [activePlayerIdx, setActivePlayerIdx] = useState<0 | 1>(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [currentRound, setCurrentRound] = useState<number>(0);
  // Endless standalone hub play so the player can explore as long as they want; bounded for missions
  const totalQuestions = isMission ? (multiplayer ? 8 : 5) : Infinity;

  const [currentQuestion, setCurrentQuestion] = useState<FlagCapitalItem | null>(null);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Auto-advance countdown
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Session-level tracker to GUARANTEE NO REPEATS during the active session
  const sessionAskedIdsRef = useRef<Set<string>>(new Set());

  const activePlayer = activePlayerIdx === 0 ? player1 : player2;

  const clearAutoTimer = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setAutoCountdown(null);
  };

  // Pick question tailored to player's age, preventing repeats across the session and past history
  const pickQuestion = (age: number): FlagCapitalItem => {
    const seen = getSeenQuestionIds(profile.id);

    // Filter suitable items for player's age tier
    const exact = FLAG_CAPITAL_LIBRARY.filter((q) => age >= q.minAge && age <= q.maxAge);
    const suitable = exact.length >= 10 ? exact : FLAG_CAPITAL_LIBRARY;

    // 1. Fresh questions not asked in THIS session AND not in persistent history
    let candidates = suitable.filter(
      (q) => !sessionAskedIdsRef.current.has(q.id) && !seen.has(q.id)
    );

    // 2. If fresh candidates in this age tier are low, try all pool questions not asked in THIS session
    if (candidates.length === 0) {
      candidates = suitable.filter((q) => !sessionAskedIdsRef.current.has(q.id));
    }

    // 3. If suitable tier is fully exhausted in this session, check entire library for unasked questions
    if (candidates.length === 0) {
      candidates = FLAG_CAPITAL_LIBRARY.filter((q) => !sessionAskedIdsRef.current.has(q.id));
    }

    // 4. If all questions in the entire library have been asked in this active session, reset session tracker
    if (candidates.length === 0) {
      sessionAskedIdsRef.current.clear();
      candidates = suitable.length > 0 ? suitable : FLAG_CAPITAL_LIBRARY;
    }

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    sessionAskedIdsRef.current.add(picked.id);
    saveSeenQuestionId(profile.id, picked.id);
    return picked;
  };

  const nextTurn = () => {
    clearAutoTimer();
    stopSpeaking();
    setSelectedChoiceIdx(null);
    setAnswered(false);

    const nextRound = currentRound + 1;
    if (isMission && nextRound >= totalQuestions) {
      setGameOver(true);
      sfx.chest();
      return;
    }

    const nextPIdx: 0 | 1 = multiplayer ? (activePlayerIdx === 0 ? 1 : 0) : 0;
    const nextP = nextPIdx === 0 ? player1 : player2;
    setActivePlayerIdx(nextPIdx);
    setCurrentRound(nextRound);

    const nextQ = pickQuestion(nextP.age);
    setCurrentQuestion(nextQ);

    // Read question and options aloud
    void speak(formatTriviaSpeech(nextQ, nextP.name, Boolean(multiplayer)));
  };

  const handleStartGame = () => {
    clearAutoTimer();
    stopSpeaking();
    sessionAskedIdsRef.current.clear();
    const firstQ = pickQuestion(player1.age);
    setCurrentQuestion(firstQ);
    setActivePlayerIdx(0);
    setScores([0, 0]);
    setCurrentRound(0);
    setGameOver(false);

    // Read question and options aloud
    void speak(formatTriviaSpeech(firstQ, player1.name, Boolean(multiplayer)));
  };

  const handleAnswer = (choiceIdx: number) => {
    if (answered || !currentQuestion) return;
    clearAutoTimer();
    setSelectedChoiceIdx(choiceIdx);
    setAnswered(true);

    const choice = currentQuestion.choices[choiceIdx];
    const isCorrect = choice.correct;

    if (isCorrect) {
      sfx.star();
      setScores((prev) => {
        const next = [...prev] as [number, number];
        next[activePlayerIdx] += 1;
        return next;
      });
      awardStars(profile.id, 1);
      awardPassportStamp(
        profile.id,
        currentQuestion.country,
        currentQuestion.flagEmoji,
        currentQuestion.continent,
        currentQuestion.icon,
        undefined,
        'Flags & Capitals',
        currentQuestion.funFact
      );
    } else {
      sfx.soft();
    }

    // Play feedback speech (praise/encouragement followed by the fun fact)
    const speechPromise = (async () => {
      if (isCorrect) {
        const praiseIdx = Math.floor(Math.random() * (theme.praise?.length || 1));
        await speakThemePraise(theme, praiseIdx, activePlayer.name);
        await speak(currentQuestion.funFact);
      } else {
        const encIdx = Math.floor(Math.random() * (theme.encouragements?.length || 1));
        const correctChoice = currentQuestion.choices.find((c) => c.correct);
        await speakThemeEncouragement(theme, encIdx, activePlayer.name);
        if (correctChoice) {
          await speak(`The correct answer is ${correctChoice.text}. ${currentQuestion.funFact}`);
        }
      }
    })();

    // Start auto-advance countdown after speech finishes, but user can click Next anytime!
    speechPromise.then(() => {
      clearAutoTimer();
      let remaining = 3;
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
    });
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

  // 1. Initial Mode Selection: Solo or 2-Player
  if (multiplayer === null) {
    return (
      <GameShell title="Flags, Capitals & Monuments" icon="🚩" onExit={onExit} className="flag-trivia-app">
        <div className="card wonder-intro">
          <div className="big-emoji">🚩🏛️🌍</div>
          <h1>World Flags & Capitals Quest</h1>
          <p>
            Explore country flags, capital cities, and famous global monuments from around the world!
            Play solo or take turns with family—questions never repeat during your quest!
          </p>
          <div className="row wrap justify-center gap-12">
            <button className="btn primary big" data-autofocus onClick={() => setMultiplayer(false)}>
              🧒 Solo Explorer
            </button>
            <button className="btn big" onClick={() => setMultiplayer(true)}>
              👥 2-Player World Challenge
            </button>
          </div>
        </div>
      </GameShell>
    );
  }

  // 2. Player Setup
  if (currentQuestion === null && !gameOver) {
    return (
      <GameShell title="Player Setup & Level" icon="🎯" onExit={() => setMultiplayer(null)} className="flag-trivia-app">
        <div className="card wonder-setup">
          <h2>🎯 World Adventurer Setup</h2>
          <p className="small">Questions match each player's age so everyone has an exciting adventure!</p>

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
                  <button type="button" className="stepper-btn" onClick={() => setPlayer1({ ...player1, age: Math.max(4, player1.age - 1) })} aria-label="Decrease age">−</button>
                  <span className="stepper-val">Age {player1.age}</span>
                  <button type="button" className="stepper-btn" onClick={() => setPlayer1({ ...player1, age: Math.min(12, player1.age + 1) })} aria-label="Increase age">+</button>
                </div>
              </div>
            </div>

            {/* Player 2 */}
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
                    <button type="button" className="stepper-btn" onClick={() => setPlayer2({ ...player2, age: Math.max(4, player2.age - 1) })} aria-label="Decrease age">−</button>
                    <span className="stepper-val">Age {player2.age}</span>
                    <button type="button" className="stepper-btn" onClick={() => setPlayer2({ ...player2, age: Math.min(12, player2.age + 1) })} aria-label="Increase age">+</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="row justify-center mt-12 gap-8">
            <button className="btn primary big" data-autofocus onClick={handleStartGame}>
              🚀 Start Journey!
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
      <GameShell title="World Quest Complete" icon="🏆" onExit={onExit} className="flag-trivia-app">
        <div className="overlay">
          <Confetti />
          <div className="card text-center">
            <div className="big-emoji">🌟🚩🏆</div>
            <h1>World Quest Complete!</h1>
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
                    ? "It's a tie! Incredible world geography knowledge from both of you!"
                    : `${scores[0] > scores[1] ? player1.name : player2.name} took the explorer trophy! Both great travelers!`}
                </p>
              </div>
            ) : (
              <p>
                {isMission
                  ? `You scored ${scores[0]} of ${totalQuestions}! Fantastic job!`
                  : `You explored ${currentRound + 1} questions across the globe and earned ${scores[0]} ⭐ stars! You are a true World Explorer!`}
              </p>
            )}
            <div className="row justify-center mt-12 gap-8">
              <button className="btn primary big" data-autofocus onClick={handleStartGame}>
                Play Again 🔁
              </button>
              <button
                className="btn"
                onClick={() => {
                  if (onComplete) onComplete({ correct: scores[0], total: isMission ? totalQuestions : currentRound + 1 });
                  else onExit();
                }}
              >
                All Done
              </button>
            </div>
          </div>
        </div>
      </GameShell>
    );
  }

  // Category title helper
  const catLabel =
    currentQuestion?.category === 'flags'
      ? '🚩 Country Flag'
      : currentQuestion?.category === 'capitals'
      ? '🏛️ Capital City'
      : '🗽 Famous Monument';

  // 4. Active Question Turn
  return (
    <GameShell
      title="Flags & Capitals"
      icon="🚩"
      onExit={onExit}
      right={
        isMission
          ? `Q ${currentRound + 1}/${totalQuestions} · ⭐ ${scores[0]}${multiplayer ? ` - ${scores[1]}` : ''}`
          : `Q ${currentRound + 1} · ⭐ ${scores[0]}${multiplayer ? ` - ${scores[1]}` : ''}`
      }
      className="flag-trivia-app"
    >
      {/* Turn Tag for multiplayer */}
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
        <div className="trivia-card card flag-trivia-card">
          {/* Header Bar */}
          <div className="trivia-header">
            <div className="row align-center gap-8">
              <span className="trivia-cat-pill">
                {catLabel} · {currentQuestion.continent}
              </span>
              <span className="flag-prominent-badge" aria-label={`Flag of ${currentQuestion.country}`}>
                {currentQuestion.flagEmoji}
              </span>
            </div>
            <div className="row align-center gap-8">
              <button
                className="icon-btn trivia-speech-btn"
                aria-label="Read question and options aloud"
                title="Tap to hear question and options"
                onClick={handleReadAloud}
              >
                🔊 Tap to Hear
              </button>
              {!isMission && (
                <button
                  className="icon-btn"
                  style={{ fontSize: '15px', padding: '6px 12px' }}
                  onClick={() => setGameOver(true)}
                  aria-label="Finish and view score"
                >
                  Done 🏁
                </button>
              )}
            </div>
          </div>

          {/* Visual Showcase for Flags & Monuments */}
          <div className="flag-visual-stage">
            <span className="flag-stage-emoji" role="img" aria-label="Question icon">
              {currentQuestion.category === 'flags' ? currentQuestion.flagEmoji : currentQuestion.icon}
            </span>
            <div className="flag-question-text-wrap">
              <h2 className="trivia-question">{currentQuestion.question}</h2>
            </div>
          </div>

          {/* 4 Answer Options */}
          <div
            className={`choices trivia-choices cols-${Math.min(currentQuestion.choices.length, 2)}`}
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
                  data-autofocus={!answered && i === 0 ? '' : undefined}
                  aria-label={`Option ${OPTION_LETTERS[i]}: ${c.text}`}
                >
                  <span className="choice-badge">{OPTION_LETTERS[i]}</span>
                  {c.emoji && <span className="ce flag-choice-emoji">{c.emoji}</span>}
                  <span className="ct font-bold">{c.text}</span>
                </button>
              );
            })}
          </div>

          {/* Inline Feedback Bar with Fun Fact and Instant Next Button */}
          {answered && (
            <div className="trivia-feedback-bar pop">
              <div className="feedback-content">
                <span className="feedback-badge">
                  {currentQuestion.choices[selectedChoiceIdx!]?.correct ? '🌟 Correct!' : '💡 Good Try!'}
                </span>
                <p className="feedback-fact">{currentQuestion.funFact}</p>
              </div>
              <button
                className="btn primary next-turn-btn"
                data-autofocus
                onClick={() => {
                  clearAutoTimer();
                  stopSpeaking();
                  nextTurn();
                }}
              >
                {isMission && currentRound + 1 >= totalQuestions
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
