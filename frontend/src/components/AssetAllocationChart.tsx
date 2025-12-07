'use client';

import { AssetAllocation } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface AssetAllocationChartProps {
  data: AssetAllocation[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D', '#C084FC'];

export default function AssetAllocationChart({ data }: AssetAllocationChartProps) {
  const chartData = data.map((item) => ({
    name: item.asset_class,
    value: item.current_value,
    percentage: item.percentage,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Allocation</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div key={item.asset_class} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{item.asset_class}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {formatCurrency(item.current_value)} ({item.percentage.toFixed(1)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
