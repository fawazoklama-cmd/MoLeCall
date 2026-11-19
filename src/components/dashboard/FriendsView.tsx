import React, { useEffect, useState } from 'react';
import { Check, Search, Trash2, UserPlus, X } from 'lucide-react';
import { useI18n } from '../../localization/i18n';
import {
  acceptFriendRequest,
  fetchUserFriendships,
  removeFriendship,
  searchPlayersByQuery,
  sendFriendRequest,
} from '../../services/firebase';
import { Friendship, PublicProfile } from '../../types/game';
import { RankEmblem } from '../RankEmblem';

interface FriendsViewProps {
  profile: PublicProfile;
  isGuest: boolean;
  onInviteToPlay: () => void;
}

const LOCAL_SQUAD_SEED: PublicProfile[] = [
  {
    uid: 'bot_ally_1',
    username: 'CallystaSky',
    playerId: 'MLC-2026',
    avatar: 'avatar_seraphina',
    borderId: 'border_sakura_royal',
    rankTier: 'Diamond',
    rankPoints: 1840,
    level: 19,
    exp: 100,
    wins: 64,
    losses: 28,
    totalMatches: 92,
    favoriteHeroId: 'seraphina',
    onlineStatus: 'online',
    updatedAt: '',
  },
  {
    uid: 'bot_ally_2',
    username: 'VennDevGG',
    playerId: 'MLC-1001',
    avatar: 'avatar_aether',
    borderId: 'border_aetheria_crest',
    rankTier: 'Challenger',
    rankPoints: 3820,
    level: 42,
    exp: 400,
    wins: 148,
    losses: 42,
    totalMatches: 190,
    favoriteHeroId: 'aether',
    onlineStatus: 'online',
    updatedAt: '',
  },
];

export const FriendsView: React.FC<FriendsViewProps> = ({
  profile,
  isGuest,
  onInviteToPlay,
}) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PublicProfile[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [localFriends, setLocalFriends] = useState<PublicProfile[]>(LOCAL_SQUAD_SEED);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (!isGuest) {
      fetchUserFriendships(profile.uid).then(setFriendships).catch(() => {});
    }
  }, [profile.uid, isGuest]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    if (isGuest) {
      const low = searchTerm.trim().toLowerCase();
      setSearchResults(
        LOCAL_SQUAD_SEED.filter(
          (p) => p.username.toLowerCase().includes(low) || p.playerId.toLowerCase().includes(low)
        )
      );
      return;
    }
    const found = await searchPlayersByQuery(searchTerm);
    setSearchResults(found.filter((p) => p.uid !== profile.uid));
  };

  const handleAdd = async (target: PublicProfile) => {
    if (isGuest) {
      if (!localFriends.some((f) => f.uid === target.uid)) {
        setLocalFriends((prev) => [...prev, target]);
      }
      setStatusMsg(`${target.username} added.`);
      return;
    }
    const created = await sendFriendRequest(profile, target);
    setFriendships((prev) => [created, ...prev]);
    setStatusMsg(`${target.username} invited.`);
  };

  const handleAccept = async (id: string) => {
    await acceptFriendRequest(id);
    setFriendships((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'accepted' } : f)));
  };

  const handleRemove = async (id: string) => {
    if (isGuest) {
      setLocalFriends((prev) => prev.filter((f) => f.uid !== id));
      return;
    }
    await removeFriendship(id);
    setFriendships((prev) => prev.filter((f) => f.id !== id));
  };

  const incomingRequests = friendships.filter(
    (f) => f.status === 'pending' && f.recipientUid === profile.uid
  );
  const acceptedFriendships = friendships.filter((f) => f.status === 'accepted');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#B9E3FF] rounded-3xl p-6 space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#172B49]">{t('friendsTitle')}</h2>
        {isGuest && (
          <p className="text-xs text-[#3478D4] bg-[#F4F9FF] border border-[#B9E3FF] rounded-xl p-3">
            {t('friendsGuestHint')}
          </p>
        )}

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#3478D4] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlayerPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#B9E3FF] bg-[#F4F9FF] text-sm text-[#172B49]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#3478D4] text-white text-xs font-bold hover:bg-[#2762B5] cursor-pointer"
          >
            {t('searchBtn')}
          </button>
        </form>

        {statusMsg && <p className="text-xs font-semibold text-[#3478D4]">{statusMsg}</p>}

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {searchResults.map((p) => (
              <div
                key={p.uid}
                className="p-3.5 rounded-2xl border border-[#B9E3FF] bg-[#F4F9FF] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <RankEmblem tier={p.rankTier} size={32} />
                  <div>
                    <p className="font-display font-bold text-sm text-[#172B49]">{p.username}</p>
                    <p className="text-xs text-[#172B49]/65 font-mono-tabular">{p.playerId}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAdd(p)}
                  className="px-3 py-1.5 rounded-xl bg-[#3478D4] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t('addFriendBtn')}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incoming Requests */}
      {!isGuest && incomingRequests.length > 0 && (
        <div className="bg-white border border-[#FFB8D2] rounded-3xl p-6 space-y-3">
          <h3 className="font-display text-lg font-bold text-[#172B49]">{t('pendingRequests')}</h3>
          <div className="space-y-2.5">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-2xl bg-[#FFF6FA] border border-[#FFB8D2] flex items-center justify-between"
              >
                <span className="font-bold text-sm text-[#172B49]">{req.requesterName}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAccept(req.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#3478D4] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('acceptBtn')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(req.id)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#FFB8D2] text-[#8C1D4B] text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{t('rejectBtn')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white border border-[#B9E3FF] rounded-3xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {isGuest
            ? localFriends.map((f) => (
                <div
                  key={f.uid}
                  className="p-4 rounded-2xl border border-[#B9E3FF] bg-[#F4F9FF]/70 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <RankEmblem tier={f.rankTier} size={34} />
                    <div>
                      <p className="font-display font-bold text-sm text-[#172B49]">{f.username}</p>
                      <p className="text-xs text-[#3478D4] font-semibold">
                        {f.playerId} · {t('statusOnline')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onInviteToPlay}
                      className="px-3 py-1.5 rounded-xl bg-[#3478D4] text-white text-xs font-bold cursor-pointer"
                    >
                      {t('inviteToRoomBtn')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(f.uid)}
                      aria-label={t('removeBtn')}
                      className="p-2 rounded-xl border border-[#FFB8D2] text-[#D95D90] hover:bg-[#FFE0EC] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            : acceptedFriendships.map((fr) => {
                const friendName = fr.requesterUid === profile.uid ? fr.recipientName : fr.requesterName;
                return (
                  <div
                    key={fr.id}
                    className="p-4 rounded-2xl border border-[#B9E3FF] bg-[#F4F9FF]/70 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-display font-bold text-sm text-[#172B49]">{friendName}</p>
                      <p className="text-xs text-[#3478D4] font-semibold">{t('statusOnline')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onInviteToPlay}
                        className="px-3 py-1.5 rounded-xl bg-[#3478D4] text-white text-xs font-bold cursor-pointer"
                      >
                        {t('inviteToRoomBtn')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(fr.id)}
                        aria-label={t('removeBtn')}
                        className="p-2 rounded-xl border border-[#FFB8D2] text-[#D95D90] hover:bg-[#FFE0EC] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};
