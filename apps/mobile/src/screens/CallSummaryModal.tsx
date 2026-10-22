import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { CheckCircle2, Star, Gift, Clock, IndianRupee } from 'lucide-react-native';
import { THEME } from '../theme';

interface CallSummaryModalProps {
  visible: boolean;
  listenerName: string;
  listenerAvatar: string;
  durationSeconds: number;
  totalCostINR: number;
  newBalanceINR: number;
  onClose: () => void;
}

export const CallSummaryModal: React.FC<CallSummaryModalProps> = ({
  visible,
  listenerName,
  listenerAvatar,
  durationSeconds,
  totalCostINR,
  newBalanceINR,
  onClose,
}) => {
  const [rating, setRating] = useState(5);
  const [rated, setRated] = useState(false);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Avatar & Title */}
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: listenerAvatar }} style={styles.avatar} />
            <View style={styles.checkBadge}>
              <CheckCircle2 size={16} color={THEME.colors.white} />
            </View>
          </View>

          <Text style={styles.title}>Call Completed</Text>
          <Text style={styles.subTitle}>With {listenerName}</Text>

          {/* Stats Box */}
          <View style={styles.statsBox}>
            <View style={styles.statCol}>
              <Clock size={16} color={THEME.colors.primary} />
              <Text style={styles.statVal}>{formatDuration(durationSeconds)}</Text>
              <Text style={styles.statLbl}>Duration</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statCurrency}>₹</Text>
              <Text style={styles.statVal}>₹{totalCostINR.toFixed(2)}</Text>
              <Text style={styles.statLbl}>Deducted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statCurrency}>₹</Text>
              <Text style={styles.statVal}>₹{newBalanceINR.toFixed(2)}</Text>
              <Text style={styles.statLbl}>Balance</Text>
            </View>
          </View>

          {/* Rating Section */}
          <Text style={styles.rateHeading}>Rate Your Experience</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => { setRating(star); setRated(true); }}
                activeOpacity={0.8}
              >
                <Star
                  size={28}
                  color="#F59E0B"
                  fill={star <= rating ? '#F59E0B' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {rated && (
            <Text style={styles.thankYouText}>Thank you for your rating!</Text>
          )}

          {/* Done Button */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: THEME.colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.white,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  subTitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  statsBox: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.background,
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    marginTop: 18,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statCurrency: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 3,
  },
  statLbl: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: THEME.colors.border,
  },
  rateHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  thankYouText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 6,
  },
  doneBtn: {
    width: '100%',
    height: 48,
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  doneBtnText: {
    color: THEME.colors.white,
    fontSize: 15,
    fontWeight: '800',
  }
});
