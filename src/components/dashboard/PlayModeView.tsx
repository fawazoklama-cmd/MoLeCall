import React, { useEffect, useRef, useState } from 'react';
import { Bot, Globe, MessageSquare, Play, Plus, Send, Swords, Users } from 'lucide-react';
import { getHeroById, HEROES } from '../../data/heroes';
import { useI18n } from '../../localization/i18n';
import { Difficulty, OnlineRoom, PublicProfile } from '../../types/game';
import { HeroPortrait } from '../HeroPortrait';

interface PlayModeViewProps {
  profile: PublicProfile;
  ownedHeroIds: string[];
  onLaunchMatch: (heroId: string, difficulty: Difficulty, mode: 'offline_ai' | 'online_demo') => void;
}

export const PlayModeView: React.FC<PlayModeViewProps> = ({
  profile,
  ownedHeroIds,
  onLaunchMatch,
}) => {
  const { lang, t } = useI18n();
  const [selectedHeroId, setSelectedHeroId] = useState<string>(profile.favoriteHeroId || 'aether');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  // WebSocket 5v5 Multiplayer Lobby state
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [rooms, setRooms] = useState<OnlineRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<OnlineRoom | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [chatText, setChatText] = useState('');

  useEffect(() => {
    let disposed = false;
    let ws: WebSocket | null = null;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connectTimer = window.setTimeout(() => {
      if (disposed) return;
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (disposed) {
            ws?.close();
            return;
          }
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: 'hello', uid: profile.uid, username: profile.username }));
          ws?.send(JSON.stringify({ type: 'list_rooms' }));
        };

        ws.onmessage = (evt) => {
          if (disposed) return;
          try {
            const data = JSON.parse(evt.data);
            if (data.type === 'rooms_list') {
              setRooms(data.rooms || []);
            } else if (data.type === 'room_update') {
              const updated: OnlineRoom = data.room;
              setActiveRoom(updated);
              if (updated.status === 'playing') {
                const mySlot = updated.slots.find((s) => s.uid === profile.uid && !s.isBot);
                onLaunchMatch(mySlot?.heroId || selectedHeroId, 'normal', 'online_demo');
              }
            } else if (data.type === 'room_left') {
              setActiveRoom(null);
            }
          } catch {
            // Ignore malformed ws message
          }
        };

        ws.onclose = () => {
          if (!disposed) setWsConnected(false);
        };
      } catch {
        if (!disposed) setWsConnected(false);
      }
    }, 30);

    return () => {
      disposed = true;
      window.clearTimeout(connectTimer);
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'leave_room' }));
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => ws?.close();
        }
      }
      wsRef.current = null;
    };
  }, [profile.uid, profile.username]);

  const sendWs = (payload: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  const playableHeroes = HEROES.filter((h) => ownedHeroIds.includes(h.id) || h.costShards === 0);

  return (
    <div className="space-y-8">
      {/* OFFLINE CLASSIC VS AI */}
      <section className="bg-white border border-[#B9E3FF] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F4F9FF] pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#3478D4]">
              <Bot className="w-4 h-4" />
              <span>{t('mapName')}</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-[#172B49]">{t('offlineSectionTitle')}</h2>
            <p className="text-sm text-[#172B49]/70">{t('offlineSectionDesc')}</p>
          </div>
          <button
            type="button"
            data-start="true"
            onClick={() => onLaunchMatch(selectedHeroId, difficulty, 'offline_ai')}
            className="px-6 py-3.5 rounded-2xl bg-[#3478D4] text-white font-bold text-sm hover:bg-[#2762B5] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
          >
            <Swords className="w-4 h-4" />
            <span>{t('launchMatchBtn')}</span>
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#172B49]/80">{t('selectDifficulty')}</p>
          <div className="inline-flex p-1 rounded-2xl bg-[#F4F9FF] border border-[#B9E3FF] gap-1">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  difficulty === d
                    ? 'bg-[#3478D4] text-white shadow-sm'
                    : 'text-[#172B49]/75 hover:text-[#172B49]'
                }`}
              >
                {d === 'easy' ? t('diffEasy') : d === 'normal' ? t('diffNormal') : t('diffHard')}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Selection Grid */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#172B49]/80">{t('selectYourHero')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {playableHeroes.map((hero) => {
              const active = selectedHeroId === hero.id;
              return (
                <button
                  key={hero.id}
                  type="button"
                  onClick={() => {
                    setSelectedHeroId(hero.id);
                    if (activeRoom) sendWs({ type: 'select_hero', heroId: hero.id });
                  }}
                  className={`text-left rounded-2xl border p-2.5 transition-all cursor-pointer ${
                    active
                      ? 'border-[#3478D4] bg-[#E8F4FF] ring-2 ring-[#8CCFFF]'
                      : 'border-[#B9E3FF]/70 bg-[#F4F9FF]/60 hover:bg-white'
                  }`}
                >
                  <HeroPortrait hero={hero} size="sm" className="aspect-square rounded-xl mb-2" />
                  <p className="font-display font-bold text-sm text-[#172B49] truncate">{hero.name}</p>
                  <p className="text-[11px] font-medium text-[#3478D4]">{hero.role}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ONLINE 5V5 MULTIPLAYER WEBSOCKET LOBBY */}
      <section className="bg-white border border-[#FFB8D2] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#D95D90]">
              <Globe className="w-4 h-4" />
              <span>{wsConnected ? 'WebSocket Connected' : 'Connecting WebSocket...'}</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-[#172B49] mt-1">{t('onlineSectionTitle')}</h2>
          </div>
          {!activeRoom && (
            <button
              type="button"
              onClick={() => sendWs({ type: 'quick_match', heroId: selectedHeroId })}
              disabled={!wsConnected}
              className="px-5 py-2.5 rounded-xl bg-[#172B49] text-white text-xs font-bold hover:bg-[#263E66] disabled:opacity-50 inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{t('quickMatchBtn')}</span>
            </button>
          )}
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FFF6FA] border border-[#FFB8D2] text-xs font-medium text-[#7D2148]">
          {t('onlineDemoNotice')}
        </div>

        {!activeRoom ? (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                maxLength={32}
                placeholder={t('roomNamePlaceholder')}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#B9E3FF] bg-[#F4F9FF] text-sm text-[#172B49] focus:outline-none focus:ring-2 focus:ring-[#3478D4]"
              />
              <button
                type="button"
                onClick={() => {
                  sendWs({
                    type: 'create_room',
                    name: newRoomName.trim() || `${profile.username}'s 5v5`,
                    heroId: selectedHeroId,
                  });
                  setNewRoomName('');
                }}
                disabled={!wsConnected}
                className="px-5 py-2.5 rounded-xl bg-[#3478D4] text-white text-xs font-bold hover:bg-[#2762B5] disabled:opacity-50 inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('createRoomBtn')}</span>
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-[#172B49]/75">{t('activeRooms')}</p>
              {rooms.length === 0 ? (
                <p className="text-sm text-[#172B49]/60 py-4">{t('noRoomsMsg')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rooms.map((room) => {
                    const humanCount = room.slots.filter((s) => !s.isBot).length;
                    return (
                      <div
                        key={room.id}
                        className="p-4 rounded-2xl border border-[#B9E3FF] bg-[#F4F9FF]/70 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="font-display font-bold text-sm text-[#172B49]">{room.name}</p>
                          <p className="text-xs text-[#172B49]/65 tabular-nums">
                            Host: {room.hostName} · {humanCount}/10 Human · {room.status}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => sendWs({ type: 'join_room', roomId: room.id, heroId: selectedHeroId })}
                          className="px-4 py-2 rounded-xl bg-[#3478D4] text-white text-xs font-bold hover:bg-[#2762B5] cursor-pointer"
                        >
                          {t('joinRoomBtn')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* INSIDE ACTIVE 5v5 ROOM */
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F4F9FF] pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-[#172B49]">{activeRoom.name}</h3>
                <p className="text-xs text-[#172B49]/65">
                  {activeRoom.status === 'countdown'
                    ? `${lang === 'id' ? 'Dimulai dalam' : 'Starting in'} ${activeRoom.countdownSec}s...`
                    : `Host: ${activeRoom.hostName}`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => sendWs({ type: 'toggle_ready' })}
                  className="px-4 py-2 rounded-xl bg-[#E8F4FF] border border-[#8CCFFF] text-[#172B49] text-xs font-bold cursor-pointer"
                >
                  {activeRoom.slots.find((s) => s.uid === profile.uid && !s.isBot)?.ready
                    ? t('unreadyBtn')
                    : t('readyBtn')}
                </button>
                {activeRoom.hostUid === profile.uid && (
                  <button
                    type="button"
                    onClick={() => sendWs({ type: 'start_match' })}
                    className="px-5 py-2 rounded-xl bg-[#3478D4] text-white text-xs font-bold hover:bg-[#2762B5] cursor-pointer"
                  >
                    {t('startOnlineMatchBtn')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => sendWs({ type: 'leave_room' })}
                  className="px-4 py-2 rounded-xl bg-[#FFE0EC] text-[#8C1D4B] text-xs font-bold cursor-pointer"
                >
                  {t('leaveRoomBtn')}
                </button>
              </div>
            </div>

            {/* 5v5 Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['blue', 'red'] as const).map((team) => (
                <div
                  key={team}
                  className={`rounded-2xl border p-4 space-y-2 ${
                    team === 'blue' ? 'bg-[#F4F9FF] border-[#8CCFFF]' : 'bg-[#FFF6FA] border-[#FFB8D2]'
                  }`}
                >
                  <p className="font-display text-xs font-bold uppercase tracking-wider text-[#172B49] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{team === 'blue' ? 'Blue Team' : 'Red Team'}</span>
                  </p>
                  {activeRoom.slots
                    .filter((s) => s.team === team)
                    .map((slot) => {
                      const hero = getHeroById(slot.heroId);
                      return (
                        <div
                          key={slot.slotIndex}
                          className="bg-white rounded-xl px-3 py-2 border border-[#B9E3FF]/50 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-[#172B49] truncate">{slot.username}</span>
                            <span className="text-[#172B49]/55">· {hero.name}</span>
                          </div>
                          <span className="font-semibold text-[#3478D4] shrink-0">
                            {slot.isBot ? 'AI Bot' : slot.ready ? 'Ready' : 'Waiting'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>

            {/* Room Chat */}
            <div className="rounded-2xl border border-[#B9E3FF] bg-[#F4F9FF] p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#172B49]/75">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Lobby Chat</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 text-xs">
                {activeRoom.chat.map((c) => (
                  <p key={c.id}>
                    <span className="font-bold text-[#3478D4]">{c.sender}: </span>
                    <span className="text-[#172B49]">{c.text}</span>
                  </p>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatText.trim()) return;
                  sendWs({ type: 'chat_message', text: chatText });
                  setChatText('');
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder={t('roomChatPlaceholder')}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#B9E3FF] bg-white text-xs text-[#172B49]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#3478D4] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('sendBtn')}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
