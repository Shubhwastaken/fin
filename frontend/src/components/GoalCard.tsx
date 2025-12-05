'use client';

import { Goal } from '@/types';
import { formatCurrency, getStatusBadgeColor } from '@/lib/utils';
import Link from 'next/link';

interface GoalCardProps {
  goal: Goal;
}

export default function GoalCard({ goal }: GoalCardProps) {
  const statusColor = getStatusBadgeColor(goal.status || 'red');
  const progressPercentage = goal.current_allocation && goal.present_value
    ? Math.min((goal.current_allocation / goal.present_value) * 100, 100)
    : 0;

  return (
    <Link href={`/goals/${goal.goal_id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{goal.goal_name}</h3>
            <p className="text-sm text-gray-600">{goal.beneficiary_name}</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${statusColor}`} />
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Target</span>
              <span className="font-semibold">{formatCurrency(goal.target_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current</span>
              <span className="font-semibold">
                {formatCurrency(goal.current_allocation || 0)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${statusColor}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>{goal.years_until_due} years left</span>
            {goal.success_probability && (
              <span>{goal.success_probability.toFixed(0)}% success</span>
            )}
          </div>

          {goal.shortfall && goal.shortfall > 0 && (
            <div className="text-sm text-red-600 font-medium">
              Shortfall: {formatCurrency(goal.shortfall)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
