'use client';

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
  Modal,
} from 'react-native';
import {
  Headphones,
  ShieldCheck,
  Sparkles,
  Heart,
  PhoneCall,
  Video,
  MessageSquare,
  Lock,
  Star,
  Play,
  Pause,
  ArrowRight,
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Apple,
  Users,
  Flame,
  Coins,
  Smile,
  Moon,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react-native';
import { THEME } from '../theme';
import { LoginScreen } from './LoginScreen';
import { PolicyModal, PolicyType } from './PolicyModal';

interface PublicLandingScreenProps {
  onLoginSuccess: (user: any) => void;
  onOpenHostPortal: () => void;
  onOpenAdminLogin: () => void;
}

export const PublicLandingScreen: React.FC<PublicLandingScreenProps> = ({
  onLoginSuccess,
  onOpenHostPortal,
  onOpenAdminLogin,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Policy Modal State
  const [policyModal, setPolicyModal] = useState<{ visible: boolean; type: PolicyType }>({
    visible: false,
    type: 'terms',
  });

  // Audio Preview State for Host Cards
  const [playingHostId, setPlayingHostId] = useState<string | null>(null);
  const audioCtxRef = useRef<any>(null);

  // FAQ Accordion State
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Download Trigger Feedback
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Featured Showcase Hosts
  const featuredHosts = [
    {
      id: 'host-sonika',
      name: 'Sonika Verma',
      handle: '@sonika_912',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      rating: '4.9',
      calls: '1,420+ Calls',
      languages: ['Hindi', 'English'],
      tagline: 'Empathetic listener for midnight thoughts and emotional wellness.',
      callRate: '9 Coins/min',
      videoRate: '30 Coins/min',
      hasVideo: true,
      audioDuration: '0:18',
    },
    {
      id: 'host-jyoti',
      name: 'Jyoti Sharma',
      handle: '@jyoti__1',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      rating: '5.0',
      calls: '2,150+ Calls',
      languages: ['Hindi', 'Punjabi'],
      tagline: 'Warm conversations, deep thoughts, and judgment-free companionship.',
      callRate: '9 Coins/min',
      videoRate: '30 Coins/min',
      hasVideo: true,
      audioDuration: '0:22',
    },
    {
      id: 'host-mahira',
      name: 'Mahira Khan',
      handle: '@mahira0',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      rating: '4.8',
      calls: '980+ Calls',
      languages: ['Hindi', 'Bhojpuri'],
      tagline: 'Midnight advice, relationship guidance, and lighthearted friendship.',
      callRate: '9 Coins/min',
      videoRate: '30 Coins/min',
      hasVideo: false,
      audioDuration: '0:15',
    },
  ];

  // Play synthetic voice preview chime
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

  const handleDownloadApk = () => {
    setDownloadNotice('Starting Chatzzie Android APK download...');
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        // Direct link or EAS preview build trigger
        const link = document.createElement('a');
        link.href = '/manifest.json';
        link.download = 'Chatzzie-App.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setDownloadNotice('Download initiated! Check your notifications bar.');
      setTimeout(() => setDownloadNotice(null), 4000);
    }, 800);
  };

  const faqs = [
    {
      q: 'Will the host ever see my phone number or real identity?',
      a: 'Never. All calls on Chatzzie are routed through peer-to-peer masked WebRTC infrastructure. Your phone number, real name, and personal identity remain 100% masked and private.',
    },
    {
      q: 'How does coin billing work? Are there recurring subscriptions?',
      a: 'Chatzzie operates strictly on transparent pay-as-you-go virtual coins (1 INR = 10 Coins). Voice calls cost 90 coins/min (₹9/min) and Video calls cost 300 coins/min (₹30/min). You are only billed for the exact seconds connected, with zero recurring charges or hidden fees.',
    },
    {
      q: 'Who are the hosts on Chatzzie?',
      a: 'Chatzzie hosts are KYC-verified women conversationalists and empathetic listeners across India who have passed audio bio screening. Every host is a real human — zero AI bots.',
    },
    {
      q: 'Can I use Chatzzie from my laptop or PC?',
      a: 'Yes! Chatzzie runs natively in any web browser without needing to download anything. Just tap "Start Talking Online" to log in and connect from your laptop or phone.',
    },
    {
      q: 'What if someone behaves inappropriately during a call?',
      a: 'Chatzzie has a strict zero-tolerance policy. You can disconnect with one tap and flag the user. Violators are immediately reviewed by admin moderators and permanently banned.',
    },
  ];

  return (
    <View style={styles.container}>
      {/* 1. Global Navigation Bar */}
      <View style={styles.navbar}>
        <View style={styles.navInner}>
          <TouchableOpacity
            style={styles.brandRow}
            activeOpacity={0.8}
            onPress={() => {
              if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <View style={styles.brandIconBox}>
              <Headphones size={20} color="#FFFFFF" />
            </View>
            <View>
              <View style={styles.brandNameRow}>
                <Text style={styles.brandTitle}>Chatzzie</Text>
                <View style={styles.livePulseDot} />
              </View>
              <Text style={styles.brandSubtitle}>1:1 Anonymous Voice & Video</Text>
            </View>
          </TouchableOpacity>

          {/* Desktop Navigation Links */}
          {isDesktop && (
            <View style={styles.navLinksRow}>
              <TouchableOpacity
                onPress={() => {
                  const el = document.getElementById('how-it-works-sec');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Text style={styles.navLinkText}>How It Works</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const el = document.getElementById('why-chatzzie-sec');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Text style={styles.navLinkText}>Why Chatzzie</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const el = document.getElementById('hosts-showcase-sec');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Text style={styles.navLinkText}>Verified Hosts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const el = document.getElementById('faq-sec');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Text style={styles.navLinkText}>Safety & FAQ</Text>
              </TouchableOpacity>

              {/* Host Partner Link */}
              <TouchableOpacity style={styles.hostPartnerPill} onPress={onOpenHostPortal}>
                <Sparkles size={14} color="#EC4899" />
                <Text style={styles.hostPartnerPillText}>Become a Host</Text>
                <View style={styles.earnBadge}>
                  <Text style={styles.earnBadgeText}>Earn ₹35k</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Navbar Right Actions */}
          <View style={styles.navActionsRow}>
            <TouchableOpacity
              style={styles.downloadNavBtn}
              onPress={() => {
                const el = document.getElementById('download-apps-sec');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else setIsLoginModalOpen(true);
              }}
            >
              <Download size={15} color="#4F46E5" />
              <Text style={styles.downloadNavBtnText}>Get App</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginNavBtn} onPress={() => setIsLoginModalOpen(true)}>
              <Text style={styles.loginNavBtnText}>Login / Web App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
        {/* 2. Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackgroundGlow} />

          {/* Live Host Presence Banner */}
          <View style={styles.liveBadgeRow}>
            <View style={styles.liveIndicatorRing}>
              <View style={styles.liveIndicatorDot} />
            </View>
            <Text style={styles.liveBadgeText}>45+ KYC-Verified Empathetic Hosts Online Now</Text>
            <ShieldCheck size={14} color="#10B981" />
          </View>

          {/* Main Headline */}
          <Text style={styles.heroHeadline}>
            Real People. Real Talk.{'\n'}
            <Text style={styles.heroHeadlineHighlight}>A Safe Space to Share Your Heart.</Text>
          </Text>

          {/* Subtitle */}
          <Text style={styles.heroSubtitle}>
            Meaningful 1-on-1 private voice and video conversations with caring listeners across India.
            Whether it&apos;s midnight overthinking, heartbreak, or daily stress — talk anonymously without judgment.
          </Text>

          {/* Dual Action Buttons */}
          <View style={styles.heroCtaRow}>
            <TouchableOpacity style={styles.heroPrimaryBtn} onPress={() => setIsLoginModalOpen(true)}>
              <PhoneCall size={18} color="#FFFFFF" />
              <Text style={styles.heroPrimaryBtnText}>Start Talking Online</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroSecondaryBtn}
              onPress={() => {
                const el = document.getElementById('download-apps-sec');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else handleDownloadApk();
              }}
            >
              <Download size={18} color="#0F172A" />
              <Text style={styles.heroSecondaryBtnText}>Download Mobile App</Text>
            </TouchableOpacity>
          </View>

          {/* Download Platform Badges Strip */}
          <View style={styles.storeBadgesStrip}>
            <TouchableOpacity style={styles.storeBadgeCard} onPress={handleDownloadApk}>
              <Smartphone size={18} color="#10B981" />
              <View>
                <Text style={styles.storeBadgeSub}>GET IT ON</Text>
                <Text style={styles.storeBadgeTitle}>Google Play</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.storeBadgeCard} onPress={handleDownloadApk}>
              <Apple size={18} color="#0F172A" />
              <View>
                <Text style={styles.storeBadgeSub}>Download on the</Text>
                <Text style={styles.storeBadgeTitle}>App Store</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.storeBadgeCardApk} onPress={handleDownloadApk}>
              <Download size={16} color="#4F46E5" />
              <View>
                <Text style={styles.storeBadgeSubApk}>DIRECT INSTALL</Text>
                <Text style={styles.storeBadgeTitleApk}>Download .APK</Text>
              </View>
            </TouchableOpacity>
          </View>

          {downloadNotice && (
            <View style={styles.downloadNoticeToast}>
              <CheckCircle2 size={16} color="#10B981" />
              <Text style={styles.downloadNoticeText}>{downloadNotice}</Text>
            </View>
          )}
        </View>

        {/* 3. Live Verified Hosts Showcase */}
        <View id="hosts-showcase-sec" style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionPill}>
              <Heart size={14} color="#DB2777" />
              <Text style={styles.sectionPillText}>Meet Your Confidantes</Text>
            </View>
            <Text style={styles.sectionTitle}>KYC-Verified Human Listeners</Text>
            <Text style={styles.sectionSubtitle}>
              Tap the audio player below to preview their authentic voice bio intros before connecting.
            </Text>
          </View>

          <View style={styles.hostsGrid}>
            {featuredHosts.map((host) => {
              const isPlaying = playingHostId === host.id;
              return (
                <View key={host.id} style={styles.hostShowcaseCard}>
                  <View style={styles.hostCardHeader}>
                    <View style={styles.hostAvatarWrapper}>
                      <Image source={{ uri: host.avatar }} style={styles.hostAvatar} />
                      <View style={styles.hostOnlineBadge}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineDotText}>Online</Text>
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

                  {/* Languages Spoken */}
                  <View style={styles.hostLangRow}>
                    {host.languages.map((l) => (
                      <View key={l} style={styles.hostLangTag}>
                        <Text style={styles.hostLangTagText}>{l}</Text>
                      </View>
                    ))}
                    {host.hasVideo && (
                      <View style={[styles.hostLangTag, { backgroundColor: '#FDF2F8' }]}>
                        <Video size={11} color="#DB2777" />
                        <Text style={[styles.hostLangTagText, { color: '#BE185D' }]}>Video Ready</Text>
                      </View>
                    )}
                  </View>

                  {/* Voice Bio Player */}
                  <TouchableOpacity
                    style={[styles.voiceBioPlayBar, isPlaying && styles.voiceBioPlayBarActive]}
                    onPress={() => togglePlayAudio(host.id)}
                  >
                    <View style={[styles.playCircle, isPlaying && styles.playCircleActive]}>
                      {isPlaying ? <Pause size={14} color="#FFFFFF" /> : <Play size={14} color="#4F46E5" />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.voiceBioText, isPlaying && { color: '#4F46E5', fontWeight: '700' }]}>
                        {isPlaying ? 'Playing Voice Intro...' : 'Listen to Voice Intro'}
                      </Text>
                      <Text style={styles.voiceBioDuration}>{host.audioDuration} • Real Voice Sample</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Connect Action Button */}
                  <TouchableOpacity
                    style={styles.connectHostBtn}
                    onPress={() => setIsLoginModalOpen(true)}
                  >
                    <PhoneCall size={15} color="#FFFFFF" />
                    <Text style={styles.connectHostBtnText}>Connect with {host.name.split(' ')[0]}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* 4. Why People Use Chatzzie (Relatable Prompts) */}
        <View id="why-chatzzie-sec" style={[styles.sectionWrap, { backgroundColor: '#F8FAFC' }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionPill}>
              <Smile size={14} color="#4F46E5" />
              <Text style={styles.sectionPillText}>Relatable Moments</Text>
            </View>
            <Text style={styles.sectionTitle}>Why People Turn to Chatzzie</Text>
            <Text style={styles.sectionSubtitle}>
              Whenever life feels overwhelming or lonely, your confidante is just one tap away.
            </Text>
          </View>

          <View style={styles.promptsGrid}>
            <View style={styles.promptCard}>
              <View style={[styles.promptIconBox, { backgroundColor: '#EEF2FF' }]}>
                <Moon size={22} color="#4F46E5" />
              </View>
              <Text style={styles.promptTitle}>Can&apos;t sleep at 2:00 AM?</Text>
              <Text style={styles.promptDesc}>
                Your friends are asleep, but your thoughts are racing. Talk out your midnight overthinking with a comforting listener.
              </Text>
            </View>

            <View style={styles.promptCard}>
              <View style={[styles.promptIconBox, { backgroundColor: '#FDF2F8' }]}>
                <Heart size={22} color="#DB2777" />
              </View>
              <Text style={styles.promptTitle}>Going through heartbreak?</Text>
              <Text style={styles.promptDesc}>
                Going through a painful breakup or relationship dilemma? Share your raw emotions without fear of mutual friends judging.
              </Text>
            </View>

            <View style={styles.promptCard}>
              <View style={[styles.promptIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Flame size={22} color="#D97706" />
              </View>
              <Text style={styles.promptTitle}>Stressed with work or exams?</Text>
              <Text style={styles.promptDesc}>
                Pressure from family, competitive exams, or your boss? Vent freely, declutter your mind, and find emotional calm.
              </Text>
            </View>

            <View style={styles.promptCard}>
              <View style={[styles.promptIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Users size={22} color="#059669" />
              </View>
              <Text style={styles.promptTitle}>Feeling lonely or bored?</Text>
              <Text style={styles.promptDesc}>
                Just need someone engaging to talk to about movies, chai, and life? Experience authentic warmth from genuine people.
              </Text>
            </View>
          </View>
        </View>

        {/* 5. How It Works (Step-by-Step) */}
        <View id="how-it-works-sec" style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionPill}>
              <Sparkles size={14} color="#059669" />
              <Text style={styles.sectionPillText}>Simple &amp; Seamless</Text>
            </View>
            <Text style={styles.sectionTitle}>How Chatzzie Works</Text>
            <Text style={styles.sectionSubtitle}>
              Three effortless steps to real human connection. No invasive questionnaires, no waiting queues.
            </Text>
          </View>

          <View style={styles.stepsContainer}>
            <View style={styles.stepCard}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Instant Masked Sign In</Text>
              <Text style={styles.stepDesc}>
                Enter your mobile number and 4-digit code. No email or social account required. Your phone number is strictly encrypted and never revealed.
              </Text>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Pick Your Confidante</Text>
              <Text style={styles.stepDesc}>
                Explore verified host profiles, listen to their authentic voice bio introductions, and pick someone who resonates with your mood.
              </Text>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepTitle}>Connect 1-on-1 Your Way</Text>
              <Text style={styles.stepDesc}>
                Tap Voice Call, HD Video, or Private Chat. Transparent coin billing deducts strictly per minute while connected. No surprise credit card bills.
              </Text>
            </View>
          </View>
        </View>

        {/* 6. Impact & Social Proof Numbers */}
        <View style={styles.impactNumbersSection}>
          <View style={styles.impactGrid}>
            <View style={styles.impactItem}>
              <Text style={styles.impactNumber}>1,000,000+</Text>
              <Text style={styles.impactLabel}>Minutes of Private Conversations</Text>
            </View>

            <View style={styles.impactItem}>
              <Text style={styles.impactNumber}>9.4 / 10</Text>
              <Text style={styles.impactLabel}>Users Feel Mentally Lighter</Text>
            </View>

            <View style={styles.impactItem}>
              <Text style={styles.impactNumber}>100%</Text>
              <Text style={styles.impactLabel}>Anonymous (Zero PSTN Number Exposure)</Text>
            </View>

            <View style={styles.impactItem}>
              <Text style={styles.impactNumber}>₹35,000/mo</Text>
              <Text style={styles.impactLabel}>Average Female Host Earnings</Text>
            </View>
          </View>
        </View>

        {/* 7. Dedicated Host Partner Recruitment Banner */}
        <View style={styles.hostBannerSection}>
          <View style={styles.hostBannerCard}>
            <View style={styles.hostBannerContent}>
              <View style={styles.hostBannerPill}>
                <Sparkles size={14} color="#FFFFFF" />
                <Text style={styles.hostBannerPillText}>Chatzzie Partner Network</Text>
              </View>
              <Text style={styles.hostBannerTitle}>Are You a Great Listener?</Text>
              <Text style={styles.hostBannerSubtitle}>
                Join Chatzzie as a verified host partner. Earn 50% revenue share with direct daily UPI settlements to your bank account, working from the comfort of home.
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

        {/* 8. Download Mobile Apps Showcase */}
        <View id="download-apps-sec" style={[styles.sectionWrap, { backgroundColor: '#0B0F19' }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionPill, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Smartphone size={14} color="#818CF8" />
              <Text style={[styles.sectionPillText, { color: '#818CF8' }]}>Available on All Devices</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Download the Chatzzie App</Text>
            <Text style={[styles.sectionSubtitle, { color: '#94A3B8' }]}>
              Install Chatzzie directly on your Android phone or iPhone for instant call notifications and zero latency.
            </Text>
          </View>

          <View style={styles.downloadRow}>
            {/* Google Play */}
            <TouchableOpacity style={styles.downloadOptionCard} onPress={handleDownloadApk}>
              <View style={[styles.downloadIconWrap, { backgroundColor: '#064E3B' }]}>
                <Smartphone size={24} color="#34D399" />
              </View>
              <Text style={styles.downloadOptionTitle}>Android Smartphone</Text>
              <Text style={styles.downloadOptionDesc}>Google Play Store &amp; Standalone APK</Text>
              <View style={styles.downloadOptionBtn}>
                <Download size={15} color="#FFFFFF" />
                <Text style={styles.downloadOptionBtnText}>Download .APK (Instant)</Text>
              </View>
            </TouchableOpacity>

            {/* iOS App Store */}
            <TouchableOpacity style={styles.downloadOptionCard} onPress={handleDownloadApk}>
              <View style={[styles.downloadIconWrap, { backgroundColor: '#1E293B' }]}>
                <Apple size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.downloadOptionTitle}>Apple iPhone / iPad</Text>
              <Text style={styles.downloadOptionDesc}>Apple App Store &amp; PWA Safari Home Screen</Text>
              <View style={[styles.downloadOptionBtn, { backgroundColor: '#334155' }]}>
                <Apple size={15} color="#FFFFFF" />
                <Text style={styles.downloadOptionBtnText}>Install on iOS</Text>
              </View>
            </TouchableOpacity>

            {/* Instant Web App */}
            <TouchableOpacity
              style={styles.downloadOptionCard}
              onPress={() => setIsLoginModalOpen(true)}
            >
              <View style={[styles.downloadIconWrap, { backgroundColor: '#312E81' }]}>
                <PhoneCall size={24} color="#818CF8" />
              </View>
              <Text style={styles.downloadOptionTitle}>Desktop &amp; Web Browser</Text>
              <Text style={styles.downloadOptionDesc}>No download required. Works on Chrome, Safari, Edge</Text>
              <View style={[styles.downloadOptionBtn, { backgroundColor: '#4F46E5' }]}>
                <ArrowRight size={15} color="#FFFFFF" />
                <Text style={styles.downloadOptionBtnText}>Open Web App Now</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 9. FAQ Accordion */}
        <View id="faq-sec" style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionPill}>
              <HelpCircle size={14} color="#4F46E5" />
              <Text style={styles.sectionPillText}>Got Questions?</Text>
            </View>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>

          <View style={styles.faqList}>
            {faqs.map((faq, index) => {
              const isOpen = expandedFaqIndex === index;
              return (
                <View key={index} style={styles.faqCard}>
                  <TouchableOpacity
                    style={styles.faqQuestionRow}
                    onPress={() => setExpandedFaqIndex(isOpen ? null : index)}
                  >
                    <Text style={styles.faqQuestionText}>{faq.q}</Text>
                    {isOpen ? <ChevronUp size={20} color="#4F46E5" /> : <ChevronDown size={20} color="#64748B" />}
                  </TouchableOpacity>
                  {isOpen && <Text style={styles.faqAnswerText}>{faq.a}</Text>}
                </View>
              );
            })}
          </View>
        </View>

        {/* 10. Corporate Legal & Compliance Footer */}
        <View style={styles.footerWrap}>
          <View style={styles.footerInner}>
            <View style={styles.footerBrandCol}>
              <View style={styles.footerBrandRow}>
                <View style={styles.brandIconBox}>
                  <Headphones size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.footerBrandTitle}>Chatzzie</Text>
              </View>
              <Text style={styles.footerTagline}>
                India&apos;s leading anonymous social wellness and 1:1 emotional listening platform.
              </Text>
              <Text style={styles.footerCorporate}>
                Owned &amp; Operated by:{'\n'}
                <Text style={{ fontWeight: '700', color: '#CBD5E1' }}>
                  Chatzzie Technologies Private Limited
                </Text>
              </Text>
              <Text style={styles.footerContact}>Support: support@chatzzie.com</Text>
            </View>

            {/* Quick Links */}
            <View style={styles.footerCol}>
              <Text style={styles.footerColHeader}>Platform</Text>
              <TouchableOpacity onPress={() => setIsLoginModalOpen(true)}>
                <Text style={styles.footerLink}>Caller Web App</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onOpenHostPortal}>
                <Text style={styles.footerLink}>Become a Host Partner (/host)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDownloadApk}>
                <Text style={styles.footerLink}>Download Android APK</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onOpenAdminLogin}>
                <Text style={[styles.footerLink, { color: '#64748B' }]}>Admin Portal (/admin/login)</Text>
              </TouchableOpacity>
            </View>

            {/* Legal & Policies */}
            <View style={styles.footerCol}>
              <Text style={styles.footerColHeader}>Legal &amp; Trust</Text>
              <TouchableOpacity onPress={() => setPolicyModal({ visible: true, type: 'terms' })}>
                <Text style={styles.footerLink}>Terms of Service</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPolicyModal({ visible: true, type: 'privacy' })}>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPolicyModal({ visible: true, type: 'refund' })}>
                <Text style={styles.footerLink}>Cancellation &amp; Refund Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPolicyModal({ visible: true, type: 'safety' })}>
                <Text style={styles.footerLink}>Community Care Guidelines</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerBottomRow}>
            <Text style={styles.copyrightText}>
              © 2026 Chatzzie Technologies Private Limited. All rights reserved.
            </Text>
            <Text style={styles.disclaimerText}>
              Disclaimer: Chatzzie is a peer-to-peer social wellness platform. Not intended for clinical psychiatric crises or emergency medical care.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 11. Modal: Login Screen Popup */}
      <Modal
        visible={isLoginModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLoginModalOpen(false)}
      >
        <View style={styles.loginModalOverlay}>
          <View style={styles.loginModalContainer}>
            <TouchableOpacity
              style={styles.closeLoginModalBtn}
              onPress={() => setIsLoginModalOpen(false)}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <LoginScreen
              onLoginSuccess={(user) => {
                setIsLoginModalOpen(false);
                onLoginSuccess(user);
              }}
              onOpenHostPortal={() => {
                setIsLoginModalOpen(false);
                onOpenHostPortal();
              }}
            />
          </View>
        </View>
      </Modal>

      {/* 12. Modal: Legal Policies */}
      <PolicyModal
        visible={policyModal.visible}
        type={policyModal.type}
        onClose={() => setPolicyModal({ visible: false, type: 'terms' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Navbar
  navbar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    zIndex: 100,
  },
  navInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.2,
  },
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  hostPartnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDF2F8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  hostPartnerPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#BE185D',
  },
  earnBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  earnBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  navActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  downloadNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  downloadNavBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  loginNavBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  loginNavBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Scroll Body
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero Section
  heroSection: {
    paddingVertical: 56,
    paddingHorizontal: 24,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  heroBackgroundGlow: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 300,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 200,
    filter: 'blur(80px)' as any,
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
    fontSize: Platform.OS === 'web' ? 44 : 32,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: Platform.OS === 'web' ? 54 : 40,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroSecondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Store Badges Strip
  storeBadgesStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  storeBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storeBadgeSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  storeBadgeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  storeBadgeCardApk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  storeBadgeSubApk: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  storeBadgeTitleApk: {
    fontSize: 13,
    fontWeight: '800',
    color: '#312E81',
  },
  downloadNoticeToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 18,
  },
  downloadNoticeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },

  // Section Wrappers
  sectionWrap: {
    paddingVertical: 64,
    paddingHorizontal: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  sectionHeader: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 44,
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
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 640,
    lineHeight: 24,
  },

  // Host Cards Showcase
  hostsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
  hostShowcaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: Platform.OS === 'web' && width > 900 ? '31%' : '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  hostCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  hostAvatarWrapper: {
    position: 'relative',
  },
  hostAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  hostOnlineBadge: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    transform: [{ translateX: -24 }],
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
  onlineDotText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hostMetaInfo: {
    flex: 1,
  },
  hostCardName: {
    fontSize: 17,
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
    fontWeight: '500',
    color: '#64748B',
  },
  hostTagline: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
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
  voiceBioPlayBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  voiceBioPlayBarActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    paddingVertical: 11,
    borderRadius: 12,
  },
  connectHostBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Relatable Prompts
  promptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    width: Platform.OS === 'web' && width > 768 ? '47%' : '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  promptIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  promptTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  promptDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },

  // Steps
  stepsContainer: {
    flexDirection: Platform.OS === 'web' && width > 768 ? 'row' : 'column',
    gap: 20,
  },
  stepCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  stepNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },

  // Impact Section
  impactNumbersSection: {
    backgroundColor: '#4F46E5',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  impactGrid: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'space-around',
  },
  impactItem: {
    alignItems: 'center',
    minWidth: 180,
  },
  impactNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  impactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C7D2FE',
    textAlign: 'center',
  },

  // Host Banner Section
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
    padding: Platform.OS === 'web' && width > 768 ? 44 : 28,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
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
    letterSpacing: -0.5,
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
    flexDirection: Platform.OS === 'web' && width > 768 ? 'row' : 'column',
    gap: 20,
  },
  downloadOptionCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    textAlign: 'center',
  },
  downloadIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  downloadOptionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  downloadOptionDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  downloadOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'center',
  },
  downloadOptionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // FAQs
  faqList: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    gap: 12,
  },
  faqCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  faqAnswerText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  // Footer
  footerWrap: {
    backgroundColor: '#0F172A',
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
    marginTop: 32,
  },
  footerInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: Platform.OS === 'web' && width > 768 ? 'row' : 'column',
    gap: 40,
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  footerBrandCol: {
    maxWidth: 380,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  footerBrandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  footerTagline: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 16,
  },
  footerCorporate: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 8,
  },
  footerContact: {
    fontSize: 12,
    fontWeight: '600',
    color: '#818CF8',
  },
  footerCol: {
    gap: 12,
  },
  footerColHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  footerLink: {
    fontSize: 13,
    color: '#94A3B8',
  },
  footerBottomRow: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 24,
    flexDirection: Platform.OS === 'web' && width > 768 ? 'row' : 'column',
    justifyContent: 'space-between',
    gap: 12,
  },
  copyrightText: {
    fontSize: 12,
    color: '#64748B',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#475569',
    maxWidth: 600,
  },

  // Login Modal
  loginModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loginModalContainer: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '90%',
  },
  closeLoginModalBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 9999,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
