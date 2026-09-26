import React from 'react';
import { LayoutDashboard, Package, BotMessageSquare, BarChart3, Plus } from 'lucide-react';

export type NavTab = 'dashboard' | 'products' | 'transactions' | 'reports' | 'chat' | 'expenses' | 'settings';

interface BottomNavProps { activeTab: NavTab; onTabChange: (tab: NavTab) => void; }

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Beranda', icon: LayoutDashboard },
    { id: 'products' as NavTab, label: 'Produk', icon: Package },
    { id: 'chat' as NavTab, label: 'Asisten', icon: BotMessageSquare },
    { id: 'reports' as NavTab, label: 'Laporan', icon: BarChart3 },
  ];
  const renderTab = (tab: any) => {
    const Icon = tab.icon;
    const active = activeTab === tab.id;
    return <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)} className={'flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl ' + (active ? 'text-[#172E4D]' : 'text-[#8793A4]')}><Icon className={'h-[21px] w-[21px] ' + (active ? 'stroke-[2.4]' : 'stroke-[1.7]')} /><span className={'text-[10px] ' + (active ? 'font-semibold' : 'font-medium')}>{tab.label}</span></button>;
  };
  return <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#E7EBF0] bg-white/95 backdrop-blur-xl pb-safe select-none shadow-[0_-4px_18px_rgba(20,34,52,0.05)]" aria-label="Navigasi Utama">
    <div className="relative mx-auto grid max-w-md grid-cols-5 items-end px-2 pt-1.5">
      {tabs.slice(0, 2).map(renderTab)}
      <div className="flex min-h-[52px] items-end justify-center"><button type="button" aria-label="Transaksi Baru" onClick={() => onTabChange('transactions')} className="-translate-y-4 flex h-[54px] w-[54px] items-center justify-center rounded-full border-[5px] border-white bg-[#172E4D] text-white shadow-[0_8px_22px_rgba(23,46,77,0.18)] active:scale-95"><Plus className="h-7 w-7 stroke-[2]" /></button></div>
      {tabs.slice(2).map(renderTab)}
    </div>
  </nav>;
}
