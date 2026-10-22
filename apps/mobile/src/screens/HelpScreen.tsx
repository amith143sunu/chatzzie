import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { THEME } from '../theme';

interface HelpScreenProps {
  onBackPress: () => void;
}

export const HelpScreen: React.FC<HelpScreenProps> = ({ onBackPress }) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What kind of behaviour is not allowed on Chatzie?',
      a: 'Any kind of abuse, harassment, hate speech, or inappropriate sexually explicit content is strictly not allowed. Accounts violating our community dignity standards are permanently banned.',
    },
    {
      q: 'When is Chatzie customer support available?',
      a: 'Chatzie customer support is available from Monday to Friday, 10:00 AM to 6:00 PM IST.',
    },
    {
      q: 'What is strictly prohibited on this platform?',
      a: 'Sharing any kind of personal phone numbers, social media handles, or offline payment UPI details with partners is strictly prohibited. The platform is not responsible for any off-platform transactions.',
    },
    {
      q: 'How does per-minute billing work?',
      a: 'Calls are billed minute-by-minute directly from your wallet balance based on the listener’s tariff. You can recharge at any time from the Wallet tab.',
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
          <ArrowLeft size={22} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Contact Channels */}
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactCard}>
          <TouchableOpacity style={styles.contactItem} activeOpacity={0.8}>
            <View style={styles.contactItemLeft}>
              <MessageCircle size={20} color={THEME.colors.primary} />
              <Text style={styles.contactText}>Chat on WhatsApp</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} activeOpacity={0.8}>
            <View style={styles.contactItemLeft}>
              <Phone size={20} color={THEME.colors.primary} />
              <Text style={styles.contactText}>Call us</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.contactItem, { borderBottomWidth: 0 }]} activeOpacity={0.8}>
            <View style={styles.contactItemLeft}>
              <Mail size={20} color={THEME.colors.primary} />
              <Text style={styles.contactText}>Email Support</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Frequently Asked Questions</Text>
        <View style={styles.faqCard}>
          {faqs.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => setExpandedFaq(isOpen ? null : index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  {isOpen ? (
                    <ChevronUp size={18} color={THEME.colors.primary} />
                  ) : (
                    <ChevronDown size={18} color={THEME.colors.textMuted} />
                  )}
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.a}</Text>
                  </View>
                )}
              </View>
            );
          })}
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
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 10,
  },
  contactCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  contactItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  faqCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 19,
  }
});
