import axios from 'axios';
import { STOCKS_LIST } from '../stock/stocks';
import { StockSubject } from '../stock/stocktypes';


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

  async getPreviousDayClose() : Promise<StockSubject[] | null>{
    try {
      const updatedStocks = Promise.all(
        TRACKED_STOCKS.map(async (trackedStock)=>{
          const response = await axios.get(`${this.baseUrl}/stocks/${trackedStock.symbol}/bars`, {
            headers: {
              'APCA-API-KEY-ID': this.apiKey,
              'APCA-API-SECRET-KEY': this.secretKey,
            }
          });
          return {
            ...trackedStock,
            yesterday_closing:response.data.bars.c
          }
        })
      )
      return updatedStocks;
      }
      catch(error){
        console.error("Error fetching yesterday's closing");
        return null;
      }
    
}

  async updateStockPrices() {
    try {
      const updatedStocks = Promise.all(
        TRACKED_STOCKS.map(async (trackedStock)=>{
          const response = await axios.get(`${this.baseUrl}/stocks/${trackedStock.symbol}/trades/latest`, {
            headers: {
              'APCA-API-KEY-ID': this.apiKey,
              'APCA-API-SECRET-KEY': this.secretKey,
            }
          });
          const currentPrice = response.data.trade.p
          const yesterdayClosing = trackedStock.yesterday_closing ?? 0;
          const price_change = currentPrice - yesterdayClosing;
          const price_change_percent = (price_change /yesterdayClosing) * 100

          return {
            ...trackedStock,
            currentPrice,
            price_change,
            price_change_percent
          }
        })
    )
    return updatedStocks;
  } catch (error) {
    console.error('Error updating stocks:', error);
    return []; // Return an empty array in case of an error
  }
}
}
export const alpacaService = new AlpacaService(); 
