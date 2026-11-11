import React from 'react';
import { useJournalStore } from '../../store/useJournalStore';
import { format, parseISO } from 'date-fns';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Clock, 
  Calendar as CalendarIcon,
  Tag,
  FileText
} from 'lucide-react';
import { EmotionType, JournalTrade } from '../../types/journal';

export function DayTradesModal() {
  const {
    isDayModalOpen,
    selectedDaySummary,
    closeDayModal,
    openAddTradeModal,
    setEditingTrade,
    deleteTrade
  } = useJournalStore();

  if (!isDayModalOpen || !selectedDaySummary) return null;

  const dayDate = parseISO(selectedDaySummary.date);
  const formattedHeaderDate = format(dayDate, 'EEEE, MMMM d, yyyy');
  const isNetPositive = selectedDaySummary.netPnl >= 0;

  const getEmotionBadgeClass = (emotion: EmotionType) => {
    switch (emotion) {
      case 'Discipline':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Confidence':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Patience':
        return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
      case 'Flow':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'FOMO':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Revenge':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Fear':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Greed':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'Hesitation':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#0b0f19] border border-slate-800 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-[#0e1422]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{formattedHeaderDate}</h3>
              <p className="text-xs text-slate-400">Detailed trade ledger breakdown for this day</p>
            </div>
          </div>

          <button
            onClick={closeDayModal}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Day Stats Banner */}
        <div className="px-5 py-3.5 bg-[#090d16] border-b border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-semibold tracking-wider block">Day Net P&L</span>
            <span className={`text-base font-mono font-black ${isNetPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isNetPositive ? '+' : ''}${selectedDaySummary.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-slate-500 uppercase text-[10px] font-semibold tracking-wider block">Trades Count</span>
            <span className="text-base font-mono font-bold text-slate-200">
              {selectedDaySummary.tradesCount} {selectedDaySummary.tradesCount === 1 ? 'Trade' : 'Trades'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 uppercase text-[10px] font-semibold tracking-wider block">Win Rate</span>
            <span className="text-base font-mono font-bold text-emerald-400">
              {selectedDaySummary.winRatePct.toFixed(0)}%
            </span>
          </div>

          <div>
            <span className="text-slate-500 uppercase text-[10px] font-semibold tracking-wider block">R-Multiple</span>
            <span className={`text-base font-mono font-bold ${selectedDaySummary.netR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {selectedDaySummary.netR >= 0 ? '+' : ''}{selectedDaySummary.netR.toFixed(2)}R
            </span>
          </div>
        </div>

        {/* Trades List Container */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3.5 custom-scrollbar">
          {selectedDaySummary.trades.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <CalendarIcon className="w-10 h-10 mx-auto text-slate-700" />
              <p className="text-sm">No trades logged on this calendar day.</p>
              <button
                onClick={() => {
                  closeDayModal();
                  openAddTradeModal(selectedDaySummary.date);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Log Trade for this Day</span>
              </button>
            </div>
          ) : (
            selectedDaySummary.trades.map((trade) => {
              const isWin = trade.status === 'WIN';
              const isLoss = trade.status === 'LOSS';
              const isLong = trade.direction === 'LONG';

              return (
                <div
                  key={trade.id}
                  className="bg-[#0e1422] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all space-y-3 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-black text-slate-100 font-mono tracking-tight">
                        {trade.symbol}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        isLong ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}>
                        {trade.direction}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        isWin ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 
                        isLoss ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {trade.status}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${getEmotionBadgeClass(trade.emotion)}`}>
                        <Brain className="w-3 h-3" />
                        {trade.emotion}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <span className={`text-base font-black ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                        </span>
                        {trade.pnlR !== undefined && (
                          <span className="text-xs text-slate-500 ml-1.5 font-bold">
                            ({trade.pnlR >= 0 ? '+' : ''}{trade.pnlR.toFixed(2)}R)
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                        <button
                          onClick={() => {
                            setEditingTrade(trade);
                          }}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Edit trade"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this trade entry?')) {
                              deleteTrade(trade.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete trade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pricing / Volume / Strategy Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="bg-[#090d16] p-2 rounded-lg border border-slate-800/60">
                      <span className="text-slate-500 text-[10px] block">Entry Price</span>
                      <span className="text-slate-200 font-bold">{trade.entryPrice}</span>
                    </div>
                    <div className="bg-[#090d16] p-2 rounded-lg border border-slate-800/60">
                      <span className="text-slate-500 text-[10px] block">Exit Price</span>
                      <span className="text-slate-200 font-bold">{trade.exitPrice ?? '—'}</span>
                    </div>
                    <div className="bg-[#090d16] p-2 rounded-lg border border-slate-800/60">
                      <span className="text-slate-500 text-[10px] block">Size</span>
                      <span className="text-slate-200 font-bold">{trade.size ?? 1.0} lots</span>
                    </div>
                    <div className="bg-[#090d16] p-2 rounded-lg border border-slate-800/60">
                      <span className="text-slate-500 text-[10px] block">Source</span>
                      <span className="text-indigo-400 font-bold text-[11px] uppercase">
                        {trade.source === 'quant_engine' ? 'Quant Engine' : 'Manual'}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Strategy */}
                  {(trade.setup || trade.notes) && (
                    <div className="bg-[#090d16]/80 p-3 rounded-lg border border-slate-800/50 text-xs text-slate-300 space-y-1">
                      {trade.setup && (
                        <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[11px]">
                          <Tag className="w-3 h-3 text-indigo-400" />
                          <span>Setup: {trade.setup}</span>
                        </div>
                      )}
                      {trade.notes && (
                        <p className="text-slate-400 leading-relaxed font-sans text-xs">
                          {trade.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0e1422] flex items-center justify-between">
          <button
            onClick={() => {
              closeDayModal();
              openAddTradeModal(selectedDaySummary.date);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trade to This Day</span>
          </button>

          <button
            onClick={closeDayModal}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
