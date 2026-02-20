#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Personal Finance App
Tests all critical endpoints mentioned in the review request
"""

import requests
import sys
import json
from datetime import datetime, timezone
from typing import Dict, Any

class FinanceAPITester:
    def __init__(self, base_url="https://budget-control-93.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_items = {
            'accounts': [],
            'transactions': [],
            'debts': []
        }

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, data: Dict[Any, Any] = None) -> tuple:
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'id' in response_data:
                        print(f"   Created ID: {response_data['id']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text[:200]}")
                return False, {}

        except requests.exceptions.RequestException as e:
            print(f"❌ FAILED - Network Error: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_dashboard_accounting_equation(self):
        """Test Dashboard API - Critical for Accounting Equation display"""
        print("\n" + "="*60)
        print("🏠 TESTING DASHBOARD - ACCOUNTING EQUATION")
        print("="*60)
        
        success, data = self.run_test(
            "Dashboard Data",
            "GET",
            "dashboard",
            200
        )
        
        if success and data:
            # Check for accounting equation fields
            required_fields = ['total_assets', 'total_liabilities', 'net_worth', 'liquid_assets', 'total_investments']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print("✅ All accounting equation fields present")
                print(f"   Assets: {data.get('total_assets', 0)}")
                print(f"   Liabilities: {data.get('total_liabilities', 0)}")
                print(f"   Net Worth (Equity): {data.get('net_worth', 0)}")
                print(f"   Liquid Assets: {data.get('liquid_assets', 0)}")
                print(f"   Total Investments: {data.get('total_investments', 0)}")
                print(f"   Active Debts: {data.get('active_debts', 0)}")
            else:
                print(f"❌ Missing accounting equation fields: {missing_fields}")
                return False
        
        return success

    def test_accounts_management(self):
        """Test Account Management - Critical for duplicate prevention"""
        print("\n" + "="*60)
        print("🏦 TESTING ACCOUNT MANAGEMENT")
        print("="*60)
        
        # Get existing accounts
        success, accounts = self.run_test("Get Accounts", "GET", "accounts", 200)
        if not success:
            return False
        
        print(f"   Found {len(accounts)} existing accounts")
        
        # Create test account
        test_account = {
            "name": "Test Bank Account",
            "type": "Bank",
            "balance": 1000.0,
            "currency": "IDR"
        }
        
        success, created_account = self.run_test(
            "Create Account",
            "POST",
            "accounts",
            200,
            test_account
        )
        
        if success and created_account:
            self.created_items['accounts'].append(created_account['id'])
            
            # Try to create duplicate account (should work - no duplicate prevention in backend)
            success2, duplicate_account = self.run_test(
                "Create Duplicate Account (Backend allows)",
                "POST",
                "accounts",
                200,
                test_account
            )
            
            if success2 and duplicate_account:
                self.created_items['accounts'].append(duplicate_account['id'])
                print("⚠️  Backend allows duplicate accounts - Frontend should prevent this")
        
        return success

    def test_transactions_and_credit_card_integration(self):
        """Test Transaction creation and Credit Card debt integration"""
        print("\n" + "="*60)
        print("💳 TESTING TRANSACTIONS & CREDIT CARD INTEGRATION")
        print("="*60)
        
        # First ensure we have an account
        if not self.created_items['accounts']:
            test_account = {
                "name": "Credit Test Account",
                "type": "Bank",
                "balance": 5000.0
            }
            success, account = self.run_test("Create Account for Transaction", "POST", "accounts", 200, test_account)
            if success:
                self.created_items['accounts'].append(account['id'])
        
        # Test regular transaction
        regular_transaction = {
            "description": "Regular Purchase",
            "amount": 100.0,
            "type": "expense",
            "category": "Shopping",
            "account": "Credit Test Account",
            "payment_method": "Cash"
        }
        
        success, tx1 = self.run_test(
            "Create Regular Transaction",
            "POST",
            "transactions",
            200,
            regular_transaction
        )
        
        if success:
            self.created_items['transactions'].append(tx1['id'])
        
        # Test Credit Card transaction
        credit_transaction = {
            "description": "Credit Card Purchase",
            "amount": 500.0,
            "type": "expense",
            "category": "Shopping",
            "account": "Credit Test Account",
            "payment_method": "Credit Card"
        }
        
        success, tx2 = self.run_test(
            "Create Credit Card Transaction",
            "POST",
            "transactions",
            200,
            credit_transaction
        )
        
        if success:
            self.created_items['transactions'].append(tx2['id'])
            print("⚠️  Credit Card transaction created - Check if debt auto-created in frontend")
        
        return success

    def test_debts_management(self):
        """Test Debt CRUD operations"""
        print("\n" + "="*60)
        print("💸 TESTING DEBT MANAGEMENT")
        print("="*60)
        
        # Get existing debts
        success, debts = self.run_test("Get Debts", "GET", "debts", 200)
        if not success:
            return False
        
        print(f"   Found {len(debts)} existing debts")
        
        # Create test debt
        test_debt = {
            "debt_type": "Credit Card",
            "creditor": "Test Bank Credit Card",
            "principal_amount": 10000.0,
            "current_balance": 8500.0,
            "interest_rate": 18.0,
            "monthly_payment": 500.0,
            "remaining_installments": 17,
            "due_date": "15",
            "notes": "Test debt for API testing"
        }
        
        success, created_debt = self.run_test(
            "Create Debt",
            "POST",
            "debts",
            200,
            test_debt
        )
        
        if success and created_debt:
            debt_id = created_debt['id']
            self.created_items['debts'].append(debt_id)
            
            # Test debt update
            update_data = {
                "current_balance": 8000.0,
                "remaining_installments": 16
            }
            
            success, updated_debt = self.run_test(
                "Update Debt",
                "PUT",
                f"debts/{debt_id}",
                200,
                update_data
            )
        
        return success

    def test_bills_management(self):
        """Test Bills CRUD operations"""
        print("\n" + "="*60)
        print("📅 TESTING BILLS MANAGEMENT")
        print("="*60)
        
        # Get existing bills
        success, bills = self.run_test("Get Bills", "GET", "bills", 200)
        if not success:
            return False
        
        print(f"   Found {len(bills)} existing bills")
        
        # Create test bill
        test_bill = {
            "name": "Test Electricity Bill",
            "amount": 150.0,
            "due_date": "25",
            "period": "Monthly",
            "category": "Bills"
        }
        
        success, created_bill = self.run_test(
            "Create Bill",
            "POST",
            "bills",
            200,
            test_bill
        )
        
        return success

    def test_investments_endpoints(self):
        """Test Investment endpoints"""
        print("\n" + "="*60)
        print("📈 TESTING INVESTMENT ENDPOINTS")
        print("="*60)
        
        # Test stocks
        success1, stocks = self.run_test("Get Stocks", "GET", "stocks", 200)
        
        # Test deposits
        success2, deposits = self.run_test("Get Deposits", "GET", "deposits", 200)
        
        # Test gold
        success3, gold = self.run_test("Get Gold", "GET", "gold", 200)
        
        # Test mutual funds
        success4, funds = self.run_test("Get Mutual Funds", "GET", "mutual-funds", 200)
        
        # Test legacy investments endpoint
        success5, legacy = self.run_test("Get Legacy Investments", "GET", "investments", 200)
        
        if success1 and success2 and success3 and success4 and success5:
            print("✅ All investment endpoints working")
            if legacy:
                print(f"   Stocks: {legacy.get('saham', 0)}")
                print(f"   Deposits: {legacy.get('deposito', 0)}")
                print(f"   Gold: {legacy.get('emas', 0)}")
                print(f"   Mutual Funds: {legacy.get('reksadana', 0)}")
        
        return success1 and success2 and success3 and success4 and success5

    def cleanup_test_data(self):
        """Clean up created test data"""
        print("\n" + "="*60)
        print("🧹 CLEANING UP TEST DATA")
        print("="*60)
        
        # Delete transactions first (they reference accounts)
        for tx_id in self.created_items['transactions']:
            self.run_test(f"Delete Transaction {tx_id}", "DELETE", f"transactions/{tx_id}", 200)
        
        # Delete debts
        for debt_id in self.created_items['debts']:
            self.run_test(f"Delete Debt {debt_id}", "DELETE", f"debts/{debt_id}", 200)
        
        # Delete accounts last
        for acc_id in self.created_items['accounts']:
            self.run_test(f"Delete Account {acc_id}", "DELETE", f"accounts/{acc_id}", 200)

    def run_all_tests(self):
        """Run comprehensive backend API tests"""
        print("🚀 STARTING COMPREHENSIVE BACKEND API TESTING")
        print("="*80)
        
        # Test core functionality in order
        tests = [
            ("Dashboard & Accounting Equation", self.test_dashboard_accounting_equation),
            ("Account Management", self.test_accounts_management),
            ("Transactions & Credit Card", self.test_transactions_and_credit_card_integration),
            ("Debt Management", self.test_debts_management),
            ("Bills Management", self.test_bills_management),
            ("Investment Endpoints", self.test_investments_endpoints),
        ]
        
        failed_tests = []
        
        for test_name, test_func in tests:
            try:
                if not test_func():
                    failed_tests.append(test_name)
            except Exception as e:
                print(f"❌ {test_name} failed with exception: {e}")
                failed_tests.append(test_name)
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print final results
        print("\n" + "="*80)
        print("📊 FINAL TEST RESULTS")
        print("="*80)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if failed_tests:
            print(f"\n❌ Failed Test Categories: {', '.join(failed_tests)}")
            return 1
        else:
            print("\n✅ All test categories passed!")
            return 0

def main():
    tester = FinanceAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())