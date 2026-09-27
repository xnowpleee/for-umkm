import React from 'react';
import { useBusiness } from '../context/BusinessContext';
import { formatRupiah, formatNumber, formatDateTime } from '../utils/formatters';
import { NavTab } from '../components/layout/BottomNav';
import { TrendingUp, ArrowDownCircle, DollarSign, ShoppingBag, AlertTriangle, ArrowRight, Receipt, Plus, BotMessageSquare, Package, Activity } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  onOpenQuickTx: () => void;
  onOpenQuickExpense: () => void;
}

export function DashboardPage({ onNavigate, onOpenQuickTx }: DashboardPageProps) {
  const { profile, dashboardSummary } = useBusiness();
  const { omzetToday, expensesToday, estimatedProfitToday, transactionsCountToday, topProductsToday, sevenDaysTrend, recentTransactions, lowStockProducts } = dashboardSummary;

  const maxTrendOmzet = Math.max(...sevenDaysTrend.map(d => d.omzet), 100000);
  const chartWidth = 700;
  const chartHeight = 220;
  const chartPadding = 16;

  const points = sevenDaysTrend.map((day, index) => {
    const x = sevenDaysTrend.length <= 1 ? chartWidth / 2 : chartPadding + (index / (sevenDaysTrend.length - 1)) * (chartWidth - chartPadding * 2);
    const normalized = day.omzet / maxTrendOmzet;
    const y = chartHeight - chartPadding - normalized * (chartHeight - chartPadding * 2);
    return { x, y, ...day };
  });

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = points.length > 0 ? `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z` : '';

  return (
    <div className="pb-24 md:pb-8 animate-[fadeIn_.35s_ease-out]">
      <section className="mb-4 flex flex-col gap-3 rounded-xl border border-[#192631] bg-[#0D151D]/55 p-3 sm:flex-row sm:items-end sm:justify-between sm:p-4">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE]" /><span className="text-[10px] uppercase tracking-[0.18em] text-[#64748B]">Business overview</span></div>
          <h1 className="text-xl font-semibold tracking-tight text-[#E5E7EB] sm:text-2xl">Dashboard</h1>
          <p className="mt-1 text-xs text-[#718096]">{profile.business_name || 'Toko Anda'} · Performa hari ini</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => onNavigate('chat')} className="group flex items-center gap-2 rounded-lg border border-[#22303D] bg-[#111827] px-3 py-2 text-xs font-medium text-[#D8D8D8] transition-all duration-200 hover:border-[#2F4657] hover:bg-[#14202A] active:scale-[0.98]"><BotMessageSquare className="h-3.5 w-3.5 text-[#64748B] group-hover:text-[#22D3EE]" />Asisten</button>
          <button type="button" onClick={onOpenQuickTx} className="flex items-center gap-2 rounded-lg border border-[#0EA5E9]/30 bg-[#0E2533] px-3.5 py-2 text-xs font-semibold text-[#67D5F5] transition-all duration-200 hover:bg-[#123247] active:scale-[0.97]"><Plus className="h-3.5 w-3.5" />Transaksi</button>
        </div>
      </section>

      <section className="relative mb-3 overflow-hidden rounded-xl border border-[#22303D] bg-[#111827] p-4 sm:p-5">
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#0EA5E9]/[0.06] blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#718096]"><Activity className="h-3.5 w-3.5 text-[#22D3EE]" />Omzet hari ini</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-[#F1F5F9] tabular-nums sm:text-4xl">{formatRupiah(omzetToday)}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs"><span className="text-[#94A3B8]">{transactionsCountToday} transaksi selesai</span><span className="h-1 w-1 rounded-full bg-[#526579]" /><span className={estimatedProfitToday >= 0 ? 'text-[#34D399]' : 'text-[#F87171]'}>{estimatedProfitToday >= 0 ? '+' : ''}{formatRupiah(estimatedProfitToday)} laba</span></div>
          </div>
          <div className="rounded-lg border border-[#192631] bg-[#0D151D]/70 px-3 py-2 lg:text-right"><p className="text-[10px] uppercase tracking-[0.15em] text-[#64748B]">Status</p><p className="mt-1 text-xs font-medium text-[#D8D8D8]">{estimatedProfitToday >= 0 ? 'Operasional positif' : 'Perlu perhatian'}</p></div>
        </div>
      </section>

      <section className="mb-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#192631] bg-[#192631] lg:grid-cols-4">
        {[
          { title: 'Omzet', value: formatRupiah(omzetToday), subtitle: `${transactionsCountToday} pesanan`, icon: DollarSign },
          { title: 'Pengeluaran', value: formatRupiah(expensesToday), subtitle: 'Operasional', icon: ArrowDownCircle },
          { title: 'Estimasi laba', value: formatRupiah(estimatedProfitToday), subtitle: 'Omzet - HPP - biaya', icon: TrendingUp },
          { title: 'Transaksi', value: `${transactionsCountToday}`, subtitle: 'Nota hari ini', icon: ShoppingBag },
        ].map((item, index) => {
          const Icon = item.icon;
          return <div key={item.title} className="group min-w-0 bg-[#0D151D] p-3.5 transition-colors duration-200 hover:bg-[#111C25] sm:p-4" style={{ animation: 'slideUp .4s ease-out both', animationDelay: `${index * 60}ms` }}><div className="flex items-center justify-between gap-2"><span className="truncate text-[10px] uppercase tracking-[0.12em] text-[#64748B]">{item.title}</span><Icon className="h-3.5 w-3.5 shrink-0 text-[#526579] transition-colors group-hover:text-[#22D3EE]" /></div><div className="mt-2.5 truncate text-sm font-semibold text-[#E5E7EB] tabular-nums sm:text-base">{item.value}</div><div className="mt-1 truncate text-[10px] text-[#526579]">{item.subtitle}</div></div>;
        })}
      </section>

      {lowStockProducts.length > 0 && <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-[#3B3425] bg-[#17150F] px-3 py-2.5 sm:px-4"><div className="flex min-w-0 items-center gap-2.5"><AlertTriangle className="h-4 w-4 shrink-0 text-[#FBBF24]" /><div className="min-w-0"><p className="truncate text-xs font-medium text-[#DDD]">Stok menipis · {lowStockProducts.length} produk</p><p className="truncate text-[10px] text-[#718096]">{lowStockProducts.map(p => `${p.name} (${p.stock} ${p.unit})`).slice(0, 2).join(', ')}</p></div></div><button type="button" onClick={() => onNavigate('products')} className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] text-[#FBBF24] hover:bg-[#211D13]">Periksa<ArrowRight className="h-3 w-3" /></button></div>}

      <section className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-[#22303D] bg-[#111827] p-4 sm:p-5 lg:col-span-2">
          <div className="mb-3 flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-[#E5E7EB]">Performa omzet</h2><span className="rounded-full border border-[#192631] bg-[#0D151D] px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-[#64748B]">7D</span></div><p className="mt-1 text-[10px] text-[#64748B]">Pergerakan omzet 7 hari terakhir</p></div><button type="button" onClick={() => onNavigate('reports')} className="rounded-md px-2 py-1 text-[10px] text-[#718096] hover:bg-[#0D151D] hover:text-[#E5E7EB]">Laporan →</button></div>
          <div className="relative h-[190px] w-full overflow-hidden rounded-lg border border-[#192631] bg-[#0D151D]/60 sm:h-[210px]"><div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-4">{[0, 1, 2, 3].map(i => <div key={i} className="border-t border-[#192631]" />)}</div><svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="relative h-full w-full overflow-visible"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22D3EE" stopOpacity="0.08" /><stop offset="100%" stopColor="#22D3EE" stopOpacity="0" /></linearGradient></defs><path d={areaPath} fill="url(#chartFill)" className="opacity-0 animate-[fadeIn_.8s_ease-out_.35s_forwards]" /><path d={linePath} fill="none" stroke="#22D3EE" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="animate-[drawLine_1.1s_ease-out_forwards]" />{points.map((point, index) => { const isToday = index === points.length - 1; return <g key={point.date}><circle cx={point.x} cy={point.y} r={isToday ? 4 : 2.5} fill="#0D151D" stroke="#22D3EE" strokeWidth={isToday ? 2 : 1} /><title>{point.label}: {formatNumber(point.omzet)}</title></g>; })}</svg></div>
          <div className="mt-2 grid grid-cols-7 gap-1 border-t border-[#192631] pt-2">{sevenDaysTrend.map((day, index) => <div key={day.date} className="text-center"><span className={`text-[9px] ${index === sevenDaysTrend.length - 1 ? 'font-semibold text-[#E5E7EB]' : 'text-[#526579]'}`}>{day.label}</span></div>)}</div><div className="mt-2 flex items-center justify-between text-[10px] text-[#526579]"><span>Terendah — tertinggi</span><span className="tabular-nums">Max {formatRupiah(maxTrendOmzet)}</span></div>
        </div>

        <div className="rounded-xl border border-[#22303D] bg-[#111827] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-semibold text-[#E5E7EB]">Produk terlaris</h2><p className="mt-1 text-[10px] text-[#64748B]">Penjualan hari ini</p></div><button type="button" onClick={() => onNavigate('products')} className="rounded-md px-2 py-1 text-[10px] text-[#718096] hover:bg-[#0D151D] hover:text-[#E5E7EB]">Katalog</button></div>
          {topProductsToday.length === 0 ? <div className="flex flex-col items-center justify-center py-12 text-center"><Package className="mb-2 h-6 w-6 text-[#3B4A58]" /><p className="text-[10px] text-[#64748B]">Belum ada penjualan hari ini.</p></div> : <div className="mt-4 rounded-lg border border-[#192631] bg-[#0D151D]/45 px-3">{topProductsToday.slice(0, 4).map((prod, idx) => <div key={prod.name} className="group flex items-center gap-3 border-b border-[#192631] py-2.5 last:border-none"><span className="w-5 text-[10px] font-mono text-[#526579]">{String(idx + 1).padStart(2, '0')}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-[#DCE3EA]">{prod.name}</p><p className="mt-0.5 text-[9px] text-[#64748B]">{prod.quantity} terjual</p></div><span className="text-[10px] font-semibold text-[#CBD5E1] tabular-nums">{formatRupiah(prod.revenue)}</span></div>)}</div>}
          <button type="button" onClick={onOpenQuickTx} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#22303D] bg-[#0D151D] py-2.5 text-[10px] font-semibold text-[#CBD5E1] transition-colors hover:bg-[#14202A] hover:text-white"><Plus className="h-3.5 w-3.5" />Pesanan baru</button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#22303D] bg-[#111827]">
        <div className="flex items-center justify-between gap-3 border-b border-[#192631] px-4 py-3.5 sm:px-5"><div><h2 className="text-sm font-semibold text-[#E5E7EB]">Transaksi terbaru</h2><p className="mt-0.5 text-[10px] text-[#64748B]">Aktivitas kasir terakhir</p></div><button type="button" onClick={() => onNavigate('transactions')} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-[#718096] hover:bg-[#0D151D] hover:text-[#E5E7EB]">Semua<ArrowRight className="h-3 w-3" /></button></div>
        {recentTransactions.length === 0 ? <div className="py-10 text-center"><Receipt className="mx-auto mb-2 h-6 w-6 text-[#3B4A58]" /><p className="text-[10px] text-[#64748B]">Belum ada transaksi.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-xs"><thead className="border-b border-[#192631] bg-[#0D151D]/45 text-[9px] uppercase tracking-wider text-[#526579]"><tr><th className="px-4 py-2.5">Nota</th><th className="px-2 py-2.5">Waktu</th><th className="px-2 py-2.5">Item</th><th className="px-2 py-2.5">Metode</th><th className="px-4 py-2.5 text-right">Total</th><th className="px-4 py-2.5 text-right">Laba</th></tr></thead><tbody>{recentTransactions.slice(0, 5).map(tx => <tr key={tx.id} className="border-b border-[#192631] transition-colors last:border-none hover:bg-[#14202A]"><td className="px-4 py-3 font-mono text-[10px] font-medium text-[#DCE3EA]">{tx.invoice_number}</td><td className="whitespace-nowrap px-2 py-3 text-[10px] text-[#64748B]">{formatDateTime(tx.date)}</td><td className="max-w-[180px] truncate px-2 py-3 text-[10px] text-[#94A3B8]">{Array.isArray(tx.items) && tx.items.length > 0 ? tx.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ') : '-'}</td><td className="px-2 py-3 text-[9px] font-semibold uppercase text-[#64748B]">{tx.payment_method}</td><td className="px-4 py-3 text-right text-[10px] font-semibold text-[#DCE3EA] tabular-nums">{formatRupiah(tx.total_amount)}</td><td className="px-4 py-3 text-right text-[10px] font-semibold text-[#CBD5E1] tabular-nums">{tx.profit >= 0 ? '+' : ''}{formatRupiah(tx.profit)}</td></tr>)}</tbody></table></div>}
      </section>

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @keyframes drawLine { from { stroke-dasharray: 1; stroke-dashoffset: 1; } to { stroke-dasharray: 1; stroke-dashoffset: 0; } }`}</style>
    </div>
  );
}
