import React, { useState } from 'react';
import { SHOP_ITEMS } from '../../data/items';
import { useI18n } from '../../localization/i18n';
import { ItemCategory } from '../../types/game';

const CATEGORIES: Array<'All' | ItemCategory> = ['All', 'Attack', 'Magic', 'Defense', 'Movement', 'Utility'];

export const ShopView: React.FC = () => {
  const { lang, t } = useI18n();
  const [cat, setCat] = useState<'All' | ItemCategory>('All');

  const items = SHOP_ITEMS.filter((i) => cat === 'All' || i.category === cat);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-[#172B49]">{t('itemEncyclopedia')}</h2>
        <div className="flex flex-wrap gap-1.5 bg-white border border-[#B9E3FF] p-1.5 rounded-2xl">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                cat === c ? 'bg-[#3478D4] text-white' : 'text-[#172B49]/75 hover:bg-[#F4F9FF]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-[#B9E3FF] rounded-3xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-xl shrink-0 border border-[#172B49]/15"
                  style={{ backgroundColor: item.colorHex }}
                />
                <div>
                  <p className="text-[11px] font-semibold text-[#3478D4]">{item.category}</p>
                  <h3 className="font-display font-bold text-base text-[#172B49]">{item.name[lang]}</h3>
                </div>
              </div>
              <span className="font-mono-tabular text-xs font-bold text-[#D95D90]">{item.cost}g</span>
            </div>
            <p className="text-xs text-[#172B49]/75 leading-relaxed">{item.description[lang]}</p>
            {item.passiveEffect && (
              <p className="text-xs font-medium text-[#3478D4]">{item.passiveEffect[lang]}</p>
            )}
            <div className="pt-2 border-t border-[#F4F9FF] text-[11px] text-[#172B49]/65">
              {t('recommendedFor')}: {item.recommendedRoles.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
