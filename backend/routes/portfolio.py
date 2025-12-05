from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_user
from models import User, Investment, InvestmentTransaction, Portfolio, AssetClass
from schemas import InvestmentCreate, InvestmentResponse, InvestmentWithDetails, TransactionCreate, TransactionResponse
from services.portfolio_service import PortfolioService

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

@router.get("/summary")
def get_portfolio_summary(
    db: Session = Depends(get_db)
):
    """Get overall portfolio summary"""
    user_id = 1
    portfolio_service = PortfolioService(db)
    return portfolio_service.get_total_portfolio_value(user_id)

@router.get("/investments", response_model=List[InvestmentWithDetails])
def get_all_investments(
    db: Session = Depends(get_db)
):
    """Get all investments with details"""
    user_id = 1
    portfolio_service = PortfolioService(db)
    return portfolio_service.get_all_investments_detailed(user_id)

@router.get("/investments/{investment_id}", response_model=InvestmentWithDetails)
def get_investment_details(
    investment_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific investment"""
    user_id = 1
    portfolio_service = PortfolioService(db)
    all_investments = portfolio_service.get_all_investments_detailed(user_id)
    
    investment = next((inv for inv in all_investments if inv['investment_id'] == investment_id), None)
    
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    return investment

@router.post("/investments", response_model=InvestmentResponse, status_code=status.HTTP_201_CREATED)
def create_investment(
    investment_data: InvestmentCreate,
    db: Session = Depends(get_db)
):
    """Create a new investment"""
    # Verify portfolio belongs to user's family member
    portfolio = db.query(Portfolio).filter(Portfolio.portfolio_id == investment_data.portfolio_id).first()
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    new_investment = Investment(
        portfolio_id=investment_data.portfolio_id,
        member_id=investment_data.member_id,
        asset_class_id=investment_data.asset_class_id,
        name=investment_data.name,
        symbol=investment_data.symbol,
        folio_number=investment_data.folio_number,
        invested_value=investment_data.invested_value,
        current_value=investment_data.current_value,
        units=investment_data.units
    )
    
    db.add(new_investment)
    db.commit()
    db.refresh(new_investment)
    
    return new_investment

@router.put("/investments/{investment_id}", response_model=InvestmentResponse)
def update_investment(
    investment_id: int,
    investment_data: InvestmentCreate,
    db: Session = Depends(get_db)
):
    """Update an existing investment"""
    investment = db.query(Investment).filter(Investment.investment_id == investment_id).first()
    
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    # Update fields
    investment.name = investment_data.name
    investment.symbol = investment_data.symbol
    investment.folio_number = investment_data.folio_number
    investment.invested_value = investment_data.invested_value
    investment.current_value = investment_data.current_value
    investment.units = investment_data.units
    investment.asset_class_id = investment_data.asset_class_id
    
    db.commit()
    db.refresh(investment)
    
    return investment

@router.delete("/investments/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investment(
    investment_id: int,
    db: Session = Depends(get_db)
):
    """Delete an investment"""
    investment = db.query(Investment).filter(Investment.investment_id == investment_id).first()
    
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    db.delete(investment)
    db.commit()
    
    return None

@router.get("/investments/{investment_id}/transactions", response_model=List[TransactionResponse])
def get_investment_transactions(
    investment_id: int,
    db: Session = Depends(get_db)
):
    """Get all transactions for an investment"""
    portfolio_service = PortfolioService(db)
    return portfolio_service.get_investment_transactions(investment_id)

@router.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db)
):
    """Create a new investment transaction"""
    # Verify investment exists
    investment = db.query(Investment).filter(
        Investment.investment_id == transaction_data.investment_id
    ).first()
    
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    new_transaction = InvestmentTransaction(
        investment_id=transaction_data.investment_id,
        date=transaction_data.date,
        type=transaction_data.type,
        units=transaction_data.units,
        price_per_unit=transaction_data.price_per_unit,
        amount=transaction_data.amount
    )
    
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    
    return new_transaction

@router.get("/asset-classes")
def get_asset_classes(db: Session = Depends(get_db)):
    """Get all available asset classes"""
    asset_classes = db.query(AssetClass).all()
    return [{"asset_class_id": ac.asset_class_id, "name": ac.name} for ac in asset_classes]
