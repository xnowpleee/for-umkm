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

  const toLocalDateString = (dateInput?: string | null): string => {
    if (!dateInput) return '';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return dateInput.split('T')[0] || '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return dateInput.split('T')[0] || '';
    }
  };

  const toLocalMonthString = (dateInput?: string | null): string => {
    if (!dateInput) return '';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return dateInput.slice(0, 7);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    } catch {
      return dateInput.slice(0, 7);
    }
  };

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
      filteredTxs = transactions.filter(t => { const time = new Date(t.date || 0).getTime(); return !isNaN(time) && time >= startTimestamp; });
      filteredExps = expenses.filter(e => { const time = new Date(e.date || 0).getTime(); return !isNaN(time) && time >= startTimestamp; });
      periodLabel = '7 Hari Terakhir';
    } else {
      filteredTxs = transactions.filter(t => toLocalMonthString(t.date) === thisMonthStr);
      filteredExps = expenses.filter(e => toLocalMonthString(e.date) === thisMonthStr);
      periodLabel = `Bulan Ini (${monthName})`;
    }

    const totalOmzet = filteredTxs.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
    const totalHpp = filteredTxs.reduce((sum, t) => {
      const hpp = Number(t.total_hpp || 0);
      if (hpp > 0) return sum + hpp;
      if (Array.isArray(t.items) && t.items.length > 0) return sum + t.items.reduce((isum, it) => isum + Number(it.subtotal_hpp || (it.quantity * it.unit_hpp) || 0), 0);
      return sum;
    }, 0);
    const labaKotor = totalOmzet - totalHpp;
    const totalExpenses = filteredExps.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const labaBersih = labaKotor - totalExpenses;
    const txCount = filteredTxs.length;

    const productStats: Record<string, { name: string; quantity: number; revenue: number; grossProfit: number }> = {};
    filteredTxs.forEach(tx => {
      if (Array.isArray(tx.items)) tx.items.forEach(item => {
        const pName = (item.product_name || 'Produk').trim();
        if (!productStats[pName]) productStats[pName] = { name: pName, quantity: 0, revenue: 0, grossProfit: 0 };
        const qty = Number(item.quantity || 1);
        const sub = Number(item.subtotal || (qty * Number(item.unit_price || 0)));
        const hppSub = Number(item.subtotal_hpp || (qty * Number(item.unit_hpp || 0)));
        productStats[pName].quantity += qty;
        productStats[pName].revenue += sub;
        productStats[pName].grossProfit += sub - hppSub;
      });
    });
    const list = Object.values(productStats);
    const produkTerlaris = [...list].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    const produkPalingMenguntungkan = [...list].sort((a, b) => b.grossProfit - a.grossProfit).slice(0, 5);
    return { periodLabel, totalOmzet, totalHpp, labaKotor, totalExpenses, labaBersih, txCount, produkTerlaris, produkPalingMenguntungkan };
  }, [transactions, expenses, period]);

  const analysisTrend = useMemo(() => {
    const days = period === 'daily' ? 7 : period === 'weekly' ? 7 : 30;
    const now = new Date();
    return Array.from({ length: days }, (_, index) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (days - 1 - index));
      const key = toLocalDateString(d.toISOString());
      const omzet = transactions.filter(t => toLocalDateString(t.date) === key).reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
      return { key, label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }), omzet };
    });
  }, [transactions, period]);

  const analysisMax = Math.max(...analysisTrend.map(d => d.omzet), 1);
  const analysisScaleMax = analysisMax * 1.15;
  const analysisPoints = analysisTrend.map((d, i) => ({ ...d, x: analysisTrend.length === 1 ? 50 : (i / (analysisTrend.length - 1)) * 100, y: 92 - (d.omzet / analysisScaleMax) * 68 }));
  const analysisLine = analysisPoints.map(p => p.x + ',' + p.y).join(' ');

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
      const canvas = await html2canvas(reportContainerRef.current, { scale: 2, backgroundColor: '#111827', logging: false, useCORS: true });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Gagal membuat file laporan.');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan_${profile.business_name || 'BisnisKu'}_${period}_${Date.now()}.png`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Failed to export report image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bk-terminal-page bk-grid-page pb-24 md:pb-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">Keuangan</p>
          <h1 className="text-xl font-bold tracking-tight text-[#E5E7EB]">Laporan</h1>
          <p className="mt-1 text-xs text-[#94A3B8]">Ringkasan performa usaha yang mudah dibaca.</p>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <div className="flex shrink-0 rounded-lg border border-[#263744] bg-[#111827] p-0.5">
            {([['daily', 'Hari Ini'], ['weekly', '7 Hari'], ['monthly', 'Bulan Ini']] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setPeriod(value)} className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors ${period === value ? 'bg-[#0EA5E9] text-white' : 'text-[#94A3B8] hover:text-[#E5E7EB]'}`}>{label}</button>
            ))}
          </div>
          <button type="button" aria-label="Simpan laporan" title="Simpan laporan" disabled={isExporting} onClick={handleDownloadReportImage} className="flex h-9 min-w-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#263744] bg-[#111827] px-2.5 text-[11px] font-medium text-[#E5E7EB] hover:bg-[#17212B] disabled:opacity-50">
            {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}<span className="hidden sm:inline">Simpan</span>
          </button>
          <button type="button" onClick={handleShareWhatsApp} className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#0EA5E9] px-3 text-[11px] font-semibold text-white hover:bg-[#0284C7]"><Share2 className="h-3.5 w-3.5" />Bagikan</button>
        </div>
      </div>

      <div ref={reportContainerRef} className="space-y-4">
        <div className="bk-grid-panel px-4 py-3">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">Periode laporan</p><p className="mt-0.5 text-sm font-semibold text-[#E5E7EB]">{reportData.periodLabel}</p></div><Calendar className="h-4 w-4 shrink-0 text-[#94A3B8]" /></div>
        </div>

        <section className="px-0 py-3.5 lg:pr-5">
          <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-[#E5E7EB]">Analisis Omzet</h2><p className="mt-0.5 text-[10px] text-[#94A3B8]">Pergerakan omzet dari transaksi yang tercatat.</p></div><span className="text-[9px] uppercase tracking-[0.12em] text-[#526579]">{period === 'monthly' ? '30 hari' : '7 hari'}</span></div>
          <div className="bk-soft-grid h-[92px] w-full overflow-hidden rounded-xl border border-[#1B2934]"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible"><g className="bk-chart-grid">{[24,48,72].map(y => <line key={y} x1="0" x2="100" y1={y} y2={y} />)}</g><polyline points={analysisLine} fill="none" stroke="#38B8D8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />{analysisPoints.map((p, i) => <circle key={p.key} cx={p.x} cy={p.y} r={i === analysisPoints.length - 1 ? 2 : 1.2} fill="#0D151D" stroke="#38B8D8" strokeWidth=".7" vectorEffect="non-scaling-stroke"><title>{p.label}: {formatRupiah(p.omzet)}</title></circle>)}</svg></div>
          <div className="mt-1.5 flex justify-between gap-2 px-1 text-[8px] text-[#526579]">{analysisPoints.filter((_, i) => i === 0 || i === analysisPoints.length - 1 || i % (analysisPoints.length > 14 ? 5 : 1) === 0).map(p => <span key={p.key}>{p.label}</span>)}</div>
        </section>

        <div className="bk-grid-section flex flex-wrap rounded-xl">
          {[{ label: 'Omzet', value: reportData.totalOmzet, icon: DollarSign, note: `${reportData.txCount} transaksi` }, { label: 'HPP / Modal', value: reportData.totalHpp, icon: ShoppingBag, note: 'Modal penjualan' }, { label: 'Pengeluaran', value: reportData.totalExpenses, icon: ArrowDownCircle, note: 'Biaya operasional' }, { label: 'Laba Bersih', value: reportData.labaBersih, icon: TrendingUp, note: reportData.labaBersih >= 0 ? 'Surplus' : 'Defisit' }].map((item) => {
            const Icon = item.icon; const isProfit = item.label === 'Laba Bersih'; const isNegative = item.value < 0;
            return <div key={item.label} className="min-w-0 w-1/2 border-b border-[#22303D] px-3.5 py-3.5 first:pl-0 sm:w-1/4 sm:border-b-0 sm:border-r last:border-r-0"><div className="mb-2 flex items-center justify-between gap-2"><span className="text-[10px] font-medium text-[#94A3B8]">{item.label}</span><Icon className="h-3.5 w-3.5 shrink-0 text-[#94A0B1]" /></div><div className={`truncate text-[15px] font-bold tracking-tight sm:text-base ${isProfit ? (isNegative ? 'text-[#B85C5C]' : 'text-[#2F8F5B]') : 'text-[#E5E7EB]'}`}>{formatRupiah(item.value)}</div><p className="mt-1 text-[9px] text-[#9AA5B5]">{item.note}</p></div>;
          })}
        </div>

        <div className="bk-grid-section rounded-xl p-3.5 sm:p-4 lg:grid lg:grid-cols-2 lg:divide-x lg:divide-[#22303D]">
          <section className="min-w-0 lg:pr-6">
            <div className="mb-4 flex items-start justify-between gap-4"><div className="min-w-0"><h2 className="text-sm font-bold text-[#E5E7EB]">Laba Rugi</h2><p className="mt-1 text-[10px] leading-relaxed text-[#94A3B8]">Alur uang dari omzet sampai hasil bersih</p></div><TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" /></div>
            <div className="space-y-0.5">
              <div className="flex min-h-9 items-center justify-between gap-4 rounded-lg px-2.5 py-2 text-xs hover:bg-[#0D151D]"><span className="min-w-0 text-[#94A3B8]">Omzet Penjualan</span><span className="shrink-0 font-semibold tabular-nums text-[#E5E7EB]">{formatRupiah(reportData.totalOmzet)}</span></div>
              <div className="flex min-h-9 items-center justify-between gap-4 rounded-lg px-2.5 py-2 text-xs hover:bg-[#0D151D]"><span className="min-w-0 text-[#94A3B8]">HPP / Modal</span><span className="shrink-0 font-semibold tabular-nums text-[#B85C5C]">-{formatRupiah(reportData.totalHpp)}</span></div>
              <div className="flex min-h-9 items-center justify-between gap-4 rounded-lg border-t border-[#22303D] px-2.5 py-2.5 text-xs"><span className="min-w-0 font-semibold text-[#E5E7EB]">Laba Kotor</span><span className="shrink-0 font-bold tabular-nums text-[#0EA5E9]">{formatRupiah(reportData.labaKotor)}</span></div>
              <div className="flex min-h-9 items-center justify-between gap-4 rounded-lg px-2.5 py-2 text-xs hover:bg-[#0D151D]"><span className="min-w-0 text-[#94A3B8]">Pengeluaran Operasional</span><span className="shrink-0 font-semibold tabular-nums text-[#B85C5C]">-{formatRupiah(reportData.totalExpenses)}</span></div>
              <div className="mt-2 flex items-center justify-between gap-4 rounded-lg border-t border-[#263744] bg-[#0D151D]/70 px-2.5 py-3"><div className="min-w-0"><p className="text-xs font-bold text-[#E5E7EB]">Laba Bersih</p><p className="mt-0.5 text-[9px] leading-relaxed text-[#9AA5B5]">Setelah HPP dan pengeluaran</p></div><span className={`shrink-0 text-sm font-bold tabular-nums ${reportData.labaBersih >= 0 ? 'text-[#2F8F5B]' : 'text-[#B85C5C]'}`}>{formatRupiah(reportData.labaBersih)}</span></div>
            </div>
          </section>

          <section className="mt-5 border-t border-[#22303D] pt-4 lg:mt-0 lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="mb-4"><h2 className="text-sm font-bold text-[#E5E7EB]">Ringkasan</h2><p className="mt-1 text-[10px] text-[#94A3B8]">Angka utama periode ini</p></div>
            <div className="space-y-0.5">
              <div className="flex min-h-9 items-center justify-between gap-4 rounded-lg px-2.5 py-2"><span className="text-[11px] text-[#94A3B8]">Transaksi</span><span className="shrink-0 text-xs font-bold tabular-nums text-[#E5E7EB]">{reportData.txCount}</span></div>
              <div className="flex min-h-9 items-center justify-between gap-4 rounded-lg px-2.5 py-2"><span className="text-[11px] text-[#94A3B8]">Laba Kotor</span><span className="shrink-0 text-xs font-bold tabular-nums text-[#E5E7EB]">{formatRupiah(reportData.labaKotor)}</span></div>
              <div className="flex min-h-9 items-center justify-between gap-4 rounded-lg px-2.5 py-2"><span className="text-[11px] text-[#94A3B8]">Pengeluaran</span><span className="shrink-0 text-xs font-bold tabular-nums text-[#B85C5C]">{formatRupiah(reportData.totalExpenses)}</span></div>
            </div>
          </section>
        </div>

        <div className="bk-grid-section rounded-xl p-3.5 sm:p-4">
          {[{ title: 'Produk Terlaris', desc: 'Berdasarkan jumlah terjual', data: reportData.produkTerlaris, value: (p: any) => `${p.quantity} porsi`, extra: (p: any) => formatRupiah(p.revenue), positive: false }, { title: 'Paling Menguntungkan', desc: 'Berdasarkan laba kotor', data: reportData.produkPalingMenguntungkan, value: (p: any) => `+${formatRupiah(p.grossProfit)}`, extra: () => '', positive: true }].map((section) => (
            <section key={section.title} className="border-b border-[#22303D] py-4 last:border-b-0 sm:py-4.5">
              <div className="mb-3.5"><h2 className="text-sm font-bold text-[#E5E7EB]">{section.title}</h2><p className="mt-1 text-[10px] text-[#94A3B8]">{section.desc}</p></div>
              {section.data.length === 0 ? <p className="py-5 text-center text-[11px] text-[#9AA5B5]">Belum ada data penjualan pada periode ini.</p> : <div className="space-y-0.5">
                {section.data.map((p: any, idx: number) => <div key={p.name} className="flex min-h-10 items-center gap-3 rounded-lg px-2.5 py-2.5 hover:bg-[#0D151D]">
                  <span className="w-6 shrink-0 text-center text-[9px] font-bold text-[#526579] tabular-nums">{String(idx + 1).padStart(2,'0')}</span>
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#E5E7EB]">{p.name}</span>
                  <div className="shrink-0 min-w-[76px] text-right"><p className={`text-[11px] font-bold tabular-nums ${section.positive ? 'text-[#2F8F5B]' : 'text-[#E5E7EB]'}`}>{section.value(p)}</p>{section.extra(p) && <p className="mt-0.5 text-[9px] text-[#9AA5B5]">{section.extra(p)}</p>}</div>
                </div>)}
              </div>}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
