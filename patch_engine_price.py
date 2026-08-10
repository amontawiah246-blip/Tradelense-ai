import re

with open('engine.py', 'r') as f:
    code = f.read()

new_logic = """
def fetch_current_price_deriv(asset):
    \"\"\"
    Fetch current price AND recent candle data for outcome verification.
    Uses the local Node.js server proxy which handles WebSocket caching.
    \"\"\"
    try:
        url = f'http://localhost:3000/api/candles?asset={asset}&granularity=300&count=288'
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            
            if not data or len(data) == 0:
                return None
                
            # data is a list of candles: {epoch, open, high, low, close, date}
            # Deriv candles returned from our TS server have these keys.
            current_price = data[-1]['close']
            
            # format for outcome checker
            formatted_candles = []
            for c in data[-12:]: # Last 12 candles = 1 hour
                formatted_candles.append({
                    'epoch': c['epoch'],
                    'open': c['open'],
                    'high': c['high'],
                    'low': c['low'],
                    'close': c['close']
                })
                
            return {
                'current_price': current_price,
                'recent_candles': formatted_candles
            }
    except Exception as e:
        print(f"Error fetching current price for {asset} from local API: {e}")
        return None
"""

code = re.sub(
    r"def fetch_current_price_deriv\(asset\):.*?        return None\n",
    new_logic.strip() + "\n",
    code,
    flags=re.DOTALL
)

with open('engine.py', 'w') as f:
    f.write(code)

