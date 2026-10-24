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
const AGORA_APP_ID = process.env.AGORA_APP_ID || 'd05f3da99ac3405e9e8eabccbf4367f6';
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '49062fbe5388492aa29e14acd1c32274';

// -------------------------------------------------------------------
// 1. PUBLIC CONFIG & DISCOVERY ENDPOINTS
// -------------------------------------------------------------------

// Instant Quick Sign-Up & Login (Zero OTP - Name & Role)
const handleAuthLoginOrSignup = (req: express.Request, res: express.Response) => {
  const { name, role, phone } = req.body;
  const cleanName = (name || (role === 'listener' ? 'Host' : 'Talker')).trim();
  const id = `u_${Date.now()}`;
  const userPhone = phone || `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const cleanUsername = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const avatarUrl = `https://images.unsplash.com/photo-${role === 'listener' ? '1544005313-94ddf0286df2' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&w=300&q=80`;

  if (role === 'listener') {
    // Check if matching listener already exists in mock database
    const existingListener = mockListeners.find(l => 
      l.name.toLowerCase() === cleanName.toLowerCase() || 
      l.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (existingListener) {
      existingListener.status = 'online';
      existingListener.isAvailableForCalls = true;
      existingListener.isVideoEnabled = true;
      io.emit('listener_status_change', { listenerId: existingListener.id, status: 'online' });
      io.emit('listeners_updated', mockListeners);

      return res.json({
        success: true,
        user: {
          id: existingListener.userId || existingListener.id,
          name: existingListener.name,
          phone: userPhone,
          username: existingListener.username,
          role: 'listener',
          avatarUrl: existingListener.avatarUrl,
          walletBalanceINR: 0,
          listenerProfile: existingListener,
        }
      });
    }

    const newListener: ListenerProfile = {
      id: `list_${Date.now()}`,
      userId: id,
      username: cleanUsername,
      name: cleanName,
      avatarUrl,
      bio: `Compassionate and attentive verified host ready to talk, listen, and support you.`,
      languages: ['Hindi', 'English'],
      callRatePerMinINR: 9,
      isVideoEnabled: true,
      status: 'online',
      rating: 5.0,
      totalReviews: 4,
      followersCount: 18,
      giftsCount: 3,
      voiceBioUrl: 'https://actions.google.com/sounds/v1/speech/voice_intro_1.mp3',
      voiceBioDurationSeconds: 18,
      kycStatus: 'verified',
      panNumber: 'ABCDE1234F',
      isAvailableForCalls: true,
    };
    mockListeners.unshift(newListener);

    mockUsers.unshift({
      id,
      phone: userPhone,
      name: cleanName,
      avatarUrl,
      walletBalanceINR: 0,
      role: 'listener',
      isListenerVerified: true,
      preferredLanguages: ['Hindi', 'English'],
      createdAt: new Date().toISOString(),
    });

    io.emit('listener_status_change', { listenerId: newListener.id, status: 'online' });
    io.emit('listeners_updated', mockListeners);

    return res.json({
      success: true,
      user: {
        id,
        name: cleanName,
        phone: userPhone,
        username: cleanUsername,
        role: 'listener',
        avatarUrl,
        walletBalanceINR: 0,
        listenerProfile: newListener,
      }
    });
  } else {
    const newUser = {
      id,
      phone: userPhone,
      name: cleanName,
      username: cleanUsername,
      avatarUrl,
      walletBalanceINR: 60.00, // Starter wallet balance for testing calls
      role: 'talker' as const,
      isListenerVerified: false,
      preferredLanguages: ['Hindi', 'English'],
      createdAt: new Date().toISOString(),
    };
    mockUsers.unshift(newUser);

    return res.json({
      success: true,
      user: newUser
    });
  }
};

app.post('/api/auth/quick-signup', handleAuthLoginOrSignup);
app.post('/api/auth/login', handleAuthLoginOrSignup);

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

  let results = mockListeners.map(l => ({
    ...l,
    status: (activeHostStatus[l.username] as any) || l.status || 'online',
  }));

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

export let activeLiveSessions: LiveSession[] = [];

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
        caller: (req.query.caller as string) || 'Live Caller',
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

// In-memory live ring registry for real-time 1:1 call signaling
interface ActiveRingCall {
  channel: string;
  callerName: string;
  callerId: string;
  listenerUsername: string;
  callType: 'audio' | 'video';
  ratePerMin: number;
  timestamp: number;
  status: 'ringing' | 'accepted' | 'declined' | 'ended' | 'cancelled';
}

// Active State Trackers
const activeCallChannels: Record<string, { status: 'active' | 'ended'; timestamp: number }> = {};
const activeRingingCalls: Record<string, ActiveRingCall> = {};
const activeHostStatus: Record<string, 'online' | 'busy' | 'offline'> = {};
const notifyQueue: Record<string, Array<{ callerId: string; callerName: string; timestamp: number }>> = {};
const notifiedFreeAlerts: Record<string, { hostUsername: string; hostName: string; timestamp: number }> = {};
const hostCallLogs: Record<string, Array<{ id: string; callerName: string; durationSeconds: number; earnedINR: number; callType: string; timestamp: number }>> = {};
const hostMissedCalls: Record<string, Array<{ id: string; callerName: string; callerId: string; timestamp: number }>> = {};

// 1. Caller dials host (Checks if host is busy or offline)
app.post('/api/calls/dial', (req, res) => {
  const { callerName, callerId, listenerUsername, callType, ratePerMin } = req.body;
  const channel = `call_${listenerUsername}`;

  // Check if Host is busy on another call
  if (activeHostStatus[listenerUsername] === 'busy') {
    if (!hostMissedCalls[listenerUsername]) hostMissedCalls[listenerUsername] = [];
    hostMissedCalls[listenerUsername].unshift({
      id: `mc_${Date.now()}`,
      callerName: callerName || 'Anonymous Caller',
      callerId: callerId || 'u_caller',
      timestamp: Date.now(),
    });
    return res.json({
      success: false,
      isBusy: true,
      message: `${listenerUsername} is currently on another call.`,
    });
  }

  activeCallChannels[channel] = { status: 'active', timestamp: Date.now() };
  activeRingingCalls[listenerUsername] = {
    channel,
    callerName: callerName || 'Caller',
    callerId: callerId || 'u-caller',
    listenerUsername,
    callType: callType || 'audio',
    ratePerMin: ratePerMin || 9,
    timestamp: Date.now(),
    status: 'ringing',
  };
  res.json({ success: true, call: activeRingingCalls[listenerUsername] });
});

// Caller requests to be notified when host becomes free
app.post('/api/calls/notify-queue', (req, res) => {
  const { hostUsername, callerId, callerName } = req.body;
  if (!hostUsername) return res.status(400).json({ error: 'Host username required' });
  if (!notifyQueue[hostUsername]) notifyQueue[hostUsername] = [];
  if (!notifyQueue[hostUsername].some(q => q.callerId === callerId)) {
    notifyQueue[hostUsername].push({ callerId: callerId || 'u_caller', callerName: callerName || 'Caller', timestamp: Date.now() });
  }
  res.json({ success: true, message: 'Added to notify queue' });
});

// Caller polls to see if a queued host became free
app.get('/api/calls/check-free', (req, res) => {
  const { callerId } = req.query;
  if (!callerId || typeof callerId !== 'string') return res.json({ hasFreeAlert: false });
  const alert = notifiedFreeAlerts[callerId];
  if (alert && Date.now() - alert.timestamp < 120000) {
    delete notifiedFreeAlerts[callerId];
    return res.json({ hasFreeAlert: true, alert });
  }
  res.json({ hasFreeAlert: false });
});

// Host toggles Online / Offline / Break
app.post('/api/host/toggle-status', (req, res) => {
  const { hostUsername, isOnline } = req.body;
  activeHostStatus[hostUsername] = isOnline ? 'online' : 'offline';
  const listener = mockListeners.find(l => l.username === hostUsername);
  if (listener) {
    listener.status = isOnline ? 'online' : 'offline';
    listener.isAvailableForCalls = isOnline;
  }
  io.emit('listeners_updated', mockListeners);
  res.json({ success: true, status: activeHostStatus[hostUsername] });
});

// Host Workstation full operational data (Calls, Chats, Earnings, Missed Calls)
app.get('/api/host/workstation-data/:username', (req, res) => {
  const { username } = req.params;
  const listener = mockListeners.find(l => l.username === username);
  const logs = hostCallLogs[username] || [];
  const missed = hostMissedCalls[username] || [];
  const payouts = mockPayouts.filter(p => p.listenerName.toLowerCase().includes(username.toLowerCase()) || p.listenerId === listener?.id);

  res.json({
    success: true,
    status: activeHostStatus[username] || 'online',
    totalEarnedINR: listener?.totalEarnedINR || 0,
    earningsBalanceINR: listener?.earningsBalanceINR || 0,
    callLogs: logs,
    missedCalls: missed,
    payoutHistory: payouts,
  });
});

// Host requests UPI withdrawal
app.post('/api/host/request-payout', (req, res) => {
  const { hostUsername, amountINR, upiId } = req.body;
  const amount = Number(amountINR);
  if (!amount || amount < 200) {
    return res.status(400).json({ error: 'Minimum withdrawal amount is ₹200' });
  }
  const listener = mockListeners.find(l => l.username === hostUsername) || mockListeners[0];
  const newPayout: PayoutRequest = {
    id: `po-${Date.now()}`,
    listenerId: listener.id,
    listenerName: listener.name,
    amountINR: amount,
    upiId: upiId || 'host@upi',
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };
  mockPayouts.unshift(newPayout);
  io.emit('payout_requested', newPayout);
  res.json({
    success: true,
    message: `Withdrawal request for ₹${amount} via UPI (${upiId}) successfully submitted for admin settlement.`,
    payout: newPayout,
  });
});

// 2. Host polls for incoming calls (Case-insensitive & real-time)
app.get('/api/calls/check-incoming', (req, res) => {
  const { username } = req.query;
  if (!username || typeof username !== 'string') {
    return res.json({ hasIncoming: false });
  }
  const cleanQ = username.trim().toLowerCase();
  const key = Object.keys(activeRingingCalls).find(k => k.toLowerCase() === cleanQ);
  const call = key ? activeRingingCalls[key] : null;
  // Ring timeout after 45 seconds
  if (call && call.status === 'ringing' && Date.now() - call.timestamp < 45000) {
    return res.json({ hasIncoming: true, call });
  }
  res.json({ hasIncoming: false });
});

// 3. Host accepts call
app.post('/api/calls/accept', (req, res) => {
  const { username } = req.body;
  const cleanQ = (username || '').trim().toLowerCase();
  const key = Object.keys(activeRingingCalls).find(k => k.toLowerCase() === cleanQ);
  if (key && activeRingingCalls[key]) {
    activeRingingCalls[key].status = 'accepted';
    io.emit('call_accepted', { channel: activeRingingCalls[key].channel });
    return res.json({ success: true, call: activeRingingCalls[key] });
  }
  res.json({ success: false });
});

// 4. Host declines call
app.post('/api/calls/decline', (req, res) => {
  const { username } = req.body;
  const cleanQ = (username || '').trim().toLowerCase();
  const key = Object.keys(activeRingingCalls).find(k => k.toLowerCase() === cleanQ);
  if (key && activeRingingCalls[key]) {
    activeRingingCalls[key].status = 'declined';
    io.emit('call_declined', { channel: activeRingingCalls[key].channel });
    delete activeRingingCalls[key];
  }
  res.json({ success: true });
});

// 5. Caller cancels dial
app.post('/api/calls/cancel-dial', (req, res) => {
  const { channel, listenerUsername } = req.body;
  const cleanQ = (listenerUsername || '').trim().toLowerCase();
  const key = Object.keys(activeRingingCalls).find(k => 
    k.toLowerCase() === cleanQ || (channel && activeRingingCalls[k].channel === channel)
  );
  if (key && activeRingingCalls[key]) {
    activeRingingCalls[key].status = 'cancelled';
    io.emit('call_cancelled', { channel: activeRingingCalls[key].channel });
    delete activeRingingCalls[key];
  }
  res.json({ success: true });
});

// 6. Caller checks if host accepted or declined
app.get('/api/calls/check-dial-status', (req, res) => {
  const channel = req.query.channel as string;
  if (!channel) return res.json({ status: 'ringing' });
  const key = Object.keys(activeRingingCalls).find(k => activeRingingCalls[k].channel === channel);
  if (key && activeRingingCalls[key]) {
    return res.json({ status: activeRingingCalls[key].status, call: activeRingingCalls[key] });
  }
  res.json({ status: 'ringing' });
});

// -------------------------------------------------------------------
// REAL-TIME CHAT RELAY ENGINE (Anti-Leak & 2-Way Message Store)
// -------------------------------------------------------------------

interface ChatMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'caller' | 'host';
  recipientId: string;
  recipientUsername: string;
  text: string;
  imageUrl?: string;
  timestamp: number;
  timeFormatted: string;
}

