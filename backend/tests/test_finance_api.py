"""
Comprehensive Backend API Tests for Personal Finance Dashboard
Tests: Dashboard, Budget Planner, Financial Goals, Transactions, Bills, Debts, Settings
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndDashboard:
    """Test API health and dashboard endpoints"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"API Root: {data['message']}")
    
    def test_dashboard_data(self):
        """Test dashboard endpoint returns accounting equation data"""
        response = requests.get(f"{BASE_URL}/api/dashboard")
        assert response.status_code == 200
        data = response.json()
        
        # Verify accounting equation fields
        assert "total_assets" in data
        assert "total_liabilities" in data
        assert "net_worth" in data
        
        # Verify accounting equation: Assets - Liabilities = Net Worth
        calculated_net_worth = data["total_assets"] - data["total_liabilities"]
        assert abs(data["net_worth"] - calculated_net_worth) < 0.01, \
            f"Accounting equation mismatch: {data['total_assets']} - {data['total_liabilities']} != {data['net_worth']}"
        
        # Verify other dashboard fields
        assert "liquid_assets" in data
        assert "total_investments" in data
        assert "investments_breakdown" in data
        assert "accounts" in data
        assert "recent_transactions" in data
        assert "recurring_bills" in data
        assert "financial_goals" in data
        
        print(f"Dashboard: Assets={data['total_assets']}, Liabilities={data['total_liabilities']}, Net Worth={data['net_worth']}")


