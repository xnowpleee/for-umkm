import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { NavTab } from './BottomNav';
import { Logo } from '../common/Logo';
import { Plus, ArrowDownCircle, Settings as SettingsIcon, Receipt, User, LogOut, ChevronDown, LogIn } from 'lucide-react';

interface NavbarProps { activeTab: NavTab; onTabChange: (tab: NavTab) => void; onOpenQuickTxModal?: () => void; onOpenQuickExpenseModal?: () => void; onOpenAuthModal?: () => void; }

export function Navbar({ activeTab, onTabChange, onOpenQuickTxModal, onOpenQuickExpenseModal, onOpenAuthModal }: NavbarProps) {
  const { profile, user, logout } = useBusiness();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  return <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E7EBF0] px-3 lg:px-8 py-2">
    <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
      <button type="button" onClick={() => user.isAuthenticated ? onTabChange('dashboard') : onOpenAuthModal?.()} className="flex items-center gap-2 text-left"><Logo size={24} /><span className="text-[15px] font-semibold tracking-tight text-[#172E4D]">BisnisKu</span></button>
      <div className="flex items-center gap-2">
        {user.isAuthenticated ? <>
          {onOpenQuickExpenseModal && <button type="button" onClick={onOpenQuickExpenseModal} className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#4E5D72] bg-white border border-[#E1E6ED] rounded-lg hover:bg-[#F7F9FC]"><ArrowDownCircle className="w-3.5 h-3.5"/><span>Pengeluaran</span></button>}
          {onOpenQuickTxModal && <button type="button" onClick={onOpenQuickTxModal} className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold text-white bg-[#172E4D] hover:bg-[#213D61] rounded-lg"><Plus className="w-3.5 h-3.5"/><span>Kasir / Jual</span></button>}
          <div className="relative">
            <button type="button" onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1.5 p-1.5 text-xs text-[#39485D] bg-white border border-[#E1E6ED] rounded-lg"><div className="w-7 h-7 rounded-full bg-[#F0F3F7] border border-[#E2E7EE] flex items-center justify-center text-[#64748B] shrink-0"><User className="w-3.5 h-3.5"/></div><span className="hidden md:inline font-medium max-w-[100px] truncate text-[11px]">{user.name || 'Owner'}</span><ChevronDown className="w-3 h-3 text-[#8995A7]"/></button>
            {userMenuOpen && <><div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)}/><div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E7EE] rounded-xl shadow-lg z-50 py-1 divide-y divide-[#EDF0F4]">
              <div className="px-3.5 py-2.5"><p className="text-xs font-semibold text-[#172033] truncate">{profile.business_name || 'Kedai Usaha'}</p><p className="text-[11px] text-[#7D899B] truncate mt-0.5">{user.email || 'Akun Supabase'}</p></div>
              <div className="py-1"><button type="button" onClick={() => { onTabChange('settings'); setUserMenuOpen(false); }} className="w-full text-left px-3.5 py-2 text-xs text-[#39485D] hover:bg-[#F7F9FC] flex items-center gap-2.5"><SettingsIcon className="w-3.5 h-3.5 text-[#7D899B]"/><span>Pengaturan Usaha</span></button><button type="button" onClick={() => { onTabChange('expenses'); setUserMenuOpen(false); }} className="w-full text-left px-3.5 py-2 text-xs text-[#39485D] hover:bg-[#F7F9FC] flex items-center gap-2.5 sm:hidden"><Receipt className="w-3.5 h-3.5 text-[#7D899B]"/><span>Catatan Pengeluaran</span></button></div>
              <div className="py-1"><button type="button" onClick={async () => { setUserMenuOpen(false); await logout(); onOpenAuthModal?.(); }} className="w-full text-left px-3.5 py-2 text-xs text-[#C44F55] hover:bg-[#FFF5F5] flex items-center gap-2.5"><LogOut className="w-3.5 h-3.5"/><span>Keluar Akun</span></button></div>
            </div></>}
          </div>
        </> : <button type="button" onClick={onOpenAuthModal} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#172E4D] rounded-lg"><LogIn className="w-3.5 h-3.5"/><span>Masuk / Daftar</span></button>}
      </div>
    </div>
  </header>;
}
