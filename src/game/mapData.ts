export const WORLD_SIZE = 2400;
export const HALF_WORLD = 1200;

export interface Vec2 {
  x: number;
  y: number;
}

export interface ObstacleRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'castle_wall' | 'jungle_pillar' | 'shrine';
}

export interface BushZone {
  id: string;
  x: number;
  y: number;
  r: number;
}

export interface TurretBlueprint {
  id: string;
  team: 'blue' | 'red';
  lane: 'top' | 'mid' | 'bot';
  tier: 1 | 2 | 3;
  x: number;
  y: number;
}

export interface JungleCampBlueprint {
  id: string;
  nameId: string;
  nameEn: string;
  x: number;
  y: number;
  isBuff: boolean;
  buffType?: 'azure' | 'blossom';
  maxHp: number;
  attack: number;
  goldReward: number;
  expReward: number;
}

export const BLUE_BASE: Vec2 = { x: 250, y: 2150 };
export const RED_BASE: Vec2 = { x: 2150, y: 250 };

export const BLUE_SPAWN: Vec2 = { x: 175, y: 2225 };
export const RED_SPAWN: Vec2 = { x: 2225, y: 175 };

export const LANE_WAYPOINTS: Record<'top' | 'mid' | 'bot', Vec2[]> = {
  top: [
    { x: 250, y: 2150 },
    { x: 240, y: 1300 },
    { x: 240, y: 360 },
    { x: 1100, y: 240 },
    { x: 2150, y: 250 },
  ],
  mid: [
    { x: 250, y: 2150 },
    { x: 750, y: 1650 },
    { x: 1200, y: 1200 },
    { x: 1650, y: 750 },
    { x: 2150, y: 250 },
  ],
  bot: [
    { x: 250, y: 2150 },
    { x: 1300, y: 2160 },
    { x: 2160, y: 2040 },
    { x: 2160, y: 1100 },
    { x: 2150, y: 250 },
  ],
};

// Balanced symmetric obstacles in The Kingdom of Aetheria (leaving wide >= 200px lanes)
export const MAP_OBSTACLES: ObstacleRect[] = [
  // Jungle pillars North-West (symmetric around mid)
  { id: 'nw_pillar_1', x: 520, y: 700, w: 120, h: 110, kind: 'jungle_pillar' },
  { id: 'nw_pillar_2', x: 760, y: 500, w: 120, h: 110, kind: 'jungle_pillar' },
  // Jungle pillars South-East (mirrored)
  { id: 'se_pillar_1', x: 1760, y: 1590, w: 120, h: 110, kind: 'jungle_pillar' },
  { id: 'se_pillar_2', x: 1520, y: 1790, w: 120, h: 110, kind: 'jungle_pillar' },
  // Mid-jungle ancient shrines (keep center clear for river & mid lane)
  { id: 'west_shrine', x: 540, y: 1260, w: 100, h: 100, kind: 'shrine' },
  { id: 'east_shrine', x: 1760, y: 1040, w: 100, h: 100, kind: 'shrine' },
];

export const MAP_BUSHES: BushZone[] = [
  { id: 'bush_top_blue', x: 200, y: 980, r: 62 },
  { id: 'bush_top_red', x: 980, y: 200, r: 62 },
  { id: 'bush_mid_w', x: 980, y: 1280, r: 58 },
  { id: 'bush_mid_e', x: 1420, y: 1120, r: 58 },
  { id: 'bush_bot_blue', x: 1420, y: 2200, r: 62 },
  { id: 'bush_bot_red', x: 2200, y: 1420, r: 62 },
  { id: 'bush_river_n', x: 780, y: 780, r: 58 },
  { id: 'bush_river_s', x: 1620, y: 1620, r: 58 },
];

