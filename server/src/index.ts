import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import {
  DEFAULT_RECHARGE_PACKAGES,
  DEFAULT_COUPONS,
  TOP_LANGUAGES,
  CATEGORIES,
  CallSession,
  WalletTransaction,
  PushNotificationPayload,
  ListenerProfile,
  PayoutRequest,
  ListenerEarningsSummary
} from '@chatzie/shared';
import {
  mockListeners,
  mockUsers,
  mockTransactions,
  mockPayouts,
  mockPushNotifications,
  mockReports,
  mockOrders,
  ModerationReport
} from './db';
import { paymentService } from './services/paymentService';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8682;
const AGORA_APP_ID = process.env.AGORA_APP_ID || 'mock_agora_app_id';
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || 'mock_agora_certificate';

// -------------------------------------------------------------------
// 1. PUBLIC CONFIG & DISCOVERY ENDPOINTS
// -------------------------------------------------------------------

app.get('/api/config', (req, res) => {
  res.json({
    appName: 'Chatzie',
    languages: TOP_LANGUAGES,
    categories: CATEGORIES,
    rechargePackages: DEFAULT_RECHARGE_PACKAGES,
    coupons: DEFAULT_COUPONS,
  });
});

// Get online listeners with search and filters
app.get('/api/listeners', (req, res) => {
  const { language, videoOnly, search } = req.query;

  let results = [...mockListeners];

  if (language && typeof language === 'string' && language !== 'All') {
    results = results.filter(l => l.languages.includes(language));
  }

  if (videoOnly === 'true') {
    results = results.filter(l => l.isVideoEnabled);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(l =>
      l.username.toLowerCase().includes(q) ||
      l.name.toLowerCase().includes(q) ||
      l.bio.toLowerCase().includes(q)
    );
  }

  res.json(results);
});

// Get single listener detail by ID or username
app.get('/api/listeners/:id', (req, res) => {
  const listener = mockListeners.find(l => l.id === req.params.id || l.username === req.params.id);
  if (!listener) {
    return res.status(404).json({ error: 'Listener not found' });
  }
  res.json(listener);
});

// -------------------------------------------------------------------
// 2. USER AUTHENTICATION & PROFILE
// -------------------------------------------------------------------

app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });
  // In development, mock OTP 123456
  res.json({ success: true, message: 'OTP sent successfully', mockOtp: '123456' });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (otp !== '123456') {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  let user = mockUsers.find(u => u.phone === phone);
  if (!user) {
    user = {
      id: `u-${Date.now()}`,
      phone,
      name: 'New Talker',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      walletBalanceINR: 20.00, // Welcome bonus ₹20
      role: 'talker',
      isListenerVerified: false,
      preferredLanguages: ['Hindi', 'English'],
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(user);
  }

  res.json({
    success: true,
    user,
    token: `chatzie_jwt_${user.id}`
  });
});

