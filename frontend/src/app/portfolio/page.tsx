'use client';

import { useState, useEffect } from 'react';
import { portfolioAPI, marketAPI } from '@/lib/api';
import { Investment } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Plus, RefreshCw, Home } from 'lucide-react';

type TabType = 'stocks' | 'mutual-funds' | 'fixed-deposits' | 'others';

export default function PortfolioPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('stocks');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [summary, setSummary] = useState({
    total_current: 0,
    total_invested: 0,
    total_gain: 0,
    gain_percentage: 0,
  });

  const isMarketOpen = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const day = now.getDay();
    
    // Market closed on weekends (Saturday = 6, Sunday = 0)
    if (day === 0 || day === 6) return false;
    
    // Indian market hours: 9:15 AM to 3:30 PM IST
    const currentTime = hours * 60 + minutes;
    const marketOpen = 9 * 60 + 15; // 9:15 AM
    const marketClose = 15 * 60 + 30; // 3:30 PM
    
    return currentTime >= marketOpen && currentTime <= marketClose;
  };

  useEffect(() => {
    // Load dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    
    // Listen for dark mode changes
    const handleDarkModeChange = () => {
      const darkMode = localStorage.getItem('darkMode') === 'true';
      setIsDarkMode(darkMode);
    };
    window.addEventListener('darkModeChange', handleDarkModeChange);
    
    fetchPortfolioData(false, true); // Load without prices first
    
    return () => window.removeEventListener('darkModeChange', handleDarkModeChange);
  }, []);

  useEffect(() => {
    // Only auto-refresh stocks during market hours
    const interval = setInterval(() => {
      if (isMarketOpen() && activeTab === 'stocks') {
        // Refresh every 30 seconds for stocks during market hours
        fetchPortfolioData(true);
      } else {
        // Refresh every 2 minutes for other tabs or after market close
        fetchPortfolioData(true);
      }
    }, isMarketOpen() && activeTab === 'stocks' ? 30000 : 120000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchPortfolioData = async (isAutoRefresh = false, skipPrices = false) => {
    if (!isAutoRefresh) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await portfolioAPI.getAllInvestments();
      const investmentsData = res.data;

      // If skipPrices is true, show data immediately without fetching prices
      if (skipPrices) {
        setInvestments(investmentsData);
        setLoading(false);
        // Fetch prices in background
        setTimeout(() => fetchPortfolioData(true), 100);
        return;
      }

      // Update investments with real-time prices where applicable
      const updatedInvestments = await Promise.all(
        investmentsData.map(async (inv: Investment) => {
          const assetClass = inv.asset_class_name?.toLowerCase() || '';
          
          // Check if it's a stock with a symbol
          if (inv.symbol && (assetClass.includes('stock') || assetClass.includes('equity')) &&
              !assetClass.includes('mf') && !assetClass.includes('mutual')) {
            try {
              const response = await marketAPI.getStockPrice(inv.symbol);
              const stockData = response.data; // Extract data from axios response
              if (stockData && stockData.current_price && inv.units) {
                const units = Number(inv.units) || 0;
                const investedValue = Number(inv.invested_value) || 0;
                const currentPrice = Number(stockData.current_price) || 0;
                
                const newCurrentValue = currentPrice * units;
                const gain = newCurrentValue - investedValue;
                const gainPercent = investedValue > 0 ? (gain / investedValue) * 100 : 0;
                
                return {
                  ...inv,
                  current_value: newCurrentValue,
                  gain_loss: gain,
                  gain_loss_percentage: gainPercent,
                  market_price: currentPrice,
                  price_change_percent: Number(stockData.change_percent) || 0,
                };
              }
            } catch (error) {
              console.warn(`Could not fetch real-time price for ${inv.symbol}:`, error);
            }
          }
          
          // Check if it's a mutual fund with a scheme code
          if (inv.symbol && (assetClass.includes('mf') || assetClass.includes('mutual'))) {
            try {
              const response = await marketAPI.getMutualFundNav(inv.symbol);
              const mfData = response.data;
              if (mfData && mfData.nav && inv.units) {
                const units = Number(inv.units) || 0;
                const investedValue = Number(inv.invested_value) || 0;
                const currentNav = Number(mfData.nav) || 0;
                
                const newCurrentValue = currentNav * units;
                const gain = newCurrentValue - investedValue;
                const gainPercent = investedValue > 0 ? (gain / investedValue) * 100 : 0;
                
                return {
                  ...inv,
                  current_value: newCurrentValue,
                  gain_loss: gain,
                  gain_loss_percentage: gainPercent,
                  market_price: currentNav,
                  price_change_percent: Number(mfData.change_percent) || 0,
                };
              }
            } catch (error) {
              console.warn(`Could not fetch NAV for mutual fund ${inv.symbol}:`, error);
            }
            
            // Fallback: Calculate NAV from existing current_value and units
            if (inv.units && inv.current_value) {
              const units = Number(inv.units) || 0;
              const currentValue = Number(inv.current_value) || 0;
              const calculatedNav = units > 0 ? currentValue / units : 0;
              
              return {
                ...inv,
                market_price: calculatedNav,
              };
            }
          }
          
          return inv;
        })
      );

      setInvestments(updatedInvestments);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getFilteredInvestments = () => {
    let filtered = investments;

    // Filter by member first
    if (selectedMember !== 'all') {
      filtered = filtered.filter(inv => inv.member_name === selectedMember);
    }

    // Then filter by asset class tab
    switch (activeTab) {
      case 'stocks':
        return filtered.filter(inv => {
          const assetClass = inv.asset_class_name?.toLowerCase() || '';
          // Only direct stocks, not mutual funds
          return (assetClass.includes('stock') || assetClass.includes('equity')) && 
                 !assetClass.includes('mf') && 
                 !assetClass.includes('mutual');
        });
      case 'mutual-funds':
        return filtered.filter(inv => {
          const assetClass = inv.asset_class_name?.toLowerCase() || '';
          return assetClass.includes('mf') || assetClass.includes('mutual');
        });
      case 'fixed-deposits':
        return filtered.filter(inv => {
          const assetClass = inv.asset_class_name?.toLowerCase() || '';
          return assetClass.includes('fd') || assetClass.includes('deposit');
        });
      case 'others':
        return filtered.filter(inv => {
          const assetClass = inv.asset_class_name?.toLowerCase() || '';
          return !assetClass.includes('stock') && 
                 !assetClass.includes('equity') && 
                 !assetClass.includes('mf') && 
                 !assetClass.includes('mutual') && 
                 !assetClass.includes('fd') && 
                 !assetClass.includes('deposit');
        });
      default:
        return filtered;
    }
  };

  // Get unique member names for the filter dropdown
  const uniqueMembers = Array.from(new Set(investments.map(inv => inv.member_name).filter(Boolean)));

  const filteredInvestments = getFilteredInvestments();

  // Calculate summary based on filtered investments (respects both tab and member filter)
  const displayInvestments = selectedMember !== 'all' 
    ? investments.filter(inv => inv.member_name === selectedMember)
    : investments;

  const total_current = displayInvestments.reduce((sum: number, inv: Investment) => sum + inv.current_value, 0);
  const total_invested = displayInvestments.reduce((sum: number, inv: Investment) => sum + inv.invested_value, 0);
  const total_gain = total_current - total_invested;
  const gain_percentage = total_invested > 0 ? (total_gain / total_invested) * 100 : 0;

  const tabs = [
    { id: 'stocks', label: 'Stocks', count: displayInvestments.filter(inv => {
      const assetClass = inv.asset_class_name?.toLowerCase() || '';
      return (assetClass.includes('stock') || assetClass.includes('equity')) && !assetClass.includes('mf') && !assetClass.includes('mutual');
    }).length },
    { id: 'mutual-funds', label: 'Mutual Funds', count: displayInvestments.filter(inv => {
      const assetClass = inv.asset_class_name?.toLowerCase() || '';
      return assetClass.includes('mf') || assetClass.includes('mutual');
    }).length },
    { id: 'fixed-deposits', label: 'Fixed Deposits', count: displayInvestments.filter(inv => {
      const assetClass = inv.asset_class_name?.toLowerCase() || '';
      return assetClass.includes('fd') || assetClass.includes('deposit');
    }).length },
    { id: 'others', label: 'Others', count: displayInvestments.filter(inv => {
      const assetClass = inv.asset_class_name?.toLowerCase() || '';
      return !assetClass.includes('stock') && !assetClass.includes('equity') && !assetClass.includes('mf') && !assetClass.includes('mutual') && !assetClass.includes('fd') && !assetClass.includes('deposit');
    }).length },
  ];

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
        {loading ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
            <div className="text-xl text-gray-600 dark:text-gray-300">Loading portfolio...</div>
          </div>
        ) : (
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
              title="Back to Dashboard"
            >
              <Home className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investment Portfolio</h1>
            <div className="flex items-center gap-3 mt-2">
              {activeTab === 'stocks' && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isMarketOpen() 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {isMarketOpen() ? '● Market Open' : '○ Market Closed'}
                </span>
              )}
              {lastUpdated && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => fetchPortfolioData(true)}
                disabled={refreshing}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Updating...' : 'Refresh'}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Member Filter */}
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="pl-4 pr-10 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat [&>option]:bg-white [&>option]:text-gray-900"
            >
              <option value="all">All Members</option>
              {uniqueMembers.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
            <Link
              href="/portfolio/add"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              Add Investment
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Value</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(total_current)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Invested Amount</p>
            <p className="text-3xl font-bold text-gray-600 dark:text-gray-300">
              {formatCurrency(total_invested)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Gain/Loss</p>
            <p className={`text-3xl font-bold ${total_gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(total_gain)}
            </p>
            <p className={`text-sm ${total_gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(gain_percentage)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-gray-700'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Investments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Investment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Asset Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Member
                  </th>
                  {activeTab === 'stocks' && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-1">
                        Live Price
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      </div>
                    </th>
                  )}
                  {activeTab === 'mutual-funds' && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-1">
                        Current NAV
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      </div>
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invested
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain/Loss
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Return %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInvestments.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'stocks' || activeTab === 'mutual-funds' ? 8 : 7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-lg">No investments found in this category</p>
                        <Link
                          href="/portfolio/add"
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Add your first investment
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvestments.map((investment) => (
                  <tr key={investment.investment_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{investment.name}</div>
                        {investment.symbol && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{investment.symbol}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {investment.asset_class_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {investment.member_name}
                    </td>
                    {activeTab === 'stocks' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex flex-col items-end">
                          {investment.market_price ? (
                            <>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatCurrency(investment.market_price)}
                              </span>
                              {investment.price_change_percent !== undefined && (
                                <span className={`text-xs flex items-center gap-0.5 ${
                                  investment.price_change_percent >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {investment.price_change_percent >= 0 ? '▲' : '▼'}
                                  {Math.abs(investment.price_change_percent).toFixed(2)}%
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">Fetching...</span>
                          )}
                        </div>
                      </td>
                    )}
                    {activeTab === 'mutual-funds' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex flex-col items-end">
                          {investment.market_price ? (
                            <>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatCurrency(investment.market_price)}
                              </span>
                              {investment.price_change_percent !== undefined && (
                                <span className={`text-xs flex items-center gap-0.5 ${
                                  investment.price_change_percent >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {investment.price_change_percent >= 0 ? '▲' : '▼'}
                                  {Math.abs(investment.price_change_percent).toFixed(2)}%
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">Fetching...</span>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                      {formatCurrency(investment.invested_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                      {formatCurrency(investment.current_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex items-center justify-end gap-1">
                        {investment.gain_loss && investment.gain_loss >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={investment.gain_loss && investment.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(investment.gain_loss || 0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <span className={investment.gain_loss_percentage && investment.gain_loss_percentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatPercentage(investment.gain_loss_percentage || 0)}
                      </span>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}
    </div>
    </div>
  );
}
