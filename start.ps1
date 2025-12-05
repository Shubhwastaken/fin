# Family Wealth Planner - Start Script
# This script starts both backend and frontend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Family Wealth Planner - Starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

# Check if .env exists
if (-not (Test-Path "$backendPath\.env")) {
    Write-Host "⚠ Backend .env file not found!" -ForegroundColor Red
    Write-Host "Please create backend/.env with your database credentials" -ForegroundColor Yellow
    Write-Host "See backend/.env.example for reference" -ForegroundColor Yellow
    exit 1
}

# Function to start backend
function Start-Backend {
    Write-Host "Starting Backend Server..." -ForegroundColor Yellow
    Set-Location $backendPath
    & ".\venv\Scripts\Activate.ps1"
    python main.py
}

# Function to start frontend
function Start-Frontend {
    Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
    Set-Location $frontendPath
    npm run dev
}

# Start backend in a new window
Write-Host "Launching Backend Server (new window)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; .\venv\Scripts\Activate.ps1; python main.py"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new window
Write-Host "Launching Frontend Server (new window)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servers Starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Frontend App: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Check the opened terminal windows for server logs." -ForegroundColor Yellow
Write-Host "Press Ctrl+C in each window to stop the servers." -ForegroundColor Yellow
Write-Host ""
