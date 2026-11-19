import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { awardStars, shuffleArray } from '../core/engine';
import { focusFirst } from '../core/nav';
import { sfx, speak, stopSpeaking } from '../core/speech';
import type { MiniAppProps } from '../core/types';
import { Confetti } from '../ui/Art';
import { GameShell } from '../ui/GameShell';
import {
  CONTINENTS,
  GEO_QUESTIONS,
  OCEANS,
  type ContinentDef,
  type GeoQuestion,
} from '../content/geography';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function WorldExplorer({ profile, theme, onExit, onComplete }: MiniAppProps) {
  const isMission = Boolean(onComplete);
  const totalQuestions = isMission ? 5 : Infinity;

  // Active question & game state
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState<GeoQuestion | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [focusedChoiceId, setFocusedChoiceId] = useState<string | null>(null);

  // Free Explore Mode (inspecting continents on the map)
  const [exploreContinent, setExploreContinent] = useState<ContinentDef | null>(null);

  // Auto-advance timer
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track asked question IDs in this session to prevent repeats
  const askedIdsRef = useRef<Set<string>>(new Set());

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setAutoCountdown(null);
  };

  const pickNextQuestion = useCallback((): GeoQuestion => {
    const unasked = GEO_QUESTIONS.filter((q) => !askedIdsRef.current.has(q.id));
    const pool = unasked.length > 0 ? unasked : GEO_QUESTIONS;
    if (unasked.length === 0) askedIdsRef.current.clear();
    const picked = pool[Math.floor(Math.random() * pool.length)];
    askedIdsRef.current.add(picked.id);
    return {
      ...picked,
      choices: shuffleArray(picked.choices),
    };
  }, []);

  const startRound = useCallback((q: GeoQuestion) => {
    clearTimer();
    setCurrentQ(q);
    setSelectedChoiceId(null);
    setAnswered(false);
    setFocusedChoiceId(null);
    setTimeout(focusFirst, 50);

    const speechText = `${q.question} Is it ${q.choices.map((c) => c.text).join(', or ')}?`;
    void speak(speechText);
  }, []);

  // Initialize first question on mount
  useEffect(() => {
    const firstQ = pickNextQuestion();
    startRound(firstQ);
    return () => {
      clearTimer();
      stopSpeaking();
    };
  }, [pickNextQuestion, startRound]);

  const handleChoice = (choiceId: string) => {
    if (answered || !currentQ) return;
    clearTimer();
    setSelectedChoiceId(choiceId);
    setAnswered(true);

    const choice = currentQ.choices.find((c) => c.id === choiceId);
    const isCorrect = Boolean(choice?.correct);

    if (isCorrect) {
      sfx.star();
      setScore((s) => s + 1);
      awardStars(profile.id, 1);
    } else {
      sfx.soft();
    }

    // Play feedback speech (praise/encouragement followed by fun fact)
    const speechPromise = (async () => {
      if (isCorrect) {
        await speak('Wonderful! You found it!');
        await speak(currentQ.funFact);
      } else {
        const correctChoice = currentQ.choices.find((c) => c.correct);
        await speak(`Good try! The correct continent is ${correctChoice?.text}.`);
        await speak(currentQ.funFact);
      }
    })();

    // Auto-advance only after speech completes
    speechPromise.then(() => {
      clearTimer();
      let remaining = 3;
      setAutoCountdown(remaining);
      timerRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearTimer();
          nextQuestion();
        } else {
          setAutoCountdown(remaining);
        }
      }, 1000);
    });
  };

  const nextQuestion = () => {
    clearTimer();
    stopSpeaking();
    const nextRound = currentRound + 1;
    if (isMission && nextRound >= totalQuestions) {
      setGameOver(true);
      sfx.chest();
      return;
    }
    setCurrentRound(nextRound);
    startRound(pickNextQuestion());
  };

  const handleReadAloud = () => {
    if (!currentQ) return;
    stopSpeaking();
    void speak(currentQ.question);
  };

  const handleContinentClick = (c: ContinentDef) => {
    if (!answered && currentQ) {
      // If the clicked continent is one of the choices, select it!
      const matchingChoice = currentQ.choices.find((ch) => ch.id === c.id);
      if (matchingChoice) {
        handleChoice(c.id);
        return;
      }
    }
    // Otherwise open free explore card for this continent
    setExploreContinent(c);
    void speak(`${c.name}! Home to ${c.animals.slice(0, 2).join(' and ')}. ${c.funFact}`);
  };

  // Determine which continent should glow on the map as visual assistance
  const highlightedContinentId = useMemo(() => {
    if (answered && currentQ?.targetContinentId) {
      return currentQ.targetContinentId;
    }
    if (focusedChoiceId) {
      return focusedChoiceId;
    }
    return currentQ?.targetContinentId || null;
  }, [answered, currentQ, focusedChoiceId]);

  if (gameOver) {
    return (
      <GameShell title="World Explorer Wrap-Up" icon="🗺️" onExit={onExit} className="world-explorer">
        <div className="overlay">
          <Confetti />
          <div className="card text-center">
            <div className="big-emoji">🌍🎉</div>
            <h1>Globe Trotter Complete!</h1>
            <p>
              {isMission
                ? `You scored ${score} of ${totalQuestions}! You are a true world explorer!`
                : `You explored ${currentRound + 1} locations across the globe and earned ${score} ⭐ stars!`}
            </p>
            <div className="row justify-center mt-12 gap-8">
              <button
                className="btn primary big"
                data-autofocus
                onClick={() => {
                  askedIdsRef.current.clear();
                  setCurrentRound(0);
                  setScore(0);
                  setGameOver(false);
                  startRound(pickNextQuestion());
                }}
              >
                Explore More 🔁
              </button>
              <button
                className="btn"
                onClick={() => {
                  if (onComplete) onComplete({ correct: score, total: isMission ? totalQuestions : currentRound + 1 });
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

  return (
    <GameShell
      title="World Explorer"
      icon="🗺️"
      onExit={onExit}
      right={
        isMission
          ? `Mission ${currentRound + 1}/${totalQuestions} · ⭐ ${score}`
          : `Location ${currentRound + 1} · ⭐ ${score}`
      }
      className="world-explorer"
    >
      <div className="geo-layout">
        {/* Top Visual Clue & Question Banner */}
        <div className="geo-header-card card">
          <div className="row align-center justify-between gap-12">
            <div className="row align-center gap-12">
              <span className="geo-clue-badge">{currentQ?.clueEmoji || '🗺️'}</span>
              <div>
                <span className="geo-tag">{currentQ?.clueTitle || 'World Quest'}</span>
                <h2 className="geo-question-text">{currentQ?.question}</h2>
              </div>
            </div>
            <div className="row align-center gap-8">
              <button
                type="button"
                className="icon-btn trivia-speech-btn"
                onClick={handleReadAloud}
                aria-label="Read question aloud"
                title="Tap to hear question"
              >
                🔊 Tap to Hear
              </button>
              {!isMission && (
                <button
                  type="button"
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
        </div>

        {/* Hero Interactive World Map SVG */}
        <div className="geo-map-wrap">
          <svg
            className="geo-map-svg"
            viewBox="0 0 1000 520"
            role="application"
            aria-label="Interactive World Map"
          >
            <defs>
              <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d283e" />
                <stop offset="50%" stopColor="#0f3452" />
                <stop offset="100%" stopColor="#0a2033" />
              </linearGradient>
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ocean Basin Background */}
            <rect x="0" y="0" width="1000" height="520" rx="20" fill="url(#oceanGrad)" />

            {/* Latitude Grid & Equator Marker */}
            <line x1="20" y1="130" x2="980" y2="130" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 6" />
            <line x1="20" y1="280" x2="980" y2="280" stroke="rgba(255,211,106,0.3)" strokeDasharray="6 4" strokeWidth="1.5" />
            <text x="36" y="274" fill="rgba(255,211,106,0.6)" fontSize="11" fontWeight="bold">EQUATOR</text>
            <line x1="20" y1="430" x2="980" y2="430" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 6" />

            {/* Ocean Name Labels */}
            {Object.values(OCEANS).map((oc) => (
              <text
                key={oc.id}
                x={oc.center.x}
                y={oc.center.y}
                className="geo-ocean-label"
                textAnchor="middle"
              >
                {oc.name}
              </text>
            ))}

            {/* Continents (Vibrant colored polygons with glow) */}
            {Object.values(CONTINENTS).map((c) => {
              const isTarget = highlightedContinentId === c.id;
              return (
                <g
                  key={c.id}
                  className={`geo-continent-group${isTarget ? ' active' : ''}`}
                  onClick={() => handleContinentClick(c)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${c.name} continent`}
                >
                  <path
                    d={c.path}
                    className="geo-continent-path"
                    fill={c.color}
                    filter={isTarget ? 'url(#goldGlow)' : undefined}
                  />
                  {/* Continent Center Label & Icon */}
                  <g className="geo-continent-marker" transform={`translate(${c.pin.x}, ${c.pin.y})`}>
                    <circle r="18" className="geo-pin-bg" />
                    <text y="6" textAnchor="middle" className="geo-pin-icon">{c.icon}</text>
                    <text y="28" textAnchor="middle" className="geo-pin-label">{c.name}</text>
                  </g>
                </g>
              );
            })}

            {/* Clue Target Pin (Animated dropping onto map) */}
            {currentQ?.targetContinentId && CONTINENTS[currentQ.targetContinentId] && (
              <g
                className="geo-target-beacon"
                transform={`translate(${CONTINENTS[currentQ.targetContinentId].pin.x}, ${CONTINENTS[currentQ.targetContinentId].pin.y - 20})`}
              >
                <circle r="26" className="beacon-pulse" />
                <circle r="14" className="beacon-dot" />
              </g>
            )}
          </svg>
        </div>

        {/* Choice Buttons Bar */}
        <div
          className={`choices geo-choices cols-${Math.min(currentQ?.choices.length || 3, 3)}`}
          role="group"
          aria-label="Geography choices"
        >
          {currentQ?.choices.map((c, i) => {
            const isSelected = selectedChoiceId === c.id;
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
                key={c.id}
                className={btnClass}
                disabled={answered}
                onClick={() => handleChoice(c.id)}
                onFocus={() => setFocusedChoiceId(c.id)}
                onMouseEnter={() => setFocusedChoiceId(c.id)}
                onMouseLeave={() => setFocusedChoiceId(null)}
                data-autofocus={i === 0 ? '' : undefined}
                aria-label={`Option ${OPTION_LETTERS[i]}: ${c.text}`}
              >
                <span className="choice-badge">{OPTION_LETTERS[i]}</span>
                <span className="ce">{c.emoji}</span>
                <span className="ct font-bold">{c.text}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Bar */}
        {answered && currentQ && (
          <div className="trivia-feedback-bar pop mt-8">
            <div className="feedback-content">
              <span className="feedback-badge">
                {currentQ.choices.find((c) => c.id === selectedChoiceId)?.correct
                  ? '🌟 Map Master!'
                  : '💡 Great Explorer!'}
              </span>
              <p className="feedback-fact">{currentQ.funFact}</p>
            </div>
            <button
              className="btn primary next-turn-btn"
              data-autofocus
              onClick={() => {
                clearTimer();
                stopSpeaking();
                nextQuestion();
              }}
            >
              {isMission && currentRound + 1 >= totalQuestions
                ? 'Results 🏆'
                : `Next Location ➡️ ${autoCountdown !== null ? `(${autoCountdown}s)` : ''}`}
            </button>
          </div>
        )}

        {/* Free Explore Continent Modal Card */}
        {exploreContinent && (
          <div className="overlay" onClick={() => setExploreContinent(null)}>
            <div className="card text-center" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
              <div className="big-emoji">{exploreContinent.icon}</div>
              <h1>{exploreContinent.name}</h1>
              <p className="font-bold" style={{ color: exploreContinent.color, fontSize: '20px' }}>
                {exploreContinent.funFact}
              </p>
              <div className="row wrap justify-center gap-8 mt-12">
                <div className="chip" style={{ width: 'auto', padding: '6px 14px', borderRadius: '16px', fontSize: '16px' }}>
                  Animals: {exploreContinent.animals.join(' · ')}
                </div>
                <div className="chip" style={{ width: 'auto', padding: '6px 14px', borderRadius: '16px', fontSize: '16px' }}>
                  Landmarks: {exploreContinent.landmarks.join(' · ')}
                </div>
              </div>
              <div className="mt-16">
                <button
                  type="button"
                  className="btn primary"
                  data-autofocus
                  onClick={() => setExploreContinent(null)}
                >
                  Keep Exploring 🗺️
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
