import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, LineChart as LineChartIcon, Landmark, Layers, PieChart as PieChartIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

function Investments() {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState({
    saham: 0,
    deposito: 0,
    emas: 0,
    reksadana: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const response = await axios.get(`${API}/investments`);
      setInvestments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching investments:', error);
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.post(`${API}/investments`, investments);
      toast.success('Investments updated successfully!');
      fetchInvestments();
    } catch (error) {
      console.error('Error updating investments:', error);
      toast.error('Failed to update investments');
    }
  };

  const handleChange = (field, value) => {
    setInvestments(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const totalInvestments = Object.values(investments).reduce((sum, val) => sum + val, 0);

  const investmentItems = [
    { key: 'saham', label: 'Saham', icon: LineChartIcon, color: 'indigo' },
    { key: 'deposito', label: 'Deposito', icon: Landmark, color: 'emerald' },
    { key: 'emas', label: 'Emas', icon: Layers, color: 'amber' },
    { key: 'reksadana', label: 'Reksadana', icon: PieChartIcon, color: 'rose' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <Card className="bg-indigo-600 text-white border-0 shadow-2xl">
        <CardContent className="p-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Portfolio Pulse</h2>
              <p className="text-indigo-200 mt-2 font-medium">Update nilai pasar aset Anda secara real-time.</p>
              <p className="text-2xl font-black mt-4">{formatCurrency(totalInvestments)}</p>
              <p className="text-indigo-300 text-sm mt-1">Total Portfolio Value</p>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/investments/detail')} 
                className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Detail Breakdown
              </Button>
              <Button 
                onClick={handleUpdate} 
                className="bg-white text-indigo-600 hover:bg-indigo-50 px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl"
                data-testid="update-investments-btn"
              >
                Update Portfolio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {investmentItems.map((item) => {
          const Icon = item.icon;
          const colorClasses = {
            indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
            emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
            amber: 'text-amber-600 bg-amber-50 border-amber-100',
            rose: 'text-rose-600 bg-rose-50 border-rose-100'
          };
          
          return (
            <Card key={item.key} className={`border shadow-sm ${colorClasses[item.color]}`}>
              <CardHeader>
                <div className={`flex items-center gap-3 font-bold text-xs uppercase tracking-widest text-${item.color}-600`}>
                  <Icon className="w-5 h-5" />
                  {item.label}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                  <Input
                    type="number"
                    value={investments[item.key]}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    className="pl-10 text-2xl font-black text-slate-800 border-2"
                    placeholder="0"
                    data-testid={`investment-${item.key}`}
                  />
                </div>
                <div className="text-xs font-bold text-slate-500">
                  {((investments[item.key] / totalInvestments) * 100 || 0).toFixed(1)}% of portfolio
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Portfolio Breakdown */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-slate-800">Portfolio Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investmentItems.map((item) => {
              const percentage = (investments[item.key] / totalInvestments) * 100 || 0;
              const colorClasses = {
                indigo: 'bg-indigo-500',
                emerald: 'bg-emerald-500',
                amber: 'bg-amber-500',
                rose: 'bg-rose-500'
              };
              
              return (
                <div key={item.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">{item.label}</span>
                    <span className="font-black text-slate-900">{formatCurrency(investments[item.key])}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colorClasses[item.color]} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 font-semibold">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Investments;