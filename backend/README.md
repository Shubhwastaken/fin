# Backend Quick Start Guide

## Prerequisites Check

Before starting, verify you have:
- Python 3.9+ installed
- MySQL server running
- Database `family_wealth_planner` created with all tables

## Step-by-Step Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows (PowerShell):**
```powershell
venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Create .env File

Create a file named `.env` in the `backend` directory with:

```env
DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/family_wealth_planner
SECRET_KEY=generate-a-secret-key-using-openssl-or-python-secrets
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**To generate a secure SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5. Test Database Connection

```bash
python -c "from database import engine; print('✓ Database connected successfully!' if engine.connect() else '✗ Connection failed')"
```

### 6. Run the Server

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 7. Verify Installation

Open browser and visit:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## Testing API Endpoints

### Register a Test User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"testpass123\"}"
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=testpass123"
```

Save the returned `access_token` for authenticated requests.

### Get Dashboard Summary (requires token)

```bash
curl -X GET http://localhost:8000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Common Issues

### Issue: ModuleNotFoundError
**Solution:** Make sure virtual environment is activated and dependencies are installed.

### Issue: Database connection failed
**Solution:** 
- Verify MySQL is running
- Check DATABASE_URL in .env
- Ensure database exists
- Verify MySQL user permissions

### Issue: Import errors
**Solution:** Run from backend directory and ensure all dependencies are installed.

## Development Mode

The server runs with auto-reload enabled. Any code changes will automatically restart the server.

## Production Mode

For production, use gunicorn:

```bash
pip install gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | MySQL connection string | `mysql+pymysql://user:pass@host:port/db` |
| SECRET_KEY | JWT secret key | Random 32+ character string |
| ALGORITHM | JWT algorithm | `HS256` |
| ACCESS_TOKEN_EXPIRE_MINUTES | Token expiry time | `30` |

## Next Steps

After backend is running:
1. Set up the frontend (see frontend README)
2. Test API endpoints using Swagger UI
3. Create test data or use existing sample data
4. Start building features!
