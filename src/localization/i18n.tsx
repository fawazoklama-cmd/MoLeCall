import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language } from '../types/game';

const STORAGE_KEY = 'molecall_language';

const TRANSLATIONS = {
  id: {
    // Brand & Nav
    brandTagline: 'Call Your Power. Rule The Battle.',
    navHeroes: 'Hero',
    navModes: 'Mode',
    navNews: 'Berita',
    navAbout: 'Tentang',
    playNow: 'MAIN SEKARANG',
    exploreHeroes: 'JELAJAHI HERO',
    loginRegister: 'Masuk / Daftar',
    guestMode: 'Mode Tamu (Offline vs Bot)',
    openDashboard: 'Buka Dasbor',
    logout: 'Keluar',

    // Landing
    heroSubtitle:
      'Masuki dunia fantasi The Kingdom of Aetheria dalam pertarungan MOBA 2.5D isometric 5v5. Pilih hero original, kuasai tiga lane, dan raih kemenangan.',
    statHeroesLabel: 'Hero Original',
    statModesLabel: 'Mode Pertandingan',
    statMapLabel: 'Peta Simetris',
    statBilingualLabel: 'Bahasa Aktif',
    featuredHeroesTitle: 'Hero Unggulan Aetheria',
    featuredHeroesDesc: 'Empat penjaga utama langit dengan gaya bertarung dan kemampuan unik.',
    gameModesTitle: 'Dua Dunia Pertarungan',
    offlineModeTitle: 'Mode Offline vs AI',
    offlineModeDesc:
      'Latih strategi tanpa koneksi internet bersama 4 rekan bot dan 5 musuh AI di tingkat Easy, Normal, atau Hard.',
    onlineModeTitle: 'Lobi 5v5 Online (WebSocket)',
    onlineModeDesc:
      'Buat ruang pertandingan, undang teman, dan sinkronisasi pemilihan hero secara real-time melalui server otoritatif.',
    gameplayPreviewTitle: 'Pratinjau Medan Perang 2.5D',
    gameplayPreviewDesc:
      'Kontrol responsif untuk PC (WASD, Mouse, Q/E/R/B) dan layar sentuh mobile (Joystick Virtual & Tombol Skill).',
    latestNewsTitle: 'Berita & Catatan Patch Terbaru',
    viewAllNews: 'Lihat Semua Berita',
    aboutBannerTitle: 'Dibangun Penuh Dedikasi untuk Komunitas MOBA',
    footerMadeBy: 'Made with creativity by VennDev',
    footerReqBy: 'Website Request by Callysta',

    // Auth
    authTitleLogin: 'Masuk ke MoLeCall',
    authTitleRegister: 'Buat Akun Pemain',
    authTitleReset: 'Atur Ulang Kata Sandi',
    emailLabel: 'Email',
    passwordLabel: 'Kata Sandi',
    usernameLabel: 'Nama Pengguna',
    chooseAvatar: 'Pilih Avatar Awal',
    loginBtn: 'Masuk',
    registerBtn: 'Daftar Sekarang',
    resetBtn: 'Kirim Email Reset',
    googleLoginBtn: 'Lanjutkan dengan Google',
    guestPlayBtn: 'Main Langsung sebagai Tamu',
    forgotPassLink: 'Lupa kata sandi?',
    switchToRegister: 'Belum punya akun? Daftar',
    switchToLogin: 'Sudah punya akun? Masuk',
    backToLogin: 'Kembali ke Masuk',
    resetSentMsg: 'Tautan atur ulang kata sandi telah dikirim ke email Anda.',
    authGuestBadge: 'Mode Tamu Lokal',

    // Dashboard Menu
    menuDashboard: 'Beranda',
    menuPlay: 'Bermain',
    menuHeroes: 'Hero',
    menuCollection: 'Koleksi',
    menuShop: 'Toko',
    menuFriends: 'Teman',
    menuLeaderboard: 'Peringkat',
    menuNews: 'Berita',
    menuProfile: 'Profil',
    menuSettings: 'Pengaturan',
    menuAbout: 'Tentang',

    // Dashboard Overview
    welcomePlayer: 'Selamat Datang',
    totalMatches: 'Total Laga',
    wins: 'Menang',
    losses: 'Kalah',
    winRate: 'Rasio Menang',
    recentMatches: 'Riwayat Pertandingan Terbaru',
    noMatchesYet: 'Belum ada riwayat pertandingan. Mulai laga Offline vs AI pertamamu!',
    quickLaunchOffline: 'Laga Cepat vs AI',
    quickLaunchOnline: 'Buka Lobi 5v5',
    aetherShards: 'Aether Shards',
    level: 'Level',

    // Play Mode
    offlineSectionTitle: 'Offline Classic vs AI (The Kingdom of Aetheria)',
    offlineSectionDesc: 'Pertandingan penuh 5v5 berjalan 100% di perangkat Anda tanpa internet.',
    selectDifficulty: 'Pilih Kesulitan AI',
    diffEasy: 'Mudah',
    diffNormal: 'Normal',
    diffHard: 'Sulit',
    selectYourHero: 'Pilih Hero Anda',
    mapName: 'Peta: The Kingdom of Aetheria (3 Lane · Sungai · Jungle)',
    launchMatchBtn: 'MULAI PERTANDINGAN',
    onlineSectionTitle: 'Multiplayer Online 5v5 (WebSocket Server)',
    onlineDemoNotice:
      'LOBI LIVE WEBSOCKET (DEMO BOT BACKFILL): Terhubung ke server otoritatif port 3000. Slot kosong otomatis diisi AI server saat pertandingan dimulai.',
    createRoomBtn: 'Buat Ruang',
    quickMatchBtn: 'Laga Cepat',
    roomNamePlaceholder: 'Nama ruang baru...',
    activeRooms: 'Ruang Aktif',
    joinRoomBtn: 'Gabung',
    leaveRoomBtn: 'Keluar Ruang',
    readyBtn: 'Siap',
    unreadyBtn: 'Batal Siap',
    startOnlineMatchBtn: 'Mulai Laga 5v5',
    roomChatPlaceholder: 'Kirim pesan ke lobi...',
    sendBtn: 'Kirim',
    noRoomsMsg: 'Belum ada ruang aktif. Buat ruang baru atau tekan Laga Cepat!',

    // Heroes & Collection & Shop
    allRoles: 'Semua Role',
    owned: 'Dimiliki',
    locked: 'Terkunci',
    unlockWith: 'Buka dengan',
    unlocked: 'Terbuka',
    equipped: 'Dipakai',
    equip: 'Pakai',
    buy: 'Beli',
    insufficientShards: 'Aether Shards tidak cukup',
    tabSkins: 'Skin Hero',
    tabEmotes: 'Emote',
    tabBorders: 'Bingkai',
    tabAvatars: 'Avatar',
    itemEncyclopedia: 'Ensiklopedia Item Pertandingan',
    recommendedFor: 'Direkomendasikan untuk',

    // Friends
    friendsTitle: 'Daftar Teman & Undangan',
    searchPlayerPlaceholder: 'Cari Username atau Player ID (misal MLC-1234)...',
    searchBtn: 'Cari',
    addFriendBtn: 'Tambah Teman',
    pendingRequests: 'Permintaan Masuk',
    acceptBtn: 'Terima',
    rejectBtn: 'Tolak',
    removeBtn: 'Hapus',
    inviteToRoomBtn: 'Undang ke Ruang',
    friendsGuestHint: 'Login dengan akun Firebase untuk menambah teman lintas pemain, atau kelola daftar teman lokal Anda.',
    statusOnline: 'Online',
    statusOffline: 'Offline',
    statusInMatch: 'Dalam Laga',

    // Leaderboard
    leaderboardTitle: 'Papan Peringkat Global',
    tabGlobal: 'Global',
    tabWeekly: 'Mingguan',
    tabMonthly: 'Bulanan',
    tabFriends: 'Teman',
    colRank: 'Posisi',
    colPlayer: 'Pemain',
    colTier: 'Tier',
    colPoints: 'Poin',
    colWinRate: 'Win Rate',

    // Profile
    editProfile: 'Ubah Profil',
    saveProfile: 'Simpan Profil',
    favoriteHero: 'Hero Favorit',
    achievementsTitle: 'Pencapaian',

    // Settings
    settingsTitle: 'Pengaturan Sistem & Kontrol',
    languageSetting: 'Bahasa Antarmuka',
    soundVolume: 'Volume Efek Suara',
    musicVolume: 'Volume Musik Latar',
    muteAudio: 'Bisukan Semua Audio',
    graphicsQuality: 'Kualitas Grafis',
    fpsLimit: 'Batas FPS',
    cameraSensitivity: 'Sensitivitas Kamera',
    controlsGuide: 'Panduan Kontrol PC & Mobile',

    // About
    aboutTitle: 'Tentang MoLeCall',
    aboutLead:
      'MoLeCall adalah platform MOBA 2.5D original bertema fantasi langit biru dan merah muda yang dirancang agar dapat dimainkan langsung dari browser PC maupun mobile.',
    creditDev: 'Konsep & Pengembangan Game',
    creditReq: 'Permintaan Website',
    creditIg: 'Instagram Developer',
    followDeveloper: 'FOLLOW DEVELOPER',

    // In-Game HUD
    hudGold: 'Gold',
    hudLevel: 'Lv',
    hudItemShop: 'Toko Item',
    hudPause: 'Jeda',
    hudRecall: 'Recall',
    hudClose: 'Tutup',
    hudResume: 'Lanjutkan',
    hudRestart: 'Ulangi Laga',
    hudExitToMenu: 'Keluar ke Dasbor',
    hudVictory: 'KEMENANGAN!',
    hudDefeat: 'KEKALAHAN',
    hudVictoryDesc: 'Nexus Merah di Kerajaan Aetheria berhasil dihancurkan!',
    hudDefeatDesc: 'Nexus Biru jatuh di medan perang Aetheria.',
    hudMatchTime: 'Waktu',
    hudKda: 'K / D / A',
    hudTurrets: 'Turret Hancur',
    hudShardsReward: 'Hadiah Aether Shards',
    hudLoading: 'Memuat Kerajaan Aetheria...',
    hudInsufficientGold: 'Gold belum mencukupi!',
    hudInventoryFull: 'Slot item penuh (maks 6)!',
    hudPurchased: 'Item dibeli!',
    hudControlsHint: 'WASD Gerak · Klik Serang · Q/E/R Skill · B Recall · Space Kamera · Tab Toko',
  },
  en: {
    // Brand & Nav
    brandTagline: 'Call Your Power. Rule The Battle.',
    navHeroes: 'Heroes',
    navModes: 'Modes',
    navNews: 'News',
    navAbout: 'About',
    playNow: 'PLAY NOW',
    exploreHeroes: 'EXPLORE HEROES',
    loginRegister: 'Login / Register',
    guestMode: 'Guest Mode (Offline vs Bot)',
    openDashboard: 'Open Dashboard',
    logout: 'Sign Out',

    // Landing
    heroSubtitle:
      'Enter the sky-fantasy realm of The Kingdom of Aetheria in 2.5D isometric 5v5 MOBA battles. Master 12 original heroes, push three lanes, and claim victory.',
    statHeroesLabel: 'Original Heroes',
    statModesLabel: 'Game Modes',
    statMapLabel: 'Balanced Map',
    statBilingualLabel: 'Languages',
    featuredHeroesTitle: 'Featured Aetheria Heroes',
    featuredHeroesDesc: 'Four iconic sky guardians with distinct combat roles and elemental kits.',
    gameModesTitle: 'Two Battlegrounds',
    offlineModeTitle: 'Offline vs AI Mode',
    offlineModeDesc:
      'Practice anytime without internet alongside 4 AI teammates against 5 AI enemies across Easy, Normal, or Hard difficulty.',
    onlineModeTitle: 'Online 5v5 Lobby (WebSocket)',
    onlineModeDesc:
      'Create rooms, invite friends, and synchronize hero picks in real time over an authoritative WebSocket server.',
    gameplayPreviewTitle: '2.5D Isometric Arena Preview',
    gameplayPreviewDesc:
      'Responsive PC controls (WASD, Mouse Aim, Q/E/R/B) and smooth mobile touch controls (Virtual Joystick & Skill Pads).',
    latestNewsTitle: 'Latest News & Patch Notes',
    viewAllNews: 'View All News',
    aboutBannerTitle: 'Crafted with Passion for Browser MOBA Players',
    footerMadeBy: 'Made with creativity by VennDev',
    footerReqBy: 'Website Request by Callysta',

    // Auth
    authTitleLogin: 'Sign In to MoLeCall',
    authTitleRegister: 'Create Player Account',
    authTitleReset: 'Reset Password',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    usernameLabel: 'Username',
    chooseAvatar: 'Choose Starter Avatar',
    loginBtn: 'Sign In',
    registerBtn: 'Create Account',
    resetBtn: 'Send Reset Email',
    googleLoginBtn: 'Continue with Google',
    guestPlayBtn: 'Play Instantly as Guest',
    forgotPassLink: 'Forgot password?',
    switchToRegister: 'New here? Create an account',
    switchToLogin: 'Already have an account? Sign in',
    backToLogin: 'Back to Sign In',
    resetSentMsg: 'Password reset instructions have been sent to your email.',
    authGuestBadge: 'Local Guest Mode',

    // Dashboard Menu
    menuDashboard: 'Dashboard',
    menuPlay: 'Play',
    menuHeroes: 'Heroes',
    menuCollection: 'Collection',
    menuShop: 'Shop',
    menuFriends: 'Friends',
    menuLeaderboard: 'Leaderboard',
    menuNews: 'News',
    menuProfile: 'Profile',
    menuSettings: 'Settings',
    menuAbout: 'About',

    // Dashboard Overview
    welcomePlayer: 'Welcome Back',
    totalMatches: 'Total Matches',
    wins: 'Wins',
    losses: 'Losses',
    winRate: 'Win Rate',
    recentMatches: 'Recent Match History',
    noMatchesYet: 'No match history yet. Launch your first Offline vs AI battle!',
    quickLaunchOffline: 'Quick Play vs AI',
    quickLaunchOnline: 'Open 5v5 Lobby',
    aetherShards: 'Aether Shards',
    level: 'Level',

    // Play Mode
    offlineSectionTitle: 'Offline Classic vs AI (The Kingdom of Aetheria)',
    offlineSectionDesc: 'Complete 5v5 match running 100% locally on your device without internet.',
    selectDifficulty: 'Select AI Difficulty',
    diffEasy: 'Easy',
    diffNormal: 'Normal',
    diffHard: 'Hard',
    selectYourHero: 'Select Your Hero',
    mapName: 'Map: The Kingdom of Aetheria (3 Lanes · River · Jungle)',
    launchMatchBtn: 'START MATCH',
    onlineSectionTitle: 'Online 5v5 Multiplayer (WebSocket Server)',
    onlineDemoNotice:
      'LIVE WEBSOCKET LOBBY (DEMO BOT BACKFILL): Connected to authoritative server on port 3000. Unfilled slots automatically use server AI bots when the match begins.',
    createRoomBtn: 'Create Room',
    quickMatchBtn: 'Quick Match',
    roomNamePlaceholder: 'New room name...',
    activeRooms: 'Active Rooms',
    joinRoomBtn: 'Join',
    leaveRoomBtn: 'Leave Room',
    readyBtn: 'Ready',
    unreadyBtn: 'Unready',
    startOnlineMatchBtn: 'Start 5v5 Match',
    roomChatPlaceholder: 'Message room...',
    sendBtn: 'Send',
    noRoomsMsg: 'No active rooms yet. Create one or press Quick Match!',

    // Heroes & Collection & Shop
    allRoles: 'All Roles',
    owned: 'Owned',
    locked: 'Locked',
    unlockWith: 'Unlock for',
    unlocked: 'Unlocked',
    equipped: 'Equipped',
    equip: 'Equip',
    buy: 'Buy',
    insufficientShards: 'Not enough Aether Shards',
    tabSkins: 'Hero Skins',
    tabEmotes: 'Emotes',
    tabBorders: 'Borders',
    tabAvatars: 'Avatars',
    itemEncyclopedia: 'In-Match Item Encyclopedia',
    recommendedFor: 'Recommended for',

    // Friends
    friendsTitle: 'Friends & Room Invites',
    searchPlayerPlaceholder: 'Search Username or Player ID (e.g. MLC-1234)...',
    searchBtn: 'Search',
    addFriendBtn: 'Add Friend',
    pendingRequests: 'Incoming Requests',
    acceptBtn: 'Accept',
    rejectBtn: 'Reject',
    removeBtn: 'Remove',
    inviteToRoomBtn: 'Invite to Room',
    friendsGuestHint: 'Sign in with Firebase to add cross-player friends, or manage your local squad list.',
    statusOnline: 'Online',
    statusOffline: 'Offline',
    statusInMatch: 'In Match',

    // Leaderboard
    leaderboardTitle: 'Global Rankings',
    tabGlobal: 'Global',
    tabWeekly: 'Weekly',
    tabMonthly: 'Monthly',
    tabFriends: 'Friends',
    colRank: 'Rank',
    colPlayer: 'Player',
    colTier: 'Tier',
    colPoints: 'Points',
    colWinRate: 'Win Rate',

    // Profile
    editProfile: 'Edit Profile',
    saveProfile: 'Save Profile',
    favoriteHero: 'Favorite Hero',
    achievementsTitle: 'Achievements',

    // Settings
    settingsTitle: 'System & Control Settings',
    languageSetting: 'Interface Language',
    soundVolume: 'Sound Effects Volume',
    musicVolume: 'Background Music Volume',
    muteAudio: 'Mute All Audio',
    graphicsQuality: 'Graphics Quality',
    fpsLimit: 'FPS Limit',
    cameraSensitivity: 'Camera Sensitivity',
    controlsGuide: 'PC & Mobile Controls Guide',

    // About
    aboutTitle: 'About MoLeCall',
    aboutLead:
      'MoLeCall is an original 2.5D sky-and-rose fantasy MOBA platform engineered to play smoothly right inside desktop and mobile browsers.',
    creditDev: 'Game Concept & Development',
    creditReq: 'Website Request',
    creditIg: 'Developer Instagram',
    followDeveloper: 'FOLLOW DEVELOPER',

    // In-Game HUD
    hudGold: 'Gold',
    hudLevel: 'Lv',
    hudItemShop: 'Item Shop',
    hudPause: 'Pause',
    hudRecall: 'Recall',
    hudClose: 'Close',
    hudResume: 'Resume',
    hudRestart: 'Restart Match',
    hudExitToMenu: 'Exit to Dashboard',
    hudVictory: 'VICTORY!',
    hudDefeat: 'DEFEAT',
    hudVictoryDesc: 'The Red Nexus in Aetheria has been shattered!',
    hudDefeatDesc: 'The Blue Nexus fell in battle.',
    hudMatchTime: 'Match Time',
    hudKda: 'K / D / A',
    hudTurrets: 'Turrets Destroyed',
    hudShardsReward: 'Aether Shards Earned',
    hudLoading: 'Loading The Kingdom of Aetheria...',
    hudInsufficientGold: 'Not enough Gold!',
    hudInventoryFull: 'Inventory full (max 6 items)!',
    hudPurchased: 'Item purchased!',
    hudControlsHint: 'WASD Move · Click Attack · Q/E/R Skills · B Recall · Space Camera · Tab Shop',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.id;

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'id' || saved === 'en') return saved;
    } catch {
      // Ignore storage error
    }
    return 'id'; // Default Indonesian per spec
  });

  const setLang = (next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => setLang(lang === 'id' ? 'en' : 'id');

  const t = (key: TranslationKey): string => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS.id[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
