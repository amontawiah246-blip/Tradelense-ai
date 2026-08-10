import engine
import urllib.request
import json

symbol = 'frxEURUSD'
try:
    url = f'https://api.deriv.com/websockets/v3?ticks_history={symbol}&end=latest&count=2&style=candles&granularity=300&app_id=1089'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    data = json.loads(response.read().decode('utf-8'))
    print(data)
except Exception as e:
    print(f"Error: {e}")
