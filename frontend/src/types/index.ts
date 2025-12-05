export interface User {
  user_id: number;
  email: string;
  created_at: string;
}

export interface FamilyMember {
  member_id: number;
  user_id: number;
  name: string;
  relation: string;
  created_at: string;
}

export interface Portfolio {
  portfolio_id: number;
  member_id: number;
  portfolio_name: string;
  created_at: string;
}

export interface Investment {
  investment_id: number;
  portfolio_id: number;
  member_id: number;
  asset_class_id: number;
  name: string;
  symbol?: string;
  folio_number?: string;
  invested_value: number;
  current_value: number;
  units?: number;
  created_at: string;
  asset_class_name?: string;
  member_name?: string;
  portfolio_name?: string;
  gain_loss?: number;
  gain_loss_percentage?: number;
  market_price?: number;
  price_change_percent?: number;
}

export interface Goal {
  goal_id: number;
  created_by_user_id: number;
  beneficiary_member_id: number;
  goal_name: string;
  target_amount: number;
  years_until_due: number;
  horizon: string;
  expected_return?: number;
  volatility?: number;
  created_at: string;
  beneficiary_name?: string;
  present_value?: number;
  current_allocation?: number;
  shortfall?: number;
  required_monthly_sip?: number;
  status?: 'green' | 'yellow' | 'red';
  success_probability?: number;
}

export interface DashboardSummary {
  total_portfolio_value: number;
  total_invested_value: number;
  total_gain_loss: number;
  gain_loss_percentage: number;
  daily_change_percentage: number;
  daily_change_amount: number;
  is_daily_positive: boolean;
  num_goals: number;
  num_green_goals: number;
  num_yellow_goals: number;
  num_red_goals: number;
  goals_summary: Goal[];
}

export interface AssetAllocation {
  asset_class: string;
  current_value: number;
  invested_value: number;
  gain_loss: number;
  percentage: number;
}

export interface GoalHistory {
  history_id: number;
  goal_id: number;
  snapshot_date: string;
  current_allocation: number;
  required_pv: number;
  success_probability?: number;
}

export interface SimulationResult {
  sim_id: number;
  goal_id: number;
  run_timestamp: string;
  median_outcome: number;
  worst_case: number;
  best_case: number;
  success_probability: number;
}

export interface RescueStrategy {
  strategy_name: string;
  risk_level: string;
  new_expected_return: number;
  new_volatility: number;
  required_monthly_sip: number;
  success_probability: number;
  description: string;
}
