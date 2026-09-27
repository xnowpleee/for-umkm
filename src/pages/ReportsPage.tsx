import React, { useState, useMemo, useRef } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { formatRupiah, formatDateOnly, formatDateTime, getTodayDateString } from '../utils/formatters';
import { StatCard } from '../components/common/StatCard';
import html2canvas from 'html2canvas';
import {
  TrendingUp,
  ArrowDownCircle,
  DollarSign,
  Download,
  Printer,
  Share2,
  Loader2,
  Calendar,
  ShoppingBag,
} from 'lucide-react';

type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export function ReportsPage() {
  const { transactions, expenses, profile, isLoadingData } = useBusiness();
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [isExporting, setIsExporting] = useState(false);
  const reportContainerRef = useRef<HTMLDivElement>(null);

  // Convert date string/ISO to local YYYY-MM-DD
  const toLocalDateString = (dateInput?: string | null): string => {
    if (!dateInput) return '';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) {
        return dateInput.split('T')[0] || '';
      }
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return dateInput.split('T')[0] || '';
    }
  };

  // Convert date string/ISO to local YYYY-MM
  const toLocalMonthString = (dateInput?: string | null): string => {
    if (!dateInput) return '';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) {
        return dateInput.slice(0, 7);
      }
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    } catch {
      return dateInput.slice(0, 7);
    }
  };

  // Filter transactions and expenses based on period
  const reportData = useMemo(() => {
    const now = new Date();
    const todayStr = getTodayDateString();
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now);

    let filteredTxs = transactions;
    let filteredExps = expenses;
    let periodLabel = 'Bulan Ini';

    if (period === 'daily') {
      filteredTxs = transactions.filter(t => toLocalDateString(t.date) === todayStr);
      filteredExps = expenses.filter(e => toLocalDateString(e.date) === todayStr);
      periodLabel = `Hari Ini (${formatDateOnly(todayStr)})`;
    } else if (period === 'weekly') {
      const startOf7DaysAgo = new Date();
      startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 6);
      startOf7DaysAgo.setHours(0, 0, 0, 0);
      const startTimestamp = startOf7DaysAgo.getTime();

      filteredTxs = transactions.filter(t => {
        const time = new Date(t.date || 0).getTime();
        return !isNaN(time) && time >= startTimestamp;
      });
      filteredExps = expenses.filter(e => {
        const time = new Date(e.date || 0).getTime();
        return !isNaN(time) && time >= startTimestamp;
      });
      periodLabel = '7 Hari Terakhir';
    } else {
      filteredTxs = transactions.filter(t => toLocalMonthString(t.date) === thisMonthStr);
      filteredExps = expenses.filter(e => toLocalMonthString(e.date) === thisMonthStr);
      periodLabel = `Bulan Ini (${monthName})`;
    }

    // Totals from real sales and expenses
    const totalOmzet = filteredTxs.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
    const totalHpp = filteredTxs.reduce((sum, t) => {
      const hpp = Number(t.total_hpp || 0);
      if (hpp > 0) return sum + hpp;
      if (Array.isArray(t.items) && t.items.length > 0) {
        return sum + t.items.reduce((isum, it) => isum + Number(it.subtotal_hpp || (it.quantity * it.unit_hpp) || 0), 0);
      }
      return sum;
    }, 0);

    const labaKotor = totalOmzet - totalHpp;
    const totalExpenses = filteredExps.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const labaBersih = labaKotor - totalExpenses;
    const txCount = filteredTxs.length;

    // Produk Terlaris & Paling Menguntungkan
    const productStats: Record<string, { name: string; quantity: number; revenue: number; grossProfit: number }> = {};
    filteredTxs.forEach(tx => {
      if (Array.isArray(tx.items)) {
        tx.items.forEach(item => {
          const pName = (item.product_name || 'Produk').trim();
          if (!productStats[pName]) {
            productStats[pName] = {
              name: pName,
              quantity: 0,
              revenue: 0,
              grossProfit: 0,
            };
          }
          const qty = Number(item.quantity || 1);
          const sub = Number(item.subtotal || (qty * Number(item.unit_price || 0)));
          const hppSub = Number(item.subtotal_hpp || (qty * Number(item.unit_hpp || 0)));
          const itemProfit = sub - hppSub;

          productStats[pName].quantity += qty;
          productStats[pName].revenue += sub;
          productStats[pName].grossProfit += itemProfit;
        });
      }
    });

    const list = Object.values(productStats);
    const produkTerlaris = [...list].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    const produkPalingMenguntungkan = [...list].sort((a, b) => b.grossProfit - a.grossProfit).slice(0, 5);

    return {
      periodLabel,
      totalOmzet,
      totalHpp,
      labaKotor,
      totalExpenses,
      labaBersih,
      txCount,
      produkTerlaris,
      produkPalingMenguntungkan,
    };
  }, [transactions, expenses, period]);

  const handleShareWhatsApp = () => {
    const text =
      `*LAPORAN KEUANGAN ${profile.business_name?.toUpperCase() || 'BISNISKU'}*\n` +
      `Periode: ${reportData.periodLabel}\n` +
      `--------------------------------\n` +
      `• Total Omzet      : ${formatRupiah(reportData.totalOmzet)}\n` +
      `• Total HPP (Modal): ${formatRupiah(reportData.totalHpp)}\n` +
      `• Laba Kotor       : ${formatRupiah(reportData.labaKotor)}\n` +
      `• Beban Biaya      : ${formatRupiah(reportData.totalExpenses)}\n` +
      `--------------------------------\n` +
      `*• Laba Bersih    : ${formatRupiah(reportData.labaBersih)}*\n` +
      `• Jumlah Transaksi : ${reportData.txCount} Transaksi\n` +
      `--------------------------------\n` +
      `Dicatat via BisnisKu`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadReportImage = async () => {
    if (!reportContainerRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportContainerRef.current, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Laporan_${profile.business_name || 'BisnisKu'}_${period}_${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to export report image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="pb-24 md:pb-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7D899B]">Keuangan</p>
          <h1 className="text-xl font-bold tracking-tight text-[#172033]">Laporan</h1>
          <p className="mt-1 text-xs text-[#7D899B]">Ringkasan performa usaha yang mudah dibaca.</p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <div className="flex shrink-0 rounded-lg border border-[#E4E8EE] bg-white p-0.5">
            {([
              ['daily', 'Hari Ini'],
              ['weekly', '7 Hari'],
              ['monthly', 'Bulan Ini'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors ${period === value ? 'bg-[#172E4D] text-white' : 'text-[#7D899B] hover:text-[#172033]'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadReportImage}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#E4E8EE] bg-white px-2.5 text-[11px] font-medium text-[#172033] hover:bg-[#F7F9FC] disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Simpan</span>
          </button>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#172E4D] px-3 text-[11px] font-semibold text-white hover:bg-[#213D61]"
          >
            <Share2 className="h-3.5 w-3.5" />
            Bagikan
          </button>
        </div>
      </div>

      <div ref={reportContainerRef} className="space-y-3">
        <div className="rounded-xl border border-[#E4E8EE] bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7D899B]">Periode laporan</p>
              <p className="mt-0.5 text-sm font-semibold text-[#172033]">{reportData.periodLabel}</p>
            </div>
            <Calendar className="h-4 w-4 shrink-0 text-[#7D899B]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {[
            { label: 'Omzet', value: reportData.totalOmzet, icon: DollarSign, note: `${reportData.txCount} transaksi` },
            { label: 'HPP / Modal', value: reportData.totalHpp, icon: ShoppingBag, note: 'Modal penjualan' },
            { label: 'Pengeluaran', value: reportData.totalExpenses, icon: ArrowDownCircle, note: 'Biaya operasional' },
            { label: 'Laba Bersih', value: reportData.labaBersih, icon: TrendingUp, note: reportData.labaBersih >= 0 ? 'Surplus' : 'Defisit' },
          ].map((item) => {
            const Icon = item.icon;
            const isProfit = item.label === 'Laba Bersih';
            const isNegative = item.value < 0;
            return (
              <div key={item.label} className="min-w-0 rounded-xl border border-[#E4E8EE] bg-white px-3.5 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-[#7D899B]">{item.label}</span>
                  <Icon className="h-3.5 w-3.5 text-[#94A0B1]" />
                </div>
                <div className={`truncate text-[15px] font-bold tracking-tight sm:text-base ${isProfit ? (isNegative ? 'text-[#B85C5C]' : 'text-[#2F8F5B]') : 'text-[#172033]'}`}>
                  {formatRupiah(item.value)}
                </div>
                <p className="mt-1 text-[9px] text-[#9AA5B5]">{item.note}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-xl border border-[#E4E8EE] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#172033]">Laba Rugi</h2>
                <p className="mt-0.5 text-[10px] text-[#7D899B]">Alur uang dari omzet sampai hasil bersih</p>
              </div>
              <TrendingUp className="h-4 w-4 text-[#7D899B]" />
            </div>

            <div className="divide-y divide-[#EDF0F4]">
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-[#7D899B]">Omzet Penjualan</span>
                <span className="font-semibold tabular-nums text-[#172033]">{formatRupiah(reportData.totalOmzet)}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-[#7D899B]">HPP / Modal</span>
                <span className="font-semibold tabular-nums text-[#B85C5C]">-{formatRupiah(reportData.totalHpp)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#F7F9FC] px-3 py-2.5 text-xs">
                <span className="font-semibold text-[#172033]">Laba Kotor</span>
                <span className="font-bold tabular-nums text-[#172E4D]">{formatRupiah(reportData.labaKotor)}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-[#7D899B]">Pengeluaran Operasional</span>
                <span className="font-semibold tabular-nums text-[#B85C5C]">-{formatRupiah(reportData.totalExpenses)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-[#E4E8EE] pt-3">
                <div>
                  <p className="text-xs font-bold text-[#172033]">Laba Bersih</p>
                  <p className="mt-0.5 text-[9px] text-[#9AA5B5]">Setelah HPP dan pengeluaran</p>
                </div>
                <span className={`text-sm font-bold tabular-nums ${reportData.labaBersih >= 0 ? 'text-[#2F8F5B]' : 'text-[#B85C5C]'}`}>
                  {formatRupiah(reportData.labaBersih)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#E4E8EE] bg-white p-4">
            <div className="mb-3">
              <h2 className="text-sm font-bold text-[#172033]">Ringkasan</h2>
              <p className="mt-0.5 text-[10px] text-[#7D899B]">Angka utama periode ini</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-[#F7F9FC] px-3 py-2.5">
                <span className="text-[11px] text-[#7D899B]">Transaksi</span>
                <span className="text-xs font-bold text-[#172033]">{reportData.txCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#F7F9FC] px-3 py-2.5">
                <span className="text-[11px] text-[#7D899B]">Laba Kotor</span>
                <span className="text-xs font-bold text-[#172033]">{formatRupiah(reportData.labaKotor)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#F7F9FC] px-3 py-2.5">
                <span className="text-[11px] text-[#7D899B]">Pengeluaran</span>
                <span className="text-xs font-bold text-[#B85C5C]">{formatRupiah(reportData.totalExpenses)}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {[
            { title: 'Produk Terlaris', desc: 'Berdasarkan jumlah terjual', data: reportData.produkTerlaris, value: (p: any) => `${p.quantity} porsi`, extra: (p: any) => formatRupiah(p.revenue), positive: false },
            { title: 'Paling Menguntungkan', desc: 'Berdasarkan laba kotor', data: reportData.produkPalingMenguntungkan, value: (p: any) => `+${formatRupiah(p.grossProfit)}`, extra: () => '', positive: true },
          ].map((section) => (
            <section key={section.title} className="rounded-xl border border-[#E4E8EE] bg-white p-4">
              <div className="mb-3">
                <h2 className="text-sm font-bold text-[#172033]">{section.title}</h2>
                <p className="mt-0.5 text-[10px] text-[#7D899B]">{section.desc}</p>
              </div>
              {section.data.length === 0 ? (
                <p className="py-5 text-center text-[11px] text-[#9AA5B5]">Belum ada data penjualan pada periode ini.</p>
              ) : (
                <div className="divide-y divide-[#EDF0F4]">
                  {section.data.map((p: any, idx: number) => (
                    <div key={p.name} className="flex items-center gap-3 py-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#F1F4F8] text-[9px] font-bold text-[#7D899B]">{idx + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#172033]">{p.name}</span>
                      <div className="shrink-0 text-right">
                        <p className={`text-[11px] font-bold tabular-nums ${section.positive ? 'text-[#2F8F5B]' : 'text-[#172033]'}`}>{section.value(p)}</p>
                        {section.extra(p) && <p className="text-[9px] text-[#9AA5B5]">{section.extra(p)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );

}
