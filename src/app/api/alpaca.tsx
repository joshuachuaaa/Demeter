import axios from 'axios';
import { STOCKS_LIST } from '../stock/stocks';


export const TRACKED_STOCKS = STOCKS_LIST

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
}

export const alpacaService = new AlpacaService(); 