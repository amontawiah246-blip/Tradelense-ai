import re

with open('server.ts', 'r') as f:
    code = f.read()

# Replace the WS logic in fetchLiveTick
new_logic = """
      // Request single history tick instead of live subscription due to restriction
      ws.send(JSON.stringify({ ticks_history: symbol, end: 'latest', count: 1, style: 'ticks' }));
    });

    ws.on('message', (raw: Buffer | string) => {
      try {
        const data = JSON.parse(raw.toString());
        clearTimeout(timeout);
        ws.close();

        if (data.error || !data.history || !data.history.prices || data.history.prices.length === 0) {
          resolve(null);
          return;
        }

        const price = data.history.prices[0];
        const epoch = data.history.times[0];
        resolve({
          bid: price,
          ask: price, // ticks_history does not give spread
          mid: price,
          epoch: epoch,
          symbol: symbol
        });
      } catch {
        resolve(null);
      }
    });
"""

code = re.sub(
    r"      // Request a single tick \(current price\) — not historical candles.*?      } catch \{.*?      \}\n    \}\);\n",
    new_logic.lstrip(),
    code,
    flags=re.DOTALL
)

with open('server.ts', 'w') as f:
    f.write(code)

