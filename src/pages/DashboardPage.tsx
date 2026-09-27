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
  const { profile, dashboardSummary, transactions, products } = useBusiness();
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
  const getTopProductImage = (product: any) => {
    const match = products.find(p => p.name === product?.name);
    return productImage(match);
  };

  const chartWidth = 360;
  const chartHeight = 108;
  const chartPoints = trend.map((point, index) => {
    const x = trend.length === 1 ? chartWidth / 2 : 12 + (index / (trend.length - 1)) * (chartWidth - 24);
    const y = 88 - (point.omzet / maxOmzet) * 62;
    return { ...point, x, y };
  });
  const linePoints = chartPoints.map(p => p.x + ',' + p.y).join(' ');

  return (
    <div className="bk-terminal-page min-h-full pb-24 text-[#E5E7EB]">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#64748B]">Dashboard</p>
          <h1 className="mt-1 truncate text-[17px] font-semibold tracking-tight text-[#E5E7EB]">Halo, {profile?.business_name || 'Pengusaha'} <span className="text-[#22D3EE]">.</span></h1>
          <p className="mt-0.5 text-[10px] text-[#718096]">Pantau bisnis kamu dalam satu layar.</p>
        </div>
        <button type="button" onClick={() => onNavigate('settings')} className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#2A3947] bg-[#111827]">
          {profile?.logo_url ? <img src={profile.logo_url} alt="" className="h-full w-full object-cover" /> : <span className="text-[10px] font-bold text-[#94A3B8]">BK</span>}
        </button>
      </header>

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex border border-[#263744] bg-[#0D151D] p-0.5">
          {(['Hari Ini', '7 Hari', '30 Hari'] as Range[]).map(item => <button key={item} type="button" onClick={() => setRange(item)} className={'px-2.5 py-1.5 text-[9px] font-medium transition-colors ' + (range === item ? 'bg-[#123247] text-[#22D3EE]' : 'text-[#718096] hover:text-[#CBD5E1]')}>{item}</button>)}
        </div>
        <button type="button" onClick={onOpenQuickTx} className="flex items-center gap-1.5 border border-[#0EA5E9]/30 bg-[#0E2533] px-2.5 py-1.5 text-[9px] font-semibold text-[#67D5F5] active:scale-[.98]"><Plus className="h-3.5 w-3.5" /> Transaksi Baru</button>
      </div>

      <section className="relative overflow-hidden border-y border-[#263744] py-4 sm:py-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_5%,rgba(14,165,233,.10),transparent_32%)] pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.13em] text-[#718096]"><CircleDollarSign className="h-3.5 w-3.5 text-[#22D3EE]" /> Omzet {range.toLowerCase()} <Eye className="ml-0.5 h-3 w-3 opacity-60" /></div>
              <p className="mt-2 text-[27px] font-bold leading-none tracking-tight text-[#F1F5F9] tabular-nums">{formatRupiah(omzetToday)}</p>
              <div className={'mt-2 flex items-center gap-1 text-[9px] font-semibold ' + (margin > 0 ? 'text-[#34D399]' : margin < 0 ? 'text-[#F87171]' : 'text-[#718096]')}><ArrowUpRight className="h-3 w-3" /> Margin laba {margin.toFixed(0)}%</div>
            </div>
            <div className="hidden sm:block text-right"><p className="text-[9px] uppercase tracking-[0.12em] text-[#526579]">Status</p><p className="mt-1 flex items-center justify-end gap-1 text-[9px] font-medium text-[#34D399]"><span className="h-1.5 w-1.5 rounded-full bg-[#34D399] shadow-[0_0_8px_rgba(52,211,153,.55)]" /> LIVE</p></div>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[8px] uppercase tracking-[0.12em] text-[#526579]">
              <span>Analisis omzet</span>
              <span>{days} titik data</span>
            </div>
            <div className="bk-soft-grid relative h-[112px] w-full overflow-hidden border-y border-[#1B2934]">
              <div className="absolute inset-y-0 left-0 z-10 flex flex-col justify-between pr-2 text-[7px] text-[#526579]">
                <span>{formatRupiah(maxOmzet)}</span><span>{formatRupiah(maxOmzet / 2)}</span><span>Rp0</span>
              </div>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" className="ml-9 h-full w-[calc(100%-2.25rem)] overflow-visible"><g className="bk-chart-grid">{[26,57,88].map(y => <line key={y} x1="12" x2="348" y1={y} y2={y} />)}</g>
                <polyline points={linePoints} fill="none" stroke="#22D3EE" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                {chartPoints.map((p, i) => <circle key={p.date} cx={p.x} cy={p.y} r={i === chartPoints.length - 1 ? 3 : 2} fill="#080F14" stroke="#22D3EE" strokeWidth="1.5"><title>{p.label}: {formatRupiah(p.omzet)}</title></circle>)}
              </svg>
            </div>
            <div className="ml-9 mt-1 flex justify-between text-[8px] text-[#526579]">
              {trend.filter((_, i) => days === 30 ? i === 0 || i === trend.length - 1 || i % 5 === 0 : true).slice(0, days === 30 ? 7 : days).map(p => <span key={p.date}>{days === 30 ? p.date.slice(8) : p.label}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-3 flex border-y border-[#263744]">
        {[
          ['Transaksi', String(transactionsCountToday), 'hari ini', Receipt],
          ['Item Terjual', String(topProductsToday.reduce((sum: number, p: any) => sum + Number(p.quantity || 0), 0)), 'item', Package],
          ['Rata-rata', formatRupiah(average), '/ transaksi', CircleDollarSign],
        ].map(function(item: any) {
          const Icon = item[3];
          return <div key={item[0]} className="min-w-0 flex-1 px-2.5 py-3 sm:px-4 first:pl-0 last:pr-0"><Icon className="h-3.5 w-3.5 text-[#60758A]" /><p className="mt-2 truncate text-[9px] text-[#64748B]">{item[0]}</p><p className="mt-1 truncate text-[12px] font-semibold text-[#E5E7EB] tabular-nums">{item[1]}</p><p className="mt-0.5 truncate text-[8px] text-[#526579]">{item[2]}</p></div>;
        })}
      </section>

      <section className="mt-3 border-y border-[#263744] py-3.5 sm:py-4">
        <div className="mb-3 flex items-center gap-2"><Wallet className="h-4 w-4 text-[#22D3EE]" /><h2 className="text-[12px] font-semibold text-[#E5E7EB]">Ringkasan Keuangan</h2><span className="ml-auto text-[8px] uppercase tracking-[.12em] text-[#526579]">Hari ini</span></div>
        <div className="flex flex-wrap">
          {[['Omzet', omzetToday, 'text-[#E5E7EB]'], ['Laba', estimatedProfitToday, 'text-[#34D399]'], ['HPP', hppToday, 'text-[#CBD5E1]'], ['Pengeluaran', expensesToday, 'text-[#F87171]']].map(function(item: any) {
            return <div key={item[0]} className="w-1/2 border-b border-[#263744] px-3 py-2.5 first:pl-0 sm:w-1/4 sm:border-b-0 sm:py-1.5"><p className="text-[9px] text-[#64748B]">{item[0]}</p><p className={'mt-1 text-[12px] font-semibold tabular-nums ' + item[2]}>{formatRupiah(Number(item[1]))}</p></div>;
          })}
        </div>
      </section>

      <section className="mt-4 border-y border-[#263744]">
        <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-[#22303D]">
          <div className="px-0 py-3.5 lg:pr-5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[#22D3EE]" />
              <h2 className="text-[12px] font-semibold text-[#E5E7EB]">Produk Terlaris</h2>
              <button type="button" onClick={() => onNavigate('products')} className="ml-auto text-[9px] text-[#67D5F5]">Lihat semua</button>
            </div>
            <div className="mt-2 divide-y divide-[#1D2A35]">
              {topProductsToday.length === 0 ? <p className="py-5 text-center text-[9px] text-[#64748B]">Belum ada penjualan hari ini.</p> : topProductsToday.slice(0, 4).map(function(product: any, index) {
                return <div key={product.name || index} className="flex items-center gap-2.5 py-2">
                  <span className="w-4 text-[9px] font-semibold text-[#526579] tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                  {getTopProductImage(product) ? <img src={getTopProductImage(product)} alt="" className="h-8 w-8 rounded object-cover border border-[#2A3947]" loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; }} /> : <div className="h-8 w-8 bg-[#16222D] border border-[#2A3947] flex items-center justify-center"><Package className="h-3.5 w-3.5 text-[#60758A]" /></div>}
                  <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium text-[#DCE3EA]">{product.name}</p><p className="mt-0.5 text-[8px] text-[#64748B]">{product.quantity} pcs terjual</p></div>
                  <span className="text-[11px] font-semibold text-[#E5E7EB] tabular-nums">{product.quantity}</span>
                </div>;
              })}
            </div>
          </div>

          <div className="px-0 py-3.5 lg:pl-5">
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-[#FBBF24]" />
              <h2 className="text-[12px] font-semibold text-[#E5E7EB]">Stok Menipis</h2>
              <span className="ml-auto text-[9px] text-[#FBBF24]">{lowStockProducts.length} produk</span>
            </div>
            <div className="mt-2 divide-y divide-[#1D2A35]">
              {lowStockProducts.length === 0 ? <p className="py-5 text-center text-[9px] text-[#64748B]">Semua stok masih aman.</p> : lowStockProducts.slice(0, 4).map(function(product: any, index: number) {
                return <button key={product.id || product.name || index} type="button" onClick={() => onNavigate('products')} className="flex w-full items-center gap-2.5 py-2 text-left">
                  {productImage(product) ? <img src={productImage(product)} alt="" className="h-8 w-8 rounded object-cover border border-[#2A3947]" /> : <div className="flex h-8 w-8 items-center justify-center bg-[#241F18] border border-[#453B27]"><Package className="h-3.5 w-3.5 text-[#FBBF24]" /></div>}
                  <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium text-[#DCE3EA]">{product.name}</p><p className="mt-0.5 text-[8px] text-[#64748B]">Minimum {product.min_stock ?? 0} {product.unit}</p></div>
                  <span className="text-[10px] font-semibold text-[#FBBF24] tabular-nums">{product.stock} {product.unit}</span>
                </button>;
              })}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
