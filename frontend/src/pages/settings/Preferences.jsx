import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Globe, Palette, Bell, Shield, Database, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_PREFERENCES = {
  language: 'id',
  currency: 'IDR',
  dateFormat: 'DD/MM/YYYY',
  theme: 'light',
  notifications: {
    billReminders: true,
    budgetAlerts: true,
    weeklyReport: false,
    debtReminders: true
  },
  display: {
    showCents: false,
    compactNumbers: true,
    showCharts: true
  },
  privacy: {
    hideBalances: false,
    requirePin: false
  }
};

function Preferences() {
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('financeOS_preferences');
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  const savePreferences = () => {
    localStorage.setItem('financeOS_preferences', JSON.stringify(preferences));
    toast.success('Preferences saved successfully!');
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.setItem('financeOS_preferences', JSON.stringify(DEFAULT_PREFERENCES));
    toast.success('Preferences reset to default!');
  };

  const updatePreference = (category, key, value) => {
    if (category) {
      setPreferences(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-4">
          <Settings className="text-amber-500" />
          Preferences
        </h1>
        <p className="text-slate-600 mt-2">Customize your FinanceOS experience</p>
      </div>

      {/* General Settings */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <Globe className="w-5 h-5 text-indigo-500" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language">Language / Bahasa</Label>
              <Select 
                value={preferences.language} 
                onValueChange={(value) => updatePreference(null, 'language', value)}
              >
                <SelectTrigger id="language" data-testid="pref-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select 
                value={preferences.currency} 
                onValueChange={(value) => updatePreference(null, 'currency', value)}
              >
                <SelectTrigger id="currency" data-testid="pref-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">Indonesian Rupiah (Rp)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="SGD">Singapore Dollar (S$)</SelectItem>
                  <SelectItem value="MYR">Malaysian Ringgit (RM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select 
                value={preferences.dateFormat} 
                onValueChange={(value) => updatePreference(null, 'dateFormat', value)}
              >
                <SelectTrigger id="dateFormat" data-testid="pref-date-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <Palette className="w-5 h-5 text-purple-500" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-4">
              {preferences.theme === 'dark' ? (
                <Moon className="w-5 h-5 text-slate-600" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <p className="font-bold text-slate-800">Theme Mode</p>
                <p className="text-sm text-slate-500">Switch between light and dark mode</p>
              </div>
            </div>
            <Select 
              value={preferences.theme} 
              onValueChange={(value) => updatePreference(null, 'theme', value)}
            >
              <SelectTrigger className="w-32" data-testid="pref-theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-800">Show Cents/Decimals</p>
              <p className="text-sm text-slate-500">Display decimal places in currency</p>
            </div>
            <Switch
              checked={preferences.display.showCents}
              onCheckedChange={(checked) => updatePreference('display', 'showCents', checked)}
              data-testid="pref-show-cents"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-800">Compact Numbers</p>
              <p className="text-sm text-slate-500">Show 1M instead of 1,000,000</p>
            </div>
            <Switch
              checked={preferences.display.compactNumbers}
              onCheckedChange={(checked) => updatePreference('display', 'compactNumbers', checked)}
              data-testid="pref-compact-numbers"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-800">Show Charts on Dashboard</p>
              <p className="text-sm text-slate-500">Display visual charts and graphs</p>
            </div>
            <Switch
              checked={preferences.display.showCharts}
              onCheckedChange={(checked) => updatePreference('display', 'showCharts', checked)}
              data-testid="pref-show-charts"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <Bell className="w-5 h-5 text-rose-500" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-800">Bill Reminders</p>
              <p className="text-sm text-slate-500">Get notified before bill due dates</p>
            </div>
            <Switch
              checked={preferences.notifications.billReminders}
              onCheckedChange={(checked) => updatePreference('notifications', 'billReminders', checked)}
              data-testid="pref-bill-reminders"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-800">Budget Alerts</p>
              <p className="text-sm text-slate-500">Alert when approaching budget limits</p>
            </div>
            <Switch
              checked={preferences.notifications.budgetAlerts}
              onCheckedChange={(checked) => updatePreference('notifications', 'budgetAlerts', checked)}
              data-testid="pref-budget-alerts"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-800">Debt Payment Reminders</p>
              <p className="text-sm text-slate-500">Remind about upcoming debt payments</p>
            </div>
            <Switch
              checked={preferences.notifications.debtReminders}
              onCheckedChange={(checked) => updatePreference('notifications', 'debtReminders', checked)}
              data-testid="pref-debt-reminders"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-800">Weekly Financial Report</p>
              <p className="text-sm text-slate-500">Receive weekly summary of finances</p>
            </div>
            <Switch
              checked={preferences.notifications.weeklyReport}
              onCheckedChange={(checked) => updatePreference('notifications', 'weeklyReport', checked)}
              data-testid="pref-weekly-report"
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-500" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-800">Hide Balances</p>
              <p className="text-sm text-slate-500">Mask all balance amounts by default</p>
            </div>
            <Switch
              checked={preferences.privacy.hideBalances}
              onCheckedChange={(checked) => updatePreference('privacy', 'hideBalances', checked)}
              data-testid="pref-hide-balances"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-800">Require PIN/Password</p>
              <p className="text-sm text-slate-500">Ask for authentication when opening app</p>
            </div>
            <Switch
              checked={preferences.privacy.requirePin}
              onCheckedChange={(checked) => updatePreference('privacy', 'requirePin', checked)}
              data-testid="pref-require-pin"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <Database className="w-5 h-5 text-cyan-500" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto py-4" disabled>
              <div className="text-left">
                <p className="font-bold">Export All Data</p>
                <p className="text-xs text-slate-500 mt-1">Download as CSV/JSON (Coming Soon)</p>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4" disabled>
              <div className="text-left">
                <p className="font-bold">Import Data</p>
                <p className="text-xs text-slate-500 mt-1">Import from CSV file (Coming Soon)</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save/Reset Buttons */}
      <div className="flex justify-end gap-4 pb-10">
        <Button variant="outline" onClick={resetPreferences} data-testid="reset-preferences-btn">
          Reset to Default
        </Button>
        <Button onClick={savePreferences} data-testid="save-preferences-btn">
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

export default Preferences;
