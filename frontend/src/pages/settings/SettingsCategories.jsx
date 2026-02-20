import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Tag } from 'lucide-react';

function SettingsCategories() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-4">
          <Settings className="text-emerald-500" />
          Manage Categories
        </h1>
        <p className="text-slate-600 mt-2">Customize your transaction categories and dropdown options</p>
      </div>

      <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50">
        <CardContent className="py-20 text-center">
          <Tag className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
          <p className="text-slate-400 font-semibold text-lg">Category Management - Coming Soon!</p>
          <p className="text-slate-500 text-sm mt-2">This feature will allow you to customize all dropdown options</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsCategories;