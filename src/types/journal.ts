export type TradeDirection = 'LONG' | 'SHORT';
export type TradeStatus = 'WIN' | 'LOSS' | 'BE' | 'OPEN';

export type EmotionType = 
  | 'Discipline'
  | 'Confidence'
  | 'Patience'
  | 'Flow'
  | 'FOMO'
  | 'Revenge'
  | 'Fear'
  | 'Greed'
  | 'Hesitation';

export interface JournalTrade {
  id: string;
  symbol: string;
  direction: TradeDirection;
  entryDate: string; // ISO string YYYY-MM-DD or full timestamp
  entryPrice: number;
  exitPrice?: number | null;
  size?: number; // lots or contracts
  pnl: number;
  pnlR: number;
  status: TradeStatus;
  emotion: EmotionType;
  notes?: string;
  source: 'manual' | 'quant_engine';
  timeframe?: string;
  setup?: string;
  session?: string;
  signalId?: number | null;
  createdAt: string;
  updatedAt?: string;
}

export interface DaySummary {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tradesCount: number;
  winsCount: number;
  lossesCount: number;
  netPnl: number;
  netR: number;
  winRatePct: number;
  dominantEmotion?: EmotionType;
  trades: JournalTrade[];
}

export interface WeekSummary {
  weekNumber: number;
  label: string;
  netPnl: number;
  tradesCount: number;
  activeDaysCount: number;
  winRatePct: number;
}

export interface JournalStats {
  netPnl: number;
  pnlPct: number;
  totalTrades: number;
  wins: number;
  losses: number;
  breakevens: number;
  winRatePct: number;
  dayWinRatePct: number;
  profitFactor: number;
  tradeExpectancy: number;
  avgWin: number;
  avgLoss: number;
  winLossRatio: number;
  dailyStreak: number;
  streakType: 'WIN' | 'LOSS' | 'NONE';
  positiveEmotionPct: number;
  totalActiveDays: number;
  profitableDays: number;
  unprofitableDays: number;
}

export interface EquityPoint {
  date: string;
  label: string;
  tradeNumber: number;
  tradePnl: number;
  cumulativePnl: number;
  symbol: string;
  outcome: TradeStatus;
}
