'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
        animate={{ opacity: isLoading ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900"
      >
        <div className="text-2xl text-gray-700 dark:text-gray-200">
          Loading...
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Stock Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {stocks.map((stock) => (
            <div 
              key={stock.symbol}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stock.symbol}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {stock.name}
                </span>
              </div>
              
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ${stock.price.toFixed(2)}
              </div>
              
              <div className={`flex items-center ${
                stock.change >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <span className="text-lg font-semibold">
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                </span>
                <span className="ml-2 text-sm">
                  ({stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination can be added here */}
        <div className="mt-8 flex justify-center">
          {/* Add pagination controls as needed */}
        </div>
      </motion.div>
    </>
  );
}
