import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  RefreshCw, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  Edit,
  Play,
  Calendar,
  Repeat
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

const INCOME_CATEGORIES = ['Salary', 'Business', 'Investment', 'Freelance', 'Dividend', 'Interest', 'Other Income'];
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Subscription', 'Debt Payment', 'Other Expense'];

function RecurringTransactions() {
  const [recurring, setRecurring] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'expense',
    category: 'Bills',
    account: '',
    frequency: 'Monthly',
    day_of_month: 1,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recurringRes, accountsRes] = await Promise.all([
        axios.get(`${API}/recurring-transactions`),
        axios.get(`${API}/accounts`)
      ]);
      setRecurring(recurringRes.data);
      setAccounts(accountsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.amount || !formData.account) {
      toast.error('Mohon lengkapi semua field');
      return;
    }

    try {
      await axios.post(`${API}/recurring-transactions`, {
        ...formData,
        amount: parseFloat(formData.amount),
        day_of_month: parseInt(formData.day_of_month)
      });
      toast.success('Recurring transaction added!');
      setShowAddDialog(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error adding:', error);
      toast.error('Gagal menambahkan');
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(`${API}/recurring-transactions/${selectedItem.id}`, {
        ...formData,
        amount: parseFloat(formData.amount),
        day_of_month: parseInt(formData.day_of_month)
      });
      toast.success('Updated successfully!');
      setShowEditDialog(false);
      setSelectedItem(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error updating:', error);
      toast.error('Gagal mengupdate');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/recurring-transactions/${selectedItem.id}`);
      toast.success('Deleted successfully!');
      setShowDeleteDialog(false);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Gagal menghapus');
    }
  };

  const handleGenerate = async (item) => {
    try {
      await axios.post(`${API}/recurring-transactions/${item.id}/generate`);
      toast.success(`Transaksi "${item.name}" berhasil dibuat!`);
      fetchData();
    } catch (error) {
      console.error('Error generating:', error);
      toast.error('Gagal membuat transaksi');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await axios.put(`${API}/recurring-transactions/${item.id}`, {
        is_active: !item.is_active
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling:', error);
    }
  };

  const openEditDialog = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      amount: item.amount.toString(),
      type: item.type,
      category: item.category,
      account: item.account,
      frequency: item.frequency,
      day_of_month: item.day_of_month,
      notes: item.notes || ''
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (item) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      type: 'expense',
      category: 'Bills',
      account: accounts[0]?.name || '',
      frequency: 'Monthly',
      day_of_month: 1,
      notes: ''
    });
  };

  const totalMonthlyIncome = recurring
    .filter(r => r.type === 'income' && r.is_active)
    .reduce((sum, r) => sum + r.amount, 0);

  const totalMonthlyExpense = recurring
    .filter(r => r.type === 'expense' && r.is_active)
    .reduce((sum, r) => sum + r.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Repeat className="text-indigo-500" />
            Recurring Transactions
          </h1>
          <p className="text-slate-500 text-sm">Kelola transaksi berulang (gaji, tagihan bulanan)</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }} data-testid="add-recurring-btn">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Recurring
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Pemasukan Bulanan</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalMonthlyIncome)}</p>
            <p className="text-xs text-emerald-500 mt-1">
              {recurring.filter(r => r.type === 'income' && r.is_active).length} transaksi aktif
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-rose-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowUpRight className="w-5 h-5 text-rose-600" />
              <span className="text-sm font-medium text-rose-700">Pengeluaran Bulanan</span>
            </div>
            <p className="text-2xl font-bold text-rose-600">{formatCurrency(totalMonthlyExpense)}</p>
            <p className="text-xs text-rose-500 mt-1">
              {recurring.filter(r => r.type === 'expense' && r.is_active).length} transaksi aktif
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">Net Recurring</span>
            </div>
            <p className={`text-2xl font-bold ${totalMonthlyIncome - totalMonthlyExpense >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(totalMonthlyIncome - totalMonthlyExpense)}
            </p>
            <p className="text-xs text-indigo-500 mt-1">per bulan</p>
          </CardContent>
        </Card>
      </div>

      {/* Recurring List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-700">Daftar Transaksi Berulang</CardTitle>
        </CardHeader>
        <CardContent>
          {recurring.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Repeat className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Belum ada recurring transactions</p>
              <p className="text-sm">Tambahkan gaji bulanan, tagihan, atau subscription</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recurring.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    item.is_active ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {item.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.account}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Tanggal {item.day_of_month}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold ${item.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {item.frequency}
                      </Badge>
                    </div>

                    <Switch
                      checked={item.is_active}
                      onCheckedChange={() => handleToggleActive(item)}
                    />

                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleGenerate(item)}
                        title="Generate transaksi sekarang"
                        className="h-8 w-8 text-indigo-600 hover:text-indigo-700"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditDialog(item)}
                        className="h-8 w-8"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDeleteDialog(item)}
                        className="h-8 w-8 text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Recurring Transaction</DialogTitle>
            <DialogDescription>
              Buat transaksi yang berulang setiap bulan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                placeholder="e.g., Gaji Bulanan, Tagihan Listrik"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jumlah (Rp)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData({...formData, type: v, category: v === 'income' ? 'Salary' : 'Bills'})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Pemasukan</SelectItem>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Akun</Label>
                <Select value={formData.account} onValueChange={(v) => setFormData({...formData, account: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih akun" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tanggal (setiap bulan)</Label>
              <Select value={formData.day_of_month.toString()} onValueChange={(v) => setFormData({...formData, day_of_month: parseInt(v)})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={day.toString()}>Tanggal {day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Batal</Button>
            <Button onClick={handleAdd}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Recurring Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jumlah (Rp)</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Select value={formData.day_of_month.toString()} onValueChange={(v) => setFormData({...formData, day_of_month: parseInt(v)})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>Tanggal {day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Batal</Button>
            <Button onClick={handleEdit}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Recurring Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus "{selectedItem?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default RecurringTransactions;
