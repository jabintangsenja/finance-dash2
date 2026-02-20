import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Landmark } from 'lucide-react';

function DepositsTab({ onUpdate }) {
  return (
    <Card>
      <CardContent className="py-20 text-center">
        <Landmark className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
        <p className="text-slate-400 font-semibold">Deposits Management - Coming soon!</p>
        <p className="text-sm text-slate-500 mt-2">Backend API ready: GET/POST/PUT/DELETE /api/deposits</p>
      </CardContent>
    </Card>
  );
}

export default DepositsTab;
