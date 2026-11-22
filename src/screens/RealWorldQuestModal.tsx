import { useEffect, useMemo, useState } from 'react';
import { awardStars } from '../core/engine';
import { sfx, speak, speakThemePraise, stopSpeaking } from '../core/speech';
import type { Profile, Theme } from '../core/types';
import { getTodayQuest, isQuestDoneToday, markQuestDoneToday } from '../core/realWorldQuests';
import { Confetti, HelperAvatar } from '../ui/Art';
import { useBackHandler } from '../core/nav';

interface RealWorldQuestModalProps {
  profile: Profile;
  theme: Theme;
  onClose: () => void;
}

export function RealWorldQuestModal({ profile, theme, onClose }: RealWorldQuestModalProps) {
  const quest = useMemo(() => getTodayQuest(), []);
  const [done, setDone] = useState(() => isQuestDoneToday(profile.id));
  const [justCelebrated, setJustCelebrated] = useState(false);

  useBackHandler(() => {
    stopSpeaking();
    onClose();
    return true;
  }, true);

  const readQuestAloud = () => {
    stopSpeaking();
    const companionName = theme.helper?.name || 'Your buddy';
    const speech = quest.speechText.replaceAll('Rowan', profile.name || 'Rowan');
    void speak(speech);
  };

  useEffect(() => {
    // Read the quest aloud when opening
    const timer = setTimeout(() => {
      readQuestAloud();
    }, 250);
    return () => clearTimeout(timer);
  }, [quest.id]);

  const handleFound = () => {
    stopSpeaking();
    awardStars(profile.id, 2);
    markQuestDoneToday(profile.id);
    setDone(true);
    setJustCelebrated(true);
    sfx.star();
    void speakThemePraise(theme, undefined, profile.name).then(() => {
      void speak(`Incredible real-world detective work, ${profile.name}! You explored the real world! Plus 2 stars!`);
    });
  };

  return (
    <div className="overlay" onClick={() => { stopSpeaking(); onClose(); }}>
      {justCelebrated && <Confetti />}
      <div
        className="card text-center"
        style={{
          maxWidth: '680px',
          width: '92%',
          padding: '28px 24px',
          margin: 'auto',
          borderRadius: '32px',
          background: 'linear-gradient(175deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 248, 235, 0.98) 100%)',
          color: '#1a202c',
          boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quest-modal-title"
      >
        <div className="row align-center justify-between" style={{ marginBottom: '12px' }}>
          <span className="chip" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700, fontSize: '14px' }}>
            🏡 Real-World Mission • {quest.category}
          </span>
          <button
            className="chip-btn"
            style={{ minHeight: '38px', minWidth: '38px', padding: '4px 10px', fontSize: '16px' }}
            onClick={() => { stopSpeaking(); onClose(); }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <HelperAvatar theme={theme} size={110} mood={done ? 'cheer' : 'talking'} />

        <div style={{ fontSize: '56px', margin: '8px 0 2px' }}>{quest.icon}</div>
        <h2 id="quest-modal-title" style={{ fontSize: '26px', color: '#1e293b', margin: '4px 0 8px' }}>
          {quest.title}
        </h2>

        <div
          style={{
            background: 'rgba(254, 243, 199, 0.65)',
            border: '2px dashed #f59e0b',
            borderRadius: '20px',
            padding: '16px 20px',
            margin: '12px 0 16px',
            textAlign: 'left',
          }}
        >
          <p style={{ fontSize: '21px', fontWeight: 600, color: '#78350f', margin: '0 0 8px', textAlign: 'center' }}>
            "{quest.prompt}"
          </p>
          <p style={{ fontSize: '16px', color: '#92400e', margin: 0, opacity: 0.9, textAlign: 'center' }}>
            💡 <b>Clue / Examples:</b> {quest.examples}
          </p>
        </div>

        {done && (
          <div className="chip" style={{ background: '#dcfce7', color: '#166534', fontSize: '15px', fontWeight: 700, padding: '4px 14px', margin: '8px auto', display: 'inline-block' }}>
            ⭐ Mission Completed Today! (+2 Stars Awarded)
          </div>
        )}

        <div className="row justify-center gap-12" style={{ flexWrap: 'wrap', marginTop: '16px' }}>
          <button className="btn" onClick={readQuestAloud} aria-label="Listen to mission again">
            🔊 Hear It Again
          </button>
          {!done ? (
            <button className="btn primary big" data-autofocus onClick={handleFound}>
              🌟 I Found It! (+2 Stars)
            </button>
          ) : (
            <button className="btn primary big" data-autofocus onClick={() => { stopSpeaking(); onClose(); }}>
              🗺️ Back to Map
            </button>
          )}
          <button className="btn" onClick={() => { stopSpeaking(); onClose(); }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
