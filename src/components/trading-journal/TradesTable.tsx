import React, { useState } from 'react';
import { useJournalStore } from '../../store/useJournalStore';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Edit3, 
  Trash2, 
  Download, 
  Plus, 
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Sparkles
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { EmotionType, JournalTrade } from '../../types/journal';

export function TradesTable() {
  const {
    getFilteredTrades,
    setEditingTrade,
    deleteTrade,
    openAddTradeModal,
    exportCsv,
    searchQuery,
    setSearchQuery,
    filterEmotion,
    setFilterEmotion,
    filterOutcome,
    setFilterOutcome
  } = useJournalStore();

  const [sortField, setSortField] = useState<'date' | 'pnl' | 'symbol'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const trades = getFilteredTrades();

  const sortedTrades = [...trades].sort((a, b) => {
    if (sortField === 'date') {
      const timeA = new Date(a.entryDate).getTime();
      const timeB = new Date(b.entryDate).getTime();
      return sortAsc ? timeA - timeB : timeB - timeA;
    }
    if (sortField === 'pnl') {
      return sortAsc ? a.pnl - b.pnl : b.pnl - a.pnl;
    }
    if (sortField === 'symbol') {
      return sortAsc ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol);
    }
    return 0;
  });

  const toggleSort = (field: 'date' | 'pnl' | 'symbol') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getEmotionBadgeClass = (emotion: EmotionType) => {
    switch (emotion) {
      case 'Discipline': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Confidence': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Patience': return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      case 'Flow': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'FOMO': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Revenge': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Fear': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Greed': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Hesitation': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="w-full bg-[#0e1422] border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden text-left">
      {/* Table Top Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0b0f19]">
        <div>
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            Historical Trade Ledger
            <span className="text-[10px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
              {trades.length} entries
            </span>
          </h4>
          <p className="text-[11px] text-slate-400">Detailed line-item execution traces and psychological markers</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => openAddTradeModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Trade</span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto custom-scrollbar">
        {sortedTrades.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-slate-700" />
            <p className="text-xs font-bold uppercase tracking-wider">No trades found matching active filters</p>
            <p className="text-xs text-slate-400">Try adjusting your emotion filter, search query, or date range.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0b0f19] text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800 select-none text-[10px]">
                <th 
                  onClick={() => toggleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Date / Time</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('symbol')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Instrument</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Direction</th>
                <th className="py-3 px-4">Entry / Exit</th>
                <th 
                  onClick={() => toggleSort('pnl')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Net P&L ($)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">R-Multiple</th>
                <th className="py-3 px-4 text-center">Outcome</th>
                <th className="py-3 px-4">Psychology / Emotion</th>
                <th className="py-3 px-4">Setup / Notes</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {sortedTrades.map((t) => {
                const isLong = t.direction === 'LONG';
                const isWin = t.status === 'WIN';
                const isLoss = t.status === 'LOSS';
                const tradeDate = parseISO(t.entryDate);

                return (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">
                      <div>{format(tradeDate, 'MMM d, yyyy')}</div>
                      <div className="text-[10px] text-slate-500">{format(tradeDate, 'HH:mm')} UTC</div>
                    </td>

                    {/* Symbol */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-100 font-mono text-sm">{t.symbol}</span>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">
                        {t.source === 'quant_engine' ? '⚡ Engine' : 'Manual'}
                      </span>
                    </td>

                    {/* Direction */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        isLong 
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}>
                        {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {t.direction}
                      </span>
                    </td>

                    {/* Entry / Exit */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">
                      <div><span className="text-slate-500 text-[10px]">In:</span> {t.entryPrice}</div>
                      <div><span className="text-slate-500 text-[10px]">Out:</span> {t.exitPrice ?? '—'}</div>
                    </td>

                    {/* PnL */}
                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono">
                      <span className={`text-sm font-black ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                      </span>
                    </td>

                    {/* R Multiple */}
                    <td className="py-3 px-4 text-center whitespace-nowrap font-mono">
                      <span className={`text-xs font-bold ${t.pnlR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.pnlR >= 0 ? '+' : ''}{t.pnlR.toFixed(2)}R
                      </span>
                    </td>

                    {/* Outcome */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        isWin ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                        isLoss ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>

                    {/* Emotion Tag */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEmotionBadgeClass(t.emotion)}`}>
                        <Brain className="w-3 h-3" />
                        {t.emotion}
                      </span>
                    </td>

                    {/* Setup / Notes */}
                    <td className="py-3 px-4 max-w-[200px]">
                      {t.setup && (
                        <div className="font-semibold text-slate-200 text-[11px] truncate" title={t.setup}>
                          {t.setup}
                        </div>
                      )}
                      {t.notes && (
                        <div className="text-slate-400 text-[10px] truncate" title={t.notes}>
                          {t.notes}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingTrade(t)}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors cursor-pointer"
                          title="Edit trade"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this trade?')) {
                              deleteTrade(t.id);
                            }
                          }}
                          className="p-1 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                          title="Delete trade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
