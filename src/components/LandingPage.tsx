import React from 'react';
import { ArrowRight, ExternalLink, Gamepad2, Shield, Sparkles, Swords, Users } from 'lucide-react';
import { HERO_BANNER_URL, HEROES } from '../data/heroes';
import { NEWS_ARTICLES } from '../data/news';
import { useI18n } from '../localization/i18n';
import { BrandLogo } from './BrandLogo';
import { HeroPortrait } from './HeroPortrait';
import { Navbar } from './Navbar';

interface LandingPageProps {
  isLoggedIn: boolean;
  onPlayNow: () => void;
  onGuestQuickPlay: () => void;
  onOpenAuth: () => void;
  onOpenDashboardSection: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  isLoggedIn,
  onPlayNow,
  onGuestQuickPlay,
  onOpenAuth,
  onOpenDashboardSection,
}) => {
  const { lang, t } = useI18n();
  const featuredHeroes = HEROES.slice(0, 4);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="top" className="min-h-screen bg-[#F4F9FF] text-[#172B49]">
      <Navbar
        isLoggedIn={isLoggedIn}
        onPrimaryAction={onPlayNow}
        onNavigateSection={scrollTo}
        onOpenAuth={onOpenAuth}
      />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#B9E3FF]/70 bg-gradient-to-br from-[#F4F9FF] via-[#E8F4FF] to-[#FFEAF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Copy */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div className="flex items-center gap-3 text-xs font-semibold text-[#3478D4]">
                <span>The Kingdom of Aetheria</span>
                <span aria-hidden="true">·</span>
                <span>2.5D Browser MOBA</span>
                <span aria-hidden="true">·</span>
                <span>5v5</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#172B49] leading-[1.08] text-balance">
                {t('brandTagline')}
              </h1>

              <p className="text-base sm:text-lg text-[#172B49]/75 max-w-xl leading-relaxed">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  data-start="true"
                  onClick={onPlayNow}
                  className="px-6 py-3.5 rounded-2xl bg-[#3478D4] text-white font-bold text-sm hover:bg-[#2762B5] transition-colors shadow-sm inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  <span>{t('playNow')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo('heroes')}
                  className="px-6 py-3.5 rounded-2xl bg-white border border-[#B9E3FF] text-[#172B49] font-bold text-sm hover:bg-[#FFE0EC]/45 hover:border-[#FFB8D2] transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <span>{t('exploreHeroes')}</span>
                  <ArrowRight className="w-4 h-4 text-[#3478D4]" />
                </button>
                <button
                  type="button"
                  onClick={onGuestQuickPlay}
                  className="px-4 py-3 text-xs font-semibold text-[#3478D4] hover:text-[#172B49] underline-offset-4 hover:underline whitespace-nowrap cursor-pointer"
                >
                  {t('guestMode')}
                </button>
              </div>
            </div>

            {/* Right Key Art */}
            <div className="lg:col-span-6 flex items-stretch">
              <div className="relative w-full rounded-3xl overflow-hidden border border-[#B9E3FF] bg-white shadow-md min-h-[280px] lg:min-h-[380px]">
                <img
                  src={HERO_BANNER_URL}
                  alt="The Kingdom of Aetheria"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#172B49]/65 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white">
                  <div>
                    <p className="text-xs font-medium text-[#B9E3FF]">MoLeCall Original Arena</p>
                    <p className="font-display text-lg font-bold">The Kingdom of Aetheria</p>
                  </div>
                  <span className="text-xs font-semibold text-[#FFE0EC]">3 Lanes · 18 Turrets</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-column Key Metrics Row */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/90 border border-[#B9E3FF] rounded-2xl p-5">
              <p className="font-display text-3xl font-extrabold text-[#3478D4] tabular-nums">{HEROES.length}</p>
              <p className="text-xs font-semibold text-[#172B49]/70 mt-1">{t('statHeroesLabel')}</p>
            </div>
            <div className="bg-white/90 border border-[#B9E3FF] rounded-2xl p-5">
              <p className="font-display text-3xl font-extrabold text-[#172B49] tabular-nums">Offline + 5v5</p>
              <p className="text-xs font-semibold text-[#172B49]/70 mt-1">{t('statModesLabel')}</p>
            </div>
            <div className="bg-white/90 border border-[#B9E3FF] rounded-2xl p-5">
              <p className="font-display text-3xl font-extrabold text-[#D95D90] tabular-nums">Aetheria</p>
              <p className="text-xs font-semibold text-[#172B49]/70 mt-1">{t('statMapLabel')}</p>
            </div>
            <div className="bg-white/90 border border-[#B9E3FF] rounded-2xl p-5">
              <p className="font-display text-3xl font-extrabold text-[#172B49] tabular-nums">ID / EN</p>
              <p className="text-xs font-semibold text-[#172B49]/70 mt-1">{t('statBilingualLabel')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED HEROES */}
      <section id="heroes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#172B49]">
              {t('featuredHeroesTitle')}
            </h2>
            <p className="text-sm text-[#172B49]/70 mt-1">{t('featuredHeroesDesc')}</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenDashboardSection('heroes')}
            className="text-sm font-bold text-[#3478D4] hover:text-[#172B49] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <span>{t('exploreHeroes')} (12)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredHeroes.map((hero) => (
            <article
              key={hero.id}
              className="bg-white rounded-3xl border border-[#B9E3FF] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <HeroPortrait hero={hero} className="aspect-square w-full" />
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#3478D4] font-semibold">
                    <span>{hero.role}</span>
                    <span aria-hidden="true">·</span>
                    <span>{hero.gender}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#172B49] mt-1">{hero.name}</h3>
                  <p className="text-xs font-medium text-[#D95D90]">{hero.title[lang]}</p>
                  <p className="text-xs text-[#172B49]/70 mt-2 leading-relaxed line-clamp-2">
                    {hero.lore[lang]}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#F4F9FF] flex items-center justify-between text-xs font-mono-tabular text-[#172B49]/80">
                  <span>HP {hero.stats.maxHp}</span>
                  <span>ATK {hero.stats.attack}</span>
                  <span>MAG {hero.stats.magicPower}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* GAME MODES & GAMEPLAY PREVIEW */}
      <section id="modes" className="bg-white border-y border-[#B9E3FF]/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-3xl bg-[#F4F9FF] border border-[#B9E3FF] p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <Gamepad2 className="w-7 h-7 text-[#3478D4]" />
                <h3 className="font-display text-2xl font-bold text-[#172B49]">{t('offlineModeTitle')}</h3>
                <p className="text-sm text-[#172B49]/75 leading-relaxed">{t('offlineModeDesc')}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[#B9E3FF]/70">
                <span className="text-xs font-semibold text-[#172B49]/65">Easy · Normal · Hard</span>
                <button
                  type="button"
                  onClick={onGuestQuickPlay}
                  className="px-4 py-2 rounded-xl bg-[#3478D4] text-white text-xs font-bold hover:bg-[#2762B5] transition-colors cursor-pointer"
                >
                  {t('quickLaunchOffline')}
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-[#FFF6FA] border border-[#FFB8D2] p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <Users className="w-7 h-7 text-[#D95D90]" />
                <h3 className="font-display text-2xl font-bold text-[#172B49]">{t('onlineModeTitle')}</h3>
                <p className="text-sm text-[#172B49]/75 leading-relaxed">{t('onlineModeDesc')}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[#FFB8D2]/70">
                <span className="text-xs font-semibold text-[#172B49]/65">WebSocket · 5v5 Room</span>
                <button
                  type="button"
                  onClick={onPlayNow}
                  className="px-4 py-2 rounded-xl bg-[#172B49] text-white text-xs font-bold hover:bg-[#263F66] transition-colors cursor-pointer"
                >
                  {t('quickLaunchOnline')}
                </button>
              </div>
            </div>
          </div>

          {/* Isometric Arena Preview Banner */}
          <div className="rounded-3xl border border-[#B9E3FF] bg-gradient-to-r from-[#EBF6FF] via-white to-[#FFEAF2] p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#3478D4]">
                <Shield className="w-4 h-4" />
                <span>Phaser.js 2.5D Isometric Engine</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#172B49]">
                {t('gameplayPreviewTitle')}
              </h3>
              <p className="text-sm text-[#172B49]/75 leading-relaxed">{t('gameplayPreviewDesc')}</p>
              <div className="flex flex-wrap gap-3 text-xs font-mono-tabular text-[#172B49]/80 pt-1">
                <span>WASD Move</span>
                <span>·</span>
                <span>Click Attack</span>
                <span>·</span>
                <span>Q / E / R Skills</span>
                <span>·</span>
                <span>B Recall</span>
                <span>·</span>
                <span>Mobile Virtual Joystick</span>
              </div>
            </div>
            <div className="lg:col-span-5">
              {/* Interactive Isometric Schematic SVG Preview */}
              <svg viewBox="0 0 360 220" className="w-full rounded-2xl border border-[#B9E3FF] bg-[#DCF0FF]">
                <polygon points="180,14 340,110 180,206 20,110" fill="#E9F6FF" stroke="#8CCFFF" strokeWidth="3" />
                {/* Lanes */}
                <polyline points="68,136 105,62 255,62 292,84" fill="none" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="68,136 105,158 255,158 292,84" fill="none" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="68" y1="136" x2="292" y2="84" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round" />
                {/* Magical River */}
                <line x1="100" y1="58" x2="260" y2="162" stroke="#5AB7FA" strokeWidth="16" strokeLinecap="round" opacity="0.7" />
                {/* Blue Base & Red Base */}
                <circle cx="68" cy="136" r="14" fill="#3478D4" stroke="#FFFFFF" strokeWidth="3" />
                <circle cx="292" cy="84" r="14" fill="#E24C85" stroke="#FFFFFF" strokeWidth="3" />
                <text x="52" y="166" fontSize="10" fontWeight="bold" fill="#172B49">Blue Base</text>
                <text x="252" y="64" fontSize="10" fontWeight="bold" fill="#172B49">Red Base</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* NEWS SECTION */}
      <section id="news" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#172B49]">
            {t('latestNewsTitle')}
          </h2>
          <button
            type="button"
            onClick={() => onOpenDashboardSection('news')}
            className="text-sm font-bold text-[#3478D4] hover:text-[#172B49] inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{t('viewAllNews')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {NEWS_ARTICLES.slice(0, 2).map((article) => (
            <article key={article.id} className="bg-white rounded-3xl border border-[#B9E3FF] p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#3478D4] font-semibold">
                <span>{article.version}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums text-[#172B49]/60">{article.publishedAt}</span>
              </div>
              <h3 className="font-display text-xl font-bold text-[#172B49]">{article.title[lang]}</h3>
              <p className="text-sm text-[#172B49]/75 leading-relaxed">{article.summary[lang]}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ABOUT & CREDITS SECTION */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl bg-white border border-[#B9E3FF] p-8 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#D95D90]">
              <Sparkles className="w-4 h-4" />
              <span>MoLeCall Studio Credits</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#172B49]">
              {t('aboutBannerTitle')}
            </h2>
            <p className="text-sm text-[#172B49]/75 leading-relaxed">{t('aboutLead')}</p>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-[#172B49]/60">{t('creditDev')}</p>
                <p className="font-display text-base font-bold text-[#172B49]">VennDev</p>
              </div>
              <div>
                <p className="text-[#172B49]/60">{t('creditReq')}</p>
                <p className="font-display text-base font-bold text-[#172B49]">Callysta</p>
              </div>
              <div>
                <p className="text-[#172B49]/60">{t('creditIg')}</p>
                <p className="font-display text-base font-bold text-[#3478D4]">@wazzz.dotcom</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col sm:items-end gap-3">
            <a
              href="https://www.instagram.com/wazzz.dotcom/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#3478D4] to-[#E2699B] text-white font-bold text-sm hover:opacity-95 transition-opacity inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
            >
              <span>{t('followDeveloper')}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* QUIET FOOTER */}
      <footer className="border-t border-[#B9E3FF] bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#172B49]/70">
          <div className="flex items-center gap-3">
            <BrandLogo size={26} />
            <span>·</span>
            <span>{t('brandTagline')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span>{t('footerMadeBy')}</span>
            <span aria-hidden="true">·</span>
            <span>{t('footerReqBy')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
