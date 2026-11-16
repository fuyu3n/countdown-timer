import { serve, type Server } from 'bun';
import controlHtml from './control/control.html';
import displayHtml from './display/display.html';

type Role = 'control' | 'display';
type WsData = { room: string; role: Role | null };

// จำนวนหน้า Control / Display ที่ต่ออยู่ในแต่ละ room ใช้บอกสถานะจุดเขียว/แดง
const presence = new Map<string, { control: number; display: number }>();

const publishPresence = (room: string) => {
  const p = presence.get(room) ?? { control: 0, display: 0 };
  server.publish(room, JSON.stringify({ action: 'PRESENCE', ...p }));
};

const server = serve<WsData>({
  port: Number(process.env.PORT) || 3030,
  routes: {
    '/': Response.redirect('/control'),
    '/control': controlHtml,
    '/display': displayHtml,
    '/alarm-beep.mp3': () => new Response(Bun.file('./assets/alarm-beep.mp3')),
    '/ws': (req: Request, server: Server<WsData>) => {
      const url = new URL(req.url);
      const user = url.searchParams.get('user') || 'default';
      const room = `timer_room_${user}`;
      const roleParam = url.searchParams.get('role');
      const role = roleParam === 'control' || roleParam === 'display' ? roleParam : null;
      if (server.upgrade(req, { data: { room, role } })) return;
      return new Response('WebSocket upgrade failed', { status: 500 });
    },
  },

  websocket: {
    open(ws) {
      const { room, role } = ws.data;
      ws.subscribe(room);
      if (!role) return;
      const p = presence.get(room) ?? { control: 0, display: 0 };
      p[role]++;
      presence.set(room, p);
      publishPresence(room);
    },
    message(ws, message) {
      if (message === 'ping') return void ws.send('pong'); // heartbeat กัน serverless หลับ
      server.publish(ws.data.room, message); // กระจายคำสั่งเฉพาะ room ของ user นั้น
    },
    close(ws) {
      const { room, role } = ws.data;
      ws.unsubscribe(room);
      const p = presence.get(room);
      if (!role || !p) return;
      p[role] = Math.max(0, p[role] - 1);
      if (p.control === 0 && p.display === 0) presence.delete(room);
      publishPresence(room);
    },
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