const chatDatabase: Record<string, ChatMessageItem[]> = {};

function getConvKey(u1: string, u2: string) {
  const c1 = (u1 || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const c2 = (u2 || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  return [c1, c2].sort().join('___');
}

// Send chat message
app.post('/api/chat/send', (req, res) => {
  const { senderId, senderName, senderRole, recipientId, recipientUsername, text, imageUrl } = req.body;
  if (!text && !imageUrl) {
    return res.status(400).json({ error: 'Message content required' });
  }

  // Anti-Leak validation on server
  if (text) {
    const hasDigits = /\d/.test(text);
    const wordNumbers = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ek|do|teen|char|paanch|chhe|saat|aath|nau|das)\b/i;
    const socialPlatforms = /\b(insta|instagram|snap|snapchat|telegram|wa\.me|whatsapp|fb|facebook|paytm|phonepe|gpay|call me|dm me|gmail|email)\b/i;
    if (hasDigits || wordNumbers.test(text) || socialPlatforms.test(text)) {
      return res.status(403).json({
        error: 'Policy Violation: Sharing numbers, phone contacts, or external handles is strictly prohibited.',
        policyViolation: true,
      });
    }
  }

  const convKey = getConvKey(senderName || senderId, recipientUsername || recipientId);
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const msg: ChatMessageItem = {
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    senderId: senderId || 'u_caller',
    senderName: senderName || 'User',
    senderRole: senderRole || 'caller',
    recipientId: recipientId || 'u_recipient',
    recipientUsername: recipientUsername || 'recipient',
    text: (text || '').trim(),
    imageUrl,
    timestamp: Date.now(),
    timeFormatted,
  };

  if (!chatDatabase[convKey]) chatDatabase[convKey] = [];
  chatDatabase[convKey].push(msg);

  // Relay real-time message via socket
  io.emit('chat_message_received', { convKey, message: msg });

  res.json({ success: true, message: msg });
});

// Get chat thread between 2 users
app.get('/api/chat/thread', (req, res) => {
  const { user1, user2 } = req.query;
  if (!user1 || !user2 || typeof user1 !== 'string' || typeof user2 !== 'string') {
    return res.json({ success: true, messages: [] });
  }
  const convKey = getConvKey(user1, user2);
  let messages = chatDatabase[convKey];
  if (!messages) {
    const c1 = user1.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const c2 = user2.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const matchedKey = Object.keys(chatDatabase).find(k => 
      (c1 && k.includes(c1)) || (c2 && k.includes(c2))
    );
    if (matchedKey) messages = chatDatabase[matchedKey];
  }
  res.json({ success: true, messages: messages || [] });
});

// Get host chat conversations list
app.get('/api/chat/host-conversations/:username', (req, res) => {
  const { username } = req.params;
  const cleanHost = username.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const matchingListener = mockListeners.find(l => l.username.toLowerCase() === username.toLowerCase());
  const cleanName = matchingListener ? matchingListener.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '') : '';

  const matchingKeys = Object.keys(chatDatabase).filter(k => 
    k.includes(cleanHost) || (cleanName && k.includes(cleanName))
  );
  const conversations: any[] = [];

  matchingKeys.forEach(k => {
    const msgs = chatDatabase[k];
    if (msgs && msgs.length > 0) {
      const lastMsg = msgs[msgs.length - 1];
      const otherPartyName = lastMsg.senderRole === 'host' ? (lastMsg.recipientUsername || 'Caller') : lastMsg.senderName;
      conversations.push({
        id: k,
        callerName: otherPartyName,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        lastMessage: lastMsg.text,
        time: lastMsg.timeFormatted,
        unread: lastMsg.senderRole === 'caller' ? 1 : 0,
        messages: msgs,
      });
    }
  });

  res.json({ success: true, conversations });
});

