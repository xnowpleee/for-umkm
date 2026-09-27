import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { NavTab } from './BottomNav';
import { Logo } from '../common/Logo';
import { Plus, ArrowDownCircle, Settings as SettingsIcon, Receipt, User, LogOut, ChevronDown, LogIn, Sparkles } from 'lucide-react';

interface NavbarProps { activeTab: NavTab; onTabChange: (tab: NavTab) => void; onOpenQuickTxModal?: () => void; onOpenQuickExpenseModal?: () => void; onOpenAuthModal?: () => void; }

export function Navbar({ activeTab, onTabChange, onOpenQuickTxModal, onOpenQuickExpenseModal, onOpenAuthModal }: NavbarProps) {
  const { profile, user, logout } = useBusiness();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return <header className="sticky top-0 z-30 bg-[#0B1219]/95 backdrop-blur-md border-b border-[#22303D] px-3 lg:px-5 py-2.5 pt-safe">
    <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">
      <button type="button" onClick={() => user.isAuthenticated ? onTabChange('dashboard') : onOpenAuthModal?.()} className="flex items-center gap-2 text-left min-w-0">
        <Logo size={24} />
        <span className="text-[14px] font-semibold tracking-tight text-[#E5E7EB]">BisnisKu</span>
        <span className="hidden sm:inline text-[9px] tracking-[0.14em] uppercase text-[#526579] border-l border-[#2A3947] pl-2">Business OS</span>
      </button>

      <div className="flex items-center gap-1.5">
        {user.isAuthenticated ? <>
          {onOpenQuickExpenseModal && <button type="button" onClick={onOpenQuickExpenseModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-medium text-[#94A3B8] border border-[#2A3947] bg-[#111A23] hover:bg-[#16222D]">
            <ArrowDownCircle className="w-3.5 h-3.5"/><span>Pengeluaran</span>
          </button>}
          {activeTab !== 'chat' && <button type="button" onClick={() => onTabChange('chat')} aria-label="Buka Asisten AI"
            className="flex h-8 w-8 items-center justify-center border border-[#2A3947] bg-[#111A23] text-[#22D3EE] hover:border-[#0EA5E9] hover:bg-[#102331]">
            <Sparkles className="h-3.5 w-3.5" />
          </button>}
          {onOpenQuickTxModal && <button type="button" onClick={onOpenQuickTxModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold text-white bg-[#0EA5E9] hover:bg-[#0284C7] shadow-[0_0_16px_rgba(14,165,233,.14)]">
            <Plus className="w-3.5 h-3.5"/><span className="hidden sm:inline">Kasir / Jual</span><span className="sm:hidden">Jual</span>
          </button>}
          <div className="relative">
            <button type="button" onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1.5 p-1 border border-[#2A3947] bg-[#111A23] text-xs text-[#94A3B8]">
              <div className="w-7 h-7 bg-[#16222D] border border-[#2F4050] flex items-center justify-center text-[#8FA0B2] shrink-0"><User className="w-3.5 h-3.5"/></div>
              <span className="hidden md:inline font-medium max-w-[100px] truncate text-[10px]">{user.name || 'Owner'}</span>
              <ChevronDown className="w-3 h-3 text-[#60758A]"/>
            </button>
            {userMenuOpen && <><div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)}/><div className="absolute right-0 mt-2 w-56 bg-[#111827] border border-[#2A3947] shadow-2xl z-50 py-1 divide-y divide-[#22303D]">
              <div className="px-3.5 py-2.5"><p className="text-xs font-semibold text-[#E5E7EB] truncate">{profile.business_name || 'Kedai Usaha'}</p><p className="text-[10px] text-[#718096] truncate mt-0.5">{user.email || 'Akun Supabase'}</p></div>
              <div className="py-1">
                <button type="button" onClick={() => { onTabChange('settings'); setUserMenuOpen(false); }} className="w-full text-left px-3.5 py-2 text-xs text-[#B8C4D0] hover:bg-[#16222D] flex items-center gap-2.5"><SettingsIcon className="w-3.5 h-3.5 text-[#718096]"/><span>Pengaturan Usaha</span></button>
                <button type="button" onClick={() => { onTabChange('expenses'); setUserMenuOpen(false); }} className="w-full text-left px-3.5 py-2 text-xs text-[#B8C4D0] hover:bg-[#16222D] flex items-center gap-2.5 sm:hidden"><Receipt className="w-3.5 h-3.5 text-[#718096]"/><span>Catatan Pengeluaran</span></button>
              </div>
              <div className="py-1"><button type="button" onClick={async () => { setUserMenuOpen(false); await logout(); onOpenAuthModal?.(); }} className="w-full text-left px-3.5 py-2 text-xs text-[#F87171] hover:bg-[#24181A] flex items-center gap-2.5"><LogOut className="w-3.5 h-3.5"/><span>Keluar Akun</span></button></div>
            </div></>}
          </div>
        </> : <button type="button" onClick={onOpenAuthModal} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0EA5E9]"><LogIn className="w-3.5 h-3.5"/><span>Masuk / Daftar</span></button>}
      </div>
    </div>
  </header>;
}
