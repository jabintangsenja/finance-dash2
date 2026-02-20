import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

function MutualFundsTab({ onUpdate }) {
  return (
    <Card>
      <CardContent className="py-20 text-center">
        <PieChart className="w-16 h-16 text-rose-300 mx-auto mb-4" />
        <p className="text-slate-400 font-semibold">Mutual Funds Management - Coming soon!</p>
        <p className="text-sm text-slate-500 mt-2">Backend API ready: GET/POST/PUT/DELETE /api/mutual-funds</p>
      </CardContent>
    </Card>
  );
}

export default MutualFundsTab;
