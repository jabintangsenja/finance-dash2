import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Investments from './pages/Investments';
import InvestmentDetail from './pages/InvestmentDetail';
import Debts from './pages/Debts';
import Bills from './pages/Bills';
import Analytics from './pages/Analytics';
import BudgetPlanner from './pages/BudgetPlanner';
import FinancialGoals from './pages/FinancialGoals';
import SettingsAccounts from './pages/settings/SettingsAccounts';
import SettingsCategories from './pages/settings/SettingsCategories';
import Preferences from './pages/settings/Preferences';
import { LayoutDashboard, ArrowUpDown, TrendingUp, Calendar, BarChart3, CreditCard, Target, PieChart, Menu, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const [showManagement, setShowManagement] = useState(false);
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: ArrowUpDown, label: 'Transaksi' },
    { path: '/budget', icon: PieChart, label: 'Budget' },
    { path: '/goals', icon: Target, label: 'Goals' },
    { path: '/investments', icon: TrendingUp, label: 'Investasi' },
    { path: '/debts', icon: CreditCard, label: 'Utang' },
    { path: '/bills', icon: Calendar, label: 'Tagihan' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 text-slate-400 
        flex flex-col shrink-0 z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tighter uppercase">
              Finance<span className="text-indigo-500">OS</span>
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'hover:bg-slate-800'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
          
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setShowManagement(!showManagement)}
              className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl hover:bg-slate-800 transition-all"
            >
              <Settings className="w-5 h-5" />
              <span className="font-semibold">Settings</span>
              <span className="ml-auto">{showManagement ? '−' : '+'}</span>
            </button>
            
            {showManagement && (
              <div className="mt-2 ml-4 space-y-2 animate-in slide-in-from-top">
                <Link
                  to="/settings/accounts"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-800 transition-all text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  Manage Accounts
                </Link>
                <Link
                  to="/settings/categories"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-800 transition-all text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  Manage Categories
                </Link>
                <Link
                  to="/settings/preferences"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-800 transition-all text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  Preferences
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="p-6">
          <div className="bg-slate-800/40 rounded-[2rem] p-6 border border-slate-700/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest text-center">
              Health Score
            </p>
            <div className="flex justify-center items-end gap-1">
              <span className="text-3xl font-black text-white">85</span>
              <span className="text-[10px] text-emerald-400 font-bold mb-1">PRO</span>
            </div>
            <div className="h-1.5 w-full bg-slate-700 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{width: '85%'}} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="flex-1 h-screen overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-6 lg:px-10 py-5 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">
              Financial Command Center
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
              U
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budget" element={<BudgetPlanner />} />
            <Route path="/goals" element={<FinancialGoals />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/investments/detail" element={<InvestmentDetail />} />
            <Route path="/debts" element={<Debts />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings/accounts" element={<SettingsAccounts />} />
            <Route path="/settings/categories" element={<SettingsCategories />} />
            <Route path="/settings/preferences" element={<Preferences />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
