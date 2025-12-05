'use client';

import { GoalHistory } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface GoalProgressChartProps {
  history: GoalHistory[];
  medianPath?: number[];
  worstPath?: number[];
  requiredPath?: number[];
}

export default function GoalProgressChart({ 
  history, 
  medianPath, 
  worstPath, 
  requiredPath 
}: GoalProgressChartProps) {
  // Prepare data for the chart
  const chartData = history.map((item) => ({
    date: new Date(item.snapshot_date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    current: item.current_allocation,
    required: item.required_pv,
    probability: item.success_probability,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Goal Progress Over Time</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis 
            tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
          />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            labelStyle={{ color: '#000' }}
          />
          <Legend />
          
          {/* Required Corpus Path (Grey) */}
          <Line 
            type="monotone" 
            dataKey="required" 
            stroke="#9CA3AF" 
            strokeWidth={2}
            name="Required Corpus"
            dot={false}
          />
          
          {/* Current Allocation (Blue) */}
          <Line 
            type="monotone" 
            dataKey="current" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="Current Allocation"
            dot={{ fill: '#3B82F6', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend for simulation paths if provided */}
      {(medianPath || worstPath) && (
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-400" />
            <span>Required Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500" />
            <span>Current Progress</span>
          </div>
          {medianPath && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500" />
              <span>Median Outcome</span>
            </div>
          )}
          {worstPath && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-500" />
              <span>Worst Case</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
