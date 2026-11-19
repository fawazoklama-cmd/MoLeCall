import Phaser from 'phaser';
import { soundEngine } from '../audio/soundEngine';
import { getHeroById, HEROES } from '../data/heroes';
import { SHOP_ITEMS } from '../data/items';
import { Difficulty, HeroDefinition, LiveMatchStats, ShopItem } from '../types/game';
import { computeBotDecision } from './aiSystem';
import {
  BLUE_BASE,
  BLUE_SPAWN,
  JUNGLE_CAMPS,
  LANE_WAYPOINTS,
  MAP_BUSHES,
  MAP_OBSTACLES,
  RED_BASE,
  RED_SPAWN,
  TURRET_BLUEPRINTS,
  Vec2,
  WORLD_SIZE,
} from './mapData';
import {
  applyExpGain,
  calculateMatchOutcome,
  calculateMitigatedDamage,
  computeHeroEffectiveStats,
  dist2D,
  isoDeltaToWorld,
  isoToWorld,
  resolveObstacleCollision,
  worldToIso,
} from './rules';

export interface MinimapEntity {
  x: number;
  y: number;
  team: 'blue' | 'red' | 'neutral';
  kind: 'player' | 'hero' | 'turret' | 'nexus' | 'monster';
}

export interface HudSnapshot {
  elapsedSec: number;
  blueKills: number;
  redKills: number;
  playerHeroId: string;
  playerLevel: number;
  playerExp: number;
  playerHp: number;
  playerMaxHp: number;
  playerMana: number;
  playerMaxMana: number;
  playerGold: number;
  playerKills: number;
  playerDeaths: number;
  playerAssists: number;
  playerRespawnSec: number;
  playerBuffs: { azure: number; blossom: number };
  isRecalling: boolean;
  recallProgress: number;
  cooldowns: { q: number; e: number; r: number };
  maxCooldowns: { q: number; e: number; r: number };
  items: string[];
  turretsDestroyed: number;
  blueNexusHp: number;
  blueNexusMaxHp: number;
  redNexusHp: number;
  redNexusMaxHp: number;
  minimap: MinimapEntity[];
  status: 'playing' | 'paused' | 'victory' | 'defeat';
}

interface HeroEntity {
  id: string;
  isPlayer: boolean;
  team: 'blue' | 'red';
  lane: 'top' | 'mid' | 'bot';
  def: HeroDefinition;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingAngle: number;
  walkPhase: number;
  attackAnimTimer: number;
  hitFlashTimer: number;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  gold: number;
  kills: number;
  deaths: number;
  assists: number;
  dead: boolean;
  respawnTimer: number;
  attackCooldown: number;
  cdQ: number;
  cdE: number;
  cdR: number;
  recalling: boolean;
  recallTimer: number;
  items: ShopItem[];
  buffAzureTimer: number;
  buffBlossomTimer: number;
  lastDamagedById: string | null;
  lastDamagedTimer: number;
  container: Phaser.GameObjects.Container;
  bodyGraphic: Phaser.GameObjects.Graphics;
  hpBarBg: Phaser.GameObjects.Rectangle;
  hpBarFill: Phaser.GameObjects.Rectangle;
  manaBarFill: Phaser.GameObjects.Rectangle;
  nameText: Phaser.GameObjects.Text;
  recallRing: Phaser.GameObjects.Graphics;
}

interface MinionEntity {
  id: string;
  team: 'blue' | 'red';
  lane: 'top' | 'mid' | 'bot';
  wpIndex: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attackCooldown: number;
  hitFlashTimer: number;
  container: Phaser.GameObjects.Container;
  gfx: Phaser.GameObjects.Graphics;
  hpFill: Phaser.GameObjects.Rectangle;
}

interface TurretEntity {
  id: string;
  team: 'blue' | 'red';
  lane: 'top' | 'mid' | 'bot';
  tier: 1 | 2 | 3;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  destroyed: boolean;
  attackCooldown: number;
  container: Phaser.GameObjects.Container;
  gfx: Phaser.GameObjects.Graphics;
  hpFill: Phaser.GameObjects.Rectangle;
}

interface JungleMonsterEntity {
  id: string;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  isBuff: boolean;
  buffType?: 'azure' | 'blossom';
  hp: number;
  maxHp: number;
  attack: number;
  goldReward: number;
  expReward: number;
  dead: boolean;
  respawnTimer: number;
  attackCooldown: number;
  aggroTargetId: string | null;
  container: Phaser.GameObjects.Container;
  gfx: Phaser.GameObjects.Graphics;
  hpFill: Phaser.GameObjects.Rectangle;
}

interface ProjectileEntity {
  active: boolean;
  ownerId: string;
  team: 'blue' | 'red';
  x: number;
  y: number;
  vx: number;
  vy: number;
  distanceTraveled: number;
  maxRange: number;
  damage: number;
  damageType: 'physical' | 'magic';
  radius: number;
  color: number;
  targetId: string | null;
  gfx: Phaser.GameObjects.Graphics;
}

interface SkillEffectEntity {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  color: number;
  gfx: Phaser.GameObjects.Graphics;
}

export interface SceneConfigPayload {
  playerHeroId: string;
  difficulty: Difficulty;
  mode: 'offline_ai' | 'online_demo' | 'online_5v5';
  cameraSensitivity: number;
  onHudUpdate: (hud: HudSnapshot) => void;
  onMatchEnd: (stats: LiveMatchStats) => void;
}

export class MoLeCallScene extends Phaser.Scene {
  private cfg!: SceneConfigPayload;
  private heroes: HeroEntity[] = [];
  private minions: MinionEntity[] = [];
  private turrets: TurretEntity[] = [];
  private monsters: JungleMonsterEntity[] = [];
  private projectiles: ProjectileEntity[] = [];
  private effects: SkillEffectEntity[] = [];

  private blueNexusHp = 3200;
  private readonly blueNexusMaxHp = 3200;
  private redNexusHp = 3200;
  private readonly redNexusMaxHp = 3200;
  private blueNexusGraphic!: Phaser.GameObjects.Graphics;
  private redNexusGraphic!: Phaser.GameObjects.Graphics;
  private blueNexusHpBar!: Phaser.GameObjects.Rectangle;
  private redNexusHpBar!: Phaser.GameObjects.Rectangle;

  private keysHeld = new Set<string>();
  private virtualJoystick: Vec2 = { x: 0, y: 0 };
  private cameraLocked = true;
  private cameraPanOffset: Vec2 = { x: 0, y: 0 };
  private aimWorld: Vec2 = { x: 1200, y: 1200 };

  private paused = false;
  private matchOutcome: 'playing' | 'victory' | 'defeat' = 'playing';
  private elapsedSec = 0;
  private minionWaveTimer = 2; // Spawn first wave quickly!
  private hudEmitTimer = 0;
  private hitstopTimer = 0;
  private trauma = 0;
  private blueKills = 0;
  private redKills = 0;
  private idCounter = 0;

  constructor() {
    super('MoLeCallScene');
  }

  public init(data: SceneConfigPayload) {
    this.cfg = data;
  }

  public create() {
    this.resetMatchState();
    this.drawKingdomOfAetheria();
    this.spawnTurretsAndNexuses();
    this.spawnJungleMonsters();
    this.spawnTeams();
    this.initProjectilePool();
    this.setupInputs();

    const player = this.getPlayerHero();
    if (player) {
      const iso = worldToIso(player.x, player.y);
      this.cameras.main.centerOn(iso.x, iso.y);
    }

    this.emitHud();
  }

  private resetMatchState() {
    this.heroes = [];
    this.minions = [];
    this.turrets = [];
    this.monsters = [];
    this.projectiles = [];
    this.effects = [];
    this.blueNexusHp = this.blueNexusMaxHp;
    this.redNexusHp = this.redNexusMaxHp;
    this.paused = false;
    this.matchOutcome = 'playing';
    this.elapsedSec = 0;
    this.minionWaveTimer = 1.5;
    this.hudEmitTimer = 0;
    this.hitstopTimer = 0;
    this.trauma = 0;
    this.blueKills = 0;
    this.redKills = 0;
    this.keysHeld.clear();
    this.virtualJoystick = { x: 0, y: 0 };
  }

