'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  IndianRupee,
  PlusCircle,
  MinusCircle,
  Ban,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  RefreshCw,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { getApiBaseUrl } from '../apiConfig';

interface AdminUser {
  id: string;
  phone: string;
  name: string;
  avatarUrl: string;
  walletBalanceINR: number;
  role: 'talker' | 'listener';
  isListenerVerified: boolean;
  preferredLanguages: string[];
  isBanned?: boolean;
  createdAt: string;
}

const INITIAL_USERS: AdminUser[] = [
  {
    id: 'u-amit',
    phone: '8700788942',
    name: 'Amit Kumar',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    walletBalanceINR: 120.00,
    role: 'talker',
    isListenerVerified: false,
    preferredLanguages: ['Hindi', 'English'],
    isBanned: false,
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'u-rohit',
    phone: '9811234567',
    name: 'Rohit Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    walletBalanceINR: 240.50,
    role: 'talker',
    isListenerVerified: false,
    preferredLanguages: ['Hindi'],
    isBanned: false,
    createdAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'u-priya',
    phone: '9899887766',
    name: 'Priya Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    walletBalanceINR: 42.00,
    role: 'talker',
    isListenerVerified: false,
    preferredLanguages: ['Gujarati', 'Hindi'],
    isBanned: false,
    createdAt: '2026-09-20T12:00:00Z',
  },
];

export default function UsersDirectoryPage() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Live fetch from backend
  const fetchLiveUsers = async () => {
    setIsLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/admin/users`);
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
        }
      }
    } catch (e) {
      console.warn('Backend sync notice (using local state):', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveUsers();
  }, []);

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustAmount) return;

    const delta = parseFloat(adjustAmount) * (adjustType === 'credit' ? 1 : -1);
    const amountVal = parseFloat(adjustAmount);

    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/admin/users/adjust-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          deltaINR: delta,
          description: `Admin manual adjustment (${adjustType === 'credit' ? '+' : '-'}₹${amountVal})`,
        }),
      });
    } catch (e) {}

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === selectedUser.id) {
          const newBal = Math.max(0, Number((u.walletBalanceINR + delta).toFixed(2)));
          return { ...u, walletBalanceINR: newBal };
        }
        return u;
      })
    );

    showToast(
      `Wallet for ${selectedUser.name} ${adjustType === 'credit' ? 'credited with' : 'debited by'} ₹${amountVal.toFixed(2)}`
    );
    setSelectedUser(null);
    setAdjustAmount('');
  };

  const handleQuickCredit = async (user: AdminUser, amount: number) => {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/admin/users/adjust-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          deltaINR: amount,
          description: `Quick Admin top-up (+₹${amount})`,
        }),
      });
    } catch (e) {}

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === user.id) {
          return { ...u, walletBalanceINR: Number((u.walletBalanceINR + amount).toFixed(2)) };
        }
        return u;
      })
    );

    showToast(`Quick +₹${amount} added to ${user.name}'s wallet`);
  };

  const handleToggleBan = async (user: AdminUser) => {
    const nextBan = !user.isBanned;

    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/admin/users/${user.id}/ban`, {
        method: 'POST',
      });
    } catch (e) {}

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === user.id) {
          return { ...u, isBanned: nextBan };
        }
        return u;
      })
    );

    showToast(`${user.name} has been ${nextBan ? 'BANNED' : 'UNBANNED & RESTORED'}`);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      {/* Real-time Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Talkers Directory</h2>
          <p className="text-sm text-slate-500 mt-1">
            Search registered talkers, view active wallet balances, and credit/debit test funds in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLiveUsers}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
            title="Refresh Live Users"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Search */}
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-600 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">User</th>
              <th className="py-3.5 px-4">Mobile Number</th>
              <th className="py-3.5 px-4">Wallet Balance</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Languages</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className={`hover:bg-slate-50 transition ${
                  user.isBanned ? 'bg-red-50/40 opacity-75' : ''
                }`}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        {user.name}
                        {user.isBanned && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                            Banned
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">{user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 font-mono text-xs text-slate-700 font-medium">
                  +91 {user.phone}
                </td>
                <td className="py-4 px-4">
                  <span className="font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md text-sm border border-blue-100">
                    ₹{user.walletBalanceINR.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {user.isBanned ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                      <Ban className="w-3 h-3" /> Suspended
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> Active
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 text-xs text-slate-600">
                  {user.preferredLanguages.join(', ')}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleQuickCredit(user, 50)}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition shadow-2xs"
                      title="Add ₹50 immediately"
                    >
                      +₹50
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setAdjustType('credit');
                      }}
                      className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition shadow-2xs"
                    >
                      Adjust
                    </button>
                    <button
                      onClick={() => handleToggleBan(user)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition shadow-2xs border ${
                        user.isBanned
                          ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {user.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adjust Balance Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-lg text-slate-900">Adjust Wallet Balance</h3>
            <p className="text-xs text-slate-500 mt-1">
              Modifying balance for <strong>{selectedUser.name}</strong> (+91 {selectedUser.phone}). Current Balance: <span className="font-bold text-blue-700">₹{selectedUser.walletBalanceINR.toFixed(2)}</span>
            </p>

            <form onSubmit={handleAdjustBalance} className="mt-4 space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    adjustType === 'credit'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" /> Credit (Add Money)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('debit')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    adjustType === 'debit'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <MinusCircle className="w-4 h-4" /> Debit (Deduct)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Amount in INR (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 50"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600 shadow-2xs"
                  autoFocus
                />
              </div>

              {/* Quick Select Buttons */}
              <div className="flex gap-2">
                {[10, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAdjustAmount(amt.toString())}
                    className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition shadow-sm"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
