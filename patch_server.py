import re

with open('server.ts', 'r') as f:
    code = f.read()

new_logic = """
  app.get('/api/live-price', async (req, res) => {
    const asset  = (req.query.asset as string || '').toUpperCase();
    const symbol = DERIV_SYMBOLS[asset];
    if (!symbol) return res.status(400).json({ error: 'Unknown asset' });

    const tick = await fetchLiveTick(symbol);
    if (!tick) return res.status(503).json({ error: 'Price unavailable' });

    res.json({
      asset,
      bid:    tick.bid,
      ask:    tick.ask,
      mid:    tick.mid,
      epoch:  tick.epoch,
      change: 0
    });
  });

  app.get('/api/candles', async (req, res) => {
    const asset = (req.query.asset as string || '').toUpperCase();
    const granularity = parseInt(req.query.granularity as string) || 300;
    const count = parseInt(req.query.count as string) || 288;
    const symbol = DERIV_SYMBOLS[asset] || asset;
    
    try {
      const candles = await fetchCachedCandles(symbol, granularity, count);
      res.json(candles);
    } catch(e:any) {
      res.status(500).json({error: e.message});
    }
  });

  app.get('/api/performance', async(req,res) => {
"""

code = re.sub(
    r"  app\.get\('/api/live-price'.*?  app\.get\('/api/performance', async\(req,res\) => \{",
    new_logic.strip() + " {",
    code,
    flags=re.DOTALL
)

with open('server.ts', 'w') as f:
    f.write(code)

