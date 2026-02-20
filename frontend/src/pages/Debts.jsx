import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, CreditCard, Edit, Trash2, AlertCircle, Calculator, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const DEBT_TYPES = [
  'Credit Card',
  'Mortgage',
  'Car Loan',
  'Personal Loan',
  'Student Loan',
  'Installment',
  'Other'
];

function Debts() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCalculatorDialog, setShowCalculatorDialog] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [ratios, setRatios] = useState(null);
  
  const [formData, setFormData] = useState({
    debt_type: 'Personal Loan',
    creditor: '',
    principal_amount: '',
    current_balance: '',
    interest_rate: '',
    monthly_payment: '',
    remaining_installments: '',
    due_date: '01',
    start_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [calcData, setCalcData] = useState({
    principal: '',
    interestRate: '',
    months: '',
    monthlyPayment: 0,
    totalInterest: 0,
    totalPayment: 0
  });

  useEffect(() => {
    fetchDebts();
    fetchRatios();
  }, []);

  const fetchDebts = async () => {
    try {
      const response = await axios.get(`${API}/debts`);
      setDebts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching debts:', error);
      setLoading(false);
    }
  };

  const fetchRatios = async () => {
    try {
      const response = await axios.get(`${API}/analytics/ratios`);
      setRatios(response.data);
    } catch (error) {
      console.error('Error fetching ratios:', error);
    }
  };

  const handleAddDebt = async () => {
    try {
      await axios.post(`${API}/debts`, {
        ...formData,
        principal_amount: parseFloat(formData.principal_amount),
        current_balance: parseFloat(formData.current_balance),
        interest_rate: parseFloat(formData.interest_rate),
        monthly_payment: parseFloat(formData.monthly_payment),
        remaining_installments: parseInt(formData.remaining_installments)
      });
      toast.success('Debt added successfully!');
      setShowAddDialog(false);
      resetForm();
      fetchDebts();
      fetchRatios();
    } catch (error) {
      console.error('Error adding debt:', error);
      toast.error('Failed to add debt');
    }
  };

  const handleEditDebt = async () => {
    try {
      await axios.put(`${API}/debts/${selectedDebt.id}`, {
        ...formData,
        principal_amount: parseFloat(formData.principal_amount),
        current_balance: parseFloat(formData.current_balance),
        interest_rate: parseFloat(formData.interest_rate),
        monthly_payment: parseFloat(formData.monthly_payment),
        remaining_installments: parseInt(formData.remaining_installments)
      });
      toast.success('Debt updated successfully!');
      setShowEditDialog(false);
      resetForm();
      setSelectedDebt(null);
      fetchDebts();
      fetchRatios();
    } catch (error) {
      console.error('Error updating debt:', error);
      toast.error('Failed to update debt');
    }
  };

  const handleDeleteDebt = async () => {
    try {
      await axios.delete(`${API}/debts/${selectedDebt.id}`);
      toast.success('Debt deleted successfully!');
      setShowDeleteDialog(false);
      setSelectedDebt(null);
      fetchDebts();
      fetchRatios();
    } catch (error) {
      console.error('Error deleting debt:', error);
      toast.error('Failed to delete debt');
    }
  };

  const openEditDialog = (debt) => {
    setSelectedDebt(debt);
    setFormData({
      debt_type: debt.debt_type,
      creditor: debt.creditor,
      principal_amount: debt.principal_amount.toString(),
      current_balance: debt.current_balance.toString(),
      interest_rate: debt.interest_rate.toString(),
      monthly_payment: debt.monthly_payment.toString(),
      remaining_installments: debt.remaining_installments.toString(),
      due_date: debt.due_date,
      start_date: debt.start_date ? new Date(debt.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: debt.notes || ''
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (debt) => {
    setSelectedDebt(debt);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      debt_type: 'Personal Loan',
      creditor: '',
      principal_amount: '',
      current_balance: '',
      interest_rate: '',
      monthly_payment: '',
      remaining_installments: '',
      due_date: '01',
      start_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const calculateLoan = () => {
    const P = parseFloat(calcData.principal);
    const r = parseFloat(calcData.interestRate) / 100 / 12;
    const n = parseInt(calcData.months);

    if (P && r && n) {
      const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = M * n;
      const totalInterest = totalPayment - P;

      setCalcData(prev => ({
        ...prev,
        monthlyPayment: M,
        totalPayment: totalPayment,
        totalInterest: totalInterest
      }));
    }
  };

  const totalDebt = debts.reduce((sum, debt) => sum + debt.current_balance, 0);
  const totalMonthlyPayment = debts.reduce((sum, debt) => sum + debt.monthly_payment, 0);
  const activeDebts = debts.filter(d => d.is_active);
  const avgInterestRate = debts.length > 0 
    ? debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length 
    : 0;
  const totalPaid = debts.reduce((sum, debt) => sum + (debt.principal_amount - debt.current_balance), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-4">
            <CreditCard className="text-rose-500" />
            Liabilities Management
          </h1>
          <p className="text-slate-600 mt-2">Track, manage, and optimize your debt portfolio</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowCalculatorDialog(true)} 
            variant="outline"
            className="font-bold"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Loan Calculator
          </Button>
          <Button onClick={() => { resetForm(); setShowAddDialog(true); }} data-testid="add-debt-btn">
            <Plus className="w-4 h-4 mr-2" />
            Add Debt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-rose-100 bg-gradient-to-br from-rose-50 to-rose-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-rose-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Debt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-rose-600">{formatCurrency(totalDebt)}</p>
            <p className="text-sm text-rose-500 mt-2 font-semibold">{activeDebts.length} active debts</p>
          </CardContent>
        </Card>

        <Card className="border-orange-100 bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-orange-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Monthly Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-orange-600">{formatCurrency(totalMonthlyPayment)}</p>
            <p className="text-sm text-orange-500 mt-2 font-semibold">Total obligation</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-emerald-700 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-emerald-600">{formatCurrency(totalPaid)}</p>
            <p className="text-sm text-emerald-500 mt-2 font-semibold">Progress made</p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-amber-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Debt-to-Asset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-amber-600">
              {ratios ? `${ratios.debt_to_asset_ratio}%` : '0%'}
            </p>
            <p className="text-sm text-amber-500 mt-2 font-semibold">
              {ratios && ratios.debt_to_asset_ratio < 30 ? 'Healthy' : ratios && ratios.debt_to_asset_ratio < 50 ? 'Moderate' : 'High'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/50">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Avg Interest Rate</p>
              <p className="text-4xl font-black text-slate-800">{avgInterestRate.toFixed(2)}%</p>
            </div>
            <div className="text-center border-x border-slate-200">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Principal</p>
              <p className="text-4xl font-black text-slate-800">
                {formatCurrency(debts.reduce((sum, d) => sum + d.principal_amount, 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Remaining Months</p>
              <p className="text-4xl font-black text-slate-800">
                {debts.length > 0 ? Math.max(...debts.map(d => d.remaining_installments)) : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-800">Your Debts</h2>
        
        {debts.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-semibold text-lg">No debts yet. You are debt-free! 🎉</p>
              <p className="text-slate-500 text-sm mt-2">Click Add Debt to start tracking your liabilities</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {debts.map((debt) => {
              const progressPercentage = ((debt.principal_amount - debt.current_balance) / debt.principal_amount) * 100;
              const monthsElapsed = Math.ceil((debt.principal_amount - debt.current_balance) / debt.monthly_payment);
              
              return (
                <Card key={debt.id} className="group hover:shadow-2xl transition-all duration-300 border-l-4 border-l-rose-500" data-testid="debt-card">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="destructive" className="font-bold text-sm px-3 py-1">
                            {debt.debt_type}
                          </Badge>
                          {debt.is_active ? (
                            <Badge variant="outline" className="font-semibold border-emerald-500 text-emerald-600">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="font-semibold">Paid Off</Badge>
                          )}
                          <Badge variant="outline" className="font-semibold">
                            {debt.interest_rate}% APR
                          </Badge>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-1">{debt.creditor}</h3>
                        <p className="text-sm text-slate-500 font-semibold">
                          Due date: Every {debt.due_date} of the month
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(debt)}
                          className="hover:bg-indigo-50 hover:text-indigo-600"
                          data-testid="edit-debt-btn"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(debt)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          data-testid="delete-debt-btn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Principal</p>
                        <p className="text-lg font-black text-slate-800">{formatCurrency(debt.principal_amount)}</p>
                      </div>
                      <div className="bg-rose-50 p-4 rounded-2xl">
                        <p className="text-xs text-rose-600 font-bold uppercase mb-1">Current Balance</p>
                        <p className="text-lg font-black text-rose-600">{formatCurrency(debt.current_balance)}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Monthly Payment</p>
                        <p className="text-lg font-black text-slate-800">{formatCurrency(debt.monthly_payment)}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Remaining</p>
                        <p className="text-lg font-black text-slate-800">{debt.remaining_installments} months</p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-2xl">
                        <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Total Paid</p>
                        <p className="text-lg font-black text-emerald-600">
                          {formatCurrency(debt.principal_amount - debt.current_balance)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-600 font-bold">Payment Progress</p>
                        <div className="text-right">
                          <p className="text-sm text-slate-800 font-bold">{progressPercentage.toFixed(1)}% completed</p>
                          <p className="text-xs text-slate-500">{monthsElapsed} of {monthsElapsed + debt.remaining_installments} months</p>
                        </div>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                      
                      <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                        <span>Started: {new Date(debt.start_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                        <span>Est. Completion: {new Date(new Date().setMonth(new Date().getMonth() + debt.remaining_installments)).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {debt.notes && (
                      <div className="mt-6 p-4 bg-slate-50 rounded-xl border-l-4 border-l-slate-300">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Notes</p>
                        <p className="text-sm text-slate-700 italic">{debt.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Add New Debt</DialogTitle>
            <DialogDescription>
              Track a new debt or liability to manage your finances better
            </DialogDescription>
          </DialogHeader>
          <DebtForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddDebt} data-testid="save-debt-btn">Save Debt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Edit Debt</DialogTitle>
            <DialogDescription>
              Update debt details and payment information
            </DialogDescription>
          </DialogHeader>
          <DebtForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditDebt}>Update Debt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this debt record from your financial tracking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDebt} className="bg-rose-600 hover:bg-rose-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showCalculatorDialog} onOpenChange={setShowCalculatorDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <Calculator className="w-6 h-6" />
              Loan Payment Calculator
            </DialogTitle>
            <DialogDescription>
              Calculate monthly payments and total interest for a loan
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Principal Amount (Rp)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={calcData.principal}
                  onChange={(e) => setCalcData(prev => ({ ...prev, principal: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Interest Rate (%/year)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={calcData.interestRate}
                  onChange={(e) => setCalcData(prev => ({ ...prev, interestRate: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Loan Period (months)</Label>
              <Input
                type="number"
                placeholder="0"
                value={calcData.months}
                onChange={(e) => setCalcData(prev => ({ ...prev, months: e.target.value }))}
              />
            </div>

            <Button onClick={calculateLoan} className="w-full" size="lg">
              Calculate Payment
            </Button>

            {calcData.monthlyPayment > 0 && (
              <div className="space-y-4 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-100">
                <h3 className="font-bold text-slate-700 text-lg mb-4">Calculation Results:</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                    <span className="font-semibold text-slate-600">Monthly Payment:</span>
                    <span className="text-2xl font-black text-indigo-600">
                      {formatCurrency(calcData.monthlyPayment)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                    <span className="font-semibold text-slate-600">Total Payment:</span>
                    <span className="text-xl font-black text-slate-800">
                      {formatCurrency(calcData.totalPayment)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                    <span className="font-semibold text-slate-600">Total Interest:</span>
                    <span className="text-xl font-black text-rose-600">
                      {formatCurrency(calcData.totalInterest)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DebtForm({ formData, setFormData }) {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid gap-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="debt-type">Debt Type *</Label>
          <Select value={formData.debt_type} onValueChange={(value) => handleChange('debt_type', value)}>
            <SelectTrigger data-testid="debt-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEBT_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="creditor">Creditor/Bank *</Label>
          <Input
            id="creditor"
            placeholder="e.g., BCA, Mandiri"
            value={formData.creditor}
            onChange={(e) => handleChange('creditor', e.target.value)}
            data-testid="debt-creditor"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="principal">Principal Amount (Rp) *</Label>
          <Input
            id="principal"
            type="number"
            placeholder="0"
            value={formData.principal_amount}
            onChange={(e) => handleChange('principal_amount', e.target.value)}
            data-testid="debt-principal"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="current-balance">Current Balance (Rp) *</Label>
          <Input
            id="current-balance"
            type="number"
            placeholder="0"
            value={formData.current_balance}
            onChange={(e) => handleChange('current_balance', e.target.value)}
            data-testid="debt-balance"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="interest-rate">Interest Rate (%) *</Label>
          <Input
            id="interest-rate"
            type="number"
            step="0.01"
            placeholder="0"
            value={formData.interest_rate}
            onChange={(e) => handleChange('interest_rate', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthly-payment">Monthly Payment (Rp) *</Label>
          <Input
            id="monthly-payment"
            type="number"
            placeholder="0"
            value={formData.monthly_payment}
            onChange={(e) => handleChange('monthly_payment', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="remaining">Remaining Installments *</Label>
          <Input
            id="remaining"
            type="number"
            placeholder="0"
            value={formData.remaining_installments}
            onChange={(e) => handleChange('remaining_installments', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="due-date">Due Date (Day of Month) *</Label>
          <Select value={formData.due_date} onValueChange={(value) => handleChange('due_date', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 28 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(day => (
                <SelectItem key={day} value={day}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Additional information about this debt..."
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}

export default Debts;
