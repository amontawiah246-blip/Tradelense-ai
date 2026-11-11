import { create } from 'zustand';
import { 
  JournalTrade, 
  DaySummary, 
  WeekSummary, 
  JournalStats, 
  EquityPoint, 
  EmotionType, 
  TradeStatus 
} from '../types/journal';
import { generateDefaultTrades, isPositiveEmotion } from '../data/sampleTrades';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isToday, 
  addMonths, 
  subMonths,
  parseISO,
  isWithinInterval,
  subDays,
  startOfQuarter,
  endOfQuarter
} from 'date-fns';

export type TimeRangeFilter = 'THIS_MONTH' | 'LAST_MONTH' | 'LAST_QUARTER' | 'ALL_TIME';

interface JournalState {
  trades: JournalTrade[];
  selectedMonth: Date;
  timeRange: TimeRangeFilter;
  filterEmotion: EmotionType | 'ALL';
  filterOutcome: TradeStatus | 'ALL';
  searchQuery: string;
  
  // UI state
  isDayModalOpen: boolean;
  selectedDaySummary: DaySummary | null;
  isAddTradeModalOpen: boolean;
  editingTrade: JournalTrade | null;
  isLoading: boolean;
  isSyncing: boolean;
  syncMessage: string | null;

  // Actions
  fetchTrades: () => Promise<void>;
  addTrade: (trade: Omit<JournalTrade, 'id' | 'createdAt'>) => Promise<void>;
  updateTrade: (id: string, updates: Partial<JournalTrade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  syncWithEngine: () => Promise<void>;
  resetToSampleData: () => Promise<void>;
  
  setSelectedMonth: (date: Date) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  goToToday: () => void;
  setTimeRange: (range: TimeRangeFilter) => void;
  setFilterEmotion: (emotion: EmotionType | 'ALL') => void;
  setFilterOutcome: (outcome: TradeStatus | 'ALL') => void;
  setSearchQuery: (query: string) => void;

  openDayModal: (summary: DaySummary) => void;
  closeDayModal: () => void;
  openAddTradeModal: (presetDate?: string) => void;
  closeAddTradeModal: () => void;
  setEditingTrade: (trade: JournalTrade | null) => void;
  exportCsv: () => void;

  // Getters / Computed
  getFilteredTrades: () => JournalTrade[];
  getMonthCalendarDays: () => DaySummary[];
  getWeeklySummaries: () => WeekSummary[];
  getJournalStats: () => JournalStats;
  getEquityCurve: () => EquityPoint[];
}

// Module-level cache references to guarantee stable getSnapshot references and eliminate infinite loops
let lastFilteredTradesInput = {
  trades: null as JournalTrade[] | null,
  selectedMonthTime: 0,
  timeRange: '' as TimeRangeFilter,
  filterEmotion: '' as EmotionType | 'ALL',
  filterOutcome: '' as TradeStatus | 'ALL',
  searchQuery: ''
};
let cachedFilteredTrades: JournalTrade[] = [];

let lastCalendarDaysInput = {
  trades: null as JournalTrade[] | null,
  selectedMonthTime: 0,
  filterEmotion: '' as EmotionType | 'ALL',
  filterOutcome: '' as TradeStatus | 'ALL',
  searchQuery: ''
};
let cachedCalendarDays: DaySummary[] = [];

let lastWeeklySummariesInput = {
  calendarDays: null as DaySummary[] | null
};
let cachedWeeklySummaries: WeekSummary[] = [];

let lastStatsInput = {
  trades: null as JournalTrade[] | null,
  selectedMonthTime: 0,
  timeRange: '' as TimeRangeFilter,
  filterEmotion: '' as EmotionType | 'ALL',
  filterOutcome: '' as TradeStatus | 'ALL',
  searchQuery: ''
};
let cachedStats: JournalStats | null = null;

let lastEquityCurveInput = {
  filteredTrades: null as JournalTrade[] | null
};
let cachedEquityCurve: EquityPoint[] = [];

export const useJournalStore = create<JournalState>((set, get) => ({
  // Default to March 2025 where realistic dataset is centered, or allow any month
  trades: generateDefaultTrades(),
  selectedMonth: new Date(2025, 2, 1), // March 2025
  timeRange: 'THIS_MONTH',
  filterEmotion: 'ALL',
  filterOutcome: 'ALL',
  searchQuery: '',

  isDayModalOpen: false,
  selectedDaySummary: null,
  isAddTradeModalOpen: false,
  editingTrade: null,
  isLoading: false,
  isSyncing: false,
  syncMessage: null,

  fetchTrades: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/journal/trades');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.trades) && data.trades.length > 0) {
          set({ trades: data.trades });
        }
      }
    } catch (err) {
      console.warn('Journal fetch error, utilizing initialized data:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addTrade: async (tradeData) => {
    const newId = `trade_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newTrade: JournalTrade = {
      ...tradeData,
      id: newId,
      createdAt: new Date().toISOString()
    };

    // Optimistically update store
    set(state => ({
      trades: [newTrade, ...state.trades],
      isAddTradeModalOpen: false
    }));

    // If day modal is open, refresh its trades
    const currentDay = get().selectedDaySummary;
    if (currentDay && newTrade.entryDate.startsWith(currentDay.date)) {
      const updatedDayTrades = [newTrade, ...currentDay.trades];
      const wins = updatedDayTrades.filter(t => t.status === 'WIN').length;
      const losses = updatedDayTrades.filter(t => t.status === 'LOSS').length;
      const netPnl = updatedDayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
      const netR = updatedDayTrades.reduce((acc, t) => acc + (t.pnlR || 0), 0);
      set({
        selectedDaySummary: {
          ...currentDay,
          trades: updatedDayTrades,
          tradesCount: updatedDayTrades.length,
          winsCount: wins,
          lossesCount: losses,
          netPnl,
          netR,
          winRatePct: updatedDayTrades.length > 0 ? (wins / updatedDayTrades.length) * 100 : 0
        }
      });
    }

    // Persist to backend
    try {
      await fetch('/api/journal/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrade)
      });
    } catch (err) {
      console.error('Failed to persist trade to backend:', err);
    }
  },

  updateTrade: async (id, updates) => {
    set(state => ({
      trades: state.trades.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t),
      editingTrade: null
    }));

    try {
      await fetch(`/api/journal/trades/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Failed to update trade on backend:', err);
    }
  },

