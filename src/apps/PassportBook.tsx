import { useMemo, useState } from 'react';
import {
  MASTER_COUNTRIES,
  getPassportStamps,
  type MasterCountryInfo,
  type PassportStamp,
} from '../core/passport';
import { sfx, speak, stopSpeaking } from '../core/speech';
import type { MiniAppProps } from '../core/types';
import { GameShell } from '../ui/GameShell';

const CONTINENT_FILTERS = ['All', 'Americas', 'Europe', 'Asia', 'Africa', 'Oceania'] as const;
type ContinentFilter = (typeof CONTINENT_FILTERS)[number];

export default function PassportBook({ profile, onExit }: MiniAppProps) {
  const [activeContinent, setActiveContinent] = useState<ContinentFilter>('All');
  const [inspectedStamp, setInspectedStamp] = useState<PassportStamp | null>(null);

  const stamps = useMemo(() => getPassportStamps(profile.id), [profile.id]);
  const stampByCountry = useMemo(() => {
    const map = new Map<string, PassportStamp>();
    for (const s of stamps) {
      map.set(s.country.toLowerCase(), s);
    }
    return map;
  }, [stamps]);

  // Master country list grouped or filtered
  const displayedCountries = useMemo(() => {
    const all = Object.values(MASTER_COUNTRIES);
    if (activeContinent === 'All') return all;
    if (activeContinent === 'Americas') {
      return all.filter((c) => c.continent === 'North America' || c.continent === 'South America');
    }
    return all.filter((c) => c.continent === activeContinent);
  }, [activeContinent]);

  // Explorer Rank based on total stamps
  const explorerRank =
    stamps.length >= 15
      ? '🌟 Global Ambassador'
      : stamps.length >= 10
      ? '🧭 Master Voyager'
      : stamps.length >= 5
      ? '✈️ World Traveler'
      : stamps.length >= 1
      ? '🎒 Junior Explorer'
      : '🗺️ Novice Adventurer';

  const handleInspect = (country: MasterCountryInfo, earnedStamp?: PassportStamp) => {
    stopSpeaking();
    if (earnedStamp) {
      sfx.star();
      setInspectedStamp(earnedStamp);
      void speak(
        `Passport Stamp: ${earnedStamp.country}! ${earnedStamp.landmarkName}. ${earnedStamp.funFact}`
      );
    } else {
      sfx.soft();
      void speak(
        `${country.country} is not stamped in your passport yet. Complete flag puzzles or solve a detective case to earn it!`
      );
    }
  };

  return (
    <GameShell
      title="World Explorer Passport"
      icon="🛂"
      onExit={onExit}
      right={`Stamps: ${stamps.length}/${Object.keys(MASTER_COUNTRIES).length} · ${explorerRank}`}
      className="passport-app"
    >
      <div className="passport-container card">
        {/* Passport Identity Header Bar */}
        <div className="passport-id-banner">
          <div className="passport-avatar-badge">{profile.avatar || '🧒'}</div>
          <div className="passport-id-meta">
            <h2 className="passport-title">
              {profile.name ? `${profile.name}'s Official Passport` : 'World Explorer Passport'}
            </h2>
            <div className="passport-stats-row">
              <span className="passport-rank-badge">{explorerRank}</span>
              <span className="passport-count-pill">
                ⭐ {stamps.length} Countries Discovered
              </span>
            </div>
          </div>
        </div>

        {/* Continent Filter Tabs */}
        <div className="passport-tabs" role="tablist" aria-label="Filter continents">
          {CONTINENT_FILTERS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`passport-tab-btn${activeContinent === tab ? ' active' : ''}`}
              onClick={() => setActiveContinent(tab)}
              data-autofocus={tab === 'All' ? '' : undefined}
            >
              {tab === 'Americas' ? '🌎 Americas' : tab === 'Europe' ? '🏰 Europe' : tab === 'Asia' ? '🏯 Asia' : tab === 'Africa' ? '🦁 Africa' : tab === 'Oceania' ? '🦘 Oceania' : '🌐 All Stamps'}
            </button>
          ))}
        </div>

        {/* Stamps Grid */}
        <div className="passport-stamp-grid">
          {displayedCountries.map((c) => {
            const earned = stampByCountry.get(c.country.toLowerCase());
            return (
              <button
                key={c.country}
                type="button"
                className={`passport-stamp-item${earned ? ' earned' : ' unearned'}`}
                onClick={() => handleInspect(c, earned)}
                aria-label={earned ? `Stamp for ${c.country}: Collected` : `Stamp for ${c.country}: Not yet collected`}
              >
                {earned ? (
                  <div className="stamp-seal">
                    <span className="stamp-flag">{earned.flagEmoji}</span>
                    <span className="stamp-landmark">{earned.landmarkEmoji}</span>
                    <span className="stamp-name font-bold">{earned.country}</span>
                    <span className="stamp-date">
                      {new Date(earned.earnedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="stamp-ink-border" />
                  </div>
                ) : (
                  <div className="stamp-placeholder">
                    <span className="stamp-lock-icon">🔒</span>
                    <span className="stamp-ghost-flag">{c.flagEmoji}</span>
                    <span className="stamp-name-dim">{c.country}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Inspected Stamp Modal / Callout */}
        {inspectedStamp && (
          <div className="passport-detail-card pop">
            <div className="row align-center justify-between">
              <div className="row align-center gap-10">
                <span className="detail-flag">{inspectedStamp.flagEmoji}</span>
                <div>
                  <h3 className="detail-country">{inspectedStamp.country}</h3>
                  <span className="detail-landmark">
                    {inspectedStamp.landmarkEmoji} {inspectedStamp.landmarkName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn small"
                onClick={() => {
                  stopSpeaking();
                  setInspectedStamp(null);
                }}
              >
                Close ✕
              </button>
            </div>
            <p className="detail-fact mt-8">{inspectedStamp.funFact}</p>
          </div>
        )}
      </div>
    </GameShell>
  );
}
