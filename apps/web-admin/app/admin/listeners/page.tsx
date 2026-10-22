'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Headphones,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  FileText,
  Star,
  ShieldCheck,
  Search,
  IndianRupee,
  Video,
  Volume2,
  Edit2,
  Ban,
  RefreshCw,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { ListenerProfile } from '@chatzie/shared';

const INITIAL_LISTENERS: ListenerProfile[] = [
  {
    id: 'list-1',
    userId: 'u-sonika',
    username: 'sonika_912',
    name: 'Sonika Verma',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Professional emotional wellness mentor. Here to listen to your stories and guide you through stress.',
    languages: ['Hindi'],
    callRatePerMinINR: 9,
    isVideoEnabled: false,
    status: 'online',
    rating: 4.8,
    totalReviews: 142,
    followersCount: 389,
    giftsCount: 24,
    voiceBioUrl: 'https://actions.google.com/sounds/v1/speech/voice_intro_1.mp3',
    voiceBioDurationSeconds: 18,
    kycStatus: 'verified',
    panNumber: 'ABCDE1234F',
    upiId: 'sonika@okaxis',
    isAvailableForCalls: true,
  },
  {
    id: 'list-2',
    userId: 'u-jyoti',
    username: 'jyoti__1',
    name: 'Jyoti Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Looking for thoughtful, deep discussions. Available for both voice and high-definition video calls.',
    languages: ['Hindi', 'English'],
    callRatePerMinINR: 9,
    isVideoEnabled: true,
    status: 'online',
    rating: 4.9,
    totalReviews: 298,
    followersCount: 820,
    giftsCount: 65,
    voiceBioUrl: 'https://actions.google.com/sounds/v1/speech/voice_intro_2.mp3',
    voiceBioDurationSeconds: 22,
    kycStatus: 'verified',
    panNumber: 'FGHIJ5678K',
    upiId: 'jyoti@oksbi',
    isAvailableForCalls: true,
  },
  {
    id: 'list-3',
    userId: 'u-mahira',
    username: 'mahira0',
    name: 'Mahira Khan',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    bio: 'A compassionate listener who understands relationship dilemmas and midnight overthinking.',
    languages: ['Hindi', 'Bhojpuri'],
    callRatePerMinINR: 9,
    isVideoEnabled: false,
    status: 'online',
    rating: 4.7,
    totalReviews: 89,
    followersCount: 215,
    giftsCount: 12,
    voiceBioUrl: 'https://actions.google.com/sounds/v1/speech/voice_intro_3.mp3',
    voiceBioDurationSeconds: 15,
    kycStatus: 'verified',
    panNumber: 'KLMNO9012P',
    upiId: 'mahira@paytm',
    isAvailableForCalls: true,
  },
  {
    id: 'list-4',
    userId: 'u-ankita',
    username: 'ankita_sen',
    name: 'Ankita Sen',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'I am looking forward to making new friends and learning new things here. Always positive and calm.',
    languages: ['Hindi', 'English'],
    callRatePerMinINR: 9,
    isVideoEnabled: true,
    status: 'online',
    rating: 5.0,
    totalReviews: 310,
    followersCount: 242,
    giftsCount: 18,
    voiceBioUrl: 'https://actions.google.com/sounds/v1/speech/voice_intro_4.mp3',
    voiceBioDurationSeconds: 25,
    kycStatus: 'verified',
    panNumber: 'PQRST3456U',
    upiId: 'ankita@ybl',
    isAvailableForCalls: true,
  }
];

