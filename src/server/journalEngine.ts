import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { generateDefaultTrades } from '../data/sampleTrades';
import { JournalTrade } from '../types/journal';

// In-memory fallback cache to ensure instant reactivity and stability
let cachedTrades: JournalTrade[] = generateDefaultTrades();

export async function getJournalTrades(fbDb: any): Promise<JournalTrade[]> {
  if (!fbDb) {
    return cachedTrades;
  }

  try {
    const colRef = collection(fbDb, 'trades');
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      // Seed Firestore with realistic sample trades
      console.log('Seeding initial trades into Firestore collection "trades"...');
      const defaults = generateDefaultTrades();
      for (const t of defaults) {
        try {
          await setDoc(doc(fbDb, 'trades', t.id), {
            ...t,
            createdAt: t.createdAt || new Date().toISOString()
          });
        } catch (e) {
          // ignore individual write error
        }
      }
      cachedTrades = defaults;
      return defaults;
    }

    const trades: JournalTrade[] = [];
    snapshot.forEach(docSnap => {
      const d = docSnap.data() as any;
      trades.push({
        id: docSnap.id,
        symbol: d.symbol || 'EURUSD',
        direction: d.direction || 'LONG',
        entryDate: d.entryDate || new Date().toISOString(),
        entryPrice: d.entryPrice ?? 0,
        exitPrice: d.exitPrice ?? null,
        size: d.size ?? 1.0,
        pnl: d.pnl ?? 0,
        pnlR: d.pnlR ?? 0,
        status: d.status || 'WIN',
        emotion: d.emotion || 'Discipline',
        notes: d.notes || '',
        source: d.source || 'manual',
        setup: d.setup || '',
        createdAt: d.createdAt || new Date().toISOString()
      });
    });

    cachedTrades = trades;
    return trades;
  } catch (error) {
    console.warn('Error reading from Firestore trades collection, using memory cache:', error);
    return cachedTrades;
  }
}

export async function saveJournalTrade(fbDb: any, trade: JournalTrade): Promise<JournalTrade> {
  const tradeWithMeta: JournalTrade = {
    ...trade,
    createdAt: trade.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Update in-memory
  const existingIndex = cachedTrades.findIndex(t => t.id === trade.id);
  if (existingIndex >= 0) {
    cachedTrades[existingIndex] = tradeWithMeta;
  } else {
    cachedTrades.unshift(tradeWithMeta);
  }

  if (fbDb) {
    try {
      await setDoc(doc(fbDb, 'trades', trade.id), {
        ...tradeWithMeta,
        timestamp: serverTimestamp()
      });
    } catch (err: any) {
      console.warn('Failed to write trade to Firestore:', err.message);
    }
  }

  return tradeWithMeta;
}

export async function updateJournalTrade(fbDb: any, id: string, updates: Partial<JournalTrade>): Promise<boolean> {
  // Update in-memory
  const index = cachedTrades.findIndex(t => t.id === id);
  if (index >= 0) {
    cachedTrades[index] = { ...cachedTrades[index], ...updates, updatedAt: new Date().toISOString() };
  }

  if (fbDb) {
    try {
      await updateDoc(doc(fbDb, 'trades', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.warn('Failed to update trade in Firestore:', err.message);
    }
  }

  return true;
}

export async function deleteJournalTrade(fbDb: any, id: string): Promise<boolean> {
  cachedTrades = cachedTrades.filter(t => t.id !== id);

  if (fbDb) {
    try {
      await deleteDoc(doc(fbDb, 'trades', id));
    } catch (err: any) {
      console.warn('Failed to delete trade in Firestore:', err.message);
    }
  }

  return true;
}

export async function syncEngineSignalsToJournal(
  fbDb: any, 
  signals: any[]
): Promise<{ syncedCount: number; trades: JournalTrade[] }> {
  let count = 0;
  if (!Array.isArray(signals)) {
    return { syncedCount: 0, trades: cachedTrades };
  }

  for (const sig of signals) {
    if (!sig || !sig.outcome || sig.outcome === 'OPEN' || sig.outcome === 'PENDING') {
      continue;
    }

    const tradeId = `sig_trade_${sig.id}`;
    const isWin = sig.outcome === 'WIN';
    const isLoss = sig.outcome === 'LOSS';
    const pnlMultiplier = isWin ? 1 : -1;
    const pnl = sig.pnl_atr ? sig.pnl_atr * 1000 : (isWin ? 1500 : -1000);
    const pnlR = sig.expected_value_r ? sig.expected_value_r : (isWin ? 2.0 : -1.0);

    const emotion = isWin 
      ? (sig.score && sig.score > 80 ? 'Confidence' : 'Discipline')
      : (sig.verdict === 'AVOID' ? 'FOMO' : 'Discipline');

    const syncedTrade: JournalTrade = {
      id: tradeId,
      symbol: sig.asset || 'EURUSD',
      direction: sig.direction === 'SHORT' || sig.direction === 'SELL' ? 'SHORT' : 'LONG',
      entryDate: sig.timestamp || new Date().toISOString(),
      entryPrice: sig.entry_low || sig.current_price_at_signal || 1.0,
      exitPrice: sig.exit_price || sig.tp1 || sig.sl || null,
      size: 1.0,
      pnl: parseFloat(pnl.toFixed(2)),
      pnlR: parseFloat(pnlR.toFixed(2)),
      status: isWin ? 'WIN' : (isLoss ? 'LOSS' : 'BE'),
      emotion: emotion as any,
      notes: sig.notes || `Synced from Quant-X Institutional Engine. Verdict: ${sig.verdict || 'EXECUTE'}. Confluence Score: ${sig.score || 'N/A'}.`,
      source: 'quant_engine',
      setup: `${sig.mode || 'SMC'} [${sig.regime || 'Institutional'}]`,
      signalId: sig.id,
      createdAt: sig.timestamp || new Date().toISOString()
    };

    await saveJournalTrade(fbDb, syncedTrade);
    count++;
  }

  const allTrades = await getJournalTrades(fbDb);
  return { syncedCount: count, trades: allTrades };
}

export function resetJournalSampleData(): JournalTrade[] {
  cachedTrades = generateDefaultTrades();
  return cachedTrades;
}
