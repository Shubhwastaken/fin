'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { goalsAPI } from '@/lib/api';
import { Goal, SimulationResult } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';

export default function GoalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = Number(params.id);

  const [goal, setGoal] = useState<Goal | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchGoalData();
  }, [goalId]);

  const fetchGoalData = async () => {
    try {
      const goalRes = await goalsAPI.getGoalDetails(goalId);
      setGoal(goalRes.data);
    } catch (error) {
      console.error('Error fetching goal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const res = await goalsAPI.runSimulation(goalId);
      setSimulation(res.data);
      await fetchGoalData();
    } catch (error) {
      console.error('Error running simulation:', error);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading goal details...</div>
      </div>
    );
  }

  if (!goal) {
    return <div>Goal not found</div>;
  }

  // Calculate success probability from simulation or default
  const successProbability = simulation?.success_probability || 0;
  const previousProbability = 78; // TODO: Get from previous day's data
  const probabilityChange = successProbability - previousProbability;

  // Determine status based on probability
  let statusLabel = 'NOT SIMULATED';
  let statusColor = 'bg-gray-100 text-gray-700';
  
  if (successProbability >= 70) {
    statusLabel = `ON TRACK — ${successProbability.toFixed(0)}%`;
    statusColor = 'bg-green-100 text-green-700';
  } else if (successProbability >= 50) {
    statusLabel = `AT RISK — ${successProbability.toFixed(0)}%`;
    statusColor = 'bg-yellow-100 text-yellow-700';
  } else if (successProbability > 0) {
    statusLabel = `UNLIKELY — ${successProbability.toFixed(0)}%`;
    statusColor = 'bg-red-100 text-red-700';
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col gap-6">
      
      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold text-gray-900">
        {goal.goal_name} — Goal Overview
      </h1>

      {/* HEADLINE CARD */}
      <div className="w-full bg-white shadow-sm rounded-xl p-5 border border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Future Prediction</h2>
          <div className={`px-4 py-2 rounded-lg ${statusColor} font-semibold`}>
            {statusLabel}
          </div>
        </div>
        <p className="mt-1 text-gray-500 text-sm">
          {simulation && probabilityChange !== 0 ? (
            <>Based on today's market movement, your goal success probability {probabilityChange > 0 ? 'improved' : 'decreased'} from {previousProbability}% → {successProbability.toFixed(0)}%.</>
          ) : (
            <>Run a Monte Carlo simulation to see your goal's success probability based on market conditions.</>
          )}
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* LEFT INFO PANEL */}
        <div className="col-span-4 bg-white shadow-sm rounded-xl p-6 border border-gray-200">
          
          <h3 className="text-lg font-semibold mb-4">Goal Summary</h3>
          
          <div className="space-y-4">

            <div>
              <p className="text-sm text-gray-500">Goal Name</p>
              <p className="text-lg font-medium text-gray-800">{goal.goal_name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Beneficiary</p>
              <p className="font-medium text-gray-800">{goal.beneficiary_name || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Target Amount</p>
              <p className="font-medium text-gray-800">{formatCurrency(goal.target_amount)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Years Remaining</p>
              <p className="font-medium text-gray-800">{goal.years_until_due} Years</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Current Allocation</p>
              <p className="font-medium text-gray-800">{formatCurrency(goal.current_allocation || 0)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Required PV Today</p>
              <p className="font-medium text-gray-800">{formatCurrency(goal.present_value || 0)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Expected Return</p>
              <p className="font-medium text-gray-800">{goal.expected_return ? formatPercentage(goal.expected_return / 100) : 'N/A'} annually</p>
            </div>

          </div>

          <button 
            onClick={handleRunSimulation}
            disabled={simulating}
            className="mt-6 w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {simulating ? 'Running Simulation...' : 'Run Monte Carlo Simulation'}
          </button>

        </div>

        {/* RIGHT CHART PANEL */}
        <div className="col-span-8 bg-white shadow-sm rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Goal Progress Tracking</h3>

          {/* CHART PLACEHOLDER */}
          <div className="h-96 bg-gray-100 rounded-lg border border-gray-300 flex flex-col justify-center items-center">
            <p className="text-gray-500">[Goal Timeline Chart Placeholder]</p>
            <p className="text-sm text-gray-400 mt-1">
              Required Path (Grey) — Actual Path (Blue) — Median Future Path (Green)
            </p>
          </div>

          <p className="text-gray-500 text-sm mt-4">
            This chart updates daily based on real market movements, reflecting whether your goal remains achievable.
          </p>

          {/* Simulation Results */}
          {simulation && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Latest Simulation Results</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Median Outcome</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(simulation.median_outcome)}
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Best Case</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(simulation.best_case)}
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Worst Case</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(simulation.worst_case)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
