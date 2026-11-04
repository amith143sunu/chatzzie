import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  PhoneCall,
  Sparkles,
  Heart,
  ShieldCheck,
  Star,
  Play,
  Pause,
  ArrowRight,
  Smartphone,
  Download,
  BookOpen,
  Apple,
  CheckCircle2,
} from 'lucide-react-native';
import { BlogPost } from '@chatzie/shared';
import { getApiBaseUrl } from '../../services/apiConfig';

interface PublicHomeScreenProps {
  onNavigate: (path: string) => void;
  onOpenLogin: () => void;
  onOpenHostPortal: () => void;
}

export const PublicHomeScreen: React.FC<PublicHomeScreenProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenHostPortal,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const isWide = width > 900;

  const [playingHostId, setPlayingHostId] = useState<string | null>(null);
  const audioCtxRef = useRef<any>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  // Fetch latest blogs for homepage preview
  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/blogs`);
        if (res.ok) {
          const data = await res.json();
          if (data.blogs && Array.isArray(data.blogs)) {
            setBlogs(data.blogs.slice(0, 3));
          }
        }
      } catch (e) {}
    };
    fetchLatestBlogs();
  }, []);

  const sampleHosts = [
    {
      id: 'host-sonika',
      name: 'Sonika Verma',
      handle: '@sonika_912',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      rating: '4.9',
      calls: '1,420+ Calls',
      languages: ['Hindi', 'English'],
      tagline: 'Empathetic listener for midnight thoughts and emotional wellness.',
      rate: '9 Coins/min',
      duration: '0:18',
    },
    {
      id: 'host-jyoti',
      name: 'Jyoti Sharma',
      handle: '@jyoti__1',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      rating: '5.0',
      calls: '2,890+ Calls',
      languages: ['Hindi', 'Punjabi'],
      tagline: 'Warm elder sister vibes. Here to listen to relationship & life dilemmas.',
      rate: '9 Coins/min',
      duration: '0:22',
    },
    {
      id: 'host-priya',
      name: 'Priya Iyer',
      handle: '@priya_connect',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      rating: '4.8',
      calls: '960+ Calls',
      languages: ['English', 'Tamil'],
      tagline: 'Calm sounding board for workplace stress, exam anxiety, and daily overwhelm.',
      rate: '9 Coins/min',
      duration: '0:15',
    },
  ];

  const togglePlayAudio = (hostId: string) => {
    if (playingHostId === hostId) {
      setPlayingHostId(null);
      return;
    }
    setPlayingHostId(hostId);

    try {
      if (typeof window !== 'undefined') {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
          const ctx = audioCtxRef.current;
          if (ctx.state === 'suspended') ctx.resume();

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.2);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.5);
        }
      }
    } catch (e) {}

    setTimeout(() => {
      setPlayingHostId((prev) => (prev === hostId ? null : prev));
    }, 2800);
  };

  return (
    <View style={styles.container}>
      {/* 1. Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.liveBadgeRow}>
          <View style={styles.liveIndicatorRing}>
            <View style={styles.liveIndicatorDot} />
          </View>
          <Text style={styles.liveBadgeText}>1,248 Verified Hosts Online Now Across India</Text>
        </View>

        <Text style={styles.heroHeadline}>
          Feeling Overwhelmed or Lonely?{'\n'}
          <Text style={styles.heroHeadlineHighlight}>Talk to Someone Who Truly Listens.</Text>
        </Text>

        <Text style={styles.heroSubtitle}>
          Chatzzie connects you with KYC-verified empathetic listeners for 1:1 anonymous voice &amp; video calls. No judgment, no questionnaires, zero phone number exposure.
        </Text>

        <View style={styles.heroCtaRow}>
          <TouchableOpacity
            style={styles.heroPrimaryBtn}
            activeOpacity={0.85}
            onPress={onOpenLogin}
          >
            <PhoneCall size={18} color="#FFFFFF" />
            <Text style={styles.heroPrimaryBtnText}>Start Talking Online (Free Web App)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.heroSecondaryBtn}
            activeOpacity={0.85}
            onPress={() => onNavigate('/hosts')}
          >
            <Text style={styles.heroSecondaryBtnText}>Browse Confidantes</Text>
            <ArrowRight size={16} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Feature Pills */}
        <View style={styles.featurePillsRow}>
          <View style={styles.featurePill}>
            <ShieldCheck size={16} color="#10B981" />
            <Text style={styles.featurePillText}>100% Masked Phone Numbers</Text>
          </View>
          <View style={styles.featurePill}>
            <Heart size={16} color="#EC4899" />
            <Text style={styles.featurePillText}>Real KYC-Verified Women Listeners</Text>
          </View>
          <View style={styles.featurePill}>
            <Sparkles size={16} color="#6366F1" />
            <Text style={styles.featurePillText}>Transparent Pay-Per-Minute Coins</Text>
          </View>
        </View>
      </View>

      {/* 2. Featured Confidantes Preview */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionPill}>
            <Heart size={14} color="#DB2777" />
            <Text style={styles.sectionPillText}>Meet Your Confidantes</Text>
          </View>
          <Text style={styles.sectionTitle}>Real Humans. Zero AI Bots.</Text>
          <Text style={styles.sectionSubtitle}>
            Tap the audio player below to preview their authentic voice bio before connecting.
          </Text>
        </View>

        <View style={styles.hostsGrid}>
          {sampleHosts.map((host) => {
            const isPlaying = playingHostId === host.id;
            return (
              <View
                key={host.id}
                style={[styles.hostCard, isWide && styles.hostCardDesktop]}
              >
                <View style={styles.hostCardHeader}>
                  <Image source={{ uri: host.avatar }} style={styles.hostAvatar} />
                  <View style={styles.hostMetaInfo}>
                    <Text style={styles.hostCardName}>{host.name}</Text>
                    <Text style={styles.hostCardHandle}>{host.handle}</Text>
                    <View style={styles.hostRatingRow}>
                      <Star size={13} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.hostRatingText}>{host.rating}</Text>
                      <Text style={styles.hostCallsText}>• {host.calls}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.hostTagline}>{host.tagline}</Text>

                {/* Voice Preview Bar */}
                <TouchableOpacity
                  style={[styles.voiceBioBar, isPlaying && styles.voiceBioBarActive]}
                  onPress={() => togglePlayAudio(host.id)}
                >
                  <View style={[styles.playCircle, isPlaying && styles.playCircleActive]}>
                    {isPlaying ? <Pause size={14} color="#FFFFFF" /> : <Play size={14} color="#4F46E5" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.voiceBioText}>{isPlaying ? 'Playing Audio Bio...' : 'Listen to Voice Bio'}</Text>
                    <Text style={styles.voiceBioDuration}>{host.duration} • Authentic intro</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.connectHostBtn}
                  onPress={onOpenLogin}
                >
                  <PhoneCall size={14} color="#FFFFFF" />
                  <Text style={styles.connectHostBtnText}>Connect ({host.rate})</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.viewAllHostsBtn}
          onPress={() => onNavigate('/hosts')}
        >
          <Text style={styles.viewAllHostsBtnText}>View All 1,248+ Verified Confidantes</Text>
          <ArrowRight size={16} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* 3. Latest Blog & Wellness Articles Preview */}
      <View style={[styles.sectionWrap, { backgroundColor: '#F8FAFC' }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionPill}>
            <BookOpen size={14} color="#4F46E5" />
            <Text style={styles.sectionPillText}>Chatzzie Editorial</Text>
          </View>
          <Text style={styles.sectionTitle}>Wellness &amp; Emotional Care Stories</Text>
          <Text style={styles.sectionSubtitle}>
            Expert perspectives on relationships, overthinking, and modern emotional resilience.
          </Text>
        </View>

        <View style={styles.blogsGrid}>
          {blogs.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={[styles.blogCard, isWide && styles.blogCardDesktop]}
              activeOpacity={0.9}
              onPress={() => onNavigate(`/blog/${post.slug}`)}
            >
              <Image source={{ uri: post.coverImage }} style={styles.blogCover} />
              <View style={styles.blogCardBody}>
                <View style={styles.blogMetaRow}>
                  <View style={styles.blogCategoryWrap}>
                    <Text style={styles.blogCategory}>{post.category}</Text>
                  </View>
                  <Text style={styles.blogReadTime}>{post.readTimeMinutes} min read</Text>
                </View>
                <Text style={styles.blogTitle} numberOfLines={2}>{post.title}</Text>
                <Text style={styles.blogExcerpt} numberOfLines={2}>{post.excerpt}</Text>

                <View style={styles.blogAuthorRow}>
                  <Image source={{ uri: post.authorAvatar }} style={styles.blogAuthorAvatar} />
                  <Text style={styles.blogAuthorName}>{post.authorName}</Text>
                  <Text style={styles.readMoreText}>Read Article →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.viewAllBlogsBtn}
          onPress={() => onNavigate('/blog')}
        >
          <Text style={styles.viewAllBlogsBtnText}>Explore All Blog Articles</Text>
          <ArrowRight size={16} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* 4. Host Partner Recruitment Banner */}
      <View style={styles.hostBannerSection}>
        <View style={[styles.hostBannerCard, isDesktop && styles.hostBannerCardDesktop]}>
          <View style={styles.hostBannerContent}>
            <View style={styles.hostBannerPill}>
              <Sparkles size={14} color="#FFFFFF" />
              <Text style={styles.hostBannerPillText}>Chatzzie Partner Network</Text>
            </View>
            <Text style={styles.hostBannerTitle}>Are You an Empathetic Listener?</Text>
            <Text style={styles.hostBannerSubtitle}>
              Join Chatzzie as a verified host partner. Earn 50% revenue share with daily UPI bank settlements, working securely from home.
            </Text>

            <View style={styles.hostPerksRow}>
              <View style={styles.hostPerkItem}>
                <CheckCircle2 size={16} color="#34D399" />
                <Text style={styles.hostPerkText}>50% Payout on Every Minute &amp; Gift</Text>
              </View>
              <View style={styles.hostPerkItem}>
                <CheckCircle2 size={16} color="#34D399" />
                <Text style={styles.hostPerkText}>Direct Daily UPI Payouts</Text>
              </View>
              <View style={styles.hostPerkItem}>
                <CheckCircle2 size={16} color="#34D399" />
                <Text style={styles.hostPerkText}>100% Safe &amp; Masked Identity</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.hostBannerCta} onPress={onOpenHostPortal}>
              <Text style={styles.hostBannerCtaText}>Apply to Become a Host Partner (/host)</Text>
              <ArrowRight size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 5. Download App Strip */}
      <View style={[styles.sectionWrap, { backgroundColor: '#0B0F19' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Install Chatzzie on Your Phone</Text>
          <Text style={[styles.sectionSubtitle, { color: '#94A3B8' }]}>
            Enjoy instant call notifications, zero latency, and one-tap dialing on Android and iOS.
          </Text>
        </View>

        <View style={styles.downloadRow}>
          <TouchableOpacity
            style={styles.downloadOptionCard}
            onPress={() => onNavigate('/download')}
          >
            <Smartphone size={24} color="#34D399" />
            <Text style={styles.downloadOptionTitle}>Android APK</Text>
            <Text style={styles.downloadOptionDesc}>Direct high-speed download</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadOptionCard}
            onPress={() => onNavigate('/download')}
          >
            <Apple size={24} color="#FFFFFF" />
            <Text style={styles.downloadOptionTitle}>Apple iOS / iPhone</Text>
            <Text style={styles.downloadOptionDesc}>Add to Safari Home Screen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadOptionCard}
            onPress={onOpenLogin}
          >
            <PhoneCall size={24} color="#818CF8" />
            <Text style={styles.downloadOptionTitle}>Desktop Web App</Text>
            <Text style={styles.downloadOptionDesc}>No download required</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentWrap: {
    paddingBottom: 40,
  },

  // Hero
  heroSection: {
    paddingVertical: 56,
    paddingHorizontal: 24,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    marginBottom: 24,
  },
  liveIndicatorRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  heroHeadline: {
    fontSize: Platform.OS === 'web' ? 44 : 30,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: Platform.OS === 'web' ? 54 : 38,
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroHeadlineHighlight: {
    color: '#4F46E5',
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 720,
    marginBottom: 32,
  },
  heroCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 36,
  },
  heroPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  heroPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  featurePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featurePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },

  // Section
  sectionWrap: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  sectionHeader: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 40,
  },
  sectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  sectionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 640,
    lineHeight: 24,
  },

  // Hosts
  hostsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
  hostCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  hostCardDesktop: {
    width: '31%',
  },
  hostCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  hostAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  hostMetaInfo: {
    flex: 1,
  },
  hostCardName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  hostCardHandle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  hostRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hostRatingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  hostCallsText: {
    fontSize: 12,
    color: '#64748B',
  },
  hostTagline: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  voiceBioBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  voiceBioBarActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  playCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCircleActive: {
    backgroundColor: '#4F46E5',
  },
  voiceBioText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  voiceBioDuration: {
    fontSize: 10,
    color: '#64748B',
  },
  connectHostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    borderRadius: 12,
  },
  connectHostBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewAllHostsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingVertical: 12,
  },
  viewAllHostsBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4F46E5',
  },

  // Blogs Preview
  blogsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
  blogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  blogCardDesktop: {
    width: '31%',
  },
  blogCover: {
    width: '100%',
    height: 180,
  },
  blogCardBody: {
    padding: 18,
  },
  blogMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  blogCategoryWrap: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  blogCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  blogReadTime: {
    fontSize: 11,
    color: '#64748B',
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 22,
  },
  blogExcerpt: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  blogAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  blogAuthorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  blogAuthorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  viewAllBlogsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingVertical: 12,
  },
  viewAllBlogsBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4F46E5',
  },

  // Host Banner
  hostBannerSection: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  hostBannerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  hostBannerCardDesktop: {
    padding: 44,
  },
  hostBannerContent: {
    maxWidth: 720,
  },
  hostBannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(236, 72, 153, 0.25)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  hostBannerPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F472B6',
  },
  hostBannerTitle: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  hostBannerSubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 24,
    marginBottom: 20,
  },
  hostPerksRow: {
    gap: 10,
    marginBottom: 24,
  },
  hostPerkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostPerkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  hostBannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  hostBannerCtaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Download Row
  downloadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  downloadOptionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    width: 240,
    borderWidth: 1,
    borderColor: '#334155',
  },
  downloadOptionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  downloadOptionDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