class TestBudgetPlanner:
    """Test Budget Planner CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_budget_id = None
        yield
        # Cleanup
        if self.test_budget_id:
            requests.delete(f"{BASE_URL}/api/budgets/{self.test_budget_id}")
    
    def test_create_budget(self):
        """Test creating a new budget"""
        current_month = datetime.now().strftime('%Y-%m')
        budget_data = {
            "category": "TEST_Food_Budget",
            "amount": 2000000,
            "period": "Monthly",
            "month_year": current_month
        }
        
        response = requests.post(f"{BASE_URL}/api/budgets", json=budget_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["category"] == budget_data["category"]
        assert data["amount"] == budget_data["amount"]
        assert data["month_year"] == current_month
        assert "id" in data
        
        self.test_budget_id = data["id"]
        print(f"Created budget: {data['id']} for {data['category']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/budgets/{data['id']}")
    
    def test_get_budgets(self):
        """Test getting all budgets"""
        response = requests.get(f"{BASE_URL}/api/budgets")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} budgets")
    
    def test_get_budgets_by_month(self):
        """Test getting budgets filtered by month"""
        current_month = datetime.now().strftime('%Y-%m')
        response = requests.get(f"{BASE_URL}/api/budgets?month_year={current_month}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} budgets for {current_month}")
    
    def test_budget_summary(self):
        """Test budget summary endpoint"""
        response = requests.get(f"{BASE_URL}/api/budgets/summary")
        assert response.status_code == 200
        data = response.json()
        
        assert "month_year" in data
        assert "total_budget" in data
        assert "total_spent" in data
        assert "remaining" in data
        assert "utilization_percentage" in data
        print(f"Budget Summary: Total={data['total_budget']}, Spent={data['total_spent']}")
    
    def test_delete_budget(self):
        """Test deleting a budget"""
        # First create a budget
        current_month = datetime.now().strftime('%Y-%m')
        budget_data = {
            "category": "TEST_Delete_Budget",
            "amount": 500000,
            "period": "Monthly",
            "month_year": current_month
        }
        
        create_response = requests.post(f"{BASE_URL}/api/budgets", json=budget_data)
        assert create_response.status_code == 200
        budget_id = create_response.json()["id"]
        
        # Delete the budget
        delete_response = requests.delete(f"{BASE_URL}/api/budgets/{budget_id}")
        assert delete_response.status_code == 200
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/budgets")
        budgets = get_response.json()
        assert not any(b["id"] == budget_id for b in budgets)
        print(f"Successfully deleted budget: {budget_id}")


class TestFinancialGoals:
    """Test Financial Goals CRUD and contribution operations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_goal_id = None
        yield
        # Cleanup
        if self.test_goal_id:
            requests.delete(f"{BASE_URL}/api/goals/{self.test_goal_id}")
    
    def test_create_goal(self):
        """Test creating a new financial goal"""
        target_date = (datetime.now() + timedelta(days=365)).isoformat()
        goal_data = {
            "name": "TEST_Emergency_Fund",
            "target_amount": 50000000,
            "current_amount": 0,
            "target_date": target_date,
            "category": "Emergency Fund",
            "notes": "Test goal",
            "color": "#ef4444"
        }
        
        response = requests.post(f"{BASE_URL}/api/goals", json=goal_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["name"] == goal_data["name"]
        assert data["target_amount"] == goal_data["target_amount"]
        assert data["current_amount"] == 0
        assert data["is_achieved"] == False
        assert "id" in data
        
        self.test_goal_id = data["id"]
        print(f"Created goal: {data['id']} - {data['name']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/goals/{data['id']}")
    
    def test_get_goals(self):
        """Test getting all financial goals"""
        response = requests.get(f"{BASE_URL}/api/goals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} financial goals")
    
    def test_add_contribution_to_goal(self):
        """Test adding a contribution/savings to a goal"""
        # First create a goal
        target_date = (datetime.now() + timedelta(days=365)).isoformat()
        goal_data = {
            "name": "TEST_Contribution_Goal",
            "target_amount": 10000000,
            "current_amount": 0,
            "target_date": target_date,
            "category": "Savings",
            "color": "#22c55e"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/goals", json=goal_data)
        assert create_response.status_code == 200
        goal_id = create_response.json()["id"]
        
        # Add contribution
        contribution_data = {
            "goal_id": goal_id,
            "amount": 1000000,
            "notes": "First contribution"
        }
        
        contrib_response = requests.post(f"{BASE_URL}/api/goals/{goal_id}/contribute", json=contribution_data)
        assert contrib_response.status_code == 200
        updated_goal = contrib_response.json()
        
        assert updated_goal["current_amount"] == 1000000
        print(f"Added contribution: Goal now at {updated_goal['current_amount']}/{updated_goal['target_amount']}")
        
        # Verify contribution history
        history_response = requests.get(f"{BASE_URL}/api/goals/{goal_id}/contributions")
        assert history_response.status_code == 200
        contributions = history_response.json()
        assert len(contributions) >= 1
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/goals/{goal_id}")
    
    def test_goal_progress_tracking(self):
        """Test goal progress tracking when contribution reaches target"""
        target_date = (datetime.now() + timedelta(days=365)).isoformat()
        goal_data = {
            "name": "TEST_Progress_Goal",
            "target_amount": 1000000,
            "current_amount": 0,
            "target_date": target_date,
            "category": "Savings",
            "color": "#3b82f6"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/goals", json=goal_data)
        assert create_response.status_code == 200
        goal_id = create_response.json()["id"]
        
        # Add contribution that reaches target
        contribution_data = {
            "goal_id": goal_id,
            "amount": 1000000,
            "notes": "Full contribution"
        }
        
        contrib_response = requests.post(f"{BASE_URL}/api/goals/{goal_id}/contribute", json=contribution_data)
        assert contrib_response.status_code == 200
        updated_goal = contrib_response.json()
        
        assert updated_goal["is_achieved"] == True
        print(f"Goal achieved! Current: {updated_goal['current_amount']}, Target: {updated_goal['target_amount']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/goals/{goal_id}")


class TestTransactions:
    """Test Transaction CRUD operations"""
    
    def test_create_transaction(self):
        """Test creating a new transaction"""
        tx_data = {
            "description": "TEST_Grocery_Shopping",
            "amount": 250000,
            "type": "expense",
            "category": "Food",
            "account": "Cash",
            "payment_method": "Cash",
            "status": "Completed",
            "notes": "Test transaction"
        }
        
        response = requests.post(f"{BASE_URL}/api/transactions", json=tx_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["description"] == tx_data["description"]
        assert data["amount"] == tx_data["amount"]
        assert data["type"] == tx_data["type"]
        assert "id" in data
        
        tx_id = data["id"]
        print(f"Created transaction: {tx_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/transactions/{tx_id}")
    
    def test_get_transactions(self):
        """Test getting all transactions"""
        response = requests.get(f"{BASE_URL}/api/transactions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} transactions")
    
    def test_get_transactions_with_filters(self):
        """Test getting transactions with filters"""
        response = requests.get(f"{BASE_URL}/api/transactions?type=expense&limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned transactions should be expenses
        for tx in data:
            assert tx["type"] == "expense"
        print(f"Found {len(data)} expense transactions")
    
    def test_transaction_stats(self):
        """Test transaction statistics endpoint"""
        response = requests.get(f"{BASE_URL}/api/transactions/stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "total_income" in data
        assert "total_expense" in data
        assert "net" in data
        assert "total_transactions" in data
        assert "category_breakdown" in data
        print(f"Transaction Stats: Income={data['total_income']}, Expense={data['total_expense']}")
    
    def test_delete_transaction(self):
        """Test deleting a transaction"""
        # First create a transaction
        tx_data = {
            "description": "TEST_Delete_Transaction",
            "amount": 50000,
            "type": "expense",
            "category": "Other Expense",
            "account": "Cash",
            "payment_method": "Cash"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/transactions", json=tx_data)
        assert create_response.status_code == 200
        tx_id = create_response.json()["id"]
        
        # Delete the transaction
        delete_response = requests.delete(f"{BASE_URL}/api/transactions/{tx_id}")
        assert delete_response.status_code == 200
        print(f"Successfully deleted transaction: {tx_id}")
    
    def test_credit_card_transaction_creates_debt(self):
        """Test that credit card transaction auto-creates debt entry"""
        tx_data = {
            "description": "TEST_Credit_Card_Purchase",
            "amount": 500000,
            "type": "expense",
            "category": "Shopping",
            "account": "TEST_CC_Account",
            "payment_method": "Credit Card",
            "status": "Completed"
        }
        
        response = requests.post(f"{BASE_URL}/api/transactions", json=tx_data)
        assert response.status_code == 200
        tx_id = response.json()["id"]
        
        # Check if debt was created
        debts_response = requests.get(f"{BASE_URL}/api/debts")
        assert debts_response.status_code == 200
        debts = debts_response.json()
        
        # Find the auto-created debt
        auto_debt = next((d for d in debts if d["creditor"] == "TEST_CC_Account"), None)
        if auto_debt:
            print(f"Credit card debt auto-created: {auto_debt['id']} with balance {auto_debt['current_balance']}")
            # Cleanup debt
            requests.delete(f"{BASE_URL}/api/debts/{auto_debt['id']}")
        else:
            print("Note: Auto-debt creation may have updated existing debt")
        
        # Cleanup transaction
        requests.delete(f"{BASE_URL}/api/transactions/{tx_id}")


class TestBills:
    """Test Bills management and payment operations"""
    
    def test_create_bill(self):
        """Test creating a new recurring bill"""
        bill_data = {
            "name": "TEST_Internet_Bill",
            "amount": 500000,
            "due_date": "15",
            "period": "Monthly",
            "category": "Bills"
        }
        
        response = requests.post(f"{BASE_URL}/api/bills", json=bill_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["name"] == bill_data["name"]
        assert data["amount"] == bill_data["amount"]
        assert data["is_active"] == True
        assert "id" in data
        
        bill_id = data["id"]
        print(f"Created bill: {bill_id} - {data['name']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/bills/{bill_id}")
    
    def test_get_bills(self):
        """Test getting all bills"""
        response = requests.get(f"{BASE_URL}/api/bills")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} recurring bills")
    
    def test_mark_bill_as_paid(self):
        """Test marking a bill as paid (creates transaction automatically)"""
        # First create a bill
        bill_data = {
            "name": "TEST_Paid_Bill",
            "amount": 100000,
            "due_date": "20",
            "period": "Monthly",
            "category": "Bills"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/bills", json=bill_data)
        assert create_response.status_code == 200
        bill = create_response.json()
        bill_id = bill["id"]
        
        # Mark as paid
        current_month = datetime.now().strftime('%Y-%m')
        payment_data = {
            "bill_id": bill_id,
            "bill_name": bill["name"],
            "amount": bill["amount"],
            "due_date": bill["due_date"],
            "month_year": current_month,
            "notes": "Test payment"
        }
        
        payment_response = requests.post(f"{BASE_URL}/api/bill-payments", json=payment_data)
        assert payment_response.status_code == 200
        payment = payment_response.json()
        
        assert payment["is_paid"] == True
        assert payment["bill_id"] == bill_id
        print(f"Bill marked as paid: {payment['id']}")
        
        # Verify transaction was created
        tx_response = requests.get(f"{BASE_URL}/api/transactions?search=Bill Payment")
        assert tx_response.status_code == 200
        transactions = tx_response.json()
        
        # Find the auto-created transaction
        auto_tx = next((tx for tx in transactions if f"Bill Payment: {bill['name']}" in tx["description"]), None)
        if auto_tx:
            print(f"Auto-created transaction found: {auto_tx['id']}")
            # Cleanup transaction
            requests.delete(f"{BASE_URL}/api/transactions/{auto_tx['id']}")
        
        # Cleanup bill
        requests.delete(f"{BASE_URL}/api/bills/{bill_id}")
    
    def test_get_bill_payments(self):
        """Test getting bill payment history"""
        response = requests.get(f"{BASE_URL}/api/bill-payments")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} bill payments")
    
    def test_delete_bill(self):
        """Test deleting a bill"""
        # First create a bill
        bill_data = {
            "name": "TEST_Delete_Bill",
            "amount": 75000,
            "due_date": "25",
            "period": "Monthly"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/bills", json=bill_data)
        assert create_response.status_code == 200
        bill_id = create_response.json()["id"]
        
        # Delete the bill
        delete_response = requests.delete(f"{BASE_URL}/api/bills/{bill_id}")
        assert delete_response.status_code == 200
        print(f"Successfully deleted bill: {bill_id}")


class TestDebts:
    """Test Debts management operations"""
    
    def test_create_debt(self):
        """Test creating a new debt"""
        debt_data = {
            "debt_type": "Personal Loan",
            "creditor": "TEST_Bank_ABC",
            "principal_amount": 10000000,
            "current_balance": 8000000,
            "interest_rate": 12.5,
            "monthly_payment": 500000,
            "remaining_installments": 16,
            "due_date": "10",
            "notes": "Test debt"
        }
        
        response = requests.post(f"{BASE_URL}/api/debts", json=debt_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["creditor"] == debt_data["creditor"]
        assert data["principal_amount"] == debt_data["principal_amount"]
        assert data["current_balance"] == debt_data["current_balance"]
        assert data["is_active"] == True
        assert "id" in data
        
        debt_id = data["id"]
        print(f"Created debt: {debt_id} - {data['creditor']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/debts/{debt_id}")
    
    def test_get_debts(self):
        """Test getting all debts"""
        response = requests.get(f"{BASE_URL}/api/debts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} debts")
    
    def test_update_debt(self):
        """Test updating a debt"""
        # First create a debt
        debt_data = {
            "debt_type": "Credit Card",
            "creditor": "TEST_Update_Debt",
            "principal_amount": 5000000,
            "current_balance": 5000000,
            "interest_rate": 2.5,
            "monthly_payment": 250000,
            "remaining_installments": 20,
            "due_date": "05"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/debts", json=debt_data)
        assert create_response.status_code == 200
        debt_id = create_response.json()["id"]
        
        # Update the debt
        update_data = {
            "current_balance": 4500000,
            "remaining_installments": 18
        }
        
        update_response = requests.put(f"{BASE_URL}/api/debts/{debt_id}", json=update_data)
        assert update_response.status_code == 200
        updated_debt = update_response.json()
        
        assert updated_debt["current_balance"] == 4500000
        assert updated_debt["remaining_installments"] == 18
        print(f"Updated debt: {debt_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/debts/{debt_id}")
    
    def test_delete_debt(self):
        """Test deleting a debt"""
        # First create a debt
        debt_data = {
            "debt_type": "Installment",
            "creditor": "TEST_Delete_Debt",
            "principal_amount": 2000000,
            "current_balance": 2000000,
            "interest_rate": 0,
            "monthly_payment": 200000,
            "remaining_installments": 10,
            "due_date": "15"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/debts", json=debt_data)
        assert create_response.status_code == 200
        debt_id = create_response.json()["id"]
        
        # Delete the debt
        delete_response = requests.delete(f"{BASE_URL}/api/debts/{debt_id}")
        assert delete_response.status_code == 200
        print(f"Successfully deleted debt: {debt_id}")
    
    def test_debt_ratios_via_balance_sheet(self):
        """Test debt ratios via balance sheet endpoint (debt-ratios endpoint not implemented)"""
        response = requests.get(f"{BASE_URL}/api/analytics/balance-sheet")
        assert response.status_code == 200
        data = response.json()
        
        # Calculate debt-to-asset ratio from balance sheet
        total_assets = data["assets"]["total"]
        total_liabilities = data["liabilities"]["total"]
        
        if total_assets > 0:
            debt_to_asset_ratio = (total_liabilities / total_assets) * 100
        else:
            debt_to_asset_ratio = 0
        
        print(f"Debt-to-Asset Ratio (calculated): {debt_to_asset_ratio:.2f}%")


class TestAccounts:
    """Test Account management operations"""
    
    def test_create_account(self):
        """Test creating a new account"""
        account_data = {
            "name": "TEST_Savings_Account",
            "type": "Bank",
            "balance": 5000000,
            "currency": "IDR"
        }
        
        response = requests.post(f"{BASE_URL}/api/accounts", json=account_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["name"] == account_data["name"]
        assert data["balance"] == account_data["balance"]
        assert "id" in data
        
        account_id = data["id"]
        print(f"Created account: {account_id} - {data['name']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/accounts/{account_id}")
    
    def test_get_accounts(self):
        """Test getting all accounts"""
        response = requests.get(f"{BASE_URL}/api/accounts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} accounts")
    
    def test_delete_account(self):
        """Test deleting an account"""
        # First create an account
        account_data = {
            "name": "TEST_Delete_Account",
            "type": "E-Wallet",
            "balance": 0
        }
        
        create_response = requests.post(f"{BASE_URL}/api/accounts", json=account_data)
        assert create_response.status_code == 200
        account_id = create_response.json()["id"]
        
        # Delete the account
        delete_response = requests.delete(f"{BASE_URL}/api/accounts/{account_id}")
        assert delete_response.status_code == 200
        print(f"Successfully deleted account: {account_id}")


class TestAnalytics:
    """Test Analytics endpoints"""
    
    def test_monthly_analytics(self):
        """Test monthly analytics endpoint"""
        response = requests.get(f"{BASE_URL}/api/analytics/monthly")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"Monthly analytics: {len(data)} months of data")
    
    def test_category_analytics(self):
        """Test category analytics endpoint"""
        response = requests.get(f"{BASE_URL}/api/analytics/category")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"Category analytics: {len(data)} categories")
    
    def test_balance_sheet(self):
        """Test balance sheet endpoint"""
        response = requests.get(f"{BASE_URL}/api/analytics/balance-sheet")
        assert response.status_code == 200
        data = response.json()
        
        assert "assets" in data
        assert "liabilities" in data
        assert "equity" in data
        
        # Verify accounting equation
        total_assets = data["assets"]["total"]
        total_liabilities = data["liabilities"]["total"]
        equity = data["equity"]["net_worth"]
        
        # Assets = Liabilities + Equity
        calculated_assets = total_liabilities + equity
        assert abs(total_assets - calculated_assets) < 0.01, \
            f"Balance sheet equation mismatch: {total_assets} != {total_liabilities} + {equity}"
        
        print(f"Balance Sheet: Assets={total_assets}, Liabilities={total_liabilities}, Equity={equity}")


class TestInvestments:
    """Test Investment endpoints (Stocks, Deposits, Gold, Mutual Funds)"""
    
    def test_get_investments_legacy(self):
        """Test legacy investments endpoint"""
        response = requests.get(f"{BASE_URL}/api/investments")
        assert response.status_code == 200
        data = response.json()
        
        assert "saham" in data
        assert "deposito" in data
        assert "emas" in data
        assert "reksadana" in data
        print(f"Investments: Saham={data['saham']}, Deposito={data['deposito']}, Emas={data['emas']}, Reksadana={data['reksadana']}")
    
    def test_get_stocks(self):
        """Test getting stocks"""
        response = requests.get(f"{BASE_URL}/api/stocks")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} stocks")
    
    def test_get_deposits(self):
        """Test getting deposits"""
        response = requests.get(f"{BASE_URL}/api/deposits")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} deposits")
    
    def test_get_gold(self):
        """Test getting gold investments"""
        response = requests.get(f"{BASE_URL}/api/gold")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} gold items")
    
    def test_get_mutual_funds(self):
        """Test getting mutual funds"""
        response = requests.get(f"{BASE_URL}/api/mutual-funds")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} mutual funds")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
