/**
 * Format number to Indonesian Rupiah currency: Rp 25.000
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function formatNumber(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return '0';
  return new Intl.NumberFormat('id-ID').format(value);
}

export function calculateProfit(sellingPrice: number, hpp: number): { profit: number; margin: number } {
  const profit = (sellingPrice || 0) - (hpp || 0);
  const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  return { profit, margin: Math.round(margin * 10) / 10 };
}

export function formatDateTime(isoString: string): string {
  try { return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(isoString)); } catch { return isoString; }
}

export function formatDateOnly(dateStr: string): string {
  try { return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr)); } catch { return dateStr; }
}

export function getTodayDateString(): string { return getDateKey(new Date()); }

export function getDateKey(value?: string | Date | null): string {
  if (!value) return '';
  // Date-only values are already local calendar dates; do not parse them as UTC.
  if (typeof value === 'string' && /^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return value;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

export function generateInvoiceNumber(existingCount: number = 0): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
  const seq = String(existingCount + 1).padStart(3, '0');
  return 'TRX-' + yy + mm + dd + '-' + time + '-' + seq;
}
