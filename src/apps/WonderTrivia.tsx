import { useEffect, useState } from 'react';
import { WONDER_TRIVIA_LIBRARY, type WonderTriviaItem } from '../content/wonderTrivia';
import { awardStars } from '../core/engine';
import { sfx, speak, stopSpeaking } from '../core/speech';
import type { MiniAppProps } from '../core/types';
import { Confetti } from '../ui/Art';
import { GameShell } from '../ui/GameShell';

interface PlayerSetup {
  name: string;
  avatar: string;
  age: number;
}

const AVATAR_OPTIONS = ['🧒', '👧', '👦', '🧑‍🚀', '🦸', '🦊', '🐼', '🦁', '🦄', '🐯'];

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
  const [showFact, setShowFact] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const activePlayer = activePlayerIdx === 0 ? player1 : player2;

  // Pick question tailored to player's age
  const pickQuestionForAge = (age: number, avoidIds: string[] = []): WonderTriviaItem => {
    const suitable = WONDER_TRIVIA_LIBRARY.filter(
      (q) => age >= q.minAge && age <= q.maxAge && !avoidIds.includes(q.id)
    );
    const pool = suitable.length ? suitable : WONDER_TRIVIA_LIBRARY;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const nextTurn = () => {
    setSelectedChoiceIdx(null);
    setAnswered(false);
    setShowFact(false);

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

    const nextQ = pickQuestionForAge(nextP.age, currentQuestion ? [currentQuestion.id] : []);
    setCurrentQuestion(nextQ);
    void speak(`${nextP.name}, your turn! ${nextQ.question}`);
  };

  const handleStartGame = () => {
    const firstQ = pickQuestionForAge(player1.age);
    setCurrentQuestion(firstQ);
    setActivePlayerIdx(0);
    setScores([0, 0]);
    setCurrentRound(0);
    setGameOver(false);
    void speak(`${player1.name}, ready? Here is your question! ${firstQ.question}`);
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
      const helperPraise = theme.praise[Math.floor(Math.random() * theme.praise.length)];
      void speak(`${helperPraise} ${currentQuestion.funFact}`);
    } else {
      sfx.soft();
      const encouragement = theme.encouragements[Math.floor(Math.random() * theme.encouragements.length)];
      void speak(`${encouragement} The correct answer is ${currentQuestion.choices.find((c) => c.correct)?.text}.`);
    }
    setShowFact(true);
  };

  useEffect(() => {
    return () => stopSpeaking();
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
            Play solo or take turns with a friend or family member—questions adapt automatically to each player's age!
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
          <p className="small">Questions are chosen to match each player's age so everyone has a fair and fun challenge!</p>

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
              <div className="age-pick">
                <span className="small font-bold">Age: {player1.age} yrs</span>
                <div className="row wrap gap-4">
                  {[3, 4, 5, 6, 7, 8, 9, 10].map((age) => (
                    <button key={age} type="button" className={`pick-btn age-btn${player1.age === age ? ' on' : ''}`} onClick={() => setPlayer1({ ...player1, age })}>{age}</button>
                  ))}
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
                <div className="age-pick">
                  <span className="small font-bold">Age: {player2.age} yrs</span>
                  <div className="row wrap gap-4">
                    {[3, 4, 5, 6, 7, 8, 9, 10].map((age) => (
                      <button key={age} type="button" className={`pick-btn age-btn${player2.age === age ? ' on' : ''}`} onClick={() => setPlayer2({ ...player2, age })}>{age}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="row justify-center mt-12">
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
            <div className="row justify-center mt-12">
              <button className="btn primary" data-autofocus onClick={handleStartGame}>
                Play Again
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
      right={`Q ${currentRound + 1} of ${totalQuestions}`}
      className="wonder-trivia"
    >
      {/* Player Turn Indicator Bar */}
      <div className="trivia-turn-bar">
        <div className={`turn-tag${activePlayerIdx === 0 ? ' active' : ''}`}>
          <span>{player1.avatar} {player1.name} (Age {player1.age})</span>
          <b>{scores[0]} ⭐</b>
        </div>
        {multiplayer && (
          <div className={`turn-tag${activePlayerIdx === 1 ? ' active' : ''}`}>
            <span>{player2.avatar} {player2.name} (Age {player2.age})</span>
            <b>{scores[1]} ⭐</b>
          </div>
        )}
      </div>

      {currentQuestion && (
        <div className="trivia-card card">
          <div className="trivia-header">
            <span className="trivia-cat-pill">{currentQuestion.icon} {currentQuestion.category.toUpperCase()} · Age {activePlayer.age}</span>
            <button className="icon-btn" aria-label="Read question" onClick={() => void speak(currentQuestion.question)}>🔊</button>
          </div>

          <h2 className="trivia-question">{currentQuestion.question}</h2>

          <div className="choices trivia-choices">
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
                >
                  {c.emoji && <span className="ce">{c.emoji}</span>}
                  <span className="ct font-bold">{c.text}</span>
                </button>
              );
            })}
          </div>

          {showFact && (
            <div className="trivia-fact pop">
              <span className="coach-badge">✨ Wonder Fact</span>
              <p>{currentQuestion.funFact}</p>
              <small className="encouragement-quote">"{currentQuestion.encouragement}"</small>
              <div className="mt-8 text-center">
                <button className="btn primary big" data-autofocus onClick={nextTurn}>
                  {currentRound + 1 >= totalQuestions ? 'See Results 🏆' : 'Next Turn ➡️'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </GameShell>
  );
}
