import React from 'react';
import { useJournalStore } from '../../store/useJournalStore';
import { format, isToday } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  RefreshCw, 
  Download, 
  Search, 
  Filter,
  Smile,
  Frown,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { EmotionType, TradeStatus, DaySummary } from '../../types/journal';

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const EMOTIONS_LIST: EmotionType[] = [
  'Discipline',
  'Confidence',
  'Patience',
  'Flow',
  'FOMO',
  'Revenge',
  'Fear',
  'Greed',
  'Hesitation'
];

export function JournalCalendar() {
  const {
    selectedMonth,
    nextMonth,
    prevMonth,
    goToToday,
    timeRange,
    setTimeRange,
    filterEmotion,
    setFilterEmotion,
    filterOutcome,
    setFilterOutcome,
    searchQuery,
    setSearchQuery,
    openDayModal,
    openAddTradeModal,
    syncWithEngine,
    isSyncing,
    syncMessage,
    exportCsv,
    getMonthCalendarDays,
    getWeeklySummaries,
    getJournalStats
  } = useJournalStore();

  const calendarDays = getMonthCalendarDays();
  const weeklySummaries = getWeeklySummaries();
  const stats = getJournalStats();

  // Emotion badge color helper
  const getEmotionDotColor = (emotion?: EmotionType) => {
    switch (emotion) {
      case 'Discipline': return 'bg-emerald-400';
      case 'Confidence': return 'bg-blue-400';
      case 'Patience': return 'bg-teal-400';
      case 'Flow': return 'bg-indigo-400';
      case 'FOMO': return 'bg-amber-400';
      case 'Revenge': return 'bg-rose-500';
      case 'Fear': return 'bg-purple-400';
      case 'Greed': return 'bg-red-400';
      case 'Hesitation': return 'bg-orange-400';
      default: return 'bg-slate-500';
    }
  };

  const isNetPositiveMonth = stats.netPnl >= 0;

  return (
    <div className="w-full space-y-4 text-left">
      {/* Calendar Header & Controls Bar */}
      <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        
        {/* Left: Month Navigation & Month Stats Badge */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between sm:justify-start">
          <button
            onClick={goToToday}
            className="px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-700 transition-colors shadow-sm"
          >
            Today
          </button>

          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-bold text-slate-100 min-w-[120px] text-center">
              {format(selectedMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Monthly Stats Badge (TradeZella Style) */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#090d16] border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Monthly stats:</span>
            <span className={`text-xs font-mono font-bold ${isNetPositiveMonth ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isNetPositiveMonth ? '+' : '-'}${Math.abs(stats.netPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-300 font-semibold">
              {stats.totalActiveDays} days
            </span>
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-end">
          {/* Sync Engine Button */}
          <button
            onClick={syncWithEngine}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/30 transition-all cursor-pointer disabled:opacity-50"
            title="Sync trades with the Quantitative Engine database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{isSyncing ? 'Syncing DB...' : 'Sync Engine'}</span>
          </button>

          {/* Add Trade Button */}
          <button
            onClick={() => openAddTradeModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trade</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Export filtered trades as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e1422]/90 border border-slate-800/80 rounded-2xl p-3.5 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Time Range Tabs */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[11px] font-bold overflow-x-auto">
          {[
            { id: 'THIS_MONTH', label: 'This Month' },
            { id: 'LAST_MONTH', label: 'Last Month' },
            { id: 'LAST_QUARTER', label: 'Last Quarter' },
            { id: 'ALL_TIME', label: 'All Time' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTimeRange(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                timeRange === tab.id 
                  ? 'bg-slate-800 text-emerald-400 shadow font-extrabold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Emotion, Outcome and Search Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Emotion Dropdown */}
          <div className="relative">
            <select
              value={filterEmotion}
              onChange={(e) => setFilterEmotion(e.target.value as any)}
              className="bg-slate-900 text-xs text-slate-200 border border-slate-800 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
            >
              <option value="ALL">All Emotions</option>
              {EMOTIONS_LIST.map(em => (
                <option key={em} value={em}>{em}</option>
              ))}
            </select>
            <Smile className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Outcome Filter */}
          <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[11px]">
            {(['ALL', 'WIN', 'LOSS'] as Array<TradeStatus | 'ALL'>).map(out => (
              <button
                key={out}
                onClick={() => setFilterOutcome(out)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filterOutcome === out 
                    ? (out === 'WIN' ? 'bg-emerald-500/20 text-emerald-400' : out === 'LOSS' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-200')
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {out}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search symbol, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Sync Status Banner (if any) */}
      {syncMessage && (
        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-center justify-between animate-fadeIn">
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Main Layout: Calendar Grid + Weekly Cards on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Calendar Centerpiece Grid (takes 9 of 12 cols on desktop) */}
        <div className="xl:col-span-9 bg-[#0b0f19] border border-slate-800/90 rounded-2xl p-4 shadow-xl overflow-hidden">
          
          {/* Day of Week Column Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1 border-b border-slate-800/80">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const hasTrades = day.tradesCount > 0;
              const isProfitDay = day.netPnl > 0;
              const isLossDay = day.netPnl < 0;

              let cellBg = 'bg-[#0e1422]/50 border-slate-800/50 hover:border-slate-700 text-slate-500';
              let pnlColor = 'text-slate-400';

              if (hasTrades) {
                if (isProfitDay) {
                  cellBg = 'bg-emerald-950/30 border-emerald-800/60 hover:border-emerald-500/80 hover:bg-emerald-900/35 text-slate-200 shadow-sm';
                  pnlColor = 'text-emerald-400';
                } else if (isLossDay) {
                  cellBg = 'bg-rose-950/30 border-rose-800/60 hover:border-rose-500/80 hover:bg-rose-900/35 text-slate-200 shadow-sm';
                  pnlColor = 'text-rose-400';
                } else {
                  cellBg = 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600 text-slate-300';
                  pnlColor = 'text-slate-300';
                }
              }

              return (
                <button
                  key={`${day.date}-${idx}`}
                  onClick={() => openDayModal(day)}
                  className={`min-h-[92px] sm:min-h-[105px] p-2 sm:p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all duration-150 cursor-pointer relative group ${cellBg} ${
                    !day.isCurrentMonth ? 'opacity-30' : 'opacity-100'
                  } ${day.isToday ? 'ring-1 ring-indigo-400/80' : ''}`}
                >
                  {/* Top Row: Dominant Emotion Dot + Day Number */}
                  <div className="flex items-center justify-between w-full">
                    <div>
                      {hasTrades && day.dominantEmotion && (
                        <span 
                          className={`w-2 h-2 rounded-full inline-block ${getEmotionDotColor(day.dominantEmotion)}`}
                          title={`Dominant Emotion: ${day.dominantEmotion}`}
                        />
                      )}
                    </div>
                    <span className={`text-[11px] sm:text-xs font-mono font-bold ${
                      day.isToday ? 'text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded' : (day.isCurrentMonth ? 'text-slate-400' : 'text-slate-600')
                    }`}>
                      {day.dayNumber}
                    </span>
                  </div>

                  {/* Middle / Bottom: P&L and Trade Metrics */}
                  {hasTrades ? (
                    <div className="mt-1 space-y-0.5">
                      <div className={`text-xs sm:text-sm font-mono font-black tracking-tight ${pnlColor}`}>
                        {isProfitDay ? '+' : (isLossDay ? '-' : '')}${Math.abs(day.netPnl) >= 1000 ? `${(Math.abs(day.netPnl) / 1000).toFixed(1)}k` : Math.abs(day.netPnl).toFixed(0)}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{day.tradesCount} {day.tradesCount === 1 ? 'trade' : 'trades'}</span>
                        <span className={day.netR >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {day.netR >= 0 ? '+' : ''}{day.netR.toFixed(1)}R
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Plus className="w-3 h-3" /> Log
                      </span>
                    </div>
                  )}

                  {/* Tiny win rate progress line on bottom if multiple trades */}
                  {hasTrades && day.tradesCount > 1 && (
                    <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden flex mt-1">
                      <div 
                        className="bg-emerald-400 h-full" 
                        style={{ width: `${day.winRatePct}%` }} 
                      />
                      <div 
                        className="bg-rose-400 h-full" 
                        style={{ width: `${100 - day.winRatePct}%` }} 
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly Summary Cards (3 of 12 cols on desktop - TradeZella Screenshot 3) */}
        <div className="xl:col-span-3 space-y-3 flex flex-col justify-start">
          <div className="bg-[#0e1422] border border-slate-800/90 rounded-2xl p-4 shadow-lg">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-2">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
              Weekly Summary
            </h4>
            <p className="text-[11px] text-slate-400">Aggregated breakdown by calendar week</p>
          </div>

          <div className="space-y-3">
            {weeklySummaries.map((week) => {
              const isProfit = week.netPnl >= 0;
              const hasActivity = week.tradesCount > 0;

              return (
                <div
                  key={week.weekNumber}
                  className={`bg-[#0e1422] border rounded-2xl p-4 transition-all shadow-md ${
                    hasActivity 
                      ? (isProfit 
                          ? 'border-emerald-500/25 bg-emerald-950/10 hover:border-emerald-500/40' 
                          : 'border-rose-500/25 bg-rose-950/10 hover:border-rose-500/40')
                      : 'border-slate-800/70 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-slate-200">{week.label}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {week.activeDaysCount} {week.activeDaysCount === 1 ? 'day' : 'days'} active
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between">
                    <div className={`text-xl font-mono font-black ${
                      hasActivity 
                        ? (isProfit ? 'text-emerald-400' : 'text-rose-400') 
                        : 'text-slate-500'
                    }`}>
                      {isProfit && hasActivity ? '+' : ''}${Math.abs(week.netPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>

                    {hasActivity && (
                      <div className="text-[11px] font-mono text-slate-400">
                        {week.tradesCount} trades
                      </div>
                    )}
                  </div>

                  {hasActivity && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Win Rate:</span>
                      <span className={`font-mono font-bold ${week.winRatePct >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {week.winRatePct.toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
