'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Headphones,
  Users,
  BellRing,
  CreditCard,
  Tag,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Radio,
  MessageSquare,
  Lock,
  ArrowRight
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Live Sessions', href: '/admin/live-calls', icon: Radio },
  { label: 'Listeners & KYC', href: '/admin/listeners', icon: Headphones },
  { label: 'Safety & Reports', href: '/admin/reports', icon: ShieldAlert },
  { label: 'Talkers Directory', href: '/admin/users', icon: Users },
  { label: 'Push Center', href: '/admin/push-center', icon: BellRing },
  { label: 'Payouts (RazorpayX)', href: '/admin/payouts', icon: CreditCard },
  { label: 'Pricing & Coupons', href: '/admin/pricing', icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('chatzie_admin_auth');
      if (auth === 'true') {
        setIsAuthorized(true);
      }
    }
    setIsCheckingAuth(false);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmail.trim().toLowerCase();
    if (cleanEmail === 'amith@chatzzie.com' && adminPass === 'Admin@123') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('chatzie_admin_auth', 'true');
      }
      setIsAuthorized(true);
      setAuthError('');
    } else {
      setAuthError('Invalid administrator credentials. Access denied.');
    }
  };

  const handleAdminLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatzie_admin_auth');
    }
    setIsAuthorized(false);
  };

  if (isCheckingAuth) {
    return <div className="h-screen bg-slate-900 flex items-center justify-center text-slate-400">Loading...</div>;
  }

  // Password-Protected Admin Login Gate
  if (!isAuthorized) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Chatzie Master Console</h1>
            <p className="text-xs text-slate-400 mt-1">
              Restricted portal. Please verify your credentials to access the administrative dashboard.
            </p>
          </div>

          {authError && (
            <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs font-semibold text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email / Username
              </label>
              <input
                type="text"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="amith@chatzzie.com"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <input
                type="password"
                required
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition cursor-pointer"
            >
              Sign In to Backoffice
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-slate-600 text-[11px]">
            Authorized personnel only • IP & session activity monitored
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between">
        <div>
          {/* Logo / Brand Header */}
          <div className="h-16 border-b border-slate-200 flex items-center px-6 gap-3 bg-blue-900">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight leading-none">Chatzie</h1>
              <span className="text-[11px] font-medium text-blue-200 tracking-wider uppercase">Admin Backoffice</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Management
            </div>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User / Session Info Footer */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-blue-800 text-white font-semibold flex items-center justify-center text-xs">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">amith@chatzzie.com</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] text-slate-500">Master Admin</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleAdminLogout}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Agora Signaling Node Connected</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              Role: Master Superadmin
            </div>
          </div>
        </header>

        {/* Screen Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
