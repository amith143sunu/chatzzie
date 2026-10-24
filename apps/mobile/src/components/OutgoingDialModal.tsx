import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { PhoneOff, Video, Phone, Radio, Sparkles } from 'lucide-react-native';
import { ListenerProfile } from '@chatzie/shared';
import { getApiBaseUrl } from '../services/apiConfig';

interface OutgoingDialModalProps {
  visible: boolean;
  listener: ListenerProfile;
  callType: 'audio' | 'video';
  channelName: string;
  onAccepted: () => void;
  onDeclined: () => void;
  onCancel: () => void;
}

export const OutgoingDialModal: React.FC<OutgoingDialModalProps> = ({
  visible,
  listener,
  callType,
  channelName,
  onAccepted,
  onDeclined,
  onCancel,
}) => {
  const dialToneInterval = useRef<any>(null);

  // Realistic phone dial tone generator using Web Audio API
  const playDialTone = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Dual frequency ring tone (440Hz + 480Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = 440;
      osc2.frequency.value = 480;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    } catch (e) {}
  };

  useEffect(() => {
    if (!visible) return;

    playDialTone();
    dialToneInterval.current = setInterval(playDialTone, 3000);

    // Poll dial status (checks if host accepted or declined)
    const baseUrl = getApiBaseUrl();
    const pollTimer = setInterval(async () => {
      try {
        const res = await fetch(`${baseUrl}/api/calls/check-dial-status?channel=${encodeURIComponent(channelName)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'accepted') {
            clearInterval(pollTimer);
            clearInterval(dialToneInterval.current);
            onAccepted();
          } else if (data.status === 'declined' || data.status === 'cancelled') {
            clearInterval(pollTimer);
            clearInterval(dialToneInterval.current);
            onDeclined();
          }
        }
      } catch (e) {}
    }, 1200);

    return () => {
      clearInterval(dialToneInterval.current);
      clearInterval(pollTimer);
    };
  }, [visible, channelName]);

  const handleCancel = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/calls/cancel-dial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: channelName, listenerUsername: listener.username }),
      });
    } catch (e) {}
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Pulsing Avatar Container */}
          <View style={styles.pulseContainer}>
            <View style={styles.pulseRingOuter}>
              <View style={styles.pulseRingInner}>
                <Image source={{ uri: listener.avatarUrl }} style={styles.avatar} />
              </View>
            </View>
          </View>

          <Text style={styles.callingText}>Calling {listener.name}...</Text>
          <Text style={styles.handleText}>@{listener.username} • Verified Host</Text>

          <View style={styles.typeBadge}>
            {callType === 'video' ? (
              <Video size={14} color="#059669" />
            ) : (
              <Phone size={14} color="#2563EB" />
            )}
            <Text style={[styles.typeBadgeText, callType === 'video' ? { color: '#059669' } : { color: '#2563EB' }]}>
              {callType === 'video' ? '1:1 Video Call (₹30/min)' : 'Voice Call (₹9/min)'}
            </Text>
          </View>

          <View style={styles.statusPill}>
            <Radio size={12} color="#10B981" />
            <Text style={styles.statusPillText}>Ringing host console... Waiting for host to pick up</Text>
          </View>

          {/* Cancel Dial Button */}
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
            <View style={styles.cancelIconCircle}>
              <PhoneOff size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.cancelBtnText}>Cancel Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 28,
    padding: 32,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pulseContainer: {
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRingOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRingInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#38BDF8',
  },
  callingText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  handleText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
    gap: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 6,
  },
  statusPillText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 28,
  },
  cancelIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  cancelBtnText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
});
