import React, { useEffect, useState } from 'react';
import { soundEngine } from './audio/soundEngine';
import { AuthModal } from './components/AuthModal';
import { DashboardShell, DashboardTab } from './components/dashboard/DashboardShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GameArenaView } from './components/GameArenaView';
import { LandingPage } from './components/LandingPage';
import {
  createStarterPrivateProfile,
  createStarterPublicProfile,
  DEFAULT_SETTINGS,
} from './data/collection';
import { applyExpGain, computeUpdatedRank } from './game/rules';
import { I18nProvider, useI18n } from './localization/i18n';
import {
  ensurePlayerProfiles,
  fetchUserMatches,
  logoutUser,
  recordMatchToFirestore,
  savePrivateProfile,
  savePublicProfile,
  subscribeAuth,
  testConnection,
} from './services/firebase';
import {
  Difficulty,
  GameSettings,
  LiveMatchStats,
  MatchRecord,
  PrivateProfile,
  PublicProfile,
} from './types/game';

const GUEST_STORAGE_KEY = 'molecall_guest_state_v1';

interface GuestSnapshot {
  publicProfile: PublicProfile;
  privateProfile: PrivateProfile;
  matches: MatchRecord[];
}

function loadGuestSnapshot(): GuestSnapshot {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GuestSnapshot;
      if (parsed.publicProfile && parsed.privateProfile) return parsed;
    }
  } catch {
    // Ignore parse error
  }
  return {
    publicProfile: createStarterPublicProfile('guest_local', 'AetherGuest', true),
    privateProfile: createStarterPrivateProfile('guest_local'),
    matches: [],
  };
}

function saveGuestSnapshot(snap: GuestSnapshot) {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(snap));
  } catch {
    // Ignore storage error
  }
}

