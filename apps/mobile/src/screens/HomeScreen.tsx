import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  ShieldCheck,
  Compass,
  Wind,
  Users,
  ArrowRight,
  Headphones,
  Sparkles,
  Phone,
  Video,
  Zap
} from 'lucide-react-native';
import { HeaderBar } from '../components/HeaderBar';
import { ListenerProfile } from '@chatzie/shared';
import { THEME } from '../theme';

interface HomeScreenProps {
  balanceINR: number;
  listeners: ListenerProfile[];
  onBalancePress: () => void;
  onAvatarPress: () => void;
  onCategoryPress: (category: string) => void;
  onListenerPress: (listener: ListenerProfile) => void;
  onCallPress: (listener: ListenerProfile, type: 'audio' | 'video') => void;
  onBecomeListenerPress: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  balanceINR,
  listeners,
  onBalancePress,
  onAvatarPress,
  onCategoryPress,
  onListenerPress,
  onCallPress,
  onBecomeListenerPress
}) => {
  return (
    <View style={styles.container}>
      <HeaderBar
        userName="Amit"
        balanceINR={balanceINR}
        onBalancePress={onBalancePress}
        onAvatarPress={onAvatarPress}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner: Private & Secure */}
        <View style={styles.securityBanner}>
          <View style={styles.securityLeft}>
            <View style={styles.securityBadge}>
              <ShieldCheck size={14} color={THEME.colors.primary} />
              <Text style={styles.securityBadgeText}>100% PRIVATE & SECURE</Text>
            </View>
            <Text style={styles.securityTitle}>Real People. Real Talk.</Text>
            <Text style={styles.securitySub}>
              End-to-end encrypted 1-on-1 audio & video calls without sharing personal contact numbers.
            </Text>
          </View>
        </View>

        {/* Module 2: Instant Connect (Auto-Match) */}
        <TouchableOpacity
          style={styles.instantMatchBanner}
          onPress={() => {
            const available = listeners.filter(l => l.status === 'online');
            const target = available.length > 0 ? available[0] : listeners[0];
            onCallPress(target, 'audio');
          }}
          activeOpacity={0.88}
        >
          <View style={styles.instantMatchLeft}>
            <View style={styles.instantMatchIconCircle}>
              <Zap size={20} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <View>
              <View style={styles.instantMatchTitleRow}>
                <Text style={styles.instantMatchTitle}>Instant Connect</Text>
                <View style={styles.instantMatchBadge}>
                  <Text style={styles.instantMatchBadgeText}>Auto-Match</Text>
                </View>
              </View>
              <Text style={styles.instantMatchSub}>Pairs immediately with next available verified host</Text>
            </View>
          </View>
          <View style={styles.instantMatchBtn}>
            <Text style={styles.instantMatchBtnText}>Connect Now</Text>
          </View>
        </TouchableOpacity>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Vibes</Text>
          <Text style={styles.sectionSub}>Find the right conversation for your mood</Text>
        </View>

        <View style={styles.categoryGrid}>
          {/* Card 1: Guidance */}
          <TouchableOpacity
            style={[styles.categoryCard, { backgroundColor: THEME.colors.categoryGuidance }]}
            onPress={() => onCategoryPress('guidance')}
            activeOpacity={0.85}
          >
            <View style={styles.categoryIconCircle}>
              <Compass size={20} color={THEME.colors.primary} />
            </View>
            <View style={styles.categoryTextWrapper}>
              <Text style={styles.categoryCardTitle}>Personal Guidance</Text>
              <Text style={styles.categoryCardDesc}>
                Get personalized advice and thoughtful clarity on life and relationships.
              </Text>
            </View>
            <View style={styles.categoryArrowButton}>
              <ArrowRight size={14} color={THEME.colors.primary} />
            </View>
          </TouchableOpacity>

          {/* Card 2: Mind Relaxation */}
          <TouchableOpacity
            style={[styles.categoryCard, { backgroundColor: THEME.colors.categoryRelax }]}
            onPress={() => onCategoryPress('relax')}
            activeOpacity={0.85}
          >
            <View style={styles.categoryIconCircle}>
              <Wind size={20} color="#0284C7" />
            </View>
            <View style={styles.categoryTextWrapper}>
              <Text style={styles.categoryCardTitle}>Mind Relaxation</Text>
              <Text style={styles.categoryCardDesc}>
                Take a break, vent your thoughts, and relax your mind after a busy day.
              </Text>
            </View>
            <View style={styles.categoryArrowButton}>
              <ArrowRight size={14} color="#0284C7" />
            </View>
          </TouchableOpacity>

          {/* Card 3: Social Connections */}
          <TouchableOpacity
            style={[styles.categoryCard, { backgroundColor: THEME.colors.categorySocial }]}
            onPress={() => onCategoryPress('friends')}
            activeOpacity={0.85}
          >
            <View style={styles.categoryIconCircle}>
              <Users size={20} color="#7C3AED" />
            </View>
            <View style={styles.categoryTextWrapper}>
              <Text style={styles.categoryCardTitle}>Social Connections</Text>
              <Text style={styles.categoryCardDesc}>
                Meet genuine people, share interests, and build meaningful friendships.
              </Text>
            </View>
            <View style={styles.categoryArrowButton}>
              <ArrowRight size={14} color="#7C3AED" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Become a Listener Banner */}
        <TouchableOpacity
          style={styles.hostBanner}
          onPress={onBecomeListenerPress}
          activeOpacity={0.9}
        >
          <View style={styles.hostBannerContent}>
            <View style={styles.hostIconCircle}>
              <Headphones size={22} color={THEME.colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hostBannerTitle}>Wanna become a Listener?</Text>
              <Text style={styles.hostBannerSub}>
                Join Chatzie Partner Network. Earn up to ₹2,000/day by talking on your own schedule.
              </Text>
            </View>
            <ArrowRight size={18} color={THEME.colors.white} />
          </View>
        </TouchableOpacity>

        {/* Daily Gossip Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Gossip</Text>
          <Text style={styles.sectionSub}>Top active verified listeners online right now</Text>
        </View>

        <View style={styles.featuredList}>
          {listeners.slice(0, 3).map((listener) => (
            <TouchableOpacity
              key={listener.id}
              style={styles.listenerItem}
              onPress={() => onListenerPress(listener)}
              activeOpacity={0.85}
            >
              <View style={styles.listenerItemAvatarContainer}>
                <Image source={{ uri: listener.avatarUrl }} style={styles.listenerItemAvatar} />
                <View style={styles.onlineDot} />
              </View>

              <View style={styles.listenerItemInfo}>
                <Text style={styles.listenerItemName}>{listener.name}</Text>
                <Text style={styles.listenerItemHandle}>@{listener.username} • {listener.languages.join(', ')}</Text>
                <Text style={styles.listenerItemRate}>₹9/min Voice{listener.isVideoEnabled ? ' • ₹30/min Video' : ''}</Text>
              </View>

              <View style={styles.actionBtnsGroup}>
                <TouchableOpacity
                  style={styles.listenerCallBtn}
                  onPress={() => onCallPress(listener, 'audio')}
                  activeOpacity={0.85}
                >
                  <Phone size={12} color={THEME.colors.white} />
                  <Text style={styles.listenerCallBtnText}>Call ₹9</Text>
                </TouchableOpacity>

                {listener.isVideoEnabled && (
                  <TouchableOpacity
                    style={styles.listenerVideoBtn}
                    onPress={() => onCallPress(listener, 'video')}
                    activeOpacity={0.85}
                  >
                    <Video size={12} color="#2563EB" />
                    <Text style={styles.listenerVideoBtnText}>Video ₹30</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  securityBanner: {
    backgroundColor: THEME.colors.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  securityLeft: {
    flex: 1,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  securityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 0.5,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  securitySub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  instantMatchBanner: {
    backgroundColor: '#1E40AF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  instantMatchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  instantMatchIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instantMatchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  instantMatchTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  instantMatchBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  instantMatchBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  instantMatchSub: {
    fontSize: 11,
    color: '#BFDBFE',
    marginTop: 2,
  },
  instantMatchBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  instantMatchBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
  },
  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  categoryGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryTextWrapper: {
    flex: 1,
  },
  categoryCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  categoryCardDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  categoryArrowButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostBanner: {
    backgroundColor: THEME.colors.primary,
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 16,
    padding: 16,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  hostBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.white,
  },
  hostBannerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    lineHeight: 15,
  },
  featuredList: {
    marginHorizontal: 16,
    backgroundColor: THEME.colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  listenerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  listenerItemAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  listenerItemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: THEME.colors.online,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.online,
    borderWidth: 2,
    borderColor: THEME.colors.white,
  },
  listenerItemInfo: {
    flex: 1,
  },
  listenerItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  listenerItemHandle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  listenerItemRate: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
    marginTop: 2,
  },
  listenerCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  listenerCallBtnText: {
    color: THEME.colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  actionBtnsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listenerVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  listenerVideoBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  }
});