app.get('/api/user/profile/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// -------------------------------------------------------------------
// 3. WALLET & PAYMENT TRANSACTIONS
// -------------------------------------------------------------------

app.get('/api/wallet/transactions/:userId', (req, res) => {
  const txs = mockTransactions.filter(t => t.userId === req.params.userId);
  res.json(txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

app.post('/api/wallet/recharge', (req, res) => {
  const { userId, amountINR, couponCode } = req.body;
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let cashbackINR = 0;
  if (couponCode === 'VALUE14' && amountINR >= 999) {
    cashbackINR = Number((amountINR * 0.14).toFixed(2));
  }

  const totalCredit = amountINR + cashbackINR;
  user.walletBalanceINR = Number((user.walletBalanceINR + totalCredit).toFixed(2));

  const newTx: WalletTransaction = {
    id: `tx-${Date.now()}`,
    userId,
    type: 'recharge',
    amountINR,
    cashbackINR,
    status: 'completed',
    description: `Wallet Recharge ₹${amountINR} ${cashbackINR > 0 ? `(+₹${cashbackINR} Cashback)` : ''}`,
    referenceId: `rzp_order_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  mockTransactions.unshift(newTx);

  res.json({
    success: true,
    updatedBalance: user.walletBalanceINR,
    transaction: newTx
  });
});

// -------------------------------------------------------------------
// 4. AGORA RTC TOKEN GENERATION & CALL SESSION
// -------------------------------------------------------------------

app.post('/api/calls/initiate', (req, res) => {
  const { callerId, listenerId, callType } = req.body;

  const caller = mockUsers.find(u => u.id === callerId);
  const listener = mockListeners.find(l => l.id === listenerId);

  if (!caller || !listener) {
    return res.status(404).json({ error: 'Caller or Listener not found' });
  }

  // Validate balance for at least 1 minute
  if (caller.walletBalanceINR < listener.callRatePerMinINR) {
    return res.status(402).json({
      error: 'Insufficient Balance',
      requiredINR: listener.callRatePerMinINR,
      currentBalanceINR: caller.walletBalanceINR
    });
  }

  const channelName = `chatzie_call_${Date.now()}`;
  const privilegeExpireTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour

  // Build Agora RTC tokens
  let tokenCaller = '';
  let tokenListener = '';
  try {
    tokenCaller = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      1001,
      RtcRole.PUBLISHER,
      privilegeExpireTime
    );
    tokenListener = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      2002,
      RtcRole.PUBLISHER,
      privilegeExpireTime
    );
  } catch (err) {
    // If running in development without credentials, provide mock tokens
    tokenCaller = `mock_agora_token_caller_${channelName}`;
    tokenListener = `mock_agora_token_listener_${channelName}`;
  }

  const callSession: CallSession = {
    id: `call_${Date.now()}`,
    callerId,
    callerName: caller.name,
    callerAvatarUrl: caller.avatarUrl,
    listenerId,
    listenerName: listener.name,
    listenerAvatarUrl: listener.avatarUrl,
    callType,
    ratePerMinINR: listener.callRatePerMinINR,
    durationSeconds: 0,
    totalChargedINR: 0,
    listenerEarnedINR: 0,
    status: 'ringing',
    agoraChannelName: channelName,
    agoraTokenCaller: tokenCaller,
    agoraTokenListener: tokenListener,
    startedAt: new Date().toISOString()
  };

  res.json(callSession);
});

// Live WebRTC channels state for Admin Backoffice
export interface LiveSession {
  id: string;
  channel: string;
  listener: string;
  caller: string;
  type: 'audio' | 'video';
  startedMinutesAgo: number;
  ratePerMinINR: number;
  coinsBurned: number;
  status: 'active' | 'terminated';
}

export let activeLiveSessions: LiveSession[] = [
  {
    id: 'sess-1',
    channel: 'call_sonika_912',
    listener: 'Sonika Verma (@sonika_912)',
    caller: 'Amit (u-amit)',
    type: 'audio',
    startedMinutesAgo: 3,
    ratePerMinINR: 9,
    coinsBurned: 270,
    status: 'active',
  },
  {
    id: 'sess-2',
    channel: 'call_jyoti__1',
    listener: 'Jyoti Sharma (@jyoti__1)',
    caller: 'Rohan Sharma (u-rohan)',
    type: 'video',
    startedMinutesAgo: 7,
    ratePerMinINR: 30,
    coinsBurned: 2100,
    status: 'active',
  }
];

// Direct token generation endpoint for webRTC clients & testbeds
app.get('/api/calls/token', (req, res) => {
  const channel = (req.query.channel as string) || 'chatzie_room_1';
  const uid = Number(req.query.uid) || Math.floor(1000 + Math.random() * 9000);
  const privilegeExpireTime = Math.floor(Date.now() / 1000) + 3600;
  const callType = req.query.type === 'video' ? 'video' : 'audio';

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channel,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpireTime
    );

    // Track active live session in admin backoffice
    const existing = activeLiveSessions.find(s => s.channel === channel);
    if (!existing) {
      const newSess: LiveSession = {
        id: `sess-${Date.now()}`,
        channel,
        caller: 'Amit (u-amit)',
        listener: 'Host (' + channel.replace('call_', '@') + ')',
        type: callType,
        startedMinutesAgo: 0,
        ratePerMinINR: callType === 'video' ? 30 : 9,
        coinsBurned: 0,
        status: 'active',
      };
      activeLiveSessions.unshift(newSess);
      io.emit('live_sessions_updated', activeLiveSessions);
    }

    res.json({
      success: true,
      appId: AGORA_APP_ID,
      channel,
      uid,
      token,
      expiresInSeconds: 3600,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate token', details: err.message });
  }
});

// Start call session
app.post('/api/calls/start', (req, res) => {
  const { channel, caller, listener, type, ratePerMinINR } = req.body;
  const existing = activeLiveSessions.find(s => s.channel === channel);
  if (!existing) {
    const newSess: LiveSession = {
      id: `sess-${Date.now()}`,
      channel: channel || `call_${Date.now()}`,
      caller: caller || 'Amit (u-amit)',
      listener: listener || 'Host',
      type: type === 'video' ? 'video' : 'audio',
      startedMinutesAgo: 0,
      ratePerMinINR: Number(ratePerMinINR) || (type === 'video' ? 30 : 9),
      coinsBurned: 0,
      status: 'active',
    };
    activeLiveSessions.unshift(newSess);
    io.emit('live_sessions_updated', activeLiveSessions);
  }
  res.json({ success: true, activeSessions: activeLiveSessions });
});

// End call session with real-time billing and planned listener earnings distribution
// Audio: ₹9/min caller -> ₹4.50/min listener | Video: ₹30/min caller -> ₹16/min listener
app.post('/api/calls/end', (req, res) => {
  const { channel, durationSeconds, callerId = 'u-amit', listenerId, callType = 'audio' } = req.body;
  const billedMinutes = Math.max(1, Math.ceil((Number(durationSeconds) || 0) / 60));
  const ratePerMin = callType === 'video' ? 30.0 : 9.0;
  const callerCharged = Number((billedMinutes * ratePerMin).toFixed(2));
  const hostRatePerMin = callType === 'video' ? 16.0 : 4.5;
  const hostEarned = Number((billedMinutes * hostRatePerMin).toFixed(2));
  const platformRetained = Number((callerCharged - hostEarned).toFixed(2));

  // 1. Terminate active session in admin live monitor
  const sess = activeLiveSessions.find(s => s.channel === channel);
  if (sess) {
    sess.status = 'terminated';
    sess.coinsBurned = callerCharged * 10;
    io.emit('live_sessions_updated', activeLiveSessions);
  }

  // 2. Caller deduction
  const caller = mockUsers.find(u => u.id === callerId) || mockUsers[0];
  if (caller) {
    caller.walletBalanceINR = Math.max(0, Number((caller.walletBalanceINR - callerCharged).toFixed(2)));
    const callerTx: WalletTransaction = {
      id: `tx-caller-${Date.now()}`,
      userId: caller.id,
      type: 'call_deduction',
      amountINR: -callerCharged,
      status: 'completed',
      description: `${callType === 'video' ? 'Video' : 'Voice'} Call (${billedMinutes} min @ ₹${ratePerMin}/min)`,
      referenceId: channel || `call_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockTransactions.unshift(callerTx);
    io.emit('user_balance_updated', {
      userId: caller.id,
      newBalanceINR: caller.walletBalanceINR,
      deductedINR: callerCharged,
    });
  }

  // 3. Listener earning credit according to planned structure
  const listener = mockListeners.find(l => l.id === listenerId || l.username === (channel || '').replace('call_', '')) || mockListeners[0];
  if (listener) {
    listener.earningsBalanceINR = Number(((listener.earningsBalanceINR || 0) + hostEarned).toFixed(2));
    listener.totalEarnedINR = Number(((listener.totalEarnedINR || 0) + hostEarned).toFixed(2));
    const hostTx: WalletTransaction = {
      id: `tx-host-${Date.now()}`,
      userId: listener.userId,
      type: 'call_deduction', // using transaction schema
      amountINR: hostEarned,
      status: 'completed',
      description: `${callType === 'video' ? 'Video' : 'Voice'} Host Earning (${billedMinutes} min @ ₹${hostRatePerMin}/min)`,
      referenceId: channel || `call_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockTransactions.unshift(hostTx);
    io.emit('listener_earnings_updated', {
      listenerId: listener.id,
      earningsBalanceINR: listener.earningsBalanceINR,
      totalEarnedINR: listener.totalEarnedINR,
      earnedThisCall: hostEarned,
    });
  }

  res.json({
    success: true,
    billedMinutes,
    callerCharged,
    hostEarned,
    platformRetained,
    callerNewBalance: caller?.walletBalanceINR ?? 0,
    hostNewEarnings: listener?.earningsBalanceINR ?? 0,
    activeSessions: activeLiveSessions,
  });
});

// Chat message deduction: ₹0.25 text (listener gets ₹0.125), ₹0.75 image (listener gets ₹0.375)
app.post('/api/chat/deduct', (req, res) => {
  const { callerId = 'u-amit', listenerId, type = 'text' } = req.body;
  const callerCharged = type === 'image' ? 0.75 : 0.25;
  const hostEarned = type === 'image' ? 0.375 : 0.125;
  const platformRetained = Number((callerCharged - hostEarned).toFixed(3));

  const caller = mockUsers.find(u => u.id === callerId) || mockUsers[0];
  if (caller) {
    if (caller.walletBalanceINR < callerCharged) {
      return res.status(402).json({ error: 'Insufficient balance' });
    }
    caller.walletBalanceINR = Number((caller.walletBalanceINR - callerCharged).toFixed(2));
    mockTransactions.unshift({
      id: `tx-chat-${Date.now()}`,
      userId: caller.id,
      type: 'call_deduction',
      amountINR: -callerCharged,
      status: 'completed',
      description: `Chat ${type === 'image' ? 'Photo' : 'Message'} Sent`,
      referenceId: `msg_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    io.emit('user_balance_updated', { userId: caller.id, newBalanceINR: caller.walletBalanceINR });
  }

  const listener = mockListeners.find(l => l.id === listenerId) || mockListeners[0];
  if (listener) {
    listener.earningsBalanceINR = Number(((listener.earningsBalanceINR || 0) + hostEarned).toFixed(3));
    listener.totalEarnedINR = Number(((listener.totalEarnedINR || 0) + hostEarned).toFixed(3));
    io.emit('listener_earnings_updated', {
      listenerId: listener.id,
      earningsBalanceINR: listener.earningsBalanceINR,
      totalEarnedINR: listener.totalEarnedINR,
      earnedThisChat: hostEarned,
    });
  }

  res.json({
    success: true,
    callerCharged,
    hostEarned,
    platformRetained,
    callerNewBalance: caller?.walletBalanceINR ?? 0,
    hostNewEarnings: listener?.earningsBalanceINR ?? 0,
  });
});

// Public listeners endpoint for mobile & web
app.get('/api/listeners', (req, res) => {
  res.json(mockListeners);
});

// Submit KYC from mobile app
app.post('/api/listeners/kyc', (req, res) => {
  const { name, username, phone, languages, bio, panNumber, upiId, isVideoEnabled } = req.body;
  const newApp: KYCApplication = {
    id: `app-${Date.now()}`,
    name: name || 'Applicant Host',
    username: username || `user_${Date.now().toString().slice(-4)}`,
    phone: phone || '9876543210',
    languages: Array.isArray(languages) ? languages : ['Hindi'],
    ratePerMinINR: 9,
    isVideoEnabled: isVideoEnabled ?? false,
    bio: bio || 'Compassionate listener eager to connect and support.',
    panNumber: panNumber || 'ABCDE1234F',
    upiId: upiId || `${username || 'user'}@upi`,
    voiceBioDurationSeconds: 20,
    appliedAt: 'Just now',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  };
  pendingKycApplications.unshift(newApp);
  io.emit('kyc_application_received', newApp);
  res.json({ success: true, application: newApp });
});

// -------------------------------------------------------------------
// 5. ADMIN BACKOFFICE ENDPOINTS (/api/admin/*)
// -------------------------------------------------------------------

export interface KYCApplication {
  id: string;
  name: string;
  username: string;
  phone: string;
  languages: string[];
  ratePerMinINR: number;
  isVideoEnabled: boolean;
  bio: string;
  panNumber: string;
  voiceBioDurationSeconds: number;
  appliedAt: string;
  avatarUrl?: string;
  upiId?: string;
}

let pendingKycApplications: KYCApplication[] = [
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
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    upiId: 'pooja@okhdfcbank'
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
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    upiId: 'riya@okaxis'
  }
];

app.get('/api/admin/dashboard', (req, res) => {
  const liveCount = activeLiveSessions.filter(s => s.status === 'active').length;
  const totalRechargeVolume = mockTransactions
    .filter(t => t.type === 'recharge' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amountINR, 0);

  res.json({
    activeCallsCount: liveCount,
    totalTalkersCount: mockUsers.length + 1420,
    totalVerifiedListeners: mockListeners.length,
    pendingKYCCount: pendingKycApplications.length,
    totalRechargeVolumeINR: totalRechargeVolume + 158200,
    pendingPayoutsVolumeINR: mockPayouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amountINR, 0),
    topLanguages: TOP_LANGUAGES.slice(0, 5),
  });
});

app.get('/api/admin/kyc-queue', (req, res) => {
  res.json({
    success: true,
    pendingApplications: pendingKycApplications
  });
});

app.post('/api/admin/kyc-action', (req, res) => {
  const { listenerId, action, rejectionReason } = req.body;
  const appIndex = pendingKycApplications.findIndex(a => a.id === listenerId);

  if (action === 'approve') {
    if (appIndex !== -1) {
      const app = pendingKycApplications[appIndex];
      pendingKycApplications.splice(appIndex, 1);
      const newListener: ListenerProfile = {
        id: `list-${Date.now()}`,
        userId: `u-${Date.now()}`,
        username: app.username,
        name: app.name,
        avatarUrl: app.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        bio: app.bio,
        languages: app.languages,
        callRatePerMinINR: app.ratePerMinINR || 9,
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
        upiId: app.upiId || `${app.username}@upi`,
        isAvailableForCalls: true,
      };
      mockListeners.unshift(newListener);
      io.emit('listeners_updated', mockListeners);
      return res.json({
        success: true,
        action: 'approved',
        listener: newListener,
        listeners: mockListeners,
        pendingApplications: pendingKycApplications
      });
    }
  } else {
    // reject
    if (appIndex !== -1) {
      pendingKycApplications.splice(appIndex, 1);
    }
    return res.json({
      success: true,
      action: 'rejected',
      pendingApplications: pendingKycApplications
    });
  }

  // Also check if already in mockListeners for status update
  const listener = mockListeners.find(l => l.id === listenerId);
  if (listener) {
    listener.kycStatus = action === 'approve' ? 'verified' : 'rejected';
    listener.isAvailableForCalls = action === 'approve';
    io.emit('listeners_updated', mockListeners);
    return res.json({
      success: true,
      listener,
      listeners: mockListeners,
      pendingApplications: pendingKycApplications
    });
  }

  res.status(404).json({ error: 'Application or listener not found' });
});

app.post('/api/admin/push-notification', (req, res) => {
  const { title, body, target, deepLink } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }

  const payload: PushNotificationPayload = {
    title,
    body,
    target: target || 'all',
    deepLink,
    sentAt: new Date().toISOString(),
    totalDelivered: target === 'all' ? 1428 : target === 'talkers' ? 1420 : 8
  };

  mockPushNotifications.unshift(payload);

  // Broadcast through socket to any connected clients
  io.emit('push_notification', payload);

  res.json({ success: true, deliveredCount: payload.totalDelivered, payload });
});

app.get('/api/admin/push-history', (req, res) => {
  res.json(mockPushNotifications);
});

// Payouts listing for admin backoffice
app.get('/api/admin/payouts', (req, res) => {
  res.json(mockPayouts);
});

// Admin approves or rejects payout (executes payout via RazorpayX or instant simulated settlement)
app.post('/api/admin/payout-action', async (req, res) => {
  const { payoutId, action, reason } = req.body;
  const payout = mockPayouts.find(p => p.id === payoutId);
  if (!payout) return res.status(404).json({ error: 'Payout not found' });

  if (action === 'approve') {
    const listener = mockListeners.find(l => l.id === payout.listenerId);
    
    // Execute payout via payment service
    const result = await paymentService.executePayout({
      payoutId: payout.id,
      listenerId: payout.listenerId,
      listenerName: payout.listenerName,
      amountINR: payout.amountINR,
      upiId: payout.upiId,
      bankAccount: payout.bankAccount,
      bankIFSC: payout.bankIFSC,
    });

    payout.status = 'approved';
    payout.processedAt = new Date().toISOString();
    payout.utrNumber = result.utrNumber;

    if (listener) {
      listener.earningsBalanceINR = Math.max(0, Number(((listener.earningsBalanceINR || 0) - payout.amountINR).toFixed(2)));
      io.emit('listener_earnings_updated', {
        listenerId: listener.id,
        earningsBalanceINR: listener.earningsBalanceINR,
        totalEarnedINR: listener.totalEarnedINR,
      });
    }

    io.emit('payout_approved', payout);
    return res.json({ success: true, payout, message: result.message });
  } else {
    payout.status = 'rejected';
    payout.rejectionReason = reason || 'Verification pending';
    io.emit('payout_rejected', payout);
    return res.json({ success: true, payout });
  }
});

// -------------------------------------------------------------------
// 6. PAYMENT GATEWAY CHANNELS & ORDER PROCESSING (/api/payments/*)
// -------------------------------------------------------------------

// Public payment gateway client config (keys, provider, currency)
app.get('/api/payments/config', (req, res) => {
  res.json(paymentService.getClientConfig());
});

// Create payment order (works with live Razorpay or seamless sandbox fallback)
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { amountINR, cashbackINR, packageId, userId = 'u-amit', notes } = req.body;
    if (!amountINR || Number(amountINR) <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const order = await paymentService.createOrder({
      userId,
      amountINR: Number(amountINR),
      cashbackINR: Number(cashbackINR) || 0,
      packageId,
      notes,
    });

    mockOrders.unshift(order);
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create payment order', details: err.message });
  }
});

