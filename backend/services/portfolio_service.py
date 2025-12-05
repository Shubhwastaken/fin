from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Investment, Portfolio, AssetClass, FamilyMember, InvestmentTransaction
from typing import Dict, List, Optional
from decimal import Decimal
from datetime import date, timedelta

class PortfolioService:
    """
    Service for portfolio-related business logic
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_total_portfolio_value(self, user_id: int) -> Dict:
        """
        Calculate total portfolio value and gains for a user across all family members
        """
        # Get all family members for this user
        members = self.db.query(FamilyMember).filter(
            FamilyMember.user_id == user_id
        ).all()
        
        member_ids = [m.member_id for m in members]
        
        # Get all investments for these members
        investments = self.db.query(Investment).filter(
            Investment.member_id.in_(member_ids)
        ).all()
        
        total_current_value = 0
        total_invested_value = 0
        
        for inv in investments:
            if inv.current_value:
                total_current_value += float(inv.current_value)
            if inv.invested_value:
                total_invested_value += float(inv.invested_value)
        
        total_gain_loss = total_current_value - total_invested_value
        gain_loss_percentage = (total_gain_loss / total_invested_value * 100) if total_invested_value > 0 else 0
        
        return {
            'total_current_value': round(total_current_value, 2),
            'total_invested_value': round(total_invested_value, 2),
            'total_gain_loss': round(total_gain_loss, 2),
            'gain_loss_percentage': round(gain_loss_percentage, 2)
        }
    
    def get_asset_allocation(self, user_id: int) -> List[Dict]:
        """
        Get asset class wise allocation breakdown
        """
        # Get all family members for this user
        members = self.db.query(FamilyMember).filter(
            FamilyMember.user_id == user_id
        ).all()
        
        member_ids = [m.member_id for m in members]
        
        # Query asset allocation
        allocation = self.db.query(
            AssetClass.name,
            func.sum(Investment.current_value).label('total_value'),
            func.sum(Investment.invested_value).label('total_invested')
        ).join(
            Investment, Investment.asset_class_id == AssetClass.asset_class_id
        ).filter(
            Investment.member_id.in_(member_ids)
        ).group_by(
            AssetClass.asset_class_id, AssetClass.name
        ).all()
        
        total_value = sum(float(a.total_value or 0) for a in allocation)
        
        result = []
        for a in allocation:
            current_val = float(a.total_value or 0)
            invested_val = float(a.total_invested or 0)
            gain_loss = current_val - invested_val
            percentage = (current_val / total_value * 100) if total_value > 0 else 0
            
            result.append({
                'asset_class': a.name,
                'current_value': round(current_val, 2),
                'invested_value': round(invested_val, 2),
                'gain_loss': round(gain_loss, 2),
                'percentage': round(percentage, 2)
            })
        
        return result
    
    def get_member_wise_allocation(self, user_id: int) -> List[Dict]:
        """
        Get member-wise portfolio breakdown
        """
        members = self.db.query(FamilyMember).filter(
            FamilyMember.user_id == user_id
        ).all()
        
        result = []
        
        for member in members:
            investments = self.db.query(Investment).filter(
                Investment.member_id == member.member_id
            ).all()
            
            total_current = sum(float(inv.current_value or 0) for inv in investments)
            total_invested = sum(float(inv.invested_value or 0) for inv in investments)
            gain_loss = total_current - total_invested
            
            result.append({
                'member_id': member.member_id,
                'member_name': member.name,
                'relation': member.relation.value,
                'current_value': round(total_current, 2),
                'invested_value': round(total_invested, 2),
                'gain_loss': round(gain_loss, 2),
                'num_investments': len(investments)
            })
        
        return result
    
    def get_all_investments_detailed(self, user_id: int) -> List[Dict]:
        """
        Get detailed list of all investments with calculated metrics
        """
        members = self.db.query(FamilyMember).filter(
            FamilyMember.user_id == user_id
        ).all()
        
        member_ids = [m.member_id for m in members]
        
        investments = self.db.query(
            Investment,
            AssetClass.name.label('asset_class_name'),
            FamilyMember.name.label('member_name'),
            Portfolio.portfolio_name
        ).join(
            AssetClass, Investment.asset_class_id == AssetClass.asset_class_id
        ).join(
            FamilyMember, Investment.member_id == FamilyMember.member_id
        ).join(
            Portfolio, Investment.portfolio_id == Portfolio.portfolio_id
        ).filter(
            Investment.member_id.in_(member_ids)
        ).all()
        
        result = []
        
        for inv_data in investments:
            inv = inv_data[0]
            current_val = float(inv.current_value or 0)
            invested_val = float(inv.invested_value or 0)
            gain_loss = current_val - invested_val
            gain_loss_pct = (gain_loss / invested_val * 100) if invested_val > 0 else 0
            
            result.append({
                'investment_id': inv.investment_id,
                'name': inv.name,
                'symbol': inv.symbol,
                'folio_number': inv.folio_number,
                'asset_class_name': inv_data.asset_class_name,
                'member_name': inv_data.member_name,
                'portfolio_name': inv_data.portfolio_name,
                'invested_value': round(invested_val, 2),
                'current_value': round(current_val, 2),
                'units': float(inv.units) if inv.units else None,
                'gain_loss': round(gain_loss, 2),
                'gain_loss_percentage': round(gain_loss_pct, 2)
            })
        
        return result
    
    def get_investment_transactions(self, investment_id: int) -> List[Dict]:
        """
        Get all transactions for a specific investment
        """
        transactions = self.db.query(InvestmentTransaction).filter(
            InvestmentTransaction.investment_id == investment_id
        ).order_by(InvestmentTransaction.date.desc()).all()
        
        return [
            {
                'transaction_id': t.transaction_id,
                'date': t.date,
                'type': t.type.value,
                'units': float(t.units) if t.units else None,
                'price_per_unit': float(t.price_per_unit) if t.price_per_unit else None,
                'amount': float(t.amount) if t.amount else None
            }
            for t in transactions
        ]
    
    def calculate_daily_change(self, user_id: int) -> Dict:
        """
        Calculate portfolio daily change (mock implementation - needs historical data)
        
        In production, this would:
        1. Store daily portfolio snapshots
        2. Compare today's value with yesterday's value
        3. Calculate percentage change
        """
        # For now, return mock data
        # In production, query from a portfolio_value_history table
        
        current_portfolio = self.get_total_portfolio_value(user_id)
        
        # Mock: assume 1.5% daily gain
        daily_change_pct = 1.5
        daily_change_amount = current_portfolio['total_current_value'] * (daily_change_pct / 100)
        
        return {
            'daily_change_percentage': daily_change_pct,
            'daily_change_amount': round(daily_change_amount, 2),
            'is_positive': daily_change_pct >= 0
        }
    
    def get_top_performers(self, user_id: int, limit: int = 5) -> List[Dict]:
        """
        Get top performing investments by gain percentage
        """
        investments = self.get_all_investments_detailed(user_id)
        
        # Sort by gain_loss_percentage descending
        sorted_investments = sorted(
            investments,
            key=lambda x: x['gain_loss_percentage'],
            reverse=True
        )
        
        return sorted_investments[:limit]
    
    def get_worst_performers(self, user_id: int, limit: int = 5) -> List[Dict]:
        """
        Get worst performing investments by gain percentage
        """
        investments = self.get_all_investments_detailed(user_id)
        
        # Sort by gain_loss_percentage ascending
        sorted_investments = sorted(
            investments,
            key=lambda x: x['gain_loss_percentage']
        )
        
        return sorted_investments[:limit]
