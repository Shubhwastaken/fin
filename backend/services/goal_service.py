from sqlalchemy.orm import Session
from models import Goal, GoalInvestmentMapping, Investment, FamilyMember, GoalHistory, GoalSimulationHistory
from services.financial_calculator import FinancialCalculator
from typing import Dict, List, Optional
from decimal import Decimal
from datetime import date, datetime

class GoalService:
    """
    Service for goal-related business logic
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.calculator = FinancialCalculator()
    
    def calculate_goal_metrics(self, goal: Goal) -> Dict:
        """
        Calculate all metrics for a goal including PV, shortfall, SIP, status
        """
        # Get expected return and convert to decimal
        expected_return = float(goal.expected_return or 10) / 100
        
        # Calculate Present Value
        present_value = self.calculator.calculate_present_value(
            future_value=float(goal.target_amount),
            rate=expected_return,
            years=goal.years_until_due
        )
        
        # Calculate current allocation from mapped investments
        current_allocation = self.get_goal_current_allocation(goal.goal_id)
        
        # Calculate shortfall
        shortfall = max(0, present_value - current_allocation)
        
        # Calculate required monthly SIP if shortfall exists
        required_sip = 0
        if shortfall > 0:
            required_sip = self.calculator.calculate_required_sip(
                shortfall=shortfall,
                rate=expected_return,
                years=goal.years_until_due
            )
        
        # Get latest success probability from simulation history
        latest_simulation = self.db.query(GoalSimulationHistory).filter(
            GoalSimulationHistory.goal_id == goal.goal_id
        ).order_by(GoalSimulationHistory.run_timestamp.desc()).first()
        
        success_probability = float(latest_simulation.success_probability) if latest_simulation else None
        
        # Determine goal status
        status = self.calculator.calculate_goal_status(
            current_allocation=current_allocation,
            required_pv=present_value,
            success_probability=success_probability
        )
        
        return {
            'present_value': round(present_value, 2),
            'current_allocation': round(current_allocation, 2),
            'shortfall': round(shortfall, 2),
            'required_monthly_sip': round(required_sip, 2),
            'status': status,
            'success_probability': success_probability
        }
    
    def get_goal_current_allocation(self, goal_id: int) -> float:
        """
        Calculate total current value allocated to a goal from mapped investments
        """
        mappings = self.db.query(GoalInvestmentMapping).filter(
            GoalInvestmentMapping.goal_id == goal_id
        ).all()
        
        total_allocation = 0
        
        for mapping in mappings:
            investment = self.db.query(Investment).filter(
                Investment.investment_id == mapping.investment_id
            ).first()
            
            if investment and investment.current_value:
                allocation_pct = float(mapping.allocation_percentage or 100) / 100
                total_allocation += float(investment.current_value) * allocation_pct
        
        return total_allocation
    
    def get_goal_with_details(self, goal_id: int) -> Optional[Dict]:
        """
        Get goal with all calculated metrics and beneficiary details
        """
        goal = self.db.query(Goal).filter(Goal.goal_id == goal_id).first()
        
        if not goal:
            return None
        
        # Get beneficiary name
        beneficiary = self.db.query(FamilyMember).filter(
            FamilyMember.member_id == goal.beneficiary_member_id
        ).first()
        
        # Calculate metrics
        metrics = self.calculate_goal_metrics(goal)
        
        return {
            'goal_id': goal.goal_id,
            'goal_name': goal.goal_name,
            'target_amount': float(goal.target_amount),
            'years_until_due': goal.years_until_due,
            'horizon': goal.horizon.value,
            'expected_return': float(goal.expected_return) if goal.expected_return else None,
            'volatility': float(goal.volatility) if goal.volatility else None,
            'beneficiary_name': beneficiary.name if beneficiary else None,
            'beneficiary_member_id': goal.beneficiary_member_id,
            'created_at': goal.created_at,
            **metrics
        }
    
    def get_all_goals_summary(self, user_id: int) -> List[Dict]:
        """
        Get summary of all goals for a user
        """
        goals = self.db.query(Goal).filter(
            Goal.created_by_user_id == user_id
        ).all()
        
        goals_summary = []
        
        for goal in goals:
            goal_details = self.get_goal_with_details(goal.goal_id)
            if goal_details:
                goals_summary.append(goal_details)
        
        return goals_summary
    
    def run_goal_simulation(self, goal_id: int, num_simulations: int = 5000) -> Dict:
        """
        Run Monte Carlo simulation for a goal and store results
        """
        goal = self.db.query(Goal).filter(Goal.goal_id == goal_id).first()
        
        if not goal:
            raise ValueError("Goal not found")
        
        # Get current metrics
        metrics = self.calculate_goal_metrics(goal)
        current_allocation = metrics['current_allocation']
        required_sip = metrics['required_monthly_sip']
        
        # Run simulation
        expected_return = float(goal.expected_return or 10) / 100
        volatility = float(goal.volatility or 12) / 100
        
        simulation_results = self.calculator.run_monte_carlo_simulation(
            current_allocation=current_allocation,
            target_amount=float(goal.target_amount),
            years=goal.years_until_due,
            expected_return=expected_return,
            volatility=volatility,
            monthly_sip=required_sip,
            num_simulations=num_simulations
        )
        
        # Store simulation results
        simulation_record = GoalSimulationHistory(
            goal_id=goal_id,
            median_outcome=Decimal(str(simulation_results['median_outcome'])),
            worst_case=Decimal(str(simulation_results['worst_case'])),
            best_case=Decimal(str(simulation_results['best_case'])),
            success_probability=Decimal(str(simulation_results['success_probability']))
        )
        
        self.db.add(simulation_record)
        self.db.commit()
        self.db.refresh(simulation_record)
        
        return {
            'sim_id': simulation_record.sim_id,
            'goal_id': goal_id,
            'run_timestamp': simulation_record.run_timestamp,
            **simulation_results
        }
    
    def get_goal_history(self, goal_id: int) -> List[Dict]:
        """
        Get historical tracking data for a goal
        """
        history = self.db.query(GoalHistory).filter(
            GoalHistory.goal_id == goal_id
        ).order_by(GoalHistory.snapshot_date).all()
        
        return [
            {
                'history_id': h.history_id,
                'goal_id': h.goal_id,
                'snapshot_date': h.snapshot_date,
                'current_allocation': float(h.current_allocation) if h.current_allocation else 0,
                'required_pv': float(h.required_pv) if h.required_pv else 0,
                'success_probability': float(h.success_probability) if h.success_probability else None
            }
            for h in history
        ]
    
    def generate_rescue_strategies(self, goal_id: int) -> List[Dict]:
        """
        Generate rescue strategies for underperforming goals
        """
        goal = self.db.query(Goal).filter(Goal.goal_id == goal_id).first()
        
        if not goal:
            raise ValueError("Goal not found")
        
        metrics = self.calculate_goal_metrics(goal)
        
        if metrics['status'] == 'green':
            return []  # No rescue needed
        
        strategies = []
        
        # Strategy 1: Safe (lower risk, lower return)
        safe_return = 0.08
        safe_volatility = 0.06
        safe_sip = self.calculator.calculate_required_sip(
            shortfall=metrics['shortfall'],
            rate=safe_return,
            years=goal.years_until_due
        )
        
        safe_simulation = self.calculator.run_monte_carlo_simulation(
            current_allocation=metrics['current_allocation'],
            target_amount=float(goal.target_amount),
            years=goal.years_until_due,
            expected_return=safe_return,
            volatility=safe_volatility,
            monthly_sip=safe_sip,
            num_simulations=1000
        )
        
        strategies.append({
            'strategy_name': 'Safe Strategy',
            'risk_level': 'Low',
            'new_expected_return': 8.0,
            'new_volatility': 6.0,
            'required_monthly_sip': round(safe_sip, 2),
            'success_probability': safe_simulation['success_probability'],
            'description': 'Focus on debt funds and FDs with lower volatility'
        })
        
        # Strategy 2: Balanced
        balanced_return = 0.10
        balanced_volatility = 0.10
        balanced_sip = self.calculator.calculate_required_sip(
            shortfall=metrics['shortfall'],
            rate=balanced_return,
            years=goal.years_until_due
        )
        
        balanced_simulation = self.calculator.run_monte_carlo_simulation(
            current_allocation=metrics['current_allocation'],
            target_amount=float(goal.target_amount),
            years=goal.years_until_due,
            expected_return=balanced_return,
            volatility=balanced_volatility,
            monthly_sip=balanced_sip,
            num_simulations=1000
        )
        
        strategies.append({
            'strategy_name': 'Balanced Strategy',
            'risk_level': 'Medium',
            'new_expected_return': 10.0,
            'new_volatility': 10.0,
            'required_monthly_sip': round(balanced_sip, 2),
            'success_probability': balanced_simulation['success_probability'],
            'description': 'Mix of equity and debt funds with moderate risk'
        })
        
        # Strategy 3: Aggressive
        aggressive_return = 0.14
        aggressive_volatility = 0.18
        aggressive_sip = self.calculator.calculate_required_sip(
            shortfall=metrics['shortfall'],
            rate=aggressive_return,
            years=goal.years_until_due
        )
        
        aggressive_simulation = self.calculator.run_monte_carlo_simulation(
            current_allocation=metrics['current_allocation'],
            target_amount=float(goal.target_amount),
            years=goal.years_until_due,
            expected_return=aggressive_return,
            volatility=aggressive_volatility,
            monthly_sip=aggressive_sip,
            num_simulations=1000
        )
        
        strategies.append({
            'strategy_name': 'Aggressive Strategy',
            'risk_level': 'High',
            'new_expected_return': 14.0,
            'new_volatility': 18.0,
            'required_monthly_sip': round(aggressive_sip, 2),
            'success_probability': aggressive_simulation['success_probability'],
            'description': 'Focus on equity funds and growth stocks with higher potential'
        })
        
        return strategies
