import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart } from 'lucide-react';

function StocksTab({ onUpdate }) {
  return (
    <Card>
      <CardContent className="py-20 text-center">
        <LineChart className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
        <p className="text-slate-400 font-semibold">Stocks Management - Coming soon!</p>
        <p className="text-sm text-slate-500 mt-2">Backend API ready: GET/POST/PUT/DELETE /api/stocks</p>
      </CardContent>
    </Card>
  );
}

export default StocksTab;
