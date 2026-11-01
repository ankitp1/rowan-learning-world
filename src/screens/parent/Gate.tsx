import { useEffect, useRef, useState } from 'react';
import { getDB, update, uid } from '../../core/db';
import { hashPin } from '../../core/time';

function Keypad({ value, onChange, onOk, max, okLabel = 'OK' }: {
  value: string; onChange: (v: string) => void; onOk: () => void; max: number; okLabel?: string;
}) {
  const press = (d: string) => { if (value.length < max) onChange(value + d); };
  return (
    <div className="keypad">
      <div className="keyval" aria-live="polite">{value.replace(/./g, max === 4 ? '•' : '$&') || ' '}</div>
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <button key={d} onClick={() => press(d)}>{d}</button>)}
      <button onClick={() => onChange(value.slice(0, -1))} aria-label="delete">⌫</button>
      <button onClick={() => press('0')}>0</button>
      <button className="ok" onClick={onOk} disabled={!value}>{okLabel}</button>
    </div>
  );
}

type Step = 'hold' | 'math' | 'pin' | 'newpin' | 'confirm';

/** Grown-up gate: hold 3 seconds, solve a times-table, then enter (or create) the PIN. */
export default function Gate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const hasPin = !!getDB().parent.pinHash;
  const [step, setStep] = useState<Step>('hold');
  const [prog, setProg] = useState(0);
  const [val, setVal] = useState('');
  const [msg, setMsg] = useState('');
  const [first, setFirst] = useState('');
  const sum = useRef({ a: 6 + Math.floor(Math.random() * 4), b: 6 + Math.floor(Math.random() * 4) });
  const raf = useRef(0);
  const start = useRef(0);
  const remotePresses = useRef<number[]>([]);

  const stopHold = () => { cancelAnimationFrame(raf.current); start.current = 0; setProg(0); };
  const startHold = () => {
    if (start.current) return;
    start.current = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - start.current) / 3000);
      setProg(p);
      if (p >= 1) { start.current = 0; setStep('math'); setVal(''); return; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const onRemotePress = () => {
    const now = performance.now();
    remotePresses.current = [...remotePresses.current.filter((t) => now - t < 2500), now];
    if (remotePresses.current.length >= 3) {
      stopHold();
      setStep('math');
      setVal('');
    } else {
      setProg(remotePresses.current.length / 3);
    }
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const checkMath = () => {
    if (Number(val) === sum.current.a * sum.current.b) { setStep(hasPin ? 'pin' : 'newpin'); setVal(''); setMsg(''); }
    else { setMsg('Not quite. Try again.'); sum.current = { a: 6 + Math.floor(Math.random() * 4), b: 6 + Math.floor(Math.random() * 4) }; setVal(''); }
  };

  const checkPin = async () => {
    const { pinHash, salt } = getDB().parent;
    if (pinHash && (await hashPin(val, salt ?? '')) === pinHash) onPass();
    else { setMsg('That PIN is not right.'); setVal(''); }
  };

  const savePin = async () => {
    if (step === 'newpin') {
      if (val.length !== 4) { setMsg('Use exactly 4 digits.'); return; }
      setFirst(val); setVal(''); setMsg(''); setStep('confirm');
    } else if (val === first) {
      const salt = uid();
      const h = await hashPin(val, salt);
      update((d) => { d.parent = { pinHash: h, salt }; });
      onPass();
    } else { setMsg('They did not match. Start again.'); setVal(''); setFirst(''); setStep('newpin'); }
  };

  return (
    <div className="overlay gate" role="dialog" aria-label="Grown-ups only">
      <div className="card">
        <h2>🔒 Grown-ups only</h2>
        {step === 'hold' && (
          <>
            <p>Press and hold the button for 3 seconds.</p>
            <button
              className="hold-btn" data-autofocus
              onPointerDown={startHold} onPointerUp={stopHold} onPointerLeave={stopHold} onPointerCancel={stopHold}
              onTouchStart={startHold} onTouchEnd={stopHold} onTouchCancel={stopHold}
              onMouseDown={startHold} onMouseUp={stopHold} onMouseLeave={stopHold}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Select' || e.keyCode === 23) && !e.repeat) {
                  e.preventDefault();
                  onRemotePress();
                  startHold();
                }
              }}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Select' || e.keyCode === 23) stopHold(); }}
            >
              <span className="bar" style={{ width: `${prog * 100}%` }} />
              <span className="lbl">Hold</span>
            </button>
          </>
        )}
        {step === 'math' && (
          <>
            <p>What is {sum.current.a} × {sum.current.b}?</p>
            <Keypad value={val} onChange={setVal} onOk={checkMath} max={3} />
          </>
        )}
        {step === 'pin' && (<><p>Enter your PIN.</p><Keypad value={val} onChange={setVal} onOk={() => void checkPin()} max={4} /></>)}
        {step === 'newpin' && (<><p>First time here! Create a 4-digit PIN.</p><Keypad value={val} onChange={setVal} onOk={() => void savePin()} max={4} okLabel="Next" /></>)}
        {step === 'confirm' && (<><p>Type the PIN again to confirm.</p><Keypad value={val} onChange={setVal} onOk={() => void savePin()} max={4} okLabel="Save" /></>)}
        {msg && <p className="msg">{msg}</p>}
        <button className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
