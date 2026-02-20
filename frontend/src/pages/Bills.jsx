import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, Receipt, Trash2, CalendarCheck, Check, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

function Bills() {
  const [bills, setBills] = useState([]);
  const [billPayments, setBillPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    due_date: '01',
    period: 'Monthly',
    category: 'Bills'
  });

  // Get current month-year for tracking payments
  const currentMonthYear = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    fetchBills();
    fetchBillPayments();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get(`${API}/bills`);
      setBills(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setLoading(false);
    }
  };

  const fetchBillPayments = async () => {
    try {
      const response = await axios.get(`${API}/bill-payments?month_year=${currentMonthYear}`);
      setBillPayments(response.data);
    } catch (error) {
      console.error('Error fetching bill payments:', error);
    }
  };

  const handleAddBill = async () => {
    try {
      await axios.post(`${API}/bills`, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Bill added successfully!');
      setShowAddDialog(false);
      resetForm();
      fetchBills();
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('Failed to add bill');
    }
  };

  const handleDeleteBill = async () => {
    try {
      await axios.delete(`${API}/bills/${selectedBill.id}`);
      toast.success('Bill deleted successfully!');
      setShowDeleteDialog(false);
      setSelectedBill(null);
      fetchBills();
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast.error('Failed to delete bill');
    }
  };

  const handleMarkAsPaid = async (bill) => {
    try {
      await axios.post(`${API}/bill-payments`, {
        bill_id: bill.id,
        bill_name: bill.name,
        amount: bill.amount,
        due_date: bill.due_date,
        month_year: currentMonthYear,
        notes: `Paid for ${getMonthName(currentMonthYear)}`
      });
      
      toast.success(`Bill "${bill.name}" marked as paid!`, {
        description: 'A transaction has been automatically created'
      });
      
      fetchBillPayments();
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      toast.error('Failed to mark bill as paid');
    }
  };

  const isBillPaidThisMonth = (billId) => {
    return billPayments.some(payment => payment.bill_id === billId);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      due_date: '01',
      period: 'Monthly',
      category: 'Bills'
    });
  };

  const openDeleteDialog = (bill) => {
    setSelectedBill(bill);
    setShowDeleteDialog(true);
  };

  const getMonthName = (monthYear) => {
    const date = new Date(monthYear + '-01');
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const totalMonthlyBills = bills
    .filter(bill => bill.period === 'Monthly')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const paidBillsCount = bills.filter(bill => isBillPaidThisMonth(bill.id)).length;
  const unpaidBillsCount = bills.length - paidBillsCount;

  const getDueDateStatus = (dueDate) => {
    const today = new Date().getDate();
    const due = parseInt(dueDate);
    
    if (today > due) return 'overdue';
    if (due - today <= 3) return 'soon';
    return 'upcoming';
  };

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
            <CalendarCheck className="text-rose-500" />
            Recurring Bills & Subscriptions
          </h1>
          <p className="text-slate-600 mt-2">Manage your monthly bills and subscriptions - {getMonthName(currentMonthYear)}</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }} data-testid="add-bill-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Bill
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-rose-100 bg-gradient-to-br from-rose-50 to-rose-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-rose-700">Total Monthly Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-rose-600">{formatCurrency(totalMonthlyBills)}</p>
            <p className="text-sm text-rose-500 mt-1">{bills.length} active bill{bills.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-emerald-700 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Paid This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-emerald-600">{paidBillsCount}</p>
            <p className="text-sm text-emerald-500 mt-1">of {bills.length} bills</p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-amber-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Unpaid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-amber-600">{unpaidBillsCount}</p>
            <p className="text-sm text-amber-500 mt-1">bills remaining</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-indigo-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-indigo-700">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-indigo-600">
              {bills.length > 0 ? Math.round((paidBillsCount / bills.length) * 100) : 0}%
            </p>
            <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${bills.length > 0 ? (paidBillsCount / bills.length) * 100 : 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bills Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-800">Your Bills</h2>
        
        {bills.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-semibold">No bills yet. Add your first recurring bill!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bills.map((bill) => {
              const isPaid = isBillPaidThisMonth(bill.id);
              const status = getDueDateStatus(bill.due_date);
              
              return (
                <Card 
                  key={bill.id} 
                  className={`group hover:shadow-2xl transition-all duration-500 cursor-pointer border-l-4 ${
                    isPaid 
                      ? 'border-l-emerald-500 bg-emerald-50/30' 
                      : status === 'overdue' 
                        ? 'border-l-rose-500 bg-rose-50/30'
                        : status === 'soon'
                          ? 'border-l-amber-500 bg-amber-50/30'
                          : 'border-l-slate-300'
                  }`}
                  data-testid="bill-card"
                >
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-5 flex-1">
                        {/* Checkbox */}
                        <div className="pt-1">
                          <Checkbox
                            checked={isPaid}
                            onCheckedChange={() => !isPaid && handleMarkAsPaid(bill)}
                            disabled={isPaid}
                            className={`h-6 w-6 ${isPaid ? 'border-emerald-500 bg-emerald-500' : ''}`}
                            data-testid="bill-checkbox"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className={`font-black text-lg ${isPaid ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                              {bill.name}
                            </p>
                            {isPaid && (
                              <Badge className="bg-emerald-100 text-emerald-700 font-bold">
                                <Check className="w-3 h-3 mr-1" />
                                Paid
                              </Badge>
                            )}
                            {!isPaid && status === 'overdue' && (
                              <Badge variant="destructive" className="font-bold">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Overdue
                              </Badge>
                            )}
                            {!isPaid && status === 'soon' && (
                              <Badge className="bg-amber-100 text-amber-700 font-bold">
                                <Clock className="w-3 h-3 mr-1" />
                                Due Soon
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-bold">
                            Due every {bill.due_date}{getOrdinalSuffix(bill.due_date)} • {bill.period}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="text-right">
                          <p className={`font-black text-xl ${isPaid ? 'text-slate-400' : 'text-slate-900'}`}>
                            {formatCurrency(bill.amount)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(bill)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid="delete-bill-btn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {!isPaid && (
                      <div className="mt-6 pt-4 border-t border-slate-200">
                        <Button 
                          onClick={() => handleMarkAsPaid(bill)} 
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                          data-testid="mark-paid-btn"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Mark as Paid & Create Transaction
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment History This Month */}
      {billPayments.length > 0 && (
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-500" />
              Payment History - {getMonthName(currentMonthYear)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billPayments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800">{payment.bill_name}</p>
                    <p className="text-xs text-slate-500">
                      Paid on {new Date(payment.payment_date).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <p className="font-black text-emerald-600">{formatCurrency(payment.amount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Bill Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Add Recurring Bill</DialogTitle>
            <DialogDescription>
              Set up a new monthly bill or subscription
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bill-name">Bill Name *</Label>
              <Input
                id="bill-name"
                placeholder="e.g., Netflix, Internet, Electricity"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="bill-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-amount">Amount (Rp) *</Label>
              <Input
                id="bill-amount"
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                data-testid="bill-amount"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bill-due-date">Due Date *</Label>
                <Select value={formData.due_date} onValueChange={(value) => setFormData(prev => ({ ...prev, due_date: value }))}>
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
                <Label htmlFor="bill-period">Period *</Label>
                <Select value={formData.period} onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddBill} data-testid="save-bill-btn">Save Bill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this recurring bill.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBill} className="bg-rose-600 hover:bg-rose-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function getOrdinalSuffix(day) {
  const num = parseInt(day);
  if (num >= 11 && num <= 13) return 'th';
  switch (num % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export default Bills;
