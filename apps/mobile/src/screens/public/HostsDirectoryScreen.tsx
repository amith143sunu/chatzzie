import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  TextInput,
  Platform,
} from 'react-native';
import {
  Heart,
  Star,
  Play,
  Pause,
  PhoneCall,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  Video,
} from 'lucide-react-native';

interface HostsDirectoryScreenProps {
  onNavigate: (path: string) => void;
  onOpenLogin: () => void;
  onOpenHostPortal: () => void;
}

export const HostsDirectoryScreen: React.FC<HostsDirectoryScreenProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenHostPortal,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const isWide = width > 900;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [playingHostId, setPlayingHostId] = useState<string | null>(null);
  const audioCtxRef = useRef<any>(null);

  const languages = ['All', 'Hindi', 'English', 'Punjabi', 'Marathi', 'Tamil', 'Telugu', 'Bengali'];

  const allHosts = [
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
      hasVideo: true,
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
      hasVideo: false,
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
      hasVideo: true,
      duration: '0:15',
    },
    {
      id: 'host-simran',
      name: 'Simran Kaur',
      handle: '@simran_k',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      rating: '4.9',
      calls: '1,840+ Calls',
      languages: ['Punjabi', 'Hindi'],
      tagline: 'Life transitions, corporate venting, and light-hearted late night chai discussions.',
      rate: '9 Coins/min',
      hasVideo: true,
      duration: '0:20',
    },
    {
      id: 'host-ananya',
      name: 'Ananya Mukherjee',
      handle: '@ananya_m',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
      rating: '4.9',
      calls: '1,120+ Calls',
      languages: ['Bengali', 'English', 'Hindi'],
      tagline: 'Literature, poetry, cinema, and navigating difficult family relationships.',
      rate: '9 Coins/min',
      hasVideo: false,
      duration: '0:19',
    },
    {
      id: 'host-tanvi',
      name: 'Tanvi Kulkarni',
      handle: '@tanvi_k',
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80',
      rating: '5.0',
      calls: '3,100+ Calls',
      languages: ['Marathi', 'Hindi', 'English'],
      tagline: 'Non-judgmental safe zone for breakup recovery and finding your confidence.',
      rate: '9 Coins/min',
      hasVideo: true,
      duration: '0:25',
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

  const filteredHosts = allHosts.filter((host) => {
    const matchesSearch =
      host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      host.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      host.tagline.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLang =
      selectedLanguage === 'All' || host.languages.includes(selectedLanguage);

    return matchesSearch && matchesLang;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentWrap}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.pillBadge}>
          <Heart size={14} color="#DB2777" />
          <Text style={styles.pillBadgeText}>100% KYC-Verified Human Confidantes</Text>
        </View>
        <Text style={styles.mainTitle}>Meet Your Empathetic Listeners</Text>
        <Text style={styles.subtitle}>
          Preview authentic audio introductions and choose someone who speaks your language and understands your world.
        </Text>
      </View>

      {/* Search & Language Filter */}
      <View style={styles.filterSection}>
        <View style={styles.filterContainer}>
          <View style={styles.searchBar}>
            <Search size={16} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by host name, handle, or topics..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langPillsRow}>
            {languages.map((lang) => {
              const isSelected = selectedLanguage === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langPill, isSelected && styles.langPillActive]}
                  onPress={() => setSelectedLanguage(lang)}
                >
                  <Text style={[styles.langPillText, isSelected && styles.langPillTextActive]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Hosts Grid */}
      <View style={styles.sectionWrap}>
        <View style={styles.hostsGrid}>
          {filteredHosts.map((host) => {
            const isPlaying = playingHostId === host.id;
            return (
              <View
                key={host.id}
                style={[styles.hostCard, isWide && styles.hostCardDesktop]}
              >
                <View style={styles.hostCardHeader}>
                  <View style={styles.avatarWrap}>
                    <Image source={{ uri: host.avatar }} style={styles.hostAvatar} />
                    <View style={styles.onlineBadge}>
                      <View style={styles.onlineDot} />
                      <Text style={styles.onlineText}>Online</Text>
                    </View>
                  </View>

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

                {/* Languages */}
                <View style={styles.hostLangRow}>
                  {host.languages.map((l, i) => (
                    <View key={i} style={styles.hostLangTag}>
                      <Text style={styles.hostLangTagText}>{l}</Text>
                    </View>
                  ))}
                  {host.hasVideo && (
                    <View style={[styles.hostLangTag, { backgroundColor: '#FDF2F8' }]}>
                      <Video size={10} color="#DB2777" />
                      <Text style={[styles.hostLangTagText, { color: '#DB2777' }]}>Video</Text>
                    </View>
                  )}
                </View>

                {/* Voice Preview Audio Bar */}
                <TouchableOpacity
                  style={[styles.voiceBioBar, isPlaying && styles.voiceBioBarActive]}
                  onPress={() => togglePlayAudio(host.id)}
                >
                  <View style={[styles.playCircle, isPlaying && styles.playCircleActive]}>
                    {isPlaying ? <Pause size={14} color="#FFFFFF" /> : <Play size={14} color="#4F46E5" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.voiceBioText}>{isPlaying ? 'Playing Voice Intro...' : 'Audio Preview'}</Text>
                    <Text style={styles.voiceBioDuration}>{host.duration} • Authentic Voice</Text>
                  </View>
                </TouchableOpacity>

                {/* Call CTA */}
                <TouchableOpacity
                  style={styles.connectHostBtn}
                  onPress={onOpenLogin}
                >
                  <PhoneCall size={14} color="#FFFFFF" />
                  <Text style={styles.connectHostBtnText}>Call Now ({host.rate})</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* Become a Host CTA */}
      <View style={styles.partnerBanner}>
        <View style={styles.partnerBannerInner}>
          <View style={{ flex: 1, minWidth: 260 }}>
            <Text style={styles.partnerBadge}>Chatzzie Host Network</Text>
            <Text style={styles.partnerTitle}>Want to Listen and Earn From Home?</Text>
            <Text style={{ color: '#94A3B8', fontSize: 14, marginTop: 6 }}>
              Earn 50% revenue share with direct daily UPI payouts. Set your own hours, completely masked identity.
            </Text>
          </View>
          <TouchableOpacity style={styles.partnerBtn} onPress={onOpenHostPortal}>
            <Text style={styles.partnerBtnText}>Become a Host Partner (/host)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  headerBanner: {
    paddingVertical: 56,
    paddingHorizontal: 24,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDF2F8',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 16,
  },
  pillBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DB2777',
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: Platform.OS === 'web' ? 42 : 30,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 680,
  },

  // Filters
  filterSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  filterContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  langPillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  langPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  langPillActive: {
    backgroundColor: '#4F46E5',
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  langPillTextActive: {
    color: '#FFFFFF',
  },

  // Hosts
  sectionWrap: {
    paddingHorizontal: 24,
    marginBottom: 48,
  },
  hostsGrid: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
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
  avatarWrap: {
    position: 'relative',
  },
  hostAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    transform: [{ translateX: -20 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  onlineText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
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
    marginBottom: 12,
  },
  hostLangRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  hostLangTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hostLangTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
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
    marginBottom: 14,
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

  partnerBanner: {
    backgroundColor: '#0F172A',
    paddingVertical: 40,
    paddingHorizontal: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    borderRadius: 24,
  },
  partnerBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 20,
  },
  partnerBadge: {
    color: '#F472B6',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  partnerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  partnerBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  partnerBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
});
