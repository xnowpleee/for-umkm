import React, { useMemo, useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { formatRupiah, getDateKey } from '../utils/formatters';
import { NavTab } from '../components/layout/BottomNav';
import {
  ArrowUpRight,
  BarChart3,
  BotMessageSquare,
  ChevronRight,
  CircleDollarSign,
  Package,
  Plus,
  Receipt,
  ShoppingBag,
  Sparkles,
  TriangleAlert,
  Wallet,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  onOpenQuickTx: () => void;
  onOpenQuickExpense: () => void;
}

type Range = 'Hari Ini' | '7 Hari' | '30 Hari';

export function DashboardPage({ onNavigate, onOpenQuickTx }: DashboardPageProps) {
  const { profile, dashboardSummary, transactions, expenses } = useBusiness();
  const [range, setRange] = useState<Range>('7 Hari');

  const {
    omzetToday,
    expensesToday,
    estimatedProfitToday,
    transactionsCountToday,
    topProductsToday,
    lowStockProducts,
  } = dashboardSummary;

  const days = range === 'Hari Ini' ? 1 : range === '30 Hari' ? 30 : 7;

  const trend = useMemo(() => {
    const rows: { date: string; label: string; omzet: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const omzet = transactions
        .filter(t => getDateKey(t.date) === date)
        .reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
      rows.push({
        date,
        label: days === 1 ? 'Hari ini' : d.toLocaleDateString('id-ID', { weekday: 'short' }),
        omzet,
      });
    }
    return rows;
  }, [days, transactions]);

  const maxOmzet = Math.max(...trend.map(x => x.omzet), 1);
  const totalPeriod = trend.reduce((sum, x) => sum + x.omzet, 0);
  const average = transactionsCountToday ? omzetToday / transactionsCountToday : 0;
  const hppToday = Math.max(omzetToday - estimatedProfitToday - expensesToday, 0);
  const margin = omzetToday ? (estimatedProfitToday / omzetToday) * 100 : 0;
  const expenseRatio = omzetToday ? (expensesToday / omzetToday) * 100 : 0;

  const chartPoints = trend.map((item, index) => {
    const x = trend.length === 1 ? 50 : (index / (trend.length - 1)) * 100;
    const y = 92 - (item.omzet / maxOmzet) * 76;
    return { ...item, x, y };
  });
  const chartLine = chartPoints.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
  const chartArea = chartPoints.length
    ? `${chartLine} L 100 100 L 0 100 Z`
    : '';

  const productImage = (product: any) => product?.image_url || product?.image || '';

  return (
    <div className="min-h-full pb-28 text-[#E5E7EB]">
      <header className="mb-4 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[#71849A]">Selamat datang 👋</p>
          <h1 className="mt-0.5 truncate text-[20px] font-bold tracking-tight text-white">
            {profile?.business_name || 'BisnisKu'}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#203244] bg-[#111D2A]"
          aria-label="Pengaturan"
        >
          {profile?.logo_url ? (
            <img src={profile.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-[#38BDF8]">BK</span>
          )}
        </button>
      </header>

      <section className="relative overflow-hidden rounded-2xl border border-[#16415D] bg-gradient-to-br from-[#0B2435] via-[#0E1722] to-[#111D2A] p-4 shadow-[0_14px_45px_rgba(3,105,161,.12)]">
        <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#22D3EE]/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#8BA6BB]">
                <CircleDollarSign className="h-3.5 w-3.5 text-[#38BDF8]" />
                Omzet hari ini
              </div>
              <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-white tabular-nums">
                {formatRupiah(omzetToday)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#0EA5E9]/15 px-1.5 py-1 font-semibold text-[#38BDF8]">
                  <ArrowUpRight className="h-3 w-3" />
                  {margin.toFixed(1)}%
                </span>
                <span className="text-[#71849A]">margin keuntungan</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenQuickTx}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0EA5E9] px-3 py-2.5 text-[10px] font-bold text-white shadow-lg shadow-[#0EA5E9]/20 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Transaksi
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3 text-[10px]">
            <span className="text-[#71849A]">{transactionsCountToday} transaksi</span>
            <span className="text-[#71849A]">Rata-rata {formatRupiah(average)}</span>
          </div>
        </div>
      </section>

      <section className="mt-3 grid grid-cols-2 gap-2.5">
        {[
          { label: 'Keuntungan', value: estimatedProfitToday, icon: Wallet, tone: 'text-[#22D3EE]' },
          { label: 'Pengeluaran', value: expensesToday, icon: Receipt, tone: 'text-[#60A5FA]' },
          { label: 'HPP', value: hppToday, icon: Package, tone: 'text-[#94A3B8]' },
          { label: 'Transaksi', value: transactionsCountToday, icon: ShoppingBag, tone: 'text-[#38BDF8]', count: true },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-[#203244] bg-[#0E1722] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#71849A]">{item.label}</span>
                <Icon className={`h-4 w-4 ${item.tone}`} />
              </div>
              <p className="mt-2 text-[15px] font-bold text-white tabular-nums">
                {item.count ? item.value : formatRupiah(item.value)}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mt-3 overflow-hidden rounded-2xl border border-[#203244] bg-[#0E1722] p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#38BDF8]" />
              <h2 className="text-[13px] font-semibold text-white">Performa Penjualan</h2>
            </div>
            <p className="mt-1 text-[9px] text-[#71849A]">{formatRupiah(totalPeriod)} total periode</p>
          </div>
          <div className="flex rounded-lg border border-[#203244] bg-[#080F14] p-0.5">
            {(['Hari Ini', '7 Hari', '30 Hari'] as Range[]).map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setRange(item)}
                className={`rounded-md px-2 py-1.5 text-[8px] font-medium ${range === item ? 'bg-[#0EA5E9] text-white' : 'text-[#71849A]'}`}
              >
                {item === 'Hari Ini' ? '1D' : item === '7 Hari' ? '7D' : '30D'}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-4 h-36">
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3].map(i => <div key={i} className="border-t border-[#203244]/60" />)}
          </div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-28 w-full">
            <defs>
              <linearGradient id="bkChartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity=".28" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={chartArea} fill="url(#bkChartFill)" />
            <path d={chartLine} fill="none" stroke="#38BDF8" strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="absolute inset-x-0 bottom-0 flex justify-between text-[8px] text-[#5F7488]">
            {chartPoints.map(point => <span key={point.date}>{point.label}</span>)}
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={() => onNavigate('chat')}
        className="mt-3 flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-[#16415D] bg-gradient-to-r from-[#0B2940] to-[#10283A] p-3.5 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0EA5E9]/15 text-[#38BDF8]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold text-white">BisnisKu AI</p>
          <p className="mt-0.5 truncate text-[9px] text-[#8BA6BB]">Tanya kondisi bisnis, penjualan, atau stok kamu.</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-[#38BDF8]" />
      </button>

      <section className="mt-3 rounded-2xl border border-[#203244] bg-[#0E1722]">
        <div className="flex items-center justify-between px-3.5 py-3">
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4 text-[#FBBF24]" />
            <h2 className="text-[13px] font-semibold text-white">Stok Menipis</h2>
          </div>
          <button type="button" onClick={() => onNavigate('products')} className="text-[9px] font-semibold text-[#38BDF8]">Lihat semua</button>
        </div>
        <div className="border-t border-[#203244]">
          {lowStockProducts.length === 0 ? (
            <p className="px-3.5 py-5 text-center text-[10px] text-[#71849A]">Semua stok masih aman.</p>
          ) : lowStockProducts.slice(0, 3).map((product: any, index) => (
            <button
              key={product.id || product.name || index}
              type="button"
              onClick={() => onNavigate('products')}
              className="flex w-full items-center gap-3 border-b border-[#203244] px-3.5 py-2.5 text-left last:border-0"
            >
              {productImage(product) ? (
                <img src={productImage(product)} alt="" className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#162435] text-[#71849A]"><Package className="h-4 w-4" /></div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold text-[#DDE7EF]">{product.name}</p>
                <p className="mt-0.5 text-[9px] text-[#71849A]">{product.stock} {product.unit}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#526B80]" />
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-[#203244] bg-[#0E1722]">
        <div className="flex items-center justify-between px-3.5 py-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[#38BDF8]" />
            <h2 className="text-[13px] font-semibold text-white">Produk Terlaris</h2>
          </div>
          <button type="button" onClick={() => onNavigate('products')} className="text-[9px] font-semibold text-[#38BDF8]">Lihat semua</button>
        </div>
        <div className="border-t border-[#203244]">
          {topProductsToday.length === 0 ? (
            <p className="px-3.5 py-5 text-center text-[10px] text-[#71849A]">Belum ada penjualan hari ini.</p>
          ) : topProductsToday.slice(0, 4).map((product: any, index) => (
            <div key={product.name || index} className="flex items-center gap-3 border-b border-[#203244] px-3.5 py-2.5 last:border-0">
              <span className="w-4 text-[10px] font-bold text-[#526B80]">0{index + 1}</span>
              {productImage(product) ? (
                <img src={productImage(product)} alt="" className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#162435] text-[#71849A]"><Package className="h-4 w-4" /></div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold text-[#DDE7EF]">{product.name}</p>
                <p className="mt-0.5 text-[9px] text-[#71849A]">{product.quantity} terjual</p>
              </div>
              <span className="text-[10px] font-bold text-[#38BDF8]">{product.quantity}x</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 grid grid-cols-3 gap-2">
        {[
          ['Omzet', omzetToday, CircleDollarSign],
          ['HPP', hppToday, Package],
          ['Biaya', expensesToday, Receipt],
        ].map(([label, value, Icon]: any) => (
          <div key={label} className="rounded-xl border border-[#203244] bg-[#0E1722] p-2.5">
            <Icon className="h-3.5 w-3.5 text-[#71849A]" />
            <p className="mt-2 truncate text-[8px] text-[#71849A]">{label}</p>
            <p className="mt-0.5 truncate text-[10px] font-bold text-white">{formatRupiah(Number(value))}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
