import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Target, 
  TrendingUp, 
  Calendar,
  Trophy,
  Trash2,
  Edit,
  PiggyBank,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  Shield,
  Sparkles,
  Clock
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

const GOAL_CATEGORIES = [
  { value: 'Emergency Fund', label: 'Dana Darurat', icon: Shield, color: '#ef4444' },
  { value: 'House', label: 'Rumah / DP Rumah', icon: Home, color: '#f97316' },
  { value: 'Car', label: 'Mobil / Kendaraan', icon: Car, color: '#eab308' },
  { value: 'Vacation', label: 'Liburan', icon: Plane, color: '#22c55e' },
  { value: 'Education', label: 'Pendidikan', icon: GraduationCap, color: '#06b6d4' },
  { value: 'Wedding', label: 'Pernikahan', icon: Heart, color: '#ec4899' },
  { value: 'Retirement', label: 'Pensiun', icon: PiggyBank, color: '#8b5cf6' },
  { value: 'Other', label: 'Lainnya', icon: Target, color: '#6366f1' },
];

function FinancialGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showContributeDialog, setShowContributeDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    target_date: '',
    category: 'Emergency Fund',
    notes: '',
    color: '#6366f1'
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API}/goals`);
      setGoals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!formData.name || !formData.target_amount || !formData.target_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const categoryInfo = GOAL_CATEGORIES.find(c => c.value === formData.category);
      await axios.post(`${API}/goals`, {
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0,
        color: categoryInfo?.color || '#6366f1'
      });
      toast.success('Goal created successfully!');
      setShowAddDialog(false);
      resetForm();
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    }
  };

  const handleEditGoal = async () => {
    try {
      await axios.put(`${API}/goals/${selectedGoal.id}`, {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        target_date: formData.target_date,
        category: formData.category,
        notes: formData.notes
      });
      toast.success('Goal updated successfully!');
      setShowEditDialog(false);
      resetForm();
      setSelectedGoal(null);
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  const handleDeleteGoal = async () => {
    try {
      await axios.delete(`${API}/goals/${selectedGoal.id}`);
      toast.success('Goal deleted successfully!');
      setShowDeleteDialog(false);
      setSelectedGoal(null);
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const handleContribute = async () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await axios.post(`${API}/goals/${selectedGoal.id}/contribute`, {
        goal_id: selectedGoal.id,
        amount: parseFloat(contributionAmount)
      });
      
      const newAmount = selectedGoal.current_amount + parseFloat(contributionAmount);
      if (newAmount >= selectedGoal.target_amount) {
        toast.success('🎉 Congratulations! Goal achieved!', {
          description: `You've reached your ${selectedGoal.name} goal!`
        });
      } else {
        toast.success('Contribution added successfully!');
      }
      
      setShowContributeDialog(false);
      setContributionAmount('');
      setSelectedGoal(null);
      fetchGoals();
    } catch (error) {
      console.error('Error adding contribution:', error);
      toast.error('Failed to add contribution');
    }
  };

  const openEditDialog = (goal) => {
    setSelectedGoal(goal);
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      target_date: goal.target_date ? new Date(goal.target_date).toISOString().split('T')[0] : '',
      category: goal.category,
      notes: goal.notes || '',
      color: goal.color || '#6366f1'
    });
    setShowEditDialog(true);
  };

  const openContributeDialog = (goal) => {
    setSelectedGoal(goal);
    setContributionAmount('');
    setShowContributeDialog(true);
  };

  const openDeleteDialog = (goal) => {
    setSelectedGoal(goal);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      target_amount: '',
      current_amount: '0',
      target_date: '',
      category: 'Emergency Fund',
      notes: '',
      color: '#6366f1'
    });
  };

  const calculateDaysRemaining = (targetDate) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const calculateMonthlyNeeded = (goal) => {
    const remaining = goal.target_amount - goal.current_amount;
    const daysLeft = calculateDaysRemaining(goal.target_date);
    const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
    return remaining / monthsLeft;
  };

  const getCategoryInfo = (category) => {
    return GOAL_CATEGORIES.find(c => c.value === category) || GOAL_CATEGORIES[7];
  };

  const totalTargetAmount = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalCurrentAmount = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const achievedGoals = goals.filter(g => g.is_achieved).length;

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
            <Target className="text-emerald-500" />
            Financial Goals
          </h1>
          <p className="text-slate-600 mt-2">Track your savings goals and achieve financial freedom</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }} data-testid="add-goal-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-indigo-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-indigo-700 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Total Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-indigo-600">{formatCurrency(totalTargetAmount)}</p>
            <p className="text-sm text-indigo-500 mt-1">{goals.length} goals</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-emerald-700 flex items-center gap-2">
              <PiggyBank className="w-4 h-4" />
              Total Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-emerald-600">{formatCurrency(totalCurrentAmount)}</p>
            <p className="text-sm text-emerald-500 mt-1">
              {totalTargetAmount > 0 ? ((totalCurrentAmount / totalTargetAmount) * 100).toFixed(0) : 0}% of target
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-amber-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-amber-600">{formatCurrency(totalTargetAmount - totalCurrentAmount)}</p>
            <p className="text-sm text-amber-500 mt-1">Left to save</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-purple-700 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Achieved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-purple-600">{achievedGoals}</p>
            <p className="text-sm text-purple-500 mt-1">of {goals.length} goals</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-800">Your Goals</h2>
        
        {goals.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-semibold text-lg">No goals yet</p>
              <p className="text-slate-500 text-sm mt-2">Start by creating your first financial goal</p>
              <Button onClick={() => setShowAddDialog(true)} className="mt-6">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const categoryInfo = getCategoryInfo(goal.category);
              const Icon = categoryInfo.icon;
              const percentage = (goal.current_amount / goal.target_amount) * 100;
              const daysRemaining = calculateDaysRemaining(goal.target_date);
              const monthlyNeeded = calculateMonthlyNeeded(goal);
              const remaining = goal.target_amount - goal.current_amount;
              
              return (
                <Card 
                  key={goal.id} 
                  className={`group hover:shadow-xl transition-all duration-300 overflow-hidden ${goal.is_achieved ? 'ring-2 ring-emerald-500' : ''}`}
                  data-testid="goal-card"
                >
                  {/* Header with color */}
                  <div 
                    className="h-2" 
                    style={{ backgroundColor: categoryInfo.color }}
                  />
                  
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                          style={{ backgroundColor: categoryInfo.color }}
                        >
                          <Icon className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-black text-slate-800">{goal.name}</h3>
                            {goal.is_achieved && (
                              <Badge className="bg-emerald-100 text-emerald-700 font-bold">
                                <Trophy className="w-3 h-3 mr-1" />
                                Achieved!
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">{categoryInfo.label}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(goal)}
                          data-testid="edit-goal-btn"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(goal)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          data-testid="delete-goal-btn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">Saved</p>
                          <p className="text-2xl font-black text-emerald-600">
                            {formatCurrency(goal.current_amount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 uppercase font-bold">Target</p>
                          <p className="text-2xl font-black text-slate-400">
                            {formatCurrency(goal.target_amount)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <Progress value={Math.min(percentage, 100)} className="h-4" />
                        <div className="flex justify-between mt-2">
                          <span className="text-sm font-bold text-slate-500">
                            {percentage.toFixed(1)}% complete
                          </span>
                          <span className="text-sm font-bold text-slate-500">
                            {formatCurrency(remaining)} left
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Target Date</p>
                            <p className="text-sm font-bold text-slate-700">
                              {new Date(goal.target_date).toLocaleDateString('id-ID', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Time Left</p>
                            <p className={`text-sm font-bold ${daysRemaining < 30 ? 'text-rose-600' : 'text-slate-700'}`}>
                              {daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Monthly Needed */}
                      {!goal.is_achieved && remaining > 0 && daysRemaining > 0 && (
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-500 font-bold">Monthly savings needed</p>
                              <p className="text-lg font-black text-indigo-600">
                                {formatCurrency(monthlyNeeded)}
                              </p>
                            </div>
                            <Sparkles className="w-6 h-6 text-indigo-400" />
                          </div>
                        </div>
                      )}

                      {/* Add Contribution Button */}
                      {!goal.is_achieved && (
                        <Button 
                          onClick={() => openContributeDialog(goal)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                          data-testid="contribute-btn"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Savings
                        </Button>
                      )}

                      {goal.notes && (
                        <p className="text-sm text-slate-500 italic pt-2 border-t border-slate-100">
                          {goal.notes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Create Financial Goal</DialogTitle>
            <DialogDescription>
              Set a savings target and track your progress
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goal-name">Goal Name *</Label>
              <Input
                id="goal-name"
                placeholder="e.g., Emergency Fund 6 Months"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="goal-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger data-testid="goal-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" style={{ color: cat.color }} />
                          {cat.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target-amount">Target Amount (Rp) *</Label>
                <Input
                  id="target-amount"
                  type="number"
                  placeholder="e.g., 50000000"
                  value={formData.target_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
                  data-testid="goal-target"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current-amount">Current Savings (Rp)</Label>
                <Input
                  id="current-amount"
                  type="number"
                  placeholder="0"
                  value={formData.current_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_amount: e.target.value }))}
                  data-testid="goal-current"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-date">Target Date *</Label>
              <Input
                id="target-date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                data-testid="goal-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Why is this goal important to you?"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddGoal} data-testid="save-goal-btn">Create Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Edit Goal</DialogTitle>
            <DialogDescription>
              Update your goal details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-goal-name">Goal Name</Label>
              <Input
                id="edit-goal-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-target">Target Amount (Rp)</Label>
              <Input
                id="edit-target"
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Target Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditGoal}>Update Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contribute Dialog */}
      <Dialog open={showContributeDialog} onOpenChange={setShowContributeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Add Savings</DialogTitle>
            <DialogDescription>
              Add a contribution to "{selectedGoal?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedGoal && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-500">Current Progress</span>
                  <span className="text-sm font-bold text-slate-700">
                    {((selectedGoal.current_amount / selectedGoal.target_amount) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(selectedGoal.current_amount / selectedGoal.target_amount) * 100} 
                  className="h-2 mb-2"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 font-bold">
                    {formatCurrency(selectedGoal.current_amount)}
                  </span>
                  <span className="text-slate-400">
                    of {formatCurrency(selectedGoal.target_amount)}
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="contribution">Amount to Add (Rp)</Label>
              <Input
                id="contribution"
                type="number"
                placeholder="e.g., 1000000"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                data-testid="contribution-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContributeDialog(false)}>Cancel</Button>
            <Button onClick={handleContribute} className="bg-emerald-600 hover:bg-emerald-700" data-testid="submit-contribution-btn">
              Add Savings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedGoal?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGoal} className="bg-rose-600 hover:bg-rose-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default FinancialGoals;
