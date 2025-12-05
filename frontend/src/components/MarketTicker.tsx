'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface IndexData {
  index_name: string;
  current_value: number;
  change: number;
  change_percent: number;
  timestamp: string;
}

export default function MarketTicker() {
  const [indices, setIndices] = useState<Record<string, IndexData>>({});
  const [loading, setLoading] = useState(true);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/market/indices?indices=NIFTY50,SENSEX,BANKNIFTY');
      const data = await response.json();
      setIndices(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-white">
          <Activity className="w-5 h-5 animate-pulse" />
          <span>Loading market data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 mb-6 overflow-x-auto">
      <div className="flex gap-8 min-w-max">
        {Object.values(indices).map((index) => (
          <div key={index.index_name} className="flex flex-col text-white">
            <div className="text-sm opacity-90 mb-1">{index.index_name}</div>
            <div className="text-2xl font-bold mb-1">
              {index.current_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              index.change >= 0 ? 'text-green-300' : 'text-red-300'
            }`}>
              {index.change >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.change_percent.toFixed(2)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-white opacity-60 mt-3">
        Live market data • Updates every 60 seconds
      </div>
    </div>
  );
}
