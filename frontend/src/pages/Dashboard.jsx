import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Wallet, PiggyBank, Crown, Target, CreditCard, Receipt, Sparkles } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompact = (amount) => {
  if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toString();
};

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { 
    cash_balance = 0, 
    total_investments = 0, 
    net_worth = 0, 
    total_income = 0, 
    total_expense = 0, 
    recent_transactions = [], 
    investments_breakdown = {},
    total_assets = 0,
    total_liabilities = 0,
    liquid_assets = 0,
    active_debts = 0,
    financial_goals = []
  } = dashboardData || {};

  // Calculate savings rate
  const savingsRate = total_income > 0 ? ((total_income - total_expense) / total_income * 100) : 0;
  
  // Debt to Asset ratio
  const debtToAssetRatio = total_assets > 0 ? (total_liabilities / total_assets * 100) : 0;

  // Prepare investment data for pie chart
  const investmentData = Object.entries(investments_breakdown || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: value
  })).filter(item => item.value > 0);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  // Prepare cash flow data
  const cashFlowData = [
    { name: 'Income', value: total_income, fill: '#10b981' },
    { name: 'Expense', value: total_expense, fill: '#ef4444' },
    { name: 'Savings', value: Math.max(0, total_income - total_expense), fill: '#6366f1' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8" data-testid="dashboard">
      {/* Hero Section - Net Worth */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-amber-400 text-sm font-bold uppercase tracking-widest">Total Kekayaan Bersih</p>
              <p className="text-slate-400 text-xs">Assets - Liabilities = Net Worth</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-5xl md:text-6xl font-black text-white tracking-tight mb-2">
                {formatCurrency(net_worth)}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold px-4 py-1.5">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Wealth Builder
                </Badge>
                {savingsRate > 20 && (
                  <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-bold px-4 py-1.5">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {savingsRate.toFixed(0)}% Savings Rate
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-black text-white">{formatCompact(total_assets)}</p>
                <p className="text-xs text-slate-400 font-bold uppercase">Assets</p>
              </div>
              <div className="text-center border-x border-slate-700 px-4">
                <p className="text-2xl font-black text-rose-400">{formatCompact(total_liabilities)}</p>
                <p className="text-xs text-slate-400 font-bold uppercase">Liabilities</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-400">{debtToAssetRatio.toFixed(0)}%</p>
                <p className="text-xs text-slate-400 font-bold uppercase">Debt Ratio</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Assets Card */}
        <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-indigo-50 to-indigo-100/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Total Harta</p>
            <p className="text-3xl font-black text-slate-800 mb-4">{formatCurrency(total_assets)}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Cash & Bank</span>
                <span className="font-bold text-slate-700">{formatCurrency(liquid_assets)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Investments</span>
                <span className="font-bold text-slate-700">{formatCurrency(total_investments)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities Card */}
        <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-rose-50 to-rose-100/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              {total_liabilities > 0 ? (
                <TrendingDown className="w-5 h-5 text-rose-500" />
              ) : (
                <Badge className="bg-emerald-100 text-emerald-600 text-xs">Debt Free!</Badge>
              )}
            </div>
            <p className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-1">Total Utang</p>
            <p className="text-3xl font-black text-slate-800 mb-4">{formatCurrency(total_liabilities)}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Active Debts</span>
                <span className="font-bold text-slate-700">{active_debts} items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Debt Ratio</span>
                <span className={`font-bold ${debtToAssetRatio > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {debtToAssetRatio.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow Card */}
        <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <Badge className={`${savingsRate >= 20 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'} text-xs font-bold`}>
                {savingsRate >= 20 ? 'Great!' : 'Improve'}
              </Badge>
            </div>
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Cash Flow</p>
            <p className="text-3xl font-black text-slate-800 mb-4">{formatCurrency(total_income - total_expense)}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-emerald-600 flex items-center gap-1">
                  <ArrowDownLeft className="w-3 h-3" /> Income
                </span>
                <span className="font-bold text-emerald-600">{formatCurrency(total_income)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-rose-600 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> Expense
                </span>
                <span className="font-bold text-rose-600">{formatCurrency(total_expense)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Rate Progress */}
      <Card className="border-0 shadow-lg bg-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Savings Rate</p>
              <p className="text-2xl font-black text-slate-800">{savingsRate.toFixed(1)}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Target: 20%+</p>
              <p className={`text-sm font-bold ${savingsRate >= 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {savingsRate >= 20 ? 'On Track!' : `Need ${(20 - savingsRate).toFixed(1)}% more`}
              </p>
            </div>
          </div>
          <Progress 
            value={Math.min(savingsRate, 100)} 
            className="h-4"
          />
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>0%</span>
            <span className="text-emerald-500 font-bold">20% (Ideal)</span>
            <span>50%+</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Asset Allocation */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-black text-slate-800 text-lg">Alokasi Aset</CardTitle>
          </CardHeader>
          <CardContent>
            {investmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={investmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {investmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] text-slate-400">
                <PiggyBank className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-semibold">Belum ada data investasi</p>
                <p className="text-sm">Mulai berinvestasi sekarang!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cash Flow Summary */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-black text-slate-800 text-lg">Ringkasan Arus Kas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => formatCompact(v)} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Financial Goals Progress */}
      {financial_goals && financial_goals.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Financial Goals
              </CardTitle>
              <Badge className="bg-indigo-100 text-indigo-600">{financial_goals.length} Goals</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {financial_goals.slice(0, 4).map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100;
                return (
                  <div key={goal.id} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-800">{goal.name}</p>
                      <Badge className={`${goal.is_achieved ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'} text-xs`}>
                        {goal.is_achieved ? 'Achieved!' : `${progress.toFixed(0)}%`}
                      </Badge>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{formatCurrency(goal.current_amount)}</span>
                      <span>{formatCurrency(goal.target_amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-black text-slate-800 text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5 text-slate-400" />
              Transaksi Terbaru
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {recent_transactions && recent_transactions.length > 0 ? (
            <div className="space-y-3">
              {recent_transactions.slice(0, 5).map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <div key={tx.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{tx.description}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {tx.category}
                        </p>
                      </div>
                    </div>
                    <p className={`text-lg font-black ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Belum ada transaksi</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
