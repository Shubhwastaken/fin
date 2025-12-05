from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_user
from models import User, FamilyMember, Portfolio
from schemas import FamilyMemberCreate, FamilyMemberResponse, PortfolioCreate, PortfolioResponse

router = APIRouter(prefix="/api/family", tags=["family"])

@router.get("/members", response_model=List[FamilyMemberResponse])
def get_family_members(
    db: Session = Depends(get_db)
):
    """Get all family members for the current user"""
    user_id = 1  # Demo mode
    members = db.query(FamilyMember).filter(
        FamilyMember.user_id == user_id
    ).all()
    
    return members

@router.post("/members", response_model=FamilyMemberResponse, status_code=status.HTTP_201_CREATED)
def create_family_member(
    member_data: FamilyMemberCreate,
    db: Session = Depends(get_db)
):
    """Add a new family member"""
    user_id = 1  # Demo mode
    new_member = FamilyMember(
        user_id=user_id,
        name=member_data.name,
        relation=member_data.relation
    )
    
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    return new_member

@router.get("/members/{member_id}", response_model=FamilyMemberResponse)
def get_family_member(
    member_id: int,
    db: Session = Depends(get_db)
):
    """Get details of a specific family member"""
    user_id = 1  # Demo mode
    member = db.query(FamilyMember).filter(
        FamilyMember.member_id == member_id,
        FamilyMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    return member

@router.put("/members/{member_id}", response_model=FamilyMemberResponse)
def update_family_member(
    member_id: int,
    member_data: FamilyMemberCreate,
    db: Session = Depends(get_db)
):
    """Update a family member"""
    user_id = 1  # Demo mode
    member = db.query(FamilyMember).filter(
        FamilyMember.member_id == member_id,
        FamilyMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    member.name = member_data.name
    member.relation = member_data.relation
    
    db.commit()
    db.refresh(member)
    
    return member

@router.delete("/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_family_member(
    member_id: int,
    db: Session = Depends(get_db)
):
    """Delete a family member"""
    user_id = 1  # Demo mode
    member = db.query(FamilyMember).filter(
        FamilyMember.member_id == member_id,
        FamilyMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    db.delete(member)
    db.commit()
    
    return None

@router.get("/portfolios", response_model=List[PortfolioResponse])
def get_portfolios(
    db: Session = Depends(get_db)
):
    """Get all portfolios for the user's family"""
    user_id = 1  # Demo mode
    # Get all family members
    members = db.query(FamilyMember).filter(
        FamilyMember.user_id == user_id
    ).all()
    
    member_ids = [m.member_id for m in members]
    
    # Get portfolios for these members
    portfolios = db.query(Portfolio).filter(
        Portfolio.member_id.in_(member_ids)
    ).all()
    
    return portfolios

@router.post("/portfolios", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
def create_portfolio(
    portfolio_data: PortfolioCreate,
    db: Session = Depends(get_db)
):
    """Create a new portfolio"""
    user_id = 1  # Demo mode
    # Verify member belongs to current user
    member = db.query(FamilyMember).filter(
        FamilyMember.member_id == portfolio_data.member_id,
        FamilyMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    new_portfolio = Portfolio(
        member_id=portfolio_data.member_id,
        portfolio_name=portfolio_data.portfolio_name
    )
    
    db.add(new_portfolio)
    db.commit()
    db.refresh(new_portfolio)
    
    return new_portfolio
