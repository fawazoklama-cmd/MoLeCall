import React, { useState } from 'react';
import {
  BookOpen,
  Globe,
  Home,
  Info,
  Menu,
  Newspaper,
  Settings as SettingsIcon,
  Shield,
  ShoppingBag,
  Sparkles,
  Swords,
  Trophy,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { getHeroById } from '../../data/heroes';
import { computeWinRate } from '../../game/rules';
import { useI18n } from '../../localization/i18n';
import {
  Difficulty,
  GameSettings,
  MatchRecord,
  PrivateProfile,
  PublicProfile,
} from '../../types/game';
import { BrandLogo } from '../BrandLogo';
import { RankEmblem } from '../RankEmblem';
import { CollectionView } from './CollectionView';
import { FriendsView } from './FriendsView';
import { HeroesView } from './HeroesView';
import { LeaderboardView } from './LeaderboardView';
import { PlayModeView } from './PlayModeView';
import { AboutView, NewsView, ProfileView, SettingsView } from './SecondaryViews';
import { ShopView } from './ShopView';

export type DashboardTab =
  | 'home'
  | 'play'
  | 'heroes'
  | 'collection'
  | 'shop'
  | 'friends'
  | 'leaderboard'
  | 'news'
  | 'profile'
  | 'settings'
  | 'about';

interface DashboardShellProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  publicProfile: PublicProfile;
  privateProfile: PrivateProfile;
  matches: MatchRecord[];
  isGuest: boolean;
  onLaunchMatch: (heroId: string, difficulty: Difficulty, mode: 'offline_ai' | 'online_demo') => void;
  onUnlockHero: (heroId: string, cost: number) => void;
  onUnlockCosmetic: (category: 'skin' | 'emote' | 'border' | 'avatar', id: string, cost: number) => void;
  onEquipAvatarOrBorder: (field: 'avatar' | 'borderId', id: string) => void;
  onSaveProfile: (patch: Partial<PublicProfile>) => void;
  onUpdateSettings: (patch: Partial<GameSettings>) => void;
  onLogout: () => void;
  onBackToLanding: () => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  activeTab,
  onSelectTab,
  publicProfile,
  privateProfile,
  matches,
  isGuest,
  onLaunchMatch,
  onUnlockHero,
  onUnlockCosmetic,
  onEquipAvatarOrBorder,
  onSaveProfile,
  onUpdateSettings,
  onLogout,
  onBackToLanding,
}) => {
  const { lang, toggleLang, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: DashboardTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: t('menuDashboard'), icon: <Home className="w-4 h-4" /> },
    { id: 'play', label: t('menuPlay'), icon: <Swords className="w-4 h-4" /> },
    { id: 'heroes', label: t('menuHeroes'), icon: <Shield className="w-4 h-4" /> },
    { id: 'collection', label: t('menuCollection'), icon: <Sparkles className="w-4 h-4" /> },
    { id: 'shop', label: t('menuShop'), icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'friends', label: t('menuFriends'), icon: <Users className="w-4 h-4" /> },
    { id: 'leaderboard', label: t('menuLeaderboard'), icon: <Trophy className="w-4 h-4" /> },
    { id: 'news', label: t('menuNews'), icon: <Newspaper className="w-4 h-4" /> },
    { id: 'profile', label: t('menuProfile'), icon: <UserIcon className="w-4 h-4" /> },
    { id: 'settings', label: t('menuSettings'), icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'about', label: t('menuAbout'), icon: <Info className="w-4 h-4" /> },
  ];

  const winRate = computeWinRate(publicProfile.wins, publicProfile.totalMatches);

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4 space-y-4">
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBackToLanding}
          className="px-2 py-1 text-left cursor-pointer"
          aria-label="MoLeCall Home"
        >
          <BrandLogo size={32} />
        </button>

        {/* Mini Player Card */}
        <div className="p-3.5 rounded-2xl bg-[#F4F9FF] border border-[#B9E3FF] flex items-center gap-3">
          <RankEmblem tier={publicProfile.rankTier} size={36} />
          <div className="min-w-0">
            <p className="font-display font-bold text-sm text-[#172B49] truncate">
              {publicProfile.username}
            </p>
            <p className="text-[11px] font-mono-tabular text-[#3478D4] font-semibold">
              {publicProfile.rankTier} · Lv.{publicProfile.level}
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#3478D4] text-white shadow-sm'
                    : 'text-[#172B49]/75 hover:bg-[#F4F9FF] hover:text-[#172B49]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-3 border-t border-[#F4F9FF] text-[11px] text-[#172B49]/60 px-2">
        <p>{t('footerMadeBy')}</p>
        <p>{t('footerReqBy')}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F9FF] text-[#172B49] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-[#B9E3FF] sticky top-0 h-screen overflow-y-auto">
        {renderSidebarContent()}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#B9E3FF] px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 rounded-xl border border-[#B9E3FF] bg-white text-[#172B49]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-display font-bold text-base sm:text-lg text-[#172B49] whitespace-nowrap">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block font-mono-tabular text-xs font-bold text-[#3478D4] bg-[#F4F9FF] border border-[#B9E3FF] px-3 py-1.5 rounded-xl">
              {privateProfile.aetherShards} {t('aetherShards')}
            </span>
            <button
              type="button"
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F9FF] border border-[#B9E3FF] text-xs font-bold text-[#3478D4] cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang.toUpperCase()}</span>
            </button>
            {activeTab !== 'play' && (
              <button
                type="button"
                onClick={() => onSelectTab('play')}
                className="px-4 py-2 rounded-xl bg-[#3478D4] text-white text-xs font-bold hover:bg-[#2762B5] whitespace-nowrap cursor-pointer"
              >
                {t('playNow')}
              </button>
            )}
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="w-68 bg-white h-full border-r border-[#B9E3FF] overflow-y-auto relative">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="absolute top-4 right-4 p-2 rounded-xl text-[#172B49]"
              >
                <X className="w-5 h-5" />
              </button>
              {renderSidebarContent()}
            </div>
            <div
              className="flex-1 bg-[#172B49]/40"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Active Tab Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-[#EBF6FF] via-white to-[#FFEAF2] border border-[#B9E3FF] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <RankEmblem tier={publicProfile.rankTier} size={60} />
                  <div>
                    <p className="text-xs font-semibold text-[#3478D4]">
                      {publicProfile.playerId} · {isGuest ? t('authGuestBadge') : publicProfile.rankTier}
                    </p>
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#172B49]">
                      {t('welcomePlayer')}, {publicProfile.username}
                    </h1>
                    <p className="text-xs text-[#172B49]/70 mt-1">
                      {t('level')} {publicProfile.level} · {publicProfile.rankPoints} Rank Points
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    data-start="true"
                    onClick={() => onLaunchMatch(publicProfile.favoriteHeroId || 'aether', 'normal', 'offline_ai')}
                    className="px-5 py-3 rounded-2xl bg-[#3478D4] text-white text-xs font-bold hover:bg-[#2762B5] inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Swords className="w-4 h-4" />
                    <span>{t('quickLaunchOffline')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTab('play')}
                    className="px-5 py-3 rounded-2xl bg-white border border-[#FFB8D2] text-[#172B49] text-xs font-bold hover:bg-[#FFE0EC]/50 cursor-pointer"
                  >
                    {t('quickLaunchOnline')}
                  </button>
                </div>
              </div>

              {/* 4 KPI Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#B9E3FF] rounded-2xl p-5">
                  <p className="text-xs text-[#172B49]/65">{t('totalMatches')}</p>
                  <p className="font-display text-3xl font-extrabold text-[#172B49] tabular-nums mt-1">
                    {publicProfile.totalMatches}
                  </p>
                </div>
                <div className="bg-white border border-[#B9E3FF] rounded-2xl p-5">
                  <p className="text-xs text-[#172B49]/65">{t('wins')}</p>
                  <p className="font-display text-3xl font-extrabold text-[#3478D4] tabular-nums mt-1">
                    {publicProfile.wins}
                  </p>
                </div>
                <div className="bg-white border border-[#B9E3FF] rounded-2xl p-5">
                  <p className="text-xs text-[#172B49]/65">{t('losses')}</p>
                  <p className="font-display text-3xl font-extrabold text-[#D95D90] tabular-nums mt-1">
                    {publicProfile.losses}
                  </p>
                </div>
                <div className="bg-white border border-[#B9E3FF] rounded-2xl p-5">
                  <p className="text-xs text-[#172B49]/65">{t('winRate')}</p>
                  <p className="font-display text-3xl font-extrabold text-[#172B49] tabular-nums mt-1">
                    {winRate}%
                  </p>
                </div>
              </div>

              {/* Recent Match History */}
              <div className="bg-white border border-[#B9E3FF] rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-[#172B49] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#3478D4]" />
                    <span>{t('recentMatches')}</span>
                  </h2>
                </div>
                {matches.length === 0 ? (
                  <p className="text-sm text-[#172B49]/65">{t('noMatchesYet')}</p>
                ) : (
                  <div className="space-y-2.5">
                    {matches.slice(0, 6).map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-2xl bg-[#F4F9FF] border border-[#B9E3FF] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-bold ${
                              m.result === 'victory' ? 'text-[#3478D4]' : 'text-[#D95D90]'
                            }`}
                          >
                            {m.result.toUpperCase()}
                          </span>
                          <span className="font-bold text-[#172B49]">{getHeroById(m.heroId).name}</span>
                          <span className="text-[#172B49]/60">{m.mode}</span>
                        </div>
                        <span className="font-mono-tabular font-semibold text-[#172B49]">
                          {m.kills}/{m.deaths}/{m.assists} · {m.goldEarned}g
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'play' && (
            <PlayModeView
              profile={publicProfile}
              ownedHeroIds={privateProfile.ownedHeroIds}
              onLaunchMatch={onLaunchMatch}
            />
          )}

          {activeTab === 'heroes' && (
            <HeroesView
              ownedHeroIds={privateProfile.ownedHeroIds}
              aetherShards={privateProfile.aetherShards}
              onUnlockHero={onUnlockHero}
            />
          )}

          {activeTab === 'collection' && (
            <CollectionView
              publicProfile={publicProfile}
              privateProfile={privateProfile}
              onUnlockCosmetic={onUnlockCosmetic}
              onEquipAvatarOrBorder={onEquipAvatarOrBorder}
            />
          )}

          {activeTab === 'shop' && <ShopView />}

          {activeTab === 'friends' && (
            <FriendsView
              profile={publicProfile}
              isGuest={isGuest}
              onInviteToPlay={() => onSelectTab('play')}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView currentPlayer={publicProfile} isGuest={isGuest} />
          )}

          {activeTab === 'news' && <NewsView />}

          {activeTab === 'profile' && (
            <ProfileView
              publicProfile={publicProfile}
              privateProfile={privateProfile}
              matches={matches}
              onSaveProfile={onSaveProfile}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={privateProfile.settings}
              isGuest={isGuest}
              onUpdateSettings={onUpdateSettings}
              onLogout={onLogout}
            />
          )}

          {activeTab === 'about' && <AboutView />}
        </main>
      </div>
    </div>
  );
};