// Verify payment & credit wallet instantly
app.post('/api/payments/verify', (req, res) => {
  try {
    const {
      orderId,
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
      amountINR,
      cashbackINR = 0,
      userId = 'u-amit',
      paymentMethod = 'upi',
    } = req.body;

    const verification = paymentService.verifyPayment({
      orderId,
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
      amountINR: Number(amountINR),
      cashbackINR: Number(cashbackINR),
      userId,
    });

    if (!verification.verified) {
      return res.status(400).json({ success: false, error: verification.message });
    }

    // Update order status
    const order = mockOrders.find(o => o.orderId === orderId);
    if (order) {
      order.status = 'paid';
    }

    // Credit user wallet
    const user = mockUsers.find(u => u.id === userId) || mockUsers[0];
    const baseAmount = Number(amountINR);
    const bonusCashback = Number(cashbackINR) || 0;
    const totalCredit = Number((baseAmount + bonusCashback).toFixed(2));

    user.walletBalanceINR = Number((user.walletBalanceINR + totalCredit).toFixed(2));

    // Log recharge transaction
    const rechargeTx: WalletTransaction = {
      id: `tx-rech-${Date.now()}`,
      userId: user.id,
      type: 'recharge',
      amountINR: baseAmount,
      cashbackINR: bonusCashback,
      status: 'completed',
      description: `Wallet Recharge ₹${baseAmount} via ${paymentMethod.toUpperCase()}`,
      referenceId: gatewayPaymentId || orderId || `pay_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockTransactions.unshift(rechargeTx);

    // If cashback earned, log separate bonus credit
    if (bonusCashback > 0) {
      const cbTx: WalletTransaction = {
        id: `tx-cb-${Date.now()}`,
        userId: user.id,
        type: 'cashback_earned',
        amountINR: bonusCashback,
        cashbackINR: bonusCashback,
        status: 'completed',
        description: `Promo Cashback Bonus (+₹${bonusCashback})`,
        referenceId: `cb_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      mockTransactions.unshift(cbTx);
    }

    // Broadcast live balance update
    io.emit('user_balance_updated', {
      userId: user.id,
      newBalanceINR: user.walletBalanceINR,
      creditedINR: totalCredit,
    });

    res.json({
      success: true,
      message: 'Payment verified and wallet credited successfully!',
      newBalanceINR: user.walletBalanceINR,
      transaction: rechargeTx,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Payment verification failed', details: err.message });
  }
});

// Gateway Webhook (For live Razorpay/Cashfree asynchronous payment confirmation)
app.post('/api/payments/webhook', (req, res) => {
  console.log('[Payment Gateway Webhook received]:', req.body?.event || 'webhook');
  res.json({ status: 'ok' });
});

// -------------------------------------------------------------------
// 7. LISTENER EARNINGS & WITHDRAWAL PAYOUTS
// -------------------------------------------------------------------

// Get listener earnings summary
app.get('/api/listeners/:id/earnings', (req, res) => {
  const listener = mockListeners.find(l => l.id === req.params.id || l.username === req.params.id) || mockListeners[0];
  const listenerPayouts = mockPayouts.filter(p => p.listenerId === listener.id);
  const totalWithdrawn = listenerPayouts
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amountINR, 0);
  const pendingPayout = listenerPayouts
    .filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amountINR, 0);

  const earningsSummary: ListenerEarningsSummary = {
    listenerId: listener.id,
    listenerName: listener.name,
    totalEarnedINR: listener.totalEarnedINR || 8420.00,
    availableBalanceINR: listener.earningsBalanceINR || 2340.00,
    totalWithdrawnINR: totalWithdrawn,
    pendingPayoutINR: pendingPayout,
    totalAudioMinutes: Math.round(((listener.totalEarnedINR || 8420) * 0.7) / 4.5),
    totalVideoMinutes: Math.round(((listener.totalEarnedINR || 8420) * 0.3) / 16.0),
    totalChatMessages: 124,
  };

  res.json({
    success: true,
    earnings: earningsSummary,
    payoutHistory: listenerPayouts,
    registeredUPI: listener.upiId,
  });
});

