import React, { useState } from 'react';
import { Award, ExternalLink, LogOut, Save } from 'lucide-react';
import { COLLECTION_COSMETICS } from '../../data/collection';
import { getHeroById, HEROES } from '../../data/heroes';
import { NEWS_ARTICLES } from '../../data/news';
import { computeWinRate } from '../../game/rules';
import { useI18n } from '../../localization/i18n';
import { GameSettings, MatchRecord, PrivateProfile, PublicProfile } from '../../types/game';
import { BrandLogo } from '../BrandLogo';
import { RankEmblem } from '../RankEmblem';

/* NEWS VIEW */
export const NewsView: React.FC = () => {
  const { lang } = useI18n();
  return (
    <div className="space-y-4">
      {NEWS_ARTICLES.map((art) => (
        <article key={art.id} className="bg-white border border-[#B9E3FF] rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#3478D4]">
            <span>{art.version}</span>
            <span>·</span>
            <span className="font-mono-tabular text-[#172B49]/60">{art.publishedAt}</span>
          </div>
          <h3 className="font-display text-xl font-bold text-[#172B49]">{art.title[lang]}</h3>
          <p className="text-sm text-[#172B49]/75">{art.summary[lang]}</p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-[#172B49]/80">
            {art.details[lang].map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
};

/* PROFILE VIEW */
interface ProfileViewProps {
  publicProfile: PublicProfile;
  privateProfile: PrivateProfile;
  matches: MatchRecord[];
  onSaveProfile: (patch: Partial<PublicProfile>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  publicProfile,
  privateProfile,
  matches,
  onSaveProfile,
}) => {
  const { t } = useI18n();
  const [username, setUsername] = useState(publicProfile.username);
  const [favoriteHeroId, setFavoriteHeroId] = useState(publicProfile.favoriteHeroId);
  const [avatar, setAvatar] = useState(publicProfile.avatar);
  const [savedNotice, setSavedNotice] = useState(false);

  const avatars = COLLECTION_COSMETICS.filter((c) => c.type === 'avatar');
  const winRate = computeWinRate(publicProfile.wins, publicProfile.totalMatches);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 2) return;
    onSaveProfile({ username: username.trim().slice(0, 24), favoriteHeroId, avatar });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#B9E3FF] rounded-3xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 flex items-center gap-4">
          <RankEmblem tier={publicProfile.rankTier} size={64} />
          <div>
            <h2 className="font-display text-2xl font-bold text-[#172B49]">{publicProfile.username}</h2>
            <p className="text-xs font-mono-tabular text-[#3478D4] font-semibold">
              {publicProfile.playerId} · {publicProfile.rankTier} ({publicProfile.rankPoints} pts)
            </p>
            <p className="text-xs text-[#172B49]/65 mt-1">
              {t('level')} {publicProfile.level} · {t('aetherShards')}: {privateProfile.aetherShards}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-[#F4F9FF] rounded-2xl p-3 border border-[#B9E3FF]">
            <p className="text-[11px] text-[#172B49]/65">{t('totalMatches')}</p>
            <p className="font-mono-tabular text-lg font-bold text-[#172B49]">{publicProfile.totalMatches}</p>
          </div>
          <div className="bg-[#F4F9FF] rounded-2xl p-3 border border-[#B9E3FF]">
            <p className="text-[11px] text-[#172B49]/65">{t('wins')}</p>
            <p className="font-mono-tabular text-lg font-bold text-[#3478D4]">{publicProfile.wins}</p>
          </div>
          <div className="bg-[#FFF6FA] rounded-2xl p-3 border border-[#FFB8D2]">
            <p className="text-[11px] text-[#172B49]/65">{t('losses')}</p>
            <p className="font-mono-tabular text-lg font-bold text-[#D95D90]">{publicProfile.losses}</p>
          </div>
          <div className="bg-[#F4F9FF] rounded-2xl p-3 border border-[#B9E3FF]">
            <p className="text-[11px] text-[#172B49]/65">{t('winRate')}</p>
            <p className="font-mono-tabular text-lg font-bold text-[#172B49]">{winRate}%</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSave} className="bg-white border border-[#B9E3FF] rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-[#172B49]">{t('editProfile')}</h3>
          {savedNotice && <span className="text-xs font-bold text-[#3478D4]">Saved</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="prof-username" className="block text-xs font-bold text-[#172B49]/75 mb-1">
              {t('usernameLabel')}
            </label>
            <input
              id="prof-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={24}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#B9E3FF] bg-[#F4F9FF] text-sm text-[#172B49]"
            />
          </div>
          <div>
            <label htmlFor="prof-fav-hero" className="block text-xs font-bold text-[#172B49]/75 mb-1">
              {t('favoriteHero')}
            </label>
            <select
              id="prof-fav-hero"
              value={favoriteHeroId}
              onChange={(e) => setFavoriteHeroId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#B9E3FF] bg-[#F4F9FF] text-sm text-[#172B49]"
            >
              {HEROES.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="prof-avatar" className="block text-xs font-bold text-[#172B49]/75 mb-1">
              Avatar
            </label>
            <select
              id="prof-avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#B9E3FF] bg-[#F4F9FF] text-sm text-[#172B49]"
            >
              {avatars.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.symbol.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#3478D4] text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#2762B5] cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{t('saveProfile')}</span>
        </button>
      </form>

      {/* Achievements & Match History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white border border-[#B9E3FF] rounded-3xl p-6 space-y-3">
          <h3 className="font-display text-lg font-bold text-[#172B49] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D95D90]" />
            <span>{t('achievementsTitle')}</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-2xl bg-[#F4F9FF] border border-[#B9E3FF]">
              <p className="font-bold text-[#172B49]">Aetheria Initiate</p>
              <p className="text-[#172B49]/70">Entered The Kingdom of Aetheria</p>
            </div>
            {publicProfile.wins >= 1 && (
              <div className="p-3 rounded-2xl bg-[#FFF6FA] border border-[#FFB8D2]">
                <p className="font-bold text-[#172B49]">First Victory</p>
                <p className="text-[#172B49]/70">Shattered the enemy Nexus</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-[#B9E3FF] rounded-3xl p-6 space-y-3">
          <h3 className="font-display text-lg font-bold text-[#172B49]">{t('recentMatches')}</h3>
          {matches.length === 0 ? (
            <p className="text-sm text-[#172B49]/65">{t('noMatchesYet')}</p>
          ) : (
            <div className="space-y-2">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-[#F4F9FF] border border-[#B9E3FF] flex items-center justify-between text-xs"
                >
                  <div>
                    <span
                      className={`font-bold mr-2 ${
                        m.result === 'victory' ? 'text-[#3478D4]' : 'text-[#D95D90]'
                      }`}
                    >
                      {m.result.toUpperCase()}
                    </span>
                    <span className="font-bold text-[#172B49]">{getHeroById(m.heroId).name}</span>
                    <span className="text-[#172B49]/60 ml-2">· {m.mode}</span>
                  </div>
                  <div className="font-mono-tabular font-semibold text-[#172B49]">
                    {m.kills}/{m.deaths}/{m.assists} · {m.goldEarned}g
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* SETTINGS VIEW */
interface SettingsViewProps {
  settings: GameSettings;
  isGuest: boolean;
  onUpdateSettings: (patch: Partial<GameSettings>) => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  isGuest,
  onUpdateSettings,
  onLogout,
}) => {
  const { lang, setLang, t } = useI18n();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white border border-[#B9E3FF] rounded-3xl p-6 space-y-5">
        <h2 className="font-display text-2xl font-bold text-[#172B49]">{t('settingsTitle')}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <span className="block text-xs font-bold text-[#172B49]/80 mb-2">{t('languageSetting')}</span>
            <div className="inline-flex p-1 rounded-xl bg-[#F4F9FF] border border-[#B9E3FF] gap-1">
              <button
                type="button"
                onClick={() => {
                  setLang('id');
                  onUpdateSettings({ language: 'id' });
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                  lang === 'id' ? 'bg-[#3478D4] text-white' : 'text-[#172B49]/75'
                }`}
              >
                Bahasa Indonesia
              </button>
              <button
                type="button"
                onClick={() => {
                  setLang('en');
                  onUpdateSettings({ language: 'en' });
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                  lang === 'en' ? 'bg-[#3478D4] text-white' : 'text-[#172B49]/75'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div>
            <span className="block text-xs font-bold text-[#172B49]/80 mb-2">{t('graphicsQuality')}</span>
            <div className="inline-flex p-1 rounded-xl bg-[#F4F9FF] border border-[#B9E3FF] gap-1">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onUpdateSettings({ graphicsQuality: q })}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold capitalize cursor-pointer ${
                    settings.graphicsQuality === q ? 'bg-[#3478D4] text-white' : 'text-[#172B49]/75'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="set-sfx" className="block text-xs font-bold text-[#172B49]/80 mb-1">
              {t('soundVolume')} ({Math.round(settings.soundVolume * 100)}%)
            </label>
            <input
              id="set-sfx"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.soundVolume}
              onChange={(e) => onUpdateSettings({ soundVolume: Number(e.target.value) })}
              className="w-full accent-[#3478D4]"
            />
          </div>

          <div>
            <label htmlFor="set-bgm" className="block text-xs font-bold text-[#172B49]/80 mb-1">
              {t('musicVolume')} ({Math.round(settings.musicVolume * 100)}%)
            </label>
            <input
              id="set-bgm"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.musicVolume}
              onChange={(e) => onUpdateSettings({ musicVolume: Number(e.target.value) })}
              className="w-full accent-[#D95D90]"
            />
          </div>

          <div>
            <label htmlFor="set-cam" className="block text-xs font-bold text-[#172B49]/80 mb-1">
              {t('cameraSensitivity')} ({settings.cameraSensitivity.toFixed(1)}x)
            </label>
            <input
              id="set-cam"
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={settings.cameraSensitivity}
              onChange={(e) => onUpdateSettings({ cameraSensitivity: Number(e.target.value) })}
              className="w-full accent-[#3478D4]"
            />
          </div>

          <div>
            <span className="block text-xs font-bold text-[#172B49]/80 mb-2">{t('fpsLimit')}</span>
            <div className="inline-flex p-1 rounded-xl bg-[#F4F9FF] border border-[#B9E3FF] gap-1">
              {([30, 60] as const).map((fps) => (
                <button
                  key={fps}
                  type="button"
                  onClick={() => onUpdateSettings({ fpsLimit: fps })}
                  className={`px-4 py-2 rounded-lg text-xs font-bold font-mono-tabular cursor-pointer ${
                    settings.fpsLimit === fps ? 'bg-[#3478D4] text-white' : 'text-[#172B49]/75'
                  }`}
                >
                  {fps} FPS
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm font-medium text-[#172B49] cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={settings.muted}
            onChange={(e) => onUpdateSettings({ muted: e.target.checked })}
            className="w-4 h-4 accent-[#3478D4]"
          />
          <span>{t('muteAudio')}</span>
        </label>

        <div className="p-4 rounded-2xl bg-[#F4F9FF] border border-[#B9E3FF] space-y-1 text-xs text-[#172B49]/80">
          <p className="font-bold text-[#172B49]">{t('controlsGuide')}</p>
          <p>{t('hudControlsHint')}</p>
        </div>

        <div className="pt-2 border-t border-[#F4F9FF] flex items-center justify-between">
          <span className="text-xs text-[#172B49]/65">{isGuest ? t('authGuestBadge') : 'Firebase Auth Active'}</span>
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-[#FFE0EC] text-[#8C1D4B] text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#FFD0E2] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ABOUT VIEW */
export const AboutView: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="max-w-3xl bg-white border border-[#B9E3FF] rounded-3xl p-8 space-y-6">
      <div className="space-y-2">
        <BrandLogo size={42} />
        <h2 className="font-display text-2xl font-bold text-[#172B49] pt-2">{t('aboutTitle')}</h2>
        <p className="text-sm font-semibold text-[#3478D4]">{t('brandTagline')}</p>
        <p className="text-sm text-[#172B49]/80 leading-relaxed">{t('aboutLead')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#F4F9FF]">
        <div className="p-4 rounded-2xl bg-[#F4F9FF] border border-[#B9E3FF]">
          <p className="text-xs text-[#172B49]/65">{t('creditDev')}</p>
          <p className="font-display text-lg font-bold text-[#172B49] mt-1">VennDev</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#FFF6FA] border border-[#FFB8D2]">
          <p className="text-xs text-[#172B49]/65">{t('creditReq')}</p>
          <p className="font-display text-lg font-bold text-[#172B49] mt-1">Callysta</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#F4F9FF] border border-[#B9E3FF]">
          <p className="text-xs text-[#172B49]/65">{t('creditIg')}</p>
          <p className="font-display text-lg font-bold text-[#3478D4] mt-1">@wazzz.dotcom</p>
        </div>
      </div>

      <a
        href="https://www.instagram.com/wazzz.dotcom/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#3478D4] to-[#E2699B] text-white font-bold text-sm hover:opacity-95 transition-opacity shadow-sm"
      >
        <span>{t('followDeveloper')}</span>
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
};
