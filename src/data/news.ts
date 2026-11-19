import { NewsArticle } from '../types/game';

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'patch-1-0-aetheria',
    category: 'update',
    version: 'Season 1 · Aetheria Dawn',
    publishedAt: '2026-11-18',
    title: {
      id: 'Pembukaan Resmi Kerajaan Aetheria & 12 Hero Original',
      en: 'Grand Opening of The Kingdom of Aetheria & 12 Original Heroes',
    },
    summary: {
      id: 'Masuki arena MOBA 2.5D isometric dengan tiga lane simetris, monster buff langit, dan 12 hero dengan kemampuan unik.',
      en: 'Enter the 2.5D isometric MOBA arena featuring three balanced lanes, sky buff monsters, and 12 distinct original heroes.',
    },
    details: {
      id: [
        'Peta simetris The Kingdom of Aetheria kini aktif dengan 3 lane, sungai ajaib, 18 turret pertahanan, dan Nexus kristal.',
        'Mode Offline vs AI mendukung tingkat kesulitan Easy, Normal, dan Hard lengkap dengan rekan satu tim bot.',
        'Lobi Multiplayer 5v5 kini terhubung melalui WebSocket server otoritatif.',
      ],
      en: [
        'The symmetric Kingdom of Aetheria map is live with 3 lanes, magical river, 18 defense turrets, and Nexus crystals.',
        'Offline vs AI mode supports Easy, Normal, and Hard difficulties with full allied and enemy bot teams.',
        '5v5 Multiplayer Lobby connects via authoritative WebSocket server.',
      ],
    },
  },
  {
    id: 'hero-spotlight-aether-seraphina',
    category: 'hero',
    version: 'Hero Spotlight',
    publishedAt: '2026-11-15',
    title: {
      id: 'Sorotan Hero: Aether & Seraphina Penjaga Langit',
      en: 'Hero Spotlight: Aether & Seraphina of the Sky Citadel',
    },
    summary: {
      id: 'Pelajari kombinasi serangan area Aether bersama perisai penyembuh Seraphina untuk mendominasi pertarungan tim.',
      en: 'Master Aether’s arcane area bursts paired with Seraphina’s healing sanctuary to dominate team fights.',
    },
    details: {
      id: [
        'Skill Ultimate Aether (Celestial Tempest) menghasilkan kerusakan sihir area besar di sekitar target.',
        'Seraphina dapat memulihkan HP sekutu dan memberi bonus kecepatan gerak di jalur sungai.',
      ],
      en: [
        'Aether’s Ultimate (Celestial Tempest) unleashes massive area magic damage around the target zone.',
        'Seraphina restores allied HP while granting bonus movement speed across river skirmishes.',
      ],
    },
  },
  {
    id: 'balance-patch-1-02',
    category: 'balance',
    version: 'Patch 1.02',
    publishedAt: '2026-11-12',
    title: {
      id: 'Penyesuaian Keseimbangan Turret, Minion & Monster Jungle',
      en: 'Balance Tuning for Turrets, Minion Waves & Jungle Monsters',
    },
    summary: {
      id: 'Peningkatan ketahanan turret awal pertandingan serta penyempurnaan hadiah gold dari monster buff Azure Sky Golem.',
      en: 'Improved early-game turret resilience and refined gold rewards from Azure Sky Golem buff camps.',
    },
    details: {
      id: [
        'Turret kini memberikan perlindungan lebih tinggi selama 3 menit pertama pertandingan.',
        'Mengalahkan Blossom Wyrm memberikan bonus regen mana dan kekuatan serangan tim.',
        'Sepatu Sakura Arkana kini memberikan 12% pengurangan cooldown.',
      ],
      en: [
        'Outer turrets now gain heightened early-game fortification during the first 3 minutes.',
        'Slaying the Blossom Wyrm grants team-wide mana regeneration and attack bonus.',
        'Blossom Arcane Shoes now grant 12% cooldown reduction.',
      ],
    },
  },
  {
    id: 'event-blossom-festival',
    category: 'event',
    version: 'Sky Blossom Event',
    publishedAt: '2026-11-10',
    title: {
      id: 'Festival Bunga Langit: Dapatkan Aether Shards Ganda',
      en: 'Sky Blossom Festival: Double Aether Shards Rewards',
    },
    summary: {
      id: 'Selesaikan pertandingan harian melawan bot atau di lobi 5v5 untuk membuka skin Blossom dan bingkai avatar eksklusif.',
      en: 'Complete daily AI or 5v5 lobby matches to unlock Blossom skins and exclusive avatar borders.',
    },
    details: {
      id: [
        'Setiap kemenangan memberikan +180 Aether Shards virtual untuk membuka hero dan skin di menu Koleksi.',
        'Semua konten kosmetik terbuka murni melalui progres dalam game tanpa transaksi uang asli.',
      ],
      en: [
        'Every victory awards +180 virtual Aether Shards to unlock heroes and skins in Collection.',
        'All cosmetics are unlocked strictly through in-game progression with zero real-money payments.',
      ],
    },
  },
];
