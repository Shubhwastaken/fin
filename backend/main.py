from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, dashboard, goals, portfolio, family, market

app = FastAPI(
    title="Family Wealth Planner API",
    description="API for managing family investments, portfolios, and financial goals",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(goals.router)
app.include_router(portfolio.router)
app.include_router(family.router)
app.include_router(market.router)

@app.get("/")
def root():
    return {
        "message": "Family Wealth Planner API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
