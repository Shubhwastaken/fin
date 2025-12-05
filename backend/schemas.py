from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Family Member Schemas
class FamilyMemberBase(BaseModel):
    name: str
    relation: str

class FamilyMemberCreate(FamilyMemberBase):
    pass

class FamilyMemberResponse(FamilyMemberBase):
    member_id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Portfolio Schemas
class PortfolioBase(BaseModel):
    portfolio_name: str

class PortfolioCreate(PortfolioBase):
    member_id: int

class PortfolioResponse(PortfolioBase):
    portfolio_id: int
    member_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Asset Class Schemas
class AssetClassResponse(BaseModel):
    asset_class_id: int
    name: str
    
    class Config:
        from_attributes = True

# Investment Schemas
class InvestmentBase(BaseModel):
    name: str
    symbol: Optional[str] = None
    folio_number: Optional[str] = None
    invested_value: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    units: Optional[Decimal] = None

class InvestmentCreate(InvestmentBase):
    portfolio_id: int
    member_id: int
    asset_class_id: int

class InvestmentResponse(InvestmentBase):
    investment_id: int
    portfolio_id: int
    member_id: int
    asset_class_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class InvestmentWithDetails(BaseModel):
    investment_id: int
    name: str
    symbol: Optional[str] = None
    folio_number: Optional[str] = None
    invested_value: float
    current_value: float
    units: Optional[float] = None
    asset_class_name: Optional[str] = None
    member_name: Optional[str] = None
    portfolio_name: Optional[str] = None
    gain_loss: Optional[float] = None
    gain_loss_percentage: Optional[float] = None
    portfolio_id: Optional[int] = None
    member_id: Optional[int] = None
    asset_class_id: Optional[int] = None
    created_at: Optional[datetime] = None

# Transaction Schemas
class TransactionBase(BaseModel):
    date: date
    type: str
    units: Optional[Decimal] = None
    price_per_unit: Optional[Decimal] = None
    amount: Optional[Decimal] = None

class TransactionCreate(TransactionBase):
    investment_id: int

class TransactionResponse(TransactionBase):
    transaction_id: int
    investment_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Goal Schemas
class GoalBase(BaseModel):
    goal_name: str
    target_amount: Decimal
    years_until_due: int
    horizon: str
    expected_return: Optional[Decimal] = None
    volatility: Optional[Decimal] = None

class GoalCreate(GoalBase):
    beneficiary_member_id: int

class GoalResponse(GoalBase):
    goal_id: int
    created_by_user_id: int
    beneficiary_member_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class GoalWithCalculations(GoalResponse):
    beneficiary_name: Optional[str] = None
    present_value: Optional[Decimal] = None
    current_allocation: Optional[Decimal] = None
    shortfall: Optional[Decimal] = None
    required_monthly_sip: Optional[Decimal] = None
    status: Optional[str] = None  # green/yellow/red
    success_probability: Optional[Decimal] = None

# Goal Investment Mapping Schemas
class GoalInvestmentMappingCreate(BaseModel):
    goal_id: int
    investment_id: int
    allocation_percentage: Optional[Decimal] = None

class GoalInvestmentMappingResponse(GoalInvestmentMappingCreate):
    map_id: int
    
    class Config:
        from_attributes = True

# Goal History Schemas
class GoalHistoryCreate(BaseModel):
    goal_id: int
    snapshot_date: date
    current_allocation: Optional[Decimal] = None
    required_pv: Optional[Decimal] = None
    success_probability: Optional[Decimal] = None

class GoalHistoryResponse(GoalHistoryCreate):
    history_id: int
    
    class Config:
        from_attributes = True

# Goal Simulation Schemas
class GoalSimulationResponse(BaseModel):
    sim_id: int
    goal_id: int
    run_timestamp: datetime
    median_outcome: Optional[Decimal] = None
    worst_case: Optional[Decimal] = None
    best_case: Optional[Decimal] = None
    success_probability: Optional[Decimal] = None
    
    class Config:
        from_attributes = True

class SimulationRequest(BaseModel):
    goal_id: int
    num_simulations: int = 5000

# Dashboard Schemas
class DashboardSummary(BaseModel):
    total_portfolio_value: Decimal
    total_invested_value: Decimal
    total_gain_loss: Decimal
    daily_change_percentage: Optional[Decimal] = None
    daily_change_amount: Optional[Decimal] = None
    num_goals: int
    num_green_goals: int
    num_yellow_goals: int
    num_red_goals: int

class PortfolioValueHistory(BaseModel):
    date: date
    value: Decimal

# Rescue Strategy Schemas
class RescueStrategy(BaseModel):
    strategy_name: str
    risk_level: str
    new_expected_return: Decimal
    new_volatility: Decimal
    required_monthly_sip: Decimal
    success_probability: Decimal
    description: str

class RescueAnalysis(BaseModel):
    goal: GoalWithCalculations
    strategies: List[RescueStrategy]
