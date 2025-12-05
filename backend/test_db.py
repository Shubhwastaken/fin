from database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✓ Database connection successful!")
        
        result = conn.execute(text("SELECT COUNT(*) FROM users"))
        count = result.scalar()
        print(f"✓ Found {count} users in database")
        
        result = conn.execute(text("SELECT COUNT(*) FROM goals"))
        count = result.scalar()
        print(f"✓ Found {count} goals in database")
        
except Exception as e:
    print(f"✗ Database connection failed: {e}")
