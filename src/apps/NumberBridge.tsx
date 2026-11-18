import { useCallback, useState } from 'react';
import { make10Question } from '../content/generators';
import { sfx } from '../core/speech';
import type { MiniAppProps, Question } from '../core/types';
import QuestionCard, { type AnswerResult } from '../ui/QuestionCard';
import Round from '../ui/Round';

export type BondCap = 10 | 20 | 50 | 100;
const BOND_CAPS: BondCap[] = [10, 20, 50, 100];

/** Number Bonds Bridge: adaptive bridge that starts at 10, advances to 20, 50, and 100 upon correct answers! */
export default function NumberBridge(props: MiniAppProps) {
  const { profile } = props;
  const storageKey = `rlw.bondsCap.${profile.id}`;

  const savedCap = (() => {
    try {
      const v = Number(localStorage.getItem(storageKey));
      return (BOND_CAPS.includes(v as BondCap) ? (v as BondCap) : 10);
    } catch {
      return 10;
    }
  })();

  const [cap, setCap] = useState<BondCap>(10);
  const [unlockedCap, setUnlockedCap] = useState<BondCap>(Math.max(10, savedCap) as BondCap);
  const [levelUpBanner, setLevelUpBanner] = useState<string | null>(null);

  const customMakeQuestion = useCallback(
    (avoid: string[]): Question => {
      return make10Question('math.make10', { target: cap, avoid });
    },
    [cap]
  );

  const handleResult = (r: AnswerResult, originalAnswer: (r: AnswerResult) => void) => {
    if (r.correct) {
      if (cap === 10) {
        setCap(20);
        setUnlockedCap((u) => Math.max(u, 20) as BondCap);
        try { localStorage.setItem(storageKey, '20'); } catch {}
        setLevelUpBanner('🌟 Level Up! Bridge extended to 20! 🌉');
        sfx.chest();
      } else if (cap === 20) {
        setCap(50);
        setUnlockedCap((u) => Math.max(u, 50) as BondCap);
        try { localStorage.setItem(storageKey, '50'); } catch {}
        setLevelUpBanner('🚀 Super Builder! Bridge extended to 50! 🌉');
        sfx.chest();
      } else if (cap === 50) {
        setCap(100);
        setUnlockedCap((u) => Math.max(u, 100) as BondCap);
        try { localStorage.setItem(storageKey, '100'); } catch {}
        setLevelUpBanner('👑 Master Builder! Century Bridge: Make 100! 🌉');
        sfx.chest();
      }
    }
    originalAnswer(r);
  };

  const handleSelectCap = (newCap: BondCap) => {
    sfx.tap();
    setCap(newCap);
    setLevelUpBanner(null);
  };

  return (
    <Round appId="number-bridge" props={props} makeQuestion={customMakeQuestion}>
      {(r) => (
        <div className="number-bridge-container">
          {/* Top Tier Selector Pill Bar */}
          <div className="bridge-cap-bar">
            <span className="bcb-label">🌉 Goal:</span>
            <div className="bcb-pills">
              {BOND_CAPS.map((c) => {
                const isUnlocked = c <= unlockedCap;
                const isActive = c === cap;
                return (
                  <button
                    key={c}
                    type="button"
                    className={`bcb-pill${isActive ? ' active' : ''}${!isUnlocked ? ' locked' : ''}`}
                    disabled={!isUnlocked}
                    onClick={() => handleSelectCap(c)}
                    aria-label={`Target ${c}${!isUnlocked ? ' (Locked)' : ''}`}
                  >
                    {!isUnlocked ? '🔒 ' : ''}Make {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Celebratory Level-Up Banner */}
          {levelUpBanner && (
            <div className="bridge-levelup-toast pop" role="status">
              <span>{levelUpBanner}</span>
            </div>
          )}

          <QuestionCard
            q={r.q}
            theme={props.theme}
            profile={props.profile}
            proactive={r.proactive}
            variant="bridge"
            onResult={(res) => handleResult(res, r.answer)}
          />
        </div>
      )}
    </Round>
  );
}
