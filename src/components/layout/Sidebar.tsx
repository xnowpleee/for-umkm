import React from 'react';
import { NavTab } from './BottomNav';
import { useBusiness } from '../../context/BusinessContext';
import { LayoutDashboard, Package, Receipt, ArrowDownCircle, BarChart3, BotMessageSquare, Settings as SettingsIcon, Store, AlertTriangle, LogOut } from 'lucide-react';

interface SidebarProps { activeTab: NavTab; onTabChange: (tab: NavTab) => void; }

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { profile, dashboardSummary, logout } = useBusiness();
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as NavTab, label: 'Produk', icon: Package, badge: dashboardSummary.lowStockProducts.length > 0 ? dashboardSummary.lowStockProducts.length : undefined },
    { id: 'transactions' as NavTab, label: 'Transaksi', icon: Receipt },
    { id: 'expenses' as NavTab, label: 'Pengeluaran', icon: ArrowDownCircle },
    { id: 'chat' as NavTab, label: 'BisnisKu AI', icon: BotMessageSquare },
    { id: 'reports' as NavTab, label: 'Laporan', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Pengaturan Usaha', icon: SettingsIcon },
  ];

  return <aside className="hidden lg:flex flex-col w-[228px] min-h-[calc(100vh-57px)] bg-[#0D151D] border-r border-[#22303D] p-3 shrink-0 select-none">
    <div className="px-3 pt-2 pb-3 mb-2 border-b border-[#192631]">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-[#111827] border border-[#22303D] text-[#22D3EE] shrink-0"><Store className="w-4 h-4" /></div>
        <div className="min-w-0">
          <h4 className="text-xs font-semibold text-[#E5E7EB] truncate">{profile.business_name || 'Kedai UMKM'}</h4>
          <p className="text-[10px] text-[#64748B] truncate mt-0.5">{profile.business_type || 'F&B / Kuliner'}</p>
        </div>
      </div>
      <div className="text-[9px] text-[#64748B] flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#192631]">
        <span>STATUS USAHA</span>
        <span className="text-[#34D399] font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#34D399] shadow-[0_0_7px_rgba(52,211,153,.5)]" />Aktif</span>
      </div>
    </div>

    <div className="space-y-0.5 flex-1">
      <p className="text-[9px] font-semibold text-[#64748B] uppercase tracking-[0.14em] px-3 py-2">Workspace</p>
      {navItems.map(item => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return <button key={item.id} type="button" onClick={() => onTabChange(item.id)}
          className={'w-full flex items-center justify-between px-3 py-2.5 border-l-2 text-xs font-medium transition-colors ' +
            (active
              ? 'border-[#22D3EE] bg-[#102331] text-[#E5E7EB]'
              : 'border-transparent text-[#7E8EA1] hover:text-[#D5DCE5] hover:bg-[#111D27]')}>
          <div className="flex items-center gap-2.5 min-w-0">
            <Icon className={'w-4 h-4 shrink-0 ' + (active ? 'text-[#22D3EE]' : 'text-[#718096]')} />
            <span className="truncate">{item.label}</span>
          </div>
          {item.badge !== undefined && <span className="flex items-center gap-1 text-[9px] text-[#F87171] font-semibold tabular-nums"><AlertTriangle className="w-3 h-3"/>{item.badge}</span>}
        </button>;
      })}
    </div>

    <div className="pt-3 border-t border-[#192631] mt-2 space-y-1"><button type="button" onClick={() => logout()} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-[#7E8EA1] hover:text-[#F87171] hover:bg-[#171C22]"><LogOut className="w-4 h-4"/><span>Keluar</span></button><div className="px-3 pt-1 text-[9px] text-[#4F6174] tracking-wide">BISNISKU • BUSINESS OS</div></div>
  </aside>;
}
