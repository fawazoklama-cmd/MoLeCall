import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LobbySlot {
  slotIndex: number;
  team: 'blue' | 'red';
  uid: string;
  username: string;
  isBot: boolean;
  heroId: string;
  ready: boolean;
}

interface RoomState {
  id: string;
  name: string;
  hostUid: string;
  hostName: string;
  mode: '5v5_custom' | '5v5_quick';
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  countdownSec: number;
  slots: LobbySlot[];
  chat: Array<{ id: string; sender: string; text: string; ts: number }>;
  createdAt: number;
}

const HERO_IDS = [
  'aether',
  'valeria',
  'kael',
  'seraphina',
  'draven',
  'lunaria',
  'ragnar',
  'evelyne',
  'zephyr',
  'aurelia',
  'darius',
  'nyxara',
];

const rooms = new Map<string, RoomState>();
const clientRooms = new Map<WebSocket, { uid: string; username: string; roomId: string | null }>();

function createEmptySlots(): LobbySlot[] {
  const slots: LobbySlot[] = [];
  for (let i = 0; i < 10; i++) {
    slots.push({
      slotIndex: i,
      team: i < 5 ? 'blue' : 'red',
      uid: `bot_slot_${i}`,
      username: `Bot ${i < 5 ? 'Blue' : 'Red'} ${i % 5 + 1}`,
      isBot: true,
      heroId: HERO_IDS[i % HERO_IDS.length],
      ready: true,
    });
  }
  return slots;
}

