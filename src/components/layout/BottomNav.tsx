import React from 'react';
import { LayoutDashboard, Receipt, MoreHorizontal, BarChart3, Plus } from 'lucide-react';

export type NavTab = 'dashboard' | 'products' | 'transactions' | 'reports' | 'chat' | 'expenses' | 'settings';

interface BottomNavProps { activeTab: NavTab; onTabChange: (tab: NavTab) => void; }

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Beranda', icon: LayoutDashboard },
    { id: 'transactions' as NavTab, label: 'Transaksi', icon: Receipt },
    { id: 'reports' as NavTab, label: 'Laporan', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Lainnya', icon: MoreHorizontal },
  ];

  const renderTab = (tab: any) => {
    const Icon = tab.icon;
    const active = activeTab === tab.id;
    return <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)}
      className={'flex min-h-[54px] flex-col items-center justify-center gap-0.5 px-2 ' + (active ? 'text-[#22D3EE]' : 'text-[#718096]')}>
      <Icon className={'h-[20px] w-[20px] ' + (active ? 'stroke-[2.3]' : 'stroke-[1.7]')} />
      <span className={'text-[9px] tracking-wide ' + (active ? 'font-semibold' : 'font-medium')}>{tab.label}</span>
    </button>;
  };

  return <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#22303D] bg-[#0B1219]/95 backdrop-blur-xl pb-safe select-none shadow-[0_-8px_24px_rgba(0,0,0,.22)]" aria-label="Navigasi Utama">
    <div className="relative mx-auto grid max-w-md grid-cols-5 items-end px-2 pt-1.5">
      {tabs.slice(0, 2).map(renderTab)}
      <div className="flex min-h-[54px] items-end justify-center">
        <button type="button" aria-label="Transaksi Baru" onClick={() => onTabChange('transactions')}
          className="-translate-y-4 flex h-[52px] w-[52px] items-center justify-center rounded-full border-4 border-[#0B1219] bg-[#0EA5E9] text-white shadow-[0_7px_24px_rgba(14,165,233,.28)] active:scale-95 transition-transform">
          <Plus className="h-6 w-6 stroke-[2.2]" />
        </button>
      </div>
      {tabs.slice(2).map(renderTab)}
    </div>
  </nav>;
}
