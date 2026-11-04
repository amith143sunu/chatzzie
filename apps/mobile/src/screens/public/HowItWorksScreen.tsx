import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  PhoneCall,
  Coins,
  ArrowRight,
  Headphones,
  CheckCircle2,
  Users,
} from 'lucide-react-native';

interface HowItWorksScreenProps {
  onNavigate: (path: string) => void;
  onOpenLogin: () => void;
}

export const HowItWorksScreen: React.FC<HowItWorksScreenProps> = ({
  onNavigate,
  onOpenLogin,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const steps = [
    {
      step: '01',
      title: 'Instant Anonymous Sign In',
      desc: 'Enter your phone number and verify with a quick 4-digit code. No email, real names, or social media links required. Your number is encrypted on disk and never visible to hosts or other callers.',
      badge: 'Zero Identity Exposure',
      color: '#4F46E5',
    },
    {
      step: '02',
      title: 'Listen to Voice Intros & Pick Your Confidante',
      desc: 'Browse hundreds of KYC-verified female listeners across India. Filter by language (Hindi, English, Punjabi, Tamil, etc.). Listen to their authentic 15-second voice bio intros before connecting.',
      badge: 'Verified Humans',
      color: '#059669',
    },
    {
      step: '03',
      title: 'Connect 1:1 on Encrypted Audio or Video',
      desc: 'Tap "Call Now" to ring the host console instantly. Calls are routed through masked WebRTC tunnels. Enjoy compassionate, non-judgmental human conversation with transparent per-minute coin billing.',
      badge: 'Pay-Per-Minute',
      color: '#DB2777',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.pillBadge}>
          <Sparkles size={14} color="#4F46E5" />
          <Text style={styles.pillBadgeText}>Transparent &amp; Effortless</Text>
        </View>
        <Text style={styles.mainTitle}>How Chatzzie Works</Text>
        <Text style={styles.subtitle}>
          Three simple steps to genuine human connection. No invasive forms, no algorithmic wait times, no awkward small talk.
        </Text>
      </View>

      {/* Steps Flow */}
      <View style={styles.sectionWrap}>
        <View style={[styles.stepsList, isDesktop && styles.stepsListDesktop]}>
          {steps.map((item, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={[styles.stepNumBadge, { backgroundColor: item.color }]}>
                <Text style={styles.stepNumText}>{item.step}</Text>
              </View>
              <Text style={[styles.stepTag, { color: item.color }]}>{item.badge}</Text>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Safety & Identity Masking Deep Dive */}
      <View style={[styles.sectionWrap, { backgroundColor: '#F8FAFC' }]}>
        <View style={styles.innerBox}>
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={styles.pillBadge}>
              <ShieldCheck size={14} color="#059669" />
              <Text style={[styles.pillBadgeText, { color: '#059669' }]}>Privacy Architecture</Text>
            </View>
            <Text style={styles.subHeading}>How We Protect Your 100% Anonymity</Text>
          </View>

          <View style={[styles.safetyGrid, isDesktop && styles.safetyGridDesktop]}>
            <View style={styles.safetyCard}>
              <View style={[styles.iconWrap, { backgroundColor: '#EEF2FF' }]}>
                <Lock size={22} color="#4F46E5" />
              </View>
              <Text style={styles.safetyCardTitle}>Zero PSTN Number Exposure</Text>
              <Text style={styles.safetyCardDesc}>
                Traditional phone calls reveal your caller ID. Chatzzie routes voice entirely over peer-to-peer WebRTC data channels. The host never sees your digits.
              </Text>
            </View>

            <View style={styles.safetyCard}>
              <View style={[styles.iconWrap, { backgroundColor: '#ECFDF5' }]}>
                <ShieldCheck size={22} color="#059669" />
              </View>
              <Text style={styles.safetyCardTitle}>No Social Graph Linking</Text>
              <Text style={styles.safetyCardDesc}>
                We do not ask for Google, Apple ID, or contacts permissions. Your activity on Chatzzie remains completely isolated from your daily social circle.
              </Text>
            </View>

            <View style={styles.safetyCard}>
              <View style={[styles.iconWrap, { backgroundColor: '#FDF2F8' }]}>
                <Coins size={22} color="#DB2777" />
              </View>
              <Text style={styles.safetyCardTitle}>No Recurring Subscriptions</Text>
              <Text style={styles.safetyCardDesc}>
                You recharge virtual coins only when you want to talk (1 INR = 10 Coins). Voice calls are 90 coins/min (₹9/min). Zero auto-debits or hidden fees.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Call to Action Bar */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Experience Authentic Human Connection?</Text>
        <Text style={styles.ctaSubtitle}>
          Connect with a kind listener right now in your browser without downloading anything.
        </Text>
        <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85} onPress={onOpenLogin}>
          <PhoneCall size={18} color="#FFFFFF" />
          <Text style={styles.ctaBtnText}>Start Talking Online (Free Web App)</Text>
        </TouchableOpacity>
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
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 16,
  },
  pillBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
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

  sectionWrap: {
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  stepsList: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 24,
  },
  stepsListDesktop: {
    flexDirection: 'row',
  },
  stepCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  stepNumBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  stepNumText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stepTag: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    lineHeight: 24,
  },
  stepDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 22,
  },

  innerBox: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  subHeading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  safetyGrid: {
    flexDirection: 'column',
    gap: 20,
  },
  safetyGridDesktop: {
    flexDirection: 'row',
  },
  safetyCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  safetyCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  safetyCardDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },

  ctaSection: {
    backgroundColor: '#4F46E5',
    paddingVertical: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaSubtitle: {
    fontSize: 15,
    color: '#C7D2FE',
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 24,
    marginBottom: 28,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4F46E5',
  },
});
