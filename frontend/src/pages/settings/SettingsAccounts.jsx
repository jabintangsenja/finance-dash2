import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Settings, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

function SettingsAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('Bank');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API}/accounts`);
      setAccounts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      toast.error('Please enter account name');
      return;
    }
    
    const exists = accounts.find(acc => acc.name.toLowerCase() === newAccountName.trim().toLowerCase());
    if (exists) {
      toast.error('Account already exists!');
      return;
    }

    try {
      await axios.post(`${API}/accounts`, {
        name: newAccountName.trim(),
        type: newAccountType,
        balance: 0
      });
      toast.success('Account added successfully!');
      setNewAccountName('');
      setNewAccountType('Bank');
      fetchAccounts();
    } catch (error) {
      console.error('Error adding account:', error);
      toast.error('Failed to add account');
    }
  };

  const handleDeleteAccount = async (accountId, accountName) => {
    if (window.confirm(`Delete account "${accountName}"?`)) {
      try {
        await axios.delete(`${API}/accounts/${accountId}`);
        toast.success(`Account ${accountName} deleted successfully!`);
        fetchAccounts();
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-4">
          <Settings className="text-indigo-500" />
          Manage Accounts
        </h1>
        <p className="text-slate-600 mt-2">Add or remove accounts for your transactions</p>
      </div>

      <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-xl font-black">Add New Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="account-name">Account Name</Label>
              <Input
                id="account-name"
                placeholder="e.g., BCA, OVO, Cash"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddAccount()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-type">Type</Label>
              <Select value={newAccountType} onValueChange={setNewAccountType}>
                <SelectTrigger id="account-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAddAccount} className="w-full mt-4" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-black">Existing Accounts ({accounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-semibold">No accounts yet. Add your first account!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl hover:shadow-lg transition-all border border-slate-200">
                  <div className="flex-1">
                    <p className="font-black text-slate-800 text-lg">{account.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{account.type}</p>
                    <p className="text-sm text-slate-600 font-bold mt-2">{formatCurrency(account.balance)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAccount(account.id, account.name)}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsAccounts;