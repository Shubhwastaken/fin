'use client';

import { useState, useEffect } from 'react';
import { goalsAPI } from '@/lib/api';
import { Goal } from '@/types';
import GoalCard from '@/components/GoalCard';
import Link from 'next/link';
import { Plus, Target, Home } from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    
    fetchGoals();
    
    return () => window.removeEventListener('darkModeChange', handleDarkModeChange);
  }, []);

  const fetchGoals = async () => {
    try {
      console.log('Fetching goals from API...');
      const res = await goalsAPI.getAllGoals();
      console.log('Goals API response:', res);
      console.log('Goals data:', res.data);
      console.log('Goals data type:', typeof res.data);
      console.log('Goals data is array?:', Array.isArray(res.data));
      console.log('Goals data length:', res.data?.length);
      
      // Ensure we have an array
      const goalsArray = Array.isArray(res.data) ? res.data : [];
      console.log('Setting goals to:', goalsArray);
      setGoals(goalsArray);
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredGoals = filter === 'all' 
    ? goals 
    : goals.filter(g => g.status === filter);

  const statusCounts = {
    green: goals.filter(g => g.status === 'green').length,
    yellow: goals.filter(g => g.status === 'yellow').length,
    red: goals.filter(g => g.status === 'red').length,
  };

  if (loading) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-xl text-gray-900 dark:text-gray-100">Loading goals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition"
              title="Back to Dashboard"
            >
              <Home className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Goals</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage your family's financial objectives</p>
            </div>
          </div>
          <Link
            href="/goals/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Add New Goal
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All Goals ({goals.length})
            </button>
            <button
              onClick={() => setFilter('green')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'green'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              On Track ({statusCounts.green})
            </button>
            <button
              onClick={() => setFilter('yellow')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'yellow'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Monitor ({statusCounts.yellow})
            </button>
            <button
              onClick={() => setFilter('red')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'red'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              At Risk ({statusCounts.red})
            </button>
          </div>
        </div>

        {/* Goals Grid - New Card Design */}
        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
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
                        {goal.success_probability ? Number(goal.success_probability).toFixed(0) : 0}%
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
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter === 'all' ? 'No goals created yet' : `No ${filter} goals found`}
            </p>
            {filter === 'all' && (
              <Link
                href="/goals/new"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Create Your First Goal
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
