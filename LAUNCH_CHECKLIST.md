# 🚀 Launch Checklist - Family Wealth Planner

Use this checklist to ensure everything is set up correctly before running the application.

---

## ✅ Pre-Launch Checklist

### System Requirements
- [ ] Python 3.9+ installed and in PATH
- [ ] Node.js 18+ installed and in PATH
- [ ] MySQL 8.0+ installed and running
- [ ] Git installed (optional, for version control)

### Database Setup
- [ ] MySQL server is running
- [ ] Database `family_wealth_planner` exists
- [ ] All 10 tables created and populated with sample data
- [ ] Can connect to database using MySQL Workbench or CLI

### Backend Setup
- [ ] Virtual environment created (`backend/venv`)
- [ ] All Python packages installed (`pip install -r requirements.txt`)
- [ ] `.env` file created in `backend/` directory
- [ ] DATABASE_URL configured with correct MySQL credentials
- [ ] SECRET_KEY generated and added to `.env`
- [ ] Can activate virtual environment successfully

### Frontend Setup
- [ ] Node modules installed (`npm install` completed)
- [ ] `.env.local` file created in `frontend/` directory
- [ ] NEXT_PUBLIC_API_URL set to `http://localhost:8000`
- [ ] No installation errors

---

## 🔧 Configuration Checklist

### Backend .env File
```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/family_wealth_planner
SECRET_KEY=your-generated-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

- [ ] DATABASE_URL has correct MySQL password
- [ ] DATABASE_URL has correct database name
- [ ] SECRET_KEY is set (not the default)
- [ ] All required variables present

### Frontend .env.local File
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- [ ] NEXT_PUBLIC_API_URL points to backend
- [ ] No trailing slash in URL

---

## 🚀 Launch Checklist

### Start Backend
- [ ] Open Terminal/PowerShell window
- [ ] Navigate to backend directory
- [ ] Activate virtual environment
- [ ] Run `python main.py`
- [ ] See "Uvicorn running on http://0.0.0.0:8000"
- [ ] No error messages in console
- [ ] Can access http://localhost:8000/health
- [ ] Can access http://localhost:8000/docs

### Start Frontend
- [ ] Open new Terminal/PowerShell window
- [ ] Navigate to frontend directory
- [ ] Run `npm run dev`
- [ ] See "Ready in X seconds"
- [ ] See "Local: http://localhost:3000"
- [ ] No compilation errors
- [ ] Can access http://localhost:3000

---

## 🧪 Testing Checklist

### Backend API Tests
- [ ] Access Swagger UI at http://localhost:8000/docs
- [ ] POST `/api/auth/register` - Create test user
- [ ] POST `/api/auth/login` - Get access token
- [ ] Copy token for testing
- [ ] GET `/api/dashboard/summary` - Returns data (with token)
- [ ] GET `/api/goals/` - Returns goals list (with token)
- [ ] GET `/api/portfolio/investments` - Returns investments (with token)

### Frontend UI Tests
- [ ] Access http://localhost:3000
- [ ] Redirects to /dashboard
- [ ] Dashboard loads without errors
- [ ] Portfolio value cards display
- [ ] Asset allocation chart renders
- [ ] Goal cards display (if goals exist)
- [ ] Click on "View All Goals" link
- [ ] Goals list page loads
- [ ] Click on a goal card
- [ ] Goal details page loads
- [ ] Progress chart renders
- [ ] Navigate to Portfolio page
- [ ] Investments table displays

### Integration Tests
- [ ] Data in frontend matches backend API
- [ ] Clicking refresh updates data
- [ ] Status colors (green/yellow/red) display correctly
- [ ] Currency formatting shows ₹ symbol
- [ ] Percentages format correctly
- [ ] Charts are interactive (hover shows tooltips)
- [ ] No console errors in browser developer tools
- [ ] No CORS errors

---

## 🔍 Verification Tests

### Database Connection
Test database connection:
```bash
cd backend
.\venv\Scripts\Activate.ps1
python -c "from database import engine; print('✓ Connected!' if engine.connect() else '✗ Failed')"
```
- [ ] Prints "✓ Connected!"

### API Health Check
```bash
curl http://localhost:8000/health
```
Expected response: `{"status":"healthy"}`
- [ ] Returns healthy status

### Dashboard Summary
```bash
curl -X GET http://localhost:8000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns JSON with portfolio data
- [ ] No error messages

