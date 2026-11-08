import { useState } from 'react';
import { awardStars } from '../core/engine';
import { sfx, speak, speakThemeEncouragement, stopSpeaking } from '../core/speech';
import type { MiniAppProps, Theme } from '../core/types';
import { Confetti } from '../ui/Art';
import { GameShell } from '../ui/GameShell';

type Piece = 'X' | 'O' | null;

interface PlayerConfig {
  name: string;
  avatar: string;
  age: number;
}

const lines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export interface TicTacToeCoachFeedback {
  winningLine?: number[];
  criticalSquare?: number;
  tipTitle: string;
  tipText: string;
  spokenTip: string;
}

export function analyzeLoss(board: Piece[], winningPiece: 'O' | 'X', playerName: string): TicTacToeCoachFeedback {
  // Find which line won
  let winLine: number[] | undefined;
  for (const [x, y, z] of lines) {
    if (board[x] && board[x] === board[y] && board[x] === board[z]) {
      winLine = [x, y, z];
      break;
    }
  }

  const squareNames: Record<number, string> = {
    0: 'the top-left corner',
    1: 'the top-middle square',
    2: 'the top-right corner',
    3: 'the middle-left square',
    4: 'the center square',
    5: 'the middle-right square',
    6: 'the bottom-left corner',
    7: 'the bottom-middle square',
    8: 'the bottom-right corner',
  };

  const lineNames: Record<string, string> = {
    '0,1,2': 'the top row',
    '3,4,5': 'the middle row',
    '6,7,8': 'the bottom row',
    '0,3,6': 'the left column',
    '1,4,7': 'the middle column',
    '2,5,8': 'the right column',
    '0,4,8': 'the diagonal line',
    '2,4,6': 'the diagonal line',
  };

  const key = winLine ? winLine.join(',') : '';
  const rowDesc = lineNames[key] || 'a three-in-a-row line';

  // 1. Did the player miss an offensive winning move? (Had 2 'X's with 1 empty space)
  for (const [x, y, z] of lines) {
    const row = [board[x], board[y], board[z]];
    if (row.filter((p) => p === 'X').length === 2 && row.includes(null)) {
      const emptyIdx = [x, y, z][row.indexOf(null)];
      const sqDesc = squareNames[emptyIdx] || 'that empty square';
      return {
        winningLine: winLine,
        criticalSquare: emptyIdx,
        tipTitle: '🎯 Missed Winning Chance!',
        tipText: `You almost had it! Spotting ${sqDesc} would have completed your own three in a row to win!`,
        spokenTip: `Great try, ${playerName}! Next time, look closely—you had two in a row and tapping ${sqDesc} would have won the game!`,
      };
    }
  }

  // 2. Defensive oversight: The opponent got 3 in a row, so blocking the final square was the key move
  if (winLine) {
    const lastWinSquare = winLine[2];
    const sqDesc = squareNames[lastWinSquare] || 'that square';
    return {
      winningLine: winLine,
      criticalSquare: lastWinSquare,
      tipTitle: '🛡️ Defense Tip: Block the Line!',
      tipText: `Look at ${rowDesc}! When your opponent gets two pieces in a line, blocking ${sqDesc} stops them in their tracks!`,
      spokenTip: `Super effort, ${playerName}! Next time your opponent gets two in a row across ${rowDesc}, block ${sqDesc} to stop the line!`,
    };
  }

  // 3. General opening tip: Center control
  return {
    tipTitle: '⭐ Strategy Tip: Center & Corners',
    tipText: 'Taking the center square or corners gives you the most open paths to make three in a row!',
    spokenTip: `Great match, ${playerName}! Pro tip: grabbing the center square early gives you the most ways to make a line!`,
  };
}

function winner(b: Piece[]): Piece {
  for (const [x, y, z] of lines) if (b[x] && b[x] === b[y] && b[x] === b[z]) return b[x];
  return null;
}

function full(b: Piece[]) { return b.every((p) => p !== null); }

