# FinanceOS - Personal Finance Management System

## Original Problem Statement
User requested to transform a simple personal finance dashboard into a comprehensive, complex financial management system following accounting principles (Harta = Utang + Ekuitas).

## Core Requirements
1. **Accounting Equation Display** - Dashboard shows Assets, Liabilities, and Net Worth (Equity) separately
2. **Transaction Management** - Full CRUD with categorization, payment method tracking
3. **Investment Tracking** - Breakdown by instrument type (stocks, deposits, gold, mutual funds)
4. **Debt Management** - Track liabilities with interest rates and payment schedules
5. **Bill Management** - Recurring bills with "Paid" checklist that auto-creates transactions
6. **Budget Planner** - Set spending limits per category, track progress
7. **Financial Goals** - Savings targets with contribution tracking and progress visualization
8. **Auto-Debt Creation** - Credit Card/Pay Later transactions automatically create debt entries
9. **Settings** - Manage accounts, categories, and user preferences

## Tech Stack
- **Frontend**: React, TailwindCSS, shadcn/ui, Recharts
- **Backend**: FastAPI, Pydantic, Motor (async MongoDB)
- **Database**: MongoDB

## What's Been Implemented

### Completed Features (December 2025)

#### Dashboard
- [x] 3-card Accounting Equation display (Harta, Utang, Kekayaan Bersih)
- [x] Net Worth summary card
- [x] Cash Balance and Investment totals
- [x] Income vs Expense overview
- [x] Asset allocation charts

#### Transactions
- [x] Full CRUD (Create, Read, Update, Delete)
- [x] Filtering by type, category, account
- [x] Sorting by date, amount
- [x] Payment method tracking
- [x] Auto-debt creation for Credit Card/Pay Later transactions

#### Budget Planner
- [x] Create budgets per category
- [x] Monthly navigation
- [x] Progress tracking with visual bars
- [x] Spending alerts (over budget, near limit)
- [x] Summary statistics

#### Financial Goals
- [x] Create savings goals with target dates
- [x] Category-based icons and colors (Emergency Fund, House, Car, etc.)
- [x] Add contributions/savings
- [x] Progress tracking with percentage
- [x] Monthly savings calculator (how much needed per month)
- [x] Achievement badges

#### Investments
- [x] Overview by instrument type
- [x] Detail breakdown pages (stocks, deposits, gold, mutual funds)

#### Debts
- [x] Full CRUD for debt management
- [x] Interest rate tracking
- [x] Monthly payment tracking
- [x] Debt-to-Asset ratio display
- [x] Payment recording

#### Bills
- [x] Recurring bill management
- [x] Mark as Paid checklist
- [x] Auto-create transaction when bill marked paid
- [x] Due date tracking and alerts
- [x] Payment history

#### Settings
- [x] Manage Accounts (add/edit/delete)
- [x] Manage Categories (income/expense categories)
- [x] Preferences (language, currency, theme, notifications, privacy)

### API Endpoints
- `/api/dashboard` - Dashboard summary data
- `/api/transactions` - Transaction CRUD
- `/api/accounts` - Account management
- `/api/budgets` - Budget management with summary
- `/api/goals` - Financial goals CRUD
- `/api/goals/{id}/contribute` - Add goal contributions
- `/api/debts` - Debt management
- `/api/bills` - Bill management
- `/api/bill-payments` - Bill payment tracking
- `/api/analytics/*` - Various analytics endpoints

## Database Schema

### Transactions
```
{id, date, description, amount, type, category, sub_category, account, payment_method, status, notes}
```

### Budgets
```
{id, category, amount, period, month_year, spent, is_active, created_at, updated_at}
```

### Financial Goals
```
{id, name, target_amount, current_amount, target_date, category, is_achieved, notes, color}
```

### Debts
```
{id, debt_type, creditor, principal_amount, current_balance, interest_rate, monthly_payment, start_date, remaining_installments, due_date, is_active, notes}
```

### Bills
```
{id, name, amount, due_date, period, category}
```

## Testing Status
- Backend: 100% (38/38 tests passed)
- Frontend: 100% (all features working)
- Test file: `/app/backend/tests/test_finance_api.py`

## Backlog / Future Tasks

### P1 (High Priority)
- [ ] Financial Reports (Balance Sheet, Income Statement)
- [ ] Investment detail pages with real breakdown (ticker, lots, price)

### P2 (Medium Priority)
- [ ] Debt Payoff Calculator (Snowball vs Avalanche method)
- [ ] Cash Flow Forecast (3-6 month prediction)
- [ ] Emergency Fund Calculator
- [ ] Net Worth Timeline chart

### P3 (Low Priority)
- [ ] Data Export (CSV/JSON)
- [ ] Data Import from CSV
- [ ] Backup/Restore functionality
- [ ] Multi-currency support
- [ ] Dark mode theme

## Known Issues
- None currently

## User Language
Indonesian (Bahasa Indonesia)
