import { RechargePackage, Coupon, CoinPackage } from './types';

export const CHATZIE_COLORS = {
  // Primary Royal Blues
  primary: '#1E40AF',       // Deep Royal Blue
  primaryLight: '#3B82F6',  // Vivid Cobalt Blue
  primaryDark: '#1E3A8A',   // Navy Dark Blue
  primaryBg: '#EFF6FF',     // Ultra light tint

  // Pure White & Light Surfaces
  white: '#FFFFFF',
  background: '#F8FAFC',    // Slate canvas
  surface: '#FFFFFF',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Red Accents (Strictly professional)
  red: '#DC2626',           // Crimson Red
  redLight: '#FEE2E2',      // Red light tint
  redBadge: '#EF4444',      // Notification & Call End Red

  // Text Hierarchy
  textPrimary: '#0F172A',   // Slate 900
  textSecondary: '#64748B', // Slate 500
  textMuted: '#94A3B8',     // Slate 400

  // Status & Badges
  statusOnline: '#16A34A',  // Emerald Green ring
  statusBusy: '#D97706',    // Amber
  statusOffline: '#94A3B8', // Grey

  // Category Pastel Backgrounds
  categoryGuidance: '#EEF2FF', // Indigo Tint
  categoryRelax: '#F0F9FF',    // Sky Tint
  categorySocial: '#F5F3FF',   // Violet Tint
} as const;

export const COIN_EXCHANGE_RATE = 10; // 1 INR = 10 Coins

export const PLATFORM_PRICING = {
  audioCallRateINR: 9.0, // ₹9/min charged to caller
  audioListenerPayoutINR: 4.5, // ₹4.50/min paid to listener (50% payout)
  videoCallRateINR: 30.0, // ₹30/min charged to caller
  videoListenerPayoutINR: 16.0, // ₹16/min paid to listener (53.3% payout)
  chatTextMessageRateINR: 0.25, // ₹0.25 per text message sent by talker
  chatImageMessageRateINR: 0.75, // ₹0.75 per image sent by talker
} as const;

export const DEFAULT_COIN_PACKAGES: CoinPackage[] = [
  { id: 'coin-100', coins: 1000, bonusCoins: 0, priceINR: 99 },
  { id: 'coin-250', coins: 2500, bonusCoins: 250, priceINR: 249, badgeLabel: 'Popular', isPopular: true },
  { id: 'coin-500', coins: 5000, bonusCoins: 750, priceINR: 499, badgeLabel: 'Best Value' },
  { id: 'coin-1000', coins: 12000, bonusCoins: 2500, priceINR: 999, badgeLabel: 'VIP Pack' },
  { id: 'coin-2500', coins: 32000, bonusCoins: 8000, priceINR: 2499, badgeLabel: 'Mega Talker' },
];

export const DEFAULT_RECHARGE_PACKAGES: RechargePackage[] = [
  { id: 'pack-70', amountINR: 70, cashbackINR: 0 },
  { id: 'pack-149', amountINR: 149, cashbackINR: 0 },
  { id: 'pack-399', amountINR: 399, cashbackINR: 0 },
  { id: 'pack-999', amountINR: 999, cashbackINR: 99.9 },
  { id: 'pack-1499', amountINR: 1499, cashbackINR: 209.9 },
  { id: 'pack-2499', amountINR: 2499, cashbackINR: 349.9, isBestValue: true, badgeLabel: 'Best Value' },
];

export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'coupon-val14',
    code: 'VALUE14',
    discountPercentage: 14,
    description: 'Unlimited 14% Extra Cashback on Recharges over ₹999',
    minRechargeINR: 999,
    maxCashbackINR: 1000,
    isActive: true,
  },
  {
    id: 'coupon-first',
    code: 'FIRSTTALK',
    discountPercentage: 20,
    description: 'Get 20% Extra Balance on your first recharge',
    minRechargeINR: 149,
    maxCashbackINR: 500,
    isActive: true,
  },
];

export const TOP_LANGUAGES = [
  'Hindi',
  'English',
  'Punjabi',
  'Bengali',
  'Marathi',
  'Bhojpuri',
  'Gujarati',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
];

export const CATEGORIES = [
  {
    id: 'guidance',
    title: 'Personal Guidance',
    description: 'Connect with experienced listeners for advice, clarity, and thoughtful discussions.',
    bgColor: CHATZIE_COLORS.categoryGuidance,
    iconName: 'compass',
  },
  {
    id: 'relax',
    title: 'Mind Relaxation',
    description: 'De-stress after a long day. A calm, non-judgmental space to unwind.',
    bgColor: CHATZIE_COLORS.categoryRelax,
    iconName: 'wind',
  },
  {
    id: 'friends',
    title: 'Social Connections',
    description: 'Meet interesting people across India and engage in meaningful conversations.',
    bgColor: CHATZIE_COLORS.categorySocial,
    iconName: 'users',
  },
];
