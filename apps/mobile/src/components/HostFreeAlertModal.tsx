import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Sparkles, Phone, Video, X } from 'lucide-react-native';

interface HostFreeAlertModalProps {
  visible: boolean;
  hostName: string;
  hostUsername: string;
  onCallNow: () => void;
  onClose: () => void;
}

export const HostFreeAlertModal: React.FC<HostFreeAlertModalProps> = ({
  visible,
  hostName,
  hostUsername,
  onCallNow,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={18} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.badgeRow}>
            <View style={styles.iconCircle}>
              <Sparkles size={24} color="#10B981" />
            </View>
          </View>

          <Text style={styles.title}>{hostName} is Now Free!</Text>
          <Text style={styles.sub}>
            @{hostUsername} just ended their previous call and is ready for you on Chatzie. Connect now before someone else calls!
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.callNowBtn} onPress={onCallNow} activeOpacity={0.85}>
              <Phone size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.callNowText}>Call Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.dismissText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
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
  badgeRow: {
    marginBottom: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 20,
  },
  btnRow: {
    width: '100%',
    gap: 10,
  },
  callNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
  },
  callNowText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dismissBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});
