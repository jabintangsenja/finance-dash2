import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Layers } from 'lucide-react';

function GoldTab({ onUpdate }) {
  return (
    <Card>
      <CardContent className="py-20 text-center">
        <Layers className="w-16 h-16 text-amber-300 mx-auto mb-4" />
        <p className="text-slate-400 font-semibold">Gold Management - Coming soon!</p>
        <p className="text-sm text-slate-500 mt-2">Backend API ready: GET/POST/PUT/DELETE /api/gold</p>
      </CardContent>
    </Card>
  );
}

export default GoldTab;
