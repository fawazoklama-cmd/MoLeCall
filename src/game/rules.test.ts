import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyExpGain,
  calculateMatchOutcome,
  calculateMitigatedDamage,
  computeHeroEffectiveStats,
  computeUpdatedRank,
  computeWinRate,
  isoToWorld,
  resolveObstacleCollision,
  worldToIso,
} from './rules';
import { getHeroById } from '../data/heroes';
import { SHOP_ITEMS } from '../data/items';
import { BLUE_BASE, MAP_OBSTACLES, RED_BASE } from './mapData';

test('worldToIso and isoToWorld are accurate inverses', () => {
  const samples = [BLUE_BASE, RED_BASE, { x: 1200, y: 1200 }, { x: 400, y: 1850 }];
  for (const pt of samples) {
    const iso = worldToIso(pt.x, pt.y);
    const back = isoToWorld(iso.x, iso.y);
    assert.ok(Math.abs(back.x - pt.x) < 0.01, `X mismatch for ${pt.x}`);
    assert.ok(Math.abs(back.y - pt.y) < 0.01, `Y mismatch for ${pt.y}`);
  }
});

test('Blue Base projects to bottom-left and Red Base projects to top-right', () => {
  const blueIso = worldToIso(BLUE_BASE.x, BLUE_BASE.y);
  const redIso = worldToIso(RED_BASE.x, RED_BASE.y);
  assert.ok(blueIso.x < 0 && blueIso.y > 0, 'Blue base should be bottom-left');
  assert.ok(redIso.x > 0 && redIso.y < 0, 'Red base should be top-right');
});

test('resolveObstacleCollision prevents walking inside jungle pillars', () => {
  const obs = MAP_OBSTACLES[0];
  const inside = { x: obs.x + obs.w / 2, y: obs.y + obs.h / 2 };
  const resolved = resolveObstacleCollision(inside, 24);
  const isOutside =
    resolved.x <= obs.x - 23 ||
    resolved.x >= obs.x + obs.w + 23 ||
    resolved.y <= obs.y - 23 ||
    resolved.y >= obs.y + obs.h + 23;
  assert.equal(isOutside, true);
});

test('computeHeroEffectiveStats stacks level bonuses and items with caps', () => {
  const aether = getHeroById('aether');
  const grimoire = SHOP_ITEMS.find((i) => i.id === 'rose_quartz_grimoire')!;
  const boots = SHOP_ITEMS.find((i) => i.id === 'blossom_arcane_shoes')!;
  const stats = computeHeroEffectiveStats(aether, 5, [grimoire, boots]);
  assert.equal(stats.maxHp, aether.stats.maxHp + 4 * 115);
  assert.equal(stats.magicPower, aether.stats.magicPower + 4 * 9 + 75);
  assert.equal(stats.cooldownReductionPct, 30);
});

test('calculateMitigatedDamage reduces damage proportionally by defense', () => {
  assert.equal(calculateMitigatedDamage(200, 'physical', 100, 0), 100);
  assert.equal(calculateMitigatedDamage(200, 'magic', 0, 100), 100);
  assert.equal(calculateMitigatedDamage(200, 'true', 150, 150), 200);
});

test('applyExpGain levels up properly and caps at level 15', () => {
  const res = applyExpGain(1, 0, 200);
  assert.equal(res.level, 2);
  assert.equal(res.leveledUp, true);
  assert.equal(res.exp, 40);

  const maxRes = applyExpGain(14, 0, 10000);
  assert.equal(maxRes.level, 15);
  assert.equal(maxRes.exp, 0);
});

test('calculateMatchOutcome triggers victory or defeat when Nexus falls', () => {
  assert.equal(calculateMatchOutcome({ blueNexusHp: 3000, redNexusHp: 3000 }), 'playing');
  assert.equal(calculateMatchOutcome({ blueNexusHp: 1200, redNexusHp: 0 }), 'victory');
  assert.equal(calculateMatchOutcome({ blueNexusHp: 0, redNexusHp: 900 }), 'defeat');
});

test('win rate and rank progression compute accurately', () => {
  assert.equal(computeWinRate(0, 0), 0);
  assert.equal(computeWinRate(3, 4), 75);

  const promoted = computeUpdatedRank(580, true);
  assert.equal(promoted.rankPoints, 608);
  assert.equal(promoted.rankTier, 'Gold');

  const floored = computeUpdatedRank(10, false);
  assert.equal(floored.rankPoints, 0);
  assert.equal(floored.rankTier, 'Bronze');
});
