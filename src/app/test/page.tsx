'use client';

import { useEffect, useState } from 'react';

interface MarketData {
  is_open: boolean;
  next_open: string;
  next_close: string;
  local_time: string;
  last_updated: string;
}

export default function TestPage() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check market status every minute
  useEffect(() => {
    const checkMarketStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/market');
        const data = await response.json();
        setMarketData(data);
      } catch (err) {
        console.error('Error checking market status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Market Status Test</h1>
      
      <div className="space-y-4">
        {marketData && (
          <>
            <div className="p-4 border rounded-lg">
              <h2 className="text-xl mb-2">Local Time (ET)</h2>
              <p className="text-lg font-mono">
                {marketData.local_time}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="text-xl mb-2">Market Status</h2>
              <p className={`text-lg font-semibold ${marketData.is_open ? 'text-green-600' : 'text-red-600'}`}>
                Market is currently {marketData.is_open ? 'OPEN' : 'CLOSED'}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="text-xl mb-2">Schedule Information (ET)</h2>
              <div className="space-y-2">
                <p><strong>Last Updated:</strong> {formatDateTime(marketData.last_updated)}</p>
                <p><strong>Next Open:</strong> {formatDateTime(marketData.next_open)}</p>
                <p><strong>Next Close:</strong> {formatDateTime(marketData.next_close)}</p>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="p-4 border rounded-lg bg-red-50">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}