# API Endpoints Reference Guide

## Base URL
```
http://localhost:8000
```

## Authentication Endpoints

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "created_at": "2025-12-04T10:00:00"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=yourpassword
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

## Dashboard Endpoints

### Get Dashboard Summary
```http
GET /api/dashboard/summary
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total_portfolio_value": 3035000.00,
  "total_invested_value": 2620000.00,
  "total_gain_loss": 415000.00,
  "gain_loss_percentage": 15.84,
  "daily_change_percentage": 1.5,
  "daily_change_amount": 45525.00,
  "is_daily_positive": true,
  "num_goals": 12,
  "num_green_goals": 4,
  "num_yellow_goals": 3,
  "num_red_goals": 5,
  "goals_summary": [...]
}
```

### Get Asset Allocation
```http
GET /api/dashboard/asset-allocation
Authorization: Bearer {token}
```

### Get Member Allocation
```http
GET /api/dashboard/member-allocation
Authorization: Bearer {token}
```

### Get Top Performers
```http
GET /api/dashboard/top-performers?limit=5
Authorization: Bearer {token}
```

## Goals Endpoints

### List All Goals
```http
GET /api/goals/
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "goal_id": 1,
    "goal_name": "Shubh Post Graduation",
    "target_amount": 10000000.00,
    "years_until_due": 4,
    "beneficiary_name": "Shubh Gupta",
    "present_value": 6830134.55,
    "current_allocation": 1040000.00,
    "shortfall": 5790134.55,
    "required_monthly_sip": 92844.23,
    "status": "red",
    "success_probability": 68.00
  }
]
```

### Get Goal Details
```http
GET /api/goals/{goal_id}
Authorization: Bearer {token}
```

### Create New Goal
```http
POST /api/goals/
Authorization: Bearer {token}
Content-Type: application/json

{
  "goal_name": "Child Education",
  "target_amount": 5000000,
  "years_until_due": 10,
  "horizon": "long",
  "expected_return": 10.0,
  "volatility": 12.0,
  "beneficiary_member_id": 3
}
```

### Update Goal
```http
PUT /api/goals/{goal_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "goal_name": "Updated Goal Name",
  "target_amount": 6000000,
  ...
}
```

### Delete Goal
```http
DELETE /api/goals/{goal_id}
Authorization: Bearer {token}
```

### Get Goal History
```http
GET /api/goals/{goal_id}/history
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "history_id": 1,
    "goal_id": 1,
    "snapshot_date": "2024-01-01",
    "current_allocation": 3000000.00,
    "required_pv": 8200000.00,
    "success_probability": 62.00
  }
]
```

### Run Monte Carlo Simulation
```http
POST /api/goals/{goal_id}/simulate
Authorization: Bearer {token}
Content-Type: application/json

{
  "goal_id": 1,
  "num_simulations": 5000
}
```

**Response:**
```json
{
  "sim_id": 1,
  "goal_id": 1,
  "run_timestamp": "2025-12-04T10:30:00",
  "median_outcome": 9500000.00,
  "worst_case": 6200000.00,
  "best_case": 13500000.00,
  "success_probability": 68.00
}
```

### Get Rescue Strategies
```http
GET /api/goals/{goal_id}/rescue-strategies
Authorization: Bearer {token}
```

**Response:**
```json
{
  "goal_id": 1,
  "strategies": [
    {
      "strategy_name": "Safe Strategy",
      "risk_level": "Low",
      "new_expected_return": 8.0,
      "new_volatility": 6.0,
      "required_monthly_sip": 105234.45,
      "success_probability": 72.5,
      "description": "Focus on debt funds and FDs with lower volatility"
    }
  ]
}
```

## Portfolio Endpoints

### Get Portfolio Summary
```http
GET /api/portfolio/summary
Authorization: Bearer {token}
```

### List All Investments
```http
GET /api/portfolio/investments
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "investment_id": 1,
    "name": "Axis Bluechip Fund",
    "symbol": "AXIS-BLUE",
    "asset_class_name": "Equity MF",
    "member_name": "Rajeev Gupta",
    "portfolio_name": "Rajeev Long Term",
    "invested_value": 500000.00,
    "current_value": 650000.00,
    "units": 320.0,
    "gain_loss": 150000.00,
    "gain_loss_percentage": 30.00
  }
]
```

### Get Investment Details
```http
GET /api/portfolio/investments/{investment_id}
Authorization: Bearer {token}
```

### Create Investment
```http
POST /api/portfolio/investments
Authorization: Bearer {token}
Content-Type: application/json

{
  "portfolio_id": 1,
  "member_id": 1,
  "asset_class_id": 1,
  "name": "HDFC Mid Cap Fund",
  "symbol": "HDFC-MID",
  "folio_number": "FOLIO123",
  "invested_value": 100000,
  "current_value": 120000,
  "units": 50.5
}
```

### Update Investment
```http
PUT /api/portfolio/investments/{investment_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "current_value": 130000,
  ...
}
```

### Delete Investment
```http
DELETE /api/portfolio/investments/{investment_id}
Authorization: Bearer {token}
```

### Get Investment Transactions
```http
GET /api/portfolio/investments/{investment_id}/transactions
Authorization: Bearer {token}
```

### Create Transaction
```http
POST /api/portfolio/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "investment_id": 1,
  "date": "2025-01-01",
  "type": "buy",
  "units": 10.0,
  "price_per_unit": 2000.0,
  "amount": 20000.0
}
```

### Get Asset Classes
```http
GET /api/portfolio/asset-classes
```

**Response:**
```json
[
  {
    "asset_class_id": 1,
    "name": "Equity MF"
  },
  {
    "asset_class_id": 2,
    "name": "Debt MF"
  }
]
```

## Family Endpoints

### List Family Members
```http
GET /api/family/members
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "member_id": 1,
    "user_id": 1,
    "name": "Rajeev Gupta",
    "relation": "self",
    "created_at": "2025-12-04T10:00:00"
  }
]
```

### Create Family Member
```http
POST /api/family/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "relation": "son"
}
```

### Get Member Details
```http
GET /api/family/members/{member_id}
Authorization: Bearer {token}
```

### Update Member
```http
PUT /api/family/members/{member_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "relation": "daughter"
}
```

### Delete Member
```http
DELETE /api/family/members/{member_id}
Authorization: Bearer {token}
```

### List Portfolios
```http
GET /api/family/portfolios
Authorization: Bearer {token}
```

### Create Portfolio
```http
POST /api/family/portfolios
Authorization: Bearer {token}
Content-Type: application/json

{
  "member_id": 1,
  "portfolio_name": "Retirement Fund"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Error Response Format

```json
{
  "detail": "Error message description"
}
```

## Testing with cURL

Example: Get dashboard summary
```bash
curl -X GET http://localhost:8000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing with Postman

1. Import base URL: `http://localhost:8000`
2. Set Authorization: Bearer Token
3. Add token from login response
4. Make requests to endpoints

## Rate Limiting

Currently no rate limiting is implemented. In production, consider adding rate limiting middleware.

## Pagination

Currently not implemented. All list endpoints return all records. For production, add pagination:
```
GET /api/goals/?page=1&limit=10
```
