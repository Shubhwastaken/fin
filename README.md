# Family Wealth Planner - Full Stack MVP

A comprehensive fintech application for managing family investments, portfolios, and financial goals with Monte Carlo simulations and goal tracking.

## 🎯 Project Overview

This application enables a family to:
- Track multiple financial goals (education, marriage, retirement, etc.)
- Manage investments across mutual funds, stocks, FDs, gold, bonds, NPS
- Monitor portfolio performance with daily changes
- Run Monte Carlo simulations for goal success probability
- Visualize goal progress over time with interactive charts
- Get rescue strategies for at-risk goals

## 📊 Database Schema

The MySQL database contains 10 tables:
- `users` - Main account owners
- `family_members` - Family members linked to users
- `portfolios` - Investment portfolios per member
- `asset_classes` - Types of assets (Equity MF, Debt MF, Stocks, etc.)
- `investments` - Individual investment holdings
- `investment_transactions` - Transaction history (buy/sell/SIP)
- `goals` - Financial goals with targets and timelines
- `goal_investment_mapping` - Links investments to goals
- `goal_history` - Historical tracking of goal progress
- `goal_simulation_history` - Monte Carlo simulation results

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Python 3.9+
- **ORM**: SQLAlchemy with MySQL
- **Authentication**: JWT tokens
- **Services**:
  - Financial Calculator (PV, SIP, Monte Carlo)
  - Goal Service (metrics, simulations, rescue strategies)
  - Portfolio Service (aggregation, analytics)

### Frontend (Next.js 14 + React)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **API Client**: Axios
- **Key Pages**:
  - Dashboard (portfolio summary, goal cards)
  - Goals (list, details, progress charts)
  - Portfolio (investments table, asset allocation)

## 🚀 Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- MySQL 8.0+
- Git

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables:**
Create `.env` file in backend directory:
```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/family_wealth_planner
SECRET_KEY=your-secret-key-generate-a-strong-one
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

5. **Verify database connection:**
The database should already exist with all tables and sample data. Verify connection:
```bash
python -c "from database import engine; print(engine.connect())"
```

6. **Run the backend server:**
```bash
python main.py
```

Backend will run on `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create `.env.local` file in frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **Run the development server:**
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Dashboard
- `GET /api/dashboard/summary` - Portfolio & goals summary
- `GET /api/dashboard/asset-allocation` - Asset class breakdown
- `GET /api/dashboard/member-allocation` - Member-wise holdings
- `GET /api/dashboard/top-performers` - Best performing investments
- `GET /api/dashboard/worst-performers` - Worst performing investments

### Goals
- `GET /api/goals/` - List all goals with calculations
- `GET /api/goals/{id}` - Get goal details
- `POST /api/goals/` - Create new goal
- `PUT /api/goals/{id}` - Update goal
- `DELETE /api/goals/{id}` - Delete goal
- `GET /api/goals/{id}/history` - Get historical progress
- `POST /api/goals/{id}/simulate` - Run Monte Carlo simulation
- `GET /api/goals/{id}/rescue-strategies` - Get rescue strategies

### Portfolio
- `GET /api/portfolio/summary` - Portfolio summary
- `GET /api/portfolio/investments` - List all investments
- `GET /api/portfolio/investments/{id}` - Investment details
- `POST /api/portfolio/investments` - Add investment
- `PUT /api/portfolio/investments/{id}` - Update investment
- `DELETE /api/portfolio/investments/{id}` - Delete investment
- `GET /api/portfolio/investments/{id}/transactions` - Transaction history
- `POST /api/portfolio/transactions` - Add transaction
- `GET /api/portfolio/asset-classes` - List asset classes

### Family
- `GET /api/family/members` - List family members
- `POST /api/family/members` - Add family member
- `GET /api/family/members/{id}` - Member details
- `PUT /api/family/members/{id}` - Update member
- `DELETE /api/family/members/{id}` - Delete member
- `GET /api/family/portfolios` - List all portfolios
- `POST /api/family/portfolios` - Create portfolio

## 🧮 Financial Calculations

### Present Value (PV)
```
PV = FV / (1 + r)^n
```
Where:
- FV = Future Value (target amount)
- r = Expected annual return rate
- n = Number of years

### Required Monthly SIP
```
SIP = Shortfall × r / ((1 + r)^n - 1)
```
Where r is monthly rate (annual_rate / 12)

