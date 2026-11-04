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
  Moon,
  Heart,
  Flame,
  Users,
  Smile,
  ShieldCheck,
  Star,
  PhoneCall,
  ArrowRight,
  Headphones,
} from 'lucide-react-native';

interface WhyChatzzieScreenProps {
  onNavigate: (path: string) => void;
  onOpenLogin: () => void;
}

export const WhyChatzzieScreen: React.FC<WhyChatzzieScreenProps> = ({
  onNavigate,
  onOpenLogin,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const scenarios = [
    {
      icon: Moon,
      color: '#4F46E5',
      bg: '#EEF2FF',
      title: "Can't sleep at 2:00 AM?",
      subtitle: "Midnight Overthinking & Anxiety",
      desc: "Your friends are asleep, but your thoughts are racing. Replaying past conversations, worrying about the future, or feeling the weight of the silence. Talk out your thoughts with a comforting presence who is awake and ready to listen.",
    },
    {
      icon: Heart,
      color: '#DB2777',
      bg: '#FDF2F8',
      title: "Going through heartbreak?",
      subtitle: "Breakups, Rejection & Grief",
      desc: "When a relationship breaks, your emotional world feels shattered. You want to vent without mutual friends judging or giving unsolicited cliches. Share your raw emotions in a safe space where you are truly validated.",
    },
    {
      icon: Flame,
      color: '#D97706',
      bg: '#FEF3C7',
      title: "Stressed with work or exams?",
      subtitle: "Burnout, Toxic Bosses & Pressure",
      desc: "Family expectations, competitive entrance exams, or relentless corporate pressure? You don't need a medical diagnosis; you just need to vent freely, declutter your mind, and catch an emotional breath.",
    },
    {
      icon: Users,
      color: '#059669',
      bg: '#F0FDF4',
      title: "Feeling lonely or just need chai talk?",
      subtitle: "Everyday Isolation & Meaningful Talk",
      desc: "Living alone in a new city? Eating dinner in silence? You don't have to be in crisis to talk to someone. Enjoy lively chats about movies, life, dreams, and everyday banter with a genuine, warm companion.",
    },
  ];

  const testimonials = [
    {
      quote: "It was 3:30 AM after a brutal breakup. I was about to text my ex until I dialed a listener on Chatzzie. She just let me cry and talk for 20 minutes without interrupting. It saved my self-respect.",
      author: "Anonymous Caller",
      city: "Bengaluru",
      rating: 5,
    },
    {
      quote: "The best part is that it is completely anonymous. I didn't have to explain my whole life history. I vented about my boss and felt 100 kilos lighter the next morning.",
      author: "IT Consultant",
      city: "Gurugram",
      rating: 5,
    },
    {
      quote: "My friends always try to solve my problems. Sometimes I don't want solutions—I just want someone to say 'I hear you, and that sounds really hard.' That's what Chatzzie gave me.",
      author: "College Student",
      city: "Pune",
      rating: 5,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentWrap}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.pillBadge}>
          <Smile size={14} color="#4F46E5" />
          <Text style={styles.pillBadgeText}>Relatable Human Moments</Text>
        </View>
        <Text style={styles.mainTitle}>Why People Turn to Chatzzie</Text>
        <Text style={styles.subtitle}>
          Life can get heavy. When friends are busy and the night gets quiet, your confidante is just one tap away.
        </Text>
      </View>

      {/* Relatable Prompts Grid */}
      <View style={styles.sectionWrap}>
        <View style={[styles.scenariosGrid, isDesktop && styles.scenariosGridDesktop]}>
          {scenarios.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={index} style={styles.scenarioCard}>
                <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                  <Icon size={24} color={item.color} />
                </View>
                <Text style={[styles.scenarioSub, { color: item.color }]}>{item.subtitle}</Text>
                <Text style={styles.scenarioTitle}>{item.title}</Text>
                <Text style={styles.scenarioDesc}>{item.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Real Caller Stories */}
      <View style={[styles.sectionWrap, { backgroundColor: '#F8FAFC' }]}>
        <View style={styles.innerBox}>
          <View style={{ alignItems: 'center', marginBottom: 36 }}>
            <Text style={styles.subHeading}>Stories from Real Callers</Text>
            <Text style={{ color: '#64748B', fontSize: 15, marginTop: 8 }}>
              Here is how 10 minutes of genuine listening changed someone&apos;s night.
            </Text>
          </View>

          <View style={[styles.testimonialsGrid, isDesktop && styles.testimonialsGridDesktop]}>
            {testimonials.map((t, index) => (
              <View key={index} style={styles.testimonialCard}>
                <View style={styles.starsRow}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={15} color="#F59E0B" fill="#F59E0B" />
                  ))}
                </View>
                <Text style={styles.quoteText}>&ldquo;{t.quote}&rdquo;</Text>
                <View style={styles.authorRow}>
                  <Text style={styles.authorName}>{t.author}</Text>
                  <Text style={styles.authorCity}>• {t.city}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom CTA */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Don&apos;t Carry the Weight Alone Tonight</Text>
        <Text style={styles.ctaSubtitle}>
          Connect with an attentive human listener in under 15 seconds. Completely private and anonymous.
        </Text>
        <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85} onPress={onOpenLogin}>
          <PhoneCall size={18} color="#FFFFFF" />
          <Text style={styles.ctaBtnText}>Start Talking Online (Free Web App)</Text>
        </TouchableOpacity>
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
  scenariosGrid: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 24,
  },
  scenariosGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scenarioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 26,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    flexBasis: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scenarioSub: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  scenarioDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 22,
  },

  innerBox: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  subHeading: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  testimonialsGrid: {
    flexDirection: 'column',
    gap: 20,
  },
  testimonialsGridDesktop: {
    flexDirection: 'row',
  },
  testimonialCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 14,
  },
  quoteText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  authorCity: {
    fontSize: 12,
    color: '#64748B',
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
