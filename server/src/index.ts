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
  PushNotificationPayload
} from '@chatzie/shared';
import {
  mockListeners,
  mockUsers,
  mockTransactions,
  mockPayouts,
  mockPushNotifications,
  mockReports,
  ModerationReport
} from './db';

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

// Direct token generation endpoint for webRTC clients & testbeds
app.get('/api/calls/token', (req, res) => {
  const channel = (req.query.channel as string) || 'chatzie_room_1';
  const uid = Number(req.query.uid) || Math.floor(1000 + Math.random() * 9000);
  const privilegeExpireTime = Math.floor(Date.now() / 1000) + 3600;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channel,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpireTime
    );

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

// -------------------------------------------------------------------
// 5. ADMIN BACKOFFICE ENDPOINTS (/api/admin/*)
// -------------------------------------------------------------------

app.get('/api/admin/dashboard', (req, res) => {
  const totalRechargeVolume = mockTransactions
    .filter(t => t.type === 'recharge' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amountINR, 0);

  res.json({
    activeCallsCount: 8,
    totalTalkersCount: mockUsers.length + 1420,
    totalVerifiedListeners: mockListeners.length,
    pendingKYCCount: 3,
    totalRechargeVolumeINR: totalRechargeVolume + 158200,
    pendingPayoutsVolumeINR: mockPayouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amountINR, 0),
    topLanguages: TOP_LANGUAGES.slice(0, 5),
  });
});

app.get('/api/admin/kyc-queue', (req, res) => {
  const pending = mockListeners.filter(l => l.kycStatus === 'pending');
  res.json(pending);
});

app.post('/api/admin/kyc-action', (req, res) => {
  const { listenerId, action, rejectionReason } = req.body;
  const listener = mockListeners.find(l => l.id === listenerId);
  if (!listener) return res.status(404).json({ error: 'Listener not found' });

  if (action === 'approve') {
    listener.kycStatus = 'verified';
    listener.isAvailableForCalls = true;
  } else {
    listener.kycStatus = 'rejected';
    listener.isAvailableForCalls = false;
  }

  res.json({ success: true, listener });
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

app.get('/api/admin/payouts', (req, res) => {
  res.json(mockPayouts);
});

app.post('/api/admin/payout-action', (req, res) => {
  const { payoutId, action } = req.body;
  const payout = mockPayouts.find(p => p.id === payoutId);
  if (!payout) return res.status(404).json({ error: 'Payout not found' });

  if (action === 'approve') {
    payout.status = 'approved';
    payout.processedAt = new Date().toISOString();
  } else {
    payout.status = 'rejected';
  }

  res.json({ success: true, payout });
});

// Live WebRTC channels state for Admin Backoffice
interface LiveSession {
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

let activeLiveSessions: LiveSession[] = [
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

  res.json({ success: true, user, transaction: newTx });
});

app.post('/api/admin/users/:id/ban', (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.isBanned = !user.isBanned;
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
  res.json({ success: true, listener });
});

app.post('/api/admin/listeners/:id/suspend', (req, res) => {
  const listener = mockListeners.find(l => l.id === req.params.id);
  if (!listener) return res.status(404).json({ error: 'Listener not found' });
  const isSuspended = !listener.isAvailableForCalls;
  listener.isAvailableForCalls = isSuspended;
  listener.status = isSuspended ? 'online' : 'offline';
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

server.listen(Number(PORT), () => {
  console.log(`Chatzie Backend Server running on http://localhost:${PORT} and http://127.0.0.1:${PORT}`);
});
