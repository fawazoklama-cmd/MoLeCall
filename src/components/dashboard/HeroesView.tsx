import React, { useState } from 'react';
import { HEROES } from '../../data/heroes';
import { useI18n } from '../../localization/i18n';
import { HeroDefinition, HeroRole } from '../../types/game';
import { HeroPortrait } from '../HeroPortrait';

interface HeroesViewProps {
  ownedHeroIds: string[];
  aetherShards: number;
  onUnlockHero: (heroId: string, cost: number) => void;
}

const ROLES: Array<'All' | HeroRole> = ['All', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];

export const HeroesView: React.FC<HeroesViewProps> = ({
  ownedHeroIds,
  aetherShards,
  onUnlockHero,
}) => {
  const { lang, t } = useI18n();
  const [roleFilter, setRoleFilter] = useState<'All' | HeroRole>('All');
  const [selectedHero, setSelectedHero] = useState<HeroDefinition>(HEROES[0]);

  const filtered = HEROES.filter((h) => roleFilter === 'All' || h.role === roleFilter);
  const isOwned = (h: HeroDefinition) => ownedHeroIds.includes(h.id) || h.costShards === 0;

  return (
    <div className="space-y-6">
      {/* Role Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 bg-white border border-[#B9E3FF] p-1.5 rounded-2xl">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                roleFilter === r ? 'bg-[#3478D4] text-white' : 'text-[#172B49]/75 hover:bg-[#F4F9FF]'
              }`}
            >
              {r === 'All' ? t('allRoles') : r}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold text-[#3478D4] font-mono-tabular">
          {t('aetherShards')}: {aetherShards}
        </span>
      </div>

      {/* Main Split: Grid + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((hero) => {
            const owned = isOwned(hero);
            const active = selectedHero.id === hero.id;
            return (
              <button
                key={hero.id}
                type="button"
                onClick={() => setSelectedHero(hero)}
                className={`text-left bg-white rounded-3xl border p-3 transition-all cursor-pointer ${
                  active ? 'border-[#3478D4] ring-2 ring-[#8CCFFF]' : 'border-[#B9E3FF] hover:border-[#3478D4]'
                }`}
              >
                <HeroPortrait hero={hero} className="aspect-square rounded-2xl mb-2.5" />
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-[#3478D4]">{hero.role}</span>
                  <span className={owned ? 'text-[#10B981]' : 'text-[#D95D90]'}>
                    {owned ? t('owned') : `${hero.costShards}`}
                  </span>
                </div>
                <p className="font-display font-bold text-base text-[#172B49] mt-0.5">{hero.name}</p>
                <p className="text-[11px] text-[#172B49]/65 truncate">{hero.title[lang]}</p>
              </button>
            );
          })}
        </div>

        {/* Hero Inspector */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#B9E3FF] p-6 space-y-5 sticky top-20">
          <div className="flex items-center gap-4">
            <HeroPortrait hero={selectedHero} className="w-24 h-24 rounded-2xl shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#3478D4]">
                {selectedHero.role} · {selectedHero.gender}
              </p>
              <h2 className="font-display text-2xl font-bold text-[#172B49]">{selectedHero.name}</h2>
              <p className="text-xs font-medium text-[#D95D90]">{selectedHero.title[lang]}</p>
            </div>
          </div>

          <p className="text-sm text-[#172B49]/80 leading-relaxed">{selectedHero.lore[lang]}</p>

          {/* Base Stats */}
          <div className="grid grid-cols-3 gap-2.5 bg-[#F4F9FF] border border-[#B9E3FF] rounded-2xl p-3.5 text-xs font-mono-tabular">
            <div>
              <span className="text-[#172B49]/60 block">HP</span>
              <strong className="text-[#172B49]">{selectedHero.stats.maxHp}</strong>
            </div>
            <div>
              <span className="text-[#172B49]/60 block">ATK</span>
              <strong className="text-[#172B49]">{selectedHero.stats.attack}</strong>
            </div>
            <div>
              <span className="text-[#172B49]/60 block">MAG</span>
              <strong className="text-[#172B49]">{selectedHero.stats.magicPower}</strong>
            </div>
            <div>
              <span className="text-[#172B49]/60 block">ARM</span>
              <strong className="text-[#172B49]">{selectedHero.stats.armor}</strong>
            </div>
            <div>
              <span className="text-[#172B49]/60 block">SPD</span>
              <strong className="text-[#172B49]">{selectedHero.stats.moveSpeed}</strong>
            </div>
            <div>
              <span className="text-[#172B49]/60 block">RNG</span>
              <strong className="text-[#172B49]">{selectedHero.stats.attackRange}</strong>
            </div>
          </div>

          {/* Abilities */}
          <div className="space-y-2.5">
            {(
              [
                selectedHero.abilities.passive,
                selectedHero.abilities.q,
                selectedHero.abilities.e,
                selectedHero.abilities.r,
              ] as const
            ).map((ab) => (
              <div key={ab.key} className="p-3 rounded-2xl bg-[#F4F9FF]/70 border border-[#B9E3FF]/70 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#172B49]">
                  <span>
                    [{ab.key}] {ab.name[lang]}
                  </span>
                  {ab.cooldownSec > 0 && (
                    <span className="font-mono-tabular text-[#3478D4]">{ab.cooldownSec}s</span>
                  )}
                </div>
                <p className="text-xs text-[#172B49]/75">{ab.description[lang]}</p>
              </div>
            ))}
          </div>

          {!isOwned(selectedHero) && (
            <button
              type="button"
              onClick={() => onUnlockHero(selectedHero.id, selectedHero.costShards)}
              disabled={aetherShards < selectedHero.costShards}
              className="w-full py-3 rounded-2xl bg-[#3478D4] text-white text-sm font-bold hover:bg-[#2762B5] disabled:opacity-45 cursor-pointer"
            >
              {t('unlockWith')} {selectedHero.costShards} {t('aetherShards')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
