import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, PiggyBank, Crown } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
    investments = {},
    total_assets = 0,
    total_liabilities = 0,
    liquid_assets = 0,
    active_debts = 0,
    total_debt_amount = 0
  } = dashboardData || {};

  // Prepare investment data for pie chart
  const investmentData = Object.entries(investments).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value
  })).filter(item => item.value > 0);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  // Prepare wealth projection data (mock)
  const projectionData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    value: Math.round(net_worth * (1 + (0.012 * i)))
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-slate-900 text-white border-0 shadow-2xl relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"></div>
          <CardHeader className="relative">
            <CardTitle className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Net Worth
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-4xl font-black tracking-tighter mb-4">{formatCurrency(net_worth)}</p>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500 text-[10px] font-black px-3 py-1 rounded-full uppercase italic">
                Sovereign Edition
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Cash Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-8 h-8 text-indigo-600" />
              <p className="text-3xl font-black text-slate-800 tracking-tighter">{formatCurrency(cash_balance)}</p>
            </div>
            <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-4">
              <TrendingUp className="w-3 h-3" /> Stable Cashflow
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm border-b-4 border-b-emerald-500">
          <CardHeader>
            <CardTitle className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Total Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-2">
              <PiggyBank className="w-8 h-8 text-emerald-600" />
              <p className="text-3xl font-black text-emerald-600 tracking-tighter">{formatCurrency(total_investments)}</p>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase">
              Across {Object.keys(investments).length} Asset Classes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income/Expense Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-600">
              <ArrowDownLeft className="w-5 h-5" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-emerald-600">{formatCurrency(total_income)}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-600">
              <ArrowUpRight className="w-5 h-5" />
              Total Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-rose-600">{formatCurrency(total_expense)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 border-slate-50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-extrabold text-slate-800 text-xl tracking-tight">
              Wealth Projection (12M)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={projectionData}>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={{ fill: '#6366f1', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-extrabold text-slate-800 tracking-tight text-center">
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {investmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={investmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
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
              <div className="flex items-center justify-center h-[300px] text-slate-400">
                No investment data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="font-black text-slate-800">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recent_transactions && recent_transactions.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {recent_transactions.slice(0, 5).map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <div key={tx.id} className="py-4 flex justify-between items-center hover:bg-slate-50 transition-all px-4 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 text-sm">{tx.description}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(tx.date).toLocaleDateString('id-ID')} • {tx.account} • {tx.category}
                        </p>
                      </div>
                    </div>
                    <p className={`text-lg font-black ${
                      isIncome ? 'text-emerald-500' : 'text-slate-900'
                    }`}>
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-10">No transactions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
