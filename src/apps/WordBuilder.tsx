import { useEffect, useMemo, useRef, useState } from 'react';
import { diagnoseWord } from '../content/generators';
import { focusFirst } from '../core/nav';
import { sfx, soundOut, speak, speakSound, speakThemePraise, stopSpeaking } from '../core/speech';
import type { MiniAppProps, Question } from '../core/types';
import { Bubble, HelperButton, MAX_HINTS } from '../ui/QuestionCard';
import Round, { type RoundApi } from '../ui/Round';

const SWAP: Record<string, string> = { b: 'd', d: 'b', p: 'q', q: 'p', m: 'w', w: 'm', n: 'u', u: 'n', e: 'i', i: 'e', a: 'o', o: 'a' };
const CONSONANTS = 'bcdfghjklmnprstvwz'.split('');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Item { id: string; t: string }

function makeTray(q: Question): Item[] {
  const tiles = q.tiles ?? [];
  const extra: string[] = [];
  for (const t of tiles) { const alt = SWAP[t]; if (alt && !tiles.includes(alt) && !extra.includes(alt)) extra.push(alt); }
  while (extra.length < 2) {
    const c = CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
    if (!tiles.includes(c) && !extra.includes(c)) extra.push(c);
  }
  const items = [...tiles.map((t, i) => ({ id: `t${i}`, t })), ...extra.slice(0, 2).map((t, i) => ({ id: `x${i}`, t }))];
  return items.sort(() => Math.random() - 0.5);
}

/**
 * Word Builder: drag (or tap) letters into the chest to spell the word.
 * Tapping a letter plays its sound; finishing blends the word aloud.
 */
