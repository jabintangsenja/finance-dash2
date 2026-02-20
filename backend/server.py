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
    DIVIDEND = "Dividend"
    INTEREST = "Interest"
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
    DEBT_PAYMENT = "Debt Payment"
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
    PAYLATER = "Pay Later"

class TransactionStatus(str, Enum):
    COMPLETED = "Completed"
    PENDING = "Pending"
    CANCELLED = "Cancelled"

class DebtType(str, Enum):
    CREDIT_CARD = "Credit Card"
    MORTGAGE = "Mortgage"
    CAR_LOAN = "Car Loan"
    PERSONAL_LOAN = "Personal Loan"
    STUDENT_LOAN = "Student Loan"
    INSTALLMENT = "Installment"
    OTHER = "Other"

class MutualFundType(str, Enum):
    EQUITY = "Equity"
    FIXED_INCOME = "Fixed Income"
    MIXED = "Mixed"
    MONEY_MARKET = "Money Market"

class GoldType(str, Enum):
    ANTAM = "Antam"
    UBS = "UBS"
    JEWELRY = "Jewelry"
    OTHER = "Other"


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


# Stock/Saham Models
class Stock(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ticker: str
    name: str
    securities: str  # Nama Sekuritas
    lots: float
    buy_price: float  # Average buy price per share
    current_price: float
    buy_date: datetime
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StockCreate(BaseModel):
    ticker: str
    name: str
    securities: str
    lots: float
    buy_price: float
    current_price: float
    buy_date: Optional[datetime] = None
    notes: Optional[str] = None


# Deposit/Deposito Models
class Deposit(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bank_name: str
    amount: float
    tenor_months: int
    interest_rate: float  # Percentage
    start_date: datetime
    maturity_date: datetime
    is_auto_renewal: bool = False
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DepositCreate(BaseModel):
    bank_name: str
    amount: float
    tenor_months: int
    interest_rate: float
    start_date: Optional[datetime] = None
    is_auto_renewal: bool = False
    notes: Optional[str] = None


# Gold/Emas Models
class Gold(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: GoldType
    weight_grams: float
    buy_price_per_gram: float
    current_price_per_gram: float
    purchase_location: str
    buy_date: datetime
    certificate_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GoldCreate(BaseModel):
    type: GoldType
    weight_grams: float
    buy_price_per_gram: float
    current_price_per_gram: float
    purchase_location: str
    buy_date: Optional[datetime] = None
    certificate_number: Optional[str] = None
    notes: Optional[str] = None


# Mutual Fund/Reksadana Models
class MutualFund(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_name: str
    fund_manager: str
    type: MutualFundType
    units: float
    buy_nav: float  # NAB saat beli
    current_nav: float  # NAB saat ini
    buy_date: datetime
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MutualFundCreate(BaseModel):
    product_name: str
    fund_manager: str
    type: MutualFundType
    units: float
    buy_nav: float
    current_nav: float
    buy_date: Optional[datetime] = None
    notes: Optional[str] = None


# Debt/Utang Models
class Debt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    debt_type: DebtType
    creditor: str  # Bank/Kreditor
    principal_amount: float  # Jumlah pinjaman awal
    current_balance: float  # Sisa utang
    interest_rate: float  # Percentage
    monthly_payment: float
    remaining_installments: int
    due_date: str  # Day of month
    start_date: datetime
    notes: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DebtCreate(BaseModel):
    debt_type: DebtType
    creditor: str
    principal_amount: float
    current_balance: float
    interest_rate: float
    monthly_payment: float
    remaining_installments: int
    due_date: str
    start_date: Optional[datetime] = None
    notes: Optional[str] = None


# Recurring Bill Models (Enhanced)
class RecurringBill(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    amount: float
    due_date: str  # Day of month
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


# Bill Payment History
class BillPayment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bill_id: str
    bill_name: str
    amount: float
    due_date: str
    payment_date: datetime
    is_paid: bool = True
    month_year: str  # Format: "2025-01"
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BillPaymentCreate(BaseModel):
    bill_id: str
    bill_name: str
    amount: float
    due_date: str
    payment_date: Optional[datetime] = None
    month_year: str
    notes: Optional[str] = None


# Financial Goal Models
class FinancialGoal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    target_amount: float
    current_amount: float = 0.0
    target_date: datetime
    category: str  # Emergency Fund, House, Car, Vacation, Retirement
    is_achieved: bool = False
    notes: Optional[str] = None
    color: str = "#6366f1"  # Default indigo color
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FinancialGoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    target_date: datetime
    category: str
    notes: Optional[str] = None
    color: str = "#6366f1"

class GoalContribution(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    goal_id: str
    amount: float
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None

class GoalContributionCreate(BaseModel):
    goal_id: str
    amount: float
    notes: Optional[str] = None


# Budget Models
class Budget(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    amount: float
    period: str = "Monthly"  # Monthly, Weekly, Yearly
    month_year: str  # Format: "2025-01"
    spent: float = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BudgetCreate(BaseModel):
    category: str
    amount: float
    period: str = "Monthly"
    month_year: Optional[str] = None


# Investment Update Model (Legacy for backward compatibility)
class InvestmentUpdate(BaseModel):
    saham: float = 0.0
    deposito: float = 0.0
    emas: float = 0.0
    reksadana: float = 0.0


# Recurring Transaction Model
class RecurringTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    amount: float
    type: TransactionType
    category: str
    account: str
    frequency: str = "Monthly"  # Daily, Weekly, Monthly, Yearly
    day_of_month: int = 1  # For monthly
    is_active: bool = True
    last_generated: Optional[datetime] = None
    next_due: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RecurringTransactionCreate(BaseModel):
    name: str
    amount: float
    type: TransactionType
    category: str
    account: str
    frequency: str = "Monthly"
    day_of_month: int = 1
    notes: Optional[str] = None


# Smart Category Keywords
CATEGORY_KEYWORDS = {
    "Food": ["makan", "resto", "cafe", "kopi", "food", "makanan", "grabfood", "gofood", "warteg", "nasi", "mie"],
    "Transport": ["grab", "gojek", "taxi", "bensin", "parkir", "tol", "transport", "ojek", "bus", "kereta"],
    "Bills": ["listrik", "pln", "air", "pdam", "internet", "wifi", "telepon", "pulsa", "tagihan"],
    "Shopping": ["shopee", "tokopedia", "lazada", "bukalapak", "belanja", "beli", "mall", "toko"],
    "Entertainment": ["netflix", "spotify", "game", "bioskop", "cinema", "nonton", "hiburan"],
    "Health": ["apotek", "dokter", "rs", "rumah sakit", "obat", "kesehatan", "medical"],
    "Education": ["kursus", "buku", "sekolah", "kuliah", "les", "pendidikan", "course"],
    "Subscription": ["subscription", "langganan", "membership", "premium"],
    "Salary": ["gaji", "salary", "payroll"],
    "Freelance": ["freelance", "project", "proyek", "fee"],
    "Investment": ["dividen", "dividend", "bunga", "interest", "investasi"],
}


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
        for key in ['date', 'created_at', 'updated_at', 'timestamp', 'buy_date', 'start_date', 'maturity_date', 'target_date', 'payment_date']:
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
    return {"message": "FinanceOS API V8 - Complete Personal Finance Management System"}


# ==================== ACCOUNT ROUTES ====================
@api_router.get("/accounts", response_model=List[Account])
async def get_accounts():
    accounts = await db.accounts.find({}, {"_id": 0}).to_list(1000)
    accounts = [deserialize_datetime(acc) for acc in accounts]
    return accounts

@api_router.post("/accounts", response_model=Account)
async def create_account(account: AccountCreate):
    # Check for duplicate account name
    existing = await db.accounts.find_one({"name": {"$regex": f"^{account.name}$", "$options": "i"}}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail=f"Account '{account.name}' already exists")
    
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
    
    if search:
        query["$or"] = [
            {"description": {"$regex": search, "$options": "i"}},
            {"notes": {"$regex": search, "$options": "i"}}
        ]
    
    if type:
        query["type"] = type
    
    if category:
        query["category"] = category
    
    if account:
        query["account"] = account
    
    if status:
        query["status"] = status
    
    if date_from or date_to:
        query["date"] = {}
        if date_from:
            query["date"]["$gte"] = date_from
        if date_to:
            query["date"]["$lte"] = date_to
    
    if min_amount is not None or max_amount is not None:
        query["amount"] = {}
        if min_amount is not None:
            query["amount"]["$gte"] = min_amount
        if max_amount is not None:
            query["amount"]["$lte"] = max_amount
    
    sort_direction = -1 if sort_order == "desc" else 1
    
    transactions = await db.transactions.find(query, {"_id": 0}).sort(sort_by, sort_direction).limit(limit).to_list(limit)
    transactions = [deserialize_datetime(tx) for tx in transactions]
    return transactions

@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction: TransactionCreate):
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
    
    # Auto-create debt entry for Credit Card or Pay Later transactions
    if tx_obj.type == TransactionType.EXPENSE and tx_obj.payment_method in [PaymentMethod.CREDIT, PaymentMethod.PAYLATER]:
        # Check if debt already exists for this creditor
        existing_debt = await db.debts.find_one({"creditor": tx_obj.account, "is_active": True}, {"_id": 0})
        
        if existing_debt:
            # Update existing debt balance
            new_balance = existing_debt['current_balance'] + tx_obj.amount
            await db.debts.update_one(
                {"id": existing_debt['id']},
                {"$set": {"current_balance": new_balance, "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
        else:
            # Create new debt entry
            debt_type = DebtType.CREDIT_CARD if tx_obj.payment_method == PaymentMethod.CREDIT else DebtType.INSTALLMENT
            new_debt = Debt(
                debt_type=debt_type,
                creditor=tx_obj.account,
                principal_amount=tx_obj.amount,
                current_balance=tx_obj.amount,
                interest_rate=2.5 if tx_obj.payment_method == PaymentMethod.CREDIT else 1.5,
                monthly_payment=tx_obj.amount * 0.1,
                remaining_installments=10,
                due_date="05",
                start_date=datetime.now(timezone.utc),
                notes=f"Auto-created from {tx_obj.payment_method.value} transaction: {tx_obj.description}"
            )
            debt_doc = serialize_datetime(new_debt.model_dump())
            await db.debts.insert_one(debt_doc)
    
    return tx_obj

@api_router.put("/transactions/{transaction_id}", response_model=Transaction)
async def update_transaction(transaction_id: str, transaction: TransactionUpdate):
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
    
    for key, value in update_data.items():
        existing[key] = value
    
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
    
    await db.transactions.delete_one({"id": transaction_id})
    return {"message": "Transaction deleted successfully"}

@api_router.get("/transactions/stats")
async def get_transaction_stats():
    """Get transaction statistics"""
    transactions = await db.transactions.find({}, {"_id": 0}).to_list(10000)
    
    total_income = sum(tx['amount'] for tx in transactions if tx['type'] == 'income')
    total_expense = sum(tx['amount'] for tx in transactions if tx['type'] == 'expense')
    
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


# ==================== STOCK ROUTES ====================
@api_router.get("/stocks", response_model=List[Stock])
async def get_stocks():
    stocks = await db.stocks.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(s) for s in stocks]

@api_router.post("/stocks", response_model=Stock)
async def create_stock(stock: StockCreate):
    stock_dict = stock.model_dump()
    if stock_dict.get('buy_date') is None:
        stock_dict['buy_date'] = datetime.now(timezone.utc)
    stock_obj = Stock(**stock_dict)
    doc = serialize_datetime(stock_obj.model_dump())
    await db.stocks.insert_one(doc)
    return stock_obj

@api_router.put("/stocks/{stock_id}", response_model=Stock)
async def update_stock(stock_id: str, stock_data: dict):
    existing = await db.stocks.find_one({"id": stock_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    stock_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.stocks.update_one({"id": stock_id}, {"$set": stock_data})
    
    updated = await db.stocks.find_one({"id": stock_id}, {"_id": 0})
    return deserialize_datetime(updated)

@api_router.delete("/stocks/{stock_id}")
async def delete_stock(stock_id: str):
    result = await db.stocks.delete_one({"id": stock_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Stock not found")
    return {"message": "Stock deleted successfully"}


# ==================== DEPOSIT ROUTES ====================
@api_router.get("/deposits", response_model=List[Deposit])
async def get_deposits():
    deposits = await db.deposits.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(d) for d in deposits]

@api_router.post("/deposits", response_model=Deposit)
async def create_deposit(deposit: DepositCreate):
    from dateutil.relativedelta import relativedelta
    
    deposit_dict = deposit.model_dump()
    if deposit_dict.get('start_date') is None:
        deposit_dict['start_date'] = datetime.now(timezone.utc)
    
    # Calculate maturity date
    start = deposit_dict['start_date']
    maturity = start + relativedelta(months=deposit_dict['tenor_months'])
    deposit_dict['maturity_date'] = maturity
    
    deposit_obj = Deposit(**deposit_dict)
    doc = serialize_datetime(deposit_obj.model_dump())
    await db.deposits.insert_one(doc)
    return deposit_obj

@api_router.put("/deposits/{deposit_id}", response_model=Deposit)
async def update_deposit(deposit_id: str, deposit_data: dict):
    existing = await db.deposits.find_one({"id": deposit_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Deposit not found")
    
    deposit_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.deposits.update_one({"id": deposit_id}, {"$set": deposit_data})
    
    updated = await db.deposits.find_one({"id": deposit_id}, {"_id": 0})
    return deserialize_datetime(updated)

@api_router.delete("/deposits/{deposit_id}")
async def delete_deposit(deposit_id: str):
    result = await db.deposits.delete_one({"id": deposit_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Deposit not found")
    return {"message": "Deposit deleted successfully"}


# ==================== GOLD ROUTES ====================
@api_router.get("/gold", response_model=List[Gold])
async def get_gold():
    gold_items = await db.gold.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(g) for g in gold_items]

@api_router.post("/gold", response_model=Gold)
async def create_gold(gold: GoldCreate):
    gold_dict = gold.model_dump()
    if gold_dict.get('buy_date') is None:
        gold_dict['buy_date'] = datetime.now(timezone.utc)
    gold_obj = Gold(**gold_dict)
    doc = serialize_datetime(gold_obj.model_dump())
    await db.gold.insert_one(doc)
    return gold_obj

@api_router.put("/gold/{gold_id}", response_model=Gold)
async def update_gold(gold_id: str, gold_data: dict):
    existing = await db.gold.find_one({"id": gold_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Gold not found")
    
    gold_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.gold.update_one({"id": gold_id}, {"$set": gold_data})
    
    updated = await db.gold.find_one({"id": gold_id}, {"_id": 0})
    return deserialize_datetime(updated)

@api_router.delete("/gold/{gold_id}")
async def delete_gold(gold_id: str):
    result = await db.gold.delete_one({"id": gold_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gold not found")
    return {"message": "Gold deleted successfully"}


# ==================== MUTUAL FUND ROUTES ====================
@api_router.get("/mutual-funds", response_model=List[MutualFund])
async def get_mutual_funds():
    funds = await db.mutual_funds.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(f) for f in funds]

@api_router.post("/mutual-funds", response_model=MutualFund)
async def create_mutual_fund(fund: MutualFundCreate):
    fund_dict = fund.model_dump()
    if fund_dict.get('buy_date') is None:
        fund_dict['buy_date'] = datetime.now(timezone.utc)
    fund_obj = MutualFund(**fund_dict)
    doc = serialize_datetime(fund_obj.model_dump())
    await db.mutual_funds.insert_one(doc)
    return fund_obj

@api_router.put("/mutual-funds/{fund_id}", response_model=MutualFund)
async def update_mutual_fund(fund_id: str, fund_data: dict):
    existing = await db.mutual_funds.find_one({"id": fund_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Mutual fund not found")
    
    fund_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.mutual_funds.update_one({"id": fund_id}, {"$set": fund_data})
    
    updated = await db.mutual_funds.find_one({"id": fund_id}, {"_id": 0})
    return deserialize_datetime(updated)

@api_router.delete("/mutual-funds/{fund_id}")
async def delete_mutual_fund(fund_id: str):
    result = await db.mutual_funds.delete_one({"id": fund_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mutual fund not found")
    return {"message": "Mutual fund deleted successfully"}


# ==================== DEBT ROUTES ====================
@api_router.get("/debts", response_model=List[Debt])
async def get_debts():
    debts = await db.debts.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(d) for d in debts]

@api_router.post("/debts", response_model=Debt)
async def create_debt(debt: DebtCreate):
    debt_dict = debt.model_dump()
    if debt_dict.get('start_date') is None:
        debt_dict['start_date'] = datetime.now(timezone.utc)
    debt_obj = Debt(**debt_dict)
    doc = serialize_datetime(debt_obj.model_dump())
    await db.debts.insert_one(doc)
    return debt_obj

@api_router.put("/debts/{debt_id}", response_model=Debt)
async def update_debt(debt_id: str, debt_data: dict):
    existing = await db.debts.find_one({"id": debt_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Debt not found")
    
    debt_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.debts.update_one({"id": debt_id}, {"$set": debt_data})
    
    updated = await db.debts.find_one({"id": debt_id}, {"_id": 0})
    return deserialize_datetime(updated)

@api_router.delete("/debts/{debt_id}")
async def delete_debt(debt_id: str):
    result = await db.debts.delete_one({"id": debt_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Debt not found")
    return {"message": "Debt deleted successfully"}


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


# ==================== BILL PAYMENT ROUTES ====================
@api_router.get("/bill-payments")
async def get_bill_payments(bill_id: Optional[str] = None, month_year: Optional[str] = None):
    query = {}
    if bill_id:
        query["bill_id"] = bill_id
    if month_year:
        query["month_year"] = month_year
    
    payments = await db.bill_payments.find(query, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(p) for p in payments]

@api_router.post("/bill-payments", response_model=BillPayment)
async def mark_bill_paid(payment: BillPaymentCreate):
    payment_dict = payment.model_dump()
    if payment_dict.get('payment_date') is None:
        payment_dict['payment_date'] = datetime.now(timezone.utc)
    
    payment_obj = BillPayment(**payment_dict)
    doc = serialize_datetime(payment_obj.model_dump())
    await db.bill_payments.insert_one(doc)
    
    # Create transaction for this bill payment
    tx = Transaction(
        description=f"Bill Payment: {payment.bill_name}",
        amount=payment.amount,
        type=TransactionType.EXPENSE,
        category=TransactionCategory.BILLS,
        account="Cash",  # Default, user can change
        payment_method=PaymentMethod.TRANSFER,
        status=TransactionStatus.COMPLETED,
        notes=f"Auto-created from bill payment: {payment.month_year}",
        date=payment_obj.payment_date
    )
    tx_doc = serialize_datetime(tx.model_dump())
    await db.transactions.insert_one(tx_doc)
    
    return payment_obj


# ==================== FINANCIAL GOALS ROUTES ====================
@api_router.get("/goals", response_model=List[FinancialGoal])
async def get_goals():
    goals = await db.financial_goals.find({}, {"_id": 0}).to_list(1000)
    return [deserialize_datetime(g) for g in goals]

@api_router.post("/goals", response_model=FinancialGoal)
async def create_goal(goal: FinancialGoalCreate):
    goal_obj = FinancialGoal(**goal.model_dump())
    doc = serialize_datetime(goal_obj.model_dump())
    await db.financial_goals.insert_one(doc)
    return goal_obj

@api_router.put("/goals/{goal_id}", response_model=FinancialGoal)
async def update_goal(goal_id: str, goal_data: dict):
    existing = await db.financial_goals.find_one({"id": goal_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    # Check if goal is achieved
    if 'current_amount' in goal_data and 'target_amount' in existing:
        if goal_data['current_amount'] >= existing['target_amount']:
            goal_data['is_achieved'] = True
    
    await db.financial_goals.update_one({"id": goal_id}, {"$set": goal_data})
    
    updated = await db.financial_goals.find_one({"id": goal_id}, {"_id": 0})
    return deserialize_datetime(updated)

@api_router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str):
    result = await db.financial_goals.delete_one({"id": goal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Goal deleted successfully"}

@api_router.post("/goals/{goal_id}/contribute")
async def add_goal_contribution(goal_id: str, contribution: GoalContributionCreate):
    """Add a contribution to a financial goal"""
    goal = await db.financial_goals.find_one({"id": goal_id}, {"_id": 0})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Create contribution record
    contrib = GoalContribution(
        goal_id=goal_id,
        amount=contribution.amount,
        notes=contribution.notes
    )
    contrib_doc = serialize_datetime(contrib.model_dump())
    await db.goal_contributions.insert_one(contrib_doc)
    
    # Update goal's current amount
    new_amount = goal['current_amount'] + contribution.amount
    is_achieved = new_amount >= goal['target_amount']
    
    await db.financial_goals.update_one(
        {"id": goal_id},
        {"$set": {
            "current_amount": new_amount,
            "is_achieved": is_achieved,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    updated_goal = await db.financial_goals.find_one({"id": goal_id}, {"_id": 0})
    return deserialize_datetime(updated_goal)

@api_router.get("/goals/{goal_id}/contributions")
async def get_goal_contributions(goal_id: str):
    """Get all contributions for a specific goal"""
    contributions = await db.goal_contributions.find({"goal_id": goal_id}, {"_id": 0}).sort("date", -1).to_list(1000)
    return [deserialize_datetime(c) for c in contributions]


# ==================== BUDGET ROUTES ====================
@api_router.get("/budgets")
async def get_budgets(month_year: Optional[str] = None):
    """Get budgets, optionally filtered by month"""
    query = {}
    if month_year:
        query["month_year"] = month_year
    
    budgets = await db.budgets.find(query, {"_id": 0}).to_list(1000)
    budgets = [deserialize_datetime(b) for b in budgets]
    
    # Calculate spent amount for each budget from transactions
    for budget in budgets:
        # Get transactions for this category in this month
        month_start = f"{budget['month_year']}-01"
        month_parts = budget['month_year'].split('-')
        year = int(month_parts[0])
        month = int(month_parts[1])
        if month == 12:
            next_month = f"{year + 1}-01-01"
        else:
            next_month = f"{year}-{str(month + 1).zfill(2)}-01"
        
        pipeline = [
            {"$match": {
                "category": budget['category'],
                "type": "expense",
                "date": {"$gte": month_start, "$lt": next_month}
            }},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        
        result = await db.transactions.aggregate(pipeline).to_list(1)
        budget['spent'] = result[0]['total'] if result else 0
    
    return budgets

@api_router.post("/budgets", response_model=Budget)
async def create_budget(budget: BudgetCreate):
    """Create a new budget"""
    budget_dict = budget.model_dump()
    
    # Default to current month if not specified
    if not budget_dict.get('month_year'):
        budget_dict['month_year'] = datetime.now(timezone.utc).strftime('%Y-%m')
    
    # Check if budget already exists for this category and month
    existing = await db.budgets.find_one({
        "category": budget_dict['category'],
        "month_year": budget_dict['month_year']
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail=f"Budget for {budget_dict['category']} already exists for {budget_dict['month_year']}"
        )
    
    budget_obj = Budget(**budget_dict)
    doc = serialize_datetime(budget_obj.model_dump())
    await db.budgets.insert_one(doc)
    return budget_obj

@api_router.put("/budgets/{budget_id}")
async def update_budget(budget_id: str, budget_data: dict):
    """Update a budget"""
    existing = await db.budgets.find_one({"id": budget_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    budget_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.budgets.update_one({"id": budget_id}, {"$set": budget_data})
    
    updated = await db.budgets.find_one({"id": budget_id}, {"_id": 0})
    return deserialize_datetime(updated)

@api_router.delete("/budgets/{budget_id}")
async def delete_budget(budget_id: str):
    """Delete a budget"""
    result = await db.budgets.delete_one({"id": budget_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"message": "Budget deleted successfully"}

@api_router.get("/budgets/summary")
async def get_budget_summary(month_year: Optional[str] = None):
    """Get budget summary with spending analysis"""
    if not month_year:
        month_year = datetime.now(timezone.utc).strftime('%Y-%m')
    
    budgets = await get_budgets(month_year)
    
    total_budget = sum(b['amount'] for b in budgets)
    total_spent = sum(b['spent'] for b in budgets)
    
    over_budget = [b for b in budgets if b['spent'] > b['amount']]
    near_limit = [b for b in budgets if b['spent'] >= b['amount'] * 0.8 and b['spent'] <= b['amount']]
    
    return {
        "month_year": month_year,
        "total_budget": total_budget,
        "total_spent": total_spent,
        "remaining": total_budget - total_spent,
        "utilization_percentage": (total_spent / total_budget * 100) if total_budget > 0 else 0,
        "budgets_count": len(budgets),
        "over_budget_count": len(over_budget),
        "near_limit_count": len(near_limit),
        "budgets": budgets
    }


# ==================== LEGACY INVESTMENT ROUTES (for backward compatibility) ====================
@api_router.get("/investments")
async def get_investments_legacy():
    # Calculate totals from detailed investments
    stocks = await db.investment_stocks.find({}, {"_id": 0}).to_list(1000)
    deposits = await db.investment_deposits.find({}, {"_id": 0}).to_list(1000)
    gold_items = await db.investment_gold.find({}, {"_id": 0}).to_list(1000)
    mutual_funds = await db.investment_mutual_funds.find({}, {"_id": 0}).to_list(1000)
    
    total_saham = sum(s.get('current_value', 0) for s in stocks)
    total_deposito = sum(d.get('current_value', d.get('amount', 0)) for d in deposits)
    total_emas = sum(g.get('current_value', 0) for g in gold_items)
    total_reksadana = sum(mf.get('current_value', 0) for mf in mutual_funds)
    
    return {
        "saham": total_saham,
        "deposito": total_deposito,
        "emas": total_emas,
        "reksadana": total_reksadana
    }

@api_router.post("/investments")
async def update_investments_legacy(investments: InvestmentUpdate):
    return {"message": "Please use detailed investment endpoints", "data": investments.model_dump()}


# ==================== DETAILED INVESTMENT ROUTES ====================
@api_router.get("/investments/detailed")
async def get_detailed_investments():
    """Get all investments grouped by type"""
    stocks = await db.investment_stocks.find({}, {"_id": 0}).to_list(1000)
    deposits = await db.investment_deposits.find({}, {"_id": 0}).to_list(1000)
    gold = await db.investment_gold.find({}, {"_id": 0}).to_list(1000)
    mutual_funds = await db.investment_mutual_funds.find({}, {"_id": 0}).to_list(1000)
    
    return {
        "stocks": stocks,
        "deposits": deposits,
        "gold": gold,
        "mutual_funds": mutual_funds
    }

@api_router.post("/investments/detailed/{investment_type}")
async def add_detailed_investment(investment_type: str, data: dict):
    """Add a new investment item"""
    collection_map = {
        "stocks": "investment_stocks",
        "deposits": "investment_deposits", 
        "gold": "investment_gold",
        "mutual_funds": "investment_mutual_funds"
    }
    
    if investment_type not in collection_map:
        raise HTTPException(status_code=400, detail="Invalid investment type")
    
    data["id"] = str(uuid.uuid4())
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    
    collection = db[collection_map[investment_type]]
    await collection.insert_one(data)
    
    return {"message": "Investment added", "id": data["id"]}

@api_router.put("/investments/detailed/{investment_type}/{item_id}")
async def update_detailed_investment(investment_type: str, item_id: str, data: dict):
    """Update an investment item"""
    collection_map = {
        "stocks": "investment_stocks",
        "deposits": "investment_deposits",
        "gold": "investment_gold",
        "mutual_funds": "investment_mutual_funds"
    }
    
    if investment_type not in collection_map:
        raise HTTPException(status_code=400, detail="Invalid investment type")
    
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    data.pop("id", None)
    data.pop("_id", None)
    
    collection = db[collection_map[investment_type]]
    result = await collection.update_one({"id": item_id}, {"$set": data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Investment not found")
    
    return {"message": "Investment updated"}

@api_router.delete("/investments/detailed/{investment_type}/{item_id}")
async def delete_detailed_investment(investment_type: str, item_id: str):
    """Delete an investment item"""
    collection_map = {
        "stocks": "investment_stocks",
        "deposits": "investment_deposits",
        "gold": "investment_gold",
        "mutual_funds": "investment_mutual_funds"
    }
    
    if investment_type not in collection_map:
        raise HTTPException(status_code=400, detail="Invalid investment type")
    
    collection = db[collection_map[investment_type]]
    result = await collection.delete_one({"id": item_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Investment not found")
    
    return {"message": "Investment deleted"}


# ==================== UNIFIED RECURRING BILLS ROUTES ====================
@api_router.get("/recurring-bills")
async def get_recurring_bills():
    """Get all recurring bills (unified: income & expense) - also include legacy bills"""
    items = await db.recurring_bills.find({}, {"_id": 0}).to_list(1000)
    
    # Also get legacy bills and convert them
    legacy_bills = await db.bills.find({}, {"_id": 0}).to_list(1000)
    for bill in legacy_bills:
        # Convert legacy bill format to new format
        converted = {
            "id": bill.get('id'),
            "name": bill.get('name'),
            "amount": bill.get('amount', 0),
            "type": "expense",  # Legacy bills are all expenses
            "category": bill.get('category', 'Bills'),
            "account": bill.get('account', 'Cash'),
            "frequency": bill.get('period', 'Monthly'),
            "day_of_month": int(bill.get('due_date', '1')),
            "is_active": bill.get('is_active', True),
            "notes": bill.get('notes'),
            "created_at": bill.get('created_at')
        }
        # Only add if not already in recurring_bills
        if not any(i.get('id') == converted['id'] for i in items):
            items.append(converted)
    
    return [deserialize_datetime(i) for i in items]

@api_router.post("/recurring-bills")
async def create_recurring_bill(data: RecurringTransactionCreate):
    """Create a new recurring bill"""
    item = RecurringTransaction(**data.model_dump())
    
    # Calculate next due date
    today = datetime.now(timezone.utc)
    if item.frequency == "Monthly":
        try:
            next_due = today.replace(day=item.day_of_month)
            if next_due <= today:
                if today.month == 12:
                    next_due = next_due.replace(year=today.year + 1, month=1)
                else:
                    next_due = next_due.replace(month=today.month + 1)
            item.next_due = next_due
        except:
            pass
    
    doc = serialize_datetime(item.model_dump())
    await db.recurring_bills.insert_one(doc)
    return item

@api_router.put("/recurring-bills/{item_id}")
async def update_recurring_bill(item_id: str, data: dict):
    """Update a recurring bill"""
    data.pop("id", None)
    data.pop("_id", None)
    
    result = await db.recurring_bills.update_one(
        {"id": item_id},
        {"$set": data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {"message": "Updated successfully"}

@api_router.delete("/recurring-bills/{item_id}")
async def delete_recurring_bill(item_id: str):
    """Delete a recurring bill"""
    result = await db.recurring_bills.delete_one({"id": item_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {"message": "Deleted successfully"}

@api_router.post("/recurring-bills/{item_id}/pay")
async def pay_recurring_bill(item_id: str, data: dict):
    """Mark a recurring bill as paid for a specific month and create transaction"""
    item = await db.recurring_bills.find_one({"id": item_id}, {"_id": 0})
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    month_year = data.get('month_year', datetime.now(timezone.utc).strftime('%Y-%m'))
    
    # Check if already paid
    existing = await db.recurring_payments.find_one({
        "recurring_id": item_id,
        "month_year": month_year
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(status_code=400, detail="Already paid for this month")
    
    # Create transaction
    tx = Transaction(
        description=item['name'],
        amount=item['amount'],
        type=TransactionType(item['type']),
        category=item['category'],
        account=item['account'],
        notes=f"Auto-paid recurring: {item['name']}"
    )
    
    tx_doc = serialize_datetime(tx.model_dump())
    await db.transactions.insert_one(tx_doc)
    
    # Update account balance
    amount = tx.amount if tx.type == TransactionType.INCOME else -tx.amount
    await db.accounts.update_one(
        {"name": tx.account},
        {"$inc": {"balance": amount}}
    )
    
    # Record payment
    payment = {
        "id": str(uuid.uuid4()),
        "recurring_id": item_id,
        "transaction_id": tx.id,
        "amount": item['amount'],
        "month_year": month_year,
        "paid_at": datetime.now(timezone.utc).isoformat()
    }
    await db.recurring_payments.insert_one(payment)
    
    return {"message": "Paid successfully", "transaction_id": tx.id}

@api_router.get("/recurring-payments")
async def get_recurring_payments(month_year: Optional[str] = None):
    """Get payment records for recurring bills"""
    query = {}
    if month_year:
        query["month_year"] = month_year
    
    payments = await db.recurring_payments.find(query, {"_id": 0}).to_list(1000)
    return payments


# ==================== LEGACY RECURRING TRANSACTIONS (for backward compat) ====================
@api_router.get("/recurring-transactions")
async def get_recurring_transactions():
    """Get all recurring transactions - redirects to unified endpoint"""
    return await get_recurring_bills()

@api_router.post("/recurring-transactions")
async def create_recurring_transaction(data: RecurringTransactionCreate):
    """Create recurring - redirects to unified endpoint"""
    return await create_recurring_bill(data)

@api_router.put("/recurring-transactions/{recurring_id}")
async def update_recurring_transaction(recurring_id: str, data: dict):
    """Update recurring - redirects to unified endpoint"""
    return await update_recurring_bill(recurring_id, data)

@api_router.delete("/recurring-transactions/{recurring_id}")
async def delete_recurring_transaction(recurring_id: str):
    """Delete recurring - redirects to unified endpoint"""
    return await delete_recurring_bill(recurring_id)

@api_router.post("/recurring-transactions/{recurring_id}/generate")
async def generate_recurring_transaction(recurring_id: str):
    """Manually generate transaction from recurring"""
    return await pay_recurring_bill(recurring_id, {"month_year": datetime.now(timezone.utc).strftime('%Y-%m')})


# ==================== SMART CATEGORIZATION ROUTES ====================
@api_router.post("/smart-categorize")
async def smart_categorize(description: str):
    """Suggest category based on description keywords"""
    description_lower = description.lower()
    
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in description_lower:
                return {"suggested_category": category, "confidence": "high"}
    
    return {"suggested_category": "Other Expense", "confidence": "low"}


# ==================== NOTIFICATIONS/ALERTS ROUTES ====================
@api_router.get("/alerts")
async def get_alerts():
    """Get budget alerts and goal milestones"""
    alerts = []
    
    # Check budget alerts
    current_month = datetime.now(timezone.utc).strftime('%Y-%m')
    budgets = await db.budgets.find({"month_year": current_month}, {"_id": 0}).to_list(1000)
    
    for budget in budgets:
        # Calculate spent from transactions
        month_start = f"{current_month}-01"
        pipeline = [
            {"$match": {
                "category": budget['category'],
                "type": "expense",
                "date": {"$gte": month_start}
            }},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        result = await db.transactions.aggregate(pipeline).to_list(1)
        spent = result[0]['total'] if result else 0
        
        percentage = (spent / budget['amount'] * 100) if budget['amount'] > 0 else 0
        
        if percentage >= 100:
            alerts.append({
                "type": "budget_exceeded",
                "severity": "high",
                "title": f"Budget {budget['category']} Terlampaui!",
                "message": f"Anda sudah menghabiskan {percentage:.0f}% dari budget {budget['category']}",
                "category": budget['category'],
                "spent": spent,
                "budget": budget['amount']
            })
        elif percentage >= 80:
            alerts.append({
                "type": "budget_warning",
                "severity": "medium",
                "title": f"Budget {budget['category']} Hampir Habis",
                "message": f"Sudah terpakai {percentage:.0f}% dari budget {budget['category']}",
                "category": budget['category'],
                "spent": spent,
                "budget": budget['amount']
            })
    
    # Check goal milestones
    goals = await db.financial_goals.find({"is_achieved": False}, {"_id": 0}).to_list(1000)
    
    for goal in goals:
        progress = (goal['current_amount'] / goal['target_amount'] * 100) if goal['target_amount'] > 0 else 0
        
        if progress >= 90 and progress < 100:
            alerts.append({
                "type": "goal_almost",
                "severity": "low",
                "title": f"Hampir Mencapai Goal!",
                "message": f"Goal '{goal['name']}' sudah {progress:.0f}%! Sedikit lagi!",
                "goal_name": goal['name'],
                "progress": progress
            })
        elif progress >= 50:
            milestones = [50, 75]
            for milestone in milestones:
                if progress >= milestone and progress < milestone + 10:
                    alerts.append({
                        "type": "goal_milestone",
                        "severity": "info",
                        "title": f"Milestone {milestone}% Tercapai!",
                        "message": f"Goal '{goal['name']}' sudah mencapai {milestone}%",
                        "goal_name": goal['name'],
                        "progress": progress
                    })
    
    # Check bills due soon
    today = datetime.now(timezone.utc).day
    bills = await db.bills.find({}, {"_id": 0}).to_list(1000)
    
    for bill in bills:
        due_day = int(bill.get('due_date', '01'))
        days_until_due = due_day - today
        
        if 0 < days_until_due <= 3:
            alerts.append({
                "type": "bill_due_soon",
                "severity": "medium",
                "title": f"Tagihan Jatuh Tempo",
                "message": f"Tagihan '{bill['name']}' jatuh tempo dalam {days_until_due} hari",
                "bill_name": bill['name'],
                "amount": bill['amount']
            })
    
    return alerts



@api_router.get("/dashboard")
async def get_dashboard_data():
    """Get comprehensive dashboard data with accounting equation"""
    
    # ASSETS - Liquid Assets (Cash & Bank Accounts)
    accounts = await db.accounts.find({}, {"_id": 0}).to_list(1000)
    accounts = [deserialize_datetime(acc) for acc in accounts]
    liquid_assets = sum(acc['balance'] for acc in accounts)
    
    # ASSETS - Investments (breakdown)
    stocks = await db.stocks.find({}, {"_id": 0}).to_list(1000)
    deposits = await db.deposits.find({}, {"_id": 0}).to_list(1000)
    gold_items = await db.gold.find({}, {"_id": 0}).to_list(1000)
    mutual_funds = await db.mutual_funds.find({}, {"_id": 0}).to_list(1000)
    
    total_stocks = sum(s['lots'] * s['current_price'] * 100 for s in stocks)
    total_deposits = sum(d['amount'] for d in deposits)
    total_gold = sum(g['weight_grams'] * g['current_price_per_gram'] for g in gold_items)
    total_mutual_funds = sum(mf['units'] * mf['current_nav'] for mf in mutual_funds)
    
    total_investments = total_stocks + total_deposits + total_gold + total_mutual_funds
    
    # TOTAL ASSETS
    total_assets = liquid_assets + total_investments
    
    # LIABILITIES - Debts
    debts = await db.debts.find({"is_active": True}, {"_id": 0}).to_list(1000)
    total_liabilities = sum(d['current_balance'] for d in debts)
    
    # EQUITY (NET WORTH) = ASSETS - LIABILITIES
    net_worth = total_assets - total_liabilities
    
    # Transactions stats
    transactions = await db.transactions.find({}, {"_id": 0}).to_list(10000)
    total_income = sum(tx['amount'] for tx in transactions if tx['type'] == 'income')
    total_expense = sum(tx['amount'] for tx in transactions if tx['type'] == 'expense')
    
    # Recent transactions
    recent_transactions = await db.transactions.find({}, {"_id": 0}).sort("date", -1).limit(10).to_list(10)
    recent_transactions = [deserialize_datetime(tx) for tx in recent_transactions]
    
    # Recurring bills
    bills = await db.recurring_bills.find({}, {"_id": 0}).to_list(1000)
    
    # Financial goals
    goals = await db.financial_goals.find({}, {"_id": 0}).to_list(1000)
    goals = [deserialize_datetime(g) for g in goals]
    
    return {
        # Accounting Equation
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "net_worth": net_worth,  # This is EQUITY
        
        # Assets Breakdown
        "liquid_assets": liquid_assets,
        "total_investments": total_investments,
        "investments_breakdown": {
            "stocks": total_stocks,
            "deposits": total_deposits,
            "gold": total_gold,
            "mutual_funds": total_mutual_funds
        },
        
        # Legacy fields (for backward compatibility)
        "cash_balance": liquid_assets,
        "total_income": total_income,
        "total_expense": total_expense,
        "total_transactions": len(transactions),
        
        # Details
        "accounts": accounts,
        "recent_transactions": recent_transactions,
        "recurring_bills": bills,
        "active_debts": len(debts),
        "total_debt_amount": total_liabilities,
        "financial_goals": goals,
        
        # Investment details count
        "investment_items_count": {
            "stocks": len(stocks),
            "deposits": len(deposits),
            "gold": len(gold_items),
            "mutual_funds": len(mutual_funds)
        }
    }


# ==================== ANALYTICS ROUTES ====================
@api_router.get("/analytics/monthly")
async def get_monthly_analytics():
    """Get monthly breakdown of income and expenses"""
    transactions = await db.transactions.find({}, {"_id": 0}).to_list(10000)
    transactions = [deserialize_datetime(tx) for tx in transactions]
    
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

@api_router.get("/analytics/balance-sheet")
async def get_balance_sheet():
    """Get complete balance sheet"""
    dashboard = await get_dashboard_data()
    
    return {
        "assets": {
            "liquid_assets": dashboard['liquid_assets'],
            "investments": {
                "stocks": dashboard['investments_breakdown']['stocks'],
                "deposits": dashboard['investments_breakdown']['deposits'],
                "gold": dashboard['investments_breakdown']['gold'],
                "mutual_funds": dashboard['investments_breakdown']['mutual_funds'],
                "total": dashboard['total_investments']
            },
            "total": dashboard['total_assets']
        },
        "liabilities": {
            "total": dashboard['total_liabilities']
        },
        "equity": {
            "net_worth": dashboard['net_worth']
        }
    }

@api_router.get("/analytics/ratios")
async def get_financial_ratios():
    """Get financial health ratios"""
    dashboard = await get_dashboard_data()
    
    # Debt-to-Asset Ratio
    debt_to_asset = (dashboard['total_liabilities'] / dashboard['total_assets'] * 100) if dashboard['total_assets'] > 0 else 0
    
    # Liquid Assets Ratio (Emergency Fund)
    monthly_expense = dashboard['total_expense'] / 12 if dashboard['total_expense'] > 0 else 0
    emergency_fund_months = dashboard['liquid_assets'] / monthly_expense if monthly_expense > 0 else 0
    
    # Investment Ratio
    investment_ratio = (dashboard['total_investments'] / dashboard['total_assets'] * 100) if dashboard['total_assets'] > 0 else 0
    
    return {
        "debt_to_asset_ratio": round(debt_to_asset, 2),
        "emergency_fund_months": round(emergency_fund_months, 2),
        "investment_ratio": round(investment_ratio, 2),
        "liquid_asset_ratio": round((dashboard['liquid_assets'] / dashboard['total_assets'] * 100), 2) if dashboard['total_assets'] > 0 else 0
    }


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