### Frontend Build Test (Optional)
```bash
cd frontend
npm run build
```
- [ ] Builds successfully
- [ ] No TypeScript errors
- [ ] No build warnings (major ones)

---

## 📊 Sample Data Verification

### Verify Sample Data Exists
Run in MySQL:
```sql
SELECT COUNT(*) FROM users;           -- Should be 1
SELECT COUNT(*) FROM family_members;  -- Should be 11
SELECT COUNT(*) FROM portfolios;      -- Should be 12
SELECT COUNT(*) FROM investments;     -- Should be 12
SELECT COUNT(*) FROM goals;           -- Should be 12
SELECT COUNT(*) FROM goal_history;    -- Should be 12
```

- [ ] All tables have data
- [ ] User exists: rajeevgupta@example.com
- [ ] Family members exist
- [ ] Investments have current_value > 0
- [ ] Goals have target_amount > 0

---

## 🐛 Troubleshooting Checklist

### If Backend Won't Start
- [ ] Check MySQL is running
- [ ] Verify DATABASE_URL is correct
- [ ] Check venv is activated
- [ ] Try reinstalling: `pip install -r requirements.txt`
- [ ] Check port 8000 is not in use
- [ ] Look at error message in console

### If Frontend Won't Start
- [ ] Delete `.next` folder
- [ ] Delete `node_modules` folder
- [ ] Run `npm install` again
- [ ] Check port 3000 is not in use
- [ ] Verify .env.local exists
- [ ] Check for syntax errors in code

### If API Calls Fail
- [ ] Check backend is running
- [ ] Verify NEXT_PUBLIC_API_URL
- [ ] Check browser console for errors
- [ ] Verify CORS settings in main.py
- [ ] Check authentication token is valid
- [ ] Try logging in again

### If Charts Don't Render
- [ ] Check browser console for errors
- [ ] Verify data format matches Recharts
- [ ] Check if data is empty
- [ ] Try different browser
- [ ] Clear browser cache

---

## 📝 Post-Launch Checklist

### Documentation Review
- [ ] Read main README.md
- [ ] Review API_REFERENCE.md
- [ ] Understand project structure in PROJECT_SUMMARY.md
- [ ] Bookmark API docs at /docs

### User Testing
- [ ] Create a test user account
- [ ] Add a family member
- [ ] Create a portfolio
- [ ] Add an investment
- [ ] Create a goal
- [ ] Run a simulation
- [ ] View rescue strategies

### Performance Check
- [ ] Dashboard loads in < 2 seconds
- [ ] API responses < 500ms
- [ ] Charts render smoothly
- [ ] No memory leaks (check Task Manager)
- [ ] No excessive console logging

---

## ✨ Success Criteria

Application is ready when:
- [x] Both servers start without errors
- [x] All pages load successfully
- [x] API returns correct data
- [x] Charts render properly
- [x] CRUD operations work
- [x] Calculations are accurate
- [x] No console errors
- [x] Responsive on mobile

---

## 📞 Getting Help

If issues persist:

1. Check error messages in:
   - Backend terminal
   - Frontend terminal
   - Browser console (F12)

2. Review documentation:
   - README.md
   - backend/README.md
   - frontend/README.md
   - API_REFERENCE.md

3. Common issues:
   - Database connection → Check .env
   - Port in use → Change port or close other app
   - Module not found → Reinstall dependencies
   - CORS error → Check backend CORS settings

4. Test individually:
   - Test backend API first (using /docs)
   - Then test frontend

---

## 🎉 Ready to Launch!

Once all items are checked:

1. Run `.\start.ps1` to start both servers
2. Open http://localhost:3000
3. Start exploring the application!

**Enjoy your Family Wealth Planner! 🚀**
