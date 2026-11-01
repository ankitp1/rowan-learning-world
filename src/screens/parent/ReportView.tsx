import { useMemo, useState } from 'react';
import { STATUS_LABEL } from '../../core/engine';
import { buildReport, reportText, type Period, type PeriodKey, type Report } from '../../core/report';
import type { Profile } from '../../core/types';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Today' }, { key: 'session', label: 'Last session' }, { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' }, { key: 'custom', label: 'Custom' },
];

function Chart({ r }: { r: Report }) {
  const all = r.chart.flatMap((c) => c.points.map((p) => p.day)).filter((d, i, a) => a.indexOf(d) === i).sort();
  if (all.length < 1) return <p className="small">No answers in this period yet.</p>;
  const W = 320, H = 120, pad = 18;
  const x = (d: string) => (all.length === 1 ? W / 2 : pad + ((W - 2 * pad) * all.indexOf(d)) / (all.length - 1));
  const y = (a: number) => H - pad - ((H - 2 * pad) * a) / 100;
  const color = { reading: '#2a9d8f', math: '#e76f51' } as Record<string, string>;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="accuracy per day">
      {[0, 50, 100].map((g) => <g key={g}><line x1={pad} x2={W - pad} y1={y(g)} y2={y(g)} stroke="#0002" /><text x={2} y={y(g) + 3} fontSize="8">{g}%</text></g>)}
      {r.chart.map((c) => (
        <g key={c.subject} stroke={color[c.subject]} fill={color[c.subject]}>
          <polyline fill="none" strokeWidth="2.5" points={c.points.map((p) => `${x(p.day)},${y(p.acc)}`).join(' ')} />
          {c.points.map((p) => <circle key={p.day} cx={x(p.day)} cy={y(p.acc)} r="3.5" />)}
        </g>
      ))}
      <text x={pad} y={H - 3} fontSize="8">{all[0]}</text>
      {all.length > 1 && <text x={W - pad} y={H - 3} fontSize="8" textAnchor="end">{all[all.length - 1]}</text>}
    </svg>
  );
}

export function ReportBody({ profile, period }: { profile: Profile; period: Period }) {
  const r = useMemo(() => buildReport(profile, period), [profile, period]);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(reportText(profile, r)); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
  };
  return (
    <article className="report">
      <h2>{profile.avatar} {profile.name}: {r.label}</h2>
      <p className="summary">{r.summary}</p>
      <div className="stat-row">
        <div className="stat"><b>{r.playedMin || '0'}</b><small>minutes</small></div>
        <div className="stat"><b>{r.daysPlayed}</b><small>days</small></div>
        <div className="stat"><b>{r.totalAttempts}</b><small>questions</small></div>
        <div className="stat"><b>{r.accuracy}%</b><small>right</small></div>
      </div>

      <section><h3>⭐ Strengths</h3>
        {r.strengths.length ? <ul>{r.strengths.map((s) => <li key={s.skillId}>{s.name} <span className="pill ok">{s.accuracy}%</span></li>)}</ul> : <p className="small">Nothing stands out yet. Keep playing!</p>}
      </section>
      <section><h3>🛟 Needs extra help</h3>
        {r.needsHelp.length ? <ul>{r.needsHelp.map((s) => <li key={s.skillId}>{s.name} <span className="pill warn">{s.accuracy}%</span></li>)}</ul> : <p className="small">No trouble spots in this period.</p>}
        {r.patterns.length > 0 && (<><h4>Patterns we noticed</h4><ul>{r.patterns.map((p) => <li key={p.skillId + p.tag}>He {p.text} <span className="small">({p.n}x)</span></li>)}</ul></>)}
      </section>
      <section><h3>🙋 Hint hotspots</h3>
        {r.hotspots.length ? <ul>{r.hotspots.map((h) => <li key={h.name}>{h.name}: {h.hintsPerQ} hints per question</li>)}</ul> : <p className="small">He is not leaning on hints much.</p>}
      </section>
      <section><h3>⏱ Time by subject</h3>
        {r.bySubject.length ? <ul>{r.bySubject.map((s) => <li key={s.subject}>{s.subject}: about {s.minutes} min, {s.accuracy}% right</li>)}</ul> : <p className="small">No play yet.</p>}
      </section>
      <section><h3>📈 Progress</h3><Chart r={r} />
        <p className="small"><span className="dot" style={{ background: '#2a9d8f' }} /> Reading <span className="dot" style={{ background: '#e76f51' }} /> Math (accuracy per day)</p>
      </section>
      {r.tips.length > 0 && <section><h3>🏠 Try at home</h3><ul>{r.tips.map((t) => <li key={t}>{t}</li>)}</ul></section>}
      <section><h3>🗺 Every skill</h3>
        <table className="skills"><tbody>
          {r.table.map((t) => (
            <tr key={t.skillId}><td>{t.name}</td><td>{STATUS_LABEL[t.status]}</td><td>{t.mastery}</td></tr>
          ))}
        </tbody></table>
      </section>
      <div className="row no-print">
        <button className="btn" onClick={() => window.print()}>🖨 Print / save PDF</button>
        <button className="btn" onClick={() => void copy()}>{copied ? 'Copied!' : '📋 Copy summary'}</button>
      </div>
    </article>
  );
}

/** Captain's Report: on-demand for any period; optionally side by side for several players. */
export default function ReportView({ profiles, selected }: { profiles: Profile[]; selected: Profile }) {
  const [key, setKey] = useState<PeriodKey>('7d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [compare, setCompare] = useState(false);
  const period: Period = { key, from: from || undefined, to: to || undefined };
  const shown = compare ? profiles : [selected];
  return (
    <div>
      <div className="row no-print wrap">
        {PERIODS.map((p) => <button key={p.key} className={`btn${key === p.key ? ' primary' : ''}`} onClick={() => setKey(p.key)}>{p.label}</button>)}
        {key === 'custom' && (<>
          <label>From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label>To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        </>)}
        {profiles.length > 1 && <label className="check"><input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} /> Compare players</label>}
      </div>
      <div className={`reports${compare ? ' side' : ''}`}>
        {shown.map((p) => <ReportBody key={p.id} profile={p} period={period} />)}
      </div>
    </div>
  );
}
