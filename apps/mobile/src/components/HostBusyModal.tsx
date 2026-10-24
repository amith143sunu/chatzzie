import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Bell, Clock, X, CheckCircle2, Headphones, Radio } from 'lucide-react-native';
import { ListenerProfile } from '@chatzie/shared';
import { getApiBaseUrl } from '../services/apiConfig';

interface HostBusyModalProps {
  visible: boolean;
  host: ListenerProfile | null;
  callerId: string;
  callerName: string;
  onClose: () => void;
}

export const HostBusyModal: React.FC<HostBusyModalProps> = ({
  visible,
  host,
  callerId,
  callerName,
  onClose,
}) => {
  const [isQueuing, setIsQueuing] = useState(false);
  const [isQueued, setIsQueued] = useState(false);

  if (!host) return null;

  const handleNotifyMe = async () => {
    setIsQueuing(true);
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/calls/notify-queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostUsername: host.username,
          callerId: callerId || 'u_caller',
          callerName: callerName || 'Caller',
        }),
      });
      setIsQueued(true);
    } catch (e) {
      setIsQueued(true);
    } finally {
      setIsQueuing(false);
    }
  };

  const handleCloseModal = () => {
    setIsQueued(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCloseModal}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleCloseModal}>
            <X size={18} color="#64748B" />
          </TouchableOpacity>

          {/* Host Avatar with Busy Indicator */}
          <View style={styles.avatarContainer}>
            <Image source={{ uri: host.avatarUrl }} style={styles.avatar} />
            <View style={styles.busyDot}>
              <Radio size={12} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.title}>{host.name} is on another call</Text>
          <Text style={styles.handle}>@{host.username} • Busy right now</Text>

          {isQueued ? (
            <View style={styles.successState}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={32} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Priority Alert Activated!</Text>
              <Text style={styles.successSub}>
                We will alert your phone with an instant pop-up the exact second {host.name} finishes their call.
              </Text>

              <TouchableOpacity style={styles.doneBtn} onPress={handleCloseModal} activeOpacity={0.85}>
                <Text style={styles.doneBtnText}>Great, I will wait!</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.contentBox}>
              <View style={styles.waitBadge}>
                <Clock size={14} color="#D97706" />
                <Text style={styles.waitBadgeText}>Estimated wait time: ~2 minutes</Text>
              </View>

              <Text style={styles.description}>
                Don't miss your chance! Get an instant alert the moment {host.name} hangs up so you can connect before anyone else dials.
              </Text>

              <TouchableOpacity
                style={styles.notifyBtn}
                onPress={handleNotifyMe}
                disabled={isQueuing}
                activeOpacity={0.85}
              >
                {isQueuing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Bell size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.notifyBtnText}>Notify Me When Free</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={handleCloseModal} activeOpacity={0.85}>
                <Text style={styles.cancelBtnText}>Browse Other Hosts</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginTop: 8,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#EF4444',
  },
  busyDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  handle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  contentBox: {
    width: '100%',
    alignItems: 'center',
  },
  waitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  waitBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  description: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  notifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 10,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  successState: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  successIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 6,
  },
  successSub: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  doneBtn: {
    backgroundColor: '#10B981',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
