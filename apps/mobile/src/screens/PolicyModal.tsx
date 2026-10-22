import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ArrowLeft, FileText, Shield, RotateCcw } from 'lucide-react-native';
import { THEME } from '../theme';

export type PolicyType = 'privacy' | 'terms' | 'refund';

interface PolicyModalProps {
  visible: boolean;
  type: PolicyType;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  visible,
  type,
  onClose,
}) => {
  const getDetails = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: Shield,
          content: [
            { h: '1. Information We Collect', p: 'We collect phone numbers for authentication, approximate city location, and profile preferences to provide connection services. We do not sell your personal data.' },
            { h: '2. Call Confidentiality', p: 'Audio and video communications are peer-to-peer and encrypted in transit via Agora RTC. We do not record 1-on-1 private calls without your explicit consent.' },
            { h: '3. Data Retention', p: 'Account data is retained as long as your profile remains active. You may request permanent deletion of your account and records at any time from Settings.' },
          ]
        };
      case 'terms':
        return {
          title: 'Terms of Use Agreement',
          icon: FileText,
          content: [
            { h: '1. Eligibility & Age Limit', p: 'You must be at least 18 years of age to register and use Chatzie services. You must have no unspent convictions relating to harassment or misconduct.' },
            { h: '2. Dignified Community Standards', p: 'Users and Listeners are required to interact with dignity. Inappropriate sexual solicitation, hate speech, abusive language, or harassment will lead to immediate permanent termination.' },
            { h: '3. Off-Platform Transactions Prohibited', p: 'Users are strictly prohibited from transferring money, UPI amounts, or gifts to partners outside Chatzie. Any off-platform payments are made solely at your own risk.' },
          ]
        };
      case 'refund':
        return {
          title: 'Returns & Refund Policy',
          icon: RotateCcw,
          content: [
            { h: '1. Digital Goods & Wallet Balance', p: 'Chatzie provides digital communication services and wallet balances. Once wallet credits or call minutes are consumed, payments are non-refundable under ordinary circumstances.' },
            { h: '2. In-App Purchases & Gateway Disputes', p: 'For failed transactions where money is debited from your bank or UPI but not credited to your wallet balance within 2 hours, write to support@chatzie.in with your transaction reference.' },
            { h: '3. Host Payout Disbursals', p: 'Listener earnings are disbursed to verified UPI IDs or Indian bank accounts via RazorpayX. Standard payout processing takes 24 to 48 business hours.' },
          ]
        };
    }
  };

  const details = getDetails();
  const Icon = details.icon;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <ArrowLeft size={22} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{details.title}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.iconCircle}>
            <Icon size={28} color={THEME.colors.primary} />
          </View>

          <Text style={styles.docTitle}>{details.title}</Text>
          <Text style={styles.lastUpdated}>Last updated: October 2026</Text>

          <View style={styles.sectionsList}>
            {details.content.map((sec, i) => (
              <View key={i} style={styles.secBlock}>
                <Text style={styles.secHeading}>{sec.h}</Text>
                <Text style={styles.secParagraph}>{sec.p}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>I Understand</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  docTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  lastUpdated: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  sectionsList: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  secBlock: {
    backgroundColor: THEME.colors.background,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  secHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  secParagraph: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 19,
  },
  closeBtn: {
    width: '100%',
    height: 48,
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: THEME.colors.white,
    fontSize: 15,
    fontWeight: '800',
  }
});
