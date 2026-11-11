import React, { useState, useEffect } from 'react';
import { useJournalStore } from '../../store/useJournalStore';
import { 
  X, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  DollarSign, 
  Calendar, 
  Layers,
  FileText,
  AlertCircle
} from 'lucide-react';
import { EmotionType, TradeDirection, TradeStatus } from '../../types/journal';
import { format } from 'date-fns';

const SYMBOL_PRESETS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD',
  'XAUUSD', 'XAGUSD', 'USOIL', 'Crude Oil', 'BTCUSD', 'ETHUSD',
  'NAS100', 'USTEC', 'US30', 'SPX500', 'STOXX50', 'VOL75'
];

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

export function AddTradeModal() {
  const {
    isAddTradeModalOpen,
    closeAddTradeModal,
    addTrade,
    updateTrade,
    editingTrade,
    selectedMonth
  } = useJournalStore();

  const [symbol, setSymbol] = useState('EURUSD');
  const [direction, setDirection] = useState<TradeDirection>('LONG');
  const [entryDate, setEntryDate] = useState('');
  const [entryPrice, setEntryPrice] = useState('1.0850');
  const [exitPrice, setExitPrice] = useState('1.0890');
  const [size, setSize] = useState('1.0');
  const [pnl, setPnl] = useState('400.00');
  const [pnlR, setPnlR] = useState('2.0');
  const [status, setStatus] = useState<TradeStatus>('WIN');
  const [emotion, setEmotion] = useState<EmotionType>('Discipline');
  const [setup, setSetup] = useState('Order Block Retest');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize form state when opened or editing
  useEffect(() => {
    if (editingTrade) {
      setSymbol(editingTrade.symbol);
      setDirection(editingTrade.direction);
      setEntryDate(editingTrade.entryDate ? editingTrade.entryDate.substring(0, 16) : '');
      setEntryPrice(editingTrade.entryPrice?.toString() || '');
      setExitPrice(editingTrade.exitPrice?.toString() || '');
      setSize(editingTrade.size?.toString() || '1.0');
      setPnl(editingTrade.pnl?.toString() || '0');
      setPnlR(editingTrade.pnlR?.toString() || '0');
      setStatus(editingTrade.status);
      setEmotion(editingTrade.emotion);
      setSetup(editingTrade.setup || '');
      setNotes(editingTrade.notes || '');
    } else {
      // Default date to current selection in calendar or current day
      const now = new Date();
      const defaultDateTime = format(now, "yyyy-MM-dd'T'HH:mm");
      setEntryDate(defaultDateTime);
      setSymbol('EURUSD');
      setDirection('LONG');
      setEntryPrice('1.0850');
      setExitPrice('1.0890');
      setSize('1.0');
      setPnl('400.00');
      setPnlR('2.0');
      setStatus('WIN');
      setEmotion('Discipline');
      setSetup('Order Block Retest');
      setNotes('Waited for confirmation close on 15m timeframe.');
      setError(null);
    }
  }, [editingTrade, isAddTradeModalOpen]);

  // Auto-adjust PnL / status helper
  const handlePnlChange = (value: string) => {
    setPnl(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (num > 0) {
        setStatus('WIN');
        if (parseFloat(pnlR) <= 0) setPnlR('1.5');
      } else if (num < 0) {
        setStatus('LOSS');
        if (parseFloat(pnlR) >= 0) setPnlR('-1.0');
      } else {
        setStatus('BE');
        setPnlR('0.0');
      }
    }
  };

  if (!isAddTradeModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedEntryPrice = parseFloat(entryPrice);
    const parsedExitPrice = exitPrice ? parseFloat(exitPrice) : null;
    const parsedSize = parseFloat(size) || 1.0;
    const parsedPnl = parseFloat(pnl);
    const parsedPnlR = parseFloat(pnlR) || 0;

    if (!symbol.trim()) {
      setError('Symbol is required.');
      return;
    }
    if (isNaN(parsedEntryPrice) || parsedEntryPrice <= 0) {
      setError('Please provide a valid entry price.');
      return;
    }
    if (isNaN(parsedPnl)) {
      setError('Please provide a valid P&L ($) amount.');
      return;
    }

    const tradePayload = {
      symbol: symbol.toUpperCase().trim(),
      direction,
      entryDate: entryDate ? new Date(entryDate).toISOString() : new Date().toISOString(),
      entryPrice: parsedEntryPrice,
      exitPrice: parsedExitPrice,
      size: parsedSize,
      pnl: parsedPnl,
      pnlR: parsedPnlR,
      status,
      emotion,
      setup: setup.trim(),
      notes: notes.trim(),
      source: (editingTrade?.source || 'manual') as 'manual' | 'quant_engine'
    };

    if (editingTrade) {
      updateTrade(editingTrade.id, tradePayload);
    } else {
      addTrade(tradePayload);
    }

    closeAddTradeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#0b0f19] border border-slate-800 w-full max-w-xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-[#0e1422]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editingTrade ? 'Edit Trade Entry' : 'Log New Trade Entry'}
              </h3>
              <p className="text-xs text-slate-400">Syncs instantly with calendar, stats, and database engine</p>
            </div>
          </div>

          <button
            onClick={closeAddTradeModal}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Symbol & Direction Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Instrument / Symbol
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g. EURUSD, XAUUSD"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              {/* Presets */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['EURUSD', 'GBPUSD', 'XAUUSD', 'NAS100', 'USTEC', 'Crude Oil', 'BTCUSD'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSymbol(s)}
                    className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Direction
              </label>
              <div className="grid grid-cols-2 gap-2 h-9">
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    direction === 'LONG'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>LONG</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    direction === 'SHORT'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>SHORT</span>
                </button>
              </div>
            </div>
          </div>

          {/* Date & Time Row */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Date & Execution Timestamp
            </label>
            <input
              type="datetime-local"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Entry Price
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="1.0850"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Exit Price
              </label>
              <input
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="1.0890"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Position Size
              </label>
              <input
                type="number"
                step="0.01"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="1.0"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Financial Outcome Row: P&L ($) & R-Multiple & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#090d16] p-3 rounded-xl border border-slate-800/80">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Net P&L ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={pnl}
                onChange={(e) => handlePnlChange(e.target.value)}
                placeholder="+400 or -150"
                className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-black focus:outline-none ${
                  parseFloat(pnl) >= 0 ? 'text-emerald-400 focus:border-emerald-500' : 'text-rose-400 focus:border-rose-500'
                }`}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                R-Multiple
              </label>
              <input
                type="number"
                step="0.1"
                value={pnlR}
                onChange={(e) => setPnlR(e.target.value)}
                placeholder="2.0"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Outcome Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TradeStatus)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="WIN">WIN</option>
                <option value="LOSS">LOSS</option>
                <option value="BE">BE (Breakeven)</option>
                <option value="OPEN">OPEN</option>
              </select>
            </div>
          </div>

          {/* Emotion Tag Selector (Core Requirement) */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                Emotion Tag (Psychology Track)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Impacts Emotion Meter</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {EMOTIONS_LIST.map((em) => {
                const isSelected = emotion === em;
                const isPositive = ['Discipline', 'Confidence', 'Patience', 'Flow'].includes(em);

                return (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmotion(em)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      isSelected
                        ? (isPositive 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow' 
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow')
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {em}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Setup / Strategy Reason */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Setup / Execution Strategy
            </label>
            <input
              type="text"
              value={setup}
              onChange={(e) => setSetup(e.target.value)}
              placeholder="e.g. Liquidity Sweep, Fair Value Gap Fill, Break of Structure"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Trade Notes */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Trade Notes & Psychology Reflection
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reflect on your trade execution, rules adherence, and emotional state..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingTrade ? 'Update Trade Entry' : 'Log Trade Entry to Database'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
