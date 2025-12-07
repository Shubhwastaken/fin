from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_user
from models import User, Goal
from schemas import GoalCreate, GoalResponse, GoalWithCalculations, SimulationRequest, GoalSimulationResponse, GoalHistoryResponse
from services.goal_service import GoalService
from decimal import Decimal

router = APIRouter(prefix="/api/goals", tags=["goals"])

@router.get("/", response_model=List[GoalWithCalculations])
def get_all_goals(
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Get all goals for the current user with calculated metrics"""
    goal_service = GoalService(db)
    return goal_service.get_all_goals_summary(user_id)

@router.get("/{goal_id}", response_model=GoalWithCalculations)
def get_goal_details(
    goal_id: int,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific goal"""
    goal_service = GoalService(db)
    goal = goal_service.get_goal_with_details(goal_id)
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    return goal

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: GoalCreate,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Create a new financial goal"""
    new_goal = Goal(
        created_by_user_id=user_id,
        beneficiary_member_id=goal_data.beneficiary_member_id,
        goal_name=goal_data.goal_name,
        target_amount=goal_data.target_amount,
        years_until_due=goal_data.years_until_due,
        horizon=goal_data.horizon,
        expected_return=goal_data.expected_return,
        volatility=goal_data.volatility
    )
    
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    
    return new_goal

@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    goal_data: GoalCreate,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Update an existing goal"""
    goal = db.query(Goal).filter(Goal.goal_id == goal_id).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Update fields
    goal.beneficiary_member_id = goal_data.beneficiary_member_id
    goal.goal_name = goal_data.goal_name
    goal.target_amount = goal_data.target_amount
    goal.years_until_due = goal_data.years_until_due
    goal.horizon = goal_data.horizon
    goal.expected_return = goal_data.expected_return
    goal.volatility = goal_data.volatility
    
    db.commit()
    db.refresh(goal)
    
    return goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Delete a goal"""
    goal = db.query(Goal).filter(Goal.goal_id == goal_id).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    db.delete(goal)
    db.commit()
    
    return None

@router.get("/{goal_id}/history", response_model=List[GoalHistoryResponse])
def get_goal_history(
    goal_id: int,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Get historical tracking data for a goal"""
    goal = db.query(Goal).filter(Goal.goal_id == goal_id).first()
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    goal_service = GoalService(db)
    return goal_service.get_goal_history(goal_id)

@router.post("/{goal_id}/simulate", response_model=GoalSimulationResponse)
def run_simulation(
    goal_id: int,
    simulation_request: SimulationRequest,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Run Monte Carlo simulation for a goal"""
    goal = db.query(Goal).filter(Goal.goal_id == goal_id).first()
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    goal_service = GoalService(db)
    return goal_service.run_goal_simulation(
        goal_id,
        num_simulations=simulation_request.num_simulations
    )

@router.get("/{goal_id}/rescue-strategies")
def get_rescue_strategies(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get rescue strategies for underperforming goals"""
    # Verify goal belongs to user
    goal = db.query(Goal).filter(Goal.goal_id == goal_id).first()
    if not goal or goal.created_by_user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    goal_service = GoalService(db)
    strategies = goal_service.generate_rescue_strategies(goal_id)
    
    return {
        'goal_id': goal_id,
        'strategies': strategies
    }
