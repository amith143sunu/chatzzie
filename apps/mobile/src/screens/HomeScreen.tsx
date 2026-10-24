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
  Zap,
  Lock,
  Coins,
  CheckCircle2,
  Star
} from 'lucide-react-native';
import { HeaderBar } from '../components/HeaderBar';
import { ListenerProfile } from '@chatzie/shared';
import { THEME } from '../theme';

interface HomeScreenProps {
  balanceINR: number;
  listeners: ListenerProfile[];
  isDesktop?: boolean;
  userName?: string;
  onBalancePress: () => void;
  onAvatarPress: () => void;
  onCategoryPress: (category: string) => void;
  onListenerPress: (listener: ListenerProfile) => void;
  onCallPress: (listener: ListenerProfile, type: 'audio' | 'video') => void;
  onBecomeListenerPress: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  balanceINR = 0,
  listeners = [],
  isDesktop = false,
  userName = 'User',
  onBalancePress,
  onAvatarPress,
  onCategoryPress,
  onListenerPress,
  onCallPress,
  onBecomeListenerPress
}) => {
  return (
    <View style={styles.container}>
      {/* Mobile Header Bar (Only visible when NOT on Desktop) */}
      {!isDesktop && (
        <HeaderBar
          userName={userName}
          balanceINR={balanceINR}
          onBalancePress={onBalancePress}
          onAvatarPress={onAvatarPress}
        />
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Desktop Hero Section */}
        {isDesktop ? (
          <View style={styles.desktopHero}>
            <View style={styles.desktopHeroContent}>
              <View style={styles.desktopHeroBadge}>
                <ShieldCheck size={14} color="#60A5FA" />
                <Text style={styles.desktopHeroBadgeText}>100% PRIVATE & ANONYMOUS 1:1 CALLING</Text>
              </View>

              <Text style={styles.desktopHeroTitle}>
                Real People. Real Talk. Real Empathy.
              </Text>
              <Text style={styles.desktopHeroSub}>
                Connect 1-on-1 with verified, compassionate listeners for confidential audio and high-definition video calls. No phone numbers or real identities exchanged.
              </Text>

              {/* Desktop CTA Row */}
              <View style={styles.desktopHeroActions}>
                <TouchableOpacity
                  style={styles.desktopAutoMatchBtn}
                  onPress={() => {
                    const available = (listeners || []).filter(l => l.status === 'online');
                    const target = available.length > 0 ? available[0] : (listeners?.[0] || null);
                    if (target) onCallPress(target, 'audio');
                  }}
                  activeOpacity={0.88}
                >
                  <Zap size={18} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.desktopAutoMatchText}>Instant Connect (Auto-Match)</Text>
                  <View style={styles.desktopLiveDot} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.desktopBrowseBtn}
                  onPress={() => onCategoryPress('all')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.desktopBrowseText}>Browse Verified Hosts</Text>
                  <ArrowRight size={16} color="#1E293B" />
                </TouchableOpacity>
              </View>

              {/* Trust Metric Strip */}
              <View style={styles.desktopTrustStrip}>
                <View style={styles.desktopTrustItem}>
                  <CheckCircle2 size={14} color="#10B981" />
                  <Text style={styles.desktopTrustText}>Zero Phone Number Sharing</Text>
                </View>
                <View style={styles.desktopTrustDivider} />
                <View style={styles.desktopTrustItem}>
                  <CheckCircle2 size={14} color="#10B981" />
                  <Text style={styles.desktopTrustText}>Universal ₹9/min Voice • ₹30/min Video</Text>
                </View>
                <View style={styles.desktopTrustDivider} />
                <View style={styles.desktopTrustItem}>
                  <CheckCircle2 size={14} color="#10B981" />
                  <Text style={styles.desktopTrustText}>Instant Agora WebRTC Audio</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* Mobile Security Banner */
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
        )}

        {/* Mobile Instant Match Banner (Only in Mobile Mode) */}
        {!isDesktop && (
          <TouchableOpacity
            style={styles.instantMatchBanner}
            onPress={() => {
              const available = (listeners || []).filter(l => l.status === 'online');
              const target = available.length > 0 ? available[0] : (listeners?.[0] || null);
              if (target) onCallPress(target, 'audio');
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
        )}

        {/* Categories / Vibes Section */}
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
              <Compass size={22} color={THEME.colors.primary} />
            </View>
            <View style={styles.categoryTextWrapper}>
              <Text style={styles.categoryCardTitle}>Personal Guidance</Text>
              <Text style={styles.categoryCardDesc}>
                Get personalized advice, thoughtful life perspectives, and relationship clarity.
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
              <Wind size={22} color="#0284C7" />
            </View>
            <View style={styles.categoryTextWrapper}>
              <Text style={styles.categoryCardTitle}>Mind Relaxation</Text>
              <Text style={styles.categoryCardDesc}>
                Take a break, vent your midnight thoughts, and relax after a busy day.
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
              <Users size={22} color="#7C3AED" />
            </View>
            <View style={styles.categoryTextWrapper}>
              <Text style={styles.categoryCardTitle}>Social Connections</Text>
              <Text style={styles.categoryCardDesc}>
                Meet genuine conversationalists, share common hobbies, and build meaningful bonds.
              </Text>
            </View>
            <View style={styles.categoryArrowButton}>
              <ArrowRight size={14} color="#7C3AED" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Featured Listeners Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderTitleRow}>
            <Text style={styles.sectionTitle}>Top Online Hosts</Text>
            <View style={styles.liveNowTag}>
              <View style={styles.greenPulse} />
              <Text style={styles.liveNowTagText}>Online Now</Text>
            </View>
          </View>
          <Text style={styles.sectionSub}>Verified conversationalists ready for immediate voice or video calling</Text>
        </View>

        {/* Multi-column Grid on Desktop / Vertical on Mobile */}
        {(listeners || []).length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Headphones size={28} color="#2563EB" />
            </View>
            <Text style={styles.emptyTitle}>No Hosts Online Right Now</Text>
            <Text style={styles.emptySub}>
              Verified hosts will appear here as soon as they go live. You can also go live as a host to start receiving calls!
            </Text>
            <TouchableOpacity style={styles.emptyHostBtn} onPress={onBecomeListenerPress} activeOpacity={0.85}>
              <Text style={styles.emptyHostBtnText}>Go Live as Host</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={isDesktop ? styles.desktopFeaturedGrid : styles.featuredList}>
            {(listeners || []).slice(0, isDesktop ? 4 : 3).map((listener) => (
              <View key={listener.id} style={isDesktop ? styles.desktopCardCol : undefined}>
                <View style={isDesktop ? styles.desktopListenerCard : styles.listenerItem}>
                  {/* Profile Click Target */}
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 }}
                    onPress={() => onListenerPress(listener)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.listenerItemAvatarContainer}>
                      <Image source={{ uri: listener.avatarUrl }} style={styles.listenerItemAvatar} />
                      <View style={[styles.onlineDot, listener.status === 'busy' && { backgroundColor: '#EF4444' }]} />
                    </View>

                    <View style={styles.listenerItemInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.listenerItemName} numberOfLines={1}>{listener.name}</Text>
                        <View style={styles.ratingBadgeSmall}>
                          <Star size={11} color="#F59E0B" fill="#F59E0B" />
                          <Text style={styles.ratingBadgeText}>{listener.rating}</Text>
                        </View>
                      </View>
                      <Text style={styles.listenerItemHandle} numberOfLines={1}>
                        {listener.status === 'busy' ? '🔴 Busy on Call • ' : '🟢 Online • '}
                        @{listener.username} • {listener.languages.join(', ')}
                      </Text>
                      <Text style={styles.listenerItemRate}>
                        ₹9/min Voice{listener.isVideoEnabled ? ' • ₹30/min Video' : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Independent Call Action Buttons */}
                  <View style={styles.actionBtnsGroup}>
                    <TouchableOpacity
                      style={[styles.listenerCallBtn, listener.status === 'busy' && { backgroundColor: '#F59E0B' }]}
                      onPress={() => onCallPress(listener, 'audio')}
                      activeOpacity={0.8}
                    >
                      <Phone size={12} color={THEME.colors.white} />
                      <Text style={styles.listenerCallBtnText}>{listener.status === 'busy' ? 'Queue' : 'Call ₹9'}</Text>
                    </TouchableOpacity>

                    {listener.isVideoEnabled && (
                      <TouchableOpacity
                        style={[
                          styles.listenerVideoBtn,
                          listener.status === 'busy' && { borderColor: '#F59E0B', backgroundColor: '#FEF3C7' },
                        ]}
                        onPress={() => onCallPress(listener, 'video')}
                        activeOpacity={0.8}
                      >
                        <Video size={12} color={listener.status === 'busy' ? '#D97706' : '#2563EB'} />
                        <Text
                          style={[
                            styles.listenerVideoBtnText,
                            listener.status === 'busy' && { color: '#D97706' },
                          ]}
                        >
                          {listener.status === 'busy' ? 'Busy' : 'Video ₹30'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Become a Listener Banner */}
        <TouchableOpacity
          style={styles.hostBanner}
          onPress={onBecomeListenerPress}
          activeOpacity={0.9}
        >
          <View style={styles.hostBannerContent}>
            <View style={styles.hostIconCircle}>
              <Headphones size={24} color={THEME.colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hostBannerTitle}>Become a Verified Host</Text>
              <Text style={styles.hostBannerSub}>
                Join the Chatzie Creator Network. Earn up to ₹2,000/day by listening and conversing on your own schedule.
              </Text>
            </View>
            <ArrowRight size={20} color={THEME.colors.white} />
          </View>
        </TouchableOpacity>

        {/* Why Choose Chatzie (Trust Pillars for Professional Website Feel) */}
        {isDesktop && (
          <View style={styles.trustSection}>
            <Text style={styles.trustSectionTitle}>Why People Trust Chatzie</Text>
            <Text style={styles.trustSectionSub}>Built ground-up for maximum emotional comfort, privacy, and safety.</Text>

            <View style={styles.trustGrid}>
              <View style={styles.trustCard}>
                <View style={styles.trustIconBox}>
                  <Lock size={20} color="#2563EB" />
                </View>
                <Text style={styles.trustCardTitle}>Zero PSTN Number Exposure</Text>
                <Text style={styles.trustCardDesc}>
                  All voice and video streams run purely over masked WebRTC. Neither party ever sees the other&apos;s phone number.
                </Text>
              </View>

              <View style={styles.trustCard}>
                <View style={styles.trustIconBox}>
                  <Coins size={20} color="#D97706" />
                </View>
                <Text style={styles.trustCardTitle}>Closed-Loop Coin Wallet</Text>
                <Text style={styles.trustCardDesc}>
                  No surprise credit card charges. Calls deduct strictly from your pre-funded virtual balance with real-time in-call HUD.
                </Text>
              </View>

              <View style={styles.trustCard}>
                <View style={styles.trustIconBox}>
                  <ShieldCheck size={20} color="#10B981" />
                </View>
                <Text style={styles.trustCardTitle}>KYC Verified Empathetic Hosts</Text>
                <Text style={styles.trustCardDesc}>
                  Every host submits voice introductions and identity verification before going live. 100% human, zero AI bots.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Desktop Website Footer */}
        {isDesktop && (
          <View style={styles.desktopFooter}>
            <View style={styles.footerInner}>
              <View>
                <Text style={styles.footerBrand}>Chatzie</Text>
                <Text style={styles.footerLegal}>
                  Peer-to-peer social wellness and emotional listening platform. Not a crisis or clinical psychiatric service.
                </Text>
              </View>
              <Text style={styles.footerCopyright}>
                © 2026 Chatzie Technologies Inc. All rights reserved.
              </Text>
            </View>
          </View>
        )}
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
    paddingBottom: 32,
  },
  desktopHero: {
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  desktopHeroContent: {
    maxWidth: 820,
  },
  desktopHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  desktopHeroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#93C5FD',
    letterSpacing: 0.5,
  },
  desktopHeroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  desktopHeroSub: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 12,
    lineHeight: 24,
  },
  desktopHeroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 22,
  },
  desktopAutoMatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#2563EB',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  desktopAutoMatchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  desktopLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  desktopBrowseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
  },
  desktopBrowseText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '700',
  },
  desktopTrustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 28,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  desktopTrustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  desktopTrustText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  desktopTrustDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#475569',
  },
  securityBanner: {
    backgroundColor: THEME.colors.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.colors.border,
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
    marginTop: 24,
    marginBottom: 12,
  },
  sectionHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  liveNowTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveNowTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  categoryGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    minWidth: 280,
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
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 3,
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
  desktopFeaturedGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  desktopCardCol: {
    flex: 1,
    minWidth: 260,
  },
  desktopListenerCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  featuredList: {
    marginHorizontal: 16,
    backgroundColor: THEME.colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 4,
  },
  listenerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  listenerItemAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  listenerItemAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: THEME.colors.border,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.colors.online,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: THEME.colors.white,
  },
  listenerItemInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listenerItemName: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  ratingBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  ratingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  listenerItemHandle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  listenerItemRate: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginTop: 3,
  },
  actionBtnsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  listenerCallBtn: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  listenerCallBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.white,
  },
  listenerVideoBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  listenerVideoBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  hostBanner: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
  },
  hostBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  hostIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.white,
  },
  hostBannerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 3,
    lineHeight: 17,
  },
  trustSection: {
    marginHorizontal: 16,
    marginTop: 36,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trustSectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  trustSectionSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  trustGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  trustCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  trustIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  trustCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  trustCardDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  desktopFooter: {
    marginHorizontal: 16,
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerBrand: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E293B',
  },
  footerLegal: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    maxWidth: 550,
  },
  footerCopyright: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
    marginBottom: 16,
  },
  emptyHostBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyHostBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
