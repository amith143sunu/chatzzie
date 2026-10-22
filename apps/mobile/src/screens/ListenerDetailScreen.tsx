import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  ArrowLeft,
  MessageSquare,
  MoreVertical,
  CheckCircle2,
  Phone,
  Video,
  Play,
  Pause,
  Star,
  ShieldCheck,
  Gift
} from 'lucide-react-native';
import { ListenerProfile } from '@chatzie/shared';
import { THEME } from '../theme';

interface ListenerDetailScreenProps {
  listener: ListenerProfile;
  onBackPress: () => void;
  onChatPress: () => void;
  onCallPress: (type: 'audio' | 'video') => void;
}

export const ListenerDetailScreen: React.FC<ListenerDetailScreenProps> = ({
  listener,
  onBackPress,
  onChatPress,
  onCallPress,
}) => {
  const [isFollowing, setIsFollowing] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.iconBtn}>
          <ArrowLeft size={22} color={THEME.colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{listener.username}</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onChatPress} style={styles.iconBtn}>
            <MessageSquare size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MoreVertical size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: listener.avatarUrl }} style={styles.avatar} />
            <View style={styles.onlineRing} />
            <View style={styles.verifiedBadge}>
              <CheckCircle2 size={18} color={THEME.colors.white} fill={THEME.colors.primaryLight} />
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{listener.followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{listener.giftsCount}</Text>
              <Text style={styles.statLabel}>Gifts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{listener.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Name & Online Status */}
          <View style={styles.nameSection}>
            <Text style={styles.displayName}>{listener.name}</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.greenDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.bioText}>{listener.bio}</Text>

          {/* Audio Voice Intro Snippet */}
          <TouchableOpacity
            style={styles.voiceBioBar}
            onPress={() => setIsPlayingAudio(!isPlayingAudio)}
            activeOpacity={0.85}
          >
            <View style={styles.voicePlayBtn}>
              {isPlayingAudio ? (
                <Pause size={14} color={THEME.colors.white} />
              ) : (
                <Play size={14} color={THEME.colors.white} fill={THEME.colors.white} style={{ marginLeft: 2 }} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.voiceBioTitle}>
                {isPlayingAudio ? 'Listening to Voice Intro...' : 'Voice Introduction (25s)'}
              </Text>
              <Text style={styles.voiceBioSub}>Tap to hear voice clarity & accent</Text>
            </View>
          </TouchableOpacity>

          {/* Action Buttons Row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.followButton}
              onPress={() => setIsFollowing(!isFollowing)}
              activeOpacity={0.85}
            >
              <Text style={styles.followButtonText}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => onCallPress('audio')}
              activeOpacity={0.85}
            >
              <Phone size={16} color={THEME.colors.primary} />
              <Text style={styles.callButtonText}>
                Voice Call ₹9/min
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Video Call Available Notice */}
        {listener.isVideoEnabled && (
          <View style={styles.videoNoticeCard}>
            <View style={styles.videoIconCircle}>
              <Video size={18} color={THEME.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.videoNoticeTitle}>High-Definition Video Available</Text>
              <Text style={styles.videoNoticeSub}>Supports 1-on-1 private video calls at ₹30/min.</Text>
            </View>
            <TouchableOpacity
              style={styles.videoCallBtnSmall}
              onPress={() => onCallPress('video')}
              activeOpacity={0.85}
            >
              <Text style={styles.videoCallBtnSmallText}>Video ₹30/min</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 6,
  },
  content: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  onlineRing: {
    position: 'absolute',
    inset: -3,
    borderRadius: 53,
    borderWidth: 2.5,
    borderColor: THEME.colors.online,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    borderRadius: 10,
    backgroundColor: THEME.colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCol: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: THEME.colors.border,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.colors.online,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.online,
  },
  bioText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
    paddingHorizontal: 16,
  },
  voiceBioBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: THEME.colors.primaryBg,
    borderRadius: 14,
    padding: 12,
    width: '100%',
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(30,64,175,0.15)',
  },
  voicePlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceBioTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  voiceBioSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 20,
  },
  followButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: THEME.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  callButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: THEME.colors.white,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  videoNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: THEME.colors.background,
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  videoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  videoNoticeSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  videoCallBtnSmall: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  videoCallBtnSmallText: {
    color: THEME.colors.white,
    fontSize: 11,
    fontWeight: '700',
  }
});
