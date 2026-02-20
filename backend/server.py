from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ==================== ENUMS ====================
class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

class TransactionCategory(str, Enum):
    # Income Categories
    SALARY = "Salary"
    BUSINESS = "Business"
    INVESTMENT = "Investment"
    FREELANCE = "Freelance"
    OTHER_INCOME = "Other Income"
    
    # Expense Categories
    FOOD = "Food"
    TRANSPORT = "Transport"
    BILLS = "Bills"
    SHOPPING = "Shopping"
    ENTERTAINMENT = "Entertainment"
    HEALTH = "Health"
    EDUCATION = "Education"
    SUBSCRIPTION = "Subscription"
    OTHER_EXPENSE = "Other Expense"

class TransactionSubCategory(str, Enum):
    ACTIVE = "Active"
    PASSIVE = "Passive"
    NEEDS = "Needs"
    WANTS = "Wants"

class PaymentMethod(str, Enum):
    CASH = "Cash"
    DEBIT = "Debit Card"
    CREDIT = "Credit Card"
    TRANSFER = "Bank Transfer"
    EWALLET = "E-Wallet"

class TransactionStatus(str, Enum):
    COMPLETED = "Completed"
    PENDING = "Pending"
    CANCELLED = "Cancelled"


# ==================== MODELS ====================

