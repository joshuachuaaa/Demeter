"use client"


import { useEffect, useState } from 'react';
import './loading.css';

const logoPath = '/logo.svg';



interface LoadingProps {
  onLoadingComplete?: () => void;
}

const Loading = ({ onLoadingComplete }: LoadingProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      onLoadingComplete?.();
    }, 2000); // 2 seconds for demo purposes

    return () => clearTimeout(timer);
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
