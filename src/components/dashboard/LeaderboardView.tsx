import React, { useEffect, useState } from 'react';
import { computeWinRate } from '../../game/rules';
import { useI18n } from '../../localization/i18n';
import { fetchLeaderboardProfiles } from '../../services/firebase';
import { PublicProfile } from '../../types/game';
import { RankEmblem } from '../RankEmblem';

interface LeaderboardViewProps {
  currentPlayer: PublicProfile;
  isGuest: boolean;
}

const SEASON_LEADERS: PublicProfile[] = [
  {
    uid: 'ldr_1',
    username: 'VennDev',
    playerId: 'MLC-1001',
    avatar: 'avatar_aether',
    borderId: 'border_aetheria_crest',
    rankTier: 'Challenger',
    rankPoints: 3940,
    level: 45,
    exp: 0,
    wins: 162,
    losses: 38,
    totalMatches: 200,
    favoriteHeroId: 'aether',
    onlineStatus: 'online',
    updatedAt: '',
  },
  {
    uid: 'ldr_2',
    username: 'Callysta',
    playerId: 'MLC-2026',
    avatar: 'avatar_seraphina',
    borderId: 'border_sakura_royal',
    rankTier: 'Grandmaster',
    rankPoints: 3420,
    level: 36,
    exp: 0,
    wins: 121,
    losses: 34,
    totalMatches: 155,
    favoriteHeroId: 'seraphina',
    onlineStatus: 'online',
    updatedAt: '',
  },
  {
    uid: 'ldr_3',
    username: 'SkyValkyrie',
    playerId: 'MLC-4412',
    avatar: 'avatar_valeria',
    borderId: 'border_sky_classic',
    rankTier: 'Master',
    rankPoints: 2560,
    level: 28,
    exp: 0,
    wins: 88,
    losses: 32,
    totalMatches: 120,
    favoriteHeroId: 'valeria',
    onlineStatus: 'offline',
    updatedAt: '',
  },
  {
    uid: 'ldr_4',
    username: 'AetherBlade',
    playerId: 'MLC-7730',
    avatar: 'avatar_kael',
    borderId: 'border_sky_classic',
    rankTier: 'Diamond',
    rankPoints: 1890,
    level: 21,
    exp: 0,
    wins: 60,
    losses: 30,
    totalMatches: 90,
    favoriteHeroId: 'kael',
    onlineStatus: 'online',
    updatedAt: '',
  },
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentPlayer, isGuest }) => {
  const { t } = useI18n();
  const [tab, setTab] = useState<'global' | 'weekly' | 'monthly' | 'friends'>('global');
  const [rows, setRows] = useState<PublicProfile[]>(SEASON_LEADERS);

  useEffect(() => {
    if (!isGuest) {
      fetchLeaderboardProfiles()
        .then((remote) => {
          const merged = new Map<string, PublicProfile>();
          [...remote, ...SEASON_LEADERS, currentPlayer].forEach((p) => merged.set(p.uid, p));
          setRows(Array.from(merged.values()).sort((a, b) => b.rankPoints - a.rankPoints));
        })
        .catch(() => {});
    } else {
      const merged = [...SEASON_LEADERS.filter((r) => r.uid !== currentPlayer.uid), currentPlayer];
      setRows(merged.sort((a, b) => b.rankPoints - a.rankPoints));
    }
  }, [currentPlayer, isGuest]);

  const displayed =
    tab === 'friends'
      ? rows.slice(0, 3)
      : tab === 'weekly'
        ? [...rows].sort((a, b) => b.wins - a.wins)
        : rows;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-[#172B49]">{t('leaderboardTitle')}</h2>
        <div className="flex flex-wrap gap-1.5 bg-white border border-[#B9E3FF] p-1.5 rounded-2xl">
          {(
            [
              { id: 'global', label: t('tabGlobal') },
              { id: 'weekly', label: t('tabWeekly') },
              { id: 'monthly', label: t('tabMonthly') },
              { id: 'friends', label: t('tabFriends') },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                tab === item.id ? 'bg-[#3478D4] text-white' : 'text-[#172B49]/75 hover:bg-[#F4F9FF]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#B9E3FF] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#B9E3FF] bg-[#F4F9FF] text-xs font-bold text-[#172B49]/70">
                <th className="py-3.5 px-5">{t('colRank')}</th>
                <th className="py-3.5 px-5">{t('colPlayer')}</th>
                <th className="py-3.5 px-5">{t('colTier')}</th>
                <th className="py-3.5 px-5 text-right">{t('colPoints')}</th>
                <th className="py-3.5 px-5 text-right">{t('colWinRate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F9FF] text-sm">
              {displayed.map((row, idx) => {
                const wr = computeWinRate(row.wins, row.totalMatches);
                const isSelf = row.uid === currentPlayer.uid;
                return (
                  <tr key={row.uid} className={isSelf ? 'bg-[#E8F4FF]/60' : 'hover:bg-[#F4F9FF]/60'}>
                    <td className="py-3.5 px-5 font-mono-tabular font-bold text-[#3478D4]">#{idx + 1}</td>
                    <td className="py-3.5 px-5">
                      <p className="font-display font-bold text-[#172B49]">
                        {row.username} {isSelf ? '(You)' : ''}
                      </p>
                      <p className="text-xs text-[#172B49]/55 font-mono-tabular">{row.playerId}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="inline-flex items-center gap-2">
                        <RankEmblem tier={row.rankTier} size={26} />
                        <span className="text-xs font-semibold text-[#172B49]">{row.rankTier}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono-tabular font-bold text-[#172B49]">
                      {row.rankPoints}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono-tabular font-semibold text-[#3478D4]">
                      {wr}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
