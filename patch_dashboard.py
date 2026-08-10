import re

with open('src/components/Dashboard.tsx', 'r') as f:
    code = f.read()

# Replace the WS logic for Deriv
new_deriv_logic = """
    const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
    const openingPrices: Record<string, number> = {};
    let pollInterval: any;

    ws.onopen = () => {
      // Deriv restricts 'ticks' subscriptions for some symbols now,
      // but allows single tick history lookups without subscribe.
      const fetchPrices = () => {
        if (ws.readyState === WebSocket.OPEN) {
          Object.values(derivSymbolMap).forEach(symbol => {
            ws.send(JSON.stringify({
              ticks_history: symbol,
              end: 'latest',
              count: 1,
              style: 'ticks'
            }));
          });
        }
      };
      
      fetchPrices();
      pollInterval = setInterval(fetchPrices, 3000); // Poll every 3s
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.history && data.history.prices && data.history.prices.length > 0) {
        const derivSymbol = data.echo_req.ticks_history;
        const appSymbol = reverseSymbolMap[derivSymbol];
        if (appSymbol) {
          const quote = data.history.prices[0];
          
          if (!openingPrices[appSymbol]) {
            openingPrices[appSymbol] = quote;
          }
          const openPrice = openingPrices[appSymbol];
          const change = openPrice ? ((quote - openPrice) / openPrice) * 100 : 0;

          setLivePrices(prev => {
            const previousData = prev[appSymbol];
            const history = previousData?.history || [];
            // Only add if changed
            const lastQuote = history[history.length - 1];
            const newHistory = (lastQuote !== quote) ? [...history, quote].slice(-30) : history;
            
            return {
              ...prev,
              [appSymbol]: {
                bid: quote,
                ask: quote, // History doesn't provide spread, just use quote
                change: change,
                history: newHistory
              }
            };
          });
        }
      }
    };
    
    ws.onclose = () => {
      if (pollInterval) clearInterval(pollInterval);
    };
"""

# Find the block to replace
code = re.sub(
    r"const ws = new WebSocket\('wss://ws\.binaryws\.com/websockets/v3\?app_id=1089'\);\s+const openingPrices: Record<string, number> = {};(.*?)// Binance WebSocket Fallback for Crypto",
    new_deriv_logic.strip() + "\n\n    // Binance WebSocket Fallback for Crypto",
    code,
    flags=re.DOTALL
)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(code)

