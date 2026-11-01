/**
 * Captain's Report: builds a plain-English summary for any period from the
 * attempt log + skill states. Runs entirely on the device.
 */
import { getDB, todayKey } from './db';
import { skillById, skillName, SKILLS } from './skills';
import { statesOf, statusOf } from './engine';
import type { Attempt, Profile, SkillState, SkillStatus, Subject } from './types';

export type PeriodKey = 'today' | 'session' | '7d' | '30d' | 'custom';

export interface Period { key: PeriodKey; from?: string; to?: string }

export function periodRange(p: Period, attempts: Attempt[], now = Date.now()): { from: number; to: number; label: string } {
  const startOfDay = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  switch (p.key) {
    case 'today': return { from: startOfDay(now), to: now, label: 'Today' };
    case '7d': return { from: startOfDay(now - 6 * 864e5), to: now, label: 'Last 7 days' };
    case '30d': return { from: startOfDay(now - 29 * 864e5), to: now, label: 'Last 30 days' };
    case 'custom': {
      const from = p.from ? new Date(`${p.from}T00:00:00`).getTime() : startOfDay(now - 6 * 864e5);
      const to = p.to ? new Date(`${p.to}T23:59:59`).getTime() : now;
      return { from, to, label: `${p.from ?? '...'} to ${p.to ?? 'today'}` };
    }
    case 'session': {
      // A session = attempts with no gap longer than 30 minutes.
      let start = attempts.length ? attempts[attempts.length - 1].at : now;
      for (let i = attempts.length - 1; i > 0; i--) {
        if (attempts[i].at - attempts[i - 1].at > 30 * 60_000) break;
        start = attempts[i - 1].at;
      }
      return { from: start, to: now, label: 'Last session' };
    }
  }
}

export interface SkillRow {
  skillId: string;
  name: string;
  subject: Subject;
  attempts: number;
  accuracy: number; // % in period
  hints: number;
  mastery: number;
  status: SkillStatus;
  tip: string;
}

export interface Pattern { skillId: string; tag: string; n: number; text: string }

export interface Report {
  label: string;
  playedMin: number;
  daysPlayed: number;
  totalAttempts: number;
  accuracy: number;
  strengths: SkillRow[];
  needsHelp: SkillRow[];
  patterns: Pattern[];
  hotspots: { name: string; hintsPerQ: number; attempts: number }[];
  bySubject: { subject: Subject; minutes: number; accuracy: number }[];
  chart: { subject: Subject; points: { day: string; acc: number }[] }[];
  table: SkillRow[];
  tips: string[];
  summary: string;
}

export function describeTag(tag: string, ex?: string): string {
  const e = ex ? ` (${ex.replace('→', ' read as ')})` : '';
  const [kind, arg] = tag.split(':');
  switch (kind) {
    case 'rev': return `mixes up ${arg?.replace('/', ' and ')}${e}`;
    case 'vowel': return `mixes up short ${arg?.replace('/', ' and ')}${e}`;
    case 'dig': return arg === 'swap' ? `swaps digraphs like sh and ch${e}` : `drops the second letter of ${arg}${e}`;
    case 'begin': return `misses the beginning sound${e}`;
    case 'end': return `misses the ending sound${e}`;
    case 'mid': return `misses the middle sound${e}`;
    case 'follow': return `overlooks the ${arg} word in written directions`;
    case 'group': return 'mixes up the names for groups of animals and things';
    case 'plural': return ({
      regular: 'adds -s to words that change shape (mouses, foots)',
      same: 'says the single word when asked for more than one',
      mix: 'is unsure how tricky words turn into more than one',
    } as Record<string, string>)[arg] ?? tag;
    case 'rhyme': return arg === 'vowel' ? 'matches words by the middle sound instead of the ending' : 'matches words by the first letter instead of the ending';
    case 'math':
      return ({
        off1: 'counts or adds off by one',
        'sub-for-add': 'subtracts when asked to add',
        'add-for-sub': 'adds when asked to take away',
        cross10: 'gets stuck when the numbers pass 10',
        cmp: 'picks the smaller group when asked for more',
      } as Record<string, string>)[arg] ?? tag;
    default: return tag;
  }
}

const pct = (n: number, d: number) => (d ? Math.round((100 * n) / d) : 0);

