'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TRACKED_STOCKS, alpacaService } from '../api/alpaca';
import './dashboard.css';
import { StockSubject } from '../stock/stocktypes';

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const stocksPerPage: number = 10;

  // Calculate visible stock symbols
  const startIndex = (currentPage - 1) * stocksPerPage;
  const endIndex = startIndex + stocksPerPage;
  const visibleSymbols = TRACKED_STOCKS.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchVisibleStocks = async () => {
      try {
        const stockData = await alpacaService.getAllStockData();
        setStocks(stockData);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchVisibleStocks();

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchVisibleStocks, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
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
                  {stock.logo && (
                    <div className="stock-logo">
                      <img 
                        src={stock.logo} 
                        alt={`${stock.name} logo`}
                        className="stock-logo-image"
                      />
                    </div>
                  )}
                  
                  <div className="stock-details">
                    <span className="stock-name">{stock.name}</span>
                    <span className="stock-symbol">{stock.symbol}</span>
                  </div>

                  <div className="stock-price-info">
                    <div className="stock-price">
                      ${stock.price.toFixed(2)}
                    </div>
                    <div className={`stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                      <span className="change-amount">
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                      </span>
                      <span className="change-percent">
                        ({stock.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {Math.ceil(TRACKED_STOCKS.length / stocksPerPage) > 1 && (
            <div className="pagination-container">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {Math.ceil(TRACKED_STOCKS.length / stocksPerPage)}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => 
                  Math.min(prev + 1, Math.ceil(TRACKED_STOCKS.length / stocksPerPage))
                )}
                disabled={currentPage === Math.ceil(TRACKED_STOCKS.length / stocksPerPage)}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
