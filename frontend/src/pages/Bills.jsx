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
import { Plus, Receipt, Trash2, CalendarCheck } from 'lucide-react';
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

  useEffect(() => {
    fetchBills();
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

  const totalMonthlyBills = bills
    .filter(bill => bill.period === 'Monthly')
    .reduce((sum, bill) => sum + bill.amount, 0);

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
          <p className="text-slate-600 mt-2">Manage your monthly bills and subscriptions</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }} data-testid="add-bill-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Bill
        </Button>
      </div>

      {/* Total Monthly Bills */}
      <Card className="border-rose-100 bg-rose-50/50">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-rose-700">Total Monthly Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-black text-rose-600">{formatCurrency(totalMonthlyBills)}</p>
          <p className="text-sm text-rose-500 mt-1">{bills.length} active bill{bills.length !== 1 ? 's' : ''}</p>
        </CardContent>
      </Card>

      {/* Bills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {bills.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-20 text-center">
              <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-semibold">No bills yet. Add your first recurring bill!</p>
            </CardContent>
          </Card>
        ) : (
          bills.map((bill) => (
            <Card 
              key={bill.id} 
              className="group hover:shadow-2xl hover:shadow-rose-100 transition-all duration-500 cursor-pointer border-slate-100"
              data-testid="bill-card"
            >
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5 flex-1">
                    <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-rose-500 shadow-sm">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-lg">{bill.name}</p>
                      <p className="text-xs text-slate-400 font-bold mt-1">
                        Due every {bill.due_date}{getOrdinalSuffix(bill.due_date)}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold mt-1">{bill.period}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right">
                      <p className="font-black text-slate-900 text-xl">{formatCurrency(bill.amount)}</p>
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
              </CardContent>
            </Card>
          ))
        )}
      </div>

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