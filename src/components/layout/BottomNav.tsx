import React from 'react';
import { LayoutDashboard, BotMessageSquare, BarChart3, Plus, Package } from 'lucide-react';

export type NavTab = 'dashboard' | 'products' | 'transactions' | 'reports' | 'chat' | 'expenses' | 'settings';

interface BottomNavProps { activeTab: NavTab; onTabChange: (tab: NavTab) => void; }

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const items = [
    { id: 'dashboard' as NavTab, label: 'Beranda', icon: LayoutDashboard },
    { id: 'products' as NavTab, label: 'Produk', icon: Package },
    { id: 'reports' as NavTab, label: 'Laporan', icon: BarChart3 },
    { id: 'chat' as NavTab, label: 'Asisten', icon: BotMessageSquare },
  ];

  const renderTab = (tab: typeof items[number]) => {
    const Icon = tab.icon;
    const active = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => onTabChange(tab.id)}
        className={'flex min-w-0 min-h-[54px] w-full flex-col items-center justify-center gap-0.5 px-1 ' + (active ? 'text-[#22D3EE]' : 'text-[#718096]')}
        aria-current={active ? 'page' : undefined}
      >
        <Icon className={'h-[20px] w-[20px] ' + (active ? 'stroke-[2.3]' : 'stroke-[1.7]')} />
        <span className={'text-[9px] tracking-wide whitespace-nowrap ' + (active ? 'font-semibold' : 'font-medium')}>{tab.label}</span>
      </button>
    );
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#22303D] bg-[#0B1219]/95 backdrop-blur-xl pb-safe select-none shadow-[0_-8px_24px_rgba(0,0,0,.22)]" aria-label="Navigasi Utama">
      <div className="mx-auto grid h-[68px] max-w-md grid-cols-[1fr_1fr_56px_1fr_1fr] items-end px-1 pt-1">
        {renderTab(items[0])}
        {renderTab(items[1])}
        <div className="relative flex h-[68px] items-start justify-center">
          <button
            type="button"
            aria-label="Transaksi Baru"
            title="Transaksi Baru"
            onClick={() => onTabChange('transactions')}
            className="absolute top-0 flex h-[52px] w-[52px] items-center justify-center rounded-full border-4 border-[#0B1219] bg-[#0EA5E9] text-white shadow-[0_7px_24px_rgba(14,165,233,.28)] active:scale-95 transition-transform"
          >
            <Plus className="h-6 w-6 stroke-[2.2]" />
          </button>
        </div>
        {renderTab(items[2])}
        {renderTab(items[3])}
      </div>
    </nav>
  );
}