import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  PieChart,
  LineChart,
  ChevronLeft,
  ChevronRight,
  Minus
} from 'lucide-react';
import { 
  LineChart as RechartsLine, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompact = (amount) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}Jt`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}Rb`;
  return amount.toString();
};

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/transactions?limit=1000`);
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  // Helper functions
  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return months[month - 1];
  };

  const getFullMonthName = (month) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[month - 1];
  };

  // Filter transactions by month/year
  const filterByMonth = (year, month) => {
    return transactions.filter(tx => {
      const date = new Date(tx.date);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
  };

  // Current month data
  const currentMonthTx = filterByMonth(selectedYear, selectedMonth);
  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  const prevMonthTx = filterByMonth(prevYear, prevMonth);

  // Calculate totals
  const calcTotals = (txList) => {
    const income = txList.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expense = txList.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    return { income, expense, net: income - expense };
  };

  const currentTotals = calcTotals(currentMonthTx);
  const prevTotals = calcTotals(prevMonthTx);

  // Calculate percentage change
  const calcChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100);
  };

  const incomeChange = calcChange(currentTotals.income, prevTotals.income);
  const expenseChange = calcChange(currentTotals.expense, prevTotals.expense);

  // Monthly data for charts (last 12 months)
  const getMonthlyData = () => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      let month = new Date().getMonth() + 1 - i;
      let year = new Date().getFullYear();
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      const monthTx = filterByMonth(year, month);
      const totals = calcTotals(monthTx);
      data.push({
        month: getMonthName(month),
        year: year,
        fullMonth: `${getMonthName(month)} ${year}`,
        income: totals.income,
        expense: totals.expense,
        net: totals.net
      });
    }
    return data;
  };

  // Net Worth Timeline (cumulative)
  const getNetWorthTimeline = () => {
    const monthlyData = getMonthlyData();
    let cumulative = 0;
    return monthlyData.map(item => {
      cumulative += item.net;
      return {
        ...item,
        netWorth: cumulative
      };
    });
  };

  // Category breakdown for current month
  const getCategoryBreakdown = (type) => {
    const filtered = currentMonthTx.filter(tx => tx.type === type);
    const grouped = filtered.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Trend analysis - compare category spending over months
  const getCategoryTrend = () => {
    const categories = [...new Set(transactions.filter(tx => tx.type === 'expense').map(tx => tx.category))];
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      let month = new Date().getMonth() + 1 - i;
      let year = new Date().getFullYear();
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      const monthTx = filterByMonth(year, month).filter(tx => tx.type === 'expense');
      const monthData = { month: getMonthName(month) };
      
      categories.forEach(cat => {
        monthData[cat] = monthTx.filter(tx => tx.category === cat).reduce((sum, tx) => sum + tx.amount, 0);
      });
      
      data.push(monthData);
    }
    return { data, categories: categories.slice(0, 6) };
  };

  const monthlyData = getMonthlyData();
  const netWorthData = getNetWorthTimeline();
  const expenseByCategory = getCategoryBreakdown('expense');
  const incomeByCategory = getCategoryBreakdown('income');
  const categoryTrend = getCategoryTrend();

  const navigateMonth = (direction) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
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
            <BarChart3 className="text-indigo-500" />
            Analytics & Reports
          </h1>
          <p className="text-slate-500 text-sm">Analisis mendalam keuangan Anda</p>
        </div>
        
        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold text-slate-700 min-w-[120px] text-center">
            {getFullMonthName(selectedMonth)} {selectedYear}
          </span>
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Monthly Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Comparison */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-slate-500">Pemasukan</span>
              </div>
              {incomeChange !== 0 && (
                <Badge className={`${incomeChange >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {incomeChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(incomeChange).toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(currentTotals.income)}</p>
            <p className="text-xs text-slate-400 mt-1">
              vs {formatCurrency(prevTotals.income)} bulan lalu
            </p>
          </CardContent>
        </Card>

        {/* Expense Comparison */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-rose-600" />
                </div>
                <span className="text-sm font-medium text-slate-500">Pengeluaran</span>
              </div>
              {expenseChange !== 0 && (
                <Badge className={`${expenseChange <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {expenseChange <= 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
                  {Math.abs(expenseChange).toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(currentTotals.expense)}</p>
            <p className="text-xs text-slate-400 mt-1">
              vs {formatCurrency(prevTotals.expense)} bulan lalu
            </p>
          </CardContent>
        </Card>

        {/* Net Cash Flow */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl ${currentTotals.net >= 0 ? 'bg-indigo-100' : 'bg-amber-100'} flex items-center justify-center`}>
                  {currentTotals.net >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <span className="text-sm font-medium text-slate-500">Arus Kas Bersih</span>
              </div>
              <Badge className={`${currentTotals.net >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {currentTotals.net >= 0 ? 'Surplus' : 'Defisit'}
              </Badge>
            </div>
            <p className={`text-2xl font-bold ${currentTotals.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {currentTotals.net >= 0 ? '+' : ''}{formatCurrency(currentTotals.net)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              vs {prevTotals.net >= 0 ? '+' : ''}{formatCurrency(prevTotals.net)} bulan lalu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="networth">Net Worth</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="categories">Kategori</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-700">
                Pemasukan vs Pengeluaran (12 Bulan Terakhir)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatCompact} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Net Worth Timeline Tab */}
        <TabsContent value="networth" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-700">
                Pertumbuhan Kekayaan Bersih
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={netWorthData}>
                  <defs>
                    <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatCompact} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="netWorth" 
                    name="Kekayaan Bersih"
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fill="url(#netWorthGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Net Worth Stats */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm bg-indigo-50">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-indigo-600 font-medium">Kekayaan Saat Ini</p>
                <p className="text-2xl font-bold text-indigo-700 mt-2">
                  {formatCurrency(netWorthData[netWorthData.length - 1]?.netWorth || 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-emerald-50">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-emerald-600 font-medium">Pertumbuhan 12 Bulan</p>
                <p className="text-2xl font-bold text-emerald-700 mt-2">
                  {formatCurrency((netWorthData[netWorthData.length - 1]?.netWorth || 0) - (netWorthData[0]?.netWorth || 0))}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-amber-50">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-amber-600 font-medium">Rata-rata Bulanan</p>
                <p className="text-2xl font-bold text-amber-700 mt-2">
                  {formatCurrency(monthlyData.reduce((sum, m) => sum + m.net, 0) / 12)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trend Analysis Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-700">
                Trend Pengeluaran per Kategori (6 Bulan)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsLine data={categoryTrend.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatCompact} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <Legend />
                  {categoryTrend.categories.map((cat, index) => (
                    <Line 
                      key={cat}
                      type="monotone" 
                      dataKey={cat} 
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </RechartsLine>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense by Category */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-700">
                  Pengeluaran per Kategori
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expenseByCategory.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPie>
                        <Pie
                          data={expenseByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {expenseByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </RechartsPie>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-4">
                      {expenseByCategory.slice(0, 5).map((cat, index) => (
                        <div key={cat.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-slate-600">{cat.name}</span>
                          </div>
                          <span className="font-semibold text-slate-800">{formatCurrency(cat.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <PieChart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Belum ada data pengeluaran</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Income by Category */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-700">
                  Pemasukan per Kategori
                </CardTitle>
              </CardHeader>
              <CardContent>
                {incomeByCategory.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPie>
                        <Pie
                          data={incomeByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {incomeByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </RechartsPie>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-4">
                      {incomeByCategory.slice(0, 5).map((cat, index) => (
                        <div key={cat.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-slate-600">{cat.name}</span>
                          </div>
                          <span className="font-semibold text-slate-800">{formatCurrency(cat.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <PieChart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Belum ada data pemasukan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Analytics;
