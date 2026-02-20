import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Edit, 
  Trash2,
  PieChart,
  Target,
  ChevronLeft,
  ChevronRight
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

const EXPENSE_CATEGORIES = [
  'Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 
  'Health', 'Education', 'Subscription', 'Debt Payment', 'Other Expense'
];

const CATEGORY_COLORS = {
  'Food': '#ef4444',
  'Transport': '#f97316',
  'Bills': '#eab308',
  'Shopping': '#84cc16',
  'Entertainment': '#22c55e',
  'Health': '#14b8a6',
  'Education': '#06b6d4',
  'Subscription': '#3b82f6',
  'Debt Payment': '#8b5cf6',
  'Other Expense': '#ec4899'
};

function BudgetPlanner() {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  
  // Current month navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    period: 'Monthly'
  });

  useEffect(() => {
    fetchBudgets();
  }, [monthYear]);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get(`${API}/budgets/summary?month_year=${monthYear}`);
      setSummary(response.data);
      setBudgets(response.data.budgets || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setLoading(false);
    }
  };

  const handleAddBudget = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    try {
      await axios.post(`${API}/budgets`, {
        ...formData,
        amount: parseFloat(formData.amount),
        month_year: monthYear
      });
      toast.success('Budget created successfully!');
      setShowAddDialog(false);
      resetForm();
      fetchBudgets();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error(error.response?.data?.detail || 'Failed to create budget');
    }
  };

  const handleEditBudget = async () => {
    try {
      await axios.put(`${API}/budgets/${selectedBudget.id}`, {
        amount: parseFloat(formData.amount)
      });
      toast.success('Budget updated successfully!');
      setShowEditDialog(false);
      resetForm();
      setSelectedBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    }
  };

  const handleDeleteBudget = async () => {
    try {
      await axios.delete(`${API}/budgets/${selectedBudget.id}`);
      toast.success('Budget deleted successfully!');
      setShowDeleteDialog(false);
      setSelectedBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  const openEditDialog = (budget) => {
    setSelectedBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (budget) => {
    setSelectedBudget(budget);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      category: 'Food',
      amount: '',
      period: 'Monthly'
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const getBudgetStatus = (budget) => {
    const percentage = (budget.spent / budget.amount) * 100;
    if (percentage >= 100) return { status: 'over', color: 'bg-rose-500', text: 'Over Budget!' };
    if (percentage >= 80) return { status: 'warning', color: 'bg-amber-500', text: 'Near Limit' };
    if (percentage >= 50) return { status: 'moderate', color: 'bg-indigo-500', text: 'On Track' };
    return { status: 'good', color: 'bg-emerald-500', text: 'Good' };
  };

  const availableCategories = EXPENSE_CATEGORIES.filter(
    cat => !budgets.some(b => b.category === cat)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-4">
            <PieChart className="text-indigo-500" />
            Budget Planner
          </h1>
          <p className="text-slate-600 mt-2">Set and track your spending limits</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowAddDialog(true); }} 
          disabled={availableCategories.length === 0}
          data-testid="add-budget-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </Button>
      </div>

      {/* Month Navigation */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-black text-slate-800">{getMonthName()}</h2>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-indigo-100/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-indigo-600">{formatCurrency(summary.total_budget)}</p>
              <p className="text-sm text-indigo-500 mt-1">{summary.budgets_count} categories</p>
            </CardContent>
          </Card>

          <Card className="border-rose-100 bg-gradient-to-br from-rose-50 to-rose-100/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-rose-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-rose-600">{formatCurrency(summary.total_spent)}</p>
              <p className="text-sm text-rose-500 mt-1">
                {summary.utilization_percentage.toFixed(0)}% of budget
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-black ${summary.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(summary.remaining)}
              </p>
              <p className="text-sm text-emerald-500 mt-1">Available to spend</p>
            </CardContent>
          </Card>

          <Card className={`border-amber-100 ${summary.over_budget_count > 0 ? 'bg-gradient-to-br from-rose-50 to-rose-100/50' : 'bg-gradient-to-br from-amber-50 to-amber-100/50'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-amber-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-black ${summary.over_budget_count > 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                {summary.over_budget_count}
              </p>
              <p className="text-sm text-amber-500 mt-1">
                {summary.over_budget_count > 0 ? 'Over budget!' : 'All good'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overall Progress */}
      {summary && summary.total_budget > 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700">Overall Budget Usage</h3>
              <span className="text-sm font-bold text-slate-500">
                {formatCurrency(summary.total_spent)} / {formatCurrency(summary.total_budget)}
              </span>
            </div>
            <Progress 
              value={Math.min(summary.utilization_percentage, 100)} 
              className="h-4"
            />
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>0%</span>
              <span className={summary.utilization_percentage > 80 ? 'text-rose-500 font-bold' : ''}>
                {summary.utilization_percentage.toFixed(1)}% used
              </span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-800">Category Budgets</h2>
        
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <PieChart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-semibold text-lg">No budgets set for {getMonthName()}</p>
              <p className="text-slate-500 text-sm mt-2">Create budgets to track your spending</p>
              <Button onClick={() => setShowAddDialog(true)} className="mt-6">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map((budget) => {
              const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
              const status = getBudgetStatus(budget);
              const remaining = budget.amount - budget.spent;
              
              return (
                <Card 
                  key={budget.id} 
                  className={`group hover:shadow-xl transition-all duration-300 border-l-4`}
                  style={{ borderLeftColor: CATEGORY_COLORS[budget.category] || '#6366f1' }}
                  data-testid="budget-card"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-black text-slate-800">{budget.category}</h3>
                          <Badge 
                            className={`${status.color} text-white font-bold`}
                          >
                            {status.text}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">{budget.period}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(budget)}
                          data-testid="edit-budget-btn"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(budget)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          data-testid="delete-budget-btn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">Spent</p>
                          <p className={`text-2xl font-black ${percentage > 100 ? 'text-rose-600' : 'text-slate-800'}`}>
                            {formatCurrency(budget.spent)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 uppercase font-bold">Budget</p>
                          <p className="text-2xl font-black text-slate-400">
                            {formatCurrency(budget.amount)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className="h-3"
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-xs font-bold text-slate-500">
                            {percentage.toFixed(0)}% used
                          </span>
                          <span className={`text-xs font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Budget Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Create Budget</DialogTitle>
            <DialogDescription>
              Set a spending limit for a category
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger data-testid="budget-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                        />
                        {cat}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableCategories.length === 0 && (
                <p className="text-xs text-amber-600">All categories have budgets set</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Budget Amount (Rp)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g., 2000000"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                data-testid="budget-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddBudget} data-testid="save-budget-btn">Create Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Budget Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Edit Budget</DialogTitle>
            <DialogDescription>
              Update budget for {selectedBudget?.category}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Budget Amount (Rp)</Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="e.g., 2000000"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditBudget}>Update Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the budget for {selectedBudget?.category}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBudget} className="bg-rose-600 hover:bg-rose-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default BudgetPlanner;
