import { useEffect, useRef, useState } from 'react';
import '../styles/global.css';
import { connectTimerSocket } from '../shared/timerSocket';
import { StatusDot } from '../shared/StatusDot';

export function ControlApp() {
  const ws = useRef<ReturnType<typeof connectTimerSocket> | null>(null);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const targetTime = useRef(0);
  const remainingMs = useRef(0);
  const isRunning = useRef(false);
  const [online, setOnline] = useState(false);
  const [peerOnline, setPeerOnline] = useState(false);

  const user = new URLSearchParams(window.location.search).get('user') || 'default';

  useEffect(() => {
    ws.current = connectTimerSocket(user, 'control', {
      onStatus: (connected) => {
        setOnline(connected);
        if (!connected) setPeerOnline(false);
      },
      onPresence: (p) => setPeerOnline(p.display > 0),
    });
    return () => ws.current?.close();
  }, []);

  const send = (data: object) => ws.current?.send(data);

  const getTotalMs = () => (hours * 3600 + minutes * 60 + seconds) * 1000;

  const handleStart = () => {
    if (isRunning.current) return;
    if (remainingMs.current === 0) remainingMs.current = getTotalMs();
    if (remainingMs.current <= 0) return;
    targetTime.current = Date.now() + remainingMs.current;
    isRunning.current = true;
    send({ action: 'START', targetTime: targetTime.current });
  };

  const handleStop = () => {
    if (!isRunning.current) return;
    remainingMs.current = Math.max(0, targetTime.current - Date.now());
    isRunning.current = false;
    send({ action: 'STOP', remainingMs: remainingMs.current });
  };

  const handleReset = () => {
    isRunning.current = false;
    remainingMs.current = 0;
    send({ action: 'RESET', totalMs: getTotalMs() });
  };

  const clamp = (val: number, max: number) => Math.min(max, Math.max(0, Math.floor(val)));

  const handleChange = (setter: (v: number) => void, max: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(clamp(Number(e.target.value), max));
    remainingMs.current = 0;
    isRunning.current = false;
  };

  const inputClass =
    'w-16 text-center text-[1.8rem] font-bold bg-[#1a1a1a] border border-[#444] rounded-lg text-white py-1.5 px-1 outline-none';

  const btnClass = (bg: string) =>
    `flex-1 py-2.5 rounded-lg border-0 ${bg} text-white font-bold text-[0.95rem] cursor-pointer`;

  return (
    <div className="relative w-[300px] p-6 font-sans box-border bg-[#2a2a2a] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <StatusDot connected={online && peerOnline} peerName="Display" className="top-4 right-4 size-2" />
      <h2 className="m-0 mb-1 text-[1.1rem] text-[#aaa] text-center tracking-widest">COUNTDOWN TIMER</h2>
      <p className="m-0 mb-5 text-xs text-[#555] text-center tracking-[0.05em]">
        user: <span className="text-[#888]">{user}</span>
      </p>

      <div className="flex gap-1 items-end justify-center mb-6">
        <div className="flex flex-col items-center gap-1">
          <label className="text-[11px] text-[#888]">ชั่วโมง</label>
          <input
            type="number"
            min={0}
            max={99}
            value={hours}
            onChange={handleChange(setHours, 99)}
            className={inputClass}
          />
        </div>
        <span className="text-[2rem] font-bold text-[#555] pb-2">:</span>
        <div className="flex flex-col items-center gap-1">
          <label className="text-[11px] text-[#888]">นาที</label>
          <input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={handleChange(setMinutes, 59)}
            className={inputClass}
          />
        </div>
        <span className="text-[2rem] font-bold text-[#555] pb-2">:</span>
        <div className="flex flex-col items-center gap-1">
          <label className="text-[11px] text-[#888]">วินาที</label>
          <input
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={handleChange(setSeconds, 59)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handleStart} className={btnClass('bg-[#22c55e]')}>
          Start
        </button>
        <button onClick={handleStop} className={btnClass('bg-[#f59e0b]')}>
          Stop
        </button>
        <button onClick={handleReset} className={btnClass('bg-[#ef4444]')}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default ControlApp;
