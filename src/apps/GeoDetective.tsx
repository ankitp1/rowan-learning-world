import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DETECTIVE_CASES,
  type CityChoice,
  type DetectiveCase,
} from '../content/geoDetective';
import { awardStars, shuffleArray } from '../core/engine';
import { focusFirst } from '../core/nav';
import { awardPassportStamp } from '../core/passport';
import { sfx, speak, speakThemeEncouragement, speakThemePraise, stopSpeaking } from '../core/speech';
import type { MiniAppProps } from '../core/types';
import { Confetti } from '../ui/Art';
import { GameShell } from '../ui/GameShell';

const CHOICE_LETTERS = ['A', 'B', 'C', 'D'];
const MISSION_CASES_COUNT = 5;

export default function GeoDetective({ profile, theme, onExit, onComplete }: MiniAppProps) {
  const isMission = Boolean(onComplete);
  const totalCases = isMission ? MISSION_CASES_COUNT : Infinity;

  // Active Case State
  const [currentRound, setCurrentRound] = useState(0);
  const [casesSolved, setCasesSolved] = useState(0);
  const [currentCase, setCurrentCase] = useState<DetectiveCase | null>(null);
  const [revealedCluesCount, setRevealedCluesCount] = useState<number>(1);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [status, setStatus] = useState<'investigating' | 'solved' | 'escaped'>('investigating');
  const [newStampWon, setNewStampWon] = useState<boolean>(false);
  const [missionDone, setMissionDone] = useState(false);

  // Session non-repeat pool
  const sessionAskedIdsRef = useRef<Set<string>>(new Set());

  // Pick next non-repeating case
  const pickNextCase = useCallback((): DetectiveCase => {
    const unasked = DETECTIVE_CASES.filter((c) => !sessionAskedIdsRef.current.has(c.id));
    const pool = unasked.length > 0 ? unasked : DETECTIVE_CASES;
    if (unasked.length === 0) {
      sessionAskedIdsRef.current.clear();
    }
    const picked = pool[Math.floor(Math.random() * pool.length)];
    sessionAskedIdsRef.current.add(picked.id);
    return {
      ...picked,
      choices: shuffleArray(picked.choices),
    };
  }, []);

  // Start a new case
  const startCase = useCallback((detectiveCase: DetectiveCase) => {
    setCurrentCase(detectiveCase);
    setRevealedCluesCount(1);
    setSelectedChoiceIdx(null);
    setStatus('investigating');
    setNewStampWon(false);

    // Initial narration of the case & clue 1
    const firstClue = detectiveCase.clues[0];
    const narration = `Case ${detectiveCase.title}! Suspect: ${detectiveCase.suspect.name}, ${detectiveCase.suspect.title}. Clue 1: ${firstClue.say ?? firstClue.text}`;
    void speak(narration);

    setTimeout(() => {
      focusFirst();
    }, 60);
  }, []);

  // Initialize on mount
  useEffect(() => {
    const firstCase = pickNextCase();
    startCase(firstCase);
    return () => {
      stopSpeaking();
    };
  }, [pickNextCase, startCase]);

  // Read all currently revealed clues aloud
  const handleReadCluesAloud = () => {
    if (!currentCase) return;
    const cluesText = currentCase.clues
      .slice(0, revealedCluesCount)
      .map((c, i) => `Clue ${i + 1}: ${c.say ?? c.text}`)
      .join(' ... ');
    const fullText = `${currentCase.title}! Suspect is ${currentCase.suspect.name}. ${cluesText}`;
    void speak(fullText);
  };

  // Reveal next progressive clue
  const handleRevealNextClue = () => {
    if (!currentCase || revealedCluesCount >= 3 || status !== 'investigating') return;
    sfx.soft();
    const nextCount = revealedCluesCount + 1;
    setRevealedCluesCount(nextCount);
    const nextClue = currentCase.clues[nextCount - 1];
    void speak(`Clue ${nextCount}: ${nextClue.say ?? nextClue.text}`);
  };

  // Player selects a city destination
  const handleChoice = async (choiceIdx: number) => {
    if (!currentCase || status !== 'investigating') return;
    setSelectedChoiceIdx(choiceIdx);
    const choice = currentCase.choices[choiceIdx];
    const isCorrect = choice.correct;

    if (isCorrect) {
      sfx.star();
      setStatus('solved');
      setCasesSolved((s) => s + 1);

      // Award 2 stars for solving the mystery
      awardStars(profile.id, 2);

      // Award country stamp into traveler's passport
      const stampAwarded = awardPassportStamp(
        profile.id,
        currentCase.targetCountry,
        currentCase.flagEmoji,
        currentCase.targetContinent as any,
        currentCase.landmarkEmoji,
        `${currentCase.targetCity} Landmark`,
        'Geography Detective',
        currentCase.funFact
      );
      setNewStampWon(stampAwarded);

      // Praise & educational fun fact
      const praiseMsg = `Suspect Caught! Excellent detective deduction, ${profile.name || 'Detective'}! You tracked ${currentCase.suspect.name} to ${currentCase.targetCity}, ${currentCase.targetCountry}! ${currentCase.funFact}`;
      void (async () => {
        await speakThemePraise(theme, undefined, profile.name);
        await speak(praiseMsg);
      })();
    } else {
      sfx.soft();
      setStatus('escaped');

      // Encouragement and revelation of correct city
      const encouragementMsg = `Good try, Detective! ${currentCase.suspect.name} was hiding in ${currentCase.targetCity}, ${currentCase.targetCountry}! ${currentCase.funFact}`;
      void (async () => {
        await speakThemeEncouragement(theme, undefined, profile.name);
        await speak(encouragementMsg);
      })();
    }

    setTimeout(() => {
      focusFirst();
    }, 100);
  };

  // Advance to next case
  const handleNextCase = () => {
    stopSpeaking();
    if (isMission && currentRound + 1 >= totalCases) {
      setMissionDone(true);
      return;
    }
    setCurrentRound((r) => r + 1);
    const next = pickNextCase();
    startCase(next);
  };

  // Mission complete celebration screen
  if (missionDone) {
    return (
      <GameShell
        title="Where in the World?"
        icon="🔍"
        onExit={onExit}
        className="geo-detective-app"
      >
        <div className="overlay">
          <Confetti />
          <div className="card text-center detective-complete-card">
            <div className="big-emoji">🕵️‍♂️🌍🏆</div>
            <h1>Mystery Mission Solved!</h1>
            <p className="large-p font-bold">
              Outstanding work, Master Detective {profile.name || 'Rowan'}!
            </p>
            <p>
              You cracked {casesSolved} of {MISSION_CASES_COUNT} international mystery cases and secured global landmarks!
            </p>
            <div className="row justify-center mt-12 gap-8">
              <button
                className="btn primary big"
                data-autofocus
                onClick={() => onComplete?.({ correct: casesSolved, total: isMission ? totalCases : currentRound + 1 })}
              >
                Collect Mission Rewards 🎁
              </button>
            </div>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Where in the World?"
      icon="🔍"
      onExit={onExit}
      right={
        <div className="row align-center gap-8">
          <span className="font-bold">
            {isMission
              ? `Case ${currentRound + 1}/${totalCases} · 🎯 Solved: ${casesSolved}`
              : `Case ${currentRound + 1} · 🎯 Solved: ${casesSolved}`}
          </span>
          <button
            type="button"
            className="btn small outline"
            onClick={onExit}
            aria-label="Done playing"
          >
            Done 🏁
          </button>
        </div>
      }
      className="geo-detective-app"
    >
      {currentCase && (
        <div className="card detective-dossier-card">
          {/* Dossier Header: Suspect Card & Audio Read Button */}
          <div className="detective-header">
            <div className="suspect-profile-badge">
              <span className="suspect-avatar" role="img" aria-label={currentCase.suspect.name}>
                {currentCase.suspect.avatar}
              </span>
              <div className="suspect-meta">
                <span className="suspect-wanted-tag">🚨 WANTED SUSPECT</span>
                <h3 className="suspect-name">{currentCase.suspect.name}</h3>
                <span className="suspect-title">{currentCase.suspect.title}</span>
              </div>
            </div>

            <div className="detective-actions">
              <button
                type="button"
                className="btn detective-btn-hear"
                onClick={handleReadCluesAloud}
                aria-label="Read clues aloud"
              >
                🔊 Read Clues
              </button>
            </div>
          </div>

          {/* Case Title Banner */}
          <div className="case-title-strip">
            <span className="case-folder-icon">📂</span>
            <span className="case-title-text font-bold">{currentCase.title}</span>
            <span className="clue-counter-badge">
              {revealedCluesCount} of 3 Clues Discovered
            </span>
          </div>

          {/* Clue Scroll Board */}
          <div className="clue-scroll-board">
            {currentCase.clues.map((clue, idx) => {
              const isRevealed = idx < revealedCluesCount;
              return (
                <div
                  key={idx}
                  className={`clue-card ${isRevealed ? 'revealed' : 'locked'}`}
                  aria-live={isRevealed ? 'polite' : undefined}
                >
                  <div className="clue-header-row">
                    <span className="clue-number-pill">
                      {isRevealed ? `🔍 Clue #${idx + 1}` : `🔒 Clue #${idx + 1}`}
                    </span>
                    {isRevealed && <span className="clue-icon-badge">{clue.icon}</span>}
                  </div>
                  <p className="clue-body-text font-bold">
                    {isRevealed ? clue.text : 'Confidential detective evidence... tap below to unlock!'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Progressive Clue Unlock Control */}
          {status === 'investigating' && (
            <div className="clue-control-row">
              {revealedCluesCount < 3 ? (
                <>
                  <button
                    type="button"
                    className="btn primary reveal-clue-btn"
                    onClick={handleRevealNextClue}
                  >
                    🔍 Next Clue ({revealedCluesCount + 1}/3)
                  </button>
                  <span className="clue-bonus-tip">
                    💡 Guess with fewer clues for Master Explorer glory!
                  </span>
                </>
              ) : (
                <span className="clue-all-revealed-tag">
                  ✨ All clues unlocked! Choose the secret destination!
                </span>
              )}
            </div>
          )}

          {/* Destination Decision Board: 4 City Buttons */}
          <div className="destination-board">
            <h4 className="destination-prompt">
              🗺️ Where is the suspect hiding? Choose the city destination:
            </h4>
            <div className="destination-grid">
              {currentCase.choices.map((choice: CityChoice, idx: number) => {
                let btnStyle = 'destination-btn';
                if (status !== 'investigating') {
                  if (choice.correct) {
                    btnStyle += ' choice-correct';
                  } else if (selectedChoiceIdx === idx) {
                    btnStyle += ' choice-wrong';
                  } else {
                    btnStyle += ' choice-dimmed';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    className={btnStyle}
                    disabled={status !== 'investigating'}
                    onClick={() => handleChoice(idx)}
                    data-autofocus={status === 'investigating' && idx === 0 ? '' : undefined}
                    aria-label={`Option ${CHOICE_LETTERS[idx]}: ${choice.city}, ${choice.country} ${choice.flag}`}
                  >
                    <span className="choice-letter-badge">{CHOICE_LETTERS[idx]}</span>
                    <span className="choice-flag-emoji" role="img" aria-hidden="true">
                      {choice.flag}
                    </span>
                    <div className="choice-text-wrap">
                      <span className="choice-city-name font-bold">{choice.city}</span>
                      <span className="choice-country-name">{choice.country}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Investigation Result Banner: Solved or Escaped */}
          {status !== 'investigating' && (
            <div className={`detective-feedback-bar ${status} pop`}>
              {status === 'solved' && <Confetti />}
              <div className="feedback-badge-row">
                <span className={`status-pill ${status}`}>
                  {status === 'solved'
                    ? '🎯 Suspect Caught!'
                    : '💨 Suspect Slipped Away!'}
                </span>
                {status === 'solved' && (
                  <span className="reward-tag font-bold">+2 ⭐ Stars</span>
                )}
                {newStampWon && (
                  <span className="passport-new-badge font-bold">
                    📘 Passport Stamp Won!
                  </span>
                )}
              </div>

              <div className="feedback-details">
                <h3 className="target-reveal-title">
                  {status === 'solved'
                    ? `Great job! You captured ${currentCase.suspect.name} in ${currentCase.targetCity}, ${currentCase.targetCountry} ${currentCase.flagEmoji}!`
                    : `${currentCase.suspect.name} was spotted in ${currentCase.targetCity}, ${currentCase.targetCountry} ${currentCase.flagEmoji}!`}
                </h3>
                <p className="fun-fact-text">
                  <b>Did You Know?</b> {currentCase.funFact}
                </p>
              </div>

              <div className="next-case-wrap">
                <button
                  type="button"
                  className="btn primary big next-case-btn"
                  data-autofocus
                  onClick={handleNextCase}
                >
                  Next Case 🔍
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </GameShell>
  );
}
