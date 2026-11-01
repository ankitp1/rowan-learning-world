import { useEffect, useRef, useState } from 'react';
import { addPlaytime, playedToday } from '../core/db';
import { speak, stopSpeaking } from '../core/speech';
import { inBedtime } from '../core/time';
import type { Profile } from '../core/types';

/** Tracks play time, shows the "5 minutes left" warning, and locks at the daily limit or bedtime. */
export default function TimeGuard({ profile, onGrownUps, onSwitch }: { profile: Profile; onGrownUps: () => void; onSwitch: () => void }) {
  const [locked, setLocked] = useState<'time' | 'bed' | null>(null);
  const [warn, setWarn] = useState(false);
  const acc = useRef(0);
  const warned = useRef(false);
  const s = profile.settings;

  useEffect(() => {
    const check = () => {
      if (inBedtime(s.bedtime)) { setLocked('bed'); return; }
      const limit = s.dailyMinutes * 60_000;
      if (!limit) { setLocked(null); return; }
      const left = limit - (playedToday(profile.id) + acc.current);
      if (left <= 0) setLocked('time');
      else {
        setLocked(null);
        if (left <= 5 * 60_000 && !warned.current) { warned.current = true; setWarn(true); void speak('Five minutes left!'); setTimeout(() => setWarn(false), 8000); }
      }
    };
    check();
    const id = setInterval(() => {
      if (!document.hidden) {
        acc.current += 1000;
        if (acc.current >= 10_000) { addPlaytime(profile.id, acc.current); acc.current = 0; }
      }
      check();
    }, 1000);
    return () => { clearInterval(id); if (acc.current) { addPlaytime(profile.id, acc.current); acc.current = 0; } };
  }, [profile.id, s.dailyMinutes, s.bedtime]);

  useEffect(() => { if (locked) stopSpeaking(); }, [locked]);

  if (locked) {
    return (
      <div className="overlay lock-screen" role="alertdialog">
        <div className="card">
          <div className="big-emoji">{locked === 'bed' ? '🌙' : '⏰'}</div>
          <h1>{locked === 'bed' ? 'Sleepy time!' : 'Time for a break!'}</h1>
          <p>{locked === 'bed' ? 'Play again tomorrow.' : 'Great playing today! See you tomorrow.'}</p>
          <div className="row">
            <button className="btn" data-autofocus onClick={onSwitch}>Switch player</button>
            <button className="btn" onClick={onGrownUps}>🔒 Grown-ups</button>
          </div>
        </div>
      </div>
    );
  }
  return warn ? <div className="toast">⏳ 5 minutes left!</div> : null;
}
