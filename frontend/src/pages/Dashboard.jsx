import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard, Receipt, ChevronRight, Banknote, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompact = (amount) => {
  if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)} M`;
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)} Jt`;
  if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)} Rb`;
  return `Rp ${amount}`;
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

  const savingsRate = total_income > 0 ? ((total_income - total_expense) / total_income * 100) : 0;
  const debtToAssetRatio = total_assets > 0 ? (total_liabilities / total_assets * 100) : 0;
  const netCashFlow = total_income - total_expense;

  const pieData = [
    { name: 'Harta', value: total_assets, color: '#6366f1' },
    { name: 'Utang', value: total_liabilities, color: '#ef4444' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6" data-testid="dashboard">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column - Net Worth & Quick Stats */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Net Worth Card - Clean & Modern */}
          <Card className="border-0 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Net Worth */}
                <div className="p-8 bg-gradient-to-br from-slate-50 to-white border-r border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Banknote className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Kekayaan Bersih</span>
                  </div>
                  <p className={`text-3xl font-bold ${net_worth >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                    {formatCurrency(net_worth)}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Harta - Utang</p>
                </div>
                
                {/* Total Assets */}
                <div className="p-8 border-r border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Harta</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">{formatCurrency(total_assets)}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>Cash: {formatCompact(liquid_assets)}</span>
                    <span>Invest: {formatCompact(total_investments)}</span>
                  </div>
                </div>
                
                {/* Total Liabilities */}
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-rose-600" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Utang</span>
                  </div>
                  <p className="text-3xl font-bold text-rose-600">{formatCurrency(total_liabilities)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      {active_debts} utang aktif
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Income & Expense Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Card */}
            <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                      <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Pemasukan</p>
                      <p className="text-2xl font-bold text-slate-800">{formatCurrency(total_income)}</p>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="h-1 bg-emerald-100 rounded-full">
                  <div className="h-1 bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </CardContent>
            </Card>

            {/* Expense Card */}
            <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                      <ArrowUpRight className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Pengeluaran</p>
                      <p className="text-2xl font-bold text-slate-800">{formatCurrency(total_expense)}</p>
                    </div>
                  </div>
                  <TrendingDown className="w-5 h-5 text-rose-500" />
                </div>
                <div className="h-1 bg-rose-100 rounded-full">
                  <div className="h-1 bg-rose-500 rounded-full" style={{ width: total_income > 0 ? `${(total_expense / total_income) * 100}%` : '0%' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cash Flow Summary */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-700">Arus Kas Bersih</CardTitle>
                <Badge className={`${netCashFlow >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {netCashFlow >= 0 ? 'Surplus' : 'Defisit'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-3xl font-bold ${netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Savings Rate: <span className={`font-semibold ${savingsRate >= 20 ? 'text-emerald-600' : 'text-amber-600'}`}>{savingsRate.toFixed(1)}%</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Target: 20%</p>
                  <Progress value={Math.min(savingsRate, 100)} className="w-32 h-2 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-700">Transaksi Terbaru</CardTitle>
                <Link to="/transactions" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  Lihat Semua <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recent_transactions && recent_transactions.length > 0 ? (
                <div className="space-y-3">
                  {recent_transactions.slice(0, 5).map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{tx.description}</p>
                            <p className="text-xs text-slate-400">{tx.category}</p>
                          </div>
                        </div>
                        <p className={`text-sm font-semibold ${isIncome ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Belum ada transaksi</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Charts & Quick Actions */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Asset vs Liability Pie */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-700">Komposisi Keuangan</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-6 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      <span className="text-xs text-slate-600">Harta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <span className="text-xs text-slate-600">Utang</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Belum ada data</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debt Ratio Card */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-700">Rasio Utang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className={`text-4xl font-bold ${debtToAssetRatio > 50 ? 'text-rose-600' : debtToAssetRatio > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {debtToAssetRatio.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400 mt-1">Utang / Harta</p>
              </div>
              <Progress 
                value={Math.min(debtToAssetRatio, 100)} 
                className="h-2"
              />
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>0%</span>
                <span className={`font-medium ${debtToAssetRatio <= 30 ? 'text-emerald-600' : ''}`}>30% Ideal</span>
                <span>100%</span>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-600">
                  {debtToAssetRatio <= 30 ? '✅ Rasio utang sehat!' : 
                   debtToAssetRatio <= 50 ? '⚠️ Perhatikan utang Anda' : 
                   '🚨 Utang terlalu tinggi!'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-700">Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/transactions" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Receipt className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Tambah Transaksi</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link to="/budget" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <PiggyBank className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Atur Budget</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link to="/goals" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Target Keuangan</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link to="/investments" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Lihat Investasi</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </CardContent>
          </Card>

          {/* Financial Goals Preview */}
          {financial_goals && financial_goals.length > 0 && (
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-700">Goals</CardTitle>
                  <Link to="/goals" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    Lihat Semua
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {financial_goals.slice(0, 3).map((goal) => {
                  const progress = (goal.current_amount / goal.target_amount) * 100;
                  return (
                    <div key={goal.id} className="p-3 rounded-lg bg-slate-50">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-slate-700 truncate">{goal.name}</p>
                        <span className="text-xs font-semibold text-indigo-600">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
