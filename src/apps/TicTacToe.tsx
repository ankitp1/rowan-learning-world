import { useEffect, useRef, useState } from 'react';
import { awardStars } from '../core/engine';
import { sfx, speak, stopSpeaking } from '../core/speech';
import type { MiniAppProps } from '../core/types';
import { Bubble } from '../ui/QuestionCard';
import { aiMove, winner, type Board, type Level } from './ttt';

type Mode = Level | 'friend';

/** Tic-tac-toe vs the helper (easy / medium) or a grown-up. */
export default function TicTacToe({ profile, theme, onExit, onComplete }: MiniAppProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [bubble, setBubble] = useState('');
  const rewarded = useRef(false);
  const res = winner(board);
  const [mine, theirs] = theme.pieces;
  const piece = { X: mine, O: theirs };

  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    if (!mode || res) return;
    if (mode !== 'friend' && turn === 'O') {
      const id = setTimeout(() => place(aiMove(board, mode)), 650);
      return () => clearTimeout(id);
    }
    setBubble(mode === 'friend' ? `${piece[turn]}'s turn!` : 'Your turn!');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, turn, res]);

  useEffect(() => {
    if (!res || rewarded.current) return;
    rewarded.current = true;
    awardStars(profile.id, 1);
    sfx.good();
    const text = res === 'draw' ? "It's a draw. Good game!"
      : mode === 'friend' ? `${piece[res]} wins!`
        : res === 'X' ? theme.praise[0] : `${theme.helper.name} wins this time. Good try!`;
    setBubble(text);
    void speak(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res]);

  function place(i: number) {
    setBoard((b) => {
      if (b[i] || winner(b)) return b;
      const nb = [...b];
      nb[i] = turn;
      return nb;
    });
    sfx.tap();
    setTurn((t) => (t === 'X' ? 'O' : 'X'));
  }

  const tap = (i: number) => {
    if (!mode || res || board[i]) return;
    if (mode !== 'friend' && turn === 'O') return;
    place(i);
  };
  const again = () => { setBoard(Array(9).fill(null)); setTurn('X'); rewarded.current = false; };

  return (
    <div className="screen ttt">
      <header className="topbar">
        <button className="back" onClick={onExit} aria-label="Back">⬅</button>
        <h2>❌ Tic-Tac-Toe</h2>
      </header>
      {!mode ? (
        <div className="menu">
          <Bubble theme={theme} text="Who do you want to play?" />
          <div className="row">
            <button className="btn big" data-autofocus onClick={() => setMode('easy')}>{theme.helper.emoji} {theme.helper.name} (easy)</button>
            <button className="btn big" onClick={() => setMode('medium')}>{theme.helper.emoji} {theme.helper.name} (medium)</button>
            <button className="btn big" onClick={() => setMode('friend')}>👨‍👩‍👦 A grown-up</button>
          </div>
        </div>
      ) : (
        <>
          <Bubble theme={theme} text={bubble} />
          <div className="ttt-grid">
            {board.map((v, i) => (
              <button key={i} className="ttt-cell" onClick={() => tap(i)} aria-label={`square ${i + 1} ${v ? piece[v] : 'empty'}`}>
                {v ? piece[v] : ''}
              </button>
            ))}
          </div>
          {res && (
            <div className="row">
              <button className="btn primary" data-autofocus onClick={again}>Play again</button>
              <button className="btn" onClick={() => (onComplete ? onComplete({ correct: 1, total: 1 }) : onExit())}>Done</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
