import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import {
  Radio,
  PhoneCall,
  Video,
  Headphones,
  IndianRupee,
  ShieldCheck,
  ShieldAlert,
  Volume2,
  LogOut,
  ExternalLink,
  Sparkles,
  Users,
  CheckCircle2,
  Coins,
  MessageSquare,
  Clock,
  Wallet,
  ArrowUpRight,
  Search,
  Send,
  AlertCircle,
  TrendingUp,
  X,
  PhoneIncoming,
  PhoneMissed,
  CheckCheck,
  ArrowLeft,
} from 'lucide-react-native';
import { THEME } from '../theme';
import { getApiBaseUrl } from '../services/apiConfig';
import { IncomingCallModal } from './IncomingCallModal';

type HostTab = 'radar' | 'chats' | 'calls' | 'payouts';

interface HostLiveScreenProps {
  hostName: string;
  hostUsername: string;
  hostAvatar: string;
  onAcceptCall: (call: {
    channel: string;
    callerName: string;
    callerId: string;
    callType: 'audio' | 'video';
    ratePerMin: number;
  }) => void;
  onLogout: () => void;
}

export const HostLiveScreen: React.FC<HostLiveScreenProps> = ({
  hostName,
  hostUsername,
  hostAvatar,
  onAcceptCall,
  onLogout,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [activeTab, setActiveTab] = useState<HostTab>('radar');
  const [isLive, setIsLive] = useState(true);
  const [totalEarningsINR, setTotalEarningsINR] = useState(0.00);
  const [availableBalanceINR, setAvailableBalanceINR] = useState(0.00);
  const [completedCallsCount, setCompletedCallsCount] = useState(0);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [isChimePlaying, setIsChimePlaying] = useState(false);

  // Workstation Data
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [missedCalls, setMissedCalls] = useState<any[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [isLoadingWorkstation, setIsLoadingWorkstation] = useState(false);

  // Payout Form State
  const [payoutAmount, setPayoutAmount] = useState('200');
  const [payoutUPI, setPayoutUPI] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');

  // Host Chat Inbox State
  const [chatConversations, setChatConversations] = useState<any[]>([]);
  const [activeChatCaller, setActiveChatCaller] = useState<any>(null);
  const [hostReplyText, setHostReplyText] = useState('');
  const [policyViolationModal, setPolicyViolationModal] = useState<{ visible: boolean; reason: string }>({
    visible: false,
    reason: '',
  });

  const latestCallerMsgTime = useRef<number>(0);
  const [newMsgToast, setNewMsgToast] = useState<{ visible: boolean; sender: string; text: string } | null>(null);

  // Pleasant message chime for new incoming chat message (Web Audio API)
  const playMessagePing = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const freqs = [587.33, 880]; // D5, A5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = ctx.currentTime + idx * 0.12;
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch (e) {}
  };

  // Audio Chime Player for testing speakers & incoming ring
  const playRingtone = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      setIsChimePlaying(true);

      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + idx * 0.15;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });

      setTimeout(() => setIsChimePlaying(false), 800);
    } catch (err) {
      console.warn('Ring chime notice:', err);
    }
  };

  // Fetch Workstation Operational Data & Real-Time Chats
  const loadWorkstationData = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const [res, chatRes] = await Promise.all([
        fetch(`${baseUrl}/api/host/workstation-data/${encodeURIComponent(hostUsername)}`),
        fetch(`${baseUrl}/api/chat/host-conversations/${encodeURIComponent(hostUsername)}`),
      ]);

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (typeof data.totalEarnedINR === 'number') setTotalEarningsINR(data.totalEarnedINR);
          if (typeof data.earningsBalanceINR === 'number') setAvailableBalanceINR(data.earningsBalanceINR);
          if (Array.isArray(data.callLogs)) {
            setCallLogs(data.callLogs);
            setCompletedCallsCount(data.callLogs.length);
          }
          if (Array.isArray(data.missedCalls)) setMissedCalls(data.missedCalls);
          if (Array.isArray(data.payoutHistory)) setPayoutHistory(data.payoutHistory);
        }
      }

      if (chatRes.ok) {
        const chatData = await chatRes.json();
        if (chatData.success && Array.isArray(chatData.conversations)) {
          // Normalize messages to guarantee sender consistency
          const cleanConvs = chatData.conversations.map((conv: any) => ({
            ...conv,
            messages: (conv.messages || []).map((m: any) => ({
              ...m,
              sender: (m.sender === 'host' || m.senderRole === 'host' || m.senderId === hostUsername) ? 'host' : 'caller',
              senderRole: (m.sender === 'host' || m.senderRole === 'host' || m.senderId === hostUsername) ? 'host' : 'caller',
              time: m.time || m.timeFormatted || 'Just now',
            })),
          }));
          setChatConversations(cleanConvs);

          // Check if any conversation has a new caller message
          let newestCallerMsg: any = null;
          cleanConvs.forEach((conv: any) => {
            if (Array.isArray(conv.messages)) {
              conv.messages.forEach((m: any) => {
                if (m.senderRole === 'caller' && m.timestamp && m.timestamp > (newestCallerMsg?.timestamp || 0)) {
                  newestCallerMsg = m;
                }
              });
            }
          });

          if (newestCallerMsg && newestCallerMsg.timestamp > latestCallerMsgTime.current) {
            if (latestCallerMsgTime.current !== 0) {
              playMessagePing();
              setNewMsgToast({
                visible: true,
                sender: newestCallerMsg.senderName,
                text: newestCallerMsg.text || 'Sent a photo message',
              });
              setTimeout(() => setNewMsgToast(null), 5000);

              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(`Chatzie • ${newestCallerMsg.senderName}`, {
                    body: newestCallerMsg.text || 'Sent a photo message',
                    icon: '/favicon.ico',
                  });
                } catch (e) {}
              }
            }
            latestCallerMsgTime.current = newestCallerMsg.timestamp;
          }

          setActiveChatCaller((prevActive: any) => {
            if (!prevActive) return isMobile ? null : (cleanConvs[0] || null);
            const updated = cleanConvs.find((c: any) => c.id === prevActive.id);
            return updated || prevActive;
          });
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadWorkstationData();
    const interval = setInterval(loadWorkstationData, 2000);
    return () => clearInterval(interval);
  }, [hostUsername]);

  // Poll for incoming calls to this host every 1.2 seconds
  useEffect(() => {
    if (!isLive) return;

    let isMounted = true;
    const pollIncomingCalls = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/calls/check-incoming?username=${encodeURIComponent(hostUsername)}`);

        if (res.ok) {
          const data = await res.json();
          if (data.hasIncoming && data.call && isMounted) {
            if (!incomingCall || incomingCall.timestamp !== data.call.timestamp) {
              setIncomingCall(data.call);
              playRingtone();
            }
          }
        }
      } catch (e) {}
    };

    pollIncomingCalls();
    const interval = setInterval(pollIncomingCalls, 1200);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [hostUsername, isLive, incomingCall]);

  const handleToggleOnline = async () => {
    const nextState = !isLive;
    setIsLive(nextState);
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/host/toggle-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostUsername, isOnline: nextState }),
      });
    } catch (e) {}
  };

  const handleAccept = async () => {
    if (!incomingCall) return;
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/calls/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: hostUsername }),
      });
    } catch (e) {}

    const callToJoin = { ...incomingCall };
    setIncomingCall(null);
    onAcceptCall(callToJoin);
  };

  const handleDecline = async () => {
    if (!incomingCall) return;
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/calls/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: hostUsername }),
      });
    } catch (e) {}
    setIncomingCall(null);
  };

  // Submit UPI Payout Request
  const handleSubmitPayout = async () => {
    const amount = Number(payoutAmount);
    if (!amount || amount < 200) {
      Alert.alert('Invalid Amount', 'Minimum withdrawal request is ₹200.00');
      return;
    }
    if (amount > availableBalanceINR) {
      Alert.alert('Insufficient Balance', `Available balance is ₹${availableBalanceINR.toFixed(2)}`);
      return;
    }
    if (!payoutUPI.trim() || !payoutUPI.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g. yourname@okaxis or mobile@paytm)');
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/host/request-payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostUsername,
          amountINR: amount,
          upiId: payoutUPI.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPayoutSuccessMsg(data.message || `Withdrawal request for ₹${amount} submitted!`);
        setAvailableBalanceINR(prev => Math.max(0, prev - amount));
        loadWorkstationData();
        setTimeout(() => setPayoutSuccessMsg(''), 5000);
      }
    } catch (e) {
      Alert.alert('Network Notice', 'Withdrawal request recorded in local workstation.');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  // Anti-Leak & Personal Data Sharing Filter
  const validateAndSendHostReply = () => {
    if (!hostReplyText.trim() || !activeChatCaller) return;

    const text = hostReplyText;

    // 1. Strict numeric digits check (phone numbers, 10 digits, spaced digits)
    const hasDigits = /\d/.test(text);
    // 2. Word numbers
    const wordNumbers = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ek|do|teen|char|paanch|chhe|saat|aath|nau|das)\b/i;
    // 3. Social media handles
    const socialPlatforms = /\b(insta|instagram|snap|snapchat|telegram|wa\.me|whatsapp|fb|facebook|paytm|phonepe|gpay|call me|dm me|gmail|email)\b/i;

    if (hasDigits || wordNumbers.test(text) || socialPlatforms.test(text)) {
      setPolicyViolationModal({
        visible: true,
        reason: 'Numeric digits, phone numbers, and social media handles are strictly prohibited. Sharing personal contact information causes permanent account termination.',
      });
      return;
    }

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'host',
      senderRole: 'host',
      senderId: hostUsername,
      senderName: hostName,
      text: hostReplyText.trim(),
      time: 'Just now',
      timeFormatted: 'Just now',
    };

    setChatConversations(prev =>
      prev.map(c => {
        if (c.id === activeChatCaller.id) {
          return {
            ...c,
            lastMessage: hostReplyText.trim(),
            time: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setActiveChatCaller((prev: any) => ({
      ...prev,
      messages: [...prev.messages, newMsg],
    }));

    const replyToSend = hostReplyText.trim();
    setHostReplyText('');
    setTotalEarningsINR(e => Number((e + 0.125).toFixed(2)));
    setAvailableBalanceINR(e => Number((e + 0.125).toFixed(2)));

    // Send to backend real-time chat relay
    try {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: hostUsername,
          senderName: hostName,
          senderRole: 'host',
          recipientId: activeChatCaller.callerName,
          recipientUsername: activeChatCaller.callerName,
          text: replyToSend,
        }),
      });
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      {/* Top Host Live Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <View style={styles.brandBadge}>
            <Headphones size={20} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitle}>Chatzie Host Console</Text>
              <View style={[styles.livePulseDot, !isLive && styles.pulseDotOffline]} />
            </View>
            <Text style={styles.brandSub}>
              {hostName || 'Host'} • @{hostUsername || 'host'}
            </Text>
          </View>
        </View>

        <View style={styles.topRight}>
          {/* Quick Balance Pill */}
          <View style={styles.earningsPill}>
            <TrendingUp size={13} color="#10B981" />
            <Text style={styles.earningsPillText}>Earned: ₹{(totalEarningsINR || 0).toFixed(2)}</Text>
          </View>

          {/* Online / Offline Toggle */}
          <TouchableOpacity
            style={[styles.statusBadge, isLive ? styles.statusBadgeOnline : styles.statusBadgeOffline]}
            onPress={handleToggleOnline}
            activeOpacity={0.8}
          >
            <Radio size={14} color={isLive ? '#10B981' : '#94A3B8'} />
            <Text style={[styles.statusText, isLive ? styles.statusTextOnline : styles.statusTextOffline]}>
              {isLive ? 'ON AIR' : 'PAUSED'}
            </Text>
          </TouchableOpacity>

          {/* Log Out */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              if (typeof window !== 'undefined' && window.confirm) {
                if (window.confirm('Do you want to log out from this host account?')) {
                  onLogout();
                }
              } else {
                onLogout();
              }
            }}
            activeOpacity={0.8}
            title="Log out or switch account"
          >
            <LogOut size={15} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Incoming Caller Message Toast Notification */}
      {newMsgToast && (
        <TouchableOpacity
          style={styles.floatingMsgToast}
          onPress={() => {
            setActiveTab('chats');
            const target = chatConversations.find(c => c.callerName.toLowerCase().includes(newMsgToast.sender.toLowerCase()));
            if (target) setActiveChatCaller(target);
            setNewMsgToast(null);
          }}
          activeOpacity={0.9}
        >
          <View style={styles.toastIconBox}>
            <MessageSquare size={18} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toastTitle}>New message from {newMsgToast.sender}</Text>
            <Text style={styles.toastSub} numberOfLines={1}>{newMsgToast.text}</Text>
          </View>
          <Text style={styles.toastAction}>Reply →</Text>
        </TouchableOpacity>
      )}

      {/* Host Navigation Tabs (Workstation) */}
      <View style={{ backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navTabsBar}
        >
          <TouchableOpacity
            style={[styles.navTabBtn, activeTab === 'radar' && styles.navTabBtnActive]}
            onPress={() => setActiveTab('radar')}
            activeOpacity={0.85}
          >
            <Radio size={16} color={activeTab === 'radar' ? '#2563EB' : '#64748B'} />
            <Text style={[styles.navTabText, activeTab === 'radar' && styles.navTabTextActive]}>
              Live Radar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTabBtn, activeTab === 'chats' && styles.navTabBtnActive]}
            onPress={() => setActiveTab('chats')}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MessageSquare size={16} color={activeTab === 'chats' ? '#2563EB' : '#64748B'} />
              <View style={styles.unreadCountBadge}>
                <Text style={styles.unreadCountText}>1</Text>
              </View>
            </View>
            <Text style={[styles.navTabText, activeTab === 'chats' && styles.navTabTextActive]}>
              Caller Chats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTabBtn, activeTab === 'calls' && styles.navTabBtnActive]}
            onPress={() => setActiveTab('calls')}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <PhoneIncoming size={16} color={activeTab === 'calls' ? '#2563EB' : '#64748B'} />
              {missedCalls.length > 0 && (
                <View style={[styles.unreadCountBadge, { backgroundColor: '#EF4444' }]}>
                  <Text style={styles.unreadCountText}>{missedCalls.length}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.navTabText, activeTab === 'calls' && styles.navTabTextActive]}>
              Call Logs & Queue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTabBtn, activeTab === 'payouts' && styles.navTabBtnActive]}
            onPress={() => setActiveTab('payouts')}
            activeOpacity={0.85}
          >
            <Wallet size={16} color={activeTab === 'payouts' ? '#2563EB' : '#64748B'} />
            <Text style={[styles.navTabText, activeTab === 'payouts' && styles.navTabTextActive]}>
              Earnings & UPI
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ============================================================== */}
      {/* TAB 1: LIVE RADAR (Workstation Console) */}
      {/* ============================================================== */}
      {activeTab === 'radar' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Radar Card */}
          <View style={styles.mainLiveCard}>
            <View style={styles.radarContainer}>
              <View style={[styles.radarOuterCircle, isLive && styles.radarOuterActive]}>
                <View style={[styles.radarMidCircle, isLive && styles.radarMidActive]}>
                  <Image source={{ uri: hostAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' }} style={styles.hostAvatar} />
                </View>
              </View>
            </View>

            <Text style={styles.hostGreeting}>
              {isLive ? `You are Live on Chatzie` : `Your Console is Paused`}
            </Text>
            <Text style={styles.hostHandle}>@{hostUsername || 'host'} • Verified Host</Text>

            <View style={styles.statusDescriptionBox}>
              <View style={[styles.liveGreenPill, !isLive && styles.liveGreenPillOffline]}>
                <CheckCircle2 size={13} color={isLive ? '#10B981' : '#64748B'} />
                <Text style={[styles.liveGreenText, !isLive && { color: '#475569' }]}>
                  {isLive ? 'Active on Chatzie Network • Ready for Calls' : 'Offline • Callers see you as Offline'}
                </Text>
              </View>
              <Text style={styles.waitingNotice}>
                {isLive
                  ? 'Keep this screen open on your Laptop. When callers tap Video or Audio Call on your profile, you will hear a chime and an incoming call modal will pop up.'
                  : 'You are currently paused. Callers cannot connect with you until you toggle "ON AIR" back on.'}
              </Text>
            </View>

            {/* Chime & Test Speakers Button */}
            <TouchableOpacity
              style={[styles.testAudioBtn, isChimePlaying && styles.testAudioBtnActive]}
              onPress={playRingtone}
              activeOpacity={0.85}
            >
              <Volume2 size={16} color={isChimePlaying ? '#10B981' : '#2563EB'} />
              <Text style={styles.testAudioBtnText}>
                {isChimePlaying ? 'Playing Ringtone Chime...' : 'Test Incoming Ringtone'}
              </Text>
            </TouchableOpacity>

            {/* Rates and Earning Share Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <View style={styles.statIconCircle}>
                  <PhoneCall size={18} color="#2563EB" />
                </View>
                <Text style={styles.statValue}>₹4.50/min</Text>
                <Text style={styles.statLabel}>Voice Call Earn Rate</Text>
                <Text style={styles.statSub}>Caller billed ₹9.00/min</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Video size={18} color="#059669" />
                </View>
                <Text style={[styles.statValue, { color: '#059669' }]}>₹16.00/min</Text>
                <Text style={styles.statLabel}>Video Call Earn Rate</Text>
                <Text style={styles.statSub}>Caller billed ₹30.00/min</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <MessageSquare size={18} color="#D97706" />
                </View>
                <Text style={[styles.statValue, { color: '#D97706' }]}>₹0.125 / msg</Text>
                <Text style={styles.statLabel}>Chat Message Earn</Text>
                <Text style={styles.statSub}>Caller billed ₹0.25 / text</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIconCircle, { backgroundColor: '#F3E8FF' }]}>
                  <IndianRupee size={18} color="#7C3AED" />
                </View>
                <Text style={[styles.statValue, { color: '#7C3AED' }]}>₹{(availableBalanceINR || 0).toFixed(2)}</Text>
                <Text style={styles.statLabel}>Available for UPI</Text>
                <Text style={styles.statSub}>Total: ₹{(totalEarningsINR || 0).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CALLER CHATS (Host Paid Inbox & Anti-Leak) */}
      {/* ============================================================== */}
      {activeTab === 'chats' && (
        <View style={styles.chatContainer}>
          {/* Left / Conversation List (Visible on desktop OR on mobile when no caller is selected) */}
          {(!isMobile || !activeChatCaller) && (
            <View style={[styles.chatListPane, isMobile && { width: '100%', borderRightWidth: 0 }]}>
              <View style={styles.chatListHeader}>
                <Text style={styles.paneTitle}>Caller Messages</Text>
                <Text style={styles.paneSub}>Earn ₹0.125 per text reply</Text>
              </View>

              <ScrollView>
                {chatConversations.length > 0 ? (
                  chatConversations.map(c => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.conversationItem,
                        activeChatCaller?.id === c.id && styles.conversationItemActive,
                      ]}
                      onPress={() => setActiveChatCaller(c)}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: c.avatar }} style={styles.callerAvatar} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <View style={styles.convHeaderRow}>
                          <Text style={styles.callerNameText}>{c.callerName}</Text>
                          <Text style={styles.convTimeText}>{c.time}</Text>
                        </View>
                        <Text style={styles.convLastMsg} numberOfLines={1}>
                          {c.lastMessage}
                        </Text>
                      </View>
                      {c.unread > 0 && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={{ padding: 32, alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={36} color="#94A3B8" />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748B', marginTop: 12 }}>
                      No Conversations Yet
                    </Text>
                    <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
                      When callers send you a message, they will appear here in real-time.
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {/* Right / Message Detail Thread (Visible on desktop OR on mobile when a caller is selected) */}
          {(!isMobile || activeChatCaller) && (
            <View style={[styles.chatThreadPane, isMobile && { width: '100%' }]}>
              {activeChatCaller ? (
                <View style={{ flex: 1 }}>
                  {/* Thread Header */}
                  <View style={styles.threadHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {isMobile && (
                        <TouchableOpacity
                          onPress={() => setActiveChatCaller(null)}
                          style={{ marginRight: 10, padding: 4 }}
                          activeOpacity={0.7}
                        >
                          <ArrowLeft size={20} color="#0F172A" />
                        </TouchableOpacity>
                      )}
                      <Image source={{ uri: activeChatCaller.avatar }} style={styles.smallAvatar} />
                      <View style={{ marginLeft: 8 }}>
                        <Text style={styles.threadCallerName}>{activeChatCaller.callerName}</Text>
                        <Text style={styles.threadSub}>Caller • Active 1:1 Session</Text>
                      </View>
                    </View>

                    <View style={styles.threadSecurityBadge}>
                      <ShieldCheck size={12} color="#10B981" />
                      <Text style={styles.threadSecurityText}>Anti-Leak AI Active</Text>
                    </View>
                  </View>

                  {/* Messages View */}
                  <ScrollView contentContainerStyle={styles.messagesScroll}>
                    {activeChatCaller.messages.map((m: any) => {
                      const isHostMsg = m.sender === 'host' || m.senderRole === 'host' || m.senderId === hostUsername;
                      return (
                        <View
                          key={m.id}
                          style={[
                            styles.messageBubble,
                            isHostMsg ? styles.bubbleHost : styles.bubbleCaller,
                          ]}
                        >
                          <Text
                            style={[
                              styles.messageText,
                              isHostMsg ? styles.msgTextHost : styles.msgTextCaller,
                            ]}
                          >
                            {m.text}
                          </Text>
                          <Text
                            style={[
                              styles.msgTime,
                              isHostMsg ? styles.msgTimeHost : styles.msgTimeCaller,
                            ]}
                          >
                            {m.time || m.timeFormatted || 'Just now'}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>

                  {/* Input Bar with Anti-Leak Filter */}
                  <View style={styles.hostChatInputBar}>
                    <TextInput
                      style={styles.chatTextInput}
                      placeholder="Type your reply (Numbers & personal handles blocked)..."
                      placeholderTextColor="#94A3B8"
                      value={hostReplyText}
                      onChangeText={setHostReplyText}
                    />
                    <TouchableOpacity
                      style={styles.sendMsgBtn}
                      onPress={validateAndSendHostReply}
                      activeOpacity={0.85}
                    >
                      <Send size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyThreadState}>
                  <MessageSquare size={36} color="#94A3B8" />
                  <Text style={styles.emptyThreadTitle}>Select a Conversation</Text>
                  <Text style={styles.emptyThreadSub}>
                    Click on any caller on the left to read messages and reply.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CALL LOGS & MISSED CALLS (Queue & History) */}
      {/* ============================================================== */}
      {activeTab === 'calls' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Missed Calls Section */}
          <View style={styles.logSectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <PhoneMissed size={18} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>Missed Calls & Queue</Text>
              </View>
              <Text style={styles.sectionBadgeText}>{missedCalls.length} Missed</Text>
            </View>
            <Text style={styles.sectionSub}>
              Callers who tried calling while you were talking or away. Message them to convert into paid calls!
            </Text>

            {missedCalls.length > 0 ? (
              missedCalls.map((mc, idx) => (
                <View key={idx} style={styles.missedCallRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.missedIconBox}>
                      <PhoneMissed size={14} color="#EF4444" />
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.missedCallerName}>{mc.callerName}</Text>
                      <Text style={styles.missedCallerSub}>Tried calling while you were busy</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.callbackBtn}
                    onPress={() => {
                      setActiveTab('chats');
                    }}
                    activeOpacity={0.85}
                  >
                    <MessageSquare size={13} color="#2563EB" />
                    <Text style={styles.callbackBtnText}>Message</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyLogRow}>
                <CheckCircle2 size={16} color="#10B981" />
                <Text style={styles.emptyLogText}>No missed calls. All callers were answered!</Text>
              </View>
            )}
          </View>

          {/* Completed Calls Log Section */}
          <View style={[styles.logSectionCard, { marginTop: 16 }]}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <PhoneIncoming size={18} color="#10B981" style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>Completed Call History</Text>
              </View>
              <Text style={styles.sectionBadgeText}>{callLogs.length} Total Calls</Text>
            </View>

            {callLogs.length > 0 ? (
              callLogs.map((cl, idx) => (
                <View key={idx} style={styles.callLogRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={[
                        styles.callTypeBadge,
                        cl.callType === 'video' ? styles.callTypeVideo : styles.callTypeAudio,
                      ]}
                    >
                      {cl.callType === 'video' ? (
                        <Video size={14} color="#059669" />
                      ) : (
                        <PhoneCall size={14} color="#2563EB" />
                      )}
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.callLogName}>{cl.callerName}</Text>
                      <Text style={styles.callLogSub}>
                        {cl.callType === 'video' ? 'Video Call' : 'Voice Call'} •{' '}
                        {Math.floor(cl.durationSeconds / 60)}m {cl.durationSeconds % 60}s
                      </Text>
                    </View>
                  </View>

                  <View style={styles.callLogEarning}>
                    <Text style={styles.callLogEarningAmount}>+₹{(cl.earnedINR || 0).toFixed(2)}</Text>
                    <Text style={styles.callLogEarningLabel}>Credited to Wallet</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyLogRow}>
                <Clock size={16} color="#94A3B8" />
                <Text style={styles.emptyLogText}>No calls completed yet. When callers dial, history will show here.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* ============================================================== */}
      {/* TAB 4: EARNINGS & INSTANT UPI WITHDRAWAL */}
      {/* ============================================================== */}
      {activeTab === 'payouts' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Earnings Overview Cards */}
          <View style={styles.payoutOverviewGrid}>
            <View style={styles.payoutCard}>
              <Text style={styles.payoutCardLabel}>Available for Withdrawal</Text>
              <Text style={styles.payoutCardValue}>₹{(availableBalanceINR || 0).toFixed(2)}</Text>
              <Text style={styles.payoutCardSub}>Instant transfer to your registered UPI</Text>
            </View>

            <View style={styles.payoutCard}>
              <Text style={styles.payoutCardLabel}>Lifetime Host Earnings</Text>
              <Text style={[styles.payoutCardValue, { color: '#059669' }]}>
                ₹{(totalEarningsINR || 0).toFixed(2)}
              </Text>
              <Text style={styles.payoutCardSub}>Across {completedCallsCount} completed calls</Text>
            </View>
          </View>

          {/* Success Message */}
          {payoutSuccessMsg ? (
            <View style={styles.payoutSuccessBanner}>
              <CheckCircle2 size={16} color="#065F46" />
              <Text style={styles.payoutSuccessText}>{payoutSuccessMsg}</Text>
            </View>
          ) : null}

          {/* Request UPI Withdrawal Form */}
          <View style={styles.payoutFormCard}>
            <View style={styles.formCardHeader}>
              <ArrowUpRight size={18} color="#2563EB" />
              <Text style={styles.formCardTitle}>Request Instant UPI Withdrawal</Text>
            </View>
            <Text style={styles.formCardSub}>
              Payouts are processed directly to your bank account via UPI. Minimum withdrawal is ₹200.
            </Text>

            <View style={styles.formFieldGroup}>
              <Text style={styles.fieldLabel}>Withdrawal Amount (INR)</Text>
              <View style={styles.inputBox}>
                <IndianRupee size={16} color="#64748B" style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.fieldInput}
                  keyboardType="numeric"
                  value={payoutAmount}
                  onChangeText={setPayoutAmount}
                  placeholder="500"
                />
              </View>
            </View>

            <View style={styles.formFieldGroup}>
              <Text style={styles.fieldLabel}>Your UPI ID (VPA)</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.fieldInput}
                  value={payoutUPI}
                  onChangeText={setPayoutUPI}
                  placeholder="mobile@paytm or yourname@okaxis"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitPayoutBtn}
              onPress={handleSubmitPayout}
              disabled={isSubmittingPayout}
              activeOpacity={0.85}
            >
              {isSubmittingPayout ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitPayoutBtnText}>Submit UPI Payout Request</Text>
                  <ArrowUpRight size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Payout History */}
          <View style={[styles.logSectionCard, { marginTop: 16 }]}>
            <Text style={styles.sectionTitle}>Settlement & Payout History</Text>
            {payoutHistory.length > 0 ? (
              payoutHistory.map((po, idx) => (
                <View key={idx} style={styles.callLogRow}>
                  <View>
                    <Text style={styles.callLogName}>₹{(po.amountINR || 0).toFixed(2)} via UPI</Text>
                    <Text style={styles.callLogSub}>{po.upiId || 'host@upi'} • {po.requestedAt?.split('T')[0] || 'Today'}</Text>
                  </View>
                  <View style={[styles.payoutStatusPill, po.status === 'approved' ? styles.statusApproved : styles.statusPending]}>
                    <Text style={[styles.payoutStatusText, po.status === 'approved' ? { color: '#065F46' } : { color: '#92400E' }]}>
                      {po.status === 'approved' ? 'Settled (Paid)' : 'Pending Approval'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyLogRow}>
                <Clock size={16} color="#94A3B8" />
                <Text style={styles.emptyLogText}>No past withdrawal requests yet.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* ============================================================== */}
      {/* INCOMING CALL MODAL (Ring on Laptop) */}
      {/* ============================================================== */}
      {incomingCall && (
        <IncomingCallModal
          visible={!!incomingCall}
          callerName={incomingCall.callerName || 'Caller'}
          callerAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"
          callType={incomingCall.callType || 'audio'}
          ratePerMin={incomingCall.callType === 'video' ? 16 : 4.5}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}

      {/* ============================================================== */}
      {/* ANTI-LEAK SECURITY POLICY MODAL */}
      {/* ============================================================== */}
      <Modal
        visible={policyViolationModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setPolicyViolationModal({ visible: false, reason: '' })}
      >
        <View style={styles.policyModalOverlay}>
          <View style={styles.policyModalCard}>
            <View style={styles.policyAlertIconCircle}>
              <ShieldAlert size={32} color="#DC2626" />
            </View>
            <Text style={styles.policyModalTitle}>Policy Violation Detected</Text>
            <Text style={styles.policyModalBody}>
              {policyViolationModal.reason}
            </Text>
            <View style={styles.policyNoticeBox}>
              <AlertCircle size={14} color="#B91C1C" />
              <Text style={styles.policyNoticeText}>
                Zero Tolerance Policy: Exchanging WhatsApp, Phone Numbers, or Instagram outside Chatzie leads to immediate permanent ban and confiscation of earnings.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.policyAcknowledgeBtn}
              onPress={() => setPolicyViolationModal({ visible: false, reason: '' })}
              activeOpacity={0.85}
            >
              <Text style={styles.policyAcknowledgeText}>I Understand & Agree</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  floatingMsgToast: {
    position: 'absolute',
    top: 68,
    left: 16,
    right: 16,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  toastIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  toastSub: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  toastAction: {
    fontSize: 12,
    fontWeight: '800',
    color: '#60A5FA',
    paddingHorizontal: 8,
  },
  topBar: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginLeft: 8,
  },
  pulseDotOffline: {
    backgroundColor: '#94A3B8',
  },
  brandSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  earningsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#059669',
  },
  earningsPillText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  statusBadgeOffline: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: '#64748B',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  statusTextOnline: {
    color: '#10B981',
  },
  statusTextOffline: {
    color: '#94A3B8',
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTabsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  navTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginRight: 8,
  },
  navTabBtnActive: {
    borderBottomColor: '#2563EB',
  },
  navTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  navTabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  unreadCountBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 4,
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
  },
  mainLiveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  radarContainer: {
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarOuterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarOuterActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  radarMidCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarMidActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  hostAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  hostGreeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  hostHandle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  statusDescriptionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  liveGreenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveGreenPillOffline: {
    backgroundColor: '#F1F5F9',
  },
  liveGreenText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    marginLeft: 6,
  },
  waitingNotice: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  testAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  testAudioBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  testAudioBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  statBox: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  statSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  // Chat Tab Styles
  chatContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  chatListPane: {
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  chatListHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paneTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  paneSub: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  conversationItemActive: {
    backgroundColor: '#EFF6FF',
  },
  callerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  convHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callerNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  convTimeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  convLastMsg: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 6,
  },
  chatThreadPane: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  threadHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  smallAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  threadCallerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  threadSub: {
    fontSize: 11,
    color: '#64748B',
  },
  threadSecurityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  threadSecurityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
    marginLeft: 4,
  },
  messagesScroll: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleHost: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleCaller: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  msgTextHost: {
    color: '#FFFFFF',
  },
  msgTextCaller: {
    color: '#0F172A',
  },
  msgTime: {
    fontSize: 10,
    marginTop: 4,
  },
  msgTimeHost: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  msgTimeCaller: {
    color: '#94A3B8',
  },
  hostChatInputBar: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  sendMsgBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyThreadState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyThreadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  emptyThreadSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 260,
  },
  // Call Logs & Missed Calls Tab Styles
  logSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 12,
  },
  missedCallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  missedIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missedCallerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  missedCallerSub: {
    fontSize: 11,
    color: '#64748B',
  },
  callbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  callbackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    marginLeft: 4,
  },
  emptyLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    justifyContent: 'center',
    gap: 8,
  },
  emptyLogText: {
    fontSize: 13,
    color: '#64748B',
  },
  callLogRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  callTypeBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callTypeVideo: {
    backgroundColor: '#ECFDF5',
  },
  callTypeAudio: {
    backgroundColor: '#EFF6FF',
  },
  callLogName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  callLogSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  callLogEarning: {
    alignItems: 'flex-end',
  },
  callLogEarningAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  callLogEarningLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  // Payout Tab Styles
  payoutOverviewGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  payoutCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  payoutCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  payoutCardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563EB',
    marginTop: 4,
  },
  payoutCardSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  payoutSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 8,
  },
  payoutSuccessText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  payoutFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  formCardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
  },
  formFieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
  },
  fieldInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  submitPayoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  submitPayoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  payoutStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusApproved: {
    backgroundColor: '#ECFDF5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  payoutStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // Policy Modal
  policyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  policyModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  policyAlertIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  policyModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 8,
  },
  policyModalBody: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  policyNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  policyNoticeText: {
    fontSize: 11,
    color: '#991B1B',
    lineHeight: 16,
    flex: 1,
  },
  policyAcknowledgeBtn: {
    backgroundColor: '#DC2626',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  policyAcknowledgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
