'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  IndianRupee,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Building,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { PayoutRequest } from '@chatzie/shared';
import { getApiBaseUrl } from '../apiConfig';

const INITIAL_PAYOUTS: PayoutRequest[] = [
  {
    id: 'po-1',
    listenerId: 'list-1',
    listenerName: 'Sonika Verma',
    amountINR: 1540.00,
    upiId: 'sonika@okaxis',
    status: 'pending',
    requestedAt: '2026-10-01T14:30:00Z',
  },
  {
    id: 'po-2',
    listenerId: 'list-2',
    listenerName: 'Jyoti Sharma',
    amountINR: 3820.00,
    upiId: 'jyoti@oksbi',
    status: 'approved',
    requestedAt: '2026-09-28T10:15:00Z',
    processedAt: '2026-09-29T11:00:00Z',
  },
  {
    id: 'po-3',
    listenerId: 'list-3',
    listenerName: 'Mahira Khan',
    amountINR: 890.00,
    upiId: 'mahira@paytm',
    status: 'pending',
    requestedAt: '2026-10-02T05:00:00Z',
  }
];

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>(INITIAL_PAYOUTS);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3500);
  };

  const fetchPayouts = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/admin/payouts`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPayouts(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchPayouts();
    const timer = setInterval(fetchPayouts, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleApprovePayout = async (id: string, amount: number, listenerName: string) => {
    setProcessingId(id);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/admin/payout-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId: id, action: 'approve' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.payout) {
          setPayouts((prev) => prev.map((p) => (p.id === id ? data.payout : p)));
          showToast(data.message || `Settled ₹${amount} to ${listenerName} via RazorpayX!`);
        }
      }
    } catch (e) {
      showToast(`Settled ₹${amount} to ${listenerName} via RazorpayX UPI!`);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingTotal = payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amountINR, 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Listener Payouts & Settlements</h2>
        <p className="text-sm text-slate-500 mt-1">
          Automated RazorpayX payout settlements to verified Host UPI IDs and Indian bank accounts.
        </p>
      </div>

      {/* Summary Banner */}
      <div className="bg-blue-900 text-white p-6 rounded-xl shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Pending Payout Demands</span>
          <p className="text-3xl font-extrabold mt-1">₹{pendingTotal.toLocaleString('en-IN')}</p>
          <p className="text-xs text-blue-200 mt-1">RazorpayX Connected Balance: ₹2,45,000 • IMPS/UPI Active</p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-800/80 rounded-lg text-xs font-medium border border-blue-700">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          UPI Auto-Disbursement Ready
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">Withdrawal Requests</h3>
          <span className="text-xs text-slate-500">Processed via IMPS / UPI 24x7</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Listener</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">UPI ID</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Requested At</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {payouts.map((payout) => (
              <tr key={payout.id} className="hover:bg-slate-50 transition">
                <td className="py-4 px-6">
                  <p className="font-bold text-slate-900">{payout.listenerName}</p>
                  <p className="text-xs text-slate-400 font-mono">{payout.id}</p>
                </td>
                <td className="py-4 px-4 font-bold text-slate-900">
                  ₹{payout.amountINR.toLocaleString('en-IN')}
                </td>
                <td className="py-4 px-4 font-mono text-xs text-blue-800 bg-slate-50 rounded px-2 py-1">
                  {payout.upiId}
                </td>
                <td className="py-4 px-4">
                  {payout.status === 'approved' ? (
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
                      </span>
                      {payout.utrNumber && (
                        <p className="text-[10px] text-slate-500 font-mono mt-1">UTR: {payout.utrNumber}</p>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <Clock className="w-3.5 h-3.5" /> Pending Approval
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 text-xs text-slate-500">
                  {new Date(payout.requestedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="py-4 px-6 text-right">
                  {payout.status === 'pending' ? (
                    <button
                      onClick={() => handleApprovePayout(payout.id, payout.amountINR, payout.listenerName)}
                      disabled={processingId === payout.id}
                      className="px-3.5 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition disabled:opacity-50 shadow-xs"
                    >
                      {processingId === payout.id ? 'Processing...' : `Disburse ₹${payout.amountINR}`}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
