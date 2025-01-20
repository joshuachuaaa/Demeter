// StockTypes.ts

export interface StockSubject {
    // Yesterday's data
    yesterday_time: string;    // ISO 8601 format timestamp
    yesterday_opening: number; // Open price
    yesterday_h: number;       // High price
    yesterday_l: number;       // Low price
    yesterday_closing: number; // Close price
    yesterday_v: number;       // Volume
  
    // Today's data
    today_time: string;    // ISO 8601 format timestamp
    today_opening: number; // Open price
    today_h: number;       // High price
    today_l: number;       // Low price
    today_c: number;       // Close price
    today_v: number;       // Volume
  
    // Current information
    currentPrice: number;  // Current stock price
    name: string;          // Full name of the company
    symbol: string;        // Stock symbol (e.g., AAPL for Apple)
    price_change: number;  // Absolute price change (currentPrice - yesterday_closing)
    price_change_percent: number; // Percentage price change
  }
  