// Get caller chat conversations list
app.get('/api/chat/caller-conversations', (req, res) => {
  const { caller } = req.query;
  if (!caller || typeof caller !== 'string') {
    return res.json({ success: true, conversations: [] });
  }
  const cleanCaller = caller.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  const matchingKeys = Object.keys(chatDatabase).filter(k => k.includes(cleanCaller));
  const conversations: any[] = [];

  matchingKeys.forEach(k => {
    const msgs = chatDatabase[k];
    if (msgs && msgs.length > 0) {
      const lastMsg = msgs[msgs.length - 1];
      const hostUsernameOrId = (lastMsg.senderRole === 'host' ? (lastMsg.senderId || lastMsg.senderName) : (lastMsg.recipientUsername || lastMsg.recipientId)) || 'host';
      const matchedHost = mockListeners.find(l => 
        (l.username && hostUsernameOrId && l.username.toLowerCase() === hostUsernameOrId.toLowerCase()) ||
        (l.name && hostUsernameOrId && l.name.toLowerCase() === hostUsernameOrId.toLowerCase())
      ) || {
        id: `list_${hostUsernameOrId}`,
        name: lastMsg.senderRole === 'host' ? (lastMsg.senderName || 'Host') : (lastMsg.recipientUsername || 'Host'),
        username: hostUsernameOrId,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        callRatePerMinINR: 9,
        isVideoEnabled: true,
        status: 'online',
        languages: ['Hindi', 'English'],
        bio: 'Verified Host',
      };

      conversations.push({
        id: k,
        name: matchedHost.name,
        username: matchedHost.username,
        avatarUrl: matchedHost.avatarUrl,
        lastMessage: lastMsg.text || 'Photo message',
        time: lastMsg.timeFormatted,
        unread: lastMsg.senderRole === 'host' ? 1 : 0,
        online: (activeHostStatus[matchedHost.username] !== 'offline'),
        listener: matchedHost,
      });
    }
  });

  res.json({ success: true, conversations });
});

