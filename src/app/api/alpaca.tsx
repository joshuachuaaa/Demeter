import axios from 'axios';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  logo?: string;
}

// Common company names mapping
export const COMPANY_NAMES: { [key: string]: string } = {
  'AAPL': 'Apple Inc.',
//   'GOOGL': 'Alphabet Inc.',
//   'MSFT': 'Microsoft Corporation',
//   'AMZN': 'Amazon.com Inc.',
//   'META': 'Meta Platforms Inc.',
//   'TSLA': 'Tesla Inc.',
//   'NVDA': 'NVIDIA Corporation',
//   'JPM': 'JPMorgan Chase & Co.',
//   'V': 'Visa Inc.',
//   'MA': 'Mastercard Inc.',
};

export const TRACKED_STOCKS = Object.keys(COMPANY_NAMES);

class AlpacaService {
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY || '';
    this.secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY || '';
    this.baseUrl = 'https://data.alpaca.markets/v2';
  }

  async getAppleStock(): Promise<number | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/stocks/AAPL/trades/latest`, {
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.secretKey,
        }
      });

      console.log('Alpaca Response:', response.data); // Let's see what we get back
      return response.data.trade.p || null;
    } catch (error) {
      console.error('Error fetching Apple stock:', error);
      return null;
    }
  }

  async getStockQuote(symbol: string): Promise<StockData | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/stocks/${symbol}/trades/latest`, {
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.secretKey,
        }
      });

      const trade = response.data.trade;
      
      return {
        symbol,
        name: COMPANY_NAMES[symbol],
        price: trade.p,
        change: trade.price_change,
        changePercent: trade.price_change_percent,
        logo: `/logos/${symbol.toLowerCase()}.svg`
      };
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return null;
    }
  }

  async getAllStockData(): Promise<StockData[]> {
    try {
      const promises = TRACKED_STOCKS.map(symbol => this.getStockQuote(symbol));
      const results = await Promise.all(promises);
      return results.filter((result): result is StockData => result !== null);
    } catch (error) {
      console.error('Error in getAllStockData:', error);
      return [];
    }
  }
}

export const alpacaService = new AlpacaService(); 