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
    <div className="space-y-2.5 pb-24 md:pb-8">
      {/* Header and Period Filter */}
      <div className="flex flex-col gap-2 pt-0.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base sm:text-2xl font-bold tracking-tight text-[#172033]">
            Laporan
          </h1>
          <p className="text-[9px] text-[#7D899B] mt-0.5">
            Rekap omzet, HPP, laba bersih, dan pengeluaran {profile.business_name || 'usaha'}.
          </p>
        </div>

        <div className="flex max-w-full items-center gap-1.5 overflow-x-auto select-none scrollbar-none">
          {/* Period Selector Tabs */}
          <div className="shrink-0 p-0.5 bg-[#FFFFFF] border border-[#E4E8EE] rounded-lg flex items-center">
            <button
              type="button"
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === 'daily'
                  ? 'bg-[#E4E8EE] text-[#172033]'
                  : 'text-[#7D899B] hover:text-[#172033]'
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === 'weekly'
                  ? 'bg-[#E4E8EE] text-[#172033]'
                  : 'text-[#7D899B] hover:text-[#172033]'
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === 'monthly'
                  ? 'bg-[#E4E8EE] text-[#172033]'
                  : 'text-[#7D899B] hover:text-[#172033]'
              }`}
            >
              Bulan Ini
            </button>
          </div>

          {/* Share / Image Export Buttons */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadReportImage}
            className="flex shrink-0 items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium text-[#172033] bg-[#FFFFFF] hover:bg-[#F1F4F8] border border-[#E4E8EE] rounded-lg transition-colors disabled:opacity-50"
            title="Simpan Laporan sebagai Gambar"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#172E4D]" />
            ) : (
              <Download className="w-3.5 h-3.5 text-[#172E4D]" />
            )}
            <span className="hidden sm:inline">Simpan Gambar</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex shrink-0 items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold text-[#FFFFFF] bg-[#172E4D] hover:bg-[#213D61] rounded-lg transition-colors active:scale-[0.98]"
            title="Bagikan Ringkasan ke WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Bagikan</span>
          </button>
        </div>
      </div>

      {/* Main Report Content (Exportable Container) */}
      <div ref={reportContainerRef} className="space-y-2.5">
        {/* Core Financial KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <StatCard
            title="Total Omzet"
            value={formatRupiah(reportData.totalOmzet)}
            subtitle={`${reportData.txCount} transaksi berhasil`}
            icon={<DollarSign className="w-4 h-4 text-[#7D899B]" />}
          />

          <StatCard
            title="Total HPP (Modal)"
            value={formatRupiah(reportData.totalHpp)}
            subtitle="Modal bahan & produksi"
            icon={<ShoppingBag className="w-4 h-4 text-[#7D899B]" />}
          />

          <StatCard
            title="Total Pengeluaran"
            value={formatRupiah(reportData.totalExpenses)}
            subtitle="Beban operasional & lain"
            icon={<ArrowDownCircle className="w-4 h-4 text-[#7D899B]" />}
          />

          <StatCard
            title="Laba Bersih"
            value={formatRupiah(reportData.labaBersih)}
            subtitle="Omzet - HPP - Pengeluaran"
            icon={<TrendingUp className="w-4 h-4 text-[#7D899B]" />}
            trend={{
              value: reportData.labaBersih >= 0 ? 'Surplus' : 'Defisit',
              isPositive: reportData.labaBersih >= 0,
              label: 'Hasil Bersih',
            }}
          />
        </div>

        {/* Laba Rugi Operasional */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-[#FFFFFF] border border-[#E4E8EE]">
          <h3 className="text-sm font-semibold text-[#172033] mb-2.5">
            Ringkasan Laba Rugi ({reportData.periodLabel})
          </h3>

          <div className="space-y-2 text-xs divide-y divide-[#E4E8EE]">
            <div className="flex justify-between py-2">
              <span className="text-[#7D899B]">1. Pendapatan Penjualan (Omzet)</span>
              <span className="font-semibold text-[#172033] tabular-nums">{formatRupiah(reportData.totalOmzet)}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-[#7D899B]">2. Beban Pokok Penjualan (HPP Modal)</span>
              <span className="font-semibold text-red-400 tabular-nums">-{formatRupiah(reportData.totalHpp)}</span>
            </div>

            <div className="flex justify-between py-2 bg-[#F7F9FC] px-3 rounded-lg">
              <span className="font-semibold text-[#172033]">Laba Kotor (Omzet - HPP)</span>
              <span className="font-semibold text-[#172E4D] tabular-nums">{formatRupiah(reportData.labaKotor)}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-[#7D899B]">3. Beban Pengeluaran Operasional</span>
              <span className="font-semibold text-red-400 tabular-nums">-{formatRupiah(reportData.totalExpenses)}</span>
            </div>

            <div className="flex justify-between py-2.5 bg-[#F7F9FC] px-3 rounded-lg border border-[#E4E8EE]">
              <div>
                <span className="font-bold text-sm text-[#172033]">Laba Bersih Usaha</span>
                <p className="text-[10px] text-[#7D899B]">Hasil akhir setelah dikurangi seluruh biaya</p>
              </div>
              <span className={`text-base font-bold tabular-nums ${reportData.labaBersih >= 0 ? 'text-[#172E4D]' : 'text-red-400'}`}>
                {formatRupiah(reportData.labaBersih)}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column: Top Products by Revenue & Profitability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Produk Terlaris */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#FFFFFF] border border-[#E4E8EE]">
            <h3 className="text-sm font-semibold text-[#172033] mb-3">
              Menu Paling Laku (Kuantitas Terjual)
            </h3>
            {reportData.produkTerlaris.length === 0 ? (
              <p className="text-xs text-[#7D899B] py-4 text-center">Belum ada data penjualan pada periode ini.</p>
            ) : (
              <div className="space-y-2.5">
                {reportData.produkTerlaris.map((p, idx) => (
                  <div key={p.name} className="flex items-center justify-between text-xs py-1 border-b border-[#E4E8EE] last:border-none">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-4 text-center font-semibold text-[#7D899B] tabular-nums">{idx + 1}</span>
                      <span className="font-medium text-[#172033] truncate">{p.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-semibold text-[#172033] tabular-nums">{p.quantity} porsi</span>
                      <span className="text-[10px] text-[#7D899B] ml-2 tabular-nums">({formatRupiah(p.revenue)})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Produk Paling Menguntungkan */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#FFFFFF] border border-[#E4E8EE]">
            <h3 className="text-sm font-semibold text-[#172033] mb-3">
              Menu Paling Menguntungkan (Laba Kotor)
            </h3>
            {reportData.produkPalingMenguntungkan.length === 0 ? (
              <p className="text-xs text-[#7D899B] py-4 text-center">Belum ada data penjualan pada periode ini.</p>
            ) : (
              <div className="space-y-2.5">
                {reportData.produkPalingMenguntungkan.map((p, idx) => (
                  <div key={p.name} className="flex items-center justify-between text-xs py-1 border-b border-[#E4E8EE] last:border-none">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-4 text-center font-semibold text-[#7D899B] tabular-nums">{idx + 1}</span>
                      <span className="font-medium text-[#172033] truncate">{p.name}</span>
                    </div>
                    <span className="font-semibold text-[#172E4D] shrink-0 tabular-nums">
                      +{formatRupiah(p.grossProfit)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
