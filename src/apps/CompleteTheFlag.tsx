import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FLAG_PUZZLE_LIBRARY,
  type FlagPuzzleChoice,
  type FlagPuzzleItem,
} from '../content/flagPuzzles';
import { awardStars, shuffleArray } from '../core/engine';
import { focusFirst } from '../core/nav';
import { awardPassportStamp } from '../core/passport';
import { sfx, speak, speakThemePraise, stopSpeaking } from '../core/speech';
import type { MiniAppProps } from '../core/types';
import { Confetti } from '../ui/Art';
import {
  AshokaChakraGraphic,
  BrazilGlobeGraphic,
  ChinaStarsGraphic,
  GoldenEagleGraphic,
  GreekCantonGraphic,
  JamaicaSaltireGraphic,
  MaasaiShieldGraphic,
  MapleLeafGraphic,
  NordicCrossGraphic,
  renderPieceGraphic,
  SouthAfricaPallGraphic,
  SunDiscGraphic,
  SunOfMayGraphic,
  SwissCrossGraphic,
  TaegeukGraphic,
  UnionJackGraphic,
  UsCantonGraphic,
} from '../ui/FlagGraphics';
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
    return {
      ...picked,
      choices: shuffleArray(picked.choices),
    };
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
    return `${q} Missing: ${puzzle.missingDescription}. Is it: ${choicesText}?`;
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
            <span className="country-badge">🌍 {currentPuzzle.country}</span>
            <span className="continent-badge">📍 {currentPuzzle.continent}</span>
            <span className="piece-needed-pill">
              🧩 Missing: <b>{currentPuzzle.missingDescription}</b>
            </span>
            <button
              type="button"
              className="hear-btn"
              onClick={handleHearAgain}
              title="Hear question and clue aloud"
            >
              🔊 Tap to Hear
            </button>
          </div>

          <h2 className="complete-flag-question">{currentPuzzle.question}</h2>
          <p className="complete-flag-hint">
            Study the flag below. Tap the missing puzzle piece that fits into the cut-out!
          </p>
        </div>

        {/* Big Visual Flag Hero Canvas */}
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

        {/* 4 Large Visual Puzzle Piece Choices */}
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
                aria-label={`Option ${letter}: ${choice.text}`}
              >
                <div className="choice-card-header">
                  <span className="choice-letter-badge">{letter}</span>
                  {choice.color && (
                    <span
                      className="choice-color-dot"
                      style={{ backgroundColor: choice.color }}
                      title={choice.color}
                    />
                  )}
                  {answered && choice.correct && (
                    <span className="choice-icon-mark correct">✓</span>
                  )}
                  {answered && isSelected && !choice.correct && (
                    <span className="choice-icon-mark wrong">✕</span>
                  )}
                </div>

                {/* Big Visual Graphic Preview of the Piece */}
                <div className="choice-visual-preview">
                  {renderPieceGraphic(choice.text, choice.color, 76)}
                  <span className="choice-emoji-chip" style={{ display: 'none' }}>
                    {choice.emoji}
                  </span>
                </div>

                <div className="choice-title-wrap">
                  <span className="choice-title">{choice.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}

