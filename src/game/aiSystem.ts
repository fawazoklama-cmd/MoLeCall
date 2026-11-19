import { Difficulty, HeroRole } from '../types/game';
import { BLUE_BASE, LANE_WAYPOINTS, RED_BASE, Vec2 } from './mapData';
import { dist2D } from './rules';

export interface AIActorSnapshot {
  id: string;
  team: 'blue' | 'red';
  role: HeroRole;
  lane: 'top' | 'mid' | 'bot';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  mana: number;
  attackRange: number;
  dead: boolean;
  qReady: boolean;
  eReady: boolean;
  rReady: boolean;
}

export interface AITargetUnit {
  id: string;
  team: 'blue' | 'red' | 'neutral';
  kind: 'hero' | 'minion' | 'turret' | 'nexus' | 'monster';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
}

export interface AIDecision {
  moveDir: Vec2;
  attackTargetId: string | null;
  castSkill: 'Q' | 'E' | 'R' | null;
  aimPos: Vec2;
  recalling: boolean;
}

export function computeBotDecision(
  bot: AIActorSnapshot,
  enemies: AITargetUnit[],
  allies: AITargetUnit[],
  difficulty: Difficulty,
  matchElapsedSec: number
): AIDecision {
  if (bot.dead) {
    return { moveDir: { x: 0, y: 0 }, attackTargetId: null, castSkill: null, aimPos: { x: bot.x, y: bot.y }, recalling: false };
  }

  const homeBase = bot.team === 'blue' ? BLUE_BASE : RED_BASE;
  const enemyBase = bot.team === 'blue' ? RED_BASE : BLUE_BASE;
  const hpPct = bot.hp / Math.max(1, bot.maxHp);

  // 1. Retreat if low HP
  const retreatThreshold = difficulty === 'hard' ? 0.28 : difficulty === 'normal' ? 0.22 : 0.14;
  const distToHome = dist2D(bot, homeBase);
  if (hpPct < retreatThreshold && distToHome > 230) {
    const dx = homeBase.x - bot.x;
    const dy = homeBase.y - bot.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    return {
      moveDir: { x: dx / len, y: dy / len },
      attackTargetId: null,
      castSkill: null,
      aimPos: { x: bot.x + dx, y: bot.y + dy },
      recalling: distToHome > 680 && enemies.every((e) => dist2D(bot, e) > 420),
    };
  }

  // Wait briefly in base if healing up
  if (distToHome < 240 && hpPct < 0.72) {
    return {
      moveDir: { x: 0, y: 0 },
      attackTargetId: null,
      castSkill: null,
      aimPos: enemyBase,
      recalling: false,
    };
  }

  // 2. Check base defense threat
  const baseThreat = enemies.find((e) => e.team !== 'neutral' && dist2D(e, homeBase) < 520);
  if (baseThreat && distToHome < 950) {
    const d = dist2D(bot, baseThreat);
    const dir = normalizeDir(baseThreat.x - bot.x, baseThreat.y - bot.y);
    return {
      moveDir: d > bot.attackRange * 0.85 ? dir : { x: 0, y: 0 },
      attackTargetId: d <= bot.attackRange + 35 ? baseThreat.id : null,
      castSkill: selectSkillForTarget(bot, baseThreat, difficulty),
      aimPos: { x: baseThreat.x, y: baseThreat.y },
      recalling: false,
    };
  }

  // 3. Evaluate nearest visible combat targets
  const aggroRadius = difficulty === 'hard' ? 460 : difficulty === 'normal' ? 390 : 320;
  let bestTarget: AITargetUnit | null = null;
  let bestScore = -Infinity;

  for (const enemy of enemies) {
    const d = dist2D(bot, enemy);
    if (d > aggroRadius) continue;

    let score = 400 - d;
    if (enemy.kind === 'hero') score += 140 + (1 - enemy.hp / enemy.maxHp) * 180;
    else if (enemy.kind === 'minion') score += 90;
    else if (enemy.kind === 'turret') score += 110;
    else if (enemy.kind === 'nexus') score += 260;
    else if (enemy.kind === 'monster') {
      score += bot.lane === 'mid' && matchElapsedSec > 20 ? 40 : -80;
    }

    // Safety check: don't dive enemy turret alone without nearby friendly minions/allies
    if (enemy.kind === 'hero') {
      const nearEnemyTurret = enemies.some(
        (t) => (t.kind === 'turret' || t.kind === 'nexus') && dist2D(bot, t) < 300
      );
      const alliedBackup = allies.some((a) => a.id !== bot.id && dist2D(a, bot) < 320);
      if (nearEnemyTurret && !alliedBackup && difficulty !== 'easy') {
        score -= 350;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestTarget = enemy;
    }
  }

  if (bestTarget) {
    const d = dist2D(bot, bestTarget);
    const isRanged = bot.role === 'Mage' || bot.role === 'Marksman' || bot.role === 'Support';
    let moveDir: Vec2 = { x: 0, y: 0 };

    if (d > bot.attackRange * 0.92) {
      moveDir = normalizeDir(bestTarget.x - bot.x, bestTarget.y - bot.y);
    } else if (isRanged && d < bot.attackRange * 0.45 && bestTarget.kind === 'hero' && difficulty !== 'easy') {
      // Kite backwards
      moveDir = normalizeDir(bot.x - bestTarget.x, bot.y - bestTarget.y);
    }

    return {
      moveDir,
      attackTargetId: d <= bot.attackRange + 30 ? bestTarget.id : null,
      castSkill: selectSkillForTarget(bot, bestTarget, difficulty),
      aimPos: { x: bestTarget.x, y: bestTarget.y },
      recalling: false,
    };
  }

  // 4. Advance along assigned lane waypoints
  const waypoints = LANE_WAYPOINTS[bot.lane];
  const ordered = bot.team === 'blue' ? waypoints : [...waypoints].reverse();
  let targetWp = ordered[ordered.length - 1];
  for (let i = 0; i < ordered.length; i++) {
    if (dist2D(bot, ordered[i]) > 140) {
      // Pick the waypoint that makes forward progress toward enemy base
      const wpDistToEnemy = dist2D(ordered[i], enemyBase);
      const botDistToEnemy = dist2D(bot, enemyBase);
      if (wpDistToEnemy < botDistToEnemy + 160) {
        targetWp = ordered[i];
        break;
      }
    }
  }

  return {
    moveDir: normalizeDir(targetWp.x - bot.x, targetWp.y - bot.y),
    attackTargetId: null,
    castSkill: null,
    aimPos: targetWp,
    recalling: false,
  };
}

function selectSkillForTarget(
  bot: AIActorSnapshot,
  target: AITargetUnit,
  difficulty: Difficulty
): 'Q' | 'E' | 'R' | null {
  if (difficulty === 'easy' && Math.random() > 0.35) return null;
  const d = dist2D(bot, target);

  if (bot.role === 'Support' && bot.eReady && bot.hp / bot.maxHp < 0.78) {
    return 'E';
  }
  if (target.kind === 'hero') {
    if (bot.rReady && d < 280 && (target.hp / target.maxHp < 0.7 || difficulty === 'hard')) return 'R';
    if (bot.eReady && d < 250) return 'E';
    if (bot.qReady && d < 320) return 'Q';
  } else if (target.kind === 'minion' || target.kind === 'monster') {
    if (bot.qReady && d < 280 && bot.mana > 120) return 'Q';
  }
  return null;
}

function normalizeDir(dx: number, dy: number): Vec2 {
  const len = Math.hypot(dx, dy);
  if (len < 0.001) return { x: 0, y: 0 };
  return { x: dx / len, y: dy / len };
}
