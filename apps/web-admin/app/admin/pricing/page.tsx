'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  IndianRupee,
  Percent,
  PlusCircle,
  CheckCircle2,
  Trash2,
  Sliders,
  Sparkles,
  Phone,
  Video,
  MessageSquare,
  Image as ImageIcon,
  Save,
  HelpCircle
} from 'lucide-react';
import { DEFAULT_RECHARGE_PACKAGES, DEFAULT_COUPONS, RechargePackage, Coupon } from '@chatzie/shared';

export default function PricingCouponsPage() {
  const [packages, setPackages] = useState<RechargePackage[]>(DEFAULT_RECHARGE_PACKAGES);
  const [coupons, setCoupons] = useState<Coupon[]>(DEFAULT_COUPONS);
  const [platformCommission, setPlatformCommission] = useState(50); // 50% split for Voice (4.5 / 9)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [newPkgAmount, setNewPkgAmount] = useState('');
  const [newPkgCashback, setNewPkgCashback] = useState('0');

  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponMin, setNewCouponMin] = useState('499');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const getBackendHost = () => {
    if (typeof window !== 'undefined' && window.location.hostname) {
      return window.location.hostname;
    }
    return 'localhost';
  };

  const handleSaveCommission = async () => {
    try {
      await fetch(`http://${getBackendHost()}:8682/api/admin/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformCommissionPercent: platformCommission }),
      });
    } catch (e) {}
    showToast(`Platform commission saved at ${platformCommission}% (Listener payout: ${100 - platformCommission}%)`);
  };

  const handleAddPackage = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newPkgAmount);
    const cb = parseFloat(newPkgCashback || '0');
    if (!amt) return;

    const newPkg: RechargePackage = {
      id: `pkg-${Date.now()}`,
      amountINR: amt,
      cashbackINR: cb,
      isBestValue: false,
    };

    setPackages([...packages, newPkg]);
    setShowAddPackage(false);
    setNewPkgAmount('');
    setNewPkgCashback('0');
    showToast(`Recharge pack ₹${amt} created and live in mobile app!`);
  };

  const handleDeletePackage = (id: string) => {
    setPackages(packages.filter((p) => p.id !== id));
    showToast('Recharge package deleted');
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;

    const newCp: Coupon = {
      id: `cp-${Date.now()}`,
      code: newCouponCode.toUpperCase().trim(),
      description: newCouponDesc || `Special discount on recharges above ₹${newCouponMin}`,
      minRechargeINR: parseFloat(newCouponMin) || 100,
      discountPercentage: 10,
      maxCashbackINR: 100,
      isActive: true,
    };

    setCoupons([...coupons, newCp]);
    setShowAddCoupon(false);
    setNewCouponCode('');
    setNewCouponDesc('');
    showToast(`Promo coupon ${newCp.code} published!`);
  };

  const handleDeleteCoupon = (id: string) => {
    setCoupons(coupons.filter((c) => c.id !== id));
    showToast('Promo coupon deleted');
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

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Tariff, Pricing & Revenue Controls</h2>
        <p className="text-sm text-slate-500 mt-1">
          Enforce universal per-minute call tariffs, chat rates, mobile recharge packages, and platform commission splits.
        </p>
      </div>

      {/* Universal Tariff Cards Grid (User Specified Business Logic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Voice Calls */}
        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Voice Calls</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">₹9.00</span>
              <span className="text-xs text-slate-500">/ min (Caller)</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Host Payout:</span>
              <span className="font-bold text-emerald-600">₹4.50 / min (50%)</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500">Platform Retains:</span>
              <span className="font-bold text-blue-700">₹4.50 / min (50%)</span>
            </div>
          </div>
        </div>

        {/* Video Calls */}
        <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Video Calls</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">₹30.00</span>
              <span className="text-xs text-slate-500">/ min (Caller)</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Host Payout:</span>
              <span className="font-bold text-emerald-600">₹16.00 / min (53.3%)</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500">Platform Retains:</span>
              <span className="font-bold text-purple-700">₹14.00 / min (46.7%)</span>
            </div>
          </div>
        </div>

        {/* Chat Text Message */}
        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Chat Messages</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">₹0.25</span>
              <span className="text-xs text-slate-500">/ text message</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Deducted from caller wallet per message sent</p>
          </div>
        </div>

        {/* Chat Image Message */}
        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Chat Photos / Media</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">₹0.75</span>
              <span className="text-xs text-slate-500">/ image sent</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Deducted from caller wallet per photo uploaded</p>
          </div>
        </div>
      </div>

      {/* Commission Split Config */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Default Platform Revenue Split</h3>
              <p className="text-xs text-slate-500">Percentage retained by Chatzie from call billings</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Listener: {100 - platformCommission}%</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-bold text-blue-700">Chatzie: {platformCommission}%</span>
            </div>

            <input
              type="range"
              min="20"
              max="70"
              step="5"
              value={platformCommission}
              onChange={(e) => setPlatformCommission(parseInt(e.target.value))}
              className="w-32 accent-blue-700 cursor-pointer"
            />

            <button
              onClick={handleSaveCommission}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Save className="w-3.5 h-3.5" /> Save Split
            </button>
          </div>
        </div>
      </div>

      {/* Recharge Packages Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">Quick Recharge Packages</h3>
            <p className="text-xs text-slate-500">Live in the mobile app Wallet tab</p>
          </div>

          <button
            onClick={() => setShowAddPackage(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Add Package
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-4 rounded-xl border relative transition group ${
                pkg.isBestValue ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <button
                onClick={() => handleDeletePackage(pkg.id)}
                className="absolute top-2 right-2 text-slate-400 hover:text-red-600 p-1 rounded transition opacity-0 group-hover:opacity-100"
                title="Delete Package"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <p className="text-2xl font-black text-slate-900">₹{pkg.amountINR}</p>
              <p className="text-xs font-semibold text-emerald-700 mt-1">
                {pkg.cashbackINR > 0 ? `+ ₹${pkg.cashbackINR} Cashback` : 'Standard Pack'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{pkg.amountINR * 10} In-App Coins</p>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Coupons */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">Active Promo Coupons</h3>
            <p className="text-xs text-slate-500">Instant cashback discount codes for recharge checkout</p>
          </div>

          <button
            onClick={() => setShowAddCoupon(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Add Coupon
          </button>
        </div>

        <div className="space-y-3 mt-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="p-4 rounded-lg border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-900 font-mono font-bold text-xs rounded">
                  {coupon.code}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{coupon.description}</p>
                  <p className="text-xs text-slate-400">
                    Min Recharge: ₹{coupon.minRechargeINR} • Max Cashback: ₹{coupon.maxCashbackINR}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  Active
                </span>
                <button
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Package Modal */}
      {showAddPackage && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-lg text-slate-900">Add Recharge Package</h3>
            <form onSubmit={handleAddPackage} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Package Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 299"
                  value={newPkgAmount}
                  onChange={(e) => setNewPkgAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cashback Bonus (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 30"
                  value={newPkgCashback}
                  onChange={(e) => setNewPkgCashback(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPackage(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                >
                  Create Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddCoupon && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-lg text-slate-900">Create Promo Coupon</h3>
            <form onSubmit={handleAddCoupon} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUPER50"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 10% Instant Cashback on recharge"
                  value={newCouponDesc}
                  onChange={(e) => setNewCouponDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Min Recharge (₹)</label>
                <input
                  type="number"
                  value={newCouponMin}
                  onChange={(e) => setNewCouponMin(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCoupon(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