# Account Models
class Account(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # Bank, E-Wallet, Cash, Investment
    balance: float = 0.0
    currency: str = "IDR"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AccountCreate(BaseModel):
    name: str
    type: str
    balance: float = 0.0
    currency: str = "IDR"


# Transaction Models
class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    description: str
    amount: float
    type: TransactionType
    category: TransactionCategory
    sub_category: Optional[TransactionSubCategory] = None
    account: str
    payment_method: Optional[PaymentMethod] = PaymentMethod.CASH
    status: TransactionStatus = TransactionStatus.COMPLETED
    notes: Optional[str] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TransactionCreate(BaseModel):
    description: str
    amount: float
    type: TransactionType
    category: TransactionCategory
    sub_category: Optional[TransactionSubCategory] = None
    account: str
    payment_method: Optional[PaymentMethod] = PaymentMethod.CASH
    status: TransactionStatus = TransactionStatus.COMPLETED
    notes: Optional[str] = None
    tags: List[str] = []
    date: Optional[datetime] = None

class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[TransactionType] = None
    category: Optional[TransactionCategory] = None
    sub_category: Optional[TransactionSubCategory] = None
    account: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None
    status: Optional[TransactionStatus] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    date: Optional[datetime] = None


# Investment Models
class Investment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # Saham, Deposito, Emas, Reksadana
    amount: float
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvestmentUpdate(BaseModel):
    saham: float = 0.0
    deposito: float = 0.0
    emas: float = 0.0
    reksadana: float = 0.0


# Recurring Bill Models
class RecurringBill(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    amount: float
    due_date: str  # Day of month (e.g., "05", "10")
    period: str  # Monthly, Yearly
    category: str = "Bills"
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RecurringBillCreate(BaseModel):
    name: str
    amount: float
    due_date: str
    period: str = "Monthly"
    category: str = "Bills"


# Dashboard Stats Model
class DashboardStats(BaseModel):
    cash_balance: float
    total_investments: float
    net_worth: float
    total_income: float
    total_expense: float
    total_transactions: int
    accounts: List[Account]
    recent_transactions: List[Transaction]


# ==================== HELPER FUNCTIONS ====================
def serialize_datetime(obj):
    """Convert datetime objects to ISO string for MongoDB"""
    if isinstance(obj, dict):
        return {k: serialize_datetime(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_datetime(item) for item in obj]
    elif isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def deserialize_datetime(obj):
    """Convert ISO string to datetime objects"""
    if isinstance(obj, dict):
        for key in ['date', 'created_at', 'updated_at', 'timestamp']:
            if key in obj and isinstance(obj[key], str):
                try:
                    obj[key] = datetime.fromisoformat(obj[key])
                except:
                    pass
        return obj
    return obj


# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "FinanceOS API V8 - Personal Finance Management System"}


# ==================== ACCOUNT ROUTES ====================
@api_router.get("/accounts", response_model=List[Account])
async def get_accounts():
    accounts = await db.accounts.find({}, {"_id": 0}).to_list(1000)
    accounts = [deserialize_datetime(acc) for acc in accounts]
    return accounts

@api_router.post("/accounts", response_model=Account)
async def create_account(account: AccountCreate):
    acc_obj = Account(**account.model_dump())
    doc = serialize_datetime(acc_obj.model_dump())
    await db.accounts.insert_one(doc)
    return acc_obj

@api_router.delete("/accounts/{account_id}")
async def delete_account(account_id: str):
    result = await db.accounts.delete_one({"id": account_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account deleted successfully"}


# ==================== TRANSACTION ROUTES ====================
@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(
    search: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    account: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    sort_by: Optional[str] = Query("date"),
    sort_order: Optional[str] = Query("desc"),
    limit: Optional[int] = Query(1000)
):
    """Get all transactions with filtering and sorting"""
    query = {}
    
    # Search in description or notes
    if search:
        query["$or"] = [
            {"description": {"$regex": search, "$options": "i"}},
            {"notes": {"$regex": search, "$options": "i"}}
        ]
    
    # Filter by type
    if type:
        query["type"] = type
    
    # Filter by category
    if category:
        query["category"] = category
    
    # Filter by account
    if account:
        query["account"] = account
    
    # Filter by status
    if status:
        query["status"] = status
    
    # Filter by date range
    if date_from or date_to:
        query["date"] = {}
        if date_from:
            query["date"]["$gte"] = date_from
        if date_to:
            query["date"]["$lte"] = date_to
    
    # Filter by amount range
    if min_amount is not None or max_amount is not None:
        query["amount"] = {}
        if min_amount is not None:
            query["amount"]["$gte"] = min_amount
        if max_amount is not None:
            query["amount"]["$lte"] = max_amount
    
    # Sorting
    sort_direction = -1 if sort_order == "desc" else 1
    
    transactions = await db.transactions.find(query, {"_id": 0}).sort(sort_by, sort_direction).limit(limit).to_list(limit)
    transactions = [deserialize_datetime(tx) for tx in transactions]
    return transactions

@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction: TransactionCreate):
    # If date not provided, use current datetime
    tx_dict = transaction.model_dump()
    if tx_dict.get('date') is None:
        tx_dict['date'] = datetime.now(timezone.utc)
    
    tx_obj = Transaction(**tx_dict)
    doc = serialize_datetime(tx_obj.model_dump())
    await db.transactions.insert_one(doc)
    
    # Update account balance
    amount = tx_obj.amount
    if tx_obj.type == TransactionType.EXPENSE:
        amount = -amount
    
    await db.accounts.update_one(
        {"name": tx_obj.account},
        {"$inc": {"balance": amount}}
    )
    
    return tx_obj

@api_router.put("/transactions/{transaction_id}", response_model=Transaction)
async def update_transaction(transaction_id: str, transaction: TransactionUpdate):
    # Get existing transaction
    existing = await db.transactions.find_one({"id": transaction_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    existing = deserialize_datetime(existing)
    
    # Revert old balance change
    old_amount = existing['amount']
    if existing['type'] == TransactionType.EXPENSE.value:
        old_amount = -old_amount
    await db.accounts.update_one(
        {"name": existing['account']},
        {"$inc": {"balance": -old_amount}}
    )
    
    # Update fields
    update_data = {k: v for k, v in transaction.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc)
    
    # Merge with existing
    for key, value in update_data.items():
        existing[key] = value
    
    # Save updated transaction
    doc = serialize_datetime(existing)
    await db.transactions.update_one({"id": transaction_id}, {"$set": doc})
    
    # Apply new balance change
    new_amount = existing['amount']
    if existing['type'] == TransactionType.EXPENSE.value:
        new_amount = -new_amount
    await db.accounts.update_one(
        {"name": existing['account']},
        {"$inc": {"balance": new_amount}}
    )
    
    return Transaction(**existing)

@api_router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str):
    # Get transaction
    tx = await db.transactions.find_one({"id": transaction_id}, {"_id": 0})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Revert balance change
    amount = tx['amount']
    if tx['type'] == TransactionType.EXPENSE.value:
        amount = -amount
    await db.accounts.update_one(
        {"name": tx['account']},
        {"$inc": {"balance": -amount}}
    )
    
    # Delete transaction
    await db.transactions.delete_one({"id": transaction_id})
    return {"message": "Transaction deleted successfully"}

@api_router.get("/transactions/stats")
async def get_transaction_stats():
    """Get transaction statistics"""
    transactions = await db.transactions.find({}, {"_id": 0}).to_list(10000)
    
    total_income = sum(tx['amount'] for tx in transactions if tx['type'] == 'income')
    total_expense = sum(tx['amount'] for tx in transactions if tx['type'] == 'expense')
    
    # Category breakdown
    category_breakdown = {}
    for tx in transactions:
        cat = tx.get('category', 'Other')
        if cat not in category_breakdown:
            category_breakdown[cat] = {"income": 0, "expense": 0, "count": 0}
        
        if tx['type'] == 'income':
            category_breakdown[cat]['income'] += tx['amount']
        else:
            category_breakdown[cat]['expense'] += tx['amount']
        category_breakdown[cat]['count'] += 1
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "net": total_income - total_expense,
        "total_transactions": len(transactions),
        "category_breakdown": category_breakdown
    }


# ==================== INVESTMENT ROUTES ====================
@api_router.get("/investments")
async def get_investments():
    investments = await db.investments.find({}, {"_id": 0}).to_list(1000)
    if not investments:
        # Return default structure
        return {
            "saham": 0,
            "deposito": 0,
            "emas": 0,
            "reksadana": 0
        }
    
    # Convert list to dict
    result = {}
    for inv in investments:
        inv = deserialize_datetime(inv)
        result[inv['name']] = inv['amount']
    
    return result

@api_router.post("/investments")
async def update_investments(investments: InvestmentUpdate):
    # Clear existing
    await db.investments.delete_many({})
    
    # Insert new
    inv_dict = investments.model_dump()
    for name, amount in inv_dict.items():
        inv_obj = Investment(name=name, amount=amount)
        doc = serialize_datetime(inv_obj.model_dump())
        await db.investments.insert_one(doc)
    
    return {"message": "Investments updated successfully", "data": inv_dict}


# ==================== RECURRING BILLS ROUTES ====================
@api_router.get("/bills", response_model=List[RecurringBill])
async def get_bills():
    bills = await db.recurring_bills.find({}, {"_id": 0}).to_list(1000)
    bills = [deserialize_datetime(bill) for bill in bills]
    return bills

@api_router.post("/bills", response_model=RecurringBill)
async def create_bill(bill: RecurringBillCreate):
    bill_obj = RecurringBill(**bill.model_dump())
    doc = serialize_datetime(bill_obj.model_dump())
    await db.recurring_bills.insert_one(doc)
    return bill_obj

@api_router.delete("/bills/{bill_id}")
async def delete_bill(bill_id: str):
    result = await db.recurring_bills.delete_one({"id": bill_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bill not found")
    return {"message": "Bill deleted successfully"}


# ==================== DASHBOARD ROUTES ====================
@api_router.get("/dashboard")
async def get_dashboard_data():
    """Get comprehensive dashboard data"""
    # Get accounts
    accounts = await db.accounts.find({}, {"_id": 0}).to_list(1000)
    accounts = [deserialize_datetime(acc) for acc in accounts]
    
    # Calculate cash balance (sum of all accounts)
    cash_balance = sum(acc['balance'] for acc in accounts)
    
    # Get investments
    investments = await db.investments.find({}, {"_id": 0}).to_list(1000)
    total_investments = sum(inv['amount'] for inv in investments)
    
    # Get transactions stats
    transactions = await db.transactions.find({}, {"_id": 0}).to_list(10000)
    total_income = sum(tx['amount'] for tx in transactions if tx['type'] == 'income')
    total_expense = sum(tx['amount'] for tx in transactions if tx['type'] == 'expense')
    
    # Get recent transactions (last 10)
    recent_transactions = await db.transactions.find({}, {"_id": 0}).sort("date", -1).limit(10).to_list(10)
    recent_transactions = [deserialize_datetime(tx) for tx in recent_transactions]
    
    # Calculate net worth
    net_worth = cash_balance + total_investments
    
    # Get recurring bills
    bills = await db.recurring_bills.find({}, {"_id": 0}).to_list(1000)
    
    return {
        "cash_balance": cash_balance,
        "total_investments": total_investments,
        "net_worth": net_worth,
        "total_income": total_income,
        "total_expense": total_expense,
        "total_transactions": len(transactions),
        "accounts": accounts,
        "recent_transactions": recent_transactions,
        "recurring_bills": bills,
        "investments": {inv['name']: inv['amount'] for inv in investments}
    }


# ==================== ANALYTICS ROUTES ====================
@api_router.get("/analytics/monthly")
async def get_monthly_analytics():
    """Get monthly breakdown of income and expenses"""
    transactions = await db.transactions.find({}, {"_id": 0}).to_list(10000)
    transactions = [deserialize_datetime(tx) for tx in transactions]
    
    # Group by month
    monthly_data = {}
    for tx in transactions:
        month_key = tx['date'].strftime('%Y-%m')
        if month_key not in monthly_data:
            monthly_data[month_key] = {"income": 0, "expense": 0}
        
        if tx['type'] == 'income':
            monthly_data[month_key]['income'] += tx['amount']
        else:
            monthly_data[month_key]['expense'] += tx['amount']
    
    return monthly_data

@api_router.get("/analytics/category")
async def get_category_analytics():
    """Get spending breakdown by category"""
    transactions = await db.transactions.find({}, {"_id": 0}).to_list(10000)
    
    category_data = {}
    for tx in transactions:
        cat = tx.get('category', 'Other')
        if cat not in category_data:
            category_data[cat] = 0
        category_data[cat] += tx['amount']
    
    return category_data


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