  private drawKingdomOfAetheria() {
    const g = this.add.graphics();
    g.setDepth(-1000);

    // Sky-meadow diamond ground + floating island cliff rim
    const cTL = worldToIso(0, 0);
    const cTR = worldToIso(WORLD_SIZE, 0);
    const cBR = worldToIso(WORLD_SIZE, WORLD_SIZE);
    const cBL = worldToIso(0, WORLD_SIZE);

    // Decorative outer floating sky clouds around island perimeter
    const cloudSpots: Array<[number, number, number]> = [
      [-180, 2200, 140],
      [-220, 1850, 110],
      [150, 2560, 150],
      [520, 2580, 120],
      [2180, -160, 150],
      [2520, 240, 130],
      [2580, 620, 115],
      [-160, 480, 135],
    ];
    for (const [cx, cy, cr] of cloudSpots) {
      const ci = worldToIso(cx, cy);
      g.fillStyle(0xffffff, 0.72);
      g.fillEllipse(ci.x, ci.y, cr * 2.1, cr * 1.15);
      g.fillStyle(0xffe0ec, 0.45);
      g.fillEllipse(ci.x + cr * 0.35, ci.y + 8, cr * 1.2, cr * 0.7);
    }

    // Floating sky-island cliff underside beneath front edges (TL->BL->BR and TL->TR->BR)
    const cliffDepth = 88;
    g.fillStyle(0x9fc8ef, 1);
    g.beginPath();
    g.moveTo(cTL.x, cTL.y);
    g.lineTo(cBL.x, cBL.y);
    g.lineTo(cBL.x, cBL.y + cliffDepth);
    g.lineTo(cTL.x, cTL.y + cliffDepth);
    g.closePath();
    g.fillPath();

    g.fillStyle(0x7fb4e6, 1);
    g.beginPath();
    g.moveTo(cBL.x, cBL.y);
    g.lineTo(cBR.x, cBR.y);
    g.lineTo(cBR.x, cBR.y + cliffDepth);
    g.lineTo(cBL.x, cBL.y + cliffDepth);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xdcf0ff, 1);
    g.beginPath();
    g.moveTo(cTL.x, cTL.y);
    g.lineTo(cTR.x, cTR.y);
    g.lineTo(cBR.x, cBR.y);
    g.lineTo(cBL.x, cBL.y);
    g.closePath();
    g.fillPath();

    // Subtle isometric meadow grid lines
    g.lineStyle(1, 0xbbe0ff, 0.45);
    for (let step = 200; step < WORLD_SIZE; step += 200) {
      const a = worldToIso(step, 0);
      const b = worldToIso(step, WORLD_SIZE);
      g.lineBetween(a.x, a.y, b.x, b.y);
      const c = worldToIso(0, step);
      const d = worldToIso(WORLD_SIZE, step);
      g.lineBetween(c.x, c.y, d.x, d.y);
    }

    // Castle outer border trim
    g.lineStyle(12, 0x8ccfff, 0.9);
    g.beginPath();
    g.moveTo(cTL.x, cTL.y);
    g.lineTo(cTR.x, cTR.y);
    g.lineTo(cBR.x, cBR.y);
    g.lineTo(cBL.x, cBL.y);
    g.closePath();
    g.strokePath();

    // Draw 3 Stone Lanes
    const drawLaneStrip = (pts: Vec2[], width: number, color: number) => {
      g.lineStyle(width, color, 0.95);
      g.beginPath();
      pts.forEach((p, idx) => {
        const iso = worldToIso(p.x, p.y);
        if (idx === 0) g.moveTo(iso.x, iso.y);
        else g.lineTo(iso.x, iso.y);
      });
      g.strokePath();
    };

    drawLaneStrip(LANE_WAYPOINTS.top, 118, 0xc3dff8);
    drawLaneStrip(LANE_WAYPOINTS.top, 96, 0xf2f7ff);
    drawLaneStrip(LANE_WAYPOINTS.bot, 118, 0xc3dff8);
    drawLaneStrip(LANE_WAYPOINTS.bot, 96, 0xf2f7ff);
    drawLaneStrip(LANE_WAYPOINTS.mid, 120, 0xc3dff8);
    drawLaneStrip(LANE_WAYPOINTS.mid, 98, 0xf2f7ff);

    // Magical River running diagonally from top-left (300, 300) to bottom-right (2100, 2100)
    const rStart = worldToIso(320, 320);
    const rEnd = worldToIso(2080, 2080);
    g.lineStyle(106, 0x8cd5ff, 0.65);
    g.lineBetween(rStart.x, rStart.y, rEnd.x, rEnd.y);
    g.lineStyle(72, 0x5ab7fa, 0.72);
    g.lineBetween(rStart.x, rStart.y, rEnd.x, rEnd.y);
    g.lineStyle(18, 0xe8f8ff, 0.5);
    g.lineBetween(rStart.x, rStart.y, rEnd.x, rEnd.y);

    // Base platforms (Blue & Red)
    const blueIso = worldToIso(BLUE_BASE.x, BLUE_BASE.y);
    g.fillStyle(0xb9e3ff, 0.9);
    g.fillEllipse(blueIso.x, blueIso.y, 330, 210);
    g.lineStyle(4, 0x3478d4, 0.9);
    g.strokeEllipse(blueIso.x, blueIso.y, 330, 210);

    const redIso = worldToIso(RED_BASE.x, RED_BASE.y);
    g.fillStyle(0xffe0ec, 0.92);
    g.fillEllipse(redIso.x, redIso.y, 330, 210);
    g.lineStyle(4, 0xe85f93, 0.9);
    g.strokeEllipse(redIso.x, redIso.y, 330, 210);

    // Bushes (Stealth zones)
    for (const bush of MAP_BUSHES) {
      const iso = worldToIso(bush.x, bush.y);
      const bg = this.add.graphics();
      bg.setDepth(iso.y - 4);
      bg.fillStyle(0x9ed8c4, 0.72);
      bg.fillEllipse(iso.x, iso.y, bush.r * 1.9, bush.r * 1.15);
      bg.fillStyle(0xffb8d2, 0.78);
      bg.fillCircle(iso.x - 16, iso.y - 6, 12);
      bg.fillCircle(iso.x + 18, iso.y - 4, 10);
      bg.fillCircle(iso.x + 2, iso.y + 8, 9);
    }