// 3 Turrets per lane per team = 18 Turrets total
export const TURRET_BLUEPRINTS: TurretBlueprint[] = [
  // Blue Top
  { id: 'blue_top_3', team: 'blue', lane: 'top', tier: 3, x: 250, y: 1750 },
  { id: 'blue_top_2', team: 'blue', lane: 'top', tier: 2, x: 245, y: 1300 },
  { id: 'blue_top_1', team: 'blue', lane: 'top', tier: 1, x: 245, y: 820 },
  // Blue Mid
  { id: 'blue_mid_3', team: 'blue', lane: 'mid', tier: 3, x: 530, y: 1870 },
  { id: 'blue_mid_2', team: 'blue', lane: 'mid', tier: 2, x: 760, y: 1640 },
  { id: 'blue_mid_1', team: 'blue', lane: 'mid', tier: 1, x: 980, y: 1420 },
  // Blue Bot
  { id: 'blue_bot_3', team: 'blue', lane: 'bot', tier: 3, x: 650, y: 2150 },
  { id: 'blue_bot_2', team: 'blue', lane: 'bot', tier: 2, x: 1100, y: 2155 },
  { id: 'blue_bot_1', team: 'blue', lane: 'bot', tier: 1, x: 1580, y: 2155 },

  // Red Top
  { id: 'red_top_3', team: 'red', lane: 'top', tier: 3, x: 1750, y: 250 },
  { id: 'red_top_2', team: 'red', lane: 'top', tier: 2, x: 1300, y: 245 },
  { id: 'red_top_1', team: 'red', lane: 'top', tier: 1, x: 820, y: 245 },
  // Red Mid
  { id: 'red_mid_3', team: 'red', lane: 'mid', tier: 3, x: 1870, y: 530 },
  { id: 'red_mid_2', team: 'red', lane: 'mid', tier: 2, x: 1640, y: 760 },
  { id: 'red_mid_1', team: 'red', lane: 'mid', tier: 1, x: 1420, y: 980 },
  // Red Bot
  { id: 'red_bot_3', team: 'red', lane: 'bot', tier: 3, x: 2150, y: 650 },
  { id: 'red_bot_2', team: 'red', lane: 'bot', tier: 2, x: 2155, y: 1100 },
  { id: 'red_bot_1', team: 'red', lane: 'bot', tier: 1, x: 2155, y: 1580 },
];

export const JUNGLE_CAMPS: JungleCampBlueprint[] = [
  {
    id: 'camp_blue_azure',
    nameId: 'Golem Langit Biru',
    nameEn: 'Azure Sky Golem',
    x: 680,
    y: 1120,
    isBuff: true,
    buffType: 'azure',
    maxHp: 920,
    attack: 44,
    goldReward: 135,
    expReward: 140,
  },
  {
    id: 'camp_blue_blossom',
    nameId: 'Wyrm Sakura Selatan',
    nameEn: 'Southern Blossom Wyrm',
    x: 1280,
    y: 1760,
    isBuff: true,
    buffType: 'blossom',
    maxHp: 920,
    attack: 44,
    goldReward: 135,
    expReward: 140,
  },
  {
    id: 'camp_red_azure',
    nameId: 'Golem Langit Utara',
    nameEn: 'Northern Sky Golem',
    x: 1720,
    y: 1280,
    isBuff: true,
    buffType: 'azure',
    maxHp: 920,
    attack: 44,
    goldReward: 135,
    expReward: 140,
  },
  {
    id: 'camp_red_blossom',
    nameId: 'Wyrm Sakura Utara',
    nameEn: 'Northern Blossom Wyrm',
    x: 1120,
    y: 640,
    isBuff: true,
    buffType: 'blossom',
    maxHp: 920,
    attack: 44,
    goldReward: 135,
    expReward: 140,
  },
  {
    id: 'camp_river_sprite_n',
    nameId: 'Roh Sungai Barat',
    nameEn: 'West River Sprite',
    x: 900,
    y: 900,
    isBuff: false,
    maxHp: 560,
    attack: 28,
    goldReward: 80,
    expReward: 85,
  },
  {
    id: 'camp_river_sprite_s',
    nameId: 'Roh Sungai Timur',
    nameEn: 'East River Sprite',
    x: 1500,
    y: 1500,
    isBuff: false,
    maxHp: 560,
    attack: 28,
    goldReward: 80,
    expReward: 85,
  },
];
