import React from 'react';
import { NavTab } from './BottomNav';
import { useBusiness } from '../../context/BusinessContext';
import { LayoutDashboard, Package, Receipt, ArrowDownCircle, BarChart3, BotMessageSquare, Settings as SettingsIcon, Store, AlertTriangle } from 'lucide-react';

interface SidebarProps { activeTab: NavTab; onTabChange: (tab: NavTab) => void; }

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { profile, dashboardSummary } = useBusiness();
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as NavTab, label: 'Produk', icon: Package, badge: dashboardSummary.lowStockProducts.length > 0 ? dashboardSummary.lowStockProducts.length : undefined },
    { id: 'transactions' as NavTab, label: 'Transaksi', icon: Receipt },
    { id: 'expenses' as NavTab, label: 'Pengeluaran', icon: ArrowDownCircle },
    { id: 'chat' as NavTab, label: 'Asisten', icon: BotMessageSquare },
    { id: 'reports' as NavTab, label: 'Laporan', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Pengaturan Usaha', icon: SettingsIcon },
  ];
  return <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-53px)] bg-white border-r border-[#E7EBF0] p-4 shrink-0 select-none">
    <div className="p-3 mb-4 rounded-xl bg-[#F7F9FC] border border-[#E4E8EE]">
      <div className="flex items-center gap-2.5 mb-1.5"><div className="p-1.5 rounded-lg bg-white border border-[#E7EBF0] text-[#607089] shrink-0"><Store className="w-4 h-4" /></div><div className="min-w-0"><h4 className="text-xs font-semibold text-[#172033] truncate">{profile.business_name || 'Kedai UMKM'}</h4><p className="text-[11px] text-[#7D899B] truncate">{profile.business_type || 'F&B / Kuliner'}</p></div></div>
      <div className="text-[10px] text-[#7D899B] flex items-center justify-between pt-2 border-t border-[#E7EBF0]"><span>Status Usaha</span><span className="text-[#259A72] font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#259A72]" />Aktif</span></div>
    </div>
    <div className="space-y-1 flex-1"><p className="text-[10px] font-semibold text-[#8793A4] uppercase tracking-wider px-3 py-1 mb-1">Menu Utama</p>
      {navItems.map(item => { const Icon=item.icon; const active=activeTab===item.id; return <button key={item.id} type="button" onClick={()=>onTabChange(item.id)} className={'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ' + (active ? 'bg-[#EEF2F7] text-[#172E4D]' : 'text-[#7B8799] hover:text-[#172033] hover:bg-[#F7F9FC]')}><div className="flex items-center gap-2.5"><Icon className={'w-4 h-4 shrink-0 ' + (active ? 'text-[#172E4D]' : 'text-[#8B97A8')} /><span className="truncate">{item.label}</span></div>{item.badge!==undefined && <span className="flex items-center gap-1 text-[10px] text-[#C66C6C] font-medium tabular-nums"><AlertTriangle className="w-3 h-3"/>{item.badge}</span>}</button>; })}
    </div>
  </aside>;
}
