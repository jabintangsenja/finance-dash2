import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, Trash2, Settings, Tag, ArrowDownLeft, ArrowUpRight, Edit } from 'lucide-react';
import { toast } from 'sonner';

// Default categories matching backend
const DEFAULT_INCOME_CATEGORIES = [
  'Salary', 'Business', 'Investment', 'Freelance', 'Dividend', 'Interest', 'Other Income'
];

const DEFAULT_EXPENSE_CATEGORIES = [
  'Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Subscription', 'Debt Payment', 'Other Expense'
];

function SettingsCategories() {
  const [incomeCategories, setIncomeCategories] = useState(() => {
    const saved = localStorage.getItem('financeOS_incomeCategories');
    return saved ? JSON.parse(saved) : DEFAULT_INCOME_CATEGORIES;
  });
  
  const [expenseCategories, setExpenseCategories] = useState(() => {
    const saved = localStorage.getItem('financeOS_expenseCategories');
    return saved ? JSON.parse(saved) : DEFAULT_EXPENSE_CATEGORIES;
  });

  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState('expense');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const saveCategories = () => {
    localStorage.setItem('financeOS_incomeCategories', JSON.stringify(incomeCategories));
    localStorage.setItem('financeOS_expenseCategories', JSON.stringify(expenseCategories));
  };

  useEffect(() => {
    saveCategories();
  }, [incomeCategories, expenseCategories]);

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    const targetCategories = categoryType === 'income' ? incomeCategories : expenseCategories;
    const exists = targetCategories.find(
      cat => cat.toLowerCase() === newCategory.trim().toLowerCase()
    );

    if (exists) {
      toast.error('Category already exists!');
      return;
    }

    if (categoryType === 'income') {
      setIncomeCategories(prev => [...prev, newCategory.trim()]);
    } else {
      setExpenseCategories(prev => [...prev, newCategory.trim()]);
    }

    toast.success(`Category "${newCategory.trim()}" added successfully!`);
    setNewCategory('');
  };

  const openDeleteDialog = (category, type) => {
    setCategoryToDelete({ name: category, type });
    setShowDeleteDialog(true);
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;

    if (categoryToDelete.type === 'income') {
      setIncomeCategories(prev => prev.filter(cat => cat !== categoryToDelete.name));
    } else {
      setExpenseCategories(prev => prev.filter(cat => cat !== categoryToDelete.name));
    }

    toast.success(`Category "${categoryToDelete.name}" deleted!`);
    setShowDeleteDialog(false);
    setCategoryToDelete(null);
  };

  const resetToDefault = () => {
    setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
    setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
    toast.success('Categories reset to default!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-4">
            <Tag className="text-emerald-500" />
            Manage Categories
          </h1>
          <p className="text-slate-600 mt-2">Customize your transaction categories</p>
        </div>
        <Button variant="outline" onClick={resetToDefault} data-testid="reset-categories-btn">
          Reset to Default
        </Button>
      </div>

      {/* Add New Category */}
      <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50">
        <CardHeader>
          <CardTitle className="text-xl font-black">Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="e.g., Groceries, Side Hustle"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                data-testid="new-category-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-type">Type</Label>
              <Select value={categoryType} onValueChange={setCategoryType}>
                <SelectTrigger id="category-type" data-testid="category-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                      Income
                    </div>
                  </SelectItem>
                  <SelectItem value="expense">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-rose-500" />
                      Expense
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddCategory} className="w-full" data-testid="add-category-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income Categories */}
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-3">
              <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
              Income Categories ({incomeCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incomeCategories.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-semibold">No income categories</p>
                </div>
              ) : (
                incomeCategories.map((category, index) => (
                  <div 
                    key={`income-${index}`} 
                    className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group"
                    data-testid="income-category-item"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="font-bold text-slate-800">{category}</span>
                      {DEFAULT_INCOME_CATEGORIES.includes(category) && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(category, 'income')}
                      className="opacity-0 group-hover:opacity-100 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all"
                      data-testid="delete-income-category-btn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="border-rose-100">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-3">
              <ArrowUpRight className="w-5 h-5 text-rose-500" />
              Expense Categories ({expenseCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenseCategories.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-semibold">No expense categories</p>
                </div>
              ) : (
                expenseCategories.map((category, index) => (
                  <div 
                    key={`expense-${index}`} 
                    className="flex items-center justify-between p-4 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors group"
                    data-testid="expense-category-item"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                      <span className="font-bold text-slate-800">{category}</span>
                      {DEFAULT_EXPENSE_CATEGORIES.includes(category) && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(category, 'expense')}
                      className="opacity-0 group-hover:opacity-100 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all"
                      data-testid="delete-expense-category-btn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This won't affect existing transactions with this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-rose-600 hover:bg-rose-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default SettingsCategories;