/**
 * FlagVisualCanvas renders a prominent, high-definition flag with the missing piece slot.
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

  return (
    <div className="flag-hero-frame">
      {/* Decorative Flagpole Sleeve on Left */}
      <div className="flagpole-sleeve">
        <span className="grommet top" />
        <span className="grommet bottom" />
      </div>

      {/* Flag Canvas Content */}
      <div className="flag-canvas-inner">
        {/* 1. Circle in Center (Japan, South Korea) */}
        {layout === 'circle_center' && (
          <div
            className="flag-box circle-center-flag"
            style={{ backgroundColor: (flagStyle.baseColor as string) || '#ffffff' }}
            aria-label={`Flag of ${country}`}
          >
            {/* Corner trigrams for South Korea */}
            {puzzle.id === 'puzzle_south_korea' && (
              <div className="korea-trigrams-grid">
                <span className="trigram tl">☰</span>
                <span className="trigram tr">☵</span>
                <span className="trigram bl">☲</span>
                <span className="trigram br">☷</span>
              </div>
            )}

            <div
              className={`missing-slot circle-slot ${
                snapped ? 'slot-snapped' : 'slot-empty'
              }`}
            >
              {snapped ? (
                <div className="snapped-piece circle-piece">
                  {puzzle.id === 'puzzle_japan' ? (
                    <SunDiscGraphic size={140} color={puzzle.colors[1] || '#bc002d'} />
                  ) : puzzle.id === 'puzzle_south_korea' ? (
                    <TaegeukGraphic size={140} />
                  ) : (
                    renderPieceGraphic(puzzle.missingDescription, correctChoice?.color, 140)
                  )}
                </div>
              ) : (
                <div className="pulsing-slot-indicator" title={`Missing ${puzzle.missingDescription}`}>
                  <span className="pulse-question-badge">?</span>
                  <div className="slot-silhouette circle-ghost" />
                  <span className="slot-label-pill">{puzzle.missingDescription}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Vertical Stripes (France, Italy, Ireland, Peru) */}
        {layout === 'stripe_vertical' && (
          <div
            className="flag-box stripe-vertical-flag"
            aria-label={`Flag of ${country}`}
          >
            {((flagStyle.stripeColors as string[]) || puzzle.colors).map((col, idx) => {
              const missingIdx =
                typeof flagStyle.missingStripeIndex === 'number'
                  ? flagStyle.missingStripeIndex
                  : 1;
              const isMissing = idx === missingIdx;

              if (isMissing) {
                return (
                  <div
                    key={idx}
                    className={`vertical-stripe-slot missing-slot ${
                      snapped ? 'slot-snapped' : 'slot-empty'
                    }`}
                    style={{
                      backgroundColor: snapped ? col : 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {snapped ? (
                      <div
                        className="snapped-stripe-fill"
                        style={{ backgroundColor: col }}
                      />
                    ) : (
                      <div className="pulsing-slot-indicator" title={`Missing ${puzzle.missingDescription}`}>
                        <span className="pulse-question-badge">?</span>
                        <span className="slot-label-pill">{puzzle.missingDescription}</span>
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
        )}

        {/* 3. Horizontal Stripes (Germany) */}
        {layout === 'stripe_horizontal' && (
          <div
            className="flag-box stripe-horizontal-flag"
            aria-label={`Flag of ${country}`}
          >
            {((flagStyle.stripeColors as string[]) || puzzle.colors).map((col, idx) => {
              const missingIdx =
                typeof flagStyle.missingStripeIndex === 'number'
                  ? flagStyle.missingStripeIndex
                  : 2;
              const isMissing = idx === missingIdx;

              if (isMissing) {
                return (
                  <div
                    key={idx}
                    className={`horizontal-stripe-slot missing-slot ${
                      snapped ? 'slot-snapped' : 'slot-empty'
                    }`}
                    style={{
                      backgroundColor: snapped ? col : 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {snapped ? (
                      <div
                        className="snapped-stripe-fill"
                        style={{ backgroundColor: col }}
                      />
                    ) : (
                      <div className="pulsing-slot-indicator" title={`Missing ${puzzle.missingDescription}`}>
                        <span className="pulse-question-badge">?</span>
                        <span className="slot-label-pill">{puzzle.missingDescription}</span>
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
        )}

        {/* 4. Canton in Top-Left (USA, Greece, Australia, China) */}
        {layout === 'canton' && (
          <div
            className="flag-box canton-flag"
            style={{ backgroundColor: (flagStyle.baseColor as string) || puzzle.colors[0] }}
            aria-label={`Flag of ${country}`}
          >
            {/* USA 13 Stripes */}
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

            {/* Greece 9 Stripes */}
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

            {/* Australia Stars on Blue Fly */}
            {puzzle.id === 'puzzle_australia' && (
              <div className="australia-stars-field">
                <span className="star-commonwealth">★</span>
                <span className="star-crux a1">★</span>
                <span className="star-crux a2">★</span>
                <span className="star-crux a3">★</span>
                <span className="star-crux a4">★</span>
                <span className="star-crux a5">★</span>
              </div>
            )}

            {/* Missing Canton Slot */}
            <div
              className={`canton-slot missing-slot ${
                snapped ? 'slot-snapped' : 'slot-empty'
              }`}
              style={{
                backgroundColor: snapped ? (flagStyle.cantonColor as string) || '#002868' : 'rgba(0, 0, 0, 0.45)',
              }}
            >
              {snapped ? (
                <div className="snapped-canton-content">
                  {puzzle.id === 'puzzle_usa' && <UsCantonGraphic width={220} height={145} />}
                  {puzzle.id === 'puzzle_greece' && <GreekCantonGraphic size={140} />}
                  {puzzle.id === 'puzzle_australia' && <UnionJackGraphic width={210} height={135} />}
                  {puzzle.id === 'puzzle_china' && <ChinaStarsGraphic size={140} />}
                  {!['puzzle_usa', 'puzzle_greece', 'puzzle_australia', 'puzzle_china'].includes(puzzle.id) &&
                    renderPieceGraphic(puzzle.missingDescription, correctChoice?.color, 130)}
                </div>
              ) : (
                <div className="pulsing-slot-indicator" title={`Missing ${puzzle.missingDescription}`}>
                  <span className="pulse-question-badge">?</span>
                  <span className="slot-label-pill">{puzzle.missingDescription}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Cross (Center or Nordic: Switzerland, Sweden, Norway, UK, Jamaica) */}
        {layout === 'cross_center' && (
          <div
            className="flag-box cross-flag"
            style={{ backgroundColor: (flagStyle.baseColor as string) || puzzle.colors[0] }}
            aria-label={`Flag of ${country}`}
          >
            {/* Jamaica black and green triangles */}
            {puzzle.id === 'puzzle_jamaica' && (
              <div className="jamaica-field">
                <div className="jamaica-tri top" />
                <div className="jamaica-tri bottom" />
                <div className="jamaica-tri left" />
                <div className="jamaica-tri right" />
              </div>
            )}

            <div
              className={`cross-slot missing-slot ${
                snapped ? 'slot-snapped' : 'slot-empty'
              }`}
            >
              {snapped ? (
                <div className="snapped-piece cross-piece">
                  {puzzle.id === 'puzzle_switzerland' && <SwissCrossGraphic size={160} />}
                  {puzzle.id === 'puzzle_sweden' && (
                    <NordicCrossGraphic width={480} height={300} baseColor="#005293" crossColor="#fecb00" />
                  )}
                  {puzzle.id === 'puzzle_norway' && (
                    <NordicCrossGraphic width={480} height={300} baseColor="#ba0c2f" crossColor="#ffffff" innerColor="#00205b" />
                  )}
                  {puzzle.id === 'puzzle_uk' && <UnionJackGraphic width={480} height={300} />}
                  {puzzle.id === 'puzzle_jamaica' && <JamaicaSaltireGraphic width={480} height={300} />}
                </div>
              ) : (
                <div className="pulsing-slot-indicator" title={`Missing ${puzzle.missingDescription}`}>
                  <span className="pulse-question-badge">?</span>
                  <span className="slot-label-pill">{puzzle.missingDescription}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. Emblem in Center (Canada, India, Brazil, Argentina, Mexico, Egypt, Kenya, South Africa) */}
        {layout === 'emblem_center' && (
          <div className="flag-box emblem-flag" aria-label={`Flag of ${country}`}>
            {/* Background stripes or field */}
            <div
              className={`emblem-flag-background ${
                puzzle.id === 'puzzle_canada' || puzzle.id === 'puzzle_mexico'
                  ? 'vertical'
                  : 'horizontal'
              }`}
            >
              {((flagStyle.stripeColors as string[]) || puzzle.colors).map((col, idx) => (
                <div
                  key={idx}
                  className="emblem-bg-stripe"
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>

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
                  {puzzle.id === 'puzzle_canada' && <MapleLeafGraphic size={150} color="#d80621" />}
                  {puzzle.id === 'puzzle_india' && <AshokaChakraGraphic size={135} color="#000080" />}
                  {puzzle.id === 'puzzle_argentina' && <SunOfMayGraphic size={135} />}
                  {puzzle.id === 'puzzle_brazil' && <BrazilGlobeGraphic size={135} />}
                  {puzzle.id === 'puzzle_mexico' && <GoldenEagleGraphic size={135} isMexico />}
                  {puzzle.id === 'puzzle_egypt' && <GoldenEagleGraphic size={135} />}
                  {puzzle.id === 'puzzle_kenya' && <MaasaiShieldGraphic size={140} />}
                  {puzzle.id === 'puzzle_south_africa' && <SouthAfricaPallGraphic width={260} height={160} />}
                  {!['puzzle_canada', 'puzzle_india', 'puzzle_argentina', 'puzzle_brazil', 'puzzle_mexico', 'puzzle_egypt', 'puzzle_kenya', 'puzzle_south_africa'].includes(
                    puzzle.id
                  ) && renderPieceGraphic(puzzle.missingDescription, correctChoice?.color, 135)}
                </div>
              ) : (
                <div className="pulsing-slot-indicator" title={`Missing ${puzzle.missingDescription}`}>
                  <span className="pulse-question-badge">?</span>
                  <span className="slot-label-pill">{puzzle.missingDescription}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
