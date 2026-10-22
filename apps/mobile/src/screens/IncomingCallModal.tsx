import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Phone, PhoneOff, Video } from 'lucide-react-native';
import { THEME } from '../theme';

interface IncomingCallModalProps {
  visible: boolean;
  callerName: string;
  callerAvatar: string;
  callType: 'audio' | 'video';
  ratePerMin: number;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  visible,
  callerName,
  callerAvatar,
  callType,
  ratePerMin,
  onAccept,
  onDecline,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        {/* Caller Avatar */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: callerAvatar }} style={styles.avatar} />
        </View>

        <Text style={styles.callerName}>{callerName}</Text>
        <Text style={styles.callTypeLabel}>
          Incoming {callType === 'video' ? 'Video' : 'Voice'} Call • ₹{ratePerMin}/min
        </Text>

        {/* Buttons */}
        <View style={styles.actionsRow}>
          {/* Decline */}
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={onDecline}
            activeOpacity={0.85}
          >
            <PhoneOff size={26} color={THEME.colors.white} />
            <Text style={styles.btnLabel}>Decline</Text>
          </TouchableOpacity>

          {/* Accept */}
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={onAccept}
            activeOpacity={0.85}
          >
            {callType === 'video' ? (
              <Video size={26} color={THEME.colors.white} />
            ) : (
              <Phone size={26} color={THEME.colors.white} />
            )}
            <Text style={styles.btnLabel}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#3B82F6',
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
  },
  avatar: {
    width: 114,
    height: 114,
    borderRadius: 57,
  },
  callerName: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.white,
  },
  callTypeLabel: {
    fontSize: 13,
    color: '#93C5FD',
    marginTop: 6,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 80,
  },
  declineBtn: {
    alignItems: 'center',
    gap: 8,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.colors.red,
    justifyContent: 'center',
  },
  acceptBtn: {
    alignItems: 'center',
    gap: 8,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
  },
  btnLabel: {
    position: 'absolute',
    bottom: -24,
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  }
});
