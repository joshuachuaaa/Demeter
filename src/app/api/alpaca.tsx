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

  async initializeStocks() : Promise<StockSubject[] | null>{
    try {
      const updatedStocks = Promise.all(
        TRACKED_STOCKS.map(async (trackedStock)=>{
          const response = await axios.get(`${this.baseUrl}/stocks/${trackedStock.symbol}/trades/latest`, {
            headers: {
              'APCA-API-KEY-ID': this.apiKey,
              'APCA-API-SECRET-KEY': this.secretKey,
            }
          });
          return {
            ...trackedStock,
            currentPrice:response.data.trade.p
          }
        })
    )
    return updatedStocks;
  } catch (error) {
    console.error('Error initializing stocks:', error);
    return []; // Return an empty array in case of an error
  }
}
}

export const alpacaService = new AlpacaService(); 

// async getAppleStock(): Promise<number | null> {
//   try {
//     const response = await axios.get(`${this.baseUrl}/stocks/AAPL/trades/latest`, {
//       headers: {
//         'APCA-API-KEY-ID': this.apiKey,
//         'APCA-API-SECRET-KEY': this.secretKey,
//       }
//     });

//     console.log('Alpaca Response:', response.data); // Let's see what we get back
//     return response.data.trade.p || null;
//   } catch (error) {
//     console.error('Error fetching Apple stock:', error);
//     return null;
//   }
// }