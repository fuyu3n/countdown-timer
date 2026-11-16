import { useEffect, useRef } from 'react';
import '../styles/global.css';
import { connectTimerSocket } from '../shared/timerSocket';

export function DisplayApp() {
  const timeRef = useRef<HTMLDivElement>(null);
  const reqRef = useRef<number>(0);
  const isRunning = useRef(false);
  const targetTime = useRef(0);
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const alarmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAlarm = () => {
    if (alarmTimerRef.current) {
      clearTimeout(alarmTimerRef.current);
      alarmTimerRef.current = null;
    }
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
    }
  };

  const playAlarm = () => {
    if (!alarmRef.current) {
      alarmRef.current = new Audio('/alarm-beep.mp3');
      alarmRef.current.loop = true;
    }
    alarmRef.current.play();
    alarmTimerRef.current = setTimeout(() => stopAlarm(), 10000);
  };

  const user = new URLSearchParams(window.location.search).get('user') || 'default';

  useEffect(() => {
    const ws = connectTimerSocket(user, (data) => {
      if (data.action === 'START') {
        targetTime.current = data.targetTime;
        isRunning.current = true;
        stopAlarm();
        cancelAnimationFrame(reqRef.current);
        reqRef.current = requestAnimationFrame(tick);
      } else if (data.action === 'STOP') {
        isRunning.current = false;
        cancelAnimationFrame(reqRef.current);
        stopAlarm();
        renderTime(data.remainingMs);
      } else if (data.action === 'RESET') {
        isRunning.current = false;
        cancelAnimationFrame(reqRef.current);
        stopAlarm();
        renderTime(data.totalMs);
      }
    });

    return () => {
      ws.close();
      cancelAnimationFrame(reqRef.current);
      stopAlarm();
    };
  }, []);

  const tick = () => {
    if (!isRunning.current) return;
    const remaining = Math.max(0, targetTime.current - Date.now());
    renderTime(remaining);
    if (remaining > 0) {
      reqRef.current = requestAnimationFrame(tick);
    } else {
      isRunning.current = false;
      playAlarm();
    }
  };

  const renderTime = (ms: number) => {
    if (!timeRef.current) return;
    const totalSeconds = Math.ceil(ms / 1000);
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    timeRef.current.innerText = `${h}:${m}:${s}`;
  };

  return (
    <div className="font-sans text-[20rem] text-center font-bold bg-[#1a1a1a] py-8 px-40 rounded-[10rem] text-white [text-shadow:2px_2px_8px_rgba(0,0,0,0.8)] tracking-[0.05em]">
      <div ref={timeRef}>00:00:00</div>
    </div>
  );
}

export default DisplayApp;
