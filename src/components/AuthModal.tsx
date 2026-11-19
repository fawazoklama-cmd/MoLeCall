import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Play } from 'lucide-react';
import { COLLECTION_COSMETICS } from '../data/collection';
import { useI18n } from '../localization/i18n';
import {
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  resetPassword,
} from '../services/firebase';
import { BrandLogo } from './BrandLogo';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onEnterGuest: (username?: string, avatarId?: string) => void;
  onAuthSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onClose,
  onEnterGuest,
  onAuthSuccess,
}) => {
  const { lang, t } = useI18n();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarId, setAvatarId] = useState('avatar_aether');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!open) return null;

  const starterAvatars = COLLECTION_COSMETICS.filter((c) => c.type === 'avatar');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email.trim()) {
      setErrorMsg(lang === 'id' ? 'Mohon isi alamat email Anda.' : 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'reset') {
        await resetPassword(email.trim());
        setInfoMsg(t('resetSentMsg'));
      } else if (mode === 'register') {
        if (password.length < 6) {
          throw new Error(
            lang === 'id' ? 'Kata sandi minimal 6 karakter.' : 'Password must be at least 6 characters.'
          );
        }
        if (username.trim().length < 2) {
          throw new Error(
            lang === 'id' ? 'Nama pengguna minimal 2 karakter.' : 'Username must be at least 2 characters.'
          );
        }
        await registerWithEmail(email.trim(), password, username.trim(), avatarId);
        onAuthSuccess();
      } else {
        await loginWithEmail(email.trim(), password);
        onAuthSuccess();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onAuthSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#172B49]/45 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'login' ? t('authTitleLogin') : mode === 'register' ? t('authTitleRegister') : t('authTitleReset')}
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#B9E3FF] shadow-xl overflow-hidden">
        {/* Top Accent Banner */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-[#EBF6FF] via-[#F4F9FF] to-[#FFEAF2] border-b border-[#B9E3FF]/60 flex items-center justify-between">
          <BrandLogo size={32} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-[#172B49]/70 hover:text-[#172B49] hover:bg-white/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#172B49]">
              {mode === 'login'
                ? t('authTitleLogin')
                : mode === 'register'
                  ? t('authTitleRegister')
                  : t('authTitleReset')}
            </h2>
            <p className="text-xs text-[#172B49]/65 mt-1">{t('brandTagline')}</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FFE0EC] border border-[#FFB8D2] text-xs font-medium text-[#8C1D4B]">
              {errorMsg}
            </div>
          )}
          {infoMsg && (
            <div className="p-3 rounded-xl bg-[#E6F4FF] border border-[#8CCFFF] text-xs font-medium text-[#1E5099]">
              {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="auth-username" className="block text-xs font-semibold text-[#172B49]/80 mb-1">
                    {t('usernameLabel')}
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#3478D4] absolute left-3.5 top-3" />
                    <input
                      id="auth-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={24}
                      placeholder="SkyGuardian"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#B9E3FF] bg-[#F4F9FF] text-sm text-[#172B49] focus:outline-none focus:ring-2 focus:ring-[#3478D4]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-[#172B49]/80 mb-1.5">
                    {t('chooseAvatar')}
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {starterAvatars.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setAvatarId(av.id)}
                        className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          avatarId === av.id
                            ? 'border-[#3478D4] bg-[#E6F4FF] text-[#172B49]'
                            : 'border-[#B9E3FF]/70 bg-white text-[#172B49]/70'
                        }`}
                      >
                        {av.symbol.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-[#172B49]/80 mb-1">
                {t('emailLabel')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#3478D4] absolute left-3.5 top-3" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@aetheria.gg"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#B9E3FF] bg-[#F4F9FF] text-sm text-[#172B49] focus:outline-none focus:ring-2 focus:ring-[#3478D4]"
                  required
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label htmlFor="auth-password" className="block text-xs font-semibold text-[#172B49]/80 mb-1">
                  {t('passwordLabel')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#3478D4] absolute left-3.5 top-3" />
                  <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#B9E3FF] bg-[#F4F9FF] text-sm text-[#172B49] focus:outline-none focus:ring-2 focus:ring-[#3478D4]"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#3478D4] text-white text-sm font-bold hover:bg-[#2762B5] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading
                ? '...'
                : mode === 'login'
                  ? t('loginBtn')
                  : mode === 'register'
                    ? t('registerBtn')
                    : t('resetBtn')}
            </button>
          </form>

          {/* Google & Guest Mode */}
          <div className="space-y-2.5 pt-2 border-t border-[#B9E3FF]/60">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#B9E3FF] text-sm font-semibold text-[#172B49] hover:bg-[#F4F9FF] transition-colors cursor-pointer"
            >
              {t('googleLoginBtn')}
            </button>
            <button
              type="button"
              onClick={() => onEnterGuest(username || 'AetherGuest', avatarId)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#B9E3FF]/50 to-[#FFE0EC]/70 border border-[#FFB8D2] text-sm font-bold text-[#172B49] hover:brightness-98 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#3478D4]" />
              <span>{t('guestPlayBtn')}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-[#3478D4] font-medium pt-1">
            {mode === 'login' && (
              <>
                <button type="button" onClick={() => setMode('reset')} className="hover:underline cursor-pointer">
                  {t('forgotPassLink')}
                </button>
                <button type="button" onClick={() => setMode('register')} className="hover:underline cursor-pointer">
                  {t('switchToRegister')}
                </button>
              </>
            )}
            {mode === 'register' && (
              <button type="button" onClick={() => setMode('login')} className="hover:underline cursor-pointer">
                {t('switchToLogin')}
              </button>
            )}
            {mode === 'reset' && (
              <button type="button" onClick={() => setMode('login')} className="hover:underline cursor-pointer">
                {t('backToLogin')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
