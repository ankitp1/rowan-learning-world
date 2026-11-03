import { useState } from 'react';
import { awardStars } from '../core/engine';
import { sfx, speak, stopSpeaking } from '../core/speech';
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

    const winCheck = winner(nextBoard);
    if (winCheck) {
      sfx.chest();
      if (winCheck === 'X') {
        awardStars(profile.id, 2);
        setScores(([s1, s2]) => [s1 + 1, s2]);
        void speak(`${player1.name} wins! Incredible three in a row!`);
      } else {
        setScores(([s1, s2]) => [s1, s2 + 1]);
        void speak(`${p2Name} wins! Great game!`);
      }
      return;
    }

    if (full(nextBoard)) {
      sfx.star();
      awardStars(profile.id, 1);
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
            const enc = theme.encouragements[Math.floor(Math.random() * theme.encouragements.length)];
            void speak(`I got three in a row! ${enc}`);
          } else if (full(botBoard)) {
            sfx.star();
            awardStars(profile.id, 1);
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
          {board.map((cell, idx) => (
            <button
              key={idx}
              className={`ttt-cell${cell ? ' filled' : ''}`}
              disabled={!!cell || !!w || isDraw}
              onClick={() => handleCellClick(idx)}
              aria-label={`Square ${idx + 1}: ${cell ? (cell === 'X' ? player1.name : p2Name) : 'empty'}`}
            >
              {cell === 'X' && <span>{p1Icon}</span>}
              {cell === 'O' && <span>{p2Icon}</span>}
            </button>
          ))}
        </div>
      </div>

      {(w || isDraw) && (
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
    </GameShell>
  );
}
