import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  Platform,
} from 'react-native';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  PhoneCall,
  ShieldCheck,
  Coins,
} from 'lucide-react-native';

interface FaqScreenProps {
  onNavigate: (path: string) => void;
  onOpenLogin: () => void;
}

export const FaqScreen: React.FC<FaqScreenProps> = ({
  onNavigate,
  onOpenLogin,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Privacy & Anonymity', 'Billing & Coins', 'Hosts & Verification', 'Technical'];

  const allFaqs = [
    {
      category: 'Privacy & Anonymity',
      q: 'Will the host ever see my phone number or real identity?',
      a: 'Never. All calls on Chatzzie are routed through peer-to-peer masked WebRTC infrastructure. Your phone number, real name, and personal identity remain 100% masked and private.',
    },
    {
      category: 'Billing & Coins',
      q: 'How does coin billing work? Are there recurring subscriptions?',
      a: 'Chatzzie operates strictly on transparent pay-as-you-go virtual coins (1 INR = 10 Coins). Voice calls cost 90 coins/min (₹9/min) and Video calls cost 300 coins/min (₹30/min). You are only billed for the exact seconds connected, with zero recurring charges or hidden fees.',
    },
    {
      category: 'Hosts & Verification',
      q: 'Who are the hosts on Chatzzie?',
      a: 'Chatzzie hosts are KYC-verified women conversationalists and empathetic listeners across India who have passed audio bio screening. Every host is a real human — zero AI bots.',
    },
    {
      category: 'Technical',
      q: 'Can I use Chatzzie from my laptop or PC without downloading?',
      a: 'Yes! Chatzzie runs natively in any web browser without needing to download anything. Just tap "Start Talking Online" to log in and connect from your laptop or phone.',
    },
    {
      category: 'Privacy & Anonymity',
      q: 'What if someone behaves inappropriately during a call?',
      a: 'Chatzzie has a strict zero-tolerance policy. You can disconnect with one tap and flag the user. Violators are immediately reviewed by admin moderators and permanently banned.',
    },
    {
      category: 'Billing & Coins',
      q: 'What happens if my coin balance runs out mid-call?',
      a: 'The system gives you a gentle 1-minute audio reminder. If coins deplete, the call disconnects automatically without generating negative balances or overdraft fees.',
    },
    {
      category: 'Hosts & Verification',
      q: 'How can I apply to become a host partner?',
      a: 'Visit chatzzie.com/host to complete your KYC onboarding with your voice intro and PAN document. Approved hosts earn 50% revenue share with daily direct UPI payouts.',
    },
    {
      category: 'Technical',
      q: 'Is my voice call recorded on servers?',
      a: 'No. Calls are routed directly peer-to-peer over encrypted WebRTC media tunnels. Chatzzie does not store audio recordings of your private conversations.',
    },
  ];

  const filteredFaqs = allFaqs.filter((faq) => {
    const matchesSearch =
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === 'All' || faq.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentWrap}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.pillBadge}>
          <HelpCircle size={14} color="#4F46E5" />
          <Text style={styles.pillBadgeText}>Help Center &amp; Support</Text>
        </View>
        <Text style={styles.mainTitle}>Frequently Asked Questions</Text>
        <Text style={styles.subtitle}>
          Everything you need to know about identity masking, coin billing, host verification, and call safety.
        </Text>
      </View>

      {/* Search & Filter */}
      <View style={styles.filterSection}>
        <View style={styles.filterContainer}>
          <View style={styles.searchBar}>
            <Search size={16} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search frequently asked questions..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catPillsRow}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catPill, isSelected && styles.catPillActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Accordion List */}
      <View style={styles.faqSection}>
        <View style={styles.faqList}>
          {filteredFaqs.map((faq, index) => {
            const isOpen = expandedIndex === index;
            return (
              <View key={index} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  activeOpacity={0.8}
                  onPress={() => setExpandedIndex(isOpen ? null : index)}
                >
                  <Text style={styles.faqCategoryLabel}>{faq.category}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <Text style={styles.faqQuestionText}>{faq.q}</Text>
                    {isOpen ? <ChevronUp size={20} color="#4F46E5" /> : <ChevronDown size={20} color="#64748B" />}
                  </View>
                </TouchableOpacity>
                {isOpen && <Text style={styles.faqAnswerText}>{faq.a}</Text>}
              </View>
            );
          })}
        </View>
      </View>

      {/* Bottom CTA */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Still Have Questions?</Text>
        <Text style={styles.ctaSubtitle}>
          Reach out to our 24/7 care desk at support@chatzzie.com or start a quick anonymous call now.
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

  filterSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  filterContainer: {
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
    gap: 14,
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
  catPillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  catPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  catPillActive: {
    backgroundColor: '#4F46E5',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },

  faqSection: {
    paddingHorizontal: 24,
    marginBottom: 56,
  },
  faqList: {
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
    gap: 14,
  },
  faqCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqQuestionRow: {
    gap: 6,
  },
  faqCategoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  faqAnswerText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 22,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
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