// Auto-sync host session on startup so host never disappears on server restart
app.post('/api/host/register-or-sync', (req, res) => {
  const { name, username, role, avatarUrl } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const cleanName = (name || 'Host').trim();
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '_');

  let existing = mockListeners.find(l => 
    l.username.toLowerCase() === cleanUsername.toLowerCase() ||
    l.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (existing) {
    existing.status = 'online';
    existing.isAvailableForCalls = true;
    activeHostStatus[existing.username] = 'online';
  } else {
    existing = {
      id: `list_${Date.now()}`,
      userId: `u_${Date.now()}`,
      username: cleanUsername,
      name: cleanName,
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      bio: 'Verified compassionate listener ready to talk and support you.',
      languages: ['Hindi', 'English'],
      callRatePerMinINR: 9,
      isVideoEnabled: true,
      status: 'online',
      rating: 5.0,
      totalReviews: 4,
      followersCount: 18,
      giftsCount: 3,
      voiceBioUrl: '',
      voiceBioDurationSeconds: 15,
      kycStatus: 'verified',
      panNumber: 'ABCDE1234F',
      isAvailableForCalls: true,
    };
    mockListeners.unshift(existing);
    activeHostStatus[cleanUsername] = 'online';
  }

  io.emit('listener_status_change', { listenerId: existing.id, status: 'online' });
  io.emit('listeners_updated', mockListeners);

  res.json({ success: true, listener: existing });
});