export default function ListenersKYCPage() {
  const [listeners, setListeners] = useState<ListenerProfile[]>(INITIAL_LISTENERS);
  const [activeTab, setActiveTab] = useState<'verified' | 'pending'>('verified');
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingListener, setEditingListener] = useState<ListenerProfile | null>(null);
  const [newTariff, setNewTariff] = useState<string>('9');

  const audioCtxRef = useRef<any>(null);

  const [pendingApplications, setPendingApplications] = useState([
    {
      id: 'app-1',
      name: 'Pooja Kashyap',
      username: 'pooja_talks',
      phone: '9876543210',
      languages: ['Hindi', 'English'],
      ratePerMinINR: 9,
      isVideoEnabled: true,
      bio: 'Post-graduate in psychology with 2 years of active empathetic counseling experience.',
      panNumber: 'ABCDE9876Z',
      voiceBioDurationSeconds: 24,
      appliedAt: '2 hours ago',
    },
    {
      id: 'app-2',
      name: 'Riya Malhotra',
      username: 'riya_vibes',
      phone: '9123456780',
      languages: ['Hindi', 'Punjabi'],
      ratePerMinINR: 9,
      isVideoEnabled: false,
      bio: 'Friendly conversationalist, passionate about music, daily talks, and easing evening stress.',
      panNumber: 'MNOPQ5432K',
      voiceBioDurationSeconds: 19,
      appliedAt: 'Yesterday',
    }
  ]);

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

  const playVoiceIntroSample = (id: string) => {
    if (isPlayingAudio === id) {
      setIsPlayingAudio(null);
      return;
    }

    setIsPlayingAudio(id);

    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      }
    } catch (e) {}

    setTimeout(() => {
      setIsPlayingAudio((prev) => (prev === id ? null : prev));
    }, 2500);
  };

  const handleApprove = async (appId: string) => {
    const app = pendingApplications.find(a => a.id === appId);
    if (!app) return;

    try {
      await fetch(`http://${getBackendHost()}:8682/api/admin/kyc-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listenerId: appId, action: 'approve' }),
      });
    } catch (e) {}

    const newListener: ListenerProfile = {
      id: `list-${Date.now()}`,
      userId: `u-${Date.now()}`,
      username: app.username,
      name: app.name,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      bio: app.bio,
      languages: app.languages,
      callRatePerMinINR: app.ratePerMinINR,
      isVideoEnabled: app.isVideoEnabled,
      status: 'online',
      rating: 5.0,
      totalReviews: 0,
      followersCount: 0,
      giftsCount: 0,
      voiceBioUrl: 'https://actions.google.com/sounds/v1/speech/voice_intro_1.mp3',
      voiceBioDurationSeconds: app.voiceBioDurationSeconds,
      kycStatus: 'verified',
      panNumber: app.panNumber,
      isAvailableForCalls: true,
    };

    setListeners([newListener, ...listeners]);
    setPendingApplications(pendingApplications.filter(a => a.id !== appId));
    showToast(`Approved & Activated @${app.username} (${app.name})! Now discoverable on mobile.`);
  };

  const handleReject = async (appId: string) => {
    const app = pendingApplications.find(a => a.id === appId);
    if (!app) return;

    try {
      await fetch(`http://${getBackendHost()}:8682/api/admin/kyc-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listenerId: appId, action: 'reject' }),
      });
    } catch (e) {}

    setPendingApplications(pendingApplications.filter(a => a.id !== appId));
    showToast(`Application for @${app.username} rejected.`);
  };

  const handleToggleSuspend = async (listener: ListenerProfile) => {
    const nextSuspended = listener.isAvailableForCalls; // toggle

    try {
      await fetch(`http://${getBackendHost()}:8682/api/admin/listeners/${listener.id}/suspend`, {
        method: 'POST',
      });
    } catch (e) {}

    setListeners(prev =>
      prev.map(l => {
        if (l.id === listener.id) {
          return {
            ...l,
            isAvailableForCalls: !nextSuspended,
            status: !nextSuspended ? 'online' : 'offline',
          };
        }
        return l;
      })
    );

    showToast(
      `${listener.name} (@${listener.username}) has been ${nextSuspended ? 'SUSPENDED' : 'RESTORED to Online'}`
    );
  };

  const handleSaveTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListener) return;

    const rate = parseFloat(newTariff);
    try {
      await fetch(`http://${getBackendHost()}:8682/api/admin/listeners/${editingListener.id}/tariff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratePerMinINR: rate }),
      });
    } catch (e) {}

    setListeners(prev =>
      prev.map(l => {
        if (l.id === editingListener.id) {
          return { ...l, callRatePerMinINR: rate };
        }
        return l;
      })
    );

    showToast(`Updated rate for ${editingListener.name} to ₹${rate}/min`);
    setEditingListener(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Listeners & KYC Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            Review voice intros, verify government PAN documents, and edit live tariffs in real time.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-200/80 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
              activeTab === 'verified'
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verified Listeners ({listeners.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Review
            {pendingApplications.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            )}
            ({pendingApplications.length})
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        /* PENDING KYC REVIEW QUEUE */
        <div className="space-y-4">
          {pendingApplications.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">All KYC Applications Reviewed</h3>
              <p className="text-xs text-slate-500 mt-1">There are no pending listener submissions waiting for review.</p>
            </div>
          ) : (
            pendingApplications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-base font-bold shrink-0">
                      {app.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">{app.name}</h4>
                        <span className="text-xs text-slate-500 font-mono">@{app.username}</span>
                        <span className="text-[11px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-semibold">
                          Submitted {app.appliedAt}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 max-w-2xl">{app.bio}</p>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                        <span><strong>Phone:</strong> {app.phone}</span>
                        <span><strong>Languages:</strong> {app.languages.join(', ')}</span>
                        <span><strong>PAN:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">{app.panNumber}</code></span>
                        <span><strong>Requested Rate:</strong> ₹{app.ratePerMinINR}/min Voice</span>
                        {app.isVideoEnabled && (
                          <span className="flex items-center gap-1 text-blue-700 font-semibold">
                            <Video className="w-3.5 h-3.5" /> Video Call Ready (₹30/min)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-start">
                    <button
                      onClick={() => handleReject(app.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 border border-red-300 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition shadow-2xs"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(app.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve & Activate
                    </button>
                  </div>
                </div>

                {/* Voice Bio Review Player */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => playVoiceIntroSample(app.id)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-xs ${
                        isPlayingAudio === app.id
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-blue-700 text-white hover:bg-blue-800'
                      }`}
                    >
                      {isPlayingAudio === app.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {isPlayingAudio === app.id ? 'Playing Voice Introduction Preview...' : 'Listen to Voice Bio Sample'}
                      </p>
                      <p className="text-[11px] text-slate-400">Duration: {app.voiceBioDurationSeconds}s • Tone: Warm & Friendly</p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-500">HD Audio Sample</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* VERIFIED LISTENERS DIRECTORY */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Listener</th>
                <th className="py-3.5 px-4">Languages</th>
                <th className="py-3.5 px-4">Call Tariff</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Voice Bio</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {listeners.map((listener) => {
                const isSuspended = !listener.isAvailableForCalls;
                return (
                  <tr
                    key={listener.id}
                    className={`hover:bg-slate-50 transition ${
                      isSuspended ? 'bg-red-50/30 opacity-70' : ''
                    }`}
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={listener.avatarUrl}
                          alt={listener.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900">{listener.name}</p>
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <p className="text-xs text-slate-500 font-mono">@{listener.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {listener.languages.join(', ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded text-xs">
                          ₹{listener.callRatePerMinINR}/min Voice
                        </span>
                        {listener.isVideoEnabled && (
                          <p className="text-[11px] text-purple-700 font-semibold mt-0.5">
                            ₹30/min Video
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{listener.rating}</span>
                        <span className="text-slate-400 font-normal">({listener.totalReviews})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {isSuspended ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <Ban className="w-3 h-3" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Online
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => playVoiceIntroSample(listener.id)}
                        className={`p-1.5 rounded-full text-xs font-semibold transition ${
                          isPlayingAudio === listener.id
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title="Listen to Voice Intro"
                      >
                        {isPlayingAudio === listener.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingListener(listener);
                            setNewTariff(listener.callRatePerMinINR.toString());
                          }}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition shadow-2xs"
                        >
                          Edit Tariff
                        </button>
                        <button
                          onClick={() => handleToggleSuspend(listener)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-2xs border ${
                            isSuspended
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Tariff Modal */}
      {editingListener && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-lg text-slate-900">Edit Voice Call Tariff</h3>
            <p className="text-xs text-slate-500 mt-1">
              Adjust tariff for <strong>{editingListener.name}</strong> (@{editingListener.username}).
            </p>

            <form onSubmit={handleSaveTariff} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Voice Rate (₹ / minute)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={newTariff}
                  onChange={(e) => setNewTariff(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600 shadow-2xs"
                  autoFocus
                />
              </div>

              {/* Standard Platform Presets */}
              <div className="flex gap-2">
                {[9, 12, 15, 20].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setNewTariff(rate.toString())}
                    className={`flex-1 py-1 rounded text-xs font-bold transition ${
                      newTariff === rate.toString()
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    ₹{rate}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingListener(null)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition shadow-sm"
                >
                  Save Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
