'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  UserX,
  Radio,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Ban,
  Bell
} from 'lucide-react';

interface ReportItem {
  id: string;
  reporterId: string;
  targetUsername: string;
  reason: string;
  channelName: string;
  durationSeconds: number;
  status: 'pending' | 'resolved' | 'dismissed';
  actionTaken?: string;
  createdAt: string;
}

export default function ModerationReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([
    {
      id: 'rep-1',
      reporterId: 'u-amit',
      targetUsername: 'unknown_caller_98',
      reason: 'Demanding Personal Phone / Social Media',
      channelName: 'call_sonika_912',
      durationSeconds: 42,
      status: 'pending',
      createdAt: '15 mins ago',
    },
    {
      id: 'rep-2',
      reporterId: 'u-sonika',
      targetUsername: 'user_temp_482',
      reason: 'Harassment or Abusive Conduct',
      channelName: 'call_sonika_912',
      durationSeconds: 18,
      status: 'pending',
      createdAt: '1 hour ago',
    },
    {
      id: 'rep-3',
      reporterId: 'u-jyoti',
      targetUsername: 'guest_talker_19',
      reason: 'Explicit or Inappropriate Content',
      channelName: 'call_jyoti__1',
      durationSeconds: 9,
      status: 'resolved',
      actionTaken: 'Device Banned',
      createdAt: 'Yesterday',
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3500);
  };

  const getBackendHost = () => {
    if (typeof window !== 'undefined' && window.location.hostname) {
      return window.location.hostname;
    }
    return 'localhost';
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`http://${getBackendHost()}:8682/api/admin/reports`);
      if (res.ok) {
        const data = await res.json();
        if (data.reports && data.reports.length > 0) {
          setReports(data.reports);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (reportId: string, action: 'ban' | 'warn' | 'dismiss') => {
    try {
      await fetch(`http://${getBackendHost()}:8682/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
    } catch (e) {}

    const actionText = action === 'ban' ? 'Device Banned' : action === 'warn' ? 'Official Warning Sent' : 'Dismissed';

    setReports(reports.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: action === 'dismiss' ? 'dismissed' : 'resolved',
          actionTaken: actionText,
        };
      }
      return r;
    }));

    showToast(`Report #${reportId}: ${actionText}!`);
  };

  const filtered = reports.filter(r => {
    if (activeFilter === 'pending') return r.status === 'pending';
    if (activeFilter === 'resolved') return r.status !== 'pending';
    return true;
  });

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Safety & Moderation Flags</h2>
          <p className="text-sm text-slate-500 mt-1">
            Review in-call harassment and policy violations submitted by Callers and Listeners.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-200/80 p-1 rounded-lg">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                activeFilter === 'all'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Flags ({reports.length})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'pending'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending
              {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
              ({pendingCount})
            </button>
            <button
              onClick={() => setActiveFilter('resolved')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                activeFilter === 'resolved'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved ({reports.length - pendingCount})
            </button>
          </div>

          <button
            onClick={fetchReports}
            className="p-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 shadow-2xs"
            title="Refresh Reports"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Reports in this View</h3>
            <p className="text-xs text-slate-500 mt-1">Platform moderation queue is clear.</p>
          </div>
        ) : (
          filtered.map((rep) => {
            const isPending = rep.status === 'pending';
            return (
              <div
                key={rep.id}
                className={`bg-white border rounded-xl p-5 shadow-sm transition ${
                  isPending ? 'border-red-200 ring-1 ring-red-50' : 'border-slate-200 opacity-80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          isPending ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isPending ? 'PENDING INVESTIGATION' : rep.actionTaken || 'RESOLVED'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: {rep.id}</span>
                      <span className="text-xs text-slate-400">• {rep.createdAt}</span>
                    </div>

                    <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{rep.reason}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>Reported User: <strong className="text-red-700">@{rep.targetUsername}</strong></span>
                      <span>Reporter: <strong className="text-blue-700">{rep.reporterId}</strong></span>
                      <span>Channel: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">{rep.channelName}</code></span>
                      <span>In-Call Duration: {rep.durationSeconds}s</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isPending ? (
                    <div className="flex items-center gap-2 self-end md:self-start">
                      <button
                        onClick={() => handleAction(rep.id, 'dismiss')}
                        className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition shadow-2xs"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleAction(rep.id, 'warn')}
                        className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                      >
                        <Bell className="w-3.5 h-3.5" /> Warn User
                      </button>
                      <button
                        onClick={() => handleAction(rep.id, 'ban')}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <Ban className="w-3.5 h-3.5" /> Ban Device
                      </button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Resolved ({rep.actionTaken})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