// Host requests withdrawal to UPI or Bank Account
app.post('/api/payouts/request', (req, res) => {
  const { listenerId, amountINR, upiId, bankAccount, bankIFSC } = req.body;
  const listener = mockListeners.find(l => l.id === listenerId) || mockListeners[0];
  const amount = Number(amountINR);

  if (!amount || amount < 200) {
    return res.status(400).json({ error: 'Minimum withdrawal amount is ₹200' });
  }

  const currentAvailable = listener.earningsBalanceINR || 0;
  if (amount > currentAvailable) {
    return res.status(400).json({ error: `Insufficient earnings balance. Available: ₹${currentAvailable.toFixed(2)}` });
  }

  const newPayout: PayoutRequest = {
    id: `po-${Date.now()}`,
    listenerId: listener.id,
    listenerName: listener.name,
    amountINR: amount,
    upiId: upiId || listener.upiId || 'host@upi',
    bankAccount,
    bankIFSC,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };

  mockPayouts.unshift(newPayout);
  io.emit('payout_requested', newPayout);

  res.json({
    success: true,
    message: `Withdrawal request for ₹${amount} submitted for admin settlement.`,
    payout: newPayout,
    remainingBalanceINR: currentAvailable,
  });
});

// Universal Platform Pricing State
let platformPricingSettings = {
  audioCallRateINR: 9.0,
  audioListenerPayoutINR: 4.5,
  videoCallRateINR: 30.0,
  videoListenerPayoutINR: 16.0,
  chatTextMessageRateINR: 0.25,
  chatImageMessageRateINR: 0.75,
  platformCommissionPercent: 50,
};