// Check if a call session was ended by either party
app.get('/api/calls/status', (req, res) => {
  const channel = req.query.channel as string;
  if (!channel) return res.json({ status: 'active', ended: false });
  const session = activeCallChannels[channel];
  if (session && session.status === 'ended') {
    return res.json({ status: 'ended', ended: true });
  }
  res.json({ status: 'active', ended: false });
});

// Start call session
app.post('/api/calls/start', (req, res) => {
  const { channel, caller, listener, type, ratePerMinINR } = req.body;
  if (channel) {
    activeCallChannels[channel] = { status: 'active', timestamp: Date.now() };
    const hostUser = channel.replace('call_', '');
    if (hostUser) {
      activeHostStatus[hostUser] = 'busy';
      io.emit('host_status_change', { hostUsername: hostUser, status: 'busy' });
      io.emit('listeners_updated', mockListeners);
    }
  }
  const existing = activeLiveSessions.find(s => s.channel === channel);
  if (!existing) {
    const newSess: LiveSession = {
      id: `sess-${Date.now()}`,
      channel: channel || `call_${Date.now()}`,
      caller: caller || 'Live Caller',
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
  const ratePerMin = callType === 'video' ? platformPricingSettings.videoCallRateINR : platformPricingSettings.audioCallRateINR;
  const hostRatePerMin = callType === 'video' ? platformPricingSettings.videoListenerPayoutINR : platformPricingSettings.audioListenerPayoutINR;
  const billedMinutes = Math.max(1, Math.ceil((Number(durationSeconds) || 0) / 60));
  const callerCharged = Number((billedMinutes * ratePerMin).toFixed(2));
  const hostEarned = Number((billedMinutes * hostRatePerMin).toFixed(2));
  const platformRetained = Number((callerCharged - hostEarned).toFixed(2));

  if (channel) {
    activeCallChannels[channel] = { status: 'ended', timestamp: Date.now() };
    io.emit('call_ended', { channel });

    const hostUser = channel.replace('call_', '');
    if (hostUser) {
      activeHostStatus[hostUser] = 'online';
      io.emit('host_status_change', { hostUsername: hostUser, status: 'online' });
      io.emit('listeners_updated', mockListeners);

      // Save to hostCallLogs
      if (!hostCallLogs[hostUser]) hostCallLogs[hostUser] = [];
      hostCallLogs[hostUser].unshift({
        id: `cl_${Date.now()}`,
        callerName: callerId || 'Caller',
        durationSeconds: Number(durationSeconds) || 60,
        earnedINR: hostEarned,
        callType: callType || 'audio',
        timestamp: Date.now(),
      });

      // Notify queued callers waiting for this host
      const waitingCallers = notifyQueue[hostUser] || [];
      if (waitingCallers.length > 0) {
        waitingCallers.forEach(q => {
          notifiedFreeAlerts[q.callerId] = {
            hostUsername: hostUser,
            hostName: hostUser,
            timestamp: Date.now(),
          };
        });
        io.emit('host_now_free', {
          hostUsername: hostUser,
          hostName: hostUser,
          callerIds: waitingCallers.map(q => q.callerId),
        });
        delete notifyQueue[hostUser];
      }
    }
  }

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
  const callerCharged = type === 'image' ? platformPricingSettings.chatImageMessageRateINR : platformPricingSettings.chatTextMessageRateINR;
  const hostEarned = Number((callerCharged * 0.5).toFixed(3)); // 50% split for host
  const platformRetained = Number((callerCharged - hostEarned).toFixed(3)); // 50% split for platform

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

let pendingKycApplications: KYCApplication[] = [];

app.get('/api/admin/dashboard', (req, res) => {
  const liveCount = activeLiveSessions.filter(s => s.status === 'active').length;
  const totalRechargeVolume = mockTransactions
    .filter(t => t.type === 'recharge' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amountINR, 0);

  res.json({
    activeCallsCount: liveCount,
    totalTalkersCount: mockUsers.length,
    totalVerifiedListeners: mockListeners.length,
    pendingKYCCount: pendingKycApplications.length,
    totalRechargeVolumeINR: totalRechargeVolume,
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
    listenerId: listener?.id || 'host',
    listenerName: listener?.name || 'Host',
    totalEarnedINR: listener?.totalEarnedINR || 0,
    availableBalanceINR: listener?.earningsBalanceINR || 0,
    totalWithdrawnINR: totalWithdrawn,
    pendingPayoutINR: pendingPayout,
    totalAudioMinutes: listener?.totalEarnedINR ? Math.round(((listener.totalEarnedINR) * 0.7) / 4.5) : 0,
    totalVideoMinutes: listener?.totalEarnedINR ? Math.round(((listener.totalEarnedINR) * 0.3) / 16.0) : 0,
    totalChatMessages: 0,
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
