import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import StocksTab from '../components/investments/StocksTab';
import DepositsTab from '../components/investments/DepositsTab';
import GoldTab from '../components/investments/GoldTab';
import MutualFundsTab from '../components/investments/MutualFundsTab';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

function InvestmentDetail() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API}/investments`);
      setSummary(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setLoading(false);
    }
  };

  const totalInvestments = summary 
    ? Object.values(summary).reduce((sum, val) => sum + val, 0)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/investments')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-4">
              <TrendingUp className="text-indigo-500" />
              Investment Portfolio Detail
            </h1>
            <p className="text-slate-600 mt-2">Manage your investment breakdown by instrument</p>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-2">
                Total Portfolio Value
              </p>
              <p className="text-5xl font-black">{formatCurrency(totalInvestments)}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-sm font-bold mb-2">Breakdown</p>
              <div className="space-y-1 text-sm">
                <p>Saham: {formatCurrency(summary?.saham || 0)}</p>
                <p>Deposito: {formatCurrency(summary?.deposito || 0)}</p>
                <p>Emas: {formatCurrency(summary?.emas || 0)}</p>
                <p>Reksadana: {formatCurrency(summary?.reksadana || 0)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stocks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stocks">Saham</TabsTrigger>
          <TabsTrigger value="deposits">Deposito</TabsTrigger>
          <TabsTrigger value="gold">Emas</TabsTrigger>
          <TabsTrigger value="mutual-funds">Reksadana</TabsTrigger>
        </TabsList>

        <TabsContent value="stocks">
          <StocksTab onUpdate={fetchSummary} />
        </TabsContent>

        <TabsContent value="deposits">
          <DepositsTab onUpdate={fetchSummary} />
        </TabsContent>

        <TabsContent value="gold">
          <GoldTab onUpdate={fetchSummary} />
        </TabsContent>

        <TabsContent value="mutual-funds">
          <MutualFundsTab onUpdate={fetchSummary} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InvestmentDetail;