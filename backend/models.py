from sqlalchemy import Column, Integer, String, DECIMAL, Date, DateTime, ForeignKey, Enum as SQLEnum, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Relationships
    family_members = relationship("FamilyMember", back_populates="user")
    goals = relationship("Goal", back_populates="creator")


class RelationEnum(str, enum.Enum):
    self = "self"
    spouse = "spouse"
    son = "son"
    daughter = "daughter"
    father = "father"
    mother = "mother"
    sister = "sister"
    brother = "brother"
    other = "other"


class FamilyMember(Base):
    __tablename__ = "family_members"
    
    member_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    name = Column(String(255), nullable=False)
    relation = Column(SQLEnum(RelationEnum), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="family_members")
    portfolios = relationship("Portfolio", back_populates="member")
    investments = relationship("Investment", back_populates="member")
    goals_as_beneficiary = relationship("Goal", back_populates="beneficiary")


class Portfolio(Base):
    __tablename__ = "portfolios"
    
    portfolio_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    member_id = Column(Integer, ForeignKey("family_members.member_id"), nullable=False)
    portfolio_name = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Relationships
    member = relationship("FamilyMember", back_populates="portfolios")
    investments = relationship("Investment", back_populates="portfolio")


class AssetClass(Base):
    __tablename__ = "asset_classes"
    
    asset_class_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), unique=True, nullable=False)
    
    # Relationships
    investments = relationship("Investment", back_populates="asset_class")


class Investment(Base):
    __tablename__ = "investments"
    
    investment_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.portfolio_id"), nullable=False)
    member_id = Column(Integer, ForeignKey("family_members.member_id"), nullable=False)
    asset_class_id = Column(Integer, ForeignKey("asset_classes.asset_class_id"), nullable=False)
    name = Column(String(255), nullable=False)
    symbol = Column(String(100))
    folio_number = Column(String(100))
    invested_value = Column(DECIMAL(15, 2))
    current_value = Column(DECIMAL(15, 2))
    units = Column(DECIMAL(15, 4))
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Relationships
    portfolio = relationship("Portfolio", back_populates="investments")
    member = relationship("FamilyMember", back_populates="investments")
    asset_class = relationship("AssetClass", back_populates="investments")
    transactions = relationship("InvestmentTransaction", back_populates="investment")
    goal_mappings = relationship("GoalInvestmentMapping", back_populates="investment")


class TransactionTypeEnum(str, enum.Enum):
    buy = "buy"
    sell = "sell"
    sip = "sip"
    dividend = "dividend"
    split = "split"
    bonus = "bonus"


class InvestmentTransaction(Base):
    __tablename__ = "investment_transactions"
    
    transaction_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    investment_id = Column(Integer, ForeignKey("investments.investment_id"), nullable=False)
    date = Column(Date, nullable=False)
    type = Column(SQLEnum(TransactionTypeEnum), nullable=False)
    units = Column(DECIMAL(15, 4))
    price_per_unit = Column(DECIMAL(15, 4))
    amount = Column(DECIMAL(15, 2))
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Relationships
    investment = relationship("Investment", back_populates="transactions")


class HorizonEnum(str, enum.Enum):
    short = "short"
    medium = "medium"
    long = "long"
    retirement = "retirement"


class Goal(Base):
    __tablename__ = "goals"
    
    goal_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_by_user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    beneficiary_member_id = Column(Integer, ForeignKey("family_members.member_id"), nullable=False)
    goal_name = Column(String(255), nullable=False)
    target_amount = Column(DECIMAL(15, 2), nullable=False)
    years_until_due = Column(Integer, nullable=False)
    horizon = Column(SQLEnum(HorizonEnum), nullable=False)
    expected_return = Column(DECIMAL(5, 2))
    volatility = Column(DECIMAL(5, 2))
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Relationships
    creator = relationship("User", back_populates="goals")
    beneficiary = relationship("FamilyMember", back_populates="goals_as_beneficiary")
    investment_mappings = relationship("GoalInvestmentMapping", back_populates="goal")
    history = relationship("GoalHistory", back_populates="goal")
    simulation_history = relationship("GoalSimulationHistory", back_populates="goal")


class GoalInvestmentMapping(Base):
    __tablename__ = "goal_investment_mapping"
    
    map_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    goal_id = Column(Integer, ForeignKey("goals.goal_id"), nullable=False)
    investment_id = Column(Integer, ForeignKey("investments.investment_id"), nullable=False)
    allocation_percentage = Column(DECIMAL(5, 2))
    
    # Relationships
    goal = relationship("Goal", back_populates="investment_mappings")
    investment = relationship("Investment", back_populates="goal_mappings")


class GoalHistory(Base):
    __tablename__ = "goal_history"
    
    history_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    goal_id = Column(Integer, ForeignKey("goals.goal_id"), nullable=False)
    snapshot_date = Column(Date, nullable=False)
    current_allocation = Column(DECIMAL(15, 2))
    required_pv = Column(DECIMAL(15, 2))
    success_probability = Column(DECIMAL(5, 2))
    
    # Relationships
    goal = relationship("Goal", back_populates="history")


class GoalSimulationHistory(Base):
    __tablename__ = "goal_simulation_history"
    
    sim_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    goal_id = Column(Integer, ForeignKey("goals.goal_id"), nullable=False)
    run_timestamp = Column(TIMESTAMP, server_default=func.current_timestamp())
    median_outcome = Column(DECIMAL(15, 2))
    worst_case = Column(DECIMAL(15, 2))
    best_case = Column(DECIMAL(15, 2))
    success_probability = Column(DECIMAL(5, 2))
    
    # Relationships
    goal = relationship("Goal", back_populates="simulation_history")
