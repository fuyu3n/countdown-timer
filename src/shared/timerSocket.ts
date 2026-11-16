// WebSocket ที่ต่อใหม่เองเมื่อหลุด และส่ง ping เป็นระยะ
// ping ทำให้ server มี traffic ขาออก (pong) จน Railway serverless ไม่สั่งหลับระหว่างที่ยังเปิดหน้าอยู่
const HEARTBEAT_MS = 60_000;
const MAX_RETRY_MS = 10_000;

export function connectTimerSocket(user: string, onMessage: (data: any) => void) {
  const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws?user=${encodeURIComponent(user)}`;
  let ws: WebSocket | null = null;
  let retryMs = 1000;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  const open = () => {
    ws = new WebSocket(url);
    ws.onopen = () => {
      retryMs = 1000;
      heartbeat = setInterval(() => ws?.readyState === WebSocket.OPEN && ws.send('ping'), HEARTBEAT_MS);
    };
    ws.onmessage = (event) => {
      if (event.data === 'pong') return;
      onMessage(JSON.parse(event.data));
    };
    ws.onclose = () => {
      if (heartbeat) clearInterval(heartbeat);
      heartbeat = null;
      if (closed) return;
      retryTimer = setTimeout(open, retryMs);
      retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
    };
  };

  open();

  return {
    send(data: object) {
      if (ws?.readyState !== WebSocket.OPEN) return false;
      ws.send(JSON.stringify(data));
      return true;
    },
    close() {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (heartbeat) clearInterval(heartbeat);
      ws?.close();
    },
  };
}
