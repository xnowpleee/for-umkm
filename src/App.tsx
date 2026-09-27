import React, { useState } from 'react';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ReportsPage } from './pages/ReportsPage';
import { ChatPage } from './pages/ChatPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPages } from './pages/AuthPages';
import { Modal } from './components/common/Modal';
import { getTodayDateString } from './utils/formatters';
import { ExpenseCategory } from './types';
import { Loader2 } from 'lucide-react';

function MainApp() {
  const { user, addExpense } = useBusiness();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState<number | ''>('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Bahan');
  const [expNotes, setExpNotes] = useState('');
  const [isSavingExp, setIsSavingExp] = useState(false);

  const handleQuickExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expName || !expAmount || isSavingExp) return;
    setIsSavingExp(true);
    try {
      await addExpense({ name: expName.trim(), amount: Number(expAmount), category: expCategory, date: getTodayDateString(), notes: expNotes.trim() || undefined });
      setExpName(''); setExpAmount(''); setExpNotes(''); setIsQuickExpenseOpen(false);
    } finally { setIsSavingExp(false); }
  };

  return <div className="min-h-screen bg-[#080F14] text-[#E5E7EB] flex flex-col selection:bg-[#123A4D] selection:text-[#E5E7EB]">
    <Navbar activeTab={activeTab} onTabChange={tab => user.isAuthenticated && setActiveTab(tab)} onOpenQuickTxModal={user.isAuthenticated ? () => setActiveTab('transactions') : undefined} onOpenQuickExpenseModal={user.isAuthenticated ? () => setIsQuickExpenseOpen(true) : undefined} onOpenAuthModal={() => {}} />
    <div className="flex-1 flex max-w-[1400px] w-full mx-auto">
      {!user.isAuthenticated ? <main className="flex-1 p-3 sm:p-5 lg:p-6 flex items-center justify-center min-h-[calc(100vh-60px)]"><AuthPages onSuccess={() => setActiveTab('dashboard')} /></main> : <>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className={'flex-1 p-3 sm:p-5 lg:p-6 max-w-full min-w-0 pb-24 md:pb-6 ' + (activeTab === 'chat' ? 'overflow-hidden p-0 sm:p-4 lg:p-6 h-[calc(100dvh-48px)] md:h-auto' : 'overflow-x-hidden')}>
          {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} onOpenQuickTx={() => setActiveTab('transactions')} onOpenQuickExpense={() => setIsQuickExpenseOpen(true)} />}
          {activeTab === 'products' && <ProductsPage />}
          {activeTab === 'transactions' && <TransactionsPage />}
          {activeTab === 'expenses' && <ExpensesPage />}
          {activeTab === 'reports' && <ReportsPage />}
          <div className={activeTab === 'chat' ? 'block h-full min-h-0' : 'hidden'}><ChatPage /></div>
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </>}
    </div>
    {user.isAuthenticated && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    {user.isAuthenticated && <Modal isOpen={isQuickExpenseOpen} onClose={() => !isSavingExp && setIsQuickExpenseOpen(false)} title="Catat Pengeluaran Cepat" subtitle="Biaya operasional atau pembelian bahan hari ini" maxWidth="md">
      <form onSubmit={handleQuickExpenseSubmit} className="space-y-4">
        <div><label className="block text-xs font-medium text-[#64748B] mb-1">Nama Pengeluaran *</label><input type="text" required placeholder="Contoh: Beli Es Kristal, Bensin, Plastik Cup" value={expName} onChange={e => setExpName(e.target.value)} className="w-full px-3 py-2 text-xs bg-white border border-[#DCE2EA] rounded-lg text-[#172033] placeholder-[#9AA6B7] focus:outline-hidden focus:border-[#304C70]" /></div>
        <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium text-[#64748B] mb-1">Jumlah Biaya (Rp) *</label><input type="number" required min="0" placeholder="0" value={expAmount} onChange={e => setExpAmount(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 text-xs bg-white border border-[#DCE2EA] rounded-lg text-[#172033] placeholder-[#9AA6B7] tabular-nums focus:outline-hidden focus:border-[#304C70]" /></div><div><label className="block text-xs font-medium text-[#64748B] mb-1">Kategori Biaya</label><select value={expCategory} onChange={e => setExpCategory(e.target.value as ExpenseCategory)} className="w-full px-3 py-2 text-xs bg-white border border-[#DCE2EA] rounded-lg text-[#172033] focus:outline-hidden focus:border-[#304C70]"><option value="Bahan">Bahan</option><option value="Operasional">Operasional</option><option value="Transport">Transport</option><option value="Promosi">Promosi</option><option value="Lainnya">Lainnya</option></select></div></div>
        <div><label className="block text-xs font-medium text-[#64748B] mb-1">Catatan (Opsional)</label><input type="text" placeholder="Keterangan tambahan..." value={expNotes} onChange={e => setExpNotes(e.target.value)} className="w-full px-3 py-2 text-xs bg-white border border-[#DCE2EA] rounded-lg text-[#172033] placeholder-[#9AA6B7] focus:outline-hidden focus:border-[#304C70]" /></div>
        <div className="pt-3 border-t border-[#E3E7ED] flex items-center justify-end gap-2"><button type="button" disabled={isSavingExp} onClick={() => setIsQuickExpenseOpen(false)} className="px-4 py-2 text-xs font-medium text-[#64748B] bg-[#F5F7FA] border border-[#DCE2EA] rounded-lg">Batal</button><button type="submit" disabled={isSavingExp} className="px-4 py-2 text-xs font-semibold text-white bg-[#172E4D] hover:bg-[#213D61] disabled:opacity-50 rounded-lg flex items-center gap-2">{isSavingExp ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Menyimpan...</span></> : <span>Simpan Pengeluaran</span>}</button></div>
      </form>
    </Modal>}
  </div>;
}

export default function App() { return <BusinessProvider><MainApp /></BusinessProvider>; }
