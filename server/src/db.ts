import { User, ListenerProfile, WalletTransaction, PayoutRequest, PushNotificationPayload } from '@chatzie/shared';

// Pre-seeded verified Listeners matching the quality and structure of the reference app
export const mockListeners: ListenerProfile[] = [
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

export interface AdminUser extends User {
  isBanned?: boolean;
}

export const mockUsers: AdminUser[] = [
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
    createdAt: new Date().toISOString(),
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
  }
];

export const mockTransactions: WalletTransaction[] = [
  {
    id: 'tx-1',
    userId: 'u-amit',
    type: 'recharge',
    amountINR: 70.00,
    status: 'completed',
    description: 'Wallet Recharge via UPI',
    referenceId: 'order_1001',
    createdAt: '2026-10-02T08:03:00Z',
  },
  {
    id: 'tx-2',
    userId: 'u-amit',
    type: 'recharge',
    amountINR: 399.00,
    status: 'completed',
    description: 'Wallet Recharge via Razorpay',
    referenceId: 'order_1002',
    createdAt: '2026-10-02T06:03:00Z',
  },
  {
    id: 'tx-3',
    userId: 'u-amit',
    type: 'cashback_earned',
    amountINR: 44.85,
    cashbackINR: 44.85,
    status: 'completed',
    description: 'Promo Cashback VALUE14 Applied',
    referenceId: 'cb_1003',
    createdAt: '2026-09-30T06:43:00Z',
  },
  {
    id: 'tx-4',
    userId: 'u-amit',
    type: 'call_deduction',
    amountINR: -18.00,
    status: 'completed',
    description: 'Voice Call (2 mins) with Ankita Sen',
    referenceId: 'call_9901',
    createdAt: '2026-10-02T08:15:00Z',
  }
];

export const mockPayouts: PayoutRequest[] = [
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
  }
];

export const mockPushNotifications: PushNotificationPayload[] = [
  {
    title: 'Welcome to Chatzie!',
    body: 'Discover verified listeners ready for real conversations right now.',
    target: 'all',
    sentAt: '2026-10-01T09:00:00Z',
    totalDelivered: 1240,
  }
];

export interface ModerationReport {
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

export const mockReports: ModerationReport[] = [
  {
    id: 'rep-1',
    reporterId: 'u-amit',
    targetUsername: 'unknown_caller',
    reason: 'Demanding Personal Phone / Social Media',
    channelName: 'call_test_101',
    durationSeconds: 42,
    status: 'pending',
    createdAt: '2026-10-22T06:30:00Z',
  }
];
