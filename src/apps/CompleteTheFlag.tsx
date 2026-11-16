import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FLAG_PUZZLE_LIBRARY,
  type FlagPuzzleChoice,
  type FlagPuzzleItem,
} from '../content/flagPuzzles';
import { awardStars } from '../core/engine';
import { focusFirst } from '../core/nav';
import { awardPassportStamp } from '../core/passport';
import { sfx, speak, speakThemePraise, stopSpeaking } from '../core/speech';
import type { MiniAppProps } from '../core/types';
import { Confetti } from '../ui/Art';
import { GameShell } from '../ui/GameShell';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function CompleteTheFlag({
  profile,
  theme,
  onExit,
  onComplete,
}: MiniAppProps) {
  const isMission = Boolean(onComplete);
  const totalQuestions = isMission ? 5 : Infinity;

  // Track asked question IDs in this session to guarantee NO repeats
  const seenPuzzleIdsRef = useRef<Set<string>>(new Set());

  // Game state
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentPuzzle, setCurrentPuzzle] = useState<FlagPuzzleItem | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [pieceSnapped, setPieceSnapped] = useState(false);
  const [isNewStamp, setIsNewStamp] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Auto-advance timer
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const safeFocus = useCallback(() => {
    if (typeof document !== 'undefined') {
      try {
        focusFirst();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const clearCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setAutoCountdown(null);
  }, []);

  // Pick next puzzle ensuring session non-repeat
  const pickNextPuzzle = useCallback((): FlagPuzzleItem => {
    const unasked = FLAG_PUZZLE_LIBRARY.filter(
      (p) => !seenPuzzleIdsRef.current.has(p.id)
    );
    const pool = unasked.length > 0 ? unasked : FLAG_PUZZLE_LIBRARY;
    if (unasked.length === 0) {
      seenPuzzleIdsRef.current.clear();
    }
    const picked = pool[Math.floor(Math.random() * pool.length)];
    seenPuzzleIdsRef.current.add(picked.id);
    return picked;
  }, []);

  const formatPuzzlePrompt = useCallback((puzzle: FlagPuzzleItem): string => {
    const q = puzzle.say || puzzle.question;
    const choicesText = puzzle.choices
      .map((c, i) => {
        const letter = OPTION_LETTERS[i];
        const prefix = i === puzzle.choices.length - 1 ? 'or ' : '';
        return `${prefix}${letter}: ${c.text}`;
      })
      .join(', ');
    return `${q} Is it: ${choicesText}?`;
  }, []);

  const startRound = useCallback(
    (puzzle: FlagPuzzleItem) => {
      clearCountdown();
      setCurrentPuzzle(puzzle);
      setSelectedChoiceId(null);
      setAnswered(false);
      setIsCorrect(false);
      setPieceSnapped(false);
      setIsNewStamp(false);

      stopSpeaking();
      void speak(formatPuzzlePrompt(puzzle));

      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      focusTimerRef.current = setTimeout(safeFocus, 60);
    },
    [clearCountdown, formatPuzzlePrompt, safeFocus]
  );

  // Initialize first round
  useEffect(() => {
    const first = pickNextPuzzle();
    startRound(first);
    return () => {
      clearCountdown();
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      stopSpeaking();
    };
  }, [pickNextPuzzle, startRound, clearCountdown]);

  // Choice selection handler
  const handleSelectChoice = async (choice: FlagPuzzleChoice) => {
    if (answered || !currentPuzzle) return;

    clearCountdown();
    setAnswered(true);
    setSelectedChoiceId(choice.id);
    stopSpeaking();

    const correct = choice.correct;
    setIsCorrect(correct);

    if (correct) {
      sfx.star();
      setPieceSnapped(true);
      setScore((s) => s + 1);
      awardStars(profile.id, 1);

      const stampAwarded = awardPassportStamp(
        profile.id,
        currentPuzzle.country,
        currentPuzzle.flagEmoji,
        currentPuzzle.continent as any,
        undefined,
        undefined,
        'Complete the Flag',
        currentPuzzle.funFact
      );
      if (stampAwarded) {
        setIsNewStamp(true);
      }

      await speakThemePraise(theme, undefined, profile.name);
      await speak(currentPuzzle.funFact);
    } else {
      sfx.soft();
      // Snap the correct piece so the child can learn what the completed flag looks like
      setPieceSnapped(true);
      await speak(
        `Not quite! The flag of ${currentPuzzle.country} needs the ${currentPuzzle.missingDescription}. ${currentPuzzle.funFact}`
      );
    }

    // Auto-advance countdown (8 seconds)
    let remaining = 8;
    setAutoCountdown(remaining);
    timerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearCountdown();
        handleNextRound();
      } else {
        setAutoCountdown(remaining);
      }
    }, 1000);

    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    focusTimerRef.current = setTimeout(safeFocus, 100);
  };

  const handleNextRound = () => {
    clearCountdown();
    stopSpeaking();

    if (isMission && currentRound + 1 >= totalQuestions) {
      setGameOver(true);
      onComplete?.({ correct: score, total: totalQuestions });
      return;
    }

    setCurrentRound((r) => r + 1);
    const next = pickNextPuzzle();
    startRound(next);
  };

  const handleFinishEarly = () => {
    clearCountdown();
    stopSpeaking();
    setGameOver(true);
    if (onComplete) {
      onComplete({ correct: score, total: currentRound + 1 });
    }
  };

  const handleHearAgain = () => {
    if (!currentPuzzle) return;
    stopSpeaking();
    if (answered) {
      void speak(
        `${currentPuzzle.country}: ${currentPuzzle.missingDescription}. ${currentPuzzle.funFact}`
      );
    } else {
      void speak(formatPuzzlePrompt(currentPuzzle));
    }
  };

  if (gameOver) {
    return (
      <GameShell
        title="Complete the Flag"
        icon="🧩"
        onExit={onExit}
        className="complete-the-flag-app"
      >
        <div className="overlay">
          <Confetti />
          <div className="card text-center complete-flag-summary-card">
            <div className="big-emoji">🚩🌟</div>
            <h1>Flag Master Explorer!</h1>
            <p>
              {isMission
                ? `You completed the mission with ${score} of ${totalQuestions} flags solved!`
                : `Awesome job! You solved ${currentRound + 1} flags and earned ${score} ⭐ stars!`}
            </p>
            <div className="button-group flex justify-center gap-12 mt-20">
              <button
                type="button"
                className="btn-primary"
                data-autofocus
                onClick={() => {
                  setGameOver(false);
                  setCurrentRound(0);
                  setScore(0);
                  seenPuzzleIdsRef.current.clear();
                  const first = pickNextPuzzle();
                  startRound(first);
                }}
              >
                Play Again 🔄
              </button>
              <button type="button" className="btn-secondary" onClick={onExit}>
                Done 🏁
              </button>
            </div>
          </div>
        </div>
      </GameShell>
    );
  }

  if (!currentPuzzle) {
    return null;
  }

  // Find the correct choice object
  const correctChoice = currentPuzzle.choices.find((c) => c.correct);

  return (
    <GameShell
      title="Complete the Flag"
      icon="🧩"
      onExit={onExit}
      right={
        isMission
          ? `Flag ${currentRound + 1}/${totalQuestions} · ⭐ ${score}`
          : `Flag ${currentRound + 1} · ⭐ ${score}`
      }
      className="complete-the-flag-app"
    >
      <div className="complete-flag-container">
        {/* Header / Question info card */}
        <div className="complete-flag-header-card">
          <div className="complete-flag-meta">
            <span className="country-badge">
              {currentPuzzle.flagEmoji} {currentPuzzle.country}
            </span>
            <span className="continent-badge">🌍 {currentPuzzle.continent}</span>
            <button
              type="button"
              className="hear-btn"
              onClick={handleHearAgain}
              title="Hear question or fun fact aloud"
            >
              🔊 Hear
            </button>
          </div>

          <h2 className="complete-flag-question">{currentPuzzle.question}</h2>
        </div>

        {/* Big Visual Flag Box */}
        <div className="complete-flag-stage">
          <div className="flag-canvas-wrapper">
            <FlagVisualCanvas
              puzzle={currentPuzzle}
              snapped={pieceSnapped}
              correctChoice={correctChoice}
            />
          </div>
        </div>

        {/* Feedback / Fun fact banner when answered */}
        {answered && (
          <div
            className={`complete-flag-feedback-card ${
              isCorrect ? 'correct' : 'incorrect'
            }`}
          >
            <div className="feedback-title-row">
              <span className="feedback-badge">
                {isCorrect ? '🎉 Correct! Flag Complete!' : '💡 Let’s Complete It!'}
              </span>
              {isNewStamp && (
                <span className="passport-new-badge">
                  🛂 New Passport Stamp Earned!
                </span>
              )}
            </div>
            <p className="fun-fact-text">{currentPuzzle.funFact}</p>
            <div className="next-action-bar">
              <button
                type="button"
                className="btn-finish-early"
                onClick={handleFinishEarly}
              >
                Done 🏁
              </button>
              <button
                type="button"
                className="btn-next-flag"
                data-autofocus
                onClick={handleNextRound}
              >
                {autoCountdown !== null
                  ? `Next Flag (${autoCountdown}s) ➡️`
                  : 'Next Flag ➡️'}
              </button>
            </div>
          </div>
        )}

        {/* 4 Choices Grid */}
        <div className="complete-flag-choices-grid">
          {currentPuzzle.choices.map((choice, index) => {
            const letter = OPTION_LETTERS[index];
            const isSelected = selectedChoiceId === choice.id;
            let statusClass = '';

            if (answered) {
              if (choice.correct) {
                statusClass = 'choice-correct';
              } else if (isSelected && !choice.correct) {
                statusClass = 'choice-wrong';
              } else {
                statusClass = 'choice-dimmed';
              }
            }

            return (
              <button
                key={choice.id}
                type="button"
                className={`complete-flag-choice-btn ${statusClass}`}
                disabled={answered}
                data-autofocus={index === 0 && !answered ? true : undefined}
                onClick={() => handleSelectChoice(choice)}
              >
                <span className="choice-letter-badge">{letter}</span>
                <span className="choice-emoji-chip">{choice.emoji}</span>
                <span className="choice-text-wrap">
                  <span className="choice-title">{choice.text}</span>
                  {choice.color && (
                    <span
                      className="choice-color-dot"
                      style={{ backgroundColor: choice.color }}
                      title={choice.color}
                    />
                  )}
                </span>
                {answered && choice.correct && (
                  <span className="choice-icon-mark">✓</span>
                )}
                {answered && isSelected && !choice.correct && (
                  <span className="choice-icon-mark">✕</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}

/**
 * FlagVisualCanvas renders a high-definition flag with the missing piece slot.
 * When `snapped` is true, the missing piece snaps into place with a smooth entrance!
 */
function FlagVisualCanvas({
  puzzle,
  snapped,
  correctChoice,
}: {
  puzzle: FlagPuzzleItem;
  snapped: boolean;
  correctChoice?: FlagPuzzleChoice;
}) {
  const { flagStyle, country } = puzzle;
  const layout = flagStyle.type;

  // 1. Circle in Center (e.g. Japan, South Korea)
  if (layout === 'circle_center') {
    const baseColor = (flagStyle.baseColor as string) || '#ffffff';
    const emblem = (flagStyle.emblemEmoji as string) || correctChoice?.emoji || '🔴';

    return (
      <div
        className="flag-box circle-center-flag"
        style={{ backgroundColor: baseColor }}
        aria-label={`Flag of ${country}`}
      >
        <div
          className={`missing-slot circle-slot ${
            snapped ? 'slot-snapped' : 'slot-empty'
          }`}
        >
          {snapped ? (
            <div className="snapped-piece circle-piece">
              {puzzle.id === 'puzzle_japan' ? (
                <div
                  className="japan-sun-circle"
                  style={{ backgroundColor: puzzle.colors[1] || '#bc002d' }}
                />
              ) : (
                <span className="snapped-emoji">{emblem}</span>
              )}
            </div>
          ) : (
            <div className="pulsing-slot-indicator" title="Missing Piece">
              <span className="pulse-question-badge">?</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Vertical Stripes (e.g. France, Italy, Ireland, Peru)
  if (layout === 'stripe_vertical') {
    const stripeColors = (flagStyle.stripeColors as string[]) || puzzle.colors;
    const missingIdx =
      typeof flagStyle.missingStripeIndex === 'number'
        ? flagStyle.missingStripeIndex
        : 1;

    return (
      <div
        className="flag-box stripe-vertical-flag"
        aria-label={`Flag of ${country}`}
      >
        {stripeColors.map((col, idx) => {
          const isMissing = idx === missingIdx;
          if (isMissing) {
            return (
              <div
                key={idx}
                className={`vertical-stripe-slot missing-slot ${
                  snapped ? 'slot-snapped' : 'slot-empty'
                }`}
                style={{
                  backgroundColor: snapped ? col : 'rgba(255, 255, 255, 0.15)',
                }}
              >
                {snapped ? (
                  <div
                    className="snapped-stripe-fill"
                    style={{ backgroundColor: col }}
                  />
                ) : (
                  <div className="pulsing-slot-indicator">
                    <span className="pulse-question-badge">?</span>
                  </div>
                )}
              </div>
            );
          }
          return (
            <div
              key={idx}
              className="vertical-stripe-slot"
              style={{ backgroundColor: col }}
            />
          );
        })}
      </div>
    );
  }

  // 3. Horizontal Stripes (e.g. Germany)
  if (layout === 'stripe_horizontal') {
    const stripeColors = (flagStyle.stripeColors as string[]) || puzzle.colors;
    const missingIdx =
      typeof flagStyle.missingStripeIndex === 'number'
        ? flagStyle.missingStripeIndex
        : stripeColors.length - 1;

    return (
      <div
        className="flag-box stripe-horizontal-flag"
        aria-label={`Flag of ${country}`}
      >
        {stripeColors.map((col, idx) => {
          const isMissing = idx === missingIdx;
          if (isMissing) {
            return (
              <div
                key={idx}
                className={`horizontal-stripe-slot missing-slot ${
                  snapped ? 'slot-snapped' : 'slot-empty'
                }`}
                style={{
                  backgroundColor: snapped ? col : 'rgba(255, 255, 255, 0.15)',
                }}
              >
                {snapped ? (
                  <div
                    className="snapped-stripe-fill"
                    style={{ backgroundColor: col }}
                  />
                ) : (
                  <div className="pulsing-slot-indicator">
                    <span className="pulse-question-badge">?</span>
                  </div>
                )}
              </div>
            );
          }
          return (
            <div
              key={idx}
              className="horizontal-stripe-slot"
              style={{ backgroundColor: col }}
            />
          );
        })}
      </div>
    );
  }

  // 4. Canton in Top-Left (e.g. USA, Greece, Australia, China)
  if (layout === 'canton') {
    const baseColor = (flagStyle.baseColor as string) || puzzle.colors[0];
    const cantonColor = (flagStyle.cantonColor as string) || '#002868';
    const emblem = (flagStyle.emblemEmoji as string) || correctChoice?.emoji || '⭐';

    return (
      <div
        className="flag-box canton-flag"
        style={{ backgroundColor: baseColor }}
        aria-label={`Flag of ${country}`}
      >
        {/* USA stripes background if USA */}
        {puzzle.id === 'puzzle_usa' && (
          <div className="usa-stripes-bg">
            {Array.from({ length: 13 }).map((_, i) => (
              <div
                key={i}
                className="usa-stripe"
                style={{ backgroundColor: i % 2 === 0 ? '#b22234' : '#ffffff' }}
              />
            ))}
          </div>
        )}

        {/* Greece stripes background if Greece */}
        {puzzle.id === 'puzzle_greece' && (
          <div className="greece-stripes-bg">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="greece-stripe"
                style={{ backgroundColor: i % 2 === 0 ? '#0d5eaf' : '#ffffff' }}
              />
            ))}
          </div>
        )}

        {/* Australia Southern Cross field stars */}
        {puzzle.id === 'puzzle_australia' && (
          <div className="australia-stars-field">
            <span className="star-com">⭐</span>
            <span className="star-crux s1">★</span>
            <span className="star-crux s2">★</span>
            <span className="star-crux s3">★</span>
            <span className="star-crux s4">★</span>
          </div>
        )}

        {/* Missing Canton Slot */}
        <div
          className={`canton-slot missing-slot ${
            snapped ? 'slot-snapped' : 'slot-empty'
          }`}
          style={{
            backgroundColor: snapped ? cantonColor : 'rgba(0, 0, 0, 0.4)',
          }}
        >
          {snapped ? (
            <div className="snapped-canton-content">
              {puzzle.id === 'puzzle_usa' && (
                <div className="usa-stars-grid">
                  <span>★ ★ ★ ★ ★</span>
                  <span>★ ★ ★ ★</span>
                  <span>★ ★ ★ ★ ★</span>
                </div>
              )}
              {puzzle.id === 'puzzle_greece' && (
                <div className="greece-canton-cross">
                  <div className="cross-v" />
                  <div className="cross-h" />
                </div>
              )}
              {puzzle.id === 'puzzle_australia' && (
                <div className="australia-union-jack">🇬🇧</div>
              )}
              {puzzle.id === 'puzzle_china' && (
                <div className="china-stars-cluster">
                  <span className="big-star">⭐</span>
                  <div className="small-stars">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
                </div>
              )}
              {!['puzzle_usa', 'puzzle_greece', 'puzzle_australia', 'puzzle_china'].includes(
                puzzle.id
              ) && <span className="snapped-emoji">{emblem}</span>}
            </div>
          ) : (
            <div className="pulsing-slot-indicator">
              <span className="pulse-question-badge">?</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. Cross (Center or Nordic, e.g. Switzerland, Sweden, UK, Norway, Jamaica)
  if (layout === 'cross_center') {
    const baseColor = (flagStyle.baseColor as string) || puzzle.colors[0];
    const emblem = (flagStyle.emblemEmoji as string) || correctChoice?.emoji || '➕';

    return (
      <div
        className="flag-box cross-flag"
        style={{ backgroundColor: baseColor }}
        aria-label={`Flag of ${country}`}
      >
        {/* Sweden blue background with yellow Nordic cross */}
        {puzzle.id === 'puzzle_sweden' && snapped && (
          <div className="nordic-cross yellow-nordic-cross">
            <div className="nordic-bar-h" />
            <div className="nordic-bar-v" />
          </div>
        )}

        {/* Norway red background with dark blue and white Nordic cross */}
        {puzzle.id === 'puzzle_norway' && snapped && (
          <div className="nordic-cross norway-nordic-cross">
            <div className="nordic-bar-h-white" />
            <div className="nordic-bar-v-white" />
            <div className="nordic-bar-h-blue" />
            <div className="nordic-bar-v-blue" />
          </div>
        )}

        {/* Jamaica saltire cross */}
        {puzzle.id === 'puzzle_jamaica' && (
          <div className="jamaica-field">
            <div className="jamaica-tri top" />
            <div className="jamaica-tri bottom" />
            <div className="jamaica-tri left" />
            <div className="jamaica-tri right" />
            {snapped && <div className="jamaica-gold-saltire" />}
          </div>
        )}

        {/* UK Union Jack crosses */}
        {puzzle.id === 'puzzle_uk' && snapped && (
          <div className="uk-crosses-wrap">
            <div className="uk-st-andrew-white" />
            <div className="uk-st-patrick-red" />
            <div className="uk-st-george-white" />
            <div className="uk-st-george-red" />
          </div>
        )}

        {/* Switzerland white Greek cross */}
        {puzzle.id === 'puzzle_switzerland' && snapped && (
          <div className="swiss-greek-cross">
            <div className="swiss-cross-v" />
            <div className="swiss-cross-h" />
          </div>
        )}

        {/* Missing Cross / Emblem Slot */}
        <div
          className={`cross-slot missing-slot ${
            snapped ? 'slot-snapped' : 'slot-empty'
          }`}
        >
          {snapped ? (
            <div className="snapped-piece cross-piece">
              <span className="snapped-emoji">{emblem}</span>
            </div>
          ) : (
            <div className="pulsing-slot-indicator">
              <span className="pulse-question-badge">?</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 6. Emblem in Center (e.g. Canada, India, Brazil, Argentina, Mexico, Egypt, Kenya, South Africa)
  const stripeColors = (flagStyle.stripeColors as string[]) || puzzle.colors;
  const emblem = (flagStyle.emblemEmoji as string) || correctChoice?.emoji || '🌟';

  return (
    <div className="flag-box emblem-flag" aria-label={`Flag of ${country}`}>
      {/* Background stripes or field */}
      {stripeColors.length > 0 && (
        <div
          className={`emblem-flag-background ${
            puzzle.id === 'puzzle_canada' || puzzle.id === 'puzzle_mexico'
              ? 'vertical'
              : 'horizontal'
          }`}
        >
          {stripeColors.map((col, idx) => (
            <div
              key={idx}
              className="emblem-bg-stripe"
              style={{ backgroundColor: col }}
            />
          ))}
        </div>
      )}

      {/* Brazil yellow diamond */}
      {puzzle.id === 'puzzle_brazil' && <div className="brazil-yellow-diamond" />}

      {/* Missing Central Emblem Slot */}
      <div
        className={`emblem-slot missing-slot ${
          snapped ? 'slot-snapped' : 'slot-empty'
        }`}
      >
        {snapped ? (
          <div className="snapped-piece emblem-piece">
            {puzzle.id === 'puzzle_canada' && (
              <span className="canada-maple-leaf">🍁</span>
            )}
            {puzzle.id === 'puzzle_india' && (
              <span className="india-chakra">☸️</span>
            )}
            {puzzle.id === 'puzzle_argentina' && (
              <span className="argentina-sun">🌞</span>
            )}
            {puzzle.id === 'puzzle_mexico' && (
              <span className="mexico-eagle">🦅</span>
            )}
            {puzzle.id === 'puzzle_egypt' && (
              <span className="egypt-eagle">🦅</span>
            )}
            {puzzle.id === 'puzzle_brazil' && (
              <div className="brazil-blue-globe">
                <span className="globe-emoji">🌐</span>
              </div>
            )}
            {puzzle.id === 'puzzle_kenya' && (
              <span className="kenya-shield">🛡️</span>
            )}
            {puzzle.id === 'puzzle_south_africa' && (
              <span className="sa-pall">✳️</span>
            )}
            {!['puzzle_canada', 'puzzle_india', 'puzzle_argentina', 'puzzle_mexico', 'puzzle_egypt', 'puzzle_brazil', 'puzzle_kenya', 'puzzle_south_africa'].includes(
              puzzle.id
            ) && <span className="snapped-emoji">{emblem}</span>}
          </div>
        ) : (
          <div className="pulsing-slot-indicator">
            <span className="pulse-question-badge">?</span>
          </div>
        )}
      </div>
    </div>
  );
}
