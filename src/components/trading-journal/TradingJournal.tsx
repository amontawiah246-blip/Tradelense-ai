import React, { useState, useEffect } from 'react';
import { useJournalStore } from '../../store/useJournalStore';
import { TopStatsBar } from './TopStatsBar';
import { MiniEquityCurve } from './MiniEquityCurve';
import { JournalCalendar } from './JournalCalendar';
import { TradesTable } from './TradesTable';
import { DayTradesModal } from './DayTradesModal';
import { AddTradeModal } from './AddTradeModal';
import { 
  Calendar as CalendarIcon, 
  Table as TableIcon, 
  RefreshCw, 
  Plus, 
  RotateCcw, 
  Database,
  Sparkles,
  ShieldCheck,
  Brain
} from 'lucide-react';

export function TradingJournal() {
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const { 
    fetchTrades, 
    syncWithEngine, 
    resetToSampleData, 
    openAddTradeModal,
    isSyncing,
    syncMessage,
    trades
  } = useJournalStore();

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return (
    <div className="w-full bg-[#080c14] min-h-screen text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-left selection:bg-emerald-500 selection:text-black">
      
      {/* Top Main Navigation & Engine Sync Header */}
      <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Title & Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white uppercase font-sans">
                Professional Trading Journal
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE DB ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Psychology-first quantitative performance tracker & monthly P&L calendar
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* View Mode Switcher */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'calendar' 
                  ? 'bg-slate-800 text-emerald-400 shadow font-black' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-slate-800 text-emerald-400 shadow font-black' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Ledger Table</span>
            </button>
          </div>

          {/* Sync Engine Button */}
          <button
            onClick={syncWithEngine}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Sync closed signals from PostgreSQL/Firestore database engine"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{isSyncing ? 'Auditing & Syncing...' : 'Sync DB Engine'}</span>
          </button>

          {/* Log Trade Button */}
          <button
            onClick={() => openAddTradeModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Trade</span>
          </button>

          {/* Reset sample data */}
          <button
            onClick={resetToSampleData}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Reset to 40+ sample trades dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Stats Bar */}
      <TopStatsBar />

      {/* Mini Equity Curve */}
      <MiniEquityCurve />

      {/* Centerpiece Content: Calendar vs Table View */}
      {viewMode === 'calendar' ? (
        <JournalCalendar />
      ) : (
        <TradesTable />
      )}

      {/* Modals */}
      <DayTradesModal />
      <AddTradeModal />

    </div>
  );
}
