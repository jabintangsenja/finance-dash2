import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  Edit,
  Calendar,
  Repeat,
  Check,
  Clock,
  AlertCircle,
  Wallet,
  CalendarIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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

function RecurringBills() {
  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const currentMonthYear = new Date().toISOString().slice(0, 7);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'expense',
    category: 'Bills',
    account: '',
    due_date: new Date(),
    frequency: 'monthly', // 'monthly' or 'adhoc'
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, accountsRes, paymentsRes] = await Promise.all([
        axios.get(`${API}/recurring-bills`),
        axios.get(`${API}/accounts`),
        axios.get(`${API}/recurring-payments?month_year=${currentMonthYear}`)
      ]);
      setItems(itemsRes.data);
      setAccounts(accountsRes.data);
      setPayments(paymentsRes.data);
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
      const dueDate = formData.due_date instanceof Date ? formData.due_date : new Date(formData.due_date);
      await axios.post(`${API}/recurring-bills`, {
        ...formData,
        amount: parseFloat(formData.amount),
        day_of_month: dueDate.getDate(),
        due_date: format(dueDate, 'yyyy-MM-dd')
      });
      toast.success('Berhasil ditambahkan!');
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
      const dueDate = formData.due_date instanceof Date ? formData.due_date : new Date(formData.due_date);
      await axios.put(`${API}/recurring-bills/${selectedItem.id}`, {
        ...formData,
        amount: parseFloat(formData.amount),
        day_of_month: dueDate.getDate(),
        due_date: format(dueDate, 'yyyy-MM-dd')
      });
      toast.success('Berhasil diupdate!');
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
      await axios.delete(`${API}/recurring-bills/${selectedItem.id}`);
      toast.success('Berhasil dihapus!');
      setShowDeleteDialog(false);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Gagal menghapus');
    }
  };

  const handleMarkPaid = async (item) => {
    try {
      await axios.post(`${API}/recurring-bills/${item.id}/pay`, {
        month_year: currentMonthYear
      });
      toast.success(`"${item.name}" ditandai sudah dibayar!`, {
        description: 'Transaksi otomatis dibuat'
      });
      fetchData();
    } catch (error) {
      console.error('Error marking paid:', error);
      toast.error(error.response?.data?.detail || 'Gagal menandai');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await axios.put(`${API}/recurring-bills/${item.id}`, {
        is_active: !item.is_active
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling:', error);
    }
  };

  const isPaidThisMonth = (itemId) => {
    return payments.some(p => p.recurring_id === itemId);
  };

  const openEditDialog = (item) => {
    setSelectedItem(item);
    const itemDate = item.due_date ? new Date(item.due_date) : new Date();
    if (item.day_of_month && !item.due_date) {
      itemDate.setDate(item.day_of_month);
    }
    setFormData({
      name: item.name || '',
      amount: (item.amount || 0).toString(),
      type: item.type || 'expense',
      category: item.category || 'Bills',
      account: item.account || 'Cash',
      due_date: itemDate,
      frequency: item.frequency || 'monthly',
      is_active: item.is_active !== false,
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
      due_date: new Date(),
      frequency: 'monthly',
      is_active: true,
      notes: ''
    });
  };

  const getMonthName = () => {
    return new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const getDueDateStatus = (dayOfMonth) => {
    const today = new Date().getDate();
    if (today > dayOfMonth) return 'overdue';
    if (dayOfMonth - today <= 3) return 'soon';
    return 'upcoming';
  };

  // Filter items based on tab
  const filteredItems = items.filter(item => {
    const itemType = item.type || 'expense'; // Default to expense for legacy data
    if (activeTab === 'income') return itemType === 'income';
    if (activeTab === 'expense') return itemType === 'expense';
    return true;
  });

  // Calculate summaries - handle legacy data without type field
  const activeItems = items.filter(i => i.is_active !== false);
  const totalIncome = activeItems.filter(i => i.type === 'income').reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpense = activeItems.filter(i => !i.type || i.type === 'expense').reduce((sum, i) => sum + (i.amount || 0), 0);
  const expenseItems = activeItems.filter(i => !i.type || i.type === 'expense');
  const paidCount = expenseItems.filter(i => isPaidThisMonth(i.id)).length;
  const unpaidCount = expenseItems.filter(i => !isPaidThisMonth(i.id)).length;

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
            Tagihan & Recurring
          </h1>
          <p className="text-slate-500 text-sm">Kelola pemasukan & pengeluaran berulang - {getMonthName()}</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }} data-testid="add-recurring-btn">
          <Plus className="w-4 h-4 mr-2" />
          Tambah
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Pemasukan/Bulan</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-rose-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-medium text-rose-700">Pengeluaran/Bulan</span>
            </div>
            <p className="text-xl font-bold text-rose-600">{formatCurrency(totalExpense)}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-indigo-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-medium text-indigo-700">Net/Bulan</span>
            </div>
            <p className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(totalIncome - totalExpense)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-amber-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Status Bulan Ini</span>
            </div>
            <p className="text-xl font-bold text-amber-600">{paidCount}/{paidCount + unpaidCount}</p>
            <p className="text-xs text-amber-500">sudah dibayar</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-6 pt-4">
              <TabsList className="bg-transparent h-auto p-0 gap-6">
                <TabsTrigger 
                  value="all" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent px-0 pb-3"
                >
                  Semua ({items.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="expense"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-rose-500 data-[state=active]:bg-transparent px-0 pb-3"
                >
                  Pengeluaran ({items.filter(i => !i.type || i.type === 'expense').length})
                </TabsTrigger>
                <TabsTrigger 
                  value="income"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent px-0 pb-3"
                >
                  Pemasukan ({items.filter(i => i.type === 'income').length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="p-6 m-0">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Repeat className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Belum ada data</p>
                  <p className="text-sm">Tambahkan gaji, tagihan, atau subscription</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item) => {
                    const isPaid = isPaidThisMonth(item.id);
                    const itemType = item.type || 'expense';
                    const dayOfMonth = item.day_of_month || parseInt(item.due_date) || 1;
                    const status = getDueDateStatus(dayOfMonth);
                    const isExpense = itemType === 'expense';
                    const itemAccount = item.account || 'Cash';
                    const itemAmount = item.amount || 0;
                    
                    return (
                      <div 
                        key={item.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${
                          item.is_active === false
                            ? 'bg-slate-50 opacity-60' 
                            : isExpense && isPaid 
                              ? 'bg-emerald-50/50 border-emerald-100' 
                              : isExpense && status === 'overdue'
                                ? 'bg-rose-50/50 border-rose-100'
                                : 'bg-white border-slate-100 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Checkbox for expenses */}
                          {isExpense && (
                            <Checkbox
                              checked={isPaid}
                              onCheckedChange={() => !isPaid && handleMarkPaid(item)}
                              disabled={isPaid || item.is_active === false}
                              className={`h-5 w-5 ${isPaid ? 'border-emerald-500 bg-emerald-500' : ''}`}
                            />
                          )}
                          
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            itemType === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                          }`}>
                            {itemType === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                          </div>
                          
                          {/* Info */}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`font-semibold ${isPaid ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                {item.name}
                              </p>
                              {isPaid && (
                                <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                  <Check className="w-3 h-3 mr-1" />Paid
                                </Badge>
                              )}
                              {isExpense && !isPaid && status === 'overdue' && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="w-3 h-3 mr-1" />Overdue
                                </Badge>
                              )}
                              {isExpense && !isPaid && status === 'soon' && (
                                <Badge className="bg-amber-100 text-amber-700 text-xs">
                                  <Clock className="w-3 h-3 mr-1" />Soon
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>{item.category || 'Bills'}</span>
                              <span>•</span>
                              <span>{itemAccount}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Tgl {dayOfMonth}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`font-bold text-lg ${
                              itemType === 'income' ? 'text-emerald-600' : isPaid ? 'text-slate-400' : 'text-slate-800'
                            }`}>
                              {itemType === 'income' ? '+' : '-'}{formatCurrency(itemAmount)}
                            </p>
                          </div>

                          <Switch
                            checked={item.is_active !== false}
                            onCheckedChange={() => handleToggleActive(item)}
                            className="data-[state=checked]:bg-indigo-600"
                          />

                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Tagihan/Recurring</DialogTitle>
            <DialogDescription>
              Buat pemasukan atau pengeluaran berulang atau sekali bayar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                placeholder="e.g., Gaji, Listrik, Netflix"
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
                    <SelectItem value="income">
                      <div className="flex items-center gap-2">
                        <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                        Pemasukan
                      </div>
                    </SelectItem>
                    <SelectItem value="expense">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-rose-500" />
                        Pengeluaran
                      </div>
                    </SelectItem>
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
            
            {/* Frequency Radio */}
            <div className="space-y-3">
              <Label>Frekuensi</Label>
              <RadioGroup 
                value={formData.frequency} 
                onValueChange={(v) => setFormData({...formData, frequency: v})}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="font-normal cursor-pointer flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-indigo-500" />
                    Setiap Bulan
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="adhoc" id="adhoc" />
                  <Label htmlFor="adhoc" className="font-normal cursor-pointer flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    Adhoc (Sekali)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Tanggal Jatuh Tempo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, 'dd MMMM yyyy', { locale: id }) : 'Pilih tanggal'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => setFormData({...formData, due_date: date || new Date()})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formData.frequency === 'monthly' && (
                <p className="text-xs text-slate-500">
                  Akan ditagihkan setiap tanggal {formData.due_date ? formData.due_date.getDate() : 1} setiap bulan
                </p>
              )}
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
            <DialogTitle>Edit</DialogTitle>
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
                      <SelectItem key={day} value={day.toString()}>Tgl {day}</SelectItem>
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
            <AlertDialogTitle>Hapus?</AlertDialogTitle>
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

export default RecurringBills;
