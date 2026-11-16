import { serve, type Server } from 'bun';
import controlHtml from './control/control.html';
import displayHtml from './display/display.html';

const server = serve<{ room: string }>({
  port: Number(process.env.PORT) || 3030,
  routes: {
    '/': Response.redirect('/control'),
    '/control': controlHtml,
    '/display': displayHtml,
    '/alarm-beep.mp3': () => new Response(Bun.file('./assets/alarm-beep.mp3')),
    '/ws': (req: Request, server: Server<{ room: string }>) => {
      const url = new URL(req.url);
      const user = url.searchParams.get('user') || 'default';
      const room = `timer_room_${user}`;
      if (server.upgrade(req, { data: { room } })) return;
      return new Response('WebSocket upgrade failed', { status: 500 });
    },
  },

  websocket: {
    open(ws) {
      ws.subscribe(ws.data.room);
    },
    message(ws, message) {
      if (message === 'ping') return void ws.send('pong'); // heartbeat กัน serverless หลับ
      server.publish(ws.data.room, message); // กระจายคำสั่งเฉพาะ room ของ user นั้น
    },
    close(ws) {
      ws.unsubscribe(ws.data.room);
    },
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