export function buildReport(profile: Profile, period: Period, now = Date.now()): Report {
  const db = getDB();
  const all = db.attempts[profile.id] ?? [];
  const { from, to, label } = periodRange(period, all, now);
  const inRange = all.filter((a) => a.at >= from && a.at <= to);
  const states = statesOf(profile.id);

  // per-skill rows
  const per = new Map<string, { n: number; ok: number; hints: number }>();
  const sub = new Map<Subject, { n: number; ok: number; ms: number }>();
  const errs = new Map<string, Pattern>();
  const days = new Set<string>();
  for (const a of inRange) {
    days.add(todayKey(a.at));
    for (const id of a.skillIds) {
      const r = per.get(id) ?? { n: 0, ok: 0, hints: 0 };
      r.n++; if (a.correct) r.ok++; r.hints += a.hintsUsed;
      per.set(id, r);
      const subj = skillById(id)?.subject ?? 'games';
      const s = sub.get(subj) ?? { n: 0, ok: 0, ms: 0 };
      s.n++; if (a.correct) s.ok++; s.ms += Math.min(a.ms, 60_000);
      sub.set(subj, s);
      if (!a.correct) {
        for (const tag of a.errorTags ?? []) {
          const key = `${id}|${tag}`;
          const ex = a.expected && a.given ? `${a.expected}→${a.given}` : undefined;
          const p = errs.get(key) ?? { skillId: id, tag, n: 0, text: '' };
          p.n++; p.text = describeTag(tag, states[id]?.errors?.[tag]?.ex || ex);
          errs.set(key, p);
        }
      }
    }
  }

  const row = (id: string): SkillRow => {
    const sk = skillById(id)!;
    const r = per.get(id) ?? { n: 0, ok: 0, hints: 0 };
    const st: SkillState | undefined = states[id];
    return {
      skillId: id, name: sk.name, subject: sk.subject, attempts: r.n, accuracy: pct(r.ok, r.n),
      hints: r.hints, mastery: st?.mastery ?? 0, status: statusOf(st), tip: sk.tip,
    };
  };
  const active = [...per.keys()].filter((id) => skillById(id)).map(row);
  const strengths = active.filter((r) => r.attempts >= 3 && (r.status === 'mastered' || r.accuracy >= 85))
    .sort((a, b) => b.accuracy - a.accuracy).slice(0, 5);
  const needsHelp = active.filter((r) => r.attempts >= 3 && r.status !== 'mastered' && (r.accuracy < 65 || r.status === 'practicing'))
    .sort((a, b) => a.accuracy - b.accuracy).slice(0, 4);
  const patterns = [...errs.values()].filter((p) => p.n >= 2).sort((a, b) => b.n - a.n).slice(0, 5);
  const hotspots = active.filter((r) => r.attempts >= 3 && r.hints > 0)
    .map((r) => ({ name: r.name, hintsPerQ: Math.round((r.hints / r.attempts) * 10) / 10, attempts: r.attempts }))
    .sort((a, b) => b.hintsPerQ - a.hintsPerQ).slice(0, 4);

  // playtime
  const fromKey = todayKey(from);
  const toKey = todayKey(to);
  let playedMs = 0;
  for (const [day, ms] of Object.entries(db.playtime[profile.id] ?? {})) if (day >= fromKey && day <= toKey) playedMs += ms;
  const playedMin = Math.round(playedMs / 60_000);

  // chart: accuracy per day per subject
  const chart = (['reading', 'math'] as Subject[]).map((subject) => {
    const byDay = new Map<string, { n: number; ok: number }>();
    for (const a of inRange) {
      if (!a.skillIds.some((id) => skillById(id)?.subject === subject)) continue;
      const k = todayKey(a.at);
      const d = byDay.get(k) ?? { n: 0, ok: 0 };
      d.n++; if (a.correct) d.ok++;
      byDay.set(k, d);
    }
    return { subject, points: [...byDay.entries()].sort().map(([day, d]) => ({ day, acc: pct(d.ok, d.n) })) };
  });

  const totalOk = inRange.filter((a) => a.correct).length;
  const tips = [
    ...needsHelp.map((r) => `${r.name}: ${r.tip}`),
    ...patterns.slice(0, 1).map((p) => `Pattern to watch: he ${p.text}.`),
  ].slice(0, 3);

  const reportRows = SKILLS.filter((s) => s.subject === 'reading' || s.subject === 'math').map((s) => row(s.id));
  const next = reportRows.find((r) => r.status !== 'mastered' && (states[r.skillId] || r.status === 'new'));

  const nm = profile.name;
  const parts: string[] = [];
  if (!inRange.length) {
    parts.push(`${nm} hasn't played in this period yet.`);
  } else {
    parts.push(`${label}: ${nm} played ${playedMin ? `${playedMin} min over ` : ''}${days.size} day${days.size === 1 ? '' : 's'} and answered ${inRange.length} questions (${pct(totalOk, inRange.length)}% right).`);
    if (strengths.length) parts.push(`Great at: ${strengths.map((s) => `${s.name} (${s.accuracy}%)`).join(', ')}.`);
    if (needsHelp.length) parts.push(`Work on: ${needsHelp.map((s) => `${s.name} (${s.accuracy}%)`).join(', ')}.`);
    if (patterns.length) parts.push(`Pattern: he ${patterns[0].text}.`);
    if (next) parts.push(`Next up: ${next.name}.`);
  }

  return {
    label, playedMin, daysPlayed: days.size, totalAttempts: inRange.length, accuracy: pct(totalOk, inRange.length),
    strengths, needsHelp, patterns, hotspots,
    bySubject: [...sub.entries()].filter(([s]) => s !== 'games')
      .map(([subject, s]) => ({ subject, minutes: Math.round(s.ms / 60_000), accuracy: pct(s.ok, s.n) })),
    chart, table: reportRows, tips, summary: parts.join(' '),
  };
}

/** Plain-text version for copy/paste to a teacher or partner. */
export function reportText(profile: Profile, r: Report): string {
  const L = [`Captain's Report: ${profile.name} (${r.label})`, '', r.summary, ''];
  if (r.strengths.length) L.push('Strengths:', ...r.strengths.map((s) => `- ${s.name}: ${s.accuracy}%`), '');
  if (r.needsHelp.length) L.push('Needs extra help:', ...r.needsHelp.map((s) => `- ${s.name}: ${s.accuracy}%`), '');
  if (r.patterns.length) L.push('Error patterns:', ...r.patterns.map((p) => `- ${skillName(p.skillId)}: ${p.text} (${p.n}x)`), '');
  if (r.hotspots.length) L.push('Asked for hints most on:', ...r.hotspots.map((h) => `- ${h.name} (${h.hintsPerQ} per question)`), '');
  if (r.tips.length) L.push('Try at home:', ...r.tips.map((t) => `- ${t}`), '');
  L.push('Skill levels:', ...r.table.map((t) => `- ${t.name}: ${t.status} (${t.mastery})`));
  return L.join('\n');
}