    // 2.5D Extruded Castle Pillars & Shrines
    for (const obs of MAP_OBSTACLES) {
      const p1 = worldToIso(obs.x, obs.y);
      const p2 = worldToIso(obs.x + obs.w, obs.y);
      const p3 = worldToIso(obs.x + obs.w, obs.y + obs.h);
      const p4 = worldToIso(obs.x, obs.y + obs.h);
      const wallH = obs.kind === 'shrine' ? 42 : 34;

      const og = this.add.graphics();
      og.setDepth((p1.y + p3.y) * 0.5);

      // Side face 1
      og.fillStyle(0xadc8e6, 1);
      og.beginPath();
      og.moveTo(p4.x, p4.y);
      og.lineTo(p3.x, p3.y);
      og.lineTo(p3.x, p3.y - wallH);
      og.lineTo(p4.x, p4.y - wallH);
      og.closePath();
      og.fillPath();

      // Side face 2
      og.fillStyle(0xc6def7, 1);
      og.beginPath();
      og.moveTo(p3.x, p3.y);
      og.lineTo(p2.x, p2.y);
      og.lineTo(p2.x, p2.y - wallH);
      og.lineTo(p3.x, p3.y - wallH);
      og.closePath();
      og.fillPath();

      // Top marble cap
      og.fillStyle(obs.kind === 'shrine' ? 0xffe4ef : 0xf7fbff, 1);
      og.lineStyle(2, 0x8ccfff, 0.9);
      og.beginPath();
      og.moveTo(p1.x, p1.y - wallH);
      og.lineTo(p2.x, p2.y - wallH);
      og.lineTo(p3.x, p3.y - wallH);
      og.lineTo(p4.x, p4.y - wallH);
      og.closePath();
      og.fillPath();
      og.strokePath();
    }
  }

  private spawnTurretsAndNexuses() {
    // Blue Nexus
    const bIso = worldToIso(BLUE_BASE.x, BLUE_BASE.y);
    this.blueNexusGraphic = this.add.graphics();
    this.blueNexusGraphic.setDepth(bIso.y + 10);
    this.drawNexus(this.blueNexusGraphic, bIso.x, bIso.y, 0x3478d4, 0x8ccfff);
    this.add.rectangle(bIso.x, bIso.y - 90, 96, 10, 0x172b49, 0.75).setDepth(bIso.y + 50);
    this.blueNexusHpBar = this.add.rectangle(bIso.x - 46, bIso.y - 90, 92, 6, 0x5eb6ff).setOrigin(0, 0.5).setDepth(bIso.y + 51);

    // Red Nexus
    const rIso = worldToIso(RED_BASE.x, RED_BASE.y);
    this.redNexusGraphic = this.add.graphics();
    this.redNexusGraphic.setDepth(rIso.y + 10);
    this.drawNexus(this.redNexusGraphic, rIso.x, rIso.y, 0xe24c85, 0xffb8d2);
    this.add.rectangle(rIso.x, rIso.y - 90, 96, 10, 0x172b49, 0.75).setDepth(rIso.y + 50);
    this.redNexusHpBar = this.add.rectangle(rIso.x - 46, rIso.y - 90, 92, 6, 0xff6b9e).setOrigin(0, 0.5).setDepth(rIso.y + 51);

    // 18 Turrets
    for (const bp of TURRET_BLUEPRINTS) {
      const iso = worldToIso(bp.x, bp.y);
      const container = this.add.container(iso.x, iso.y);
      container.setDepth(iso.y);
      const gfx = this.add.graphics();
      const maxHp = bp.tier === 3 ? 1800 : bp.tier === 2 ? 1500 : 1250;
      this.drawTurretGraphic(gfx, bp.team, false);
      const bg = this.add.rectangle(0, -68, 54, 7, 0x172b49, 0.8);
      const hpFill = this.add.rectangle(-25, -68, 50, 5, bp.team === 'blue' ? 0x5eb6ff : 0xff77a8).setOrigin(0, 0.5);
      container.add([gfx, bg, hpFill]);

      this.turrets.push({
        id: bp.id,
        team: bp.team,
        lane: bp.lane,
        tier: bp.tier,
        x: bp.x,
        y: bp.y,
        hp: maxHp,
        maxHp,
        destroyed: false,
        attackCooldown: 0,
        container,
        gfx,
        hpFill,
      });
    }
  }

  private drawNexus(g: Phaser.GameObjects.Graphics, x: number, y: number, coreColor: number, glowColor: number) {
    g.clear();
    g.fillStyle(0x172b49, 0.18);
    g.fillEllipse(x, y + 6, 92, 46);
    g.fillStyle(0xf8fbff, 1);
    g.lineStyle(3, coreColor, 1);
    g.fillRoundedRect(x - 30, y - 34, 60, 38, 10);
    g.strokeRoundedRect(x - 30, y - 34, 60, 38, 10);

    // Floating crystal spire
    g.fillStyle(glowColor, 0.9);
    g.fillTriangle(x, y - 82, x - 22, y - 34, x + 22, y - 34);
    g.fillStyle(coreColor, 0.95);
    g.fillTriangle(x, y - 82, x, y - 34, x + 22, y - 34);
  }

  private drawTurretGraphic(gfx: Phaser.GameObjects.Graphics, team: 'blue' | 'red', destroyed: boolean) {
    gfx.clear();
    if (destroyed) {
      gfx.fillStyle(0x9fb4cc, 0.7);
      gfx.fillEllipse(0, 0, 44, 24);
      return;
    }
    const accent = team === 'blue' ? 0x3478d4 : 0xe24c85;
    const gem = team === 'blue' ? 0x8ccfff : 0xffb8d2;
    gfx.fillStyle(0x172b49, 0.18);
    gfx.fillEllipse(0, 4, 52, 26);
    gfx.fillStyle(0xf2f7ff, 1);
    gfx.lineStyle(2, accent, 1);
    gfx.fillRoundedRect(-16, -42, 32, 42, 6);
    gfx.strokeRoundedRect(-16, -42, 32, 42, 6);
    gfx.fillStyle(gem, 1);
    gfx.fillCircle(0, -50, 11);
    gfx.lineStyle(2, accent, 1);
    gfx.strokeCircle(0, -50, 11);
  }

  private spawnJungleMonsters() {
    for (const camp of JUNGLE_CAMPS) {
      const iso = worldToIso(camp.x, camp.y);
      const container = this.add.container(iso.x, iso.y);
      container.setDepth(iso.y);
      const gfx = this.add.graphics();
      this.drawMonsterGraphic(gfx, camp.isBuff, camp.buffType);
      const bg = this.add.rectangle(0, -44, 46, 6, 0x172b49, 0.75);
      const hpFill = this.add.rectangle(-21, -44, 42, 4, 0xf6b95c).setOrigin(0, 0.5);
      container.add([gfx, bg, hpFill]);

      this.monsters.push({
        id: camp.id,
        x: camp.x,
        y: camp.y,
        homeX: camp.x,
        homeY: camp.y,
        isBuff: camp.isBuff,
        buffType: camp.buffType,
        hp: camp.maxHp,
        maxHp: camp.maxHp,
        attack: camp.attack,
        goldReward: camp.goldReward,
        expReward: camp.expReward,
        dead: false,
        respawnTimer: 0,
        attackCooldown: 0,
        aggroTargetId: null,
        container,
        gfx,
        hpFill,
      });
    }
  }

  private drawMonsterGraphic(gfx: Phaser.GameObjects.Graphics, isBuff: boolean, buffType?: 'azure' | 'blossom') {
    gfx.clear();
    const size = isBuff ? 20 : 14;
    const color = buffType === 'blossom' ? 0xff94be : buffType === 'azure' ? 0x5eb6ff : 0x7bc2e8;
    gfx.fillStyle(0x172b49, 0.2);
    gfx.fillEllipse(0, 4, size * 2, size * 1.1);
    gfx.fillStyle(color, 1);
    gfx.lineStyle(2, 0x172b49, 0.85);
    gfx.fillCircle(0, -14, size);
    gfx.strokeCircle(0, -14, size);
    gfx.fillStyle(0xffffff, 0.9);
    gfx.fillCircle(-5, -17, 3);
    gfx.fillCircle(5, -17, 3);
  }

  private spawnTeams() {
    const playerDef = getHeroById(this.cfg.playerHeroId);
    const otherHeroes = HEROES.filter((h) => h.id !== playerDef.id);

    const blueRoster = [playerDef, otherHeroes[0], otherHeroes[1], otherHeroes[2], otherHeroes[3]];
    const redRoster = [otherHeroes[4], otherHeroes[5], otherHeroes[6], otherHeroes[7], otherHeroes[8]];
    const lanes: Array<'top' | 'mid' | 'bot'> = ['mid', 'top', 'bot', 'mid', 'bot'];

    const blueOffsets: Array<[number, number]> = [
      [0, 0],
      [-85, -85],
      [85, 85],
      [-50, -155],
      [155, 50],
    ];
    blueRoster.forEach((def, idx) => {
      const [ox, oy] = blueOffsets[idx] || [0, 0];
      this.createHeroEntity(def, 'blue', idx === 0, lanes[idx], BLUE_SPAWN.x + ox, BLUE_SPAWN.y + oy);
    });

    redRoster.forEach((def, idx) => {
      const [ox, oy] = blueOffsets[idx] || [0, 0];
      this.createHeroEntity(def, 'red', false, lanes[idx], RED_SPAWN.x - ox, RED_SPAWN.y - oy);
    });
  }

  private createHeroEntity(
    def: HeroDefinition,
    team: 'blue' | 'red',
    isPlayer: boolean,
    lane: 'top' | 'mid' | 'bot',
    x: number,
    y: number
  ) {
    const iso = worldToIso(x, y);
    const container = this.add.container(iso.x, iso.y);
    container.setDepth(iso.y);

    const recallRing = this.add.graphics();
    const bodyGraphic = this.add.graphics();
    const hpBarBg = this.add.rectangle(0, -56, 54, 9, 0x172b49, 0.85);
    const hpBarFill = this.add
      .rectangle(-25, -57.5, 50, 4, isPlayer ? 0x38d399 : team === 'blue' ? 0x5eb6ff : 0xff6b9e)
      .setOrigin(0, 0.5);
    const manaBarFill = this.add.rectangle(-25, -53, 50, 2.5, 0x8ccfff).setOrigin(0, 0.5);
    const nameText = this.add
      .text(0, -70, isPlayer ? `${def.name} (YOU)` : def.name, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: isPlayer ? '#172B49' : team === 'blue' ? '#2458A6' : '#B52E63',
        stroke: '#FFFFFF',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    container.add([recallRing, bodyGraphic, hpBarBg, hpBarFill, manaBarFill, nameText]);

    const entity: HeroEntity = {
      id: `${team}_${def.id}_${this.idCounter++}`,
      isPlayer,
      team,
      lane,
      def,
      x,
      y,
      vx: 0,
      vy: 0,
      facingAngle: team === 'blue' ? -Math.PI / 4 : (3 * Math.PI) / 4,
      walkPhase: 0,
      attackAnimTimer: 0,
      hitFlashTimer: 0,
      level: 1,
      exp: 0,
      hp: def.stats.maxHp,
      maxHp: def.stats.maxHp,
      mana: def.stats.maxMana,
      maxMana: def.stats.maxMana,
      gold: 500,
      kills: 0,
      deaths: 0,
      assists: 0,
      dead: false,
      respawnTimer: 0,
      attackCooldown: 0,
      cdQ: 0,
      cdE: 0,
      cdR: 0,
      recalling: false,
      recallTimer: 0,
      items: [],
      buffAzureTimer: 0,
      buffBlossomTimer: 0,
      lastDamagedById: null,
      lastDamagedTimer: 0,
      container,
      bodyGraphic,
      hpBarBg,
      hpBarFill,
      manaBarFill,
      nameText,
      recallRing,
    };

    this.drawHeroSprite(entity);
    this.heroes.push(entity);
  }

  private drawHeroSprite(hero: HeroEntity) {
    const g = hero.bodyGraphic;
    g.clear();
    if (hero.dead) return;

    const primary = Phaser.Display.Color.HexStringToColor(hero.def.palette.primary).color;
    const accent = Phaser.Display.Color.HexStringToColor(hero.def.palette.accent).color;
    const teamRing = hero.team === 'blue' ? 0x3478d4 : 0xe24c85;
    const bob = Math.sin(hero.walkPhase) * 2.5;
    const lunge = hero.attackAnimTimer > 0 ? 4 : 0;

    // Ground selection ring & shadow
    g.lineStyle(hero.isPlayer ? 3 : 2, hero.isPlayer ? 0xffb8d2 : teamRing, 0.9);
    g.strokeEllipse(0, 3, 38, 20);
    g.fillStyle(0x172b49, 0.2);
    g.fillEllipse(0, 4, 34, 16);

    const flash = hero.hitFlashTimer > 0;
    const bodyCol = flash ? 0xffffff : primary;
    const accCol = flash ? 0xffffff : accent;

    // Cloak / Torso
    g.fillStyle(bodyCol, 1);
    g.lineStyle(2, 0x172b49, 0.9);
    g.fillRoundedRect(-12 + Math.cos(hero.facingAngle) * lunge, -28 + bob, 24, 24, 9);
    g.strokeRoundedRect(-12 + Math.cos(hero.facingAngle) * lunge, -28 + bob, 24, 24, 9);

    // Shoulder / Emblem trim
    g.fillStyle(accCol, 1);
    g.fillCircle(-8 + Math.cos(hero.facingAngle) * lunge, -24 + bob, 4.5);
    g.fillCircle(8 + Math.cos(hero.facingAngle) * lunge, -24 + bob, 4.5);

    // Head
    g.fillStyle(flash ? 0xffffff : 0xfff2ea, 1);
    g.fillCircle(Math.cos(hero.facingAngle) * lunge, -34 + bob, 9.5);
    g.strokeCircle(Math.cos(hero.facingAngle) * lunge, -34 + bob, 9.5);

    // Crown / Hair crest
    g.fillStyle(bodyCol, 1);
    g.fillTriangle(
      -8 + Math.cos(hero.facingAngle) * lunge,
      -40 + bob,
      0 + Math.cos(hero.facingAngle) * lunge,
      -48 + bob,
      8 + Math.cos(hero.facingAngle) * lunge,
      -40 + bob
    );

    // Weapon direction indicator
    const wx = Math.cos(hero.facingAngle) * (16 + lunge);
    const wy = -20 + Math.sin(hero.facingAngle) * 10 + bob;
    g.fillStyle(accCol, 1);
    g.fillCircle(wx, wy, 5);
  }

  private initProjectilePool() {
    for (let i = 0; i < 48; i++) {
      const gfx = this.add.graphics();
      gfx.setVisible(false);
      this.projectiles.push({
        active: false,
        ownerId: '',
        team: 'blue',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        distanceTraveled: 0,
        maxRange: 300,
        damage: 50,
        damageType: 'physical',
        radius: 18,
        color: 0x5eb6ff,
        targetId: null,
        gfx,
      });
    }
  }

  private setupInputs() {
    const keyListener = (e: KeyboardEvent, down: boolean) => {
      if (this.matchOutcome !== 'playing') return;
      const code = e.code;
      if (down) {
        this.keysHeld.add(code);
        if (code === 'KeyQ') this.triggerPlayerSkill('Q');
        else if (code === 'KeyE') this.triggerPlayerSkill('E');
        else if (code === 'KeyR') this.triggerPlayerSkill('R');
        else if (code === 'KeyB') this.triggerPlayerRecall();
        else if (code === 'Space') {
          e.preventDefault();
          this.centerCameraOnPlayer();
        }
      } else {
        this.keysHeld.delete(code);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => keyListener(e, true);
    const onKeyUp = (e: KeyboardEvent) => keyListener(e, false);
    const onBlur = () => {
      this.keysHeld.clear();
      this.virtualJoystick = { x: 0, y: 0 };
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.aimWorld = isoToWorld(wp.x, wp.y);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.paused || this.matchOutcome !== 'playing') return;
      const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.aimWorld = isoToWorld(wp.x, wp.y);
      this.triggerPlayerBasicAttack();
    });
  }

  // External controls for React HUD / Mobile Touch
  public setVirtualJoystick(x: number, y: number) {
    this.virtualJoystick = { x, y };
  }

  public setPausedState(paused: boolean) {
    this.paused = paused;
    this.emitHud();
  }

  public centerCameraOnPlayer() {
    this.cameraLocked = true;
    this.cameraPanOffset = { x: 0, y: 0 };
    const p = this.getPlayerHero();
    if (p) {
      const iso = worldToIso(p.x, p.y);
      this.cameras.main.centerOn(iso.x, iso.y);
    }
  }

  public triggerPlayerBasicAttack() {
    const p = this.getPlayerHero();
    if (!p || p.dead || this.paused || this.matchOutcome !== 'playing') return;
    if (p.attackCooldown > 0) return;

    p.recalling = false;
    const stats = computeHeroEffectiveStats(p.def, p.level, p.items);
    const targets = this.gatherHostileTargetsFor('blue');

    // Find closest enemy near cursor or within attack range
    let chosen: { id: string; x: number; y: number; kind: string } | null = null;
    let bestScore = Infinity;
    for (const t of targets) {
      const dHero = dist2D(p, t);
      if (dHero <= stats.attackRange + 55) {
        const dAim = dist2D(this.aimWorld, t);
        const score = dAim * 0.7 + dHero * 0.3;
        if (score < bestScore) {
          bestScore = score;
          chosen = t;
        }
      }
    }

    if (chosen) {
      p.facingAngle = Math.atan2(chosen.y - p.y, chosen.x - p.x);
      this.executeBasicAttack(p, chosen.id, chosen.x, chosen.y);
    } else {
      // Attack toward aim cursor
      p.facingAngle = Math.atan2(this.aimWorld.y - p.y, this.aimWorld.x - p.x);
      this.executeBasicAttack(p, null, this.aimWorld.x, this.aimWorld.y);
    }
  }

  public triggerPlayerSkill(slot: 'Q' | 'E' | 'R') {
    const p = this.getPlayerHero();
    if (!p || p.dead || this.paused || this.matchOutcome !== 'playing') return;
    p.recalling = false;
    this.executeSkill(p, slot, this.aimWorld);
  }

  public triggerPlayerRecall() {
    const p = this.getPlayerHero();
    if (!p || p.dead || this.paused || this.matchOutcome !== 'playing') return;
    if (!p.recalling) {
      p.recalling = true;
      p.recallTimer = 3.2;
      soundEngine.playRecall();
    }
  }

  public buyItemForPlayer(itemId: string): { ok: boolean; reason?: 'gold' | 'full' | 'not_found' } {
    const p = this.getPlayerHero();
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!p || !item) return { ok: false, reason: 'not_found' };
    if (p.items.length >= 6) return { ok: false, reason: 'full' };
    if (p.gold < item.cost) return { ok: false, reason: 'gold' };

    p.gold -= item.cost;
    p.items.push(item);
    const prevMax = p.maxHp;
    const nextStats = computeHeroEffectiveStats(p.def, p.level, p.items);
    p.maxHp = nextStats.maxHp;
    p.maxMana = nextStats.maxMana;
    p.hp = Math.min(p.maxHp, p.hp + Math.max(0, p.maxHp - prevMax));
    soundEngine.playClick();
    this.emitHud();
    return { ok: true };
  }

  private getPlayerHero(): HeroEntity | undefined {
    return this.heroes.find((h) => h.isPlayer);
  }

  public update(_time: number, rawDeltaMs: number) {
    if (this.paused || this.matchOutcome !== 'playing') return;

    const rawDt = Math.min(rawDeltaMs / 1000, 0.05);
    if (this.hitstopTimer > 0) {
      this.hitstopTimer = Math.max(0, this.hitstopTimer - rawDt);
      this.updateCameraEffects(rawDt);
      return;
    }

    const dt = rawDt;
    this.elapsedSec += dt;

    // Wave spawning
    this.minionWaveTimer -= dt;
    if (this.minionWaveTimer <= 0) {
      this.spawnMinionWave();
      this.minionWaveTimer = 18;
    }

    // Update Heroes
    for (const hero of this.heroes) {
      this.updateHero(hero, dt);
    }

    // Update Minions
    this.updateMinions(dt);

    // Update Turrets
    this.updateTurrets(dt);

    // Update Jungle Monsters
    this.updateJungleMonsters(dt);

    // Update Projectiles & Effects
    this.updateProjectiles(dt);
    this.updateEffects(dt);

    // Camera follow
    this.updateCameraEffects(dt);

    // Check Victory / Defeat
    const outcome = calculateMatchOutcome({
      blueNexusHp: this.blueNexusHp,
      redNexusHp: this.redNexusHp,
    });
    if (outcome !== 'playing') {
      this.finishMatch(outcome);
      return;
    }

    this.hudEmitTimer += dt;
    if (this.hudEmitTimer >= 0.1) {
      this.hudEmitTimer = 0;
      this.emitHud();
    }
  }

  private updateHero(hero: HeroEntity, dt: number) {
    if (hero.dead) {
      hero.respawnTimer -= dt;
      if (hero.respawnTimer <= 0) {
        hero.dead = false;
        hero.hp = hero.maxHp;
        hero.mana = hero.maxMana;
        const spawn = hero.team === 'blue' ? BLUE_SPAWN : RED_SPAWN;
        hero.x = spawn.x;
        hero.y = spawn.y;
        hero.container.setVisible(true);
      }
      return;
    }

    hero.attackCooldown = Math.max(0, hero.attackCooldown - dt);
    hero.cdQ = Math.max(0, hero.cdQ - dt);
    hero.cdE = Math.max(0, hero.cdE - dt);
    hero.cdR = Math.max(0, hero.cdR - dt);
    hero.attackAnimTimer = Math.max(0, hero.attackAnimTimer - dt);
    hero.hitFlashTimer = Math.max(0, hero.hitFlashTimer - dt);
    hero.buffAzureTimer = Math.max(0, hero.buffAzureTimer - dt);
    hero.buffBlossomTimer = Math.max(0, hero.buffBlossomTimer - dt);
    if (hero.lastDamagedTimer > 0) {
      hero.lastDamagedTimer -= dt;
      if (hero.lastDamagedTimer <= 0) hero.lastDamagedById = null;
    }

    // Passive gold + base fountain regen
    hero.gold += dt * 4;
    const home = hero.team === 'blue' ? BLUE_BASE : RED_BASE;
    if (dist2D(hero, home) < 230) {
      hero.hp = Math.min(hero.maxHp, hero.hp + dt * 150);
      hero.mana = Math.min(hero.maxMana, hero.mana + dt * 95);
    } else {
      hero.hp = Math.min(hero.maxHp, hero.hp + dt * 3.5);
      hero.mana = Math.min(hero.maxMana, hero.mana + dt * (hero.buffAzureTimer > 0 ? 18 : 6));
    }

    const stats = computeHeroEffectiveStats(hero.def, hero.level, hero.items);
    let moveVec: Vec2 = { x: 0, y: 0 };

    if (hero.isPlayer) {
      let sx = this.virtualJoystick.x;
      let sy = this.virtualJoystick.y;
      if (this.keysHeld.has('KeyA') || this.keysHeld.has('ArrowLeft')) sx -= 1;
      if (this.keysHeld.has('KeyD') || this.keysHeld.has('ArrowRight')) sx += 1;
      if (this.keysHeld.has('KeyW') || this.keysHeld.has('ArrowUp')) sy -= 1;
      if (this.keysHeld.has('KeyS') || this.keysHeld.has('ArrowDown')) sy += 1;

      if (Math.hypot(sx, sy) > 0.05) {
        const wd = isoDeltaToWorld(sx, sy);
        const len = Math.hypot(wd.x, wd.y);
        moveVec = { x: wd.x / len, y: wd.y / len };
        hero.recalling = false;
      }
    } else {
      // AI Bot Brain
      const enemies = this.gatherHostileTargetsFor(hero.team);
      const allies = this.heroes
        .filter((h) => h.team === hero.team && !h.dead)
        .map((h) => ({ id: h.id, team: h.team, kind: 'hero' as const, x: h.x, y: h.y, hp: h.hp, maxHp: h.maxHp }));
      const decision = computeBotDecision(
        {
          id: hero.id,
          team: hero.team,
          role: hero.def.role,
          lane: hero.lane,
          x: hero.x,
          y: hero.y,
          hp: hero.hp,
          maxHp: hero.maxHp,
          mana: hero.mana,
          attackRange: stats.attackRange,
          dead: hero.dead,
          qReady: hero.cdQ <= 0 && hero.mana >= hero.def.abilities.q.manaCost,
          eReady: hero.cdE <= 0 && hero.mana >= hero.def.abilities.e.manaCost,
          rReady: hero.cdR <= 0 && hero.mana >= hero.def.abilities.r.manaCost,
        },
        enemies,
        allies,
        this.cfg.difficulty,
        this.elapsedSec
      );

      if (decision.recalling && !hero.recalling) {
        hero.recalling = true;
        hero.recallTimer = 3.2;
      }
      if (!hero.recalling) {
        moveVec = decision.moveDir;
        if (decision.castSkill) {
          this.executeSkill(hero, decision.castSkill, decision.aimPos);
        } else if (decision.attackTargetId && hero.attackCooldown <= 0) {
          const target = enemies.find((t) => t.id === decision.attackTargetId);
          if (target) {
            hero.facingAngle = Math.atan2(target.y - hero.y, target.x - hero.x);
            this.executeBasicAttack(hero, target.id, target.x, target.y);
          }
        }
      }
    }

    // Recall channel
    if (hero.recalling) {
      hero.recallTimer -= dt;
      hero.recallRing.clear();
      const isoProgress = 1 - Math.max(0, hero.recallTimer / 3.2);
      hero.recallRing.lineStyle(3, 0x8ccfff, 0.9);
      hero.recallRing.strokeEllipse(0, 2, 48 * (1 - isoProgress * 0.2), 26 * (1 - isoProgress * 0.2));
      if (hero.recallTimer <= 0) {
        hero.recalling = false;
        hero.recallRing.clear();
        const spawn = hero.team === 'blue' ? BLUE_SPAWN : RED_SPAWN;
        hero.x = spawn.x;
        hero.y = spawn.y;
      }
    } else {
      hero.recallRing.clear();
    }

    // Apply movement + collision
    if (Math.hypot(moveVec.x, moveVec.y) > 0.01) {
      const speed = stats.moveSpeed * (hero.buffBlossomTimer > 0 ? 1.15 : 1);
      const next = resolveObstacleCollision(
        { x: hero.x + moveVec.x * speed * dt, y: hero.y + moveVec.y * speed * dt },
        24
      );
      hero.x = next.x;
      hero.y = next.y;
      hero.facingAngle = Math.atan2(moveVec.y, moveVec.x);
      hero.walkPhase += dt * 12;
    }

    // Update Phaser display coords
    const iso = worldToIso(hero.x, hero.y);
    hero.container.setPosition(iso.x, iso.y);
    hero.container.setDepth(iso.y + 4);
    hero.hpBarFill.width = Math.max(0, 50 * (hero.hp / hero.maxHp));
    hero.manaBarFill.width = Math.max(0, 50 * (hero.mana / hero.maxMana));
    this.drawHeroSprite(hero);
  }

  private executeBasicAttack(hero: HeroEntity, targetId: string | null, aimX: number, aimY: number) {
    const stats = computeHeroEffectiveStats(hero.def, hero.level, hero.items);
    hero.attackCooldown = 1 / Math.max(0.5, stats.attackSpeed);
    hero.attackAnimTimer = 0.14;
    if (hero.isPlayer) soundEngine.playBasicAttack();

    const bonusAtk = hero.buffBlossomTimer > 0 ? 18 : 0;
    const dmg = stats.attack + bonusAtk;

    if (stats.attackRange <= 135) {
      // Melee cleave arc
      const targets = this.gatherHostileTargetsFor(hero.team);
      let hitSomething = false;
      for (const t of targets) {
        if (dist2D(hero, t) <= stats.attackRange + 36) {
          this.applyDamageToTarget(t.id, dmg, 'physical', hero);
          hitSomething = true;
          if (stats.lifestealPct > 0) {
            hero.hp = Math.min(hero.maxHp, hero.hp + dmg * (stats.lifestealPct / 100));
          }
          break;
        }
      }
      if (!hitSomething && hero.isPlayer) {
        this.spawnEffect(hero.x + Math.cos(hero.facingAngle) * 45, hero.y + Math.sin(hero.facingAngle) * 45, 42, 0x8ccfff, 0.16);
      }
    } else {
      // Ranged projectile
      this.spawnProjectile(
        hero.id,
        hero.team,
        hero.x,
        hero.y,
        aimX,
        aimY,
        620,
        stats.attackRange + 40,
        dmg,
        'physical',
        hero.team === 'blue' ? 0x5eb6ff : 0xff77a8,
        targetId
      );
    }
  }

  private executeSkill(hero: HeroEntity, slot: 'Q' | 'E' | 'R', aimPos: Vec2) {
    const ab = slot === 'Q' ? hero.def.abilities.q : slot === 'E' ? hero.def.abilities.e : hero.def.abilities.r;
    const cdProp = slot === 'Q' ? 'cdQ' : slot === 'E' ? 'cdE' : 'cdR';
    if (hero[cdProp] > 0 || hero.mana < ab.manaCost) return;

    const stats = computeHeroEffectiveStats(hero.def, hero.level, hero.items);
    const cdrMult = 1 - stats.cooldownReductionPct / 100;
    const buffCdr = hero.buffAzureTimer > 0 ? 0.85 : 1;

    hero.mana -= ab.manaCost;
    hero[cdProp] = ab.cooldownSec * cdrMult * buffCdr;
    hero.attackAnimTimer = 0.2;
    hero.facingAngle = Math.atan2(aimPos.y - hero.y, aimPos.x - hero.x);

    if (hero.isPlayer) soundEngine.playSkill(slot);

    const scalingBase =
      ab.scalingStat === 'magic' ? stats.magicPower : ab.scalingStat === 'attack' ? stats.attack : stats.maxHp;
    const totalDmg = ab.baseDamage + scalingBase * ab.scalingRatio;
    const dmgType: 'physical' | 'magic' = ab.scalingStat === 'magic' ? 'magic' : 'physical';
    const colorNum = Phaser.Display.Color.HexStringToColor(ab.colorHex).color;

    if (ab.kind === 'projectile') {
      this.spawnProjectile(
        hero.id,
        hero.team,
        hero.x,
        hero.y,
        aimPos.x,
        aimPos.y,
        580,
        ab.range,
        totalDmg,
        dmgType,
        colorNum,
        null
      );
    } else if (ab.kind === 'dash') {
      const angle = Math.atan2(aimPos.y - hero.y, aimPos.x - hero.x);
      const dest = resolveObstacleCollision(
        { x: hero.x + Math.cos(angle) * ab.range, y: hero.y + Math.sin(angle) * ab.range },
        24
      );
      hero.x = dest.x;
      hero.y = dest.y;
      this.spawnEffect(hero.x, hero.y, ab.radius, colorNum, 0.28);
      for (const t of this.gatherHostileTargetsFor(hero.team)) {
        if (dist2D(hero, t) <= ab.radius + 35) {
          this.applyDamageToTarget(t.id, totalDmg, dmgType, hero);
        }
      }
    } else if (ab.kind === 'heal_shield') {
      this.spawnEffect(hero.x, hero.y, ab.radius, colorNum, 0.38);
      for (const ally of this.heroes) {
        if (ally.team === hero.team && !ally.dead && dist2D(hero, ally) <= ab.radius) {
          ally.hp = Math.min(ally.maxHp, ally.hp + totalDmg);
        }
      }
      if (slot === 'R') {
        for (const t of this.gatherHostileTargetsFor(hero.team)) {
          if (dist2D(hero, t) <= ab.radius) {
            this.applyDamageToTarget(t.id, totalDmg * 0.85, dmgType, hero);
          }
        }
      }
    } else {
      // AOE at clamped aim location
      const d = dist2D(hero, aimPos);
      const clampedDist = Math.min(d, ab.range);
      const angle = Math.atan2(aimPos.y - hero.y, aimPos.x - hero.x);
      const cx = hero.x + Math.cos(angle) * clampedDist;
      const cy = hero.y + Math.sin(angle) * clampedDist;
      this.spawnEffect(cx, cy, ab.radius, colorNum, 0.36);
      for (const t of this.gatherHostileTargetsFor(hero.team)) {
        if (dist2D({ x: cx, y: cy }, t) <= ab.radius + 20) {
          this.applyDamageToTarget(t.id, totalDmg, dmgType, hero);
        }
      }
      if (slot === 'R' && hero.isPlayer) {
        this.trauma = Math.min(1, this.trauma + 0.35);
      }
    }
  }

  private spawnMinionWave() {
    const lanes: Array<'top' | 'mid' | 'bot'> = ['top', 'mid', 'bot'];
    for (const lane of lanes) {
      const wps = LANE_WAYPOINTS[lane];
      for (let i = 0; i < 2; i++) {
        // Blue Minions
        const bStart = wps[0];
        this.createMinion('blue', lane, 1, bStart.x + i * 26, bStart.y - i * 26);
        // Red Minions
        const rStart = wps[wps.length - 1];
        this.createMinion('red', lane, wps.length - 2, rStart.x - i * 26, rStart.y + i * 26);
      }
    }
  }

  private createMinion(team: 'blue' | 'red', lane: 'top' | 'mid' | 'bot', wpIndex: number, x: number, y: number) {
    if (this.minions.length >= 42) return;
    const iso = worldToIso(x, y);
    const container = this.add.container(iso.x, iso.y);
    container.setDepth(iso.y);
    const gfx = this.add.graphics();
    gfx.fillStyle(team === 'blue' ? 0x5eb6ff : 0xff77a8, 1);
    gfx.lineStyle(1.5, 0x172b49, 0.9);
    gfx.fillCircle(0, -8, 10);
    gfx.strokeCircle(0, -8, 10);
    const bg = this.add.rectangle(0, -24, 28, 5, 0x172b49, 0.75);
    const hpFill = this.add.rectangle(-13, -24, 26, 3, team === 'blue' ? 0x8ccfff : 0xffb8d2).setOrigin(0, 0.5);
    container.add([gfx, bg, hpFill]);

    this.minions.push({
      id: `min_${team}_${this.idCounter++}`,
      team,
      lane,
      wpIndex,
      x,
      y,
      hp: 340,
      maxHp: 340,
      attackCooldown: 0,
      hitFlashTimer: 0,
      container,
      gfx,
      hpFill,
    });
  }

  private updateMinions(dt: number) {
    const enemiesBlue = this.gatherHostileTargetsFor('blue').filter((t) => t.kind !== 'monster');
    const enemiesRed = this.gatherHostileTargetsFor('red').filter((t) => t.kind !== 'monster');

    for (let i = this.minions.length - 1; i >= 0; i--) {
      const m = this.minions[i];
      if (m.hp <= 0) {
        m.container.destroy();
        this.minions.splice(i, 1);
        continue;
      }

      m.attackCooldown = Math.max(0, m.attackCooldown - dt);
      const list = m.team === 'blue' ? enemiesBlue : enemiesRed;

      let target: { id: string; x: number; y: number } | null = null;
      let bestDist = 230;
      for (const e of list) {
        const d = dist2D(m, e);
        if (d < bestDist) {
          bestDist = d;
          target = e;
        }
      }

      if (target) {
        if (bestDist <= 95) {
          if (m.attackCooldown <= 0) {
            m.attackCooldown = 1.1;
            this.applyDamageToTarget(target.id, 26, 'physical', null);
          }
        } else {
          const ang = Math.atan2(target.y - m.y, target.x - m.x);
          m.x += Math.cos(ang) * 125 * dt;
          m.y += Math.sin(ang) * 125 * dt;
        }
      } else {
        const wps = LANE_WAYPOINTS[m.lane];
        const wp = wps[m.wpIndex] || (m.team === 'blue' ? RED_BASE : BLUE_BASE);
        if (dist2D(m, wp) < 40) {
          if (m.team === 'blue' && m.wpIndex < wps.length - 1) m.wpIndex += 1;
          else if (m.team === 'red' && m.wpIndex > 0) m.wpIndex -= 1;
        } else {
          const ang = Math.atan2(wp.y - m.y, wp.x - m.x);
          m.x += Math.cos(ang) * 125 * dt;
          m.y += Math.sin(ang) * 125 * dt;
        }
      }

      const iso = worldToIso(m.x, m.y);
      m.container.setPosition(iso.x, iso.y);
      m.container.setDepth(iso.y);
      m.hpFill.width = Math.max(0, 26 * (m.hp / m.maxHp));
    }
  }

  private updateTurrets(dt: number) {
    for (const t of this.turrets) {
      if (t.destroyed) continue;
      t.attackCooldown = Math.max(0, t.attackCooldown - dt);
      t.hpFill.width = Math.max(0, 50 * (t.hp / t.maxHp));

      if (t.attackCooldown <= 0) {
        const enemyTeam = t.team === 'blue' ? 'red' : 'blue';
        // Prioritize minions first, then heroes
        let target: { id: string; x: number; y: number } | null = null;
        for (const m of this.minions) {
          if (m.team === enemyTeam && m.hp > 0 && dist2D(t, m) <= 275) {
            target = m;
            break;
          }
        }
        if (!target) {
          for (const h of this.heroes) {
            if (h.team === enemyTeam && !h.dead && dist2D(t, h) <= 275) {
              target = h;
              break;
            }
          }
        }
        if (target) {
          t.attackCooldown = 1.25;
          this.spawnProjectile(
            t.id,
            t.team,
            t.x,
            t.y,
            target.x,
            target.y,
            460,
            310,
            115,
            'physical',
            t.team === 'blue' ? 0x3478d4 : 0xe24c85,
            target.id
          );
        }
      }
    }

    // Update Nexus HP bars
    this.blueNexusHpBar.width = Math.max(0, 92 * (this.blueNexusHp / this.blueNexusMaxHp));
    this.redNexusHpBar.width = Math.max(0, 92 * (this.redNexusHp / this.redNexusMaxHp));
  }

  private updateJungleMonsters(dt: number) {
    for (const mon of this.monsters) {
      if (mon.dead) {
        mon.respawnTimer -= dt;
        if (mon.respawnTimer <= 0) {
          mon.dead = false;
          mon.hp = mon.maxHp;
          mon.x = mon.homeX;
          mon.y = mon.homeY;
          mon.aggroTargetId = null;
          mon.container.setVisible(true);
        }
        continue;
      }

      mon.attackCooldown = Math.max(0, mon.attackCooldown - dt);
      mon.hpFill.width = Math.max(0, 42 * (mon.hp / mon.maxHp));

      if (mon.aggroTargetId) {
        const hero = this.heroes.find((h) => h.id === mon.aggroTargetId && !h.dead);
        if (!hero || dist2D(mon, { x: mon.homeX, y: mon.homeY }) > 260) {
          mon.aggroTargetId = null;
          mon.x = mon.homeX;
          mon.y = mon.homeY;
          mon.hp = mon.maxHp;
        } else {
          const d = dist2D(mon, hero);
          if (d <= 85) {
            if (mon.attackCooldown <= 0) {
              mon.attackCooldown = 1.35;
              this.applyDamageToTarget(hero.id, mon.attack, 'physical', null);
            }
          } else {
            const ang = Math.atan2(hero.y - mon.y, hero.x - mon.x);
            mon.x += Math.cos(ang) * 105 * dt;
            mon.y += Math.sin(ang) * 105 * dt;
          }
        }
        const iso = worldToIso(mon.x, mon.y);
        mon.container.setPosition(iso.x, iso.y);
      }
    }
  }

  private spawnProjectile(
    ownerId: string,
    team: 'blue' | 'red',
    x: number,
    y: number,
    aimX: number,
    aimY: number,
    speed: number,
    maxRange: number,
    damage: number,
    damageType: 'physical' | 'magic',
    color: number,
    targetId: string | null
  ) {
    const slot = this.projectiles.find((p) => !p.active);
    if (!slot) return;
    const ang = Math.atan2(aimY - y, aimX - x);
    slot.active = true;
    slot.ownerId = ownerId;
    slot.team = team;
    slot.x = x;
    slot.y = y;
    slot.vx = Math.cos(ang) * speed;
    slot.vy = Math.sin(ang) * speed;
    slot.distanceTraveled = 0;
    slot.maxRange = maxRange;
    slot.damage = damage;
    slot.damageType = damageType;
    slot.radius = 22;
    slot.color = color;
    slot.targetId = targetId;
    slot.gfx.setVisible(true);
  }

  private updateProjectiles(dt: number) {
    for (const p of this.projectiles) {
      if (!p.active) continue;

      if (p.targetId) {
        const tgt = this.findTargetPosition(p.targetId);
        if (tgt) {
          const ang = Math.atan2(tgt.y - p.y, tgt.x - p.x);
          const spd = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(ang) * spd;
          p.vy = Math.sin(ang) * spd;
        }
      }

      const stepX = p.vx * dt;
      const stepY = p.vy * dt;
      p.x += stepX;
      p.y += stepY;
      p.distanceTraveled += Math.hypot(stepX, stepY);

      const iso = worldToIso(p.x, p.y);
      p.gfx.clear();
      p.gfx.setDepth(iso.y + 30);
      p.gfx.fillStyle(p.color, 0.95);
      p.gfx.fillCircle(iso.x, iso.y - 18, 6.5);
      p.gfx.lineStyle(2, 0xffffff, 0.9);
      p.gfx.strokeCircle(iso.x, iso.y - 18, 6.5);

      const ownerHero = this.heroes.find((h) => h.id === p.ownerId) || null;
      const enemies = this.gatherHostileTargetsFor(p.team);
      let hit = false;
      for (const e of enemies) {
        if (p.targetId && e.id !== p.targetId) continue;
        if (dist2D(p, e) <= 30) {
          this.applyDamageToTarget(e.id, p.damage, p.damageType, ownerHero);
          this.spawnEffect(e.x, e.y, 28, p.color, 0.16);
          hit = true;
          break;
        }
      }

      if (hit || p.distanceTraveled >= p.maxRange) {
        p.active = false;
        p.gfx.setVisible(false);
      }
    }
  }

  private spawnEffect(x: number, y: number, radius: number, color: number, maxLife: number) {
    const gfx = this.add.graphics();
    const iso = worldToIso(x, y);
    gfx.setDepth(iso.y + 40);
    this.effects.push({ x, y, radius, life: maxLife, maxLife, color, gfx });
  }

  private updateEffects(dt: number) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const fx = this.effects[i];
      fx.life -= dt;
      if (fx.life <= 0) {
        fx.gfx.destroy();
        this.effects.splice(i, 1);
        continue;
      }
      const progress = 1 - fx.life / fx.maxLife;
      const iso = worldToIso(fx.x, fx.y);
      fx.gfx.clear();
      fx.gfx.lineStyle(4 * (1 - progress) + 1, fx.color, 1 - progress);
      fx.gfx.strokeEllipse(iso.x, iso.y - 8, fx.radius * 1.7 * (0.4 + progress * 0.7), fx.radius * 1.0 * (0.4 + progress * 0.7));
      fx.gfx.fillStyle(fx.color, 0.22 * (1 - progress));
      fx.gfx.fillEllipse(iso.x, iso.y - 8, fx.radius * 1.5 * (0.4 + progress * 0.7), fx.radius * 0.85 * (0.4 + progress * 0.7));
    }
  }

  private gatherHostileTargetsFor(team: 'blue' | 'red') {
    const enemyTeam = team === 'blue' ? 'red' : 'blue';
    const out: Array<{
      id: string;
      team: 'blue' | 'red' | 'neutral';
      kind: 'hero' | 'minion' | 'turret' | 'nexus' | 'monster';
      x: number;
      y: number;
      hp: number;
      maxHp: number;
    }> = [];

    for (const h of this.heroes) {
      if (h.team === enemyTeam && !h.dead) {
        out.push({ id: h.id, team: h.team, kind: 'hero', x: h.x, y: h.y, hp: h.hp, maxHp: h.maxHp });
      }
    }
    for (const m of this.minions) {
      if (m.team === enemyTeam && m.hp > 0) {
        out.push({ id: m.id, team: m.team, kind: 'minion', x: m.x, y: m.y, hp: m.hp, maxHp: m.maxHp });
      }
    }
    for (const t of this.turrets) {
      if (t.team === enemyTeam && !t.destroyed) {
        out.push({ id: t.id, team: t.team, kind: 'turret', x: t.x, y: t.y, hp: t.hp, maxHp: t.maxHp });
      }
    }
    if (enemyTeam === 'red' && this.redNexusHp > 0) {
      out.push({
        id: 'red_nexus',
        team: 'red',
        kind: 'nexus',
        x: RED_BASE.x,
        y: RED_BASE.y,
        hp: this.redNexusHp,
        maxHp: this.redNexusMaxHp,
      });
    } else if (enemyTeam === 'blue' && this.blueNexusHp > 0) {
      out.push({
        id: 'blue_nexus',
        team: 'blue',
        kind: 'nexus',
        x: BLUE_BASE.x,
        y: BLUE_BASE.y,
        hp: this.blueNexusHp,
        maxHp: this.blueNexusMaxHp,
      });
    }
    for (const mon of this.monsters) {
      if (!mon.dead) {
        out.push({ id: mon.id, team: 'neutral', kind: 'monster', x: mon.x, y: mon.y, hp: mon.hp, maxHp: mon.maxHp });
      }
    }
    return out;
  }

  private findTargetPosition(id: string): Vec2 | null {
    const h = this.heroes.find((x) => x.id === id && !x.dead);
    if (h) return h;
    const m = this.minions.find((x) => x.id === id && x.hp > 0);
    if (m) return m;
    const t = this.turrets.find((x) => x.id === id && !x.destroyed);
    if (t) return t;
    if (id === 'red_nexus') return RED_BASE;
    if (id === 'blue_nexus') return BLUE_BASE;
    const mon = this.monsters.find((x) => x.id === id && !x.dead);
    if (mon) return mon;
    return null;
  }

  private applyDamageToTarget(
    targetId: string,
    rawDamage: number,
    damageType: 'physical' | 'magic',
    attacker: HeroEntity | null
  ) {
    // 1. Hero
    const hero = this.heroes.find((h) => h.id === targetId && !h.dead);
    if (hero) {
      const stats = computeHeroEffectiveStats(hero.def, hero.level, hero.items);
      const dmg = calculateMitigatedDamage(rawDamage, damageType, stats.armor, stats.magicResist);
      hero.hp = Math.max(0, hero.hp - dmg);
      hero.hitFlashTimer = 0.08;
      hero.recalling = false;
      if (attacker) {
        hero.lastDamagedById = attacker.id;
        hero.lastDamagedTimer = 6;
      }
      if (attacker?.isPlayer) soundEngine.playHit(dmg > 180);

      if (hero.hp <= 0) {
        hero.dead = true;
        hero.deaths += 1;
        hero.respawnTimer = Math.min(24, 6 + hero.level * 1.1);
        hero.container.setVisible(false);
        this.spawnEffect(hero.x, hero.y, 75, 0xffb8d2, 0.45);
        if (hero.team === 'red') this.blueKills += 1;
        else this.redKills += 1;

        if (attacker) {
          attacker.kills += 1;
          attacker.gold += 240;
          this.grantExpToHero(attacker, 160);
          if (attacker.isPlayer) {
            soundEngine.playKill();
            this.hitstopTimer = 0.045;
            this.trauma = Math.min(1, this.trauma + 0.45);
          }
        }
      }
      return;
    }

    // 2. Minion
    const minion = this.minions.find((m) => m.id === targetId && m.hp > 0);
    if (minion) {
      minion.hp -= rawDamage;
      if (minion.hp <= 0 && attacker) {
        attacker.gold += 45;
        this.grantExpToHero(attacker, 55);
      }
      return;
    }

    // 3. Turret
    const turret = this.turrets.find((t) => t.id === targetId && !t.destroyed);
    if (turret) {
      turret.hp = Math.max(0, turret.hp - rawDamage);
      if (turret.hp <= 0) {
        turret.destroyed = true;
        this.drawTurretGraphic(turret.gfx, turret.team, true);
        turret.hpFill.setVisible(false);
        this.spawnEffect(turret.x, turret.y, 110, 0x8ccfff, 0.5);
        if (attacker) {
          attacker.gold += 280;
          this.grantExpToHero(attacker, 180);
          if (attacker.isPlayer) {
            this.trauma = Math.min(1, this.trauma + 0.5);
            soundEngine.playKill();
          }
        }
      }
      return;
    }

    // 4. Nexus
    if (targetId === 'red_nexus') {
      this.redNexusHp = Math.max(0, this.redNexusHp - rawDamage);
      return;
    }
    if (targetId === 'blue_nexus') {
      this.blueNexusHp = Math.max(0, this.blueNexusHp - rawDamage);
      return;
    }

    // 5. Jungle Monster
    const mon = this.monsters.find((x) => x.id === targetId && !x.dead);
    if (mon) {
      mon.hp = Math.max(0, mon.hp - rawDamage);
      if (attacker) mon.aggroTargetId = attacker.id;
      if (mon.hp <= 0) {
        mon.dead = true;
        mon.respawnTimer = 42;
        mon.container.setVisible(false);
        this.spawnEffect(mon.x, mon.y, 70, 0xffb8d2, 0.4);
        if (attacker) {
          attacker.gold += mon.goldReward;
          this.grantExpToHero(attacker, mon.expReward);
          if (mon.buffType === 'azure') attacker.buffAzureTimer = 45;
          if (mon.buffType === 'blossom') attacker.buffBlossomTimer = 45;
          if (attacker.isPlayer) soundEngine.playKill();
        }
      }
    }
  }

  private grantExpToHero(hero: HeroEntity, amount: number) {
    const res = applyExpGain(hero.level, hero.exp, amount);
    hero.level = res.level;
    hero.exp = res.exp;
    if (res.leveledUp) {
      const stats = computeHeroEffectiveStats(hero.def, hero.level, hero.items);
      const hpDiff = stats.maxHp - hero.maxHp;
      hero.maxHp = stats.maxHp;
      hero.maxMana = stats.maxMana;
      hero.hp = Math.min(hero.maxHp, hero.hp + hpDiff + 80);
      hero.mana = Math.min(hero.maxMana, hero.mana + 60);
      this.spawnEffect(hero.x, hero.y, 55, 0x8ccfff, 0.4);
    }
  }

  private updateCameraEffects(dt: number) {
    const p = this.getPlayerHero();
    if (p && this.cameraLocked) {
      const iso = worldToIso(p.x, p.y);
      const cam = this.cameras.main;
      const lerpFactor = Math.min(1, dt * 8 * this.cfg.cameraSensitivity);
      const nx = Phaser.Math.Linear(cam.scrollX + cam.width / 2, iso.x + this.cameraPanOffset.x, lerpFactor);
      const ny = Phaser.Math.Linear(cam.scrollY + cam.height / 2, iso.y + this.cameraPanOffset.y, lerpFactor);
      cam.centerOn(nx, ny);
    }

    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 2.2);
      const shake = this.trauma * this.trauma * 10;
      this.cameras.main.setScroll(
        this.cameras.main.scrollX + (Math.random() - 0.5) * shake,
        this.cameras.main.scrollY + (Math.random() - 0.5) * shake
      );
    }
  }

  private finishMatch(outcome: 'victory' | 'defeat') {
    this.matchOutcome = outcome;
    if (outcome === 'victory') soundEngine.playVictory();
    else soundEngine.playDefeat();
    this.emitHud();

    const p = this.getPlayerHero();
    const turretsDestroyed = this.turrets.filter((t) => t.team === 'red' && t.destroyed).length;

    this.cfg.onMatchEnd({
      heroId: this.cfg.playerHeroId,
      mode: this.cfg.mode,
      difficulty: this.cfg.difficulty,
      result: outcome,
      kills: p?.kills || 0,
      deaths: p?.deaths || 0,
      assists: p?.assists || 0,
      goldEarned: Math.round(p?.gold || 0),
      durationSec: Math.max(1, Math.round(this.elapsedSec)),
      blueKills: this.blueKills,
      redKills: this.redKills,
      turretsDestroyed,
    });
  }

  private emitHud() {
    const p = this.getPlayerHero();
    if (!p) return;
    const stats = computeHeroEffectiveStats(p.def, p.level, p.items);
    const cdr = 1 - stats.cooldownReductionPct / 100;

    const minimap: MinimapEntity[] = [
      ...this.heroes
        .filter((h) => !h.dead)
        .map((h) => ({
          x: h.x / WORLD_SIZE,
          y: h.y / WORLD_SIZE,
          team: h.team,
          kind: (h.isPlayer ? 'player' : 'hero') as 'player' | 'hero',
        })),
      ...this.turrets
        .filter((t) => !t.destroyed)
        .map((t) => ({
          x: t.x / WORLD_SIZE,
          y: t.y / WORLD_SIZE,
          team: t.team,
          kind: 'turret' as const,
        })),
      { x: BLUE_BASE.x / WORLD_SIZE, y: BLUE_BASE.y / WORLD_SIZE, team: 'blue', kind: 'nexus' },
      { x: RED_BASE.x / WORLD_SIZE, y: RED_BASE.y / WORLD_SIZE, team: 'red', kind: 'nexus' },
    ];

    this.cfg.onHudUpdate({
      elapsedSec: Math.floor(this.elapsedSec),
      blueKills: this.blueKills,
      redKills: this.redKills,
      playerHeroId: p.def.id,
      playerLevel: p.level,
      playerExp: p.exp,
      playerHp: Math.round(p.hp),
      playerMaxHp: Math.round(p.maxHp),
      playerMana: Math.round(p.mana),
      playerMaxMana: Math.round(p.maxMana),
      playerGold: Math.floor(p.gold),
      playerKills: p.kills,
      playerDeaths: p.deaths,
      playerAssists: p.assists,
      playerRespawnSec: Math.ceil(p.respawnTimer),
      playerBuffs: {
        azure: Math.ceil(p.buffAzureTimer),
        blossom: Math.ceil(p.buffBlossomTimer),
      },
      isRecalling: p.recalling,
      recallProgress: p.recalling ? Math.min(1, (3.2 - p.recallTimer) / 3.2) : 0,
      cooldowns: {
        q: Number(p.cdQ.toFixed(1)),
        e: Number(p.cdE.toFixed(1)),
        r: Number(p.cdR.toFixed(1)),
      },
      maxCooldowns: {
        q: Number((p.def.abilities.q.cooldownSec * cdr).toFixed(1)),
        e: Number((p.def.abilities.e.cooldownSec * cdr).toFixed(1)),
        r: Number((p.def.abilities.r.cooldownSec * cdr).toFixed(1)),
      },
      items: p.items.map((i) => i.id),
      turretsDestroyed: this.turrets.filter((t) => t.team === 'red' && t.destroyed).length,
      blueNexusHp: Math.round(this.blueNexusHp),
      blueNexusMaxHp: this.blueNexusMaxHp,
      redNexusHp: Math.round(this.redNexusHp),
      redNexusMaxHp: this.redNexusMaxHp,
      minimap,
      status: this.paused ? 'paused' : this.matchOutcome,
    });
  }
}