function botMove(b: Piece[], helperPiece: 'O', playerPiece: 'X', age: number): number {
  // Younger age (3-5): 40% random playful moves so kids win often and build confidence!
  if (age <= 5 && Math.random() < 0.45) {
    const empties = b.map((p, i) => (p === null ? i : -1)).filter((i) => i >= 0);
    return empties[Math.floor(Math.random() * empties.length)];
  }
  // 1. Win if possible
  for (const [x, y, z] of lines) {
    const row = [b[x], b[y], b[z]];
    if (row.filter((p) => p === helperPiece).length === 2 && row.includes(null)) {
      return [x, y, z][row.indexOf(null)];
    }
  }
  // 2. Block player's win
  for (const [x, y, z] of lines) {
    const row = [b[x], b[y], b[z]];
    if (row.filter((p) => p === playerPiece).length === 2 && row.includes(null)) {
      return [x, y, z][row.indexOf(null)];
    }
  }
  // 3. Center
  if (b[4] === null) return 4;
  // 4. Corners
  const corners = [0, 2, 6, 8].filter((i) => b[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  // 5. Any
  const empties = b.map((p, i) => (p === null ? i : -1)).filter((i) => i >= 0);
  return empties[Math.floor(Math.random() * empties.length)];
}

export default function TicTacToe({ profile, theme, onExit }: MiniAppProps) {
  const [board, setBoard] = useState<Piece[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [multiplayer, setMultiplayer] = useState<boolean | null>(null);
  const [coachFeedback, setCoachFeedback] = useState<TicTacToeCoachFeedback | null>(null);
  const [showBoardReview, setShowBoardReview] = useState<boolean>(false);

  const [player1, setPlayer1] = useState<PlayerConfig>({
    name: profile.name || 'Player 1',
    avatar: theme.pieces[0],
    age: profile.age ?? 5,
  });
  const [player2, setPlayer2] = useState<PlayerConfig>({
    name: 'Player 2',
    avatar: theme.pieces[1],
    age: 7,
  });

  const [scores, setScores] = useState<[number, number]>([0, 0]);

  const p1Icon = player1.avatar || theme.pieces[0];
  const p2Icon = multiplayer ? (player2.avatar || theme.pieces[1]) : theme.pieces[1];
  const p2Name = multiplayer ? player2.name : theme.helper.name;

  const w = winner(board);
  const isDraw = !w && full(board);

  const handleCellClick = (i: number) => {
    if (board[i] || w || isDraw) return;
    sfx.tap();
    const nextBoard = [...board];
    nextBoard[i] = turn;
    setBoard(nextBoard);

    // Keep the cursor on this cell so TV remote focus doesn't jump to the Back button
    requestAnimationFrame(() => {
      document.getElementById(`ttt-cell-${i}`)?.focus();
    });

    const winCheck = winner(nextBoard);
    if (winCheck) {
      sfx.chest();
      if (winCheck === 'X') {
        awardStars(profile.id, 2);
        setScores(([s1, s2]) => [s1 + 1, s2]);
        setCoachFeedback(null);
        void speak(`${player1.name} wins! Incredible three in a row!`);
      } else {
        setScores(([s1, s2]) => [s1, s2 + 1]);
        const coach = analyzeLoss(nextBoard, 'O', player1.name);
        setCoachFeedback(coach);
        void speak(`${p2Name} spotted three in a row! ${coach.spokenTip}`);
      }
      return;
    }

    if (full(nextBoard)) {
      sfx.star();
      awardStars(profile.id, 1);
      setCoachFeedback(null);
      void speak("Cat's game! A brilliant draw from both players!");
      return;
    }

    // Switch turn
    const nextTurn = turn === 'X' ? 'O' : 'X';
    setTurn(nextTurn);

    // If playing against helper bot
    if (!multiplayer && nextTurn === 'O') {
      setTimeout(() => {
        const move = botMove(nextBoard, 'O', 'X', player1.age);
        if (move >= 0 && nextBoard[move] === null) {
          sfx.tap();
          const botBoard = [...nextBoard];
          botBoard[move] = 'O';
          setBoard(botBoard);
          const botWin = winner(botBoard);
          if (botWin) {
            sfx.soft();
            setScores(([s1, s2]) => [s1, s2 + 1]);
            const coach = analyzeLoss(botBoard, 'O', player1.name);
            setCoachFeedback(coach);
            void speak(`${p2Name} spotted three in a row! ${coach.spokenTip}`);
          } else if (full(botBoard)) {
            sfx.star();
            awardStars(profile.id, 1);
            setCoachFeedback(null);
            void speak('A tie! Great defense, matey!');
          } else {
            setTurn('X');
          }
        }
      }, 450);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setCoachFeedback(null);
    setShowBoardReview(false);
    setTimeout(() => {
      document.getElementById('ttt-cell-4')?.focus();
    }, 60);
  };

  if (multiplayer === null) {
    return (
      <GameShell title="Tic-Tac-Toe" icon="❌" onExit={onExit} className="tictactoe">
        <div className="card wonder-intro">
          <div className="big-emoji">❌⭕</div>
          <h1>Tic-Tac-Toe Adventure</h1>
          <p>Play three-in-a-row against {theme.helper.name} or challenge a family member in 2-Player mode!</p>
          <div className="row wrap justify-center gap-12">
            <button className="btn primary big" data-autofocus onClick={() => setMultiplayer(false)}>
              🤖 Play vs {theme.helper.name}
            </button>
            <button className="btn big" onClick={() => setMultiplayer(true)}>
              👥 2-Player Pass & Play
            </button>
          </div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Tic-Tac-Toe"
      icon="❌"
      onExit={onExit}
      right={`${player1.name}: ${scores[0]} · ${p2Name}: ${scores[1]}`}
      className="tictactoe"
    >
      <div className="trivia-turn-bar">
        <div className={`turn-tag${turn === 'X' ? ' active' : ''}`}>
          <span>{p1Icon} {player1.name}</span>
          <b>{scores[0]} ⭐</b>
        </div>
        <div className={`turn-tag${turn === 'O' ? ' active' : ''}`}>
          <span>{p2Icon} {p2Name}</span>
          <b>{scores[1]} ⭐</b>
        </div>
      </div>

      <div className="ttt-wrap">
        <div className="ttt-grid" role="grid" aria-label="Tic-tac-toe grid">
          {board.map((cell, idx) => {
            const isWinLine = coachFeedback?.winningLine?.includes(idx);
            const isCritical = coachFeedback?.criticalSquare === idx;
            const extraCls = `${isWinLine ? ' win-line' : ''}${isCritical ? ' coach-critical' : ''}`;
            return (
              <button
                key={idx}
                id={`ttt-cell-${idx}`}
                className={`ttt-cell${cell ? ' filled' : ''}${extraCls}`}
                aria-disabled={!!cell || !!w || isDraw}
                data-autofocus={idx === 4 ? '' : undefined}
                onClick={() => handleCellClick(idx)}
                aria-label={`Square ${idx + 1}: ${cell ? (cell === 'X' ? player1.name : p2Name) : 'empty'}${isCritical ? ' - key square to block' : ''}`}
              >
                {cell === 'X' && <span>{p1Icon}</span>}
                {cell === 'O' && <span>{p2Icon}</span>}
                {isCritical && !cell && <span className="coach-star-hint">🛡️</span>}
              </button>
            );
          })}
        </div>
      </div>

      {(w || isDraw) && !showBoardReview && (
        <div className="overlay">
          {w === 'X' && <Confetti />}
          <div className="card text-center pop">
            <div className="big-emoji">{w === 'X' ? '🏆🎉' : isDraw ? '🤝' : '💫'}</div>
            <h1>
              {w === 'X'
                ? `${player1.name} Wins! 🌟`
                : w === 'O'
                ? `${p2Name} Wins!`
                : "It's a Friendly Tie!"}
            </h1>
            <p className="mt-4 font-bold">
              {w === 'X'
                ? 'Brilliant strategy! You spotted the line!'
                : w === 'O'
                ? 'Super defense and great turns! Ready for a rematch?'
                : 'Both players blocked every corner! Teamwork at its finest!'}
            </p>

            {w === 'O' && coachFeedback && (
              <div className="ttt-coach-tip pop">
                <div className="coach-badge">{coachFeedback.tipTitle}</div>
                <p className="coach-text">{coachFeedback.tipText}</p>
                <div className="row justify-center gap-8 mt-4">
                  <button
                    type="button"
                    className="coach-hear-btn"
                    onClick={() => void speak(coachFeedback.spokenTip)}
                  >
                    🔊 Hear Coach's Tip
                  </button>
                  <button
                    type="button"
                    className="coach-hear-btn"
                    onClick={() => setShowBoardReview(true)}
                  >
                    🔍 Show Board
                  </button>
                </div>
              </div>
            )}

            <div className="row justify-center mt-12 gap-8">
              <button className="btn primary big" data-autofocus onClick={resetGame}>
                Play Again 🔁
              </button>
              <button className="btn" onClick={() => setMultiplayer(null)}>
                Change Mode
              </button>
              <button className="btn" onClick={onExit}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {(w || isDraw) && showBoardReview && (
        <div className="ttt-review-banner pop">
          <div className="review-text">
            <b>{coachFeedback?.tipTitle || '💡 Coach Board Review'}</b>
            <span>{coachFeedback?.tipText}</span>
          </div>
          <div className="row gap-8">
            <button
              className="btn primary small"
              data-autofocus
              onClick={() => setShowBoardReview(false)}
            >
              Menu 📋
            </button>
            <button className="btn small" onClick={resetGame}>
              Play Again 🔁
            </button>
          </div>
        </div>
      )}
    </GameShell>
  );
}
