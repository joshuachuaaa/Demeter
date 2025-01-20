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
  logo?: string;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const stocksPerPage: number = 15;

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const dummyStocks: Stock[] = [
          { 
            symbol: 'AAPL', 
            name: 'Apple Inc.', 
            price: 150.25, 
            change: 2.50, 
            changePercent: 1.67,
            logo: '/stock-logos/aapl.png'
          },
          { 
            symbol: 'GOOGL', 
            name: 'Alphabet Inc.', 
            price: 2750.10, 
            change: -5.20, 
            changePercent: -0.19,
            logo: '/stock-logos/googl.png'
          },
          // Add more dummy stocks as needed
        ];

        setStocks(dummyStocks);
        setTimeout(() => setIsLoading(false), 1500);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setIsLoading(false);
      }
    };

    fetchStocks();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="dashboard-container"
    >
      <h1 className="dashboard-title">Stock Dashboard</h1>
      
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

              <div className="stock-price">
                ${stock.price.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-container">
      </div>
    </motion.div>
  );
}
