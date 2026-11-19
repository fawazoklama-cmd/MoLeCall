import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import {
  Crosshair,
  Pause,
  RotateCcw,
  ShoppingBag,
  Shield,
  Sparkles,
  Swords,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { getHeroById } from '../data/heroes';
import { SHOP_ITEMS } from '../data/items';
import { HudSnapshot, MoLeCallScene } from '../game/MoLeCallScene';
import { useI18n } from '../localization/i18n';
import { Difficulty, GameSettings, LiveMatchStats } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface GameArenaViewProps {
  heroId: string;
  difficulty: Difficulty;
  mode: 'offline_ai' | 'online_demo' | 'online_5v5';
  settings: GameSettings;
  onToggleMute: () => void;
  onMatchComplete: (stats: LiveMatchStats) => void;
  onExitArena: () => void;
}

export const GameArenaView: React.FC<GameArenaViewProps> = ({
  heroId,
  difficulty,
  mode,
  settings,
  onToggleMute,
  onMatchComplete,
  onExitArena,
}) => {
  const { lang, t } = useI18n();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<MoLeCallScene | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const onMatchCompleteRef = useRef(onMatchComplete);
  onMatchCompleteRef.current = onMatchComplete;

  const [hud, setHud] = useState<HudSnapshot | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [shopCategory, setShopCategory] = useState<string>('Recommended');
  const [shopToast, setShopToast] = useState<string>('');
  const [finalStats, setFinalStats] = useState<LiveMatchStats | null>(null);
  const [matchKey, setMatchKey] = useState(0);

  // Mobile joystick state
  const joyRef = useRef<HTMLDivElement | null>(null);
  const [joyKnob, setJoyKnob] = useState({ x: 0, y: 0 });
  const joyActiveRef = useRef(false);

  const hero = getHeroById(heroId);

  useEffect(() => {
    document.body.dataset.state = 'playing';
    soundEngine.startMusic();
    return () => {
      document.body.dataset.state = 'menu';
      soundEngine.stopMusic();
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    setFinalStats(null);
    setShopOpen(false);

    const scene = new MoLeCallScene();
    sceneRef.current = scene;

    const container = mountRef.current;
    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: container,
      width: container.clientWidth || window.innerWidth,
      height: container.clientHeight || window.innerHeight,
      backgroundColor: '#DCEFFF',
      antialias: settings.graphicsQuality !== 'low',
      fps: {
        target: settings.fpsLimit,
        forceSetTimeOut: false,
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [],
    });

    game.scene.add('MoLeCallScene', scene, true, {
      playerHeroId: heroId,
      difficulty,
      mode,
      cameraSensitivity: settings.cameraSensitivity,
      onHudUpdate: (nextHud: HudSnapshot) => {
        setHud(nextHud);
        if (nextHud.status === 'paused') document.body.dataset.state = 'paused';
        else if (nextHud.status === 'victory' || nextHud.status === 'defeat') {
          document.body.dataset.state = 'gameover';
        } else {
          document.body.dataset.state = 'playing';
        }
      },
      onMatchEnd: (stats: LiveMatchStats) => {
        document.body.dataset.state = 'gameover';
        setFinalStats(stats);
        onMatchCompleteRef.current(stats);
      },
    });

    gameRef.current = game;

    const ro = new ResizeObserver(() => {
      if (gameRef.current && mountRef.current) {
        gameRef.current.scale.resize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      sceneRef.current = null;
      game.destroy(true);
      gameRef.current = null;
    };
  }, [heroId, difficulty, mode, matchKey]);

  // Global keyboard shortcuts for Pause & Shop
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (finalStats) return;
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (shopOpen) {
          setShopOpen(false);
        } else if (sceneRef.current && hud) {
          const nextPaused = hud.status !== 'paused';
          sceneRef.current.setPausedState(nextPaused);
        }
      } else if (e.code === 'Tab' || e.code === 'KeyI') {
        e.preventDefault();
        setShopOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shopOpen, hud, finalStats]);

  const togglePause = () => {
    if (!sceneRef.current || !hud || finalStats) return;
    sceneRef.current.setPausedState(hud.status !== 'paused');
  };

  const handleBuyItem = (itemId: string) => {
    if (!sceneRef.current) return;
    const res = sceneRef.current.buyItemForPlayer(itemId);
    if (res.ok) {
      setShopToast(t('hudPurchased'));
    } else if (res.reason === 'gold') {
      setShopToast(t('hudInsufficientGold'));
    } else if (res.reason === 'full') {
      setShopToast(t('hudInventoryFull'));
    }
    setTimeout(() => setShopToast(''), 1800);
  };

  // Virtual Joystick Touch Handlers
  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joyRef.current || !sceneRef.current) return;
    const rect = joyRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.42;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, maxR);
    const ang = Math.atan2(dy, dx);
    const kx = dist > 2 ? Math.cos(ang) * clamped : 0;
    const ky = dist > 2 ? Math.sin(ang) * clamped : 0;
    setJoyKnob({ x: kx, y: ky });
    sceneRef.current.setVirtualJoystick(kx / maxR, ky / maxR);
  };

  const resetJoystick = () => {
    joyActiveRef.current = false;
    setJoyKnob({ x: 0, y: 0 });
    sceneRef.current?.setVirtualJoystick(0, 0);
  };

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const filteredItems = SHOP_ITEMS.filter((item) => {
    if (shopCategory === 'Recommended') return item.recommendedRoles.includes(hero.role);
    return item.category === shopCategory;
  });

  const isPaused = hud?.status === 'paused';

  return (
    <div className="fixed inset-0 z-50 bg-[#DCEFFF] overflow-hidden select-none">
      {/* Isolated Phaser Canvas Mount */}
      <div ref={mountRef} data-testid="phaser-arena-canvas" className="absolute inset-0 w-full h-full" />

      {/* Loading screen before first HUD tick */}
      {!hud && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F4F9FF]">
          <div className="bg-white border border-[#B9E3FF] rounded-2xl px-8 py-6 text-center shadow-sm space-y-2">
            <p className="font-display text-lg font-bold text-[#172B49]">MoLeCall</p>
            <p className="text-sm text-[#3478D4] font-medium">{t('hudLoading')}</p>
          </div>
        </div>
      )}

      {/* World-Matched HUD Overlay (pointer-events-none wrapper) */}
      {hud && (
        <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4">
          {/* TOP BAR: Scoreboard + Minimap + Controls */}
          <div className="flex items-start justify-between gap-3">
            {/* Top-Left: Corner Minimap */}
            <div className="pointer-events-auto bg-[#FFFFFF]/92 border-2 border-[#8CCFFF] rounded-2xl p-2 shadow-sm">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-[#DCEFFF] rounded-xl overflow-hidden border border-[#B9E3FF]">
                {/* Diagonal River & Lanes */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                  <polyline points="12,88 12,12 88,12" fill="none" stroke="#FFFFFF" strokeWidth="5" />
                  <polyline points="12,88 88,88 88,12" fill="none" stroke="#FFFFFF" strokeWidth="5" />
                  <line x1="12" y1="88" x2="88" y2="12" stroke="#FFFFFF" strokeWidth="6" />
                  <line x1="15" y1="15" x2="85" y2="85" stroke="#5AB7FA" strokeWidth="6" opacity="0.65" />
                </svg>
                {hud.minimap.map((ent, idx) => (
                  <span
                    key={idx}
                    style={{
                      left: `${Math.max(4, Math.min(96, ent.x * 100))}%`,
                      top: `${Math.max(4, Math.min(96, ent.y * 100))}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${
                      ent.kind === 'player'
                        ? 'w-3 h-3 bg-[#10B981] ring-2 ring-white z-20'
                        : ent.kind === 'nexus'
                          ? `w-3.5 h-3.5 ${ent.team === 'blue' ? 'bg-[#3478D4]' : 'bg-[#E24C85]'} ring-1 ring-white`
                          : ent.kind === 'turret'
                            ? `w-1.5 h-1.5 ${ent.team === 'blue' ? 'bg-[#3478D4]' : 'bg-[#E24C85]'}`
                            : `w-2 h-2 ${ent.team === 'blue' ? 'bg-[#5EB6FF]' : 'bg-[#FF77A8]'}`
                    }`}
                  />
                ))}
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] font-bold text-[#172B49] tabular-nums px-0.5">
                <span className="text-[#3478D4]">B {Math.round((hud.blueNexusHp / hud.blueNexusMaxHp) * 100)}%</span>
                <span className="text-[#E24C85]">R {Math.round((hud.redNexusHp / hud.redNexusMaxHp) * 100)}%</span>
              </div>
            </div>

            {/* Top-Center: Match Score & Timer */}
            <div className="pointer-events-auto bg-[#FFFFFF]/94 border-2 border-[#B9E3FF] rounded-2xl px-4 py-2 shadow-sm flex items-center gap-4 text-sm font-bold">
              <span className="text-[#3478D4] font-display text-lg tabular-nums">{hud.blueKills}</span>
              <div className="text-center">
                <p className="font-mono-tabular text-xs font-bold text-[#172B49]">{formatClock(hud.elapsedSec)}</p>
                <p className="text-[10px] font-semibold text-[#172B49]/65 tabular-nums">
                  {hud.playerKills}/{hud.playerDeaths}/{hud.playerAssists}
                </p>
              </div>
              <span className="text-[#E24C85] font-display text-lg tabular-nums">{hud.redKills}</span>
            </div>

            {/* Top-Right: Shop, Mute, Pause */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShopOpen((v) => !v)}
                className="px-3 py-2 rounded-xl bg-[#FFFFFF]/94 border-2 border-[#FFB8D2] text-[#172B49] text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#FFE0EC] transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#D95D90]" />
                <span className="tabular-nums">{hud.playerGold}g</span>
              </button>
              <button
                type="button"
                onClick={onToggleMute}
                aria-label="Toggle Mute"
                className="p-2.5 rounded-xl bg-[#FFFFFF]/94 border border-[#B9E3FF] text-[#172B49] shadow-sm hover:bg-[#E8F4FF] cursor-pointer"
              >
                {settings.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={togglePause}
                aria-label={t('hudPause')}
                className="p-2.5 rounded-xl bg-[#FFFFFF]/94 border border-[#B9E3FF] text-[#172B49] shadow-sm hover:bg-[#E8F4FF] cursor-pointer"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Respawn Banner if Dead */}
          {hud.playerRespawnSec > 0 && (
            <div className="self-center bg-[#172B49]/90 text-white px-5 py-2.5 rounded-2xl text-sm font-bold tabular-nums">
              Respawning in {hud.playerRespawnSec}s...
            </div>
          )}

          {/* BOTTOM CLUSTER: Mobile Virtual Joystick + Center Hero Bar + Skill Pads */}
          <div className="flex items-end justify-between gap-3">
            {/* Left: Touch Virtual Joystick (visible on touch/all screens for hybrid convenience) */}
            <div
              ref={joyRef}
              onPointerDown={(e) => {
                joyActiveRef.current = true;
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                updateJoystick(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => {
                if (joyActiveRef.current) updateJoystick(e.clientX, e.clientY);
              }}
              onPointerUp={resetJoystick}
              onPointerCancel={resetJoystick}
              className="pointer-events-auto relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#FFFFFF]/80 border-2 border-[#8CCFFF] flex items-center justify-center touch-none shadow-sm"
              aria-label="Movement Joystick"
            >
              <div
                style={{ transform: `translate(${joyKnob.x}px, ${joyKnob.y}px)` }}
                className="w-11 h-11 rounded-full bg-[#3478D4] border-2 border-white shadow-sm"
              />
            </div>

            {/* Center: Hero Vital Bars & Purchased Items */}
            <div className="hidden md:flex pointer-events-auto flex-col items-center gap-1.5 bg-[#FFFFFF]/94 border-2 border-[#B9E3FF] rounded-2xl px-4 py-2.5 shadow-sm min-w-[340px]">
              <div className="w-full flex items-center justify-between text-xs font-bold text-[#172B49]">
                <span>
                  {hero.name} · {t('hudLevel')} {hud.playerLevel}
                </span>
                <span className="font-mono-tabular text-[#3478D4]">
                  HP {hud.playerHp}/{hud.playerMaxHp} · MP {hud.playerMana}/{hud.playerMaxMana}
                </span>
              </div>
              {/* HP Bar */}
              <div className="w-full h-2.5 rounded-full bg-[#DCEFFF] overflow-hidden">
                <div
                  className="h-full bg-[#10B981] transition-all duration-100"
                  style={{ width: `${Math.max(0, Math.min(100, (hud.playerHp / hud.playerMaxHp) * 100))}%` }}
                />
              </div>
              {/* Mana Bar */}
              <div className="w-full h-1.5 rounded-full bg-[#DCEFFF] overflow-hidden">
                <div
                  className="h-full bg-[#3478D4] transition-all duration-100"
                  style={{ width: `${Math.max(0, Math.min(100, (hud.playerMana / hud.playerMaxMana) * 100))}%` }}
                />
              </div>
              {/* Items & Controls Hint */}
              <div className="w-full flex items-center justify-between pt-0.5 text-[10px] text-[#172B49]/65">
                <span className="truncate">{t('hudControlsHint')}</span>
                <span className="font-mono-tabular font-semibold text-[#D95D90] shrink-0 ml-2">
                  Items: {hud.items.length}/6
                </span>
              </div>
            </div>

            {/* Right: Attack + Q / E / R / B / Camera Buttons */}
            <div className="pointer-events-auto flex items-end gap-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => sceneRef.current?.centerCameraOnPlayer()}
                    aria-label="Center Camera"
                    className="w-10 h-10 rounded-full bg-[#FFFFFF]/92 border-2 border-[#B9E3FF] text-[#172B49] flex items-center justify-center shadow-sm hover:bg-[#E8F4FF] cursor-pointer"
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => sceneRef.current?.triggerPlayerRecall()}
                    aria-label={t('hudRecall')}
                    className="w-10 h-10 rounded-full bg-[#FFFFFF]/92 border-2 border-[#8CCFFF] text-[#3478D4] text-[10px] font-bold flex items-center justify-center shadow-sm hover:bg-[#E8F4FF] cursor-pointer"
                  >
                    {hud.isRecalling ? `${Math.round(hud.recallProgress * 100)}%` : 'B'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Q */}
                  <button
                    type="button"
                    onClick={() => sceneRef.current?.triggerPlayerSkill('Q')}
                    className="relative w-12 h-12 rounded-2xl bg-[#FFFFFF]/95 border-2 border-[#8CCFFF] text-[#172B49] font-display font-bold text-sm flex flex-col items-center justify-center shadow-sm hover:bg-[#E8F4FF] cursor-pointer"
                  >
                    <span>Q</span>
                    {hud.cooldowns.q > 0 && (
                      <span className="text-[10px] font-mono-tabular text-[#D95D90]">{hud.cooldowns.q}s</span>
                    )}
                  </button>
                  {/* E */}
                  <button
                    type="button"
                    onClick={() => sceneRef.current?.triggerPlayerSkill('E')}
                    className="relative w-12 h-12 rounded-2xl bg-[#FFFFFF]/95 border-2 border-[#FFB8D2] text-[#172B49] font-display font-bold text-sm flex flex-col items-center justify-center shadow-sm hover:bg-[#FFE0EC] cursor-pointer"
                  >
                    <span>E</span>
                    {hud.cooldowns.e > 0 && (
                      <span className="text-[10px] font-mono-tabular text-[#D95D90]">{hud.cooldowns.e}s</span>
                    )}
                  </button>
                  {/* R */}
                  <button
                    type="button"
                    onClick={() => sceneRef.current?.triggerPlayerSkill('R')}
                    className="relative w-14 h-14 rounded-2xl bg-[#3478D4] border-2 border-[#FFFFFF] text-white font-display font-bold text-base flex flex-col items-center justify-center shadow-md hover:bg-[#2762B5] cursor-pointer"
                  >
                    <span>R</span>
                    {hud.cooldowns.r > 0 && (
                      <span className="text-[10px] font-mono-tabular text-[#FFE0EC]">{hud.cooldowns.r}s</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Basic Attack */}
              <button
                type="button"
                onClick={() => sceneRef.current?.triggerPlayerBasicAttack()}
                aria-label="Basic Attack"
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFB8D2] to-[#E24C85] border-2 border-white text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
              >
                <Swords className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-MATCH ITEM SHOP MODAL */}
      {shopOpen && hud && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172B49]/45 p-4">
          <div className="w-full max-w-3xl bg-white border-2 border-[#8CCFFF] rounded-3xl shadow-xl overflow-hidden max-h-[88vh] flex flex-col">
            <div className="px-6 py-4 bg-[#F4F9FF] border-b border-[#B9E3FF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#3478D4]" />
                <h3 className="font-display text-lg font-bold text-[#172B49]">{t('hudItemShop')}</h3>
                <span className="font-mono-tabular text-sm font-bold text-[#D95D90]">
                  {hud.playerGold} Gold
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShopOpen(false)}
                aria-label={t('hudClose')}
                className="p-2 rounded-xl hover:bg-white text-[#172B49] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-3 border-b border-[#F4F9FF] flex flex-wrap gap-2">
              {['Recommended', 'Attack', 'Magic', 'Defense', 'Movement', 'Utility'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setShopCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    shopCategory === cat
                      ? 'bg-[#3478D4] text-white'
                      : 'bg-[#F4F9FF] text-[#172B49]/75 hover:bg-[#E8F4FF]'
                  }`}
                >
                  {cat}
                </button>
              ))}
              {shopToast && (
                <span className="ml-auto text-xs font-bold text-[#3478D4] self-center">{shopToast}</span>
              )}
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredItems.map((item) => {
                const canAfford = hud.playerGold >= item.cost && hud.items.length < 6;
                return (
                  <div
                    key={item.id}
                    className="border border-[#B9E3FF] rounded-2xl p-4 bg-[#F4F9FF]/60 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="font-display font-bold text-sm text-[#172B49] truncate">
                        {item.name[lang]}
                      </p>
                      <p className="text-xs text-[#172B49]/70 line-clamp-2">{item.description[lang]}</p>
                      <p className="font-mono-tabular text-xs font-bold text-[#3478D4]">{item.cost} Gold</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBuyItem(item.id)}
                      disabled={!canAfford}
                      className="px-3.5 py-2 rounded-xl bg-[#3478D4] text-white text-xs font-bold hover:bg-[#2762B5] disabled:opacity-45 shrink-0 cursor-pointer"
                    >
                      {t('buy')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PAUSE MODAL */}
      {isPaused && !finalStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172B49]/50 p-4">
          <div className="w-full max-w-sm bg-white border-2 border-[#8CCFFF] rounded-3xl p-6 text-center space-y-5 shadow-xl">
            <Shield className="w-9 h-9 text-[#3478D4] mx-auto" />
            <h2 className="font-display text-2xl font-bold text-[#172B49]">{t('hudPause')}</h2>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={togglePause}
                className="w-full py-3 rounded-xl bg-[#3478D4] text-white text-sm font-bold hover:bg-[#2762B5] cursor-pointer"
              >
                {t('hudResume')}
              </button>
              <button
                type="button"
                onClick={() => setMatchKey((k) => k + 1)}
                className="w-full py-3 rounded-xl bg-[#F4F9FF] border border-[#B9E3FF] text-[#172B49] text-sm font-bold hover:bg-[#E8F4FF] inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('hudRestart')}</span>
              </button>
              <button
                type="button"
                onClick={onExitArena}
                className="w-full py-3 rounded-xl bg-[#FFE0EC] border border-[#FFB8D2] text-[#8C1D4B] text-sm font-bold hover:bg-[#FFD0E2] cursor-pointer"
              >
                {t('hudExitToMenu')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY / DEFEAT MODAL */}
      {finalStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172B49]/55 p-4">
          <div className="w-full max-w-md bg-white border-2 border-[#8CCFFF] rounded-3xl p-7 text-center space-y-5 shadow-xl">
            <Sparkles
              className={`w-10 h-10 mx-auto ${
                finalStats.result === 'victory' ? 'text-[#3478D4]' : 'text-[#E24C85]'
              }`}
            />
            <div>
              <h2
                className={`font-display text-3xl font-extrabold ${
                  finalStats.result === 'victory' ? 'text-[#3478D4]' : 'text-[#E24C85]'
                }`}
              >
                {finalStats.result === 'victory' ? t('hudVictory') : t('hudDefeat')}
              </h2>
              <p className="text-xs text-[#172B49]/70 mt-1">
                {finalStats.result === 'victory' ? t('hudVictoryDesc') : t('hudDefeatDesc')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[#F4F9FF] border border-[#B9E3FF] rounded-2xl p-4 text-center">
              <div>
                <p className="text-[11px] text-[#172B49]/65">{t('hudKda')}</p>
                <p className="font-mono-tabular text-base font-bold text-[#172B49]">
                  {finalStats.kills}/{finalStats.deaths}/{finalStats.assists}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#172B49]/65">{t('hudMatchTime')}</p>
                <p className="font-mono-tabular text-base font-bold text-[#172B49]">
                  {formatClock(finalStats.durationSec)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#172B49]/65">{t('hudTurrets')}</p>
                <p className="font-mono-tabular text-base font-bold text-[#3478D4]">
                  {finalStats.turretsDestroyed}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                data-start="true"
                onClick={() => setMatchKey((k) => k + 1)}
                className="flex-1 py-3 rounded-xl bg-[#3478D4] text-white text-sm font-bold hover:bg-[#2762B5] cursor-pointer"
              >
                {t('hudRestart')}
              </button>
              <button
                type="button"
                onClick={onExitArena}
                className="flex-1 py-3 rounded-xl bg-white border border-[#B9E3FF] text-[#172B49] text-sm font-bold hover:bg-[#F4F9FF] cursor-pointer"
              >
                {t('hudExitToMenu')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
