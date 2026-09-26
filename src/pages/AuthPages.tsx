import React, { useState, useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Logo } from '../components/common/Logo';
import { ArrowLeft, Mail, Lock, User, Store, CheckCircle, Loader2 } from 'lucide-react';

interface AuthPagesProps {
  onSuccess: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export function AuthPages({ onSuccess, initialMode = 'login' }: AuthPagesProps) {
  const { user, login, register, resetPassword } = useBusiness();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // If user is already authenticated, skip auth screen and navigate to dashboard
  useEffect(() => {
    if (user.isAuthenticated) {
      onSuccess();
    }
  }, [user.isAuthenticated, onSuccess]);

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    if (!loginIdentifier || !password) {
      setErrorMsg('Harap masukkan email / username dan kata sandi.');
      return;
    }

    setIsLoading(true);
    // If user enters a username without @, format as email standard or direct pass
    const emailToUse = loginIdentifier.includes('@')
      ? loginIdentifier.trim()
      : `${loginIdentifier.trim().toLowerCase().replace(/\s+/g, '')}@bisnisku.app`;

    const res = await login(emailToUse, password);
    setIsLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setErrorMsg(res.error || 'Gagal masuk. Periksa kembali email / username dan kata sandi Anda.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    if (!registerEmail || !password || !name || !businessName) {
      setErrorMsg('Harap lengkapi seluruh kolom pendaftaran.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    const res = await register(name, registerEmail.trim(), password, businessName.trim());
    setIsLoading(false);

    if (res.success) {
      if (res.message) {
        setInfoMsg(res.message);
        setMode('login');
      } else {
        onSuccess();
      }
    } else {
      setErrorMsg(res.error || 'Gagal mendaftar akun usaha.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    if (!forgotEmail) {
      setErrorMsg('Masukkan alamat email akun Anda.');
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(forgotEmail.trim());
    setIsLoading(false);

    if (res.success) {
      setForgotSent(true);
    } else {
      setErrorMsg(res.error || 'Gagal mengirim email reset kata sandi.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-6 sm:py-10">
      <div className="bg-[#FFFFFF] border border-[#E4E8EE] rounded-2xl p-6 sm:p-7 shadow-lg space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2 select-none">
          <div className="text-[#172E4D] flex items-center justify-center mx-auto mb-1">
            <Logo size={40} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#172033]">
            {mode === 'login' && 'Masuk ke BisnisKu'}
            {mode === 'register' && 'Daftar Akun BisnisKu'}
            {mode === 'forgot' && 'Lupa Password?'}
          </h2>
          <p className="text-xs text-[#7D899B]">
            {mode === 'login' && 'Aplikasi pencatatan kasir dan keuangan usaha Anda.'}
            {mode === 'register' && 'Mulai kelola kasir dan keuangan tokomu dengan mudah.'}
            {mode === 'forgot' && 'Masukkan email akun untuk mendapatkan link reset password.'}
          </p>
        </div>

        {/* Mode Selector Tabs (Masuk vs Daftar) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-[#FFFFFF] border border-[#E4E8EE] rounded-lg text-xs font-medium select-none">
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setInfoMsg('');
                setMode('login');
              }}
              className={`py-1.5 rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-[#FFFFFF] text-[#172033] font-semibold'
                  : 'text-[#7D899B] hover:text-[#172033]'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setInfoMsg('');
                setMode('register');
              }}
              className={`py-1.5 rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-[#FFFFFF] text-[#172033] font-semibold'
                  : 'text-[#7D899B] hover:text-[#172033]'
              }`}
            >
              Daftar Baru
            </button>
          </div>
        )}

        {/* Notifications */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-[#FBF5F5] border border-[#E7D2D4] text-[#A96D73] text-xs">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="p-3 rounded-lg bg-[#172E4D]/10 border border-[#172E4D]/20 text-[#172E4D] text-xs">
            {infoMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#7D899B] mb-1">
                Email atau Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#7D899B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="nama@toko.com atau namauser"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F9FC] border border-[#E4E8EE] rounded-lg text-[#172033] placeholder-[#7D899B] focus:outline-hidden focus:border-[#172E4D]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1 select-none">
                <label className="text-xs font-medium text-[#7D899B]">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('forgot');
                  }}
                  className="text-[11px] text-[#7D899B] hover:text-[#172033]"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7D899B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F9FC] border border-[#E4E8EE] rounded-lg text-[#172033] placeholder-[#7D899B] focus:outline-hidden focus:border-[#172E4D]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-[#FFFFFF] bg-[#172E4D] hover:bg-[#213D61] disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.99] mt-2 select-none"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[#FFFFFF]" />}
              <span>{isLoading ? 'Memproses...' : 'Masuk ke BisnisKu'}</span>
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#7D899B] mb-1">
                Nama Pemilik
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#7D899B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F9FC] border border-[#E4E8EE] rounded-lg text-[#172033] placeholder-[#7D899B] focus:outline-hidden focus:border-[#172E4D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7D899B] mb-1">
                Nama Usaha / Toko
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-[#7D899B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: AT Corner Angkringan"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F9FC] border border-[#E4E8EE] rounded-lg text-[#172033] placeholder-[#7D899B] focus:outline-hidden focus:border-[#172E4D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7D899B] mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7D899B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="owner@toko.com"
                  value={registerEmail}
                  onChange={e => setRegisterEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F9FC] border border-[#E4E8EE] rounded-lg text-[#172033] placeholder-[#7D899B] focus:outline-hidden focus:border-[#172E4D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7D899B] mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7D899B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F9FC] border border-[#E4E8EE] rounded-lg text-[#172033] placeholder-[#7D899B] focus:outline-hidden focus:border-[#172E4D]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-[#FFFFFF] bg-[#172E4D] hover:bg-[#213D61] disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.99] mt-2 select-none"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[#FFFFFF]" />}
              <span>{isLoading ? 'Mendaftarkan...' : 'Daftar Akun Usaha'}</span>
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            {forgotSent ? (
              <div className="text-center space-y-3 py-3">
                <CheckCircle className="w-9 h-9 text-[#172E4D] mx-auto" />
                <h3 className="text-sm font-semibold text-[#172033]">
                  Tautan Telah Dikirim
                </h3>
                <p className="text-xs text-[#7D899B]">
                  Tautan reset kata sandi telah dikirim ke{' '}
                  <span className="text-[#172033] font-semibold">{forgotEmail}</span>. Silakan cek kotak masuk atau spam email Anda.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSent(false);
                    setMode('login');
                  }}
                  className="mt-2 px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#172E4D] rounded-lg"
                >
                  Kembali ke Masuk
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#7D899B] mb-1">
                    Email Akun
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#7D899B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="owner@toko.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F9FC] border border-[#E4E8EE] rounded-lg text-[#172033] placeholder-[#7D899B] focus:outline-hidden focus:border-[#172E4D]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-[#FFFFFF] bg-[#172E4D] hover:bg-[#213D61] disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2 select-none"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[#FFFFFF]" />}
                  <span>{isLoading ? 'Mengirim...' : 'Kirim Link Reset Password'}</span>
                </button>

                <div className="text-center pt-1 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setMode('login');
                    }}
                    className="text-xs text-[#7D899B] hover:text-[#172033] flex items-center justify-center gap-1 mx-auto"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Halaman Masuk</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
