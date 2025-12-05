import numpy as np
from decimal import Decimal
from typing import Tuple, List, Dict
import math

class FinancialCalculator:
    """
    Financial calculation services for goal planning and portfolio analysis
    """
    
    @staticmethod
    def calculate_present_value(future_value: float, rate: float, years: int) -> float:
        """
        Calculate Present Value using: PV = FV / (1 + r)^n
        
        Args:
            future_value: Target amount in the future
            rate: Expected annual return rate (as decimal, e.g., 0.10 for 10%)
            years: Number of years until goal
            
        Returns:
            Present value required today
        """
        if years <= 0:
            return future_value
        
        pv = future_value / math.pow(1 + rate, years)
        return round(pv, 2)
    
    @staticmethod
    def calculate_future_value(present_value: float, rate: float, years: int) -> float:
        """
        Calculate Future Value using: FV = PV * (1 + r)^n
        """
        if years <= 0:
            return present_value
        
        fv = present_value * math.pow(1 + rate, years)
        return round(fv, 2)
    
    @staticmethod
    def calculate_required_sip(
        shortfall: float, 
        rate: float, 
        years: int, 
        sip_frequency: int = 12
    ) -> float:
        """
        Calculate Required Monthly SIP using annuity formula:
        SIP = Shortfall * r / ((1 + r)^n - 1)
        
        Where r is the monthly rate
        
        Args:
            shortfall: Amount needed to fill the gap
            rate: Annual expected return rate (as decimal)
            years: Number of years until goal
            sip_frequency: Number of SIPs per year (default 12 for monthly)
            
        Returns:
            Required SIP amount per period
        """
        if years <= 0 or shortfall <= 0:
            return 0
        
        # Convert annual rate to period rate
        period_rate = rate / sip_frequency
        total_periods = years * sip_frequency
        
        # SIP annuity formula
        numerator = shortfall * period_rate
        denominator = math.pow(1 + period_rate, total_periods) - 1
        
        if denominator == 0:
            return 0
        
        sip = numerator / denominator
        return round(sip, 2)
    
    @staticmethod
    def calculate_sip_future_value(
        monthly_sip: float,
        rate: float,
        years: int,
        sip_frequency: int = 12
    ) -> float:
        """
        Calculate future value of regular SIP contributions
        FV = SIP * [((1 + r)^n - 1) / r] * (1 + r)
        """
        if years <= 0:
            return 0
        
        period_rate = rate / sip_frequency
        total_periods = years * sip_frequency
        
        fv = monthly_sip * (
            (math.pow(1 + period_rate, total_periods) - 1) / period_rate
        ) * (1 + period_rate)
        
        return round(fv, 2)
    
    @staticmethod
    def calculate_xirr(cash_flows: List[Tuple[float, str]], guess: float = 0.1) -> float:
        """
        Calculate XIRR (Extended Internal Rate of Return)
        
        Args:
            cash_flows: List of (amount, date_string) tuples
            guess: Initial guess for IRR
            
        Returns:
            XIRR as percentage
        """
        # Simplified XIRR calculation
        # In production, use a proper XIRR library
        return 0.0
    
    @staticmethod
    def calculate_goal_status(
        current_allocation: float,
        required_pv: float,
        success_probability: float = None
    ) -> str:
        """
        Determine goal status (green/yellow/red) based on allocation and probability
        
        Args:
            current_allocation: Current invested amount for this goal
            required_pv: Required present value
            success_probability: Monte Carlo success probability (0-100)
            
        Returns:
            Status string: 'green', 'yellow', or 'red'
        """
        if required_pv == 0:
            return 'green'
        
        allocation_ratio = current_allocation / required_pv
        
        # Green: >= 80% allocated OR success probability >= 70%
        if allocation_ratio >= 0.8 or (success_probability and success_probability >= 70):
            return 'green'
        
        # Yellow: 50-80% allocated OR success probability 50-70%
        elif allocation_ratio >= 0.5 or (success_probability and success_probability >= 50):
            return 'yellow'
        
        # Red: < 50% allocated OR success probability < 50%
        else:
            return 'red'
    
    @staticmethod
    def calculate_coastfire_number(
        target_amount: float,
        current_age: int,
        retirement_age: int,
        rate: float
    ) -> float:
        """
        Calculate CoastFIRE number - amount needed today that will grow to target
        """
        years = retirement_age - current_age
        if years <= 0:
            return target_amount
        
        return FinancialCalculator.calculate_present_value(
            target_amount, rate, years
        )
    
    @staticmethod
    def run_monte_carlo_simulation(
        current_allocation: float,
        target_amount: float,
        years: int,
        expected_return: float,
        volatility: float,
        monthly_sip: float = 0,
        num_simulations: int = 5000
    ) -> Dict[str, float]:
        """
        Run Monte Carlo simulation for goal success probability
        
        Args:
            current_allocation: Current invested amount
            target_amount: Goal target amount
            years: Years until goal
            expected_return: Expected annual return (as decimal)
            volatility: Annual volatility/standard deviation (as decimal)
            monthly_sip: Optional monthly SIP contribution
            num_simulations: Number of simulation runs
            
        Returns:
            Dictionary with median_outcome, worst_case, best_case, success_probability
        """
        if years <= 0:
            success = 1.0 if current_allocation >= target_amount else 0.0
            return {
                'median_outcome': current_allocation,
                'worst_case': current_allocation,
                'best_case': current_allocation,
                'success_probability': success * 100
            }
        
        outcomes = []
        months = years * 12
        monthly_return = expected_return / 12
        monthly_volatility = volatility / math.sqrt(12)
        
        for _ in range(num_simulations):
            portfolio_value = current_allocation
            
            for month in range(months):
                # Add monthly SIP if applicable
                portfolio_value += monthly_sip
                
                # Generate random return using normal distribution
                random_return = np.random.normal(monthly_return, monthly_volatility)
                portfolio_value *= (1 + random_return)
            
            outcomes.append(portfolio_value)
        
        outcomes = np.array(outcomes)
        
        # Calculate percentiles
        median_outcome = np.percentile(outcomes, 50)
        worst_case = np.percentile(outcomes, 10)  # 10th percentile
        best_case = np.percentile(outcomes, 90)   # 90th percentile
        
        # Calculate success probability
        successes = np.sum(outcomes >= target_amount)
        success_probability = (successes / num_simulations) * 100
        
        return {
            'median_outcome': round(float(median_outcome), 2),
            'worst_case': round(float(worst_case), 2),
            'best_case': round(float(best_case), 2),
            'success_probability': round(float(success_probability), 2)
        }
    
    @staticmethod
    def generate_projection_paths(
        current_allocation: float,
        target_amount: float,
        years: int,
        expected_return: float,
        volatility: float,
        monthly_sip: float = 0,
        num_paths: int = 100
    ) -> Dict[str, List[float]]:
        """
        Generate sample projection paths for visualization
        
        Returns:
            Dictionary with 'median_path', 'worst_path', 'best_path', and 'required_path'
        """
        months = years * 12
        monthly_return = expected_return / 12
        monthly_volatility = volatility / math.sqrt(12)
        
        all_paths = []
        
        for _ in range(num_paths):
            path = [current_allocation]
            portfolio_value = current_allocation
            
            for month in range(months):
                portfolio_value += monthly_sip
                random_return = np.random.normal(monthly_return, monthly_volatility)
                portfolio_value *= (1 + random_return)
                path.append(portfolio_value)
            
            all_paths.append(path)
        
        all_paths = np.array(all_paths)
        
        # Calculate percentile paths
        median_path = [float(np.percentile(all_paths[:, i], 50)) for i in range(months + 1)]
        worst_path = [float(np.percentile(all_paths[:, i], 10)) for i in range(months + 1)]
        best_path = [float(np.percentile(all_paths[:, i], 90)) for i in range(months + 1)]
        
        # Calculate required corpus path (linear growth to target)
        required_path = [
            current_allocation + (target_amount - current_allocation) * (i / months)
            for i in range(months + 1)
        ]
        
        return {
            'median_path': median_path,
            'worst_path': worst_path,
            'best_path': best_path,
            'required_path': required_path
        }
    
    @staticmethod
    def calculate_portfolio_metrics(
        returns: List[float],
        benchmark_returns: List[float] = None
    ) -> Dict[str, float]:
        """
        Calculate portfolio performance metrics
        
        Returns:
            Dictionary with sharpe_ratio, beta, alpha, standard_deviation
        """
        if not returns:
            return {}
        
        returns_array = np.array(returns)
        
        # Annualized return
        mean_return = np.mean(returns_array) * 12  # Assuming monthly returns
        
        # Standard deviation (annualized)
        std_dev = np.std(returns_array) * math.sqrt(12)
        
        # Sharpe ratio (assuming risk-free rate of 6%)
        risk_free_rate = 0.06
        sharpe_ratio = (mean_return - risk_free_rate) / std_dev if std_dev > 0 else 0
        
        metrics = {
            'annualized_return': round(mean_return * 100, 2),
            'standard_deviation': round(std_dev * 100, 2),
            'sharpe_ratio': round(sharpe_ratio, 2)
        }
        
        # Calculate beta and alpha if benchmark provided
        if benchmark_returns:
            benchmark_array = np.array(benchmark_returns)
            covariance = np.cov(returns_array, benchmark_array)[0][1]
            benchmark_variance = np.var(benchmark_array)
            
            beta = covariance / benchmark_variance if benchmark_variance > 0 else 0
            alpha = mean_return - (risk_free_rate + beta * (np.mean(benchmark_array) * 12 - risk_free_rate))
            
            metrics['beta'] = round(beta, 2)
            metrics['alpha'] = round(alpha * 100, 2)
        
        return metrics
