import React from 'react';
import { LayoutDashboard, Package, BotMessageSquare, BarChart3, Plus } from 'lucide-react';

export type NavTab = 'dashboard' | 'products' | 'transactions' | 'reports' | 'chat' | 'expenses' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Beranda', icon: LayoutDashboard },
    { id: 'products' as NavTab, label: 'Produk', icon: Package },
    { id: 'chat' as NavTab, label: 'Asisten', icon: BotMessageSquare },
    { id: 'reports' as NavTab, label: 'Laporan', icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#203244]/90 bg-[#080F14]/96 backdrop-blur-xl pb-safe select-none" aria-label="Navigasi Utama">
      <div className="relative mx-auto grid max-w-md grid-cols-5 items-end px-2 pt-1.5">
        {tabs.slice(0, 2).map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)}
              className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${active ? 'text-[#38BDF8]' : 'text-[#71849A]'}`}>
              <Icon className={`h-[21px] w-[21px] ${active ? 'stroke-[2.3]' : 'stroke-[1.7]'}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}

        <div className="flex min-h-[52px] items-end justify-center">
          <button type="button" aria-label="Transaksi Baru" onClick={() => onTabChange('transactions')}
            className="-translate-y-4 flex h-[54px] w-[54px] items-center justify-center rounded-full border-[5px] border-[#080F14] bg-gradient-to-br from-[#0EA5E9] to-[#22D3EE] text-[#03131C] shadow-[0_8px_28px_rgba(14,165,233,.35)] transition-transform active:scale-95">
            <Plus className="h-7 w-7 stroke-[2.5]" />
          </button>
        </div>

        {tabs.slice(2).map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)}
              className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${active ? 'text-[#38BDF8]' : 'text-[#71849A]'}`}>
              <Icon className={`h-[21px] w-[21px] ${active ? 'stroke-[2.3]' : 'stroke-[1.7]'}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
