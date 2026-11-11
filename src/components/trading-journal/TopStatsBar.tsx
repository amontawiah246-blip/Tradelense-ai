import React from 'react';
import { useJournalStore } from '../../store/useJournalStore';
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Brain, 
  Percent, 
  Target, 
  Award, 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight,
  Smile,
  Shield
} from 'lucide-react';

export function TopStatsBar() {
  const { getJournalStats, selectedMonth } = useJournalStore();
  const stats = getJournalStats();

  const isNetPositive = stats.netPnl >= 0;
  const formattedNetPnl = `${isNetPositive ? '+' : '-'}$${Math.abs(stats.netPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Circular progress math
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  
  // Win rate circle
  const winRateOffset = circumference - (stats.winRatePct / 100) * circumference;
  
  // Emotion meter circle
  const emotionOffset = circumference - (stats.positiveEmotionPct / 100) * circumference;

  return (
    <div className="w-full space-y-4">
      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Net P&L */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="uppercase tracking-wider font-semibold text-slate-400">Net P&L</span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isNetPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {isNetPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {isNetPositive ? `+${stats.pnlPct}%` : `${stats.pnlPct}%`}
            </span>
          </div>

          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${isNetPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formattedNetPnl}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span>{stats.totalTrades} Total Trades</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">{stats.wins} Wins</span>
              <span>/</span>
              <span className="text-rose-400 font-medium">{stats.losses} Losses</span>
            </div>
          </div>

          <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 ${
            isNetPositive ? 'bg-emerald-500' : 'bg-rose-500'
          }`} />
        </div>

        {/* Card 2: Emotion Meter */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="uppercase tracking-wider font-semibold text-slate-400">Emotion Meter</span>
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Brain className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                {stats.positiveEmotionPct.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">
                Disciplined & Calm Mindset
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Calculated on psychology tags
              </div>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-18 h-18 flex items-center justify-center">
              <svg className="w-18 h-18 -rotate-90 transform" viewBox="0 0 76 76">
                <circle
                  cx="38"
                  cy="38"
                  r={radius}
                  className="text-slate-800"
                  strokeWidth="7"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="38"
                  cy="38"
                  r={radius}
                  className="text-indigo-400 transition-all duration-1000 ease-out"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={emotionOffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <Smile className="w-5 h-5 text-indigo-400 absolute" />
            </div>
          </div>
        </div>

        {/* Card 3: Trade Win % */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="uppercase tracking-wider font-semibold text-slate-400">Trade Win %</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                {stats.winRatePct.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">
                Win / Loss Execution
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {stats.wins}W • {stats.losses}L • {stats.breakevens}BE
              </div>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-18 h-18 flex items-center justify-center">
              <svg className="w-18 h-18 -rotate-90 transform" viewBox="0 0 76 76">
                <circle
                  cx="38"
                  cy="38"
                  r={radius}
                  className="text-slate-800"
                  strokeWidth="7"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="38"
                  cy="38"
                  r={radius}
                  className="text-emerald-400 transition-all duration-1000 ease-out"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={winRateOffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <Target className="w-5 h-5 text-emerald-400 absolute" />
            </div>
          </div>
        </div>

        {/* Card 4: Daily Streak & Consistency */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="uppercase tracking-wider font-semibold text-slate-400">Daily Streak</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                {stats.dailyStreak} {stats.streakType === 'WIN' ? 'Win Streak' : stats.streakType === 'LOSS' ? 'Loss Streak' : 'Active'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span>{stats.totalActiveDays} Active Trading Days</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">{stats.profitableDays} Green</span>
              <span>/</span>
              <span className="text-rose-400 font-medium">{stats.unprofitableDays} Red</span>
            </div>
          </div>

          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl bg-amber-500 pointer-events-none opacity-15" />
        </div>
      </div>

      {/* Secondary Metrics Strip (Profit Factor, Day Win %, Avg Win/Loss Ratio, Expectancy) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0b101c] border border-slate-800/60 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Profit Factor</div>
            <div className="text-lg font-bold text-slate-100 mt-0.5">{stats.profitFactor.toFixed(2)}</div>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            {stats.profitFactor >= 2 ? 'ELITE' : stats.profitFactor >= 1.5 ? 'STRONG' : 'MODERATE'}
          </div>
        </div>

        <div className="bg-[#0b101c] border border-slate-800/60 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Day Win %</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{stats.dayWinRatePct.toFixed(1)}%</div>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {stats.profitableDays} of {stats.totalActiveDays} days
          </div>
        </div>

        <div className="bg-[#0b101c] border border-slate-800/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            <span>Avg Win / Loss</span>
            <span className="text-slate-300 font-mono">{stats.winLossRatio.toFixed(2)}R</span>
          </div>
          {/* Dual bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full transition-all" 
              style={{ width: `${Math.min(100, Math.max(10, (stats.avgWin / (stats.avgWin + (stats.avgLoss || 1))) * 100))}%` }}
              title={`Avg Win: $${stats.avgWin.toFixed(0)}`}
            />
            <div 
              className="bg-rose-500 h-full transition-all" 
              style={{ width: `${Math.min(90, Math.max(10, ((stats.avgLoss || 1) / (stats.avgWin + (stats.avgLoss || 1))) * 100))}%` }}
              title={`Avg Loss: $${stats.avgLoss.toFixed(0)}`}
            />
          </div>
        </div>

        <div className="bg-[#0b101c] border border-slate-800/60 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Trade Expectancy</div>
            <div className={`text-lg font-bold mt-0.5 ${stats.tradeExpectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.tradeExpectancy >= 0 ? `+$${stats.tradeExpectancy}` : `-$${Math.abs(stats.tradeExpectancy)}`}
            </div>
          </div>
          <div className="text-[10px] text-slate-400">
            per setup
          </div>
        </div>
      </div>
    </div>
  );
}
