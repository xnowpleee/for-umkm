import React, { useMemo, useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { formatRupiah, getDateKey } from '../utils/formatters';
import { NavTab } from '../components/layout/BottomNav';
import { ArrowUpRight, BarChart3, ChevronRight, CircleDollarSign, Eye, Package, Plus, Receipt, ShoppingBag, Sparkles, TriangleAlert, Wallet } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  onOpenQuickTx: () => void;
  onOpenQuickExpense: () => void;
}

type Range = 'Hari Ini' | '7 Hari' | '30 Hari';

export function DashboardPage({ onNavigate, onOpenQuickTx }: DashboardPageProps) {
  const { profile, dashboardSummary, transactions } = useBusiness();
  const [range, setRange] = useState<Range>('7 Hari');
  const { omzetToday, expensesToday, estimatedProfitToday, transactionsCountToday, topProductsToday, lowStockProducts } = dashboardSummary;

  const days = range === 'Hari Ini' ? 1 : range === '30 Hari' ? 30 : 7;
  const trend = useMemo(() => {
    const rows: { date: string; label: string; omzet: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const date = String(d.getFullYear()) + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const omzet = transactions.filter(t => getDateKey(t.date) === date).reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
      rows.push({ date, label: days === 1 ? 'Hari ini' : d.toLocaleDateString('id-ID', { weekday: 'short' }), omzet });
    }
    return rows;
  }, [days, transactions]);

  const maxOmzet = Math.max(...trend.map(x => x.omzet), 1);
  const average = transactionsCountToday ? omzetToday / transactionsCountToday : 0;
  const hppToday = Math.max(omzetToday - estimatedProfitToday - expensesToday, 0);
  const margin = omzetToday ? (estimatedProfitToday / omzetToday) * 100 : 0;
  const productImage = (product: any) => product?.image_url || product?.image || '';

  return (
    <div className="min-h-full pb-24 text-[#172033]">
      <header className="mb-5 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[#6B7890]">Halo, {profile?.business_name || 'UJAYY'} 👋</p>
          <p className="mt-1 text-[12px] text-[#8190A5]">Semangat terus, bisnis kamu makin berkembang!</p>
        </div>
        <button type="button" onClick={() => onNavigate('settings')} className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E5E9F0] bg-white shadow-sm">
          {profile?.logo_url ? <img src={profile.logo_url} alt="" className="h-full w-full object-cover" /> : <span className="text-xs font-bold text-[#172E4D]">BK</span>}
        </button>
      </header>

      <section className="relative overflow-hidden rounded-2xl bg-[#172E4D] p-5 text-white shadow-[0_12px_32px_rgba(23,46,77,0.10)]">
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#D7DFEA]"><CircleDollarSign className="h-3.5 w-3.5" />Total Omzet<Eye className="ml-1 h-3.5 w-3.5 opacity-70" /></div>
              <p className="mt-2 text-[28px] font-bold leading-none tracking-tight tabular-nums">{formatRupiah(omzetToday)}</p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px]"><span className="inline-flex items-center gap-0.5 font-semibold text-[#5BC29A]"><ArrowUpRight className="h-3 w-3" />{margin.toFixed(0)}%</span><span className="text-[#B7C4D5]">dari kemarin</span></div>
            </div>
            <button type="button" onClick={onOpenQuickTx} className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2.5 text-[10px] font-semibold text-[#172E4D] shadow-sm active:scale-[.98]">Transaksi Baru <Plus className="h-3.5 w-3.5" /></button>
          </div>
          <div className="mt-5 h-12">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-full w-full">
              <polyline points={trend.map((p, i) => String(trend.length === 1 ? 50 : (i / (trend.length - 1)) * 100) + ',' + String(28 - (p.omzet / maxOmzet) * 22)).join(' ')} fill="none" stroke="#B9CCEA" strokeWidth="1.25" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-[#E5E9F0] bg-white p-4 shadow-[0_4px_18px_rgba(28,43,64,0.035)]">
        <div className="mb-4 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF3F9] text-[#172E4D]"><Wallet className="h-4 w-4" /></div><h2 className="text-[14px] font-semibold text-[#172033]">Ringkasan Keuangan</h2><ChevronRight className="ml-auto h-4 w-4 text-[#91A0B4]" /></div>
        <div className="grid grid-cols-2 divide-x divide-y divide-[#EDF0F4] sm:grid-cols-4 sm:divide-y-0">
          {[['Omzet', omzetToday], ['Keuntungan', estimatedProfitToday], ['HPP', hppToday], ['Pengeluaran', expensesToday]].map(function(item: any) {
            return <div key={item[0]} className="px-2 py-2 first:pl-0 sm:py-1"><p className="text-[10px] text-[#8290A3]">{item[0]}</p><p className="mt-1 text-[13px] font-semibold text-[#1C2B40] tabular-nums">{formatRupiah(Number(item[1]))}</p><p className="mt-1 text-[9px] font-semibold text-[#259A72]">↑ {item[0] === 'Pengeluaran' ? '3%' : item[0] === 'Keuntungan' ? '8%' : '12%'}</p></div>;
          })}
        </div>
      </section>

      <section className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E9F0] bg-white p-4 shadow-[0_4px_18px_rgba(28,43,64,0.035)]">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#172E4D]" /><h2 className="text-[13px] font-semibold">Tren Penjualan</h2></div><select value={range} onChange={e => setRange(e.target.value as Range)} className="rounded-md border-0 bg-transparent text-[10px] font-medium text-[#65748A] outline-none"><option>Hari Ini</option><option>7 Hari</option><option>30 Hari</option></select></div>
          <div className="mt-4 flex h-36 items-end gap-2">
            {trend.map(function(item) {
              const height = Math.max((item.omzet / maxOmzet) * 100, item.omzet ? 8 : 3);
              return <div key={item.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="w-full max-w-[30px] rounded-t-md bg-[#304C70]" style={{ height: String(height) + '%' }} /><span className="text-[9px] text-[#8491A4]">{item.label}</span></div>;
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#EADBDD] bg-white p-4 shadow-[0_4px_18px_rgba(28,43,64,0.035)]">
          <div className="flex items-center gap-2"><TriangleAlert className="h-4 w-4 text-[#D86C6C]" /><h2 className="text-[13px] font-semibold">Stok Menipis</h2><ChevronRight className="ml-auto h-4 w-4 text-[#9AA6B7]" /></div>
          <div className="mt-3 space-y-3">
            {lowStockProducts.length === 0 ? <p className="py-6 text-center text-[10px] text-[#8A96A8]">Semua stok masih aman.</p> : lowStockProducts.slice(0, 3).map(function(product: any, index) {
              return <button key={product.id || product.name || index} type="button" onClick={() => onNavigate('products')} className="flex w-full items-center gap-3 text-left">
                {productImage(product) ? <img src={productImage(product)} alt="" className="h-9 w-9 rounded-lg object-cover" /> : <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F2F4F7] text-[#718096]"><Package className="h-4 w-4" /></div>}
                <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium">{product.name}</p><p className="mt-0.5 text-[9px] text-[#8995A7]">{product.stock} {product.unit}</p></div><span className="text-[10px] font-semibold text-[#D85D5D]">{product.stock} pcs</span>
              </button>;
            })}
          </div>
          {lowStockProducts.length > 0 && <button type="button" onClick={() => onNavigate('products')} className="mt-3 w-full rounded-full bg-[#F8F2F2] py-2 text-[9px] font-medium text-[#7A5960]">Lihat semua →</button>}
        </div>
      </section>

      <section className="mt-4 grid grid-cols-3 gap-3">
        {[['Transaksi', String(transactionsCountToday), 'hari ini', Receipt], ['Rata-rata Transaksi', formatRupiah(average), 'per transaksi', CircleDollarSign], ['Item Terjual', String(topProductsToday.reduce((sum: number, p: any) => sum + Number(p.quantity || 0), 0)), 'item', Package]].map(function(item: any) {
          const Icon = item[3];
          return <div key={item[0]} className="rounded-2xl border border-[#E5E9F0] bg-white p-3.5 shadow-[0_4px_18px_rgba(28,43,64,0.035)]"><Icon className="h-4 w-4 text-[#6D7C91]" /><p className="mt-3 text-[9px] text-[#8190A5]">{item[0]}</p><p className="mt-1 truncate text-[13px] font-semibold text-[#1C2B40]">{item[1]}</p><p className="mt-0.5 text-[9px] text-[#8D99A9]">{item[2]}</p></div>;
        })}
      </section>

      <section className="mt-4 rounded-2xl border border-[#E5E9F0] bg-white p-4 shadow-[0_4px_18px_rgba(28,43,64,0.035)]">
        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-[#172E4D]" /><h2 className="text-[13px] font-semibold">Produk Terlaris</h2></div><button type="button" onClick={() => onNavigate('products')} className="text-[10px] text-[#65748A]">Lihat semua</button></div>
        <div className="mt-4 space-y-4">
          {topProductsToday.length === 0 ? <p className="py-5 text-center text-[10px] text-[#8A96A8]">Belum ada penjualan hari ini.</p> : topProductsToday.slice(0, 4).map(function(product: any, index) {
            const width = Math.min(100, Math.max(8, Number(product.quantity || 0) * 8));
            return <div key={product.name || index} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F1F3F6] text-[10px] font-semibold text-[#6D7A8E]">{index + 1}</span>{productImage(product) ? <img src={productImage(product)} alt="" className="h-8 w-8 rounded-md object-cover" /> : <div className="h-8 w-8 rounded-md bg-[#F2F4F7]" />}<div className="min-w-0 w-28 shrink-0"><p className="truncate text-[10px] font-medium">{product.name}</p><p className="text-[9px] text-[#8A96A8]">{product.quantity} pcs terjual</p></div><div className="flex-1"><div className="h-1.5 overflow-hidden rounded-full bg-[#E8ECF1]"><div className="h-full rounded-full bg-[#203A5C]" style={{ width: String(width) + '%' }} /></div></div><span className="w-8 text-right text-[9px] text-[#68778B]">{Math.min(99, Number(product.quantity || 0) * 3)}%</span></div>;
          })}
        </div>
      </section>

      <button type="button" onClick={() => onNavigate('chat')} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-[#E6EAF1] bg-[#F7F9FC] p-4 text-left">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF0F8] text-[#304C70]"><Sparkles className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1"><p className="text-[12px] font-semibold text-[#1D2B3F]">BisnisKu AI</p><p className="mt-0.5 text-[9px] text-[#78879B]">Tanya apa saja tentang bisnismu, dapatkan insight & saran.</p></div>
        <span className="rounded-full bg-[#172E4D] px-3 py-2 text-[9px] font-semibold text-white">Mulai Chat</span>
      </button>
    </div>
  );
}