// Moderation & Safety Reports Endpoints (Module 5)
app.post('/api/reports', (req, res) => {
  const { reporterId, targetUsername, reason, channelName, durationSeconds } = req.body;
  const newReport: ModerationReport = {
    id: `rep_${Date.now()}`,
    reporterId: reporterId || 'anonymous_caller',
    targetUsername: targetUsername || 'unknown',
    reason: reason || 'Violation of community standards',
    channelName: channelName || 'call_channel',
    durationSeconds: Number(durationSeconds) || 0,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  mockReports.unshift(newReport);
  console.log(`[Safety Report Filed]: ${reason} reported against @${targetUsername}`);
  res.json({ success: true, report: newReport });
});

app.get('/api/admin/reports', (req, res) => {
  res.json({ success: true, reports: mockReports });
});

app.post('/api/admin/reports/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'ban' | 'dismiss' | 'warn'
  const rep = mockReports.find(r => r.id === id);
  if (!rep) {
    return res.status(404).json({ error: 'Report not found' });
  }
  rep.status = action === 'dismiss' ? 'dismissed' : 'resolved';
  rep.actionTaken = action === 'ban' ? 'Device Banned' : action === 'warn' ? 'Official Warning Sent' : 'Dismissed';
  res.json({ success: true, report: rep });
});

