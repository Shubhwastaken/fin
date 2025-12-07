'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardAPI, goalsAPI } from '@/lib/api';
import { DashboardSummary, AssetAllocation } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import GoalCard from '@/components/GoalCard';
import AssetAllocationChart from '@/components/AssetAllocationChart';
import MarketTicker from '@/components/MarketTicker';
import { TrendingUp, TrendingDown, Target, Wallet, PieChart, LogOut, Moon, Sun } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load dark mode preference from localStorage
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, allocationRes] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getAssetAllocation(),
      ]);
      
      setSummary(summaryRes.data);
      setAssetAllocation(allocationRes.data);
      setError('');
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={fetchDashboardData}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Family Wealth Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Track your family's financial goals and investments</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const newDarkMode = !isDarkMode;
                  setIsDarkMode(newDarkMode);
                  localStorage.setItem('darkMode', String(newDarkMode));
                  // Trigger custom event for same-page updates
                  window.dispatchEvent(new Event('darkModeChange'));
                }}
                className="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>

        {/* Market Ticker - Real-time NIFTY, SENSEX, BANKNIFTY */}
        <MarketTicker />

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Portfolio Value */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Portfolio Value</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary.total_portfolio_value)}
                </p>
              </div>
              <Wallet className="w-12 h-12 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              {summary.is_daily_positive ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm font-medium ${summary.is_daily_positive ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(summary.daily_change_percentage)} ({formatCurrency(Math.abs(summary.daily_change_amount))})
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">today</span>
            </div>
          </div>

          {/* Total Gains/Losses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Gains/Losses</p>
                <p className={`text-3xl font-bold ${summary.total_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.total_gain_loss)}
                </p>
              </div>
              <TrendingUp className={`w-12 h-12 ${summary.total_gain_loss >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Return: </span>
              <span className={`text-sm font-medium ${summary.total_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(summary.gain_loss_percentage)}
              </span>
            </div>
          </div>

          {/* Goals Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Goals</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.num_goals}</p>
              </div>
              <Target className="w-12 h-12 text-purple-500" />
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">{summary.num_green_goals} On Track</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">{summary.num_yellow_goals} Monitor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">{summary.num_red_goals} At Risk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Allocation and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <AssetAllocationChart data={assetAllocation} />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/portfolio"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-lg font-medium transition"
              >
                View Portfolio
              </Link>
              <Link
                href="/goals"
                className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-3 rounded-lg font-medium transition"
              >
                View All Goals
              </Link>
              <Link
                href="/goals/new"
                className="block w-full bg-purple-500 hover:bg-purple-600 text-white text-center py-3 rounded-lg font-medium transition"
              >
                Add New Goal
              </Link>
              <Link
                href="/portfolio/add"
                className="block w-full bg-indigo-500 hover:bg-indigo-600 text-white text-center py-3 rounded-lg font-medium transition"
              >
                Add Investment
              </Link>
            </div>
          </div>
        </div>

        {/* Goals Overview */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Goals</h2>
            <Link href="/goals" className="text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          
          {summary.goals_summary && summary.goals_summary.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {summary.goals_summary.map((goal) => (
                <Link
                  key={goal.goal_id}
                  href={`/goals/${goal.goal_id}`}
                  className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.goal_name}</h3>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        goal.status === 'green'
                          ? 'bg-green-100 text-green-700'
                          : goal.status === 'yellow'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {goal.status === 'green' ? 'ON TRACK' : goal.status === 'yellow' ? 'AT RISK' : 'UNLIKELY'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Target Amount</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        ₹{(goal.target_amount / 10000000).toFixed(2)}Cr
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Years Left</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{goal.years_until_due} years</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {goal.success_probability?.toFixed(0) || 0}%
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Progress</p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            goal.status === 'green'
                              ? 'bg-green-500'
                              : goal.status === 'yellow'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(
                              ((goal.current_allocation || 0) / (goal.present_value || 1)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No goals created yet</p>
              <Link
                href="/goals/new"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Create Your First Goal
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
