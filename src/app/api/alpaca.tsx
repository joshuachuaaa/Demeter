import axios from 'axios';
import { STOCKS_LIST } from '../stock/stocks';
import { StockSubject } from '../stock/stocktypes';

export const TRACKED_STOCKS = STOCKS_LIST;

interface MarketStatus {
  clock: {
    timestamp: string;
    is_open: boolean;
    next_open: string;
    next_close: string;
  };
}

class AlpacaService {
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY || '';
    this.secretKey = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY || '';
    this.baseUrl = 'https://data.alpaca.markets/v2';
  }

  async getPreviousDayClose(): Promise<StockSubject[] | null> {

      // Calculate yesterday's date in ISO 8601 format
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];

    try {
      const updatedStocks = await Promise.all(
        TRACKED_STOCKS.map(async (trackedStock) => {
          const response = await axios.get(`${this.baseUrl}/stocks/${trackedStock.symbol}/bars`, {
            headers: {
              'APCA-API-KEY-ID': this.apiKey,
              'APCA-API-SECRET-KEY': this.secretKey,
            },
            params: {
              timeframe: '1Day',
              start: yesterdayISO, // Start date is yesterday
              end: yesterdayISO,   // End date is also yesterday
              limit: 1,            // Only fetch one bar
            },
          });

          // Extract yesterday's closing price from the response
          const bars = response.data.bars;
          const yesterdayClosing = bars && bars.length > 0 ? bars[0].c : null;

          return {
            ...trackedStock,
            yesterday_closing: yesterdayClosing,
          };
        })
      );
      return updatedStocks;
    } catch (error) {
      console.error("Error fetching yesterday's closing prices:", error);
      return null;
    }
  }

  async updateStockPrices(): Promise<StockSubject[]> {
    try {
      const updatedStocks = await Promise.all(
        TRACKED_STOCKS.map(async (trackedStock) => {
          const response = await axios.get(`${this.baseUrl}/stocks/${trackedStock.symbol}/trades/latest`, {
            headers: {
              'APCA-API-KEY-ID': this.apiKey,
              'APCA-API-SECRET-KEY': this.secretKey,
            },
          });

          const currentPrice = response.data.trade.p;
          const yesterdayClosing = trackedStock.yesterday_closing ?? 0;
          const priceChange = currentPrice - yesterdayClosing;

          // Safely calculate the percentage change
          const priceChangePercent =
            yesterdayClosing !== 0 ? (priceChange / yesterdayClosing) * 100 : 0;

          return {
            ...trackedStock,
            currentPrice,
            price_change: priceChange,
            price_change_percent: priceChangePercent,
          };
        })
      );
      return updatedStocks;
    } catch (error) {
      console.error('Error updating stock prices:', error);
      return []; // Return an empty array in case of an error
    }
  }

  async isMarketOpen(): Promise<boolean> {
    try {
      const response = await axios.get<MarketStatus>(
        'https://api.alpaca.markets/v2/clock',
        {
          headers: {
            'APCA-API-KEY-ID': this.apiKey,
            'APCA-API-SECRET-KEY': this.secretKey,
          },
        }
      );
      
      // The response data doesn't have a nested clock property
      return response.data.is_open;
    } catch (error) {
      console.error('Error checking market status:', error);
      return false; // Default to closed on error
    }
  }

  async getMarketSchedule(): Promise<MarketStatus['clock'] | null> {
    try {
      const response = await axios.get<MarketStatus>(
        'https://api.alpaca.markets/v2/clock',
        {
          headers: {
            'APCA-API-KEY-ID': this.apiKey,
            'APCA-API-SECRET-KEY': this.secretKey,
          },
        }
      );
      
      // Return the direct response data
      return {
        timestamp: response.data.timestamp,
        is_open: response.data.is_open,
        next_open: response.data.next_open,
        next_close: response.data.next_close
      };
    } catch (error) {
      console.error('Error fetching market schedule:', error);
      return null;
    }
  }
}

export const alpacaService = new AlpacaService();
