"use client"

import { useEffect, useState } from 'react';
import './loading.css';

const logoPath = '/logo.svg';

interface LoadingProps {
  onLoadingComplete: () => void;
}

const Loading = ({ onLoadingComplete }: LoadingProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    const completeTimer = setTimeout(() => {
      onLoadingComplete();
    }, 2500); // Give extra time for the fade out animation

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(completeTimer);
    };
  }, [onLoadingComplete]);

  return (
    <div className={`loading-container ${!isLoading ? 'loading-container--hidden' : ''}`}>
      <img 
        src={logoPath} 
        alt="Logo"
        className="loading-logo"
      />
    </div>
  );
};

export default Loading;