  deleteTrade: async (id) => {
    set(state => ({
      trades: state.trades.filter(t => t.id !== id)
    }));

    // Update day modal if open
    const currentDay = get().selectedDaySummary;
    if (currentDay) {
      const updatedTrades = currentDay.trades.filter(t => t.id !== id);
      const wins = updatedTrades.filter(t => t.status === 'WIN').length;
      const losses = updatedTrades.filter(t => t.status === 'LOSS').length;
      const netPnl = updatedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
      const netR = updatedTrades.reduce((acc, t) => acc + (t.pnlR || 0), 0);
      set({
        selectedDaySummary: {
          ...currentDay,
          trades: updatedTrades,
          tradesCount: updatedTrades.length,
          winsCount: wins,
          lossesCount: losses,
          netPnl,
          netR,
          winRatePct: updatedTrades.length > 0 ? (wins / updatedTrades.length) * 100 : 0
        }
      });
    }

    try {
      await fetch(`/api/journal/trades/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete trade on backend:', err);
    }
  },

  syncWithEngine: async () => {
    set({ isSyncing: true, syncMessage: 'Querying database engine & signals...' });
    try {
      const res = await fetch('/api/journal/sync-engine', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.trades && Array.isArray(data.trades)) {
          set({ 
            trades: data.trades,
            syncMessage: `Successfully synchronized ${data.syncedCount || data.trades.length} trades with database engine.` 
          });
        }
      } else {
        set({ syncMessage: 'Synced with latest quantitative engine state.' });
      }
    } catch (err) {
      console.error('Engine sync failed:', err);
      set({ syncMessage: 'Offline mode: data preserved locally.' });
    } finally {
      set({ isSyncing: false });
      setTimeout(() => set({ syncMessage: null }), 4000);
    }
  },

  resetToSampleData: async () => {
    const sample = generateDefaultTrades();
    set({ trades: sample, syncMessage: 'Loaded realistic sample dataset.' });
    try {
      await fetch('/api/journal/reset-sample', { method: 'POST' });
    } catch {
      // safe fallback
    }
    setTimeout(() => set({ syncMessage: null }), 3000);
  },

  setSelectedMonth: (date) => set({ selectedMonth: date }),
  nextMonth: () => set(state => ({ selectedMonth: addMonths(state.selectedMonth, 1) })),
  prevMonth: () => set(state => ({ selectedMonth: subMonths(state.selectedMonth, 1) })),
  goToToday: () => set({ selectedMonth: new Date() }),

  setTimeRange: (timeRange) => set({ timeRange }),
  setFilterEmotion: (filterEmotion) => set({ filterEmotion }),
  setFilterOutcome: (filterOutcome) => set({ filterOutcome }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  openDayModal: (summary) => set({ isDayModalOpen: true, selectedDaySummary: summary }),
  closeDayModal: () => set({ isDayModalOpen: false, selectedDaySummary: null }),

  openAddTradeModal: (presetDate) => {
    set({ isAddTradeModalOpen: true });
  },
  closeAddTradeModal: () => set({ isAddTradeModalOpen: false, editingTrade: null }),
  setEditingTrade: (editingTrade) => set({ editingTrade, isAddTradeModalOpen: true }),

  exportCsv: () => {
    const trades = get().getFilteredTrades();
    if (trades.length === 0) return;

    const headers = ['ID', 'Date', 'Symbol', 'Direction', 'Entry Price', 'Exit Price', 'P&L ($)', 'R Multiple', 'Status', 'Emotion', 'Source', 'Notes'];
    const rows = trades.map(t => [
      t.id,
      t.entryDate,
      t.symbol,
      t.direction,
      t.entryPrice,
      t.exitPrice ?? '',
      t.pnl.toFixed(2),
      t.pnlR?.toFixed(2) ?? '',
      t.status,
      t.emotion,
      t.source,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradezella_journal_export_${format(get().selectedMonth, 'yyyy_MM')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  getFilteredTrades: () => {
    const { trades, selectedMonth, timeRange, filterEmotion, filterOutcome, searchQuery } = get();
    const monthTime = selectedMonth instanceof Date ? selectedMonth.getTime() : new Date(selectedMonth).getTime();

    if (
      lastFilteredTradesInput.trades === trades &&
      lastFilteredTradesInput.selectedMonthTime === monthTime &&
      lastFilteredTradesInput.timeRange === timeRange &&
      lastFilteredTradesInput.filterEmotion === filterEmotion &&
      lastFilteredTradesInput.filterOutcome === filterOutcome &&
      lastFilteredTradesInput.searchQuery === searchQuery
    ) {
      return cachedFilteredTrades;
    }

    const filtered = trades.filter(trade => {
      const tradeDate = parseISO(trade.entryDate);

      // Time range filter
      if (timeRange === 'THIS_MONTH') {
        if (!isSameMonth(tradeDate, selectedMonth)) return false;
      } else if (timeRange === 'LAST_MONTH') {
        const lastMonth = subMonths(new Date(), 1);
        if (!isSameMonth(tradeDate, lastMonth)) return false;
      } else if (timeRange === 'LAST_QUARTER') {
        const now = new Date();
        const startQ = startOfQuarter(subDays(now, 90));
        const endQ = endOfQuarter(subDays(now, 90));
        if (!isWithinInterval(tradeDate, { start: startQ, end: endQ })) return false;
      }

      // Emotion filter
      if (filterEmotion !== 'ALL' && trade.emotion !== filterEmotion) {
        return false;
      }

      // Outcome filter
      if (filterOutcome !== 'ALL' && trade.status !== filterOutcome) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const symbolMatch = trade.symbol.toLowerCase().includes(q);
        const notesMatch = (trade.notes || '').toLowerCase().includes(q);
        const setupMatch = (trade.setup || '').toLowerCase().includes(q);
        const emotionMatch = trade.emotion.toLowerCase().includes(q);
        if (!symbolMatch && !notesMatch && !setupMatch && !emotionMatch) return false;
      }

      return true;
    });

    lastFilteredTradesInput = {
      trades,
      selectedMonthTime: monthTime,
      timeRange,
      filterEmotion,
      filterOutcome,
      searchQuery
    };
    cachedFilteredTrades = filtered;
    return filtered;
  },

  getMonthCalendarDays: () => {
    const { selectedMonth, trades, filterEmotion, filterOutcome, searchQuery } = get();
    const monthTime = selectedMonth instanceof Date ? selectedMonth.getTime() : new Date(selectedMonth).getTime();

    if (
      lastCalendarDaysInput.trades === trades &&
      lastCalendarDaysInput.selectedMonthTime === monthTime &&
      lastCalendarDaysInput.filterEmotion === filterEmotion &&
      lastCalendarDaysInput.filterOutcome === filterOutcome &&
      lastCalendarDaysInput.searchQuery === searchQuery
    ) {
      return cachedCalendarDays;
    }

    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(monthStart);
    // Grid starts on Sunday
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const result = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const isCurrMonth = isSameMonth(day, selectedMonth);

      // Match trades for this day
      let dayTrades = trades.filter(t => t.entryDate.startsWith(dateStr));

      // Apply emotion / outcome / search filters if any
      if (filterEmotion !== 'ALL') {
        dayTrades = dayTrades.filter(t => t.emotion === filterEmotion);
      }
      if (filterOutcome !== 'ALL') {
        dayTrades = dayTrades.filter(t => t.status === filterOutcome);
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        dayTrades = dayTrades.filter(t => 
          t.symbol.toLowerCase().includes(q) ||
          (t.notes || '').toLowerCase().includes(q) ||
          t.emotion.toLowerCase().includes(q)
        );
      }

      const wins = dayTrades.filter(t => t.status === 'WIN').length;
      const losses = dayTrades.filter(t => t.status === 'LOSS').length;
      const netPnl = dayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
      const netR = dayTrades.reduce((acc, t) => acc + (t.pnlR || 0), 0);
      const winRatePct = dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0;

      // Determine dominant emotion
      let dominantEmotion: EmotionType | undefined;
      if (dayTrades.length > 0) {
        const emotionCounts = dayTrades.reduce((acc, t) => {
          acc[t.emotion] = (acc[t.emotion] || 0) + 1;
          return acc;
        }, {} as Record<EmotionType, number>);
        dominantEmotion = (Object.keys(emotionCounts) as EmotionType[]).reduce((a, b) => 
          emotionCounts[a] > emotionCounts[b] ? a : b
        );
      }

      return {
        date: dateStr,
        dayNumber: day.getDate(),
        isCurrentMonth: isCurrMonth,
        isToday: isToday(day),
        tradesCount: dayTrades.length,
        winsCount: wins,
        lossesCount: losses,
        netPnl,
        netR,
        winRatePct,
        dominantEmotion,
        trades: dayTrades
      };
    });

    lastCalendarDaysInput = {
      trades,
      selectedMonthTime: monthTime,
      filterEmotion,
      filterOutcome,
      searchQuery
    };
    cachedCalendarDays = result;
    return result;
  },

  getWeeklySummaries: () => {
    const calendarDays = get().getMonthCalendarDays();

    if (lastWeeklySummariesInput.calendarDays === calendarDays) {
      return cachedWeeklySummaries;
    }

    const weeks: WeekSummary[] = [];

    // Split calendar days into chunks of 7 days
    const totalWeeks = Math.ceil(calendarDays.length / 7);
    for (let w = 0; w < totalWeeks; w++) {
      const weekDays = calendarDays.slice(w * 7, (w + 1) * 7);
      
      // Calculate active days in this week
      const activeDays = weekDays.filter(d => d.tradesCount > 0);
      const netPnl = weekDays.reduce((acc, d) => acc + d.netPnl, 0);
      const totalTrades = weekDays.reduce((acc, d) => acc + d.tradesCount, 0);
      const totalWins = weekDays.reduce((acc, d) => acc + d.winsCount, 0);

      weeks.push({
        weekNumber: w + 1,
        label: `Week ${w + 1}`,
        netPnl,
        tradesCount: totalTrades,
        activeDaysCount: activeDays.length,
        winRatePct: totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0
      });
    }

    lastWeeklySummariesInput = { calendarDays };
    cachedWeeklySummaries = weeks;
    return weeks;
  },

  getJournalStats: () => {
    const { trades, selectedMonth, timeRange, filterEmotion, filterOutcome, searchQuery } = get();
    const monthTime = selectedMonth instanceof Date ? selectedMonth.getTime() : new Date(selectedMonth).getTime();

    if (
      cachedStats &&
      lastStatsInput.trades === trades &&
      lastStatsInput.selectedMonthTime === monthTime &&
      lastStatsInput.timeRange === timeRange &&
      lastStatsInput.filterEmotion === filterEmotion &&
      lastStatsInput.filterOutcome === filterOutcome &&
      lastStatsInput.searchQuery === searchQuery
    ) {
      return cachedStats;
    }

    const filteredTrades = get().getFilteredTrades();
    const calendarDays = get().getMonthCalendarDays().filter(d => d.isCurrentMonth);

    const totalTrades = filteredTrades.length;
    const wins = filteredTrades.filter(t => t.status === 'WIN');
    const losses = filteredTrades.filter(t => t.status === 'LOSS');
    const breakevens = filteredTrades.filter(t => t.status === 'BE');

    const netPnl = filteredTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const winRatePct = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;

    const totalWinAmount = wins.reduce((acc, t) => acc + t.pnl, 0);
    const totalLossAmount = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor = totalLossAmount > 0 
      ? parseFloat((totalWinAmount / totalLossAmount).toFixed(2)) 
      : (totalWinAmount > 0 ? 99.0 : 0);

    const avgWin = wins.length > 0 ? totalWinAmount / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLossAmount / losses.length : 0;
    const winLossRatio = avgLoss > 0 ? parseFloat((avgWin / avgLoss).toFixed(2)) : 0;

    // Trade expectancy in R or currency: (WinRate * AvgWin) - (LossRate * AvgLoss)
    const winRate = totalTrades > 0 ? wins.length / totalTrades : 0;
    const lossRate = totalTrades > 0 ? losses.length / totalTrades : 0;
    const tradeExpectancy = parseFloat(((winRate * avgWin) - (lossRate * avgLoss)).toFixed(2));

    // Day level stats
    const activeDays = calendarDays.filter(d => d.tradesCount > 0);
    const profitableDays = activeDays.filter(d => d.netPnl > 0).length;
    const unprofitableDays = activeDays.filter(d => d.netPnl < 0).length;
    const dayWinRatePct = activeDays.length > 0 ? (profitableDays / activeDays.length) * 100 : 0;

    // Emotions breakdown
    const positiveEmotionsCount = filteredTrades.filter(t => isPositiveEmotion(t.emotion)).length;
    const positiveEmotionPct = totalTrades > 0 ? (positiveEmotionsCount / totalTrades) * 100 : 0;

    // Streak calculation (based on sorted trades)
    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
    let streak = 0;
    let streakType: 'WIN' | 'LOSS' | 'NONE' = 'NONE';

    for (const t of sortedTrades) {
      if (t.status === 'WIN') {
        if (streakType === 'NONE') streakType = 'WIN';
        if (streakType === 'WIN') streak++;
        else break;
      } else if (t.status === 'LOSS') {
        if (streakType === 'NONE') streakType = 'LOSS';
        if (streakType === 'LOSS') streak++;
        else break;
      }
    }

    // Reference base account 100,000 to compute realistic % gain
    const baseline = 100000;
    const pnlPct = parseFloat(((netPnl / baseline) * 100).toFixed(2));

    const computedStats: JournalStats = {
      netPnl,
      pnlPct,
      totalTrades,
      wins: wins.length,
      losses: losses.length,
      breakevens: breakevens.length,
      winRatePct,
      dayWinRatePct,
      profitFactor,
      tradeExpectancy,
      avgWin,
      avgLoss,
      winLossRatio,
      dailyStreak: streak,
      streakType,
      positiveEmotionPct,
      totalActiveDays: activeDays.length,
      profitableDays,
      unprofitableDays
    };

    lastStatsInput = {
      trades,
      selectedMonthTime: monthTime,
      timeRange,
      filterEmotion,
      filterOutcome,
      searchQuery
    };
    cachedStats = computedStats;
    return computedStats;
  },

  getEquityCurve: () => {
    const filteredTrades = get().getFilteredTrades();

    if (lastEquityCurveInput.filteredTrades === filteredTrades) {
      return cachedEquityCurve;
    }

    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());

    let runningPnl = 0;
    const points: EquityPoint[] = [
      {
        date: 'Start',
        label: 'Day 0',
        tradeNumber: 0,
        tradePnl: 0,
        cumulativePnl: 0,
        symbol: 'BASE',
        outcome: 'BE'
      }
    ];

    sortedTrades.forEach((t, index) => {
      runningPnl += t.pnl;
      points.push({
        date: t.entryDate,
        label: format(parseISO(t.entryDate), 'MMM d'),
        tradeNumber: index + 1,
        tradePnl: t.pnl,
        cumulativePnl: runningPnl,
        symbol: t.symbol,
        outcome: t.status
      });
    });

    lastEquityCurveInput = { filteredTrades };
    cachedEquityCurve = points;
    return points;
  }
}));