function Board({ r, props }: { r: RoundApi; props: MiniAppProps }) {
  const { q } = r;
  const { theme, profile } = props;
  const tiles = q.tiles ?? [];
  const tray = useMemo(() => makeTray(q), [q]);
  const maxHints = MAX_HINTS[profile.settings.hintMode];
  const t0 = useRef(Date.now());
  const alive = useRef(true);
  const cancel = useRef<() => void>(() => {});
  const [placed, setPlaced] = useState<string[]>([]);
  const [used, setUsed] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [firstWrong, setFirstWrong] = useState<{ slot: number; t: string } | null>(null);
  const [level, setLevel] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [glow, setGlow] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [bubble, setBubble] = useState('');
  const [drag, setDrag] = useState<{ item: Item; x: number; y: number } | null>(null);
  const placedRef = useRef<string[]>([]);
  placedRef.current = placed;

  useEffect(() => {
    alive.current = true; // StrictMode runs cleanup once in dev; re-arm
    const focusId = setTimeout(focusFirst, 60);
    const id = setTimeout(() => void speak(`Build the word. It looks like this.`), 300);
    return () => { clearTimeout(focusId); clearTimeout(id); alive.current = false; cancel.current(); stopSpeaking(); };
  }, []);

  useEffect(() => {
    if (!r.proactive || !maxHints) return;
    const id = setTimeout(() => ask(), 2500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextExpected = () => tiles[placedRef.current.length];

  async function complete(autoSolved: boolean, finalMistakes: number, wrong: { slot: number; t: string } | null) {
    setBusy(true);
    const correct = finalMistakes === 0 && !autoSolved;
    const given = wrong ? tiles.map((t, i) => (i === wrong.slot ? wrong.t : t)).join('') : q.word!;
    const tags = wrong ? [diagnoseWord(q.word!, given)] : [];
    sfx.good();
    await new Promise<void>((resolve) => {
      cancel.current = soundOut(q.sounds ?? [], q.word!, (i) => { if (i === -2) resolve(); }, 400);
    });
    const praiseIdx = Math.floor(Math.random() * (theme.praise?.length || 1));
    const praise = theme.praise[praiseIdx] || 'Great job!';
    const explain = !correct || level > 0;
    setBubble(explain ? q.explain.text : praise);
    await speakThemePraise(theme, praiseIdx);
    if (explain) await speak(q.explain.say ?? q.explain.text);
    await sleep(500);
    if (alive.current) r.answer({ correct, given, expected: q.word!, hintsUsed: level, tags, ms: Date.now() - t0.current });
  }

  function tryPlace(item: Item) {
    if (busy || used.includes(item.id) || hidden.includes(item.id)) return;
    const slot = placedRef.current.length;
    if (item.t === tiles[slot]) {
      sfx.tap();
      const next = [...placedRef.current, item.t];
      setPlaced(next);
      setUsed((u) => [...u, item.id]);
      setGlow(null);
      const key = q.sounds?.[slot];
      if (key) void speakSound(key);
      if (next.length === tiles.length) void complete(false, mistakes, firstWrong);
      else setTimeout(() => document.querySelector<HTMLElement>('.tray .tile:not(:disabled)')?.focus(), 40);
    } else {
      sfx.soft();
      setMistakes((m) => m + 1);
      const fw = firstWrong ?? { slot, t: item.t };
      setFirstWrong(fw);
      setShake(item.id);
      setTimeout(() => setShake(null), 500);
      setBubble('Listen to that sound. Does it fit? Try another letter.');
      void speakSound(item.t);
    }
  }

  function ask() {
    if (busy || level >= maxHints) return;
    const lvl = level + 1;
    setLevel(lvl);
    cancel.current();
    if (lvl === 1) {
      setBubble('Tap each letter to hear its sound.');
      setPulse(true);
      void speak('Tap each letter to hear its sound.');
    } else if (lvl === 2) {
      const want = nextExpected();
      const target = tray.find((i) => i.t === want && !used.includes(i.id));
      const spare = tray.find((i) => !used.includes(i.id) && !hidden.includes(i.id) && !tiles.includes(i.t));
      if (spare) setHidden((h) => [...h, spare.id]);
      if (target) setGlow(target.id);
      setBubble("Let's sound it out slowly.");
      cancel.current = soundOut(q.sounds ?? [], q.word!, undefined, 500);
    } else {
      setBubble("Watch, I'll build it!");
      void autoBuild();
    }
  }

  async function autoBuild() {
    setBusy(true);
    let cur = placedRef.current;
    const usedLocal = [...used];
    while (cur.length < tiles.length && alive.current) {
      const slot = cur.length;
      const item = tray.find((i) => i.t === tiles[slot] && !usedLocal.includes(i.id));
      cur = [...cur, tiles[slot]];
      setPlaced(cur);
      if (item) { usedLocal.push(item.id); setUsed((u) => [...u, item.id]); }
      const key = q.sounds?.[slot];
      if (key) await speakSound(key);
      await sleep(350);
    }
    if (alive.current) await complete(true, mistakes, firstWrong);
  }

  /* ---- drag with pointer events; a short press counts as a tap (with fallback for iOS 9 touch/click) ---- */
  const startRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const pointerHandledAt = useRef(0);
  const onDown = (item: Item) => (e: React.PointerEvent) => {
    if (busy) return;
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* ignore */ }
    startRef.current = { x: e.clientX, y: e.clientY, moved: false };
    setDrag({ item, x: e.clientX, y: e.clientY });
  };
  const onMove = (e: React.PointerEvent) => {
    const s = startRef.current;
    if (!s) return;
    if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > 10) s.moved = true;
    setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
  };
  const onUp = (item: Item) => (e: React.PointerEvent) => {
    const s = startRef.current;
    startRef.current = null;
    setDrag(null);
    if (!s) return;
    pointerHandledAt.current = Date.now();
    if (!s.moved) { void speakSound(item.t); tryPlace(item); return; }
    const over = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-chest]');
    if (over) tryPlace(item);
  };

  return (
    <div className="builder">
      <Bubble theme={theme} text={bubble || 'Build the word to match the picture!'} />
      <div className="picture" aria-label="picture of the word">{q.emoji}</div>
      <div className="chest" data-chest>
        <span className="chest-emoji">{theme.container.emoji}</span>
        <div className="slots">
          {tiles.map((t, i) => (
            <span key={i} className={`slot${placed[i] ? ' filled' : ''}${i === placed.length ? ' next' : ''}`} data-slot>
              {placed[i] ?? ''}
            </span>
          ))}
        </div>
      </div>
      <div className="tray">
        {tray.map((it, idx) => (
          <button
            key={it.id}
            data-autofocus={idx === 0 ? '' : undefined}
            className={`tile big${used.includes(it.id) ? ' used' : ''}${hidden.includes(it.id) ? ' hidden' : ''}${pulse ? ' pulse' : ''}${glow === it.id ? ' glow' : ''}${shake === it.id ? ' shake' : ''}`}
            disabled={used.includes(it.id) || hidden.includes(it.id)}
            onPointerDown={onDown(it)}
            onPointerMove={onMove}
            onPointerUp={onUp(it)}
            onPointerCancel={() => { startRef.current = null; setDrag(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pointerHandledAt.current = Date.now(); void speakSound(it.t); tryPlace(it); } }}
            onClick={() => { if (Date.now() - pointerHandledAt.current > 350) { void speakSound(it.t); tryPlace(it); } }}
            aria-label={`letter ${it.t}`}
          >
            {it.t}
          </button>
        ))}
      </div>
      {drag && <div className="tile big ghost" style={{ left: drag.x, top: drag.y }}>{drag.item.t}</div>}
      {maxHints > 0 && <HelperButton theme={theme} level={level} max={maxHints} onAsk={ask} />}
    </div>
  );
}

export default function WordBuilder(props: MiniAppProps) {
  return <Round appId="word-builder" props={props}>{(r) => <Board r={r} props={props} />}</Round>;
}
