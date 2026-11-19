import React, { useState } from 'react';
import { Globe, Menu, X } from 'lucide-react';
import { useI18n } from '../localization/i18n';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  isLoggedIn: boolean;
  onPrimaryAction: () => void;
  onNavigateSection: (id: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn,
  onPrimaryAction,
  onNavigateSection,
  onOpenAuth,
}) => {
  const { lang, toggleLang, t } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { id: 'heroes', label: t('navHeroes') },
    { id: 'modes', label: t('navModes') },
    { id: 'news', label: t('navNews') },
    { id: 'about', label: t('navAbout') },
  ];

  const handleNavClick = (id: string) => {
    setDrawerOpen(false);
    onNavigateSection(id);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/88 backdrop-blur-md border-b border-[#B9E3FF]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3478D4] rounded-lg"
        >
          <BrandLogo size={34} />
        </a>

        {/* Zone 2: 4 clean single-line nav links + language switch */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#172B49]/80">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className="hover:text-[#3478D4] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={toggleLang}
            aria-label="Switch language"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3478D4] hover:text-[#172B49] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 px-2 rounded-lg bg-[#F4F9FF] border border-[#B9E3FF]"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'ID · EN' : 'EN · ID'}</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary CTA */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={isLoggedIn ? onPrimaryAction : onOpenAuth}
            className="px-5 py-2.5 rounded-xl bg-[#3478D4] text-white text-xs font-bold tracking-wide hover:bg-[#2762B5] transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isLoggedIn ? t('openDashboard') : t('playNow')}
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            aria-label="Switch language"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#3478D4] px-2.5 py-2 rounded-lg bg-[#F4F9FF] border border-[#B9E3FF]"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang.toUpperCase()}</span>
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={drawerOpen}
            className="p-2 rounded-xl border border-[#B9E3FF] text-[#172B49] bg-white"
          >
            {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="md:hidden bg-white border-b border-[#B9E3FF] px-4 py-4 space-y-2 shadow-sm">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className="block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-[#172B49] hover:bg-[#F4F9FF]"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setDrawerOpen(false);
              if (isLoggedIn) onPrimaryAction();
              else onOpenAuth();
            }}
            className="w-full mt-2 px-4 py-3 rounded-xl bg-[#3478D4] text-white text-sm font-bold"
          >
            {isLoggedIn ? t('openDashboard') : t('playNow')}
          </button>
        </div>
      )}
    </header>
  );
};
