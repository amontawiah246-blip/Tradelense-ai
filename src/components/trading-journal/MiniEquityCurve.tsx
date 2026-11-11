import React, { useState } from 'react';
import { useJournalStore } from '../../store/useJournalStore';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { TrendingUp, Sparkles, Maximize2 } from 'lucide-react';

export function MiniEquityCurve() {
  const { getEquityCurve, getJournalStats } = useJournalStore();
  const equityPoints = getEquityCurve();
  const stats = getJournalStats();
  const [isExpanded, setIsExpanded] = useState(false);

  const isNetProfit = stats.netPnl >= 0;
  const strokeColor = isNetProfit ? '#10b981' : '#ef4444';
  const fillColor = isNetProfit ? '#10b981' : '#ef4444';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0e1422] border border-slate-700/80 rounded-xl p-3 shadow-2xl text-left text-xs z-50">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1.5 mb-1.5">
            <span className="font-bold text-slate-200">{data.label}</span>
            <span className="font-mono text-slate-400">Trade #{data.tradeNumber}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Symbol:</span>
              <span className="font-bold text-slate-100">{data.symbol}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Trade P&L:</span>
              <span className={`font-mono font-bold ${data.tradePnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.tradePnl >= 0 ? '+' : ''}${data.tradePnl.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-3 pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Cumulative Equity:</span>
              <span className={`font-mono font-bold ${data.cumulativePnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.cumulativePnl >= 0 ? '+' : ''}${data.cumulativePnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-[#0e1422] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-2 gap-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200 tracking-wide flex items-center gap-2">
              Cumulative Growth Curve
              <span className="text-[10px] text-slate-400 font-normal px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/50">
                {equityPoints.length - 1} setups executed
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Live mark-to-market progression across active journal sessions</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Current Peak</span>
            <span className={`text-sm font-mono font-black ${isNetProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isNetProfit ? '+' : ''}${stats.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`w-full ${isExpanded ? 'h-72' : 'h-40'} transition-all duration-300 pt-2`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={equityPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fillColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={fillColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="label" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              domain={['auto', 'auto']}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="cumulativePnl" 
              stroke={strokeColor} 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#equityGradient)" 
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
