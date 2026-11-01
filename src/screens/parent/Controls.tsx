import { patchProfile, update } from '../../core/db';
import { frontier, resetSkill, setLevel, statesOf, statusOf, STATUS_LABEL } from '../../core/engine';
import { APPS } from '../../core/registry';
import { ladder, skillsOf } from '../../core/skills';
import { speak } from '../../core/speech';
import { THEMES } from '../../core/themes';
import type { HintMode, Profile, Subject } from '../../core/types';

const SUBJECTS: { key: Subject; label: string }[] = [{ key: 'reading', label: 'Reading' }, { key: 'math', label: 'Math' }];

function Levels({ profile }: { profile: Profile }) {
  const states = statesOf(profile.id);
  return (
    <>
      {SUBJECTS.map(({ key, label }) => {
        const L = ladder(key);
        const start = profile.levels[key] ?? 0;
        const cap = profile.lockLevels?.[key];
        const f = frontier(profile, key);
        return (
          <section key={key} className="ctl">
            <h3>{label} levels</h3>
            <p className="small">Working on: <b>{f.name}</b>. Starts at rung {start + 1}{cap !== undefined ? `, capped at rung ${cap + 1}` : ', no cap'}.</p>
            <table className="skills ctl-table"><tbody>
              {[...L, ...skillsOf(key).filter((s) => s.ladder === false)].map((s) => {
                const idx = L.findIndex((x) => x.id === s.id);
                const st = states[s.id];
                const focus = profile.focusSkills.includes(s.id);
                return (
                  <tr key={s.id} className={idx === start ? 'cur' : ''}>
                    <td>{s.name}</td>
                    <td>{STATUS_LABEL[statusOf(st)]}{st ? ` · ${st.mastery}` : ''}</td>
                    <td className="acts">
                      {idx >= 0 && <button className="mini" onClick={() => setLevel(profile.id, key, idx)}>Start here</button>}
                      {idx >= 0 && <button className="mini" onClick={() => patchProfile(profile.id, (p) => { p.lockLevels = { ...p.lockLevels, [key]: cap === idx ? undefined : idx }; })}>{cap === idx ? 'Remove cap' : 'Cap here'}</button>}
                      <button className={`mini${focus ? ' on' : ''}`} onClick={() => patchProfile(profile.id, (p) => { p.focusSkills = focus ? p.focusSkills.filter((x) => x !== s.id) : [...p.focusSkills, s.id]; })}>{focus ? '📌 Focus' : 'Focus'}</button>
                      {st && <button className="mini" onClick={() => resetSkill(profile.id, s.id)}>Reset</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody></table>
          </section>
        );
      })}
    </>
  );
}

/** Per-child controls: levels, apps, time, hints, themes, voice. */
export default function Controls({ profile, onPlacement }: { profile: Profile; onPlacement: () => void }) {
  const s = profile.settings;
  const set = (fn: (s: Profile['settings']) => void) => patchProfile(profile.id, (p) => fn(p.settings));
  const toggleApp = (id: string) => set((x) => { x.disabledApps = x.disabledApps.includes(id) ? x.disabledApps.filter((a) => a !== id) : [...x.disabledApps, id]; });
  const toggleTheme = (id: string) => set((x) => {
    const cur = x.allowedThemes.length ? x.allowedThemes : THEMES.map((t) => t.id);
    const next = cur.includes(id) ? cur.filter((t) => t !== id) : [...cur, id];
    if (!next.length) return;
    x.allowedThemes = next.length === THEMES.length ? [] : next;
  });
  const giveTime = () => update((d) => {
    const day = new Date().toLocaleDateString('en-CA');
    const cur = d.playtime[profile.id]?.[day] ?? 0;
    d.playtime[profile.id] ??= {};
    d.playtime[profile.id][day] = Math.max(0, cur - 15 * 60_000);
  });

  return (
    <div className="controls">
      <section className="ctl">
        <h3>Placement</h3>
        <p className="small">{profile.placementDone ? 'Done. You can run the Treasure Hunt again any time, for example every few months.' : 'Not run yet.'}</p>
        <button className="btn" onClick={onPlacement}>🗺️ Run Treasure Hunt for {profile.name}</button>
      </section>

      <Levels profile={profile} />

      <section className="ctl">
        <h3>Activities</h3>
        <div className="toggles">
          {APPS.map((a) => (
            <label key={a.id} className="check"><input type="checkbox" checked={!s.disabledApps.includes(a.id)} onChange={() => toggleApp(a.id)} /> {a.icon} {a.title}</label>
          ))}
        </div>
      </section>

      <section className="ctl">
        <h3>Screen time</h3>
        <label>Daily limit{' '}
          <select value={s.dailyMinutes} onChange={(e) => set((x) => { x.dailyMinutes = Number(e.target.value); })}>
            {[0, 15, 20, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m ? `${m} min` : 'No limit'}</option>)}
          </select>
        </label>
        <label className="check"><input type="checkbox" checked={!!s.bedtime} onChange={(e) => set((x) => { x.bedtime = e.target.checked ? { from: '19:30', to: '07:00' } : null; })} /> Bedtime lock</label>
        {s.bedtime && (
          <div className="row wrap">
            <label>From <input type="time" value={s.bedtime.from} onChange={(e) => set((x) => { x.bedtime = { from: e.target.value, to: x.bedtime?.to ?? '07:00' }; })} /></label>
            <label>Until <input type="time" value={s.bedtime.to} onChange={(e) => set((x) => { x.bedtime = { from: x.bedtime?.from ?? '19:30', to: e.target.value }; })} /></label>
          </div>
        )}
        <p className="small">A "5 minutes left" warning plays before the limit.</p>
        <button className="btn" onClick={giveTime}>+15 minutes today</button>
      </section>

      <section className="ctl">
        <h3>Hints</h3>
        {([['full', 'All hints (nudge, narrow, show me)'], ['limited', "No \"Show me\""], ['nudge-only', 'Nudge only']] as [HintMode, string][]).map(([v, l]) => (
          <label key={v} className="check"><input type="radio" name={`hint-${profile.id}`} checked={s.hintMode === v} onChange={() => set((x) => { x.hintMode = v; })} /> {l}</label>
        ))}
      </section>

      <section className="ctl">
        <h3>Looks</h3>
        <div className="toggles">
          {THEMES.map((t) => (
            <label key={t.id} className="check"><input type="checkbox" checked={!s.allowedThemes.length || s.allowedThemes.includes(t.id)} onChange={() => toggleTheme(t.id)} /> {t.emoji} {t.name}</label>
          ))}
        </div>
      </section>

      <section className="ctl">
        <h3>Voice</h3>
        <label>Speed <input type="range" min={0.5} max={1.2} step={0.05} value={s.speechRate} onChange={(e) => set((x) => { x.speechRate = Number(e.target.value); })} /> {s.speechRate.toFixed(2)}</label>
        <button className="btn" onClick={() => void speak('Hello! Let us read and count together.')}>🔊 Test voice</button>
      </section>
    </div>
  );
}