### Monte Carlo Simulation
- Runs 5000 simulations
- Uses expected return and volatility
- Generates random returns using normal distribution
- Outputs: median, worst case (10th percentile), best case (90th percentile), success probability

### Goal Status
- **Green**: >= 80% allocated OR success probability >= 70%
- **Yellow**: 50-80% allocated OR success probability 50-70%
- **Red**: < 50% allocated OR success probability < 50%

## 📈 Features Implementation

### ✅ Implemented Features

1. **Dashboard**
   - Total portfolio value with daily change
   - Asset allocation pie chart
   - Goal status summary (green/yellow/red counts)
   - Quick action buttons
   - Top/worst performers

2. **Goals Module**
   - Create, update, delete goals
   - Calculate PV, shortfall, required SIP
   - View goal details with beneficiary info
   - Progress tracking over time
   - Interactive progress charts

3. **Goal Simulation**
   - Run Monte Carlo simulations (5000 runs)
   - View median, best, worst case outcomes
   - Calculate success probability
   - Store simulation history

4. **Rescue Strategies**
   - Safe strategy (8% return, 6% volatility)
   - Balanced strategy (10% return, 10% volatility)
   - Aggressive strategy (14% return, 18% volatility)
   - Show required SIP for each strategy

5. **Portfolio Management**
   - List all investments with details
   - View by asset class or member
   - Add/edit/delete investments
   - Transaction tracking
   - Gain/loss calculations

6. **Visualizations**
   - Goal progress line charts (Recharts)
   - Asset allocation pie chart
   - Status indicators (color-coded badges)
   - Progress bars

## 🎨 UI Components

### Dashboard Page
- Portfolio value cards with daily change indicator
- Asset allocation chart
- Goals summary with status counts
- Quick action buttons
- Top 6 goal cards preview

### Goals List Page
- Filter tabs (All/Green/Yellow/Red)
- Goal cards grid
- Status badges and progress bars
- Create new goal button

### Goal Details Page
- Key metrics (target, PV, current, shortfall)
- Historical progress chart
- Monte Carlo simulation section
- Rescue strategies (if at risk)
- Alert banners for at-risk goals

### Portfolio Page
- Summary cards (current value, invested, gain/loss)
- Investments table with sorting
- Asset class badges
- Gain/loss indicators with trend icons

## 🔒 Security

- JWT authentication for all protected routes
- Password hashing using bcrypt
- CORS configured for frontend origin
- Environment variables for sensitive data
- SQL injection prevention via ORM

## 🧪 Testing

Run backend tests:
```bash
cd backend
pytest
```

Run frontend tests:
```bash
cd frontend
npm test
```

## 📝 Sample Data

The database comes pre-populated with:
- 1 user (Rajeev Gupta)
- 11 family members
- 12 portfolios
- 9 asset classes
- 12 investments across various classes
- 12 goals with different horizons
- Historical tracking and simulation data

### Test User Credentials
```
Email: rajeevgupta@example.com
Password: (use hashed_password_123 - needs to be hashed first)
```

To create a test user via API:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

## 🚀 Deployment

### Backend Deployment
1. Set up production database
2. Update environment variables
3. Use gunicorn for production:
```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Deployment
1. Build production bundle:
```bash
npm run build
```
2. Deploy to Vercel, Netlify, or serve with:
```bash
npm start
```

## 📚 Tech Stack Summary

**Backend:**
- FastAPI 0.109.0
- SQLAlchemy 2.0.25
- PyMySQL 1.1.0
- NumPy 1.26.3 (for Monte Carlo)
- python-jose (JWT)
- passlib (password hashing)

**Frontend:**
- Next.js 14
- React 18
- TypeScript 5
- Tailwind CSS 3.4
- Recharts 2.10
- Axios 1.6
- Lucide React (icons)

**Database:**
- MySQL 8.0

## 🤝 Contributing

This is an MVP. Future enhancements:
- Real-time portfolio value updates
- Email notifications for goal deadlines
- PDF report generation
- Multi-currency support
- Tax calculations
- Benchmark comparison (NIFTY 500)
- Mobile app (React Native)

## 📄 License

Private project - All rights reserved

## 👥 Support

For issues or questions:
1. Check API documentation at `/docs`
2. Review error logs in terminal
3. Verify database connection
4. Check environment variables

---

**Built with ❤️ for smart family financial planning**
