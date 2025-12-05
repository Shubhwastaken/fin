import yfinance as yf
from typing import Dict, List, Optional
from datetime import datetime
import requests

class MarketDataService:
    """Service to fetch real-time market data"""
    
    # Indian market indices
    INDICES = {
        "NIFTY50": "^NSEI",
        "SENSEX": "^BSESN",
        "NIFTY500": "^CNX500.NS",
        "BANKNIFTY": "^NSEBANK",
        "NIFTYMIDCAP": "^NSEMDCP50",
        "NIFTYIT": "^CNXIT"
    }
    
    @staticmethod
    def get_index_data(index_name: str = "NIFTY50") -> Dict:
        """Get real-time index data"""
        try:
            ticker_symbol = MarketDataService.INDICES.get(index_name, "^NSEI")
            ticker = yf.Ticker(ticker_symbol)
            
            # Get current data
            hist = ticker.history(period="5d")
            
            if hist.empty:
                return None
            
            current_price = hist['Close'].iloc[-1]
            previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
            
            change = current_price - previous_close
            change_percent = (change / previous_close) * 100
            
            return {
                "index_name": index_name,
                "current_value": round(float(current_price), 2),
                "previous_close": round(float(previous_close), 2),
                "change": round(float(change), 2),
                "change_percent": round(float(change_percent), 2),
                "day_high": round(float(hist['High'].iloc[-1]), 2),
                "day_low": round(float(hist['Low'].iloc[-1]), 2),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error fetching index data: {e}")
            return None
    
    @staticmethod
    def get_stock_price(symbol: str, exchange: str = "NS") -> Optional[Dict]:
        """
        Get real-time stock price
        symbol: Stock symbol (e.g., 'RELIANCE', 'TCS', 'INFY', 'CDSL', 'MCX')
        exchange: NS for NSE, BO for BSE
        """
        try:
            # Format symbol for yfinance (e.g., RELIANCE.NS)
            ticker_symbol = f"{symbol}.{exchange}"
            ticker = yf.Ticker(ticker_symbol)
            
            # Get intraday data to capture today's changes
            hist = ticker.history(period="5d")
            
            if hist.empty:
                return None
            
            current_price = hist['Close'].iloc[-1]
            
            # Find the previous trading day's close (not today's open)
            if len(hist) >= 2:
                # Get yesterday's closing price
                previous_close = hist['Close'].iloc[-2]
            else:
                previous_close = current_price
            
            change = current_price - previous_close
            change_percent = (change / previous_close) * 100 if previous_close != 0 else 0
            
            return {
                "symbol": symbol,
                "exchange": exchange,
                "current_price": round(float(current_price), 2),
                "previous_close": round(float(previous_close), 2),
                "change": round(float(change), 2),
                "change_percent": round(float(change_percent), 2),
                "day_high": round(float(hist['High'].iloc[-1]), 2),
                "day_low": round(float(hist['Low'].iloc[-1]), 2),
                "volume": int(hist['Volume'].iloc[-1]),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error fetching stock price for {symbol}: {e}")
            return None
    
    @staticmethod
    def get_mutual_fund_nav(scheme_code: str) -> Optional[Dict]:
        """
        Get latest NAV for mutual fund - try as stock symbol first, then MFAPI
        scheme_code: Can be stock-like symbol or AMFi scheme code
        """
        try:
            # Try as a stock symbol with .NS or .BO suffix (some MFs trade as symbols)
            for suffix in ['.NS', '.BO', '']:
                try:
                    ticker_symbol = f"{scheme_code}{suffix}" if suffix else scheme_code
                    ticker = yf.Ticker(ticker_symbol)
                    hist = ticker.history(period="5d")
                    
                    if not hist.empty:
                        current_nav = hist['Close'].iloc[-1]
                        previous_nav = hist['Close'].iloc[-2] if len(hist) > 1 else current_nav
                        
                        change = current_nav - previous_nav
                        change_percent = (change / previous_nav) * 100 if previous_nav != 0 else 0
                        
                        return {
                            "scheme_code": scheme_code,
                            "nav": round(float(current_nav), 2),
                            "previous_nav": round(float(previous_nav), 2),
                            "change": round(float(change), 2),
                            "change_percent": round(float(change_percent), 2),
                            "timestamp": datetime.now().isoformat()
                        }
                except:
                    continue
            
            # Fallback: Try MFAPI if Yahoo Finance fails
            url = f"https://api.mfapi.in/mf/{scheme_code}/latest"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data and 'data' in data and len(data['data']) > 0:
                    latest = data['data'][0]
                    # Get previous NAV for change calculation
                    prev_nav = data['data'][1]['nav'] if len(data['data']) > 1 else latest['nav']
                    change = float(latest['nav']) - float(prev_nav)
                    change_percent = (change / float(prev_nav)) * 100 if float(prev_nav) != 0 else 0
                    
                    return {
                        "scheme_code": scheme_code,
                        "nav": float(latest['nav']),
                        "previous_nav": float(prev_nav),
                        "change": round(change, 2),
                        "change_percent": round(change_percent, 2),
                        "date": latest['date'],
                        "timestamp": datetime.now().isoformat()
                    }
            return None
        except Exception as e:
            print(f"Error fetching MF NAV for {scheme_code}: {e}")
            return None
    
    @staticmethod
    def get_multiple_stocks(symbols: List[str], exchange: str = "NS") -> Dict[str, Dict]:
        """Get prices for multiple stocks"""
        results = {}
        for symbol in symbols:
            data = MarketDataService.get_stock_price(symbol, exchange)
            if data:
                results[symbol] = data
        return results
    
    @staticmethod
    def update_investment_current_value(investment: Dict, db_update_callback=None) -> Dict:
        """
        Update current value for a single investment based on real-time data
        Returns updated investment dict
        """
        updated_inv = investment.copy()
        
        try:
            # Check asset class and get real-time data
            asset_class = investment.get('asset_class_name', '').lower()
            
            if 'stock' in asset_class or 'equity' in asset_class:
                symbol = investment.get('symbol')
                if symbol:
                    stock_data = MarketDataService.get_stock_price(symbol)
                    if stock_data and investment.get('units'):
                        new_current_value = stock_data['current_price'] * float(investment['units'])
                        updated_inv['current_value'] = round(new_current_value, 2)
                        updated_inv['market_price'] = stock_data['current_price']
                        updated_inv['price_change_percent'] = stock_data['change_percent']
                        
                        # Recalculate gains
                        invested = float(investment.get('invested_value', 0))
                        if invested > 0:
                            gain = new_current_value - invested
                            updated_inv['gain_loss'] = round(gain, 2)
                            updated_inv['gain_loss_percentage'] = round((gain / invested) * 100, 2)
            
            elif 'mf' in asset_class or 'mutual' in asset_class:
                scheme_code = investment.get('scheme_code')
                if scheme_code:
                    nav_data = MarketDataService.get_mutual_fund_nav(scheme_code)
                    if nav_data and investment.get('units'):
                        new_current_value = nav_data['nav'] * float(investment['units'])
                        updated_inv['current_value'] = round(new_current_value, 2)
                        updated_inv['current_nav'] = nav_data['nav']
                        
                        # Recalculate gains
                        invested = float(investment.get('invested_value', 0))
                        if invested > 0:
                            gain = new_current_value - invested
                            updated_inv['gain_loss'] = round(gain, 2)
                            updated_inv['gain_loss_percentage'] = round((gain / invested) * 100, 2)
        
        except Exception as e:
            print(f"Error updating investment value: {e}")
        
        return updated_inv
