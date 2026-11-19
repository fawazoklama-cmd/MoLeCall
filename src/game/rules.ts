import { HeroBaseStats, HeroDefinition, RankTier, ShopItem } from '../types/game';
import { getRankForPoints } from '../data/ranks';
import { HALF_WORLD, MAP_OBSTACLES, ObstacleRect, Vec2, WORLD_SIZE } from './mapData';

// 2.5D Isometric projection matrix (Blue Base bottom-left, Red Base top-right)
const ISO_A = 0.92;
const ISO_B = 0.28;
const ISO_C = -0.16;
const ISO_D = 0.56;
const ISO_DET = ISO_A * ISO_D - ISO_B * ISO_C; // 0.56

export function worldToIso(wx: number, wy: number): Vec2 {
  const u = wx - HALF_WORLD;
  const v = wy - HALF_WORLD;
  return {
    x: ISO_A * u + ISO_B * v,
    y: ISO_C * u + ISO_D * v,
  };
}

export function isoToWorld(ix: number, iy: number): Vec2 {
  const u = (ISO_D * ix - ISO_B * iy) / ISO_DET;
  const v = (-ISO_C * ix + ISO_A * iy) / ISO_DET;
  return {
    x: u + HALF_WORLD,
    y: v + HALF_WORLD,
  };
}

export function isoDeltaToWorld(dx: number, dy: number): Vec2 {
  const u = (ISO_D * dx - ISO_B * dy) / ISO_DET;
  const v = (-ISO_C * dx + ISO_A * dy) / ISO_DET;
  return { x: u, y: v };
}

export function dist2D(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function clampToArena(pos: Vec2, radius = 26): Vec2 {
  return {
    x: Math.max(radius + 35, Math.min(WORLD_SIZE - radius - 35, pos.x)),
    y: Math.max(radius + 35, Math.min(WORLD_SIZE - radius - 35, pos.y)),
  };
}

export function resolveObstacleCollision(
  pos: Vec2,
  radius = 24,
  obstacles: ObstacleRect[] = MAP_OBSTACLES
): Vec2 {
  let { x, y } = clampToArena(pos, radius);

  for (const obs of obstacles) {
    const closestX = Math.max(obs.x, Math.min(x, obs.x + obs.w));
    const closestY = Math.max(obs.y, Math.min(y, obs.y + obs.h));
    const dx = x - closestX;
    const dy = y - closestY;
    const d2 = dx * dx + dy * dy;

    if (d2 < radius * radius) {
      const d = Math.sqrt(d2);
      if (d > 0.0001) {
        const push = radius - d;
        x += (dx / d) * push;
        y += (dy / d) * push;
      } else {
        // Center is inside rect: push out along shortest axis
        const leftPen = x - obs.x;
        const rightPen = obs.x + obs.w - x;
        const topPen = y - obs.y;
        const botPen = obs.y + obs.h - y;
        const minPen = Math.min(leftPen, rightPen, topPen, botPen);
        if (minPen === leftPen) x = obs.x - radius;
        else if (minPen === rightPen) x = obs.x + obs.w + radius;
        else if (minPen === topPen) y = obs.y - radius;
        else y = obs.y + obs.h + radius;
      }
    }
  }

  return clampToArena({ x, y }, radius);
}

export function computeHeroEffectiveStats(
  hero: HeroDefinition,
  level: number,
  items: ShopItem[]
): HeroBaseStats & { cooldownReductionPct: number; lifestealPct: number } {
  const lvlBonus = Math.max(0, level - 1);
  let maxHp = hero.stats.maxHp + lvlBonus * 115;
  let maxMana = hero.stats.maxMana + lvlBonus * 45;
  let attack = hero.stats.attack + lvlBonus * 7;
  let magicPower = hero.stats.magicPower + lvlBonus * 9;
  let armor = hero.stats.armor + lvlBonus * 2.5;
  let magicResist = hero.stats.magicResist + lvlBonus * 2;
  let moveSpeed = hero.stats.moveSpeed;
  let attackSpeedPct = 0;
  let cooldownReductionPct = 0;
  let lifestealPct = 0;

  for (const item of items) {
    maxHp += item.stats.maxHp || 0;
    maxMana += item.stats.maxMana || 0;
    attack += item.stats.attack || 0;
    magicPower += item.stats.magicPower || 0;
    armor += item.stats.armor || 0;
    magicResist += item.stats.magicResist || 0;
    moveSpeed += item.stats.moveSpeed || 0;
    attackSpeedPct += item.stats.attackSpeedPct || 0;
    cooldownReductionPct += item.stats.cooldownReductionPct || 0;
    lifestealPct += item.stats.lifestealPct || 0;
  }

  return {
    maxHp: Math.round(maxHp),
    maxMana: Math.round(maxMana),
    attack: Math.round(attack),
    magicPower: Math.round(magicPower),
    armor: Math.round(armor),
    magicResist: Math.round(magicResist),
    moveSpeed: Math.min(360, Math.round(moveSpeed)),
    attackRange: hero.stats.attackRange,
    attackSpeed: Number((hero.stats.attackSpeed * (1 + attackSpeedPct / 100)).toFixed(2)),
    cooldownReductionPct: Math.min(40, cooldownReductionPct),
    lifestealPct: Math.min(35, lifestealPct),
  };
}

export function calculateMitigatedDamage(
  rawDamage: number,
  damageType: 'physical' | 'magic' | 'true',
  armor: number,
  magicResist: number
): number {
  if (rawDamage <= 0) return 0;
  if (damageType === 'true') return Math.round(rawDamage);
  const defense = damageType === 'physical' ? Math.max(0, armor) : Math.max(0, magicResist);
  const multiplier = 100 / (100 + defense);
  return Math.max(1, Math.round(rawDamage * multiplier));
}

export function expRequiredForLevel(level: number): number {
  if (level >= 15) return 999999;
  return 160 + (level - 1) * 95;
}

export function applyExpGain(currentLevel: number, currentExp: number, gainedExp: number) {
  let level = Math.max(1, Math.min(15, currentLevel));
  let exp = Math.max(0, currentExp + gainedExp);
  let leveledUp = false;

  while (level < 15 && exp >= expRequiredForLevel(level)) {
    exp -= expRequiredForLevel(level);
    level += 1;
    leveledUp = true;
  }

  if (level >= 15) {
    exp = 0;
  }

  return { level, exp, leveledUp };
}

export function calculateMatchOutcome(params: {
  blueNexusHp: number;
  redNexusHp: number;
}): 'playing' | 'victory' | 'defeat' {
  if (params.redNexusHp <= 0) return 'victory';
  if (params.blueNexusHp <= 0) return 'defeat';
  return 'playing';
}

export function computeWinRate(wins: number, totalMatches: number): number {
  if (totalMatches <= 0) return 0;
  return Math.round((wins / totalMatches) * 100);
}

export function computeUpdatedRank(currentPoints: number, won: boolean): {
  rankPoints: number;
  rankTier: RankTier;
} {
  const delta = won ? 28 : -16;
  const nextPoints = Math.max(0, currentPoints + delta);
  const tierInfo = getRankForPoints(nextPoints);
  return {
    rankPoints: nextPoints,
    rankTier: tierInfo.tier,
  };
}
