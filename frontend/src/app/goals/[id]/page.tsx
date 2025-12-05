'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { goalsAPI } from '@/lib/api';
import { Goal, GoalHistory, SimulationResult, RescueStrategy } from '@/types';
import { formatCurrency, formatPercentage, getStatusBadgeColor } from '@/lib/utils';
import GoalProgressChart from '@/components/GoalProgressChart';
import { Target, TrendingUp, Clock, User, AlertCircle } from 'lucide-react';

export default function GoalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = Number(params.id);

  const [goal, setGoal] = useState<Goal | null>(null);
  const [history, setHistory] = useState<GoalHistory[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [strategies, setStrategies] = useState<RescueStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchGoalData();
  }, [goalId]);

  const fetchGoalData = async () => {
    try {
      const [goalRes, historyRes] = await Promise.all([
        goalsAPI.getGoalDetails(goalId),
        goalsAPI.getGoalHistory(goalId),
      ]);

      setGoal(goalRes.data);
      setHistory(historyRes.data);

      // Fetch strategies if goal is at risk
      if (goalRes.data.status === 'red' || goalRes.data.status === 'yellow') {
        const strategiesRes = await goalsAPI.getRescueStrategies(goalId);
        setStrategies(strategiesRes.data.strategies);
      }
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
      await fetchGoalData(); // Refresh goal data
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

  const statusColor = getStatusBadgeColor(goal.status || 'red');
  const progressPercentage = goal.current_allocation && goal.present_value
    ? Math.min((goal.current_allocation / goal.present_value) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Goals
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{goal.goal_name}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{goal.beneficiary_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{goal.years_until_due} years remaining</span>
                </div>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full ${statusColor} text-white font-medium`}>
              {goal.status?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Target Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(goal.target_amount)}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Present Value Required</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(goal.present_value || 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Current Allocation</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(goal.current_allocation || 0)}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {goal.shortfall && goal.shortfall > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Shortfall</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(goal.shortfall)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                SIP: {formatCurrency(goal.required_monthly_sip || 0)}/mo
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Success Probability</p>
              <p className="text-2xl font-bold text-green-600">
                {goal.success_probability?.toFixed(0) || 0}%
              </p>
              <p className="text-sm text-green-600 mt-1">On Track!</p>
            </div>
          )}
        </div>

        {/* Alert for at-risk goals */}
        {(goal.status === 'red' || goal.status === 'yellow') && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  {goal.status === 'red' ? 'Goal at Risk' : 'Monitor Required'}
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Current allocation is below target. Consider increasing your SIP or reviewing rescue strategies below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Chart */}
        {history.length > 0 && (
          <div className="mb-8">
            <GoalProgressChart history={history} />
          </div>
        )}

        {/* Simulation Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Monte Carlo Simulation</h3>
            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition"
            >
              {simulating ? 'Running...' : 'Run Simulation'}
            </button>
          </div>

          {simulation && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
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
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                <p className="text-xl font-bold text-purple-600">
                  {simulation.success_probability.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rescue Strategies */}
        {strategies.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Rescue Strategies</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {strategies.map((strategy, index) => (
                <div
                  key={index}
                  className="border-2 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold">{strategy.strategy_name}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        strategy.risk_level === 'Low'
                          ? 'bg-green-100 text-green-800'
                          : strategy.risk_level === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {strategy.risk_level} Risk
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{strategy.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Return:</span>
                      <span className="font-semibold">{strategy.new_expected_return}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Required SIP:</span>
                      <span className="font-semibold">
                        {formatCurrency(strategy.required_monthly_sip)}/mo
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-semibold text-green-600">
                        {strategy.success_probability.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
