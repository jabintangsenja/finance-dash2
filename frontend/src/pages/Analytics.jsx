import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

function Analytics() {
  const [monthlyData, setMonthlyData] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [monthlyRes, categoryRes, statsRes] = await Promise.all([
        axios.get(`${API}/analytics/monthly`),
        axios.get(`${API}/analytics/category`),
        axios.get(`${API}/transactions/stats`)
      ]);
      setMonthlyData(monthlyRes.data);
      setCategoryData(categoryRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  // Prepare data for charts
  const monthlyChartData = Object.entries(monthlyData).map(([month, data]) => ({
    month: month,
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense
  }));

  const categoryChartData = Object.entries(categoryData)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16'];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-4">
          <Activity className="text-indigo-500" />
          Financial Analytics
        </h1>
        <p className="text-slate-600 mt-2">Detailed insights into your financial performance</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-indigo-100 bg-indigo-50/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-indigo-700">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-indigo-600">{formatCurrency(stats.total_income)}</p>
            </CardContent>
          </Card>
          <Card className="border-rose-100 bg-rose-50/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-rose-700">Total Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-rose-600">{formatCurrency(stats.total_expense)}</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-100 bg-emerald-50/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-emerald-700">Net Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-emerald-600">{formatCurrency(stats.net)}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-100 bg-slate-50">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-700">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-slate-800">{stats.total_transactions}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Trend */}
      <Card className="border-slate-50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-slate-800">Monthly Income vs Expense</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyChartData}>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-slate-400">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="border-slate-50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-black text-slate-800">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-slate-400">
                No category data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Table */}
        <Card className="border-slate-50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-black text-slate-800">Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            {stats && stats.category_breakdown && Object.keys(stats.category_breakdown).length > 0 ? (
              <div className="space-y-4 max-h-[350px] overflow-y-auto">
                {Object.entries(stats.category_breakdown).map(([category, data], index) => (
                  <div key={category} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-bold text-slate-800">{category}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{data.count} transactions</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-emerald-600 font-semibold">Income</p>
                        <p className="font-black text-emerald-700">{formatCurrency(data.income)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-rose-600 font-semibold">Expense</p>
                        <p className="font-black text-rose-700">{formatCurrency(data.expense)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-slate-400">
                No category breakdown available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Analytics;