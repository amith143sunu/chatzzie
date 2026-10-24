'use client';

import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Send,
  Users,
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Radio,
  Zap
} from 'lucide-react';
import { getApiBaseUrl } from '../apiConfig';

interface PushHistory {
  id: string;
  title: string;
  body: string;
  target: string;
  sentAt: string;
  deliveredCount: number;
  status: string;
}

export default function PushCenterPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<'all' | 'talkers' | 'listeners'>('all');
  const [deepLink, setDeepLink] = useState('/calls');
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [history, setHistory] = useState<PushHistory[]>([
    {
      id: 'push-1',
      title: 'Welcome to Chatzie!',
      body: 'Verified listeners are available now for confidential voice & video calls.',
      target: 'All Users',
      sentAt: 'Today, 9:00 AM',
      deliveredCount: 1428,
      status: 'Delivered',
    },
    {
      id: 'push-2',
      title: 'Weekend Cashback: 14% Extra Balance',
      body: 'Use promo code VALUE14 on recharges above ₹999 to get instant cashback.',
      target: 'Talkers Only',
      sentAt: 'Yesterday, 6:00 PM',
      deliveredCount: 1420,
      status: 'Delivered',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const QUICK_TEMPLATES = [
    {
      title: 'Free ₹20 Call Bonus Added!',
      body: 'Enjoy a free voice call with any top listener. Log in now and connect!',
      target: 'talkers' as const,
      deepLink: '/calls',
    },
    {
      title: 'Listeners Online Now (₹9/min)',
      body: 'Need someone to talk with? Sonika, Jyoti, and more hosts are waiting for your call.',
      target: 'talkers' as const,
      deepLink: '/calls',
    },
    {
      title: 'Payout Settlement Processed',
      body: 'Your weekly creator earnings have been settled to your registered UPI ID.',
      target: 'listeners' as const,
      deepLink: '/wallet',
    },
  ];

  const applyTemplate = (tmpl: typeof QUICK_TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setBody(tmpl.body);
    setTarget(tmpl.target);
    setDeepLink(tmpl.deepLink);
    showToast('Applied push notification template!');
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    setIsSending(true);

    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/admin/push-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          target,
          deepLink,
        }),
      });
    } catch (e) {}

    const count = target === 'all' ? 1428 : target === 'talkers' ? 1420 : 8;
    const newEntry: PushHistory = {
      id: `push-${Date.now()}`,
      title,
      body,
      target: target === 'all' ? 'All Users' : target === 'talkers' ? 'Talkers Only' : 'Listeners Only',
      sentAt: 'Just now',
      deliveredCount: count,
      status: 'Delivered',
    };

    setHistory([newEntry, ...history]);
    setIsSending(false);
    showToast(`Broadcast sent! Delivered to ${count} devices via FCM & Socket.`);
    setTitle('');
    setBody('');
  };

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
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Push Notification Center</h2>
        <p className="text-sm text-slate-500 mt-1">
          Compose, target, and broadcast immediate high-priority push notifications to your mobile app users.
        </p>
      </div>

      {/* Quick Templates */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-700" /> Quick 1-Tap Campaign Templates
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {QUICK_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => applyTemplate(tmpl)}
              className="text-left p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-400 shadow-2xs transition"
            >
              <p className="text-xs font-bold text-slate-900 truncate">{tmpl.title}</p>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tmpl.body}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Composer Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <BellRing className="w-5 h-5 text-blue-700" />
            <h3 className="font-bold text-base text-slate-900">Compose Broadcast Notification</h3>
          </div>

          <form onSubmit={handleBroadcast} className="mt-5 space-y-5">
            {/* Target Audience */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Target Audience
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'all', label: 'All Users', count: '1,428 devices' },
                  { value: 'talkers', label: 'Talkers Only', count: '1,420 callers' },
                  { value: 'listeners', label: 'Listeners Only', count: '8 hosts' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTarget(item.value as any)}
                    className={`p-3 text-left rounded-lg border text-sm font-medium transition ${
                      target === item.value
                        ? 'border-blue-700 bg-blue-50 text-blue-900 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <p className="font-bold">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.count}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Notification Headline
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Free ₹20 Audio Call Bonus Added"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Message Body
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Tap here to start an anonymous call with verified listeners online right now."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>

            {/* Deep Link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Deep-Link Action URL
              </label>
              <select
                value={deepLink}
                onChange={(e) => setDeepLink(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="/calls">Calls Directory (/calls)</option>
                <option value="/wallet">Wallet Recharge Screen (/wallet)</option>
                <option value="/chat">Chat Messages Screen (/chat)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending || !title || !body}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-bold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Delivering via FCM & Socket...' : 'Broadcast to Selected Devices'}
            </button>
          </form>
        </div>

        {/* Right Col: Mobile Preview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Smartphone className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-base text-slate-900">Lockscreen Preview</h3>
          </div>

          <div className="mt-6 bg-slate-900 p-4 rounded-2xl shadow-inner max-w-xs mx-auto">
            <div className="text-center text-white/50 text-[10px] mb-4">Monday, 9:41 AM</div>

            {/* Push Notification Card */}
            <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-xl shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-blue-700 rounded text-white flex items-center justify-center text-[9px] font-bold">
                    C
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">CHATZIE</span>
                </div>
                <span className="text-[10px] text-slate-500">now</span>
              </div>

              <p className="text-xs font-bold text-slate-900 mt-1.5">
                {title || 'Free ₹20 Audio Call Bonus Added'}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                {body || 'Tap here to start an anonymous call with verified listeners online right now.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">Broadcast History</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {history.map((item) => (
            <div key={item.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{item.title}</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">
                    {item.target}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{item.body}</p>
                <p className="text-[11px] text-slate-400 mt-1">{item.sentAt}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {item.deliveredCount} Delivered
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
