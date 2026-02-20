import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  TrendingUp,
  LineChart as LineChartIcon, 
  Landmark, 
  Coins, 
  BarChart3,
  Trash2,
  Edit
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast } from 'sonner';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

function InvestmentItem({ item, onEdit, onDelete, type }) {
  const getIcon = () => {
    switch(type) {
      case 'stocks': return <LineChartIcon className="w-4 h-4" />;
      case 'deposits': return <Landmark className="w-4 h-4" />;
      case 'gold': return <Coins className="w-4 h-4" />;
      case 'mutual_funds': return <BarChart3 className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getColorClass = () => {
    switch(type) {
      case 'stocks': return 'bg-indigo-100 text-indigo-600';
      case 'deposits': return 'bg-emerald-100 text-emerald-600';
      case 'gold': return 'bg-amber-100 text-amber-600';
      case 'mutual_funds': return 'bg-rose-100 text-rose-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getColorClass()}`}>
          {getIcon()}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{item.name}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {item.ticker && <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{item.ticker}</span>}
            {item.broker && <span>{item.broker}</span>}
            {item.bank && <span>{item.bank}</span>}
            {item.platform && <span>{item.platform}</span>}
            {item.type && <span>{item.type}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-bold text-slate-800">{formatCurrency(item.current_value || item.amount)}</p>
          {item.quantity && (
            <p className="text-xs text-slate-500">{item.quantity} {type === 'stocks' ? 'lot' : type === 'gold' ? 'gram' : 'unit'}</p>
          )}
          {item.interest_rate && (
            <p className="text-xs text-emerald-600">{item.interest_rate}% p.a.</p>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="h-8 w-8">
            <Edit className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(item)} className="h-8 w-8 text-rose-600 hover:text-rose-700">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Investments() {
  const [activeTab, setActiveTab] = useState('stocks');
  const [investments, setInvestments] = useState({
    stocks: [],
    deposits: [],
    gold: [],
    mutual_funds: []
  });
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const response = await axios.get(`${API}/investments/detailed`);
      setInvestments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching investments:', error);
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post(`${API}/investments/detailed/${activeTab}`, formData);
      toast.success('Investasi berhasil ditambahkan!');
      setShowAddDialog(false);
      setFormData({});
      fetchInvestments();
    } catch (error) {
      console.error('Error adding investment:', error);
      toast.error('Gagal menambahkan investasi');
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(`${API}/investments/detailed/${activeTab}/${editingItem.id}`, formData);
      toast.success('Investasi berhasil diupdate!');
      setEditingItem(null);
      setFormData({});
      fetchInvestments();
    } catch (error) {
      console.error('Error updating investment:', error);
      toast.error('Gagal mengupdate investasi');
    }
  };

  const handleDelete = async (item) => {
    if (!confirm('Yakin ingin menghapus investasi ini?')) return;
    try {
      await axios.delete(`${API}/investments/detailed/${activeTab}/${item.id}`);
      toast.success('Investasi berhasil dihapus!');
      fetchInvestments();
    } catch (error) {
      console.error('Error deleting investment:', error);
      toast.error('Gagal menghapus investasi');
    }
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setFormData(item);
  };

  const openAddDialog = () => {
    setFormData({});
    setShowAddDialog(true);
  };

  const calculateTotal = (type) => {
    return (investments[type] || []).reduce((sum, item) => sum + (item.current_value || item.amount || 0), 0);
  };

  const totalPortfolio = calculateTotal('stocks') + calculateTotal('deposits') + calculateTotal('gold') + calculateTotal('mutual_funds');

  const pieData = [
    { name: 'Saham', value: calculateTotal('stocks'), color: '#6366f1' },
    { name: 'Deposito', value: calculateTotal('deposits'), color: '#10b981' },
    { name: 'Emas', value: calculateTotal('gold'), color: '#f59e0b' },
    { name: 'Reksadana', value: calculateTotal('mutual_funds'), color: '#ec4899' }
  ].filter(item => item.value > 0);

  const tabs = [
    { id: 'stocks', label: 'Saham', icon: LineChartIcon, color: 'indigo', count: (investments.stocks || []).length },
    { id: 'deposits', label: 'Deposito', icon: Landmark, color: 'emerald', count: (investments.deposits || []).length },
    { id: 'gold', label: 'Emas', icon: Coins, color: 'amber', count: (investments.gold || []).length },
    { id: 'mutual_funds', label: 'Reksadana', icon: BarChart3, color: 'rose', count: (investments.mutual_funds || []).length }
  ];

  const getFormFields = () => {
    switch(activeTab) {
      case 'stocks':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Saham</Label>
                <Input 
                  placeholder="e.g., Bank BCA"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Ticker</Label>
                <Input 
                  placeholder="e.g., BBCA"
                  value={formData.ticker || ''}
                  onChange={(e) => setFormData({...formData, ticker: e.target.value.toUpperCase()})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jumlah Lot</Label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Avg (Rp)</Label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={formData.avg_price || ''}
                  onChange={(e) => setFormData({...formData, avg_price: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nilai Saat Ini (Rp)</Label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={formData.current_value || ''}
                  onChange={(e) => setFormData({...formData, current_value: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Broker</Label>
                <Select value={formData.broker || ''} onValueChange={(v) => setFormData({...formData, broker: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih Broker" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ajaib">Ajaib</SelectItem>
                    <SelectItem value="Stockbit">Stockbit</SelectItem>
                    <SelectItem value="IPOT">IPOT</SelectItem>
                    <SelectItem value="Mirae">Mirae Asset</SelectItem>
                    <SelectItem value="BCA Sekuritas">BCA Sekuritas</SelectItem>
                    <SelectItem value="Other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );
      case 'deposits':
        return (
          <>
            <div className="space-y-2">
              <Label>Nama Deposito</Label>
              <Input 
                placeholder="e.g., Deposito BCA 12 Bulan"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank</Label>
                <Select value={formData.bank || ''} onValueChange={(v) => setFormData({...formData, bank: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih Bank" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="Mandiri">Mandiri</SelectItem>
                    <SelectItem value="BNI">BNI</SelectItem>
                    <SelectItem value="BRI">BRI</SelectItem>
                    <SelectItem value="CIMB Niaga">CIMB Niaga</SelectItem>
                    <SelectItem value="Jago">Bank Jago</SelectItem>
                    <SelectItem value="SeaBank">SeaBank</SelectItem>
                    <SelectItem value="Other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tenor</Label>
                <Select value={formData.tenor || ''} onValueChange={(v) => setFormData({...formData, tenor: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih Tenor" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 Bulan">1 Bulan</SelectItem>
                    <SelectItem value="3 Bulan">3 Bulan</SelectItem>
                    <SelectItem value="6 Bulan">6 Bulan</SelectItem>
                    <SelectItem value="12 Bulan">12 Bulan</SelectItem>
                    <SelectItem value="24 Bulan">24 Bulan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nilai Pokok (Rp)</Label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0, current_value: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Suku Bunga (%)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={formData.interest_rate || ''}
                  onChange={(e) => setFormData({...formData, interest_rate: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </>
        );
      case 'gold':
        return (
          <>
            <div className="space-y-2">
              <Label>Nama / Keterangan</Label>
              <Input 
                placeholder="e.g., Emas Antam 10gr"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jenis</Label>
                <Select value={formData.type || ''} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih Jenis" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Antam">Emas Antam</SelectItem>
                    <SelectItem value="UBS">UBS</SelectItem>
                    <SelectItem value="Digital">Emas Digital</SelectItem>
                    <SelectItem value="Perhiasan">Perhiasan</SelectItem>
                    <SelectItem value="Other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Platform (jika digital)</Label>
                <Select value={formData.platform || ''} onValueChange={(v) => setFormData({...formData, platform: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih Platform" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pluang">Pluang</SelectItem>
                    <SelectItem value="Tokopedia">Tokopedia Emas</SelectItem>
                    <SelectItem value="Pegadaian">Pegadaian Digital</SelectItem>
                    <SelectItem value="Treasury">Treasury</SelectItem>
                    <SelectItem value="Physical">Fisik (bukan digital)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Berat (gram)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Nilai Saat Ini (Rp)</Label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={formData.current_value || ''}
                  onChange={(e) => setFormData({...formData, current_value: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </>
        );
      case 'mutual_funds':
        return (
          <>
            <div className="space-y-2">
              <Label>Nama Reksadana</Label>
              <Input 
                placeholder="e.g., Sucorinvest Equity Fund"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jenis</Label>
                <Select value={formData.type || ''} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih Jenis" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Saham">Reksadana Saham</SelectItem>
                    <SelectItem value="Campuran">Reksadana Campuran</SelectItem>
                    <SelectItem value="Pendapatan Tetap">Pendapatan Tetap</SelectItem>
                    <SelectItem value="Pasar Uang">Pasar Uang</SelectItem>
                    <SelectItem value="Index">Index Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={formData.platform || ''} onValueChange={(v) => setFormData({...formData, platform: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih Platform" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bibit">Bibit</SelectItem>
                    <SelectItem value="Ajaib">Ajaib</SelectItem>
                    <SelectItem value="Bareksa">Bareksa</SelectItem>
                    <SelectItem value="IPOT">IPOT</SelectItem>
                    <SelectItem value="Tanamduit">Tanamduit</SelectItem>
                    <SelectItem value="Other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jumlah Unit</Label>
                <Input 
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Nilai Saat Ini (Rp)</Label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={formData.current_value || ''}
                  onChange={(e) => setFormData({...formData, current_value: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

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
            <TrendingUp className="text-indigo-500" />
            Portfolio Investasi
          </h1>
          <p className="text-slate-500 text-sm">Kelola dan pantau investasi Anda</p>
        </div>
        <Button onClick={openAddDialog} data-testid="add-investment-btn">
          <Plus className="w-4 h-4 mr-2" />
          Tambah {tabs.find(t => t.id === activeTab)?.label}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="col-span-2 md:col-span-1 border-0 shadow-sm bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <CardContent className="p-5">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Portfolio</p>
            <p className="text-2xl font-bold">{formatCurrency(totalPortfolio)}</p>
          </CardContent>
        </Card>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const total = calculateTotal(tab.id);
          const percentage = totalPortfolio > 0 ? (total / totalPortfolio * 100) : 0;
          const bgColors = {
            indigo: 'bg-indigo-50',
            emerald: 'bg-emerald-50',
            amber: 'bg-amber-50',
            rose: 'bg-rose-50'
          };
          const textColors = {
            indigo: 'text-indigo-600',
            emerald: 'text-emerald-600',
            amber: 'text-amber-600',
            rose: 'text-rose-600'
          };
          return (
            <Card key={tab.id} className={`border-0 shadow-sm ${bgColors[tab.color]}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${textColors[tab.color]}`} />
                  <p className="text-xs text-slate-500 uppercase tracking-wide">{tab.label}</p>
                </div>
                <p className={`text-xl font-bold ${textColors[tab.color]}`}>{formatCurrency(total)}</p>
                <p className="text-xs text-slate-400 mt-1">{percentage.toFixed(1)}% portfolio</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left - Investment List */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const borderColors = {
                      indigo: 'data-[state=active]:border-indigo-500',
                      emerald: 'data-[state=active]:border-emerald-500',
                      amber: 'data-[state=active]:border-amber-500',
                      rose: 'data-[state=active]:border-rose-500'
                    };
                    return (
                      <TabsTrigger 
                        key={tab.id} 
                        value={tab.id}
                        className={`rounded-none border-b-2 border-transparent ${borderColors[tab.color]} data-[state=active]:bg-transparent px-6 py-4`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {tab.label}
                        <Badge variant="secondary" className="ml-2 text-xs">{tab.count}</Badge>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {tabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="p-6 space-y-3">
                    {(investments[tab.id] || []).length > 0 ? (
                      (investments[tab.id] || []).map((item) => (
                        <InvestmentItem 
                          key={item.id} 
                          item={item} 
                          type={tab.id}
                          onEdit={openEditDialog}
                          onDelete={handleDelete}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <tab.icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Belum ada data {tab.label}</p>
                        <p className="text-sm">Klik tombol "Tambah" untuk menambahkan</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right - Chart */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="border-0 shadow-sm sticky top-6">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-700">Alokasi Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Belum ada data investasi</p>
                </div>
              )}

              {/* Quick Stats */}
              <div className="mt-6 space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Item</span>
                    <span className="font-semibold text-slate-800">
                      {tabs.reduce((sum, t) => sum + (investments[t.id] || []).length, 0)} investasi
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah {tabs.find(t => t.id === activeTab)?.label}</DialogTitle>
            <DialogDescription>
              Masukkan detail investasi baru
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {getFormFields()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Batal</Button>
            <Button onClick={handleAdd}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {tabs.find(t => t.id === activeTab)?.label}</DialogTitle>
            <DialogDescription>
              Perbarui detail investasi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {getFormFields()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>Batal</Button>
            <Button onClick={handleEdit}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Investments;