const MoLeCallPlatform: React.FC = () => {
  const { setLang } = useI18n();
  const [screen, setScreen] = useState<'landing' | 'dashboard' | 'arena'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('autostart') === '1' ? 'arena' : 'landing';
  });
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [isGuest, setIsGuest] = useState(true);
  const [publicProfile, setPublicProfile] = useState<PublicProfile>(() => loadGuestSnapshot().publicProfile);
  const [privateProfile, setPrivateProfile] = useState<PrivateProfile>(() => loadGuestSnapshot().privateProfile);
  const [matches, setMatches] = useState<MatchRecord[]>(() => loadGuestSnapshot().matches);

  const [arenaConfig, setArenaConfig] = useState<{
    heroId: string;
    difficulty: Difficulty;
    mode: 'offline_ai' | 'online_demo';
  }>({
    heroId: 'aether',
    difficulty: 'normal',
    mode: 'offline_ai',
  });

  useEffect(() => {
    testConnection();
    const unsub = subscribeAuth(async (user) => {
      if (user) {
        try {
          const { publicProfile: pub, privateProfile: priv } = await ensurePlayerProfiles(user);
          setIsGuest(false);
          setPublicProfile(pub);
          setPrivateProfile(priv);
          if (priv.settings?.language) setLang(priv.settings.language);
          const hist = await fetchUserMatches(user.uid).catch(() => []);
          setMatches(hist);
        } catch {
          // Keep current state on transient network errors
        }
      } else {
        const guest = loadGuestSnapshot();
        setIsGuest(true);
        setPublicProfile(guest.publicProfile);
        setPrivateProfile(guest.privateProfile);
        setMatches(guest.matches);
      }
    });
    return () => unsub();
  }, []);

  // Sync audio & persist guest state
  useEffect(() => {
    soundEngine.syncSettings(privateProfile.settings || DEFAULT_SETTINGS);
    if (isGuest) {
      saveGuestSnapshot({ publicProfile, privateProfile, matches });
    }
  }, [publicProfile, privateProfile, matches, isGuest]);

  const enterGuestDashboard = (username = 'AetherGuest', avatarId = 'avatar_aether') => {
    setIsGuest(true);
    setPublicProfile((prev) => ({
      ...prev,
      username: username.slice(0, 24) || prev.username,
      avatar: avatarId || prev.avatar,
    }));
    setAuthModalOpen(false);
    setScreen('dashboard');
    setDashboardTab('play');
  };

  const launchMatch = (
    heroId: string,
    difficulty: Difficulty,
    mode: 'offline_ai' | 'online_demo'
  ) => {
    soundEngine.playClick();
    setArenaConfig({ heroId, difficulty, mode });
    setScreen('arena');
  };

  const handleMatchComplete = async (stats: LiveMatchStats) => {
    const won = stats.result === 'victory';
    let shardsEarned = won ? 180 : 75;
    let expEarned = won ? 160 : 90;

    // Try authoritative backend verification if online
    try {
      const resp = await fetch('/api/verify-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats),
      });
      if (resp.ok) {
        const verified = await resp.json();
        if (typeof verified.shardsEarned === 'number') shardsEarned = verified.shardsEarned;
        if (typeof verified.expEarned === 'number') expEarned = verified.expEarned;
      }
    } catch {
      // Offline fallback works seamlessly
    }

    const nextExp = applyExpGain(publicProfile.level, publicProfile.exp, expEarned);
    const nextRank = computeUpdatedRank(publicProfile.rankPoints, won);
    const updatedPub: PublicProfile = {
      ...publicProfile,
      wins: publicProfile.wins + (won ? 1 : 0),
      losses: publicProfile.losses + (won ? 0 : 1),
      totalMatches: publicProfile.totalMatches + 1,
      level: nextExp.level,
      exp: nextExp.exp,
      rankPoints: nextRank.rankPoints,
      rankTier: nextRank.rankTier,
      updatedAt: new Date().toISOString(),
    };
    const updatedPriv: PrivateProfile = {
      ...privateProfile,
      aetherShards: privateProfile.aetherShards + shardsEarned,
      updatedAt: new Date().toISOString(),
    };

    setPublicProfile(updatedPub);
    setPrivateProfile(updatedPriv);

    const newMatch: MatchRecord = {
      id: `local_${Date.now()}`,
      ownerUid: publicProfile.uid,
      mode: stats.mode,
      difficulty: stats.difficulty,
      heroId: stats.heroId,
      result: stats.result,
      kills: stats.kills,
      deaths: stats.deaths,
      assists: stats.assists,
      goldEarned: stats.goldEarned,
      durationSec: stats.durationSec,
      createdAt: new Date().toISOString(),
    };
    setMatches((prev) => [newMatch, ...prev].slice(0, 20));

    if (!isGuest) {
      savePublicProfile(publicProfile.uid, updatedPub).catch(() => {});
      savePrivateProfile(publicProfile.uid, { aetherShards: updatedPriv.aetherShards }).catch(() => {});
      const { id: _ignore, ...payload } = newMatch;
      recordMatchToFirestore(payload).catch(() => {});
    }
  };

  const handleUnlockHero = (heroId: string, cost: number) => {
    if (privateProfile.aetherShards < cost || privateProfile.ownedHeroIds.includes(heroId)) return;
    const nextShards = privateProfile.aetherShards - cost;
    const nextHeroes = [...privateProfile.ownedHeroIds, heroId];
    setPrivateProfile((prev) => ({
      ...prev,
      aetherShards: nextShards,
      ownedHeroIds: nextHeroes,
    }));
    if (!isGuest) {
      savePrivateProfile(publicProfile.uid, { aetherShards: nextShards, ownedHeroIds: nextHeroes }).catch(
        () => {}
      );
    }
  };

  const handleUnlockCosmetic = (
    category: 'skin' | 'emote' | 'border' | 'avatar',
    id: string,
    cost: number
  ) => {
    if (privateProfile.aetherShards < cost) return;
    const nextShards = privateProfile.aetherShards - cost;
    const patch: Partial<PrivateProfile> = { aetherShards: nextShards };

    if (category === 'skin') patch.ownedSkinIds = [...privateProfile.ownedSkinIds, id];
    if (category === 'emote') patch.ownedEmoteIds = [...privateProfile.ownedEmoteIds, id];
    if (category === 'border') patch.ownedBorderIds = [...privateProfile.ownedBorderIds, id];
    if (category === 'avatar') patch.ownedAvatarIds = [...privateProfile.ownedAvatarIds, id];

    setPrivateProfile((prev) => ({ ...prev, ...patch }));
    if (!isGuest) {
      savePrivateProfile(publicProfile.uid, patch).catch(() => {});
    }
  };

  const handleEquipAvatarOrBorder = (field: 'avatar' | 'borderId', id: string) => {
    setPublicProfile((prev) => ({ ...prev, [field]: id }));
    if (!isGuest) {
      savePublicProfile(publicProfile.uid, { [field]: id }).catch(() => {});
    }
  };

  const handleSaveProfile = (patch: Partial<PublicProfile>) => {
    setPublicProfile((prev) => ({ ...prev, ...patch }));
    if (!isGuest) {
      savePublicProfile(publicProfile.uid, patch).catch(() => {});
    }
  };

  const handleUpdateSettings = (patch: Partial<GameSettings>) => {
    const nextSettings = { ...privateProfile.settings, ...patch };
    setPrivateProfile((prev) => ({ ...prev, settings: nextSettings }));
    if (!isGuest) {
      savePrivateProfile(publicProfile.uid, { settings: nextSettings }).catch(() => {});
    }
  };

  const handleLogout = async () => {
    if (!isGuest) {
      await logoutUser().catch(() => {});
    }
    setScreen('landing');
  };

  return (
    <>
      {screen === 'landing' && (
        <LandingPage
          isLoggedIn={!isGuest}
          onPlayNow={() => {
            if (!isGuest) {
              setScreen('dashboard');
              setDashboardTab('play');
            } else {
              setAuthModalOpen(true);
            }
          }}
          onGuestQuickPlay={() => enterGuestDashboard()}
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenDashboardSection={(tab) => {
            setDashboardTab(tab as DashboardTab);
            setScreen('dashboard');
          }}
        />
      )}

      {screen === 'dashboard' && (
        <DashboardShell
          activeTab={dashboardTab}
          onSelectTab={setDashboardTab}
          publicProfile={publicProfile}
          privateProfile={privateProfile}
          matches={matches}
          isGuest={isGuest}
          onLaunchMatch={launchMatch}
          onUnlockHero={handleUnlockHero}
          onUnlockCosmetic={handleUnlockCosmetic}
          onEquipAvatarOrBorder={handleEquipAvatarOrBorder}
          onSaveProfile={handleSaveProfile}
          onUpdateSettings={handleUpdateSettings}
          onLogout={handleLogout}
          onBackToLanding={() => setScreen('landing')}
        />
      )}

      {screen === 'arena' && (
        <GameArenaView
          heroId={arenaConfig.heroId}
          difficulty={arenaConfig.difficulty}
          mode={arenaConfig.mode}
          settings={privateProfile.settings || DEFAULT_SETTINGS}
          onToggleMute={() => handleUpdateSettings({ muted: !privateProfile.settings.muted })}
          onMatchComplete={handleMatchComplete}
          onExitArena={() => setScreen('dashboard')}
        />
      )}

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onEnterGuest={(uname, av) => enterGuestDashboard(uname, av)}
        onAuthSuccess={() => {
          setAuthModalOpen(false);
          setScreen('dashboard');
          setDashboardTab('home');
        }}
      />
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <MoLeCallPlatform />
      </I18nProvider>
    </ErrorBoundary>
  );
}
