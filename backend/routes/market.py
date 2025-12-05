from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Investment, Portfolio, FamilyMember
from services.market_data_service import MarketDataService

router = APIRouter(prefix="/api/market", tags=["Market Data"])

@router.get("/indices")
async def get_market_indices(
    indices: Optional[str] = "NIFTY50,SENSEX,BANKNIFTY",
    db: Session = Depends(get_db)
):
    """Get real-time market indices data"""
    index_list = indices.split(",")
    results = {}
    
    for index in index_list:
        data = MarketDataService.get_index_data(index.strip())
        if data:
            results[index.strip()] = data
    
    return results

@router.get("/stock/{symbol}")
async def get_stock_data(
    symbol: str,
    exchange: str = "NS",
    db: Session = Depends(get_db)
):
    """Get real-time stock price for any NSE/BSE stock (CDSL, MCX, Kaynes, etc.)"""
    data = MarketDataService.get_stock_price(symbol, exchange)
    if not data:
        raise HTTPException(status_code=404, detail=f"Stock data not found for {symbol}.{exchange}")
    return data

@router.get("/mutual-fund/{scheme_code}")
async def get_mutual_fund_nav(
    scheme_code: str,
    db: Session = Depends(get_db)
):
    """Get latest NAV for mutual fund"""
    data = MarketDataService.get_mutual_fund_nav(scheme_code)
    if not data:
        raise HTTPException(status_code=404, detail="MF NAV not found")
    return data

@router.post("/stocks/batch")
async def get_multiple_stocks(
    symbols: List[str],
    exchange: str = "NS",
    db: Session = Depends(get_db)
):
    """Get prices for multiple stocks at once"""
    results = MarketDataService.get_multiple_stocks(symbols, exchange)
    return results

@router.get("/portfolio/realtime")
async def get_portfolio_realtime(
    db: Session = Depends(get_db)
):
    """Get real-time portfolio valuation with live stock/MF prices"""
    user_id = 1  # Demo mode
    
    # Get all family members
    members = db.query(FamilyMember).filter(FamilyMember.user_id == user_id).all()
    member_ids = [m.member_id for m in members]
    
    # Get all portfolios
    portfolios = db.query(Portfolio).filter(Portfolio.member_id.in_(member_ids)).all()
    portfolio_ids = [p.portfolio_id for p in portfolios]
    
    # Get all investments
    investments = db.query(Investment).filter(Investment.portfolio_id.in_(portfolio_ids)).all()
    
    total_current_value = 0
    total_invested_value = 0
    updated_investments = []
    
    for inv in investments:
        inv_dict = {
            "investment_id": inv.investment_id,
            "name": inv.name,
            "symbol": inv.symbol,
            "asset_class_name": "Unknown",
            "units": float(inv.units) if inv.units else 0,
            "invested_value": float(inv.invested_value) if inv.invested_value else 0,
            "current_value": float(inv.current_value) if inv.current_value else 0,
        }
        
        # Update with real-time data
        updated_inv = MarketDataService.update_investment_current_value(inv_dict)
        updated_investments.append(updated_inv)
        
        total_current_value += updated_inv.get('current_value', 0)
        total_invested_value += updated_inv.get('invested_value', 0)
    
    total_gain = total_current_value - total_invested_value
    total_gain_percent = (total_gain / total_invested_value * 100) if total_invested_value > 0 else 0
    
    return {
        "total_current_value": round(total_current_value, 2),
        "total_invested_value": round(total_invested_value, 2),
        "total_gain": round(total_gain, 2),
        "total_gain_percent": round(total_gain_percent, 2),
        "investments": updated_investments,
        "timestamp": MarketDataService.get_index_data("NIFTY50").get("timestamp") if MarketDataService.get_index_data("NIFTY50") else None
    }
