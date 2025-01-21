'use client';

import { useEffect, useState } from 'react';
import { alpacaService } from '../api/alpaca';

interface MarketSchedule {
  timestamp: string;
  is_open: boolean;
  next_open: string;
  next_close: string;
}

export default function TestPage() {
  const [isMarketOpen, setIsMarketOpen] = useState<boolean | null>(null);
  const [marketSchedule, setMarketSchedule] = useState<MarketSchedule | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      };
      setCurrentTime(new Date().toLocaleTimeString('en-US', options));
    };

    // Set initial time
    updateTime();

    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check market status every minute
  useEffect(() => {
    const checkMarketStatus = async () => {
      try {
        const isOpen = await alpacaService.isMarketOpen();
        const schedule = await alpacaService.getMarketSchedule();
        
        setIsMarketOpen(isOpen);
        setMarketSchedule(schedule);
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
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl mb-2">Current Time (ET)</h2>
          <p className="text-lg font-mono">
            {currentTime || 'Loading...'}
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl mb-2">Market Status</h2>
          {isMarketOpen === null ? (
            <p>Loading...</p>
          ) : (
            <p className={`text-lg font-semibold ${isMarketOpen ? 'text-green-600' : 'text-red-600'}`}>
              Market is currently {isMarketOpen ? 'OPEN' : 'CLOSED'}
            </p>
          )}
        </div>

        {marketSchedule && (
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl mb-2">Schedule Information (ET)</h2>
            <div className="space-y-2">
              <p><strong>API Time:</strong> {formatDateTime(marketSchedule.timestamp)}</p>
              <p><strong>Next Open:</strong> {formatDateTime(marketSchedule.next_open)}</p>
              <p><strong>Next Close:</strong> {formatDateTime(marketSchedule.next_close)}</p>
            </div>
          </div>
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