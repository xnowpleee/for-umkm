import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { NavTab } from './BottomNav';
import { Logo } from '../common/Logo';
import { Plus, ArrowDownCircle, Settings as SettingsIcon, Receipt, User, LogOut, ChevronDown, LogIn, Sparkles } from 'lucide-react';

interface NavbarProps { activeTab: NavTab; onTabChange: (tab: NavTab) => void; onOpenQuickTxModal?: () => void; onOpenQuickExpenseModal?: () => void; onOpenAuthModal?: () => void; }

export function Navbar({ activeTab, onTabChange, onOpenQuickTxModal, onOpenQuickExpenseModal, onOpenAuthModal }: NavbarProps) {
  const { profile, user, logout } = useBusiness();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return <header className="sticky top-0 z-30 border-b border-[#22303D] bg-[#0B1219]/95 px-3 py-2.5 backdrop-blur-md pt-safe lg:px-5">
    <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
      <button type="button" onClick={() => user.isAuthenticated ? onTabChange('dashboard') : onOpenAuthModal?.()} className="flex min-w-0 items-center gap-2 text-left">
        <Logo size={24} />
        <span className="text-[14px] font-semibold tracking-tight text-[#E5E7EB]">BisnisKu</span>
        <span className="hidden border-l border-[#2A3947] pl-2 text-[9px] uppercase tracking-[0.14em] text-[#526579] sm:inline">Business OS</span>
      </button>

      <div className="flex items-center gap-1 rounded-xl border border-[#22303D] bg-[#0D151D]/90 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.025)]">
        {user.isAuthenticated ? <>
          {onOpenQuickExpenseModal && <button type="button" onClick={onOpenQuickExpenseModal}
            className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-[#94A3B8] transition-colors hover:bg-[#16222D] hover:text-[#E5E7EB] sm:flex">
            <ArrowDownCircle className="h-3.5 w-3.5"/><span>Pengeluaran</span>
          </button>}
          {activeTab !== 'chat' && <button type="button" onClick={() => onTabChange('chat')} aria-label="Buka Asisten AI"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#22D3EE] transition-colors hover:bg-[#102331] hover:text-[#67E8F9]">
            <Sparkles className="h-3.5 w-3.5" />
          </button>}
          {onOpenQuickTxModal && <button type="button" onClick={onOpenQuickTxModal}
            className="flex items-center gap-1.5 rounded-lg bg-[#0EA5E9] px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-[0_0_16px_rgba(14,165,233,.14)] transition-colors hover:bg-[#0284C7]">
            <Plus className="h-3.5 w-3.5"/><span className="hidden sm:inline">Kasir / Jual</span><span className="sm:hidden">Jual</span>
          </button>}
          <div className="relative ml-0.5 border-l border-[#22303D] pl-1">
            <button type="button" onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="Buka profil" className="flex items-center gap-1.5 rounded-lg p-1 text-xs text-[#94A3B8] transition-colors hover:bg-[#16222D]">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#2F4050] bg-[#16222D] text-[#8FA0B2]">
                {profile.logo_url ? <img src={profile.logo_url} alt="" className="h-full w-full object-cover" /> : <User className="h-3.5 w-3.5"/>}
              </div>
              <span className="hidden max-w-[100px] truncate text-[10px] font-medium md:inline">{user.name || 'Owner'}</span>
              <ChevronDown className="h-3 w-3 text-[#60758A]"/>
            </button>
            {userMenuOpen && <><div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)}/><div className="absolute right-0 z-50 mt-2 w-56 divide-y divide-[#22303D] rounded-xl border border-[#2A3947] bg-[#111827] py-1 shadow-2xl">
              <div className="px-3.5 py-2.5"><p className="truncate text-xs font-semibold text-[#E5E7EB]">{profile.business_name || 'Kedai Usaha'}</p><p className="mt-0.5 truncate text-[10px] text-[#718096]">{user.email || 'Akun Supabase'}</p></div>
              <div className="py-1">
                <button type="button" onClick={() => { onTabChange('settings'); setUserMenuOpen(false); }} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs text-[#B8C4D0] hover:bg-[#16222D]"><SettingsIcon className="h-3.5 w-3.5 text-[#718096]"/><span>Pengaturan Usaha</span></button>
                <button type="button" onClick={() => { onTabChange('expenses'); setUserMenuOpen(false); }} className="hidden w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs text-[#B8C4D0] hover:bg-[#16222D] sm:hidden"><Receipt className="h-3.5 w-3.5 text-[#718096]"/><span>Catatan Pengeluaran</span></button>
              </div>
              <div className="py-1"><button type="button" onClick={async () => { setUserMenuOpen(false); await logout(); onOpenAuthModal?.(); }} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs text-[#F87171] hover:bg-[#24181A]"><LogOut className="h-3.5 w-3.5"/><span>Keluar Akun</span></button></div>
            </div></>}
          </div>
        </> : <button type="button" onClick={onOpenAuthModal} className="flex items-center gap-1.5 rounded-lg bg-[#0EA5E9] px-3.5 py-2 text-xs font-semibold text-white"><LogIn className="h-3.5 w-3.5"/><span>Masuk / Daftar</span></button>}
      </div>
    </div>
  </header>;
}