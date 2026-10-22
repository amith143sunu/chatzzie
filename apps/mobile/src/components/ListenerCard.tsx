import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Phone, Video, Play, Pause, CheckCircle2, Star } from 'lucide-react-native';
import { ListenerProfile } from '@chatzie/shared';
import { THEME } from '../theme';

interface ListenerCardProps {
  listener: ListenerProfile;
  onCallPress: (type: 'audio' | 'video') => void;
  onCardPress?: () => void;
}

export const ListenerCard: React.FC<ListenerCardProps> = ({
  listener,
  onCallPress,
  onCardPress,
}) => {
  const [isPlayingBio, setIsPlayingBio] = useState(false);

  const toggleVoiceBio = (e: any) => {
    e.stopPropagation();
    setIsPlayingBio(!isPlayingBio);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onCardPress}
      activeOpacity={0.9}
    >
      {/* Top Profile Section */}
      <View style={styles.profileRow}>
        {/* Avatar with Online Ring */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: listener.avatarUrl }} style={styles.avatar} />
          {listener.status === 'online' && <View style={styles.onlineBadge} />}
        </View>

        {/* Info Column */}
        <View style={styles.infoCol}>
          <View style={styles.statusHeader}>
            <Text style={styles.onlineLabel}>ONLINE</Text>
          </View>

          {/* Name & Audio Bio Button */}
          <View style={styles.nameRow}>
            <Text style={styles.username}>{listener.username}</Text>
            <CheckCircle2 size={15} color={THEME.colors.primaryLight} strokeWidth={2.5} style={styles.verifiedIcon} />

            {/* Voice Bio Player Button */}
            <TouchableOpacity
              style={[styles.audioPlayButton, isPlayingBio && styles.audioPlayButtonActive]}
              onPress={toggleVoiceBio}
              activeOpacity={0.8}
            >
              {isPlayingBio ? (
                <Pause size={12} color={THEME.colors.white} />
              ) : (
                <Play size={12} color={THEME.colors.primary} fill={THEME.colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Languages */}
          <Text style={styles.languagesText}>
            {listener.languages.join(', ')}
          </Text>

          {/* Star Rating */}
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                color="#F59E0B"
                fill={star <= Math.floor(listener.rating) ? '#F59E0B' : 'transparent'}
                style={{ marginRight: 2 }}
              />
            ))}
            <Text style={styles.rateText}> • ₹9/min Voice{listener.isVideoEnabled ? ' • ₹30/min Video' : ''}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        {listener.isVideoEnabled ? (
          <>
            {/* Dual CTA: Call & Video Call */}
            <TouchableOpacity
              style={styles.audioCallButtonHalf}
              onPress={() => onCallPress('audio')}
              activeOpacity={0.85}
            >
              <Phone size={15} color={THEME.colors.primary} strokeWidth={2.5} />
              <Text style={styles.audioCallText}>Call ₹9/m</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.videoCallButtonHalf}
              onPress={() => onCallPress('video')}
              activeOpacity={0.85}
            >
              <Video size={15} color={THEME.colors.white} strokeWidth={2.5} />
              <Text style={styles.videoCallText}>Video ₹30/m</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Single CTA: Full width Call */
          <TouchableOpacity
            style={styles.audioCallButtonFull}
            onPress={() => onCallPress('audio')}
            activeOpacity={0.85}
          >
            <Phone size={16} color={THEME.colors.white} strokeWidth={2.5} />
            <Text style={styles.audioCallTextWhite}>Call (₹9/min)</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: THEME.colors.online,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.colors.online,
    borderWidth: 2,
    borderColor: THEME.colors.white,
  },
  infoCol: {
    flex: 1,
  },
  statusHeader: {
    marginBottom: 2,
  },
  onlineLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.online,
    letterSpacing: 0.5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  verifiedIcon: {
    marginLeft: 4,
    marginRight: 8,
  },
  audioPlayButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPlayButtonActive: {
    backgroundColor: THEME.colors.primary,
  },
  languagesText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rateText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  audioCallButtonFull: {
    flex: 1,
    height: 44,
    backgroundColor: THEME.colors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  audioCallTextWhite: {
    color: THEME.colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  audioCallButtonHalf: {
    flex: 1,
    height: 42,
    backgroundColor: THEME.colors.white,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  audioCallText: {
    color: THEME.colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  videoCallButtonHalf: {
    flex: 1,
    height: 42,
    backgroundColor: THEME.colors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  videoCallText: {
    color: THEME.colors.white,
    fontWeight: '800',
    fontSize: 13,
  }
});
