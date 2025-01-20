'use client';

import { useEffect, useState } from 'react';
import { alpacaService } from '../api/alpaca';

export default function TestPage() {
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        console.log('Fetching price...');
        const applePrice = await alpacaService.getAppleStock();
        console.log('Received price:', applePrice);
        setPrice(applePrice);
      } catch (err) {
        console.error('Error in fetchPrice:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    fetchPrice();
    // Set up an interval to fetch price every 5 seconds
    //const interval = setInterval(fetchPrice, 5000);

    // // Cleanup interval on component unmount
    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Apple Stock Price Test</h1>
      <p className="text-xl">
        Current Price: {price ? `$${price.toFixed(2)}` : 'Loading...'}
      </p>
      {error && (
        <p className="text-red-500 mt-2">
          Error: {error}
        </p>
      )}
    </div>
  );
} 