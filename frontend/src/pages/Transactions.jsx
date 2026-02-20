import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Settings,
  CreditCard as CreditCardIcon
} from 'lucide-react';
import { toast } from 'sonner';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const CATEGORIES = {
  income: ['Salary', 'Business', 'Investment', 'Freelance', 'Dividend', 'Interest', 'Other Income'],
  expense: ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Subscription', 'Debt Payment', 'Other Expense']
};

const SUB_CATEGORIES = {
  income: ['Active', 'Passive'],
  expense: ['Needs', 'Wants']
};

const PAYMENT_METHODS = ['Cash', 'Debit Card', 'Credit Card', 'Bank Transfer', 'E-Wallet', 'Pay Later'];
const STATUSES = ['Completed', 'Pending', 'Cancelled'];

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAccountManagement, setShowAccountManagement] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Account management
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('Bank');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Form data
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    sub_category: 'Needs',
    account: '',
    payment_method: 'Cash',
    status: 'Completed',
    notes: '',
    tags: [],
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, [searchQuery, typeFilter, categoryFilter, accountFilter, statusFilter, sortBy, sortOrder]);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (accountFilter !== 'all') params.append('account', accountFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);
      
      const response = await axios.get(`${API}/transactions?${params.toString()}`);
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API}/accounts`);
      if (response.data.length === 0) {
        const defaultAccounts = ['BCA', 'Mandiri', 'GoPay', 'Cash', 'Binance'];
        for (const name of defaultAccounts) {
          await axios.post(`${API}/accounts`, { name, type: 'Bank', balance: 0 });
        }
        const newResponse = await axios.get(`${API}/accounts`);
        setAccounts(newResponse.data);
        if (newResponse.data.length > 0) {
          setFormData(prev => ({ ...prev, account: newResponse.data[0].name }));
        }
      } else {
        setAccounts(response.data);
        if (response.data.length > 0 && !formData.account) {
          setFormData(prev => ({ ...prev, account: response.data[0].name }));
        }
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      toast.error('Please enter account name');\n      return;\n    }\n    \n    // Check for duplicates (case-insensitive)\n    const exists = accounts.find(acc => acc.name.toLowerCase() === newAccountName.trim().toLowerCase());\n    if (exists) {\n      toast.error(`Account "${newAccountName}" already exists!`, {\n        description: 'Please choose a different name'\n      });\n      return;\n    }\n\n    try {\n      await axios.post(`${API}/accounts`, {\n        name: newAccountName.trim(),\n        type: newAccountType,\n        balance: 0\n      });\n      toast.success(`Account "${newAccountName}" added successfully!`);\n      setNewAccountName('');\n      setNewAccountType('Bank');\n      fetchAccounts();\n    } catch (error) {\n      console.error('Error adding account:', error);\n      toast.error('Failed to add account');\n    }\n  };

  const handleDeleteAccount = async (accountId, accountName) => {
    try {
      await axios.delete(`${API}/accounts/${accountId}`);
      toast.success(`Account ${accountName} deleted successfully!`);
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const createDebtFromCreditTransaction = async (transaction) => {
    try {
      const debtsResponse = await axios.get(`${API}/debts`);
      const existingDebt = debtsResponse.data.find(
        d => d.creditor === transaction.account && d.is_active
      );

      if (existingDebt) {
        await axios.put(`${API}/debts/${existingDebt.id}`, {
          current_balance: existingDebt.current_balance + transaction.amount
        });
      } else {
        await axios.post(`${API}/debts`, {
          debt_type: transaction.payment_method === 'Credit Card' ? 'Credit Card' : 'Personal Loan',
          creditor: transaction.account,
          principal_amount: transaction.amount,
          current_balance: transaction.amount,
          interest_rate: transaction.payment_method === 'Credit Card' ? 2.5 : 1.5,
          monthly_payment: transaction.amount * 0.1,
          remaining_installments: 10,
          due_date: '05',
          notes: `Auto-created from transaction: ${transaction.description}`
        });
      }
    } catch (error) {
      console.error('Error creating/updating debt:', error);
    }
  };

  const handleAddTransaction = async () => {
    try {
      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount),
        tags: formData.tags.filter(t => t.trim() !== '')
      };
      
      const response = await axios.post(`${API}/transactions`, dataToSend);
      
      if ((formData.payment_method === 'Credit Card' || formData.payment_method === 'Pay Later') && formData.type === 'expense') {
        await createDebtFromCreditTransaction(response.data);
        toast.success('Transaction added and debt created successfully!', {
          description: 'Check the Debts page to manage your credit'
        });
      } else {
        toast.success('Transaction added successfully!');
      }
      
      setShowAddDialog(false);
      resetForm();
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    }
  };

  const handleEditTransaction = async () => {
    try {
      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount),
        tags: formData.tags.filter(t => t.trim() !== '')
      };
      await axios.put(`${API}/transactions/${selectedTransaction.id}`, dataToSend);
      toast.success('Transaction updated successfully!');
      setShowEditDialog(false);
      resetForm();
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async () => {
    try {
      await axios.delete(`${API}/transactions/${selectedTransaction.id}`);
      toast.success('Transaction deleted successfully!');
      setShowDeleteDialog(false);
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const openEditDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      sub_category: transaction.sub_category || '',
      account: transaction.account,
      payment_method: transaction.payment_method || 'Cash',
      status: transaction.status || 'Completed',
      notes: transaction.notes || '',
      tags: transaction.tags || [],
      date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      category: 'Food',
      sub_category: 'Needs',
      account: accounts[0]?.name || '',
      payment_method: 'Cash',
      status: 'Completed',
      notes: '',
      tags: [],
      date: new Date().toISOString().split('T')[0]
    });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Sub-Category', 'Account', 'Payment Method', 'Status', 'Notes'];
    const rows = transactions.map(tx => [
      new Date(tx.date).toLocaleDateString('id-ID'),
      tx.description,
      tx.amount,
      tx.type,
      tx.category,
      tx.sub_category || '',
      tx.account,
      tx.payment_method || '',
      tx.status || '',
      tx.notes || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Transactions exported to CSV!');
  };

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4 ml-1" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const netBalance = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-emerald-100 bg-emerald-50/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-emerald-700">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-emerald-600">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card className="border-rose-100 bg-rose-50/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-rose-700">Total Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-rose-600">{formatCurrency(totalExpense)}</p>
          </CardContent>
        </Card>
        <Card className="border-indigo-100 bg-indigo-50/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-indigo-700">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-black ${netBalance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              {formatCurrency(netBalance)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <CardTitle className="text-2xl font-black text-slate-800">Transaction History</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => setShowAccountManagement(true)} variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Manage Accounts
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => { resetForm(); setShowAddDialog(true); }} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {[...CATEGORIES.income, ...CATEGORIES.expense].map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('date')}>
                      <div className="flex items-center">
                        Date {getSortIcon('date')}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('amount')}>
                      <div className="flex items-center">
                        Amount {getSortIcon('amount')}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-20 text-center text-slate-400 font-semibold">
                        No transactions found. Add your first transaction to get started!
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const isIncome = tx.type === 'income';
                      const isCreditCard = tx.payment_method === 'Credit Card' || tx.payment_method === 'Pay Later';
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors" data-testid="transaction-row">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-semibold text-slate-700">
                                {new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{tx.description}</p>
                              {tx.sub_category && (
                                <p className="text-xs text-slate-500 mt-1">{tx.sub_category}</p>
                              )}
                              {tx.notes && (
                                <p className="text-xs text-slate-400 mt-1 italic">{tx.notes}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {isIncome ? (
                                <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4 text-rose-500" />
                              )}
                              <span className={`text-sm font-black ${
                                isIncome ? 'text-emerald-600' : 'text-slate-900'
                              }`}>
                                {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className="font-semibold">
                              {tx.category}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-slate-700">{tx.account}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {isCreditCard && <CreditCardIcon className="w-4 h-4 text-orange-500" />}
                              <span className={`text-sm ${
                                isCreditCard ? 'font-bold text-orange-600' : 'text-slate-600'
                              }`}>
                                {tx.payment_method || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={tx.status === 'Completed' ? 'default' : tx.status === 'Pending' ? 'secondary' : 'destructive'}
                              className="font-semibold"
                            >
                              {tx.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(tx)}
                                data-testid="edit-transaction-btn"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(tx)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                data-testid="delete-transaction-btn"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-sm text-slate-600 font-semibold">
            Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Add New Transaction</DialogTitle>
            <DialogDescription>
              Record a new income or expense transaction
            </DialogDescription>
          </DialogHeader>
          <TransactionForm 
            formData={formData} 
            setFormData={setFormData} 
            accounts={accounts}
          />
          {(formData.payment_method === 'Credit Card' || formData.payment_method === 'Pay Later') && formData.type === 'expense' && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CreditCardIcon className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-orange-900">Credit/Pay Later Notice</p>
                  <p className="text-xs text-orange-700 mt-1">
                    This transaction will automatically create or update a debt record in your Liabilities.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTransaction} data-testid="save-transaction-btn">Save Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Edit Transaction</DialogTitle>
            <DialogDescription>
              Update transaction details
            </DialogDescription>
          </DialogHeader>
          <TransactionForm 
            formData={formData} 
            setFormData={setFormData} 
            accounts={accounts}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditTransaction}>Update Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} className="bg-rose-600 hover:bg-rose-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showAccountManagement} onOpenChange={setShowAccountManagement}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Account Management
            </DialogTitle>
            <DialogDescription>
              Add or remove accounts from your transaction dropdown
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-700">Add New Account</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input
                    placeholder="Account name (e.g., BCA, OVO)"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAccount()}
                  />
                </div>
                <Select value={newAccountType} onValueChange={setNewAccountType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank">Bank</SelectItem>
                    <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Investment">Investment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddAccount} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-700">Existing Accounts ({accounts.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800">{account.name}</p>
                      <p className="text-xs text-slate-500">{account.type} • Balance: {formatCurrency(account.balance)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (window.confirm(`Delete account "${account.name}"?`)) {
                          handleDeleteAccount(account.id, account.name);
                        }
                      }}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowAccountManagement(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TransactionForm({ formData, setFormData, accounts }) {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'type') {
      if (value === 'income') {
        setFormData(prev => ({ 
          ...prev, 
          type: value, 
          category: 'Salary',
          sub_category: 'Active' 
        }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          type: value, 
          category: 'Food',
          sub_category: 'Needs' 
        }));
      }
    }
  };

  return (
    <div className="grid gap-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            placeholder="e.g., Monthly Salary, Grocery Shopping"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            data-testid="transaction-description"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (Rp) *</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            data-testid="transaction-amount"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
            <SelectTrigger data-testid="transaction-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
            <SelectTrigger data-testid="transaction-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES[formData.type].map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sub_category">Sub-Category</Label>
          <Select value={formData.sub_category} onValueChange={(value) => handleChange('sub_category', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUB_CATEGORIES[formData.type].map(subCat => (
                <SelectItem key={subCat} value={subCat}>{subCat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="account">Account *</Label>
          <Select value={formData.account} onValueChange={(value) => handleChange('account', value)}>
            <SelectTrigger data-testid="transaction-account">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="payment_method">Payment Method</Label>
          <Select value={formData.payment_method} onValueChange={(value) => handleChange('payment_method', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map(method => (
                <SelectItem key={method} value={method}>{method}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Additional details about this transaction..."
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}

export default Transactions;