'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './dashboard.css';
import { StockSubject } from '../stock/stocktypes';
import { STOCKS_LIST } from '../stock/stocks';

export default function Dashboard() {
  // Initialize with STOCKS_LIST to always have the basic stock data
  const [stocks, setStocks] = useState<StockSubject[]>(
    STOCKS_LIST.map(stock => ({
      ...stock,
      currentPrice: 0,
      yesterday_closing: 0,
      price_change: 0,
      price_change_percent: 0,
      today_time: new Date().toISOString(),
      yesterday_time: new Date().toISOString(),
    }))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    // Fetch initial data first
    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/stocks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'same-origin'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateStocksData(data);
        setLoading(false);
        
        // Only connect WebSocket after initial data is loaded
        connectWebSocket();
      } catch (error) {
        console.error('Error fetching initial stock data:', error);
        setError('Failed to fetch stock data');
        setLoading(false);
      }
    };

    const connectWebSocket = () => {
      if (ws?.readyState === WebSocket.OPEN) return;
      
      ws = new WebSocket('ws://localhost:8000/ws');

      ws.onopen = () => {
        console.log('WebSocket Connected');
        reconnectAttempts = 0;
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateStocksData(data);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);
          setTimeout(connectWebSocket, 3000);
        } else {
          setError('WebSocket connection failed after multiple attempts');
        }
      };
    };

    const updateStocksData = (data: any) => {
      setStocks(prevStocks => {
        return prevStocks.map(stock => {
          const stockData = data[stock.symbol];
          if (!stockData) return stock;

          const currentPrice = stockData.current_price ?? stock.currentPrice ?? 0;
          const prevClose = stockData.prev_close ?? stock.yesterday_closing ?? 0;
          const priceChange = currentPrice - prevClose;
          const priceChangePercent = prevClose !== 0 ? (priceChange / prevClose) * 100 : 0;

          return {
            ...stock,
            currentPrice,
            yesterday_closing: prevClose,
            price_change: priceChange,
            price_change_percent: priceChangePercent,
            today_time: new Date().toISOString(),
          };
        });
      });
    };

    // Start with initial data fetch
    fetchInitialData();

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2 className="error-title">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: loading ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="dashboard-container"
    >
      <h1 className="dashboard-title">Stock Dashboard</h1>
      
      {loading ? (
        <div className="loading-indicator">Loading stocks...</div>
      ) : (
        <>
          <div className="stock-list">
            {stocks.map((stock) => (
              <div key={stock.symbol} className="stock-row">
                <div className="stock-info-container">
                  <div className="stock-logo">
                    <img src={stock.logo} alt={stock.name} className="stock-logo-image" />
                  </div>
                  <div className="stock-details">
                    <div>
                      <div className="stock-name">{stock.name}</div>
                      <div className="stock-symbol">{stock.symbol}</div>
                    </div>
                    <div className="stock-price">
                      ${stock.currentPrice?.toFixed(2)}
                    </div>
                    <div className={`stock-change ${(stock.price_change ?? 0) >= 0 ? 'positive' : 'negative'}`}>
                      <span className="change-amount">
                        {(stock.price_change ?? 0) >= 0 ? '+' : ''}{stock.price_change?.toFixed(2)}
                      </span>
                      <span className="change-percent">
                        ({(stock.price_change_percent ?? 0).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
