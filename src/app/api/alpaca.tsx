const ALPACA_API_KEY = process.env.NEXT_PUBLIC_ALPACA_API_KEY;
const ALPACA_SECRET_KEY = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY;
const BASE_URL = 'https://data.alpaca.markets/v2';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  logo?: string;
}

// Common company names mapping
const COMPANY_NAMES: { [key: string]: string } = {
  'AAPL': 'Apple Inc.',
  'GOOGL': 'Alphabet Inc.',
  'MSFT': 'Microsoft Corporation',
  'AMZN': 'Amazon.com Inc.',
  'META': 'Meta Platforms Inc.',
  'TSLA': 'Tesla Inc.',
  'NVDA': 'NVIDIA Corporation',
  'JPM': 'JPMorgan Chase & Co.',
  'V': 'Visa Inc.',
  'WMT': 'Walmart Inc.',
  'JNJ': 'Johnson & Johnson',
  'PG': 'Procter & Gamble Co.',
  'MA': 'Mastercard Inc.',
  'UNH': 'UnitedHealth Group Inc.',
  'HD': 'Home Depot Inc.'
};

export const TRACKED_STOCKS = Object.keys(COMPANY_NAMES);

export const alpacaService = {
  async getStockQuote(symbol: string): Promise<StockData | null> {
    try {
      const response = await fetch(
        `${BASE_URL}/stocks/${symbol}/trades/latest`, {
          headers: {
            'APCA-API-KEY-ID': ALPACA_API_KEY!,
            'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY!
          }
        }
      );
      const data = await response.json();
      
      // Get previous day's close
      const prevDay = await fetch(
        `${BASE_URL}/stocks/${symbol}/bars/1Day?limit=2`, {
          headers: {
            'APCA-API-KEY-ID': ALPACA_API_KEY!,
            'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY!
          }
        }
      );
      const barData = await prevDay.json();
      
      const currentPrice = data.trade.p;
      const previousClose = barData.bars[0].c;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        symbol,
        name: COMPANY_NAMES[symbol],
        price: currentPrice,
        change,
        changePercent,
        logo: `/logos/${symbol.toLowerCase()}.svg` // Assuming you have logo files
      };
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return null;
    }
  },

  async getAllStockData(): Promise<StockData[]> {
    const promises = TRACKED_STOCKS.map(symbol => this.getStockQuote(symbol));
    const results = await Promise.all(promises);
    return results.filter((result): result is StockData => result !== null);
  }
}; 