import { useState } from 'react';
import type { Theme } from '../core/types';
import { HelperAvatar } from './Art';
import { sfx, speak, stopSpeaking } from '../core/speech';

const SAMPLE_QUOTES: Record<string, string> = {
  'space-ranger': 'To learning... and beyond! Star Command reporting! Ready for our mission, Cadet!',
  western: "Howdy, partner! Reach for the stars! You've got a true friend in me!",
  dino: 'Roar! I mean... hello! My little dino arms are so excited to explore with you!',
  pirate: 'Ahoy, Captain! Barnaby reporting for duty! The seas look bright today!',
  super: 'Super brain power activated! Bolt and Nova here, ready to power up!',
  pups: 'Ruff-ruff! Pip and Scout are on duty! No puzzle is too big for us!',
  rescue: 'Welcome, Ranger! Luna and Blaze are watching the magical creatures with you!',
};

export function ThemePickerModal({
  currentThemeId,
  themes,
  childName,
  onSelect,
  onClose,
}: {
  currentThemeId: string;
  themes: Theme[];
  childName: string;
  onSelect: (themeId: string) => void;
  onClose: () => void;
}) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const previewVoice = (e: React.MouseEvent, t: Theme) => {
    e.stopPropagation();
    stopSpeaking();
    setPlayingId(t.id);
    const quote = SAMPLE_QUOTES[t.id] ?? t.praise[0] ?? 'Hello!';
    void speak(quote.replace('{name}', childName), {
      pitch: t.helper?.voiceStyle?.pitch,
      rate: t.helper?.voiceStyle?.rate,
      voiceNamePattern: t.helper?.voiceStyle?.voiceNamePattern,
    }).then(() => {
      setPlayingId((cur) => (cur === t.id ? null : cur));
    });
  };

  const handleSelect = (t: Theme) => {
    sfx.good();
    onSelect(t.id);
    const quote = SAMPLE_QUOTES[t.id] ?? t.praise[0] ?? 'Hello!';
    void speak(quote.replace('{name}', childName), {
      pitch: t.helper?.voiceStyle?.pitch,
      rate: t.helper?.voiceStyle?.rate,
      voiceNamePattern: t.helper?.voiceStyle?.voiceNamePattern,
    });
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="card theme-picker-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="theme-picker-title">
        <h2 id="theme-picker-title">🎨 Choose Your Look & Character Buddy</h2>
        <p style={{ margin: '4px 0 12px', opacity: 0.85, fontSize: '16px' }}>
          Pick who you want to explore with! Each buddy has their own unique personality, voice, and scenery.
        </p>

        <div className="theme-grid">
          {themes.map((t) => {
            const isCurrent = t.id === currentThemeId;
            return (
              <div
                key={t.id}
                className={`theme-card${isCurrent ? ' active' : ''}`}
                tabIndex={0}
                role="button"
                aria-pressed={isCurrent}
                onClick={() => handleSelect(t)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(t);
                  }
                }}
              >
                {isCurrent && <span className="theme-badge-active">✓ Current Look</span>}
                <div style={{ marginTop: '4px', marginBottom: '4px' }}>
                  <HelperAvatar theme={t} size={64} talking={playingId === t.id} />
                </div>
                <h3>{t.emoji} {t.name}</h3>
                <span className="helper-role">{t.helper.name} · {t.helper.role}</span>
                <p className="helper-blurb">{t.helper.personality}</p>

                <div className="swatches" title="Theme color palette">
                  <span className="swatch" style={{ background: t.colors.bg1 }} />
                  <span className="swatch" style={{ background: t.colors.primary }} />
                  <span className="swatch" style={{ background: t.colors.accent }} />
                  <span className="swatch" style={{ background: t.colors.card }} />
                </div>

                <div className="theme-card-actions">
                  <button
                    type="button"
                    className="btn preview-btn"
                    onClick={(e) => previewVoice(e, t)}
                    aria-label={`Hear ${t.helper.name}'s voice`}
                    title="Preview character voice"
                  >
                    {playingId === t.id ? '🔊 Speaking...' : '🔊 Hear voice'}
                  </button>
                  <button
                    type="button"
                    className={`btn${isCurrent ? ' primary' : ''}`}
                    onClick={() => handleSelect(t)}
                  >
                    {isCurrent ? 'Selected' : 'Pick look'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn" data-autofocus onClick={onClose} style={{ minWidth: '140px', marginTop: '8px' }}>
          Close
        </button>
      </div>
    </div>
  );
}
