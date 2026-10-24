import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Radio,
  PhoneCall,
  Video,
  Headphones,
  IndianRupee,
  ShieldCheck,
  Volume2,
  LogOut,
  ExternalLink,
  Sparkles,
  Users,
  CheckCircle2,
  Coins
} from 'lucide-react-native';
import { THEME } from '../theme';
import { getApiBaseUrl } from '../services/apiConfig';
import { IncomingCallModal } from './IncomingCallModal';

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
  const [isLive, setIsLive] = useState(true);
  const [totalEarningsINR, setTotalEarningsINR] = useState(0);
  const [completedCalls, setCompletedCalls] = useState(0);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [isChimePlaying, setIsChimePlaying] = useState(false);
  const ringAudioRef = useRef<any>(null);

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

  // Poll for incoming calls to this host every 1.5 seconds
  useEffect(() => {
    if (!isLive) return;

    let isMounted = true;
    const pollIncomingCalls = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const [res, listenersRes] = await Promise.all([
          fetch(`${baseUrl}/api/calls/check-incoming?username=${encodeURIComponent(hostUsername)}`),
          fetch(`${baseUrl}/api/listeners?search=${encodeURIComponent(hostUsername)}`),
        ]);

        if (res.ok) {
          const data = await res.json();
          if (data.hasIncoming && data.call && isMounted) {
            if (!incomingCall || incomingCall.timestamp !== data.call.timestamp) {
              setIncomingCall(data.call);
              playRingtone();
            }
          }
        }

        if (listenersRes.ok) {
          const listData = await listenersRes.json();
          if (Array.isArray(listData) && listData.length > 0 && isMounted) {
            const hostObj = listData.find((l: any) => l.username === hostUsername) || listData[0];
            if (hostObj) {
              setTotalEarningsINR(hostObj.totalEarnedINR || hostObj.earningsBalanceINR || 0);
              if (hostObj.totalCalls) setCompletedCalls(hostObj.totalCalls);
            }
          }
        }
      } catch (e) {}
    };

    pollIncomingCalls();
    const interval = setInterval(pollIncomingCalls, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [hostUsername, isLive, incomingCall]);

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

  return (
    <View style={styles.container}>
      {/* Top Host Live Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <View style={styles.brandBadge}>
            <Headphones size={18} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitle}>Chatzie Host Console</Text>
              <View style={styles.livePulseDot} />
            </View>
            <Text style={styles.brandSub}>Live Listener Terminal</Text>
          </View>
        </View>

        <View style={styles.topRight}>
          {/* Status Badge */}
          <TouchableOpacity
            style={[styles.statusBadge, isLive ? styles.statusBadgeOnline : styles.statusBadgeOffline]}
            onPress={() => setIsLive(!isLive)}
            activeOpacity={0.8}
          >
            <Radio size={14} color={isLive ? '#10B981' : '#94A3B8'} />
            <Text style={[styles.statusText, isLive ? styles.statusTextOnline : styles.statusTextOffline]}>
              {isLive ? 'ON AIR • READY FOR CALLS' : 'OFFLINE (PAUSED)'}
            </Text>
          </TouchableOpacity>

          {/* Reset / Log Out Button */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              if (typeof window !== 'undefined' && window.confirm) {
                if (window.confirm('Do you want to switch or log out from this host account?')) {
                  onLogout();
                }
              } else {
                onLogout();
              }
            }}
            activeOpacity={0.8}
            title="Log out or change role"
          >
            <LogOut size={15} color="#EF4444" />
            <Text style={styles.logoutText}>Change Role / Log out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Live Card */}
        <View style={styles.mainLiveCard}>
          {/* Radar Ring Glow with Host Avatar */}
          <View style={styles.radarContainer}>
            <View style={[styles.radarOuterCircle, isLive && styles.radarOuterActive]}>
              <View style={[styles.radarMidCircle, isLive && styles.radarMidActive]}>
                <Image source={{ uri: hostAvatar }} style={styles.hostAvatar} />
              </View>
            </View>
          </View>

          <Text style={styles.hostGreeting}>You are Live as {hostName}</Text>
          <Text style={styles.hostHandle}>@{hostUsername}</Text>

          <View style={styles.statusDescriptionBox}>
            <View style={styles.liveGreenPill}>
              <CheckCircle2 size={13} color="#10B981" />
              <Text style={styles.liveGreenText}>Host Profile Active on Chatzie Network</Text>
            </View>
            <Text style={styles.waitingNotice}>
              Keep this screen open on your Laptop. When callers on the phone app call your profile, you will instantly receive an incoming ring and can accept!
            </Text>
          </View>

          {/* Rates and Earning Share Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={styles.statIconCircle}>
                <PhoneCall size={18} color="#2563EB" />
              </View>
              <Text style={styles.statValue}>₹4.50/min</Text>
              <Text style={styles.statLabel}>Voice Call Earn Rate</Text>
              <Text style={styles.statSub}>Caller pays ₹9/min</Text>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: '#EDE9FE' }]}>
                <Video size={18} color="#7C3AED" />
              </View>
              <Text style={[styles.statValue, { color: '#7C3AED' }]}>₹16.00/min</Text>
              <Text style={styles.statLabel}>Video Call Earn Rate</Text>
              <Text style={styles.statSub}>Caller pays ₹30/min</Text>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <IndianRupee size={18} color="#059669" />
              </View>
              <Text style={[styles.statValue, { color: '#059669' }]}>
                ₹{totalEarningsINR.toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Today's Earnings</Text>
              <Text style={styles.statSub}>Instant UPI Settlement</Text>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Sparkles size={18} color="#D97706" />
              </View>
              <Text style={[styles.statValue, { color: '#D97706' }]}>{completedCalls}</Text>
              <Text style={styles.statLabel}>Calls Completed</Text>
              <Text style={styles.statSub}>4.9/5 Rating</Text>
            </View>
          </View>

          {/* Testing Actions */}
          <View style={styles.actionRow}>
            {/* Audio Test Chime */}
            <TouchableOpacity
              style={[styles.testBtn, isChimePlaying && styles.testBtnActive]}
              onPress={playRingtone}
              activeOpacity={0.8}
            >
              <Volume2 size={16} color={isChimePlaying ? '#FFFFFF' : '#2563EB'} />
              <Text style={[styles.testBtnText, isChimePlaying && styles.testBtnTextActive]}>
                {isChimePlaying ? 'Playing Test Ring...' : 'Test Speaker Chime'}
              </Text>
            </TouchableOpacity>

            {/* Open Phone/Caller Link */}
            <TouchableOpacity
              style={styles.openTabBtn}
              onPress={() => {
                if (typeof window !== 'undefined') {
                  const base = window.location.origin;
                  window.open(`${base}?autocall=${hostUsername}&type=video`, '_blank');
                }
              }}
              activeOpacity={0.8}
            >
              <ExternalLink size={15} color="#059669" />
              <Text style={styles.openTabText}>Open 2nd Window as Caller (Test 2-Way Call)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Real-Time How It Works Guide */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>How Real-Time 2-Device Testing Works:</Text>
          <View style={styles.guideStepRow}>
            <View style={styles.stepNumCircle}><Text style={styles.stepNum}>1</Text></View>
            <Text style={styles.stepText}>
              Keep this <Text style={{ fontWeight: '700', color: '#0F172A' }}>Laptop screen open</Text>. It is currently registered as <Text style={{ fontWeight: '700', color: '#2563EB' }}>@{hostUsername}</Text>.
            </Text>
          </View>
          <View style={styles.guideStepRow}>
            <View style={styles.stepNumCircle}><Text style={styles.stepNum}>2</Text></View>
            <Text style={styles.stepText}>
              On your <Text style={{ fontWeight: '700', color: '#0F172A' }}>Phone</Text>, open <Text style={{ fontWeight: '700', color: '#2563EB' }}>https://dpb8mjju5b.preview.c24.airoapp.ai/</Text>. Select <Text style={{ fontWeight: '700', color: '#059669' }}>Caller (Talker)</Text> and enter your name (gets ₹60 welcome balance).
            </Text>
          </View>
          <View style={styles.guideStepRow}>
            <View style={styles.stepNumCircle}><Text style={styles.stepNum}>3</Text></View>
            <Text style={styles.stepText}>
              On Phone, tap <Text style={{ fontWeight: '700', color: '#2563EB' }}>Video Call</Text> on <Text style={{ fontWeight: '700', color: '#2563EB' }}>{hostName}</Text>. Your Laptop will immediately ring!
            </Text>
          </View>
          <View style={styles.guideStepRow}>
            <View style={styles.stepNumCircle}><Text style={styles.stepNum}>4</Text></View>
            <Text style={styles.stepText}>
              Click <Text style={{ fontWeight: '700', color: '#16A34A' }}>Accept</Text> on Laptop. Both cameras will connect and you will see 2-way real-time video!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Incoming Call Ringing Modal */}
      {incomingCall && (
        <IncomingCallModal
          visible={true}
          callerName={incomingCall.callerName || 'Caller'}
          callerAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"
          callType={incomingCall.callType || 'video'}
          ratePerMin={incomingCall.callType === 'video' ? 16 : 4.5}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  brandSub: {
    fontSize: 12,
    color: '#64748B',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeOnline: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusBadgeOffline: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextOnline: {
    color: '#065F46',
  },
  statusTextOffline: {
    color: '#64748B',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  scrollContent: {
    padding: 24,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  mainLiveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    marginBottom: 20,
  },
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  radarOuterCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarOuterActive: {
    borderColor: '#93C5FD',
    backgroundColor: 'rgba(219, 234, 254, 0.2)',
  },
  radarMidCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarMidActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(219, 234, 254, 0.4)',
  },
  hostAvatar: {
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 3,
    borderColor: '#2563EB',
  },
  hostGreeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  hostHandle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  statusDescriptionBox: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 24,
    maxWidth: 580,
  },
  liveGreenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 10,
  },
  liveGreenText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  waitingNotice: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  statBox: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
    textAlign: 'center',
  },
  statSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
    justifyContent: 'center',
    width: '100%',
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  testBtnActive: {
    backgroundColor: '#2563EB',
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  testBtnTextActive: {
    color: '#FFFFFF',
  },
  openTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  openTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  guideStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginVertical: 6,
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
});
