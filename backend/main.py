from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.websockets import WebSocketDisconnect
import json
import os
from dotenv import load_dotenv
from datetime import datetime
import pytz
import asyncio
import websockets
import requests

load_dotenv()
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALPACA_KEY = os.getenv("ALPACA_API_KEY")
ALPACA_SECRET = os.getenv("ALPACA_SECRET_KEY")
DATA_WS_URL = "wss://stream.data.alpaca.markets/v2/iex"
REST_URL = "https://api.alpaca.markets/v2/clock"

class Stock:
    def __init__(self, symbol):
        self.symbol = symbol
        self.current_price = None
        self.prev_close = None

# Global state
stocks = {
    "AAPL": Stock("AAPL"),
    "MSFT": Stock("MSFT"),
    "GOOGL": Stock("GOOGL"),
    "AMZN": Stock("AMZN"),
    "TSLA": Stock("TSLA"),
    "NVDA": Stock("NVDA"),
    "META": Stock("META"),
    "NFLX": Stock("NFLX"),
}

market_data = {
    "is_open": False,
    "next_open": None,
    "next_close": None,
    "local_time": None,
    "last_updated": None
}

def get_local_time():
    et_tz = pytz.timezone('US/Eastern')
    return datetime.now(et_tz).strftime('%I:%M:%S %p ET')

def check_market_status():
    print("\nChecking market status...")
    headers = {
        "APCA-API-KEY-ID": ALPACA_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET
    }
    
    try:
        response = requests.get(REST_URL, headers=headers)
        data = response.json()
        market_data["is_open"] = data.get('is_open')
        market_data["next_open"] = data.get('next_open')
        market_data["next_close"] = data.get('next_close')
        market_data["local_time"] = get_local_time()
        market_data["last_updated"] = datetime.now().isoformat()
        return market_data
    except Exception as e:
        print(f"Error checking market status: {e}")
        return None

def get_previous_closes():
    """Get previous day's closing prices"""
    print("\n=== Getting Previous Closing Prices ===")
    
    # Get yesterday's date properly
    from datetime import datetime, timedelta
    end = datetime.now()
    # Go back 2 days to ensure we get the last complete trading day
    start = end - timedelta(days=1)
    
    # Format dates properly
    start_date = start.strftime('%Y-%m-%d')
    end_date = end.strftime('%Y-%m-%d')
    
    # Get all stocks in one request
    symbols = ','.join(stocks.keys())
    url = f"https://data.alpaca.markets/v2/stocks/bars?symbols={symbols}&timeframe=1D&start={start_date}&end={end_date}&feed=iex"
    
    headers = {
        "APCA-API-KEY-ID": ALPACA_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET
    }
    
    try:
        print("\n📊 Making API call for historical bars...")
        print(f"URL: {url}")
        print(f"Date Range: {start_date} to {end_date}")
        print(f"Symbols: {symbols}")
        
        response = requests.get(url, headers=headers)
        print(f"\n📡 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n🔍 Raw API Response:")
            print("=" * 50)
            print(json.dumps(data, indent=2))
            print("=" * 50)
            
            print("\n📈 Processed Data:")
            for symbol, bars in data.get('bars', {}).items():
                print(f"\n{symbol}:")
                if bars and len(bars) > 0:
                    # Get the second to last bar if available (yesterday's close)
                    # If only one bar is available, use that one
                    bar_to_use = bars[-2] if len(bars) > 1 else bars[-1]
                    stocks[symbol].prev_close = bar_to_use['c']
                    print(f"  Timestamp: {bar_to_use['t']}")
                    print(f"  Open:      ${bar_to_use['o']:.2f}")
                    print(f"  High:      ${bar_to_use['h']:.2f}")
                    print(f"  Low:       ${bar_to_use['l']:.2f}")
                    print(f"  Close:     ${bar_to_use['c']:.2f}")
                    print(f"  Volume:    {bar_to_use['v']:,}")
                else:
                    print("  ❌ No data available")
        else:
            print(f"\n❌ Error Response:")
            print(f"Status Code: {response.status_code}")
            print(f"Response Text: {response.text}")
                
    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        if hasattr(e, 'response'):
            print(f"Response Status: {e.response.status_code}")
            print(f"Response Text: {e.response.text}")
    
    print("\n=== Previous Day Closing Prices Summary ===")
    for symbol, stock in stocks.items():
        print(f"{symbol}: ${stock.prev_close:.2f}" if stock.prev_close else f"{symbol}: No data")
    print("==========================================\n")

# Keep track of connected clients
connected_clients = set()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    try:
        while True:
            # Just keep the connection alive
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        print("Client disconnected")
    except Exception as e:
        connected_clients.remove(websocket)
        print(f"WebSocket error: {e}")

# Modify your existing price feed to broadcast to all clients
async def start_price_feed():
    check_market_status()
    get_previous_closes()
    
    print("\nConnecting to Alpaca WebSocket...")
    try:
        async with websockets.connect(DATA_WS_URL) as ws:
            # Auth
            auth_msg = {
                "action": "auth",
                "key": ALPACA_KEY,
                "secret": ALPACA_SECRET
            }
            await ws.send(json.dumps(auth_msg))
            auth_response = await ws.recv()
            print(f"Auth response: {auth_response}")

            # Subscribe to trades
            subscribe_msg = {
                "action": "subscribe",
                "trades": list(stocks.keys())
            }
            await ws.send(json.dumps(subscribe_msg))
            sub_response = await ws.recv()
            print(f"Subscription response: {sub_response}")

            print("\nStarting to receive price updates...")
            while True:
                msg = await ws.recv()
                data = json.loads(msg)
                if isinstance(data, list):
                    for item in data:
                        if item.get('T') == 't':
                            symbol = item['S']
                            if symbol in stocks:
                                stocks[symbol].current_price = item['p']
                                print(f"💰 {symbol}: ${item['p']:.2f}")
                                
                                # Broadcast to all connected clients
                                stock_data = {
                                    symbol: {
                                        "current_price": stocks[symbol].current_price,
                                        "prev_close": stocks[symbol].prev_close
                                    }
                                }
                                # Broadcast the update to all connected clients
                                for client in connected_clients.copy():
                                    try:
                                        await client.send_json(stock_data)
                                    except:
                                        connected_clients.remove(client)
                
    except Exception as e:
        print(f"WebSocket error: {e}")
        await asyncio.sleep(5)
        asyncio.create_task(start_price_feed())

# API Endpoints
@app.get("/api/stocks")
async def get_stocks():
    """Get all stock data"""
    return {
        symbol: {
            "current_price": stock.current_price,
            "prev_close": stock.prev_close
        } for symbol, stock in stocks.items()
    }

@app.get("/api/market")
async def get_market():
    """Get market status"""
    return check_market_status()

@app.get("/")
async def root():
    return {"message": "Server is running"}

# Startup Event
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(start_price_feed())