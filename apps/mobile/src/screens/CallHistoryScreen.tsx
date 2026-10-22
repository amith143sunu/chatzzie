import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ArrowLeft, Phone, Video, Clock, ArrowUpRight } from 'lucide-react-native';
import { THEME } from '../theme';

interface CallRecord {
  id: string;
  partnerName: string;
  partnerHandle: string;
  avatarUrl: string;
  type: 'audio' | 'video';
  durationSeconds: number;
  costINR: number;
  timestamp: string;
}

interface CallHistoryScreenProps {
  onBackPress: () => void;
  onCallAgain: (partnerHandle: string, type: 'audio' | 'video') => void;
}

export const CallHistoryScreen: React.FC<CallHistoryScreenProps> = ({
  onBackPress,
  onCallAgain,
}) => {
  const callRecords: CallRecord[] = [
    {
      id: 'c-1',
      partnerName: 'Ankita Sen',
      partnerHandle: 'janvi_111',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      type: 'audio',
      durationSeconds: 124, // 2m 4s
      costINR: 18.00,
      timestamp: 'Today, 8:15 AM',
    },
    {
      id: 'c-2',
      partnerName: 'Jyoti Sharma',
      partnerHandle: 'jyoti__1',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      type: 'video',
      durationSeconds: 240, // 4m 0s
      costINR: 48.00,
      timestamp: 'Yesterday, 9:30 PM',
    },
    {
      id: 'c-3',
      partnerName: 'Sonika Verma',
      partnerHandle: 'sonika_912',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      type: 'audio',
      durationSeconds: 310, // 5m 10s
      costINR: 45.00,
      timestamp: '30 Sep, 11:20 PM',
    }
  ];

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
          <ArrowLeft size={22} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Call History</Text>
      </View>

      {/* Summary KPI Strip */}
      <View style={styles.kpiStrip}>
        <View style={styles.kpiCol}>
          <Text style={styles.kpiValue}>11m 14s</Text>
          <Text style={styles.kpiLabel}>Total Talk Time</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiCol}>
          <Text style={styles.kpiValue}>3 Calls</Text>
          <Text style={styles.kpiLabel}>Completed</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiCol}>
          <Text style={styles.kpiValue}>₹111.00</Text>
          <Text style={styles.kpiLabel}>Total Spent</Text>
        </View>
      </View>

      {/* Calls List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {callRecords.map((call) => (
          <View key={call.id} style={styles.callCard}>
            <Image source={{ uri: call.avatarUrl }} style={styles.avatar} />

            <View style={styles.callInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.partnerName}>{call.partnerName}</Text>
                <View style={styles.typeBadge}>
                  {call.type === 'video' ? (
                    <Video size={12} color={THEME.colors.primary} />
                  ) : (
                    <Phone size={12} color={THEME.colors.primary} />
                  )}
                  <Text style={styles.typeText}>{call.type === 'video' ? 'Video' : 'Voice'}</Text>
                </View>
              </View>

              <Text style={styles.timestampText}>{call.timestamp} • {formatDuration(call.durationSeconds)}</Text>
              <Text style={styles.costText}>-₹{call.costINR.toFixed(2)} deducted</Text>
            </View>

            <TouchableOpacity
              style={styles.callAgainBtn}
              onPress={() => onCallAgain(call.partnerHandle, call.type)}
              activeOpacity={0.85}
            >
              <Phone size={14} color={THEME.colors.white} />
              <Text style={styles.callAgainText}>Call Again</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  kpiStrip: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    justifyContent: 'space-around',
  },
  kpiCol: {
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  kpiLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  kpiDivider: {
    width: 1,
    height: 24,
    backgroundColor: THEME.colors.borderLight,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  callCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  callInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: THEME.colors.primaryBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  timestampText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  costText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.red,
    marginTop: 1,
  },
  callAgainBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  callAgainText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.white,
  }
});
