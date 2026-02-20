import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

function Debts() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-4">
          <CreditCard className="text-rose-500" />
          Liabilities / Utang
        </h1>
        <p className="text-slate-600 mt-2">Track and manage all your debts and liabilities</p>
      </div>

      <Card>
        <CardContent className="py-20 text-center">
          <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-semibold">Debts page - Coming soon!</p>
          <p className="text-sm text-slate-500 mt-2">Backend API is ready. Use: GET/POST/PUT/DELETE /api/debts</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Debts;
