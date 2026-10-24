'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  Phone,
  Video,
  Clock,
  Coins,
  ShieldCheck,
  PhoneOff,
  UserCheck,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { getApiBaseUrl } from '../apiConfig';

interface ActiveSession {
  id: string;
  channel: string;
  caller: string;
  listener: string;
  type: 'audio' | 'video';
  durationMins?: number;
  startedMinutesAgo?: number;
  ratePerMinINR?: number;
  ratePerMinCoins?: number;
  coinsBurned?: number;
  totalCoinsBurned?: number;
  status: 'active' | 'live' | 'terminated';
}

export default function LiveCallsPage() {
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: 'sess-1',
      channel: 'call_sonika_912',
      caller: 'Amit (u-amit)',
      listener: 'Sonika Verma (@sonika_912)',
      type: 'audio',
      startedMinutesAgo: 3,
      ratePerMinINR: 9,
      coinsBurned: 270,
      status: 'active',
    },
    {
      id: 'sess-2',
      channel: 'call_jyoti__1',
      caller: 'Rohan Sharma (u-rohan)',
      listener: 'Jyoti Sharma (@jyoti__1)',
      type: 'video',
      startedMinutesAgo: 7,
      ratePerMinINR: 30,
      coinsBurned: 2100,
      status: 'active',
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3500);
  };

  const fetchLiveSessions = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/admin/live-sessions`);
      if (res.ok) {
        const data = await res.json();
        if (data.activeSessions) {
          setSessions(data.activeSessions);
        }
      }
    } catch (e) {}
  };

  // Poll active sessions periodically
  useEffect(() => {
    fetchLiveSessions();
    const interval = setInterval(fetchLiveSessions, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleTerminate = async (sessionId: string, channelName: string) => {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/admin/live-sessions/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    } catch (e) {}

    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, status: 'terminated' } : s))
    );

    showToast(`Session ${channelName} forcefully disconnected.`);
  };

  const handleSimulate = async (type: 'audio' | 'video') => {
    setIsLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/admin/live-sessions/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.activeSessions) {
          setSessions(data.activeSessions);
        }
      }
    } catch (e) {
      const fallback: ActiveSession = {
        id: `sess-${Date.now()}`,
        channel: `call_${Date.now()}`,
        caller: 'Caller ' + Math.floor(100 + Math.random() * 900),
        listener: 'Sonika Verma (@sonika_912)',
        type,
        startedMinutesAgo: 1,
        ratePerMinINR: type === 'video' ? 30 : 9,
        coinsBurned: type === 'video' ? 300 : 90,
        status: 'active',
      };
      setSessions([fallback, ...sessions]);
    } finally {
      setIsLoading(false);
      showToast(`Simulated 1 new live ${type.toUpperCase()} call room!`);
    }
  };

  const liveSessions = sessions.filter(s => s.status === 'active' || s.status === 'live');

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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Real-Time WebRTC Sessions</h2>
          <p className="text-sm text-slate-500 mt-1">
            Live monitoring of ongoing Agora RTC voice and video channels with real-time coin burn counters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            {liveSessions.length} Active Channels
          </div>

          <button
            onClick={() => handleSimulate('audio')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" /> + Simulate Voice Call
          </button>

          <button
            onClick={() => handleSimulate('video')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" /> + Simulate Video Call
          </button>
        </div>
      </div>

      {/* Live Sessions Grid */}
      <div className="space-y-4">
        {sessions.map((sess) => {
          const isLive = sess.status === 'active' || sess.status === 'live';
          const duration = sess.durationMins || sess.startedMinutesAgo || 1;
          const rate = sess.ratePerMinINR || (sess.type === 'video' ? 30 : 9);
          const coins = sess.coinsBurned || sess.totalCoinsBurned || (duration * rate * 10);

          return (
            <div
              key={sess.id}
              className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${
                isLive ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Radio className="w-3 h-3" />
                      {isLive ? 'LIVE NOW' : 'TERMINATED'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        sess.type === 'video'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {sess.type === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                      {sess.type.toUpperCase()} CALL
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Room: {sess.channel}</span>
                  </div>

                  <div className="text-sm font-bold text-slate-900 flex items-center gap-3">
                    <span>
                      Caller: <span className="text-blue-600">{sess.caller}</span>
                    </span>
                    <span className="text-slate-300">➔</span>
                    <span>
                      Host: <span className="text-slate-800">{sess.listener}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-5 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Duration: ~{duration} minutes
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      Deduction Tariff: ₹{rate}/min ({rate * 10} coins/min)
                    </span>
                    <span className="flex items-center gap-1 font-medium text-emerald-600">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Listener Payout: ₹{(sess.type === 'video' ? 16 : 4.5).toFixed(2)}/min
                    </span>
                  </div>
                </div>

                {/* Live Coin Burn & Force Disconnect Action */}
                <div className="flex md:flex-col items-end justify-between md:justify-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-amber-600 font-black text-lg">
                      <Coins className="w-4 h-4 fill-amber-500" />
                      <span>{coins} Coins Burned</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Total Charged: ₹{(coins / 10).toFixed(2)}</p>
                  </div>

                  {isLive ? (
                    <button
                      onClick={() => handleTerminate(sess.id, sess.channel)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <PhoneOff className="w-3.5 h-3.5" /> Force Disconnect
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Room Closed</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
