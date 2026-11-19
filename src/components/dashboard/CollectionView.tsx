import React, { useState } from 'react';
import { COLLECTION_COSMETICS } from '../../data/collection';
import { HEROES } from '../../data/heroes';
import { useI18n } from '../../localization/i18n';
import { PrivateProfile, PublicProfile } from '../../types/game';

interface CollectionViewProps {
  publicProfile: PublicProfile;
  privateProfile: PrivateProfile;
  onUnlockCosmetic: (category: 'skin' | 'emote' | 'border' | 'avatar', id: string, cost: number) => void;
  onEquipAvatarOrBorder: (field: 'avatar' | 'borderId', id: string) => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({
  publicProfile,
  privateProfile,
  onUnlockCosmetic,
  onEquipAvatarOrBorder,
}) => {
  const { lang, t } = useI18n();
  const [tab, setTab] = useState<'skins' | 'emote' | 'border' | 'avatar'>('skins');

  const allSkins = HEROES.flatMap((h) => h.skins.map((s) => ({ ...s, heroName: h.name })));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 bg-white border border-[#B9E3FF] p-1.5 rounded-2xl">
          {(
            [
              { id: 'skins', label: t('tabSkins') },
              { id: 'emote', label: t('tabEmotes') },
              { id: 'border', label: t('tabBorders') },
              { id: 'avatar', label: t('tabAvatars') },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                tab === item.id ? 'bg-[#3478D4] text-white' : 'text-[#172B49]/75 hover:bg-[#F4F9FF]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="font-mono-tabular text-sm font-bold text-[#3478D4]">
          {privateProfile.aetherShards} {t('aetherShards')}
        </span>
      </div>

      {tab === 'skins' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allSkins.map((skin) => {
            const owned = privateProfile.ownedSkinIds.includes(skin.id) || skin.costShards === 0;
            return (
              <div
                key={skin.id}
                className="bg-white border border-[#B9E3FF] rounded-3xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl border border-[#172B49]/15 shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${skin.primaryColor}, ${skin.accentColor})`,
                    }}
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#3478D4]">
                      {skin.heroName} · {skin.rarity}
                    </p>
                    <h3 className="font-display font-bold text-base text-[#172B49]">{skin.name[lang]}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#F4F9FF]">
                  <span className="text-xs font-mono-tabular font-bold text-[#172B49]/75">
                    {owned ? t('unlocked') : `${skin.costShards} Shards`}
                  </span>
                  {!owned && (
                    <button
                      type="button"
                      onClick={() => onUnlockCosmetic('skin', skin.id, skin.costShards)}
                      disabled={privateProfile.aetherShards < skin.costShards}
                      className="px-4 py-1.5 rounded-xl bg-[#3478D4] text-white text-xs font-bold disabled:opacity-45 cursor-pointer"
                    >
                      {t('buy')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COLLECTION_COSMETICS.filter((c) => c.type === tab).map((cos) => {
            const ownedArr =
              tab === 'emote'
                ? privateProfile.ownedEmoteIds
                : tab === 'border'
                  ? privateProfile.ownedBorderIds
                  : privateProfile.ownedAvatarIds;
            const owned = ownedArr.includes(cos.id) || cos.costShards === 0;
            const equipped =
              (tab === 'avatar' && publicProfile.avatar === cos.id) ||
              (tab === 'border' && publicProfile.borderId === cos.id);

            return (
              <div
                key={cos.id}
                className="bg-white border border-[#B9E3FF] rounded-3xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl text-[#172B49] border border-[#B9E3FF]"
                    style={{ backgroundColor: `${cos.accentColor}44` }}
                  >
                    {cos.symbol.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-[#172B49]">{cos.name[lang]}</h3>
                    <p className="text-xs text-[#172B49]/70">{cos.description[lang]}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#F4F9FF]">
                  <span className="text-xs font-mono-tabular font-bold text-[#172B49]/75">
                    {owned ? t('unlocked') : `${cos.costShards} Shards`}
                  </span>
                  {!owned ? (
                    <button
                      type="button"
                      onClick={() => onUnlockCosmetic(tab, cos.id, cos.costShards)}
                      disabled={privateProfile.aetherShards < cos.costShards}
                      className="px-4 py-1.5 rounded-xl bg-[#3478D4] text-white text-xs font-bold disabled:opacity-45 cursor-pointer"
                    >
                      {t('buy')}
                    </button>
                  ) : tab !== 'emote' ? (
                    <button
                      type="button"
                      onClick={() => onEquipAvatarOrBorder(tab === 'avatar' ? 'avatar' : 'borderId', cos.id)}
                      disabled={equipped}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        equipped
                          ? 'bg-[#E8F4FF] text-[#3478D4]'
                          : 'bg-[#172B49] text-white hover:bg-[#274066]'
                      }`}
                    >
                      {equipped ? t('equipped') : t('equip')}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
