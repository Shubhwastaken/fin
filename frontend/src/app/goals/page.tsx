'use client';

import { useState, useEffect } from 'react';
import { goalsAPI } from '@/lib/api';
import { Goal } from '@/types';
import GoalCard from '@/components/GoalCard';
import Link from 'next/link';
import { Plus, Target } from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await goalsAPI.getAllGoals();
      setGoals(res.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
            <p className="text-gray-600 mt-2">Track and manage your family's financial objectives</p>
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
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Goals ({goals.length})
            </button>
            <button
              onClick={() => setFilter('green')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'green'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              On Track ({statusCounts.green})
            </button>
            <button
              onClick={() => setFilter('yellow')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'yellow'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monitor ({statusCounts.yellow})
            </button>
            <button
              onClick={() => setFilter('red')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'red'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              At Risk ({statusCounts.red})
            </button>
          </div>
        </div>

        {/* Goals Grid */}
        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <GoalCard key={goal.goal_id} goal={goal} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
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
  );
}