// Live Sessions Monitor for Admin Backoffice
app.get('/api/admin/live-sessions', (req, res) => {
  res.json({
    success: true,
    activeSessions: activeLiveSessions,
  });
});

app.post('/api/admin/live-sessions/terminate', (req, res) => {
  const { sessionId } = req.body;
  const sess = activeLiveSessions.find(s => s.id === sessionId);
  if (sess) {
    sess.status = 'terminated';
    // Emit force termination signal
    io.emit('session_force_terminated', { channel: sess.channel });
  }
  res.json({ success: true, activeSessions: activeLiveSessions });
});

app.post('/api/admin/live-sessions/simulate', (req, res) => {
  const { type = 'audio' } = req.body;
  const randomListeners = ['Sonika Verma', 'Jyoti Sharma', 'Mahira Khan', 'Ankita Sen'];
  const lName = randomListeners[Math.floor(Math.random() * randomListeners.length)];
  const newSess: LiveSession = {
    id: `sess-${Date.now()}`,
    channel: `call_${Date.now()}`,
    listener: `${lName} (@${lName.toLowerCase().replace(' ', '_')})`,
    caller: 'Caller ' + Math.floor(100 + Math.random() * 900),
    type: type as 'audio' | 'video',
    startedMinutesAgo: 1,
    ratePerMinINR: type === 'video' ? 30 : 9,
    coinsBurned: type === 'video' ? 300 : 90,
    status: 'active',
  };
  activeLiveSessions.unshift(newSess);
  res.json({ success: true, session: newSess, activeSessions: activeLiveSessions });
});

