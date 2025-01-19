'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './dashboard.css';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const stocksPerPage: number = 15;

  useEffect(() => {
    // Simulate loading data
    const fetchStocks = async () => {
      try {
        // Replace this with your actual API call
        const dummyStocks: Stock[] = [
          { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: 2.50, changePercent: 1.67 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2750.10, change: -5.20, changePercent: -0.19 },
          // Add more dummy stocks as needed
        ];

        setStocks(dummyStocks);
        setTimeout(() => setIsLoading(false), 1500); // Simulate loading delay
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setIsLoading(false);
      }
    };

    fetchStocks();
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="dashboard-container"
      >
        <h1 className="dashboard-title">
          Stock Dashboard
        </h1>
        
        <div className="stock-grid">
          {stocks.map((stock) => (
            <div 
              key={stock.symbol}
              className="stock-card"
            >
              <div className="stock-header">
                <h3 className="stock-symbol">
                  {stock.symbol}
                </h3>
                <span className="stock-name">
                  {stock.name}
                </span>
              </div>
              
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
          ))}
        </div>

        <div className="pagination-container">
          {/* Add pagination controls as needed */}
        </div>
      </motion.div>
    </>
  );
}