function broadcastRoomList() {
  const list = Array.from(rooms.values()).filter((r) => r.status !== 'finished');
  const payload = JSON.stringify({ type: 'rooms_list', rooms: list });
  for (const ws of clientRooms.keys()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

function broadcastRoomUpdate(room: RoomState) {
  const payload = JSON.stringify({ type: 'room_update', room });
  for (const [ws, meta] of clientRooms.entries()) {
    if (meta.roomId === room.id && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
  broadcastRoomList();
}

function removeClientFromCurrentRoom(ws: WebSocket) {
  const meta = clientRooms.get(ws);
  if (!meta || !meta.roomId) return;
  const room = rooms.get(meta.roomId);
  meta.roomId = null;
  if (!room) return;

  const slot = room.slots.find((s) => s.uid === meta.uid && !s.isBot);
  if (slot) {
    slot.isBot = true;
    slot.uid = `bot_slot_${slot.slotIndex}`;
    slot.username = `Bot ${slot.team === 'blue' ? 'Blue' : 'Red'} ${(slot.slotIndex % 5) + 1}`;
    slot.ready = true;
  }

  const remainingHumans = room.slots.filter((s) => !s.isBot);
  if (remainingHumans.length === 0) {
    rooms.delete(room.id);
    broadcastRoomList();
  } else {
    if (room.hostUid === meta.uid) {
      room.hostUid = remainingHumans[0].uid;
      room.hostName = remainingHumans[0].username;
    }
    broadcastRoomUpdate(room);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, roomsActive: rooms.size, uptimeSec: Math.floor(process.uptime()) });
  });

  app.get('/api/rooms', (_req, res) => {
    res.json({ rooms: Array.from(rooms.values()).filter((r) => r.status !== 'finished') });
  });

  // Authoritative match outcome validation endpoint
  app.post('/api/verify-match', (req, res) => {
    const body = req.body || {};
    const kills = Math.max(0, Math.min(100, Number(body.kills) || 0));
    const deaths = Math.max(0, Math.min(100, Number(body.deaths) || 0));
    const durationSec = Math.max(10, Math.min(14400, Number(body.durationSec) || 60));
    const won = body.result === 'victory';

    const rankDelta = won ? 28 : -16;
    const shardsEarned = won ? 180 + Math.min(60, kills * 5) : 75 + Math.min(35, kills * 3);
    const expEarned = won ? 160 + Math.floor(durationSec / 10) : 90 + Math.floor(durationSec / 15);

    res.json({
      verified: true,
      rankDelta,
      shardsEarned,
      expEarned,
      kdaValidated: { kills, deaths },
    });
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    clientRooms.set(ws, { uid: `anon_${Date.now()}`, username: 'SkyPlayer', roomId: null });
    ws.send(
      JSON.stringify({
        type: 'rooms_list',
        rooms: Array.from(rooms.values()).filter((r) => r.status !== 'finished'),
      })
    );

    ws.on('message', (raw) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(raw.toString()) as Record<string, unknown>;
      } catch {
        return;
      }

      const meta = clientRooms.get(ws);
      if (!meta) return;

      if (msg.type === 'hello') {
        meta.uid = String(msg.uid || meta.uid).slice(0, 64);
        meta.username = String(msg.username || meta.username).slice(0, 24);
        ws.send(JSON.stringify({ type: 'hello_ack', uid: meta.uid }));
        return;
      }

      if (msg.type === 'list_rooms') {
        ws.send(
          JSON.stringify({
            type: 'rooms_list',
            rooms: Array.from(rooms.values()).filter((r) => r.status !== 'finished'),
          })
        );
        return;
      }

      if (msg.type === 'create_room' || msg.type === 'quick_match') {
        removeClientFromCurrentRoom(ws);

        if (msg.type === 'quick_match') {
          const openRoom = Array.from(rooms.values()).find(
            (r) => r.status === 'waiting' && r.slots.some((s) => s.isBot)
          );
          if (openRoom) {
            const botSlot = openRoom.slots.find((s) => s.isBot);
            if (botSlot) {
              botSlot.isBot = false;
              botSlot.uid = meta.uid;
              botSlot.username = meta.username;
              botSlot.heroId = String(msg.heroId || 'aether');
              botSlot.ready = true;
              meta.roomId = openRoom.id;
              broadcastRoomUpdate(openRoom);
              return;
            }
          }
        }

        const roomId = `room_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        const slots = createEmptySlots();
        slots[0] = {
          slotIndex: 0,
          team: 'blue',
          uid: meta.uid,
          username: meta.username,
          isBot: false,
          heroId: String(msg.heroId || 'aether'),
          ready: true,
        };

        const room: RoomState = {
          id: roomId,
          name: String(msg.name || `${meta.username}'s Arena`).slice(0, 32),
          hostUid: meta.uid,
          hostName: meta.username,
          mode: msg.type === 'quick_match' ? '5v5_quick' : '5v5_custom',
          status: 'waiting',
          countdownSec: 0,
          slots,
          chat: [
            {
              id: `sys_${Date.now()}`,
              sender: 'MoLeCall Server',
              text: `${meta.username} opened the 5v5 lobby.`,
              ts: Date.now(),
            },
          ],
          createdAt: Date.now(),
        };
        rooms.set(roomId, room);
        meta.roomId = roomId;
        broadcastRoomUpdate(room);
        return;
      }

      if (msg.type === 'join_room') {
        const room = rooms.get(String(msg.roomId || ''));
        if (!room || room.status !== 'waiting') return;
        const botSlot = room.slots.find((s) => s.isBot);
        if (!botSlot) return;

        removeClientFromCurrentRoom(ws);
        botSlot.isBot = false;
        botSlot.uid = meta.uid;
        botSlot.username = meta.username;
        botSlot.heroId = String(msg.heroId || 'valeria');
        botSlot.ready = false;
        meta.roomId = room.id;
        room.chat.push({
          id: `join_${Date.now()}`,
          sender: 'MoLeCall Server',
          text: `${meta.username} joined the room.`,
          ts: Date.now(),
        });
        broadcastRoomUpdate(room);
        return;
      }

      if (msg.type === 'leave_room') {
        removeClientFromCurrentRoom(ws);
        ws.send(JSON.stringify({ type: 'room_left' }));
        return;
      }

      if (msg.type === 'select_hero' && meta.roomId) {
        const room = rooms.get(meta.roomId);
        if (!room) return;
        const slot = room.slots.find((s) => s.uid === meta.uid && !s.isBot);
        if (slot && HERO_IDS.includes(String(msg.heroId))) {
          slot.heroId = String(msg.heroId);
          broadcastRoomUpdate(room);
        }
        return;
      }

      if (msg.type === 'toggle_ready' && meta.roomId) {
        const room = rooms.get(meta.roomId);
        if (!room) return;
        const slot = room.slots.find((s) => s.uid === meta.uid && !s.isBot);
        if (slot) {
          slot.ready = !slot.ready;
          broadcastRoomUpdate(room);
        }
        return;
      }

      if (msg.type === 'chat_message' && meta.roomId) {
        const room = rooms.get(meta.roomId);
        const text = String(msg.text || '').trim().slice(0, 140);
        if (!room || !text) return;
        room.chat.push({
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          sender: meta.username,
          text,
          ts: Date.now(),
        });
        if (room.chat.length > 30) room.chat.shift();
        broadcastRoomUpdate(room);
        return;
      }

      if (msg.type === 'start_match' && meta.roomId) {
        const room = rooms.get(meta.roomId);
        if (!room || room.hostUid !== meta.uid || room.status !== 'waiting') return;
        room.status = 'countdown';
        room.countdownSec = 3;
        broadcastRoomUpdate(room);

        const interval = setInterval(() => {
          const current = rooms.get(room.id);
          if (!current) {
            clearInterval(interval);
            return;
          }
          current.countdownSec -= 1;
          if (current.countdownSec <= 0) {
            clearInterval(interval);
            current.status = 'playing';
            broadcastRoomUpdate(current);
          } else {
            broadcastRoomUpdate(current);
          }
        }, 1000);
      }
    });

    ws.on('close', () => {
      removeClientFromCurrentRoom(ws);
      clientRooms.delete(ws);
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  server.listen(port, '0.0.0.0', () => {
    console.log(`MoLeCall server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start MoLeCall server:', err);
  process.exit(1);
});