// Admin Users Management Endpoints
app.get('/api/admin/users', (req, res) => {
  res.json({ success: true, users: mockUsers });
});

app.post('/api/admin/users/adjust-balance', (req, res) => {
  const { userId, deltaINR, description } = req.body;
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.walletBalanceINR = Math.max(0, Number((user.walletBalanceINR + Number(deltaINR)).toFixed(2)));

  const newTx: WalletTransaction = {
    id: `tx-admin-${Date.now()}`,
    userId,
    type: Number(deltaINR) >= 0 ? 'recharge' : 'call_deduction',
    amountINR: Number(deltaINR),
    status: 'completed',
    description: description || `Admin adjustment (₹${deltaINR > 0 ? `+${deltaINR}` : deltaINR})`,
    referenceId: `admin_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  mockTransactions.unshift(newTx);

  io.emit('user_balance_updated', { userId, newBalanceINR: user.walletBalanceINR, deltaINR: Number(deltaINR) });

  res.json({ success: true, user, transaction: newTx });
});

app.post('/api/admin/users/:id/ban', (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.isBanned = !user.isBanned;
  io.emit('user_banned', { userId: req.params.id, isBanned: user.isBanned });
  res.json({ success: true, isBanned: user.isBanned, user });
});

// Admin Listeners Management Endpoints
app.get('/api/admin/listeners', (req, res) => {
  res.json({ success: true, listeners: mockListeners });
});

app.post('/api/admin/listeners/:id/tariff', (req, res) => {
  const { ratePerMinINR } = req.body;
  const listener = mockListeners.find(l => l.id === req.params.id);
  if (!listener) return res.status(404).json({ error: 'Listener not found' });
  listener.callRatePerMinINR = Number(ratePerMinINR);
  io.emit('listeners_updated', mockListeners);
  res.json({ success: true, listener });
});

app.post('/api/admin/listeners/:id/suspend', (req, res) => {
  const listener = mockListeners.find(l => l.id === req.params.id);
  if (!listener) return res.status(404).json({ error: 'Listener not found' });
  const isSuspended = !listener.isAvailableForCalls;
  listener.isAvailableForCalls = isSuspended;
  listener.status = isSuspended ? 'online' : 'offline';
  io.emit('listeners_updated', mockListeners);
  res.json({ success: true, isSuspended: !listener.isAvailableForCalls, listener });
});

// Admin Pricing Settings Endpoints
app.get('/api/admin/pricing', (req, res) => {
  res.json({
    success: true,
    pricing: platformPricingSettings,
    rechargePackages: DEFAULT_RECHARGE_PACKAGES,
    coupons: DEFAULT_COUPONS,
  });
});

app.post('/api/admin/pricing', (req, res) => {
  const {
    audioCallRateINR,
    audioListenerPayoutINR,
    videoCallRateINR,
    videoListenerPayoutINR,
    chatTextMessageRateINR,
    chatImageMessageRateINR,
    platformCommissionPercent
  } = req.body;

  if (audioCallRateINR !== undefined) platformPricingSettings.audioCallRateINR = Number(audioCallRateINR);
  if (audioListenerPayoutINR !== undefined) platformPricingSettings.audioListenerPayoutINR = Number(audioListenerPayoutINR);
  if (videoCallRateINR !== undefined) platformPricingSettings.videoCallRateINR = Number(videoCallRateINR);
  if (videoListenerPayoutINR !== undefined) platformPricingSettings.videoListenerPayoutINR = Number(videoListenerPayoutINR);
  if (chatTextMessageRateINR !== undefined) platformPricingSettings.chatTextMessageRateINR = Number(chatTextMessageRateINR);
  if (chatImageMessageRateINR !== undefined) platformPricingSettings.chatImageMessageRateINR = Number(chatImageMessageRateINR);
  if (platformCommissionPercent !== undefined) platformPricingSettings.platformCommissionPercent = Number(platformCommissionPercent);

  io.emit('pricing_updated', platformPricingSettings);

  res.json({ success: true, pricing: platformPricingSettings });
});

// -------------------------------------------------------------------
// 6. REAL-TIME SOCKET.IO SIGNALING & MINUTE-BY-MINUTE BILLING
// -------------------------------------------------------------------

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Minute-by-minute billing tick
  socket.on('call_minute_tick', (data: { callerId: string; listenerId: string; ratePerMin: number }) => {
    const caller = mockUsers.find(u => u.id === data.callerId);
    if (!caller) return;

    if (caller.walletBalanceINR >= data.ratePerMin) {
      caller.walletBalanceINR = Number((caller.walletBalanceINR - data.ratePerMin).toFixed(2));
      socket.emit('balance_updated', {
        newBalanceINR: caller.walletBalanceINR,
        deductedINR: data.ratePerMin
      });
    } else {
      // Force end call when balance drops below 0
      socket.emit('call_force_end', {
        reason: 'Insufficient wallet balance'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

export { app, server, io };

if (require.main === module) {
  server.listen(Number(PORT), () => {
    console.log(`Chatzie Backend Server running on http://localhost:${PORT} and http://127.0.0.1:${PORT}`);
  });
}
