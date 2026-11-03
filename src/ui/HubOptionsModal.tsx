import type { Theme } from '../core/types';

export function HubOptionsModal({
  theme,
  profileName,
  currentAge,
  onOpenThemePicker,
  onOpenAgeModal,
  onOpenStickerBook,
  onOpenTour,
  onOpenGrownUps,
  onClose,
}: {
  theme: Theme;
  profileName: string;
  currentAge?: number;
  onOpenThemePicker: () => void;
  onOpenAgeModal: () => void;
  onOpenStickerBook: () => void;
  onOpenTour: () => void;
  onOpenGrownUps: () => void;
  onClose: () => void;
}) {
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="card hub-options-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hub-options-title"
      >
        <div className="modal-header-row">
          <h2 id="hub-options-title">⚙️ Adventure Menu</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close menu">✕</button>
        </div>
        <p className="modal-sub">Options, character companion, and parent settings</p>

        <div className="hub-options-grid">
          <button
            className="option-tile"
            onClick={() => { onClose(); onOpenThemePicker(); }}
            aria-label="Change character companion and theme"
          >
            <span className="tile-icon">{theme.emoji}</span>
            <div className="tile-text">
              <b>Change Buddy & Look</b>
              <small>With {theme.helper.name}</small>
            </div>
            <span className="tile-arrow">➔</span>
          </button>

          <button
            className="option-tile"
            onClick={() => { onClose(); onOpenAgeModal(); }}
            aria-label="Adjust age and difficulty level"
          >
            <span className="tile-icon">🎯</span>
            <div className="tile-text">
              <b>Age & Learning Level</b>
              <small>{currentAge ? `Calibrated for Age ${currentAge === 8 ? '8+' : currentAge}` : 'Adjust level'}</small>
            </div>
            <span className="tile-arrow">➔</span>
          </button>

          <button
            className="option-tile"
            onClick={() => { onClose(); onOpenStickerBook(); }}
            aria-label="View sticker album"
          >
            <span className="tile-icon">📖</span>
            <div className="tile-text">
              <b>Sticker Album</b>
              <small>View collected badges & stars</small>
            </div>
            <span className="tile-arrow">➔</span>
          </button>

          <button
            className="option-tile"
            onClick={() => { onClose(); onOpenTour(); }}
            aria-label="Open welcome tour"
          >
            <span className="tile-icon">💡</span>
            <div className="tile-text">
              <b>Welcome Tour</b>
              <small>How Rowan's World works</small>
            </div>
            <span className="tile-arrow">➔</span>
          </button>

          <button
            className="option-tile grownups-tile"
            onClick={() => { onClose(); onOpenGrownUps(); }}
            aria-label="Open grown-ups parent mode and progress report"
          >
            <span className="tile-icon">🔒</span>
            <div className="tile-text">
              <b>Parent Mode & Report</b>
              <small>Curriculum, time limits & PIN</small>
            </div>
            <span className="tile-arrow">➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}
