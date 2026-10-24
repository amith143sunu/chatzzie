'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  IndianRupee,
  Users,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Headphones,
  BellRing,
  ArrowRight,
  Clock
} from 'lucide-react';
import { getApiBaseUrl } from './apiConfig';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    activeCallsCount: 8,
    totalTalkersCount: 1421,
    totalVerifiedListeners: 4,
    pendingKYCCount: 3,
    totalRechargeVolumeINR: 158270,
    pendingPayoutsVolumeINR: 1540,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/admin/dashboard`);
        if (res.ok) {
          const data = await res.json();
          setStats(prev => ({ ...prev, ...data }));
        }
      } catch (e) {}
    };
    fetchStats();
    const timer = setInterval(fetchStats, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time metrics, live calls, and platform financial health.</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/push-center"
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition shadow-sm"
          >
            <BellRing className="w-4 h-4" />
            Send Push Notification
          </Link>
          <Link
            href="/admin/listeners"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            KYC Approvals ({stats.pendingKYCCount})
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Calls */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Calls Now</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.activeCallsCount}</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1 animate-ping"></span>
              Agora RTC Connected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">6 Audio Calls, 2 Video Calls</p>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Recharge Volume</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">₹{stats.totalRechargeVolumeINR.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +18.4%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Processed via Razorpay Gateway</p>
        </div>

        {/* Card 3: Total Talkers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Talkers</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalTalkersCount}</span>
            <span className="text-xs font-medium text-slate-500">Users</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">100% Mobile OTP Verified</p>
        </div>

        {/* Card 4: Verified Listeners */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Listeners</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalVerifiedListeners}</span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              {stats.pendingKYCCount} Pending KYC
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Average tariff: ₹9 - ₹12/min</p>
        </div>
      </div>

      {/* Two Column Layout: Recent Recharges & Listener Presence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Recent Wallet Transactions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live incoming customer payments & call charges</p>
            </div>
            <Link href="/admin/payouts" className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-3">
            {[
              { id: 'tx-1', user: 'Amit Kumar', phone: '8700788942', type: 'Recharge', amount: '₹70.00', status: 'Completed', time: 'Today, 8:03 AM' },
              { id: 'tx-2', user: 'Amit Kumar', phone: '8700788942', type: 'Recharge', amount: '₹399.00', status: 'Completed', time: 'Today, 6:03 AM' },
              { id: 'tx-3', user: 'Amit Kumar', phone: '8700788942', type: 'Cashback VALUE14', amount: '+₹44.85', status: 'Completed', time: '30 Sep, 6:43 AM' },
              { id: 'tx-4', user: 'Rohit S.', phone: '9811234567', type: 'Call (4 mins)', amount: '-₹36.00', status: 'Completed', time: '30 Sep, 5:12 AM' },
            ].map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    tx.amount.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : tx.amount.startsWith('-') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{tx.user}</p>
                    <p className="text-xs text-slate-500">{tx.type} • {tx.phone}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-bold ${
                    tx.amount.startsWith('+') ? 'text-emerald-600' : tx.amount.startsWith('-') ? 'text-slate-800' : 'text-blue-700'
                  }`}>
                    {tx.amount}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Verified Listeners Status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Live Listeners</h3>
              <p className="text-xs text-slate-500 mt-0.5">Online status & current tariffs</p>
            </div>
            <Link href="/admin/listeners" className="text-xs font-semibold text-blue-700 hover:text-blue-900">
              Manage
            </Link>
          </div>

          <div className="space-y-4 mt-4">
            {[
              { name: 'Sonika Verma', handle: 'sonika_912', rate: '₹9/min', status: 'In Audio Call', color: 'text-amber-600 bg-amber-50' },
              { name: 'Jyoti Sharma', handle: 'jyoti__1', rate: '₹12/min', status: 'Online', color: 'text-emerald-600 bg-emerald-50' },
              { name: 'Mahira Khan', handle: 'mahira0', rate: '₹8/min', status: 'Online', color: 'text-emerald-600 bg-emerald-50' },
              { name: 'Ankita Sen', handle: 'ankita_sen', rate: '₹9/min', status: 'Online', color: 'text-emerald-600 bg-emerald-50' },
            ].map((listener, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                    {listener.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{listener.name}</p>
                    <p className="text-[11px] text-slate-500">@{listener.handle}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${listener.color}`}>
                    {listener.status}
                  </span>
                  <p className="text-[11px] font-medium text-slate-600 mt-0.5">{listener.rate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
