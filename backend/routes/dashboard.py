from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_user
from models import User
from services.portfolio_service import PortfolioService
from services.goal_service import GoalService

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db)
):
    """
    Get dashboard summary including:
    - Total portfolio value
    - Daily change
    - Goal status counts
    - Recent performance
    """
    portfolio_service = PortfolioService(db)
    goal_service = GoalService(db)
    
    # Use first user for demo (user_id = 1)
    user_id = 1
    
    # Get portfolio metrics
    portfolio_metrics = portfolio_service.get_total_portfolio_value(user_id)
    daily_change = portfolio_service.calculate_daily_change(user_id)
    
    # Get all goals and count statuses
    goals = goal_service.get_all_goals_summary(user_id)
    
    status_counts = {
        'green': 0,
        'yellow': 0,
        'red': 0
    }
    
    for goal in goals:
        status = goal.get('status', 'red')
        status_counts[status] += 1
    
    return {
        'total_portfolio_value': portfolio_metrics['total_current_value'],
        'total_invested_value': portfolio_metrics['total_invested_value'],
        'total_gain_loss': portfolio_metrics['total_gain_loss'],
        'gain_loss_percentage': portfolio_metrics['gain_loss_percentage'],
        'daily_change_percentage': daily_change['daily_change_percentage'],
        'daily_change_amount': daily_change['daily_change_amount'],
        'is_daily_positive': daily_change['is_positive'],
        'num_goals': len(goals),
        'num_green_goals': status_counts['green'],
        'num_yellow_goals': status_counts['yellow'],
        'num_red_goals': status_counts['red'],
        'goals_summary': goals[:6]  # Return top 6 goals for dashboard cards
    }

@router.get("/asset-allocation")
def get_asset_allocation(
    db: Session = Depends(get_db)
):
    """Get asset class wise allocation breakdown"""
    user_id = 1
    portfolio_service = PortfolioService(db)
    return portfolio_service.get_asset_allocation(user_id)

@router.get("/member-allocation")
def get_member_allocation(
    db: Session = Depends(get_db)
):
    """Get member-wise portfolio breakdown"""
    user_id = 1
    portfolio_service = PortfolioService(db)
    return portfolio_service.get_member_wise_allocation(user_id)

@router.get("/top-performers")
def get_top_performers(
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get top performing investments"""
    user_id = 1
    portfolio_service = PortfolioService(db)
    return portfolio_service.get_top_performers(user_id, limit)

@router.get("/worst-performers")
def get_worst_performers(
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get worst performing investments"""
    user_id = 1
    portfolio_service = PortfolioService(db)
    return portfolio_service.get_worst_performers(user_id, limit)
