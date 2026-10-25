import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ArrowLeft, FileText, Shield, RotateCcw, HeartHandshake, CheckCircle2 } from 'lucide-react-native';
import { THEME } from '../theme';

export type PolicyType = 'privacy' | 'terms' | 'refund' | 'community';

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
  const [activeTab, setActiveTab] = useState<PolicyType>(type);

  // Sync tab if prop changes
  React.useEffect(() => {
    setActiveTab(type);
  }, [type]);

  const getDoc = () => {
    switch (activeTab) {
      case 'terms':
        return {
          title: 'Terms of Service Agreement',
          subtitle: 'Legal agreement governing your use of Chatzzie',
          icon: FileText,
          updated: 'October 2026',
          intro: 'Welcome to Chatzzie, operated by Chatzzie Technologies Private Limited ("Chatzzie", "we", "our", or "us"). Please read these Terms of Service carefully before accessing our website (https://chatzzie.com) or mobile applications. By creating an account or using our platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use the service.',
          sections: [
            {
              heading: '1. Acceptance & Amendments',
              body: 'We reserve the right to modify these Terms of Service and our operating guidelines at our discretion to reflect new features, security updates, or legal compliance requirements. The latest revision date will always appear at the top of this document. Continued use of Chatzzie following any modifications constitutes your formal acceptance of the updated terms.',
            },
            {
              heading: '2. Eligibility & Age Verification (Strict 18+ Rule)',
              body: 'Chatzzie is designed exclusively for adults seeking meaningful, anonymous conversations. By creating an account, you legally affirm and warrant that:\n• You are at least 18 years of age.\n• You possess the full legal capacity to enter into a binding contract under the laws of India.\n• You have never been convicted of, or subject to any active restraining order related to assault, harassment, domestic violence, or sexual misconduct.\n• You have not previously been banned, suspended, or removed from Chatzzie for policy violations.\n• You will strictly abide by all local, state, national, and international laws while using the platform.',
            },
            {
              heading: '3. Governing Law & Dispute Resolution',
              body: 'These Terms of Service, the Privacy Policy, and any disputes arising out of or related to your use of Chatzzie shall be governed by and construed in accordance with the laws of India. You agree to submit to the exclusive jurisdiction of the competent courts in Bangalore, Karnataka, India.',
            },
            {
              heading: '4. Account Registration & Anonymity Safeguards',
              body: 'You authenticate your Chatzzie account via mobile number and SMS OTP. To protect your real-world identity, your phone number is NEVER shared with other users or hosts. You choose an anonymous display name, avatar, and conversation preferences. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities conducted under your profile. If you suspect unauthorized access, contact support@chatzzie.com immediately.',
            },
            {
              heading: '5. Community Guidelines & Dignified Conduct',
              body: 'Chatzzie is a sanctuary for empathetic, respectful, and comforting dialogue. Users and verified hosts are expected to conduct themselves with the highest standards of dignity. The following behaviors are strictly prohibited:\n• Transmitting defamatory, abusive, profane, obscene, sexually explicit, threatening, or harassing content.\n• Harassing, stalking, extorting, or intimidating any user or host.\n• Using automated scripts, bots, scrapers, or unauthorized third-party clients.\n• Misrepresenting identity or soliciting commercial business, services, or loans.\n• Recording, screenshotting, or distributing audio/video streams without mutual explicit consent.',
            },
            {
              heading: '6. Anti-Leak Policy: Strict Ban on Contact Numbers & Social Handles',
              body: 'To protect users from external harassment, stalking, and financial fraud, sharing personal contact information is strictly prohibited. You may NOT share, solicit, or exchange:\n• Numeric telephone numbers, WhatsApp numbers, or carrier dialer details.\n• Social media handles (Instagram, Snapchat, Telegram, Facebook, LinkedIn, Twitter/X).\n• Personal email addresses or home/workplace locations.\n• Payment handles (UPI IDs, Paytm, PhonePe, Google Pay, QR codes).\nOur SafeTalk AI monitoring engine actively scans real-time streams and text chats. Detected violations result in immediate session disconnection, balance forfeiture, and permanent account termination.',
            },
            {
              heading: '7. Absolute Prohibition of Off-Platform Money Transfers',
              body: 'All financial interactions on Chatzzie must occur exclusively through official in-app coin packs and platform virtual gifts. Users and hosts are strictly prohibited from soliciting, sending, requesting, or receiving money outside the app. Chatzzie bears ZERO liability for any off-platform transactions, loans, gifts, or UPI transfers. Anyone asking for external money must be reported immediately.',
            },
            {
              heading: '8. Account Termination & Right to Deletion',
              body: 'You may permanently delete your Chatzzie account at any time directly through the app settings. Account deletion purges your profile, contact associations, and conversation logs within 24 hours. Chatzzie reserves the right to suspend or terminate accounts that breach these Terms without prior notice or refund.',
            },
          ],
        };

      case 'refund':
        return {
          title: 'Returns & Refund Policy',
          subtitle: 'Clear, empathetic guidelines on digital purchases and credits',
          icon: RotateCcw,
          updated: 'October 2026',
          intro: 'Thank you for using Chatzzie. We strive to provide transparent, trustworthy communication services. Because Chatzzie delivers digital goods, coin balances, and live communication sessions, this policy outlines the terms applicable to all purchases made on our platform.',
          sections: [
            {
              heading: '1. Digital Goods & Non-Physical Products',
              body: 'Since Chatzzie provides digital communication services and virtual coins rather than physical goods, standard product returns and physical cancellations do not apply. Chatzzie coins, minutes, and virtual gifts are consumed in real time to facilitate 1:1 voice/video calls and instant messaging.',
            },
            {
              heading: '2. General Non-Refundability of Consumed Credits',
              body: 'As a general rule, once wallet coins or call minutes are consumed during an active connection with a host, they are non-refundable. Users have complete transparency regarding call rates (e.g. 90 coins/min for audio, 300 coins/min for video) and real-time per-minute deduction counters before and during each session.',
            },
            {
              heading: '3. Failed Transactions & Automated Reversal Guarantee',
              body: 'If money is debited from your bank account, debit/credit card, or UPI app, but the purchased coins are not credited to your Chatzzie wallet within 2 hours due to gateway reconciliation delays:\n• Our automated banking reconciliation engine checks pending webhooks and credits your wallet automatically.\n• If the transaction cannot be settled, the payment gateway initiates a full refund to your original source account within 5 to 7 business days.\n• You can write to support@chatzzie.com with your transaction reference ID for immediate manual verification.',
            },
            {
              heading: '4. Dropped Calls & Technical Glitch Protection',
              body: 'We are committed to fair billing. If a call disconnects prematurely within the first 30 seconds due to a platform server glitch, network timeout, or host disconnection, the system automatically refunds the coins for that billing block back to your wallet.',
            },
            {
              heading: '5. Platform-Specific Refund Routing',
              body: '• Apple iOS App Store: In compliance with Apple guidelines, all transactions made via Apple In-App Purchase (IAP) are processed and managed directly by Apple. To request an Apple refund, visit https://getsupport.apple.com.\n• Google Play Store: For purchases processed via Google Play In-App Billing, write to support@chatzzie.com with your Google Play Order ID (starting with "GPA.") within 48 hours of purchase.\n• Web & Direct UPI Payments: For wallet recharges made on our website, email support@chatzzie.com with your transaction receipt.',
            },
            {
              heading: '6. Zero Liability for Off-Platform Transactions',
              body: 'This Return & Refund Policy applies exclusively to official in-app payments. Chatzzie does NOT facilitate, monitor, guarantee, or mediate any private financial exchange between users outside the application. If you voluntarily send money, UPI transfers, or gifts to another user outside Chatzzie, you do so entirely at your own risk. Chatzzie provides NO refunds or dispute resolution for off-platform transactions.',
            },
            {
              heading: '7. Host Payout Disbursals & Compliance',
              body: 'Host partner earnings are disbursed directly to verified Indian bank accounts or UPI IDs via IMPS/NEFT. Payouts require completed PAN KYC verification and are subject to statutory TDS deductions under Indian Income Tax regulations. Standard payout processing takes 24 to 48 business hours once the minimum withdrawal threshold (₹200) is reached.',
            },
          ],
        };

      case 'privacy':
        return {
          title: 'Privacy & Data Protection Policy',
          subtitle: 'Zero phone number disclosure and peer-to-peer stream security',
          icon: Shield,
          updated: 'October 2026',
          intro: 'At Chatzzie, your privacy is our foundational promise. We believe meaningful emotional connection requires absolute safety and discretion. We do not sell, rent, or trade your personal data to advertisers or third parties.',
          sections: [
            {
              heading: '1. Zero Contact Disclosure Architecture',
              body: 'Your real-world mobile number is NEVER disclosed to other users or hosts. All calls and messages are routed through encrypted virtual identifiers. Neither party can ever view the other’s phone number, carrier details, or real identity.',
            },
            {
              heading: '2. Information We Collect',
              body: 'We collect only the minimum information necessary to deliver our services safely:\n• Authentication Data: Mobile phone number for SMS OTP verification.\n• Profile Preferences: Non-identifying display name, avatar, bio, and language fluency.\n• Transaction Logs: Coin balance, purchase history, and in-app host earnings records.\n• Technical Diagnostics: Network round-trip time (RTT), packet loss, and WebRTC telemetry to optimize audio/video clarity.',
            },
            {
              heading: '3. Encrypted Peer-to-Peer Audio/Video Streaming',
              body: '1-on-1 audio and video calls on Chatzzie are streamed via peer-to-peer WebRTC channels (powered by Agora RTC) with AES-128/256 stream encryption in transit. We do NOT record, tap, wiretap, or store private 1:1 call streams.',
            },
            {
              heading: '4. SafeTalk AI Anti-Harassment Scanning',
              body: 'To protect hosts and vulnerable callers from scams, extortion, and off-platform stalking, our SafeTalk AI automated moderation engine performs real-time pattern matching for phone numbers, payment QR links, and social media handles. Content violating safety policies is blocked automatically.',
            },
            {
              heading: '5. Right to Be Forgotten & Instant Account Deletion',
              body: 'In full accordance with Apple App Store and Google Play Store privacy guidelines, you hold the unconditional right to delete your account at any time directly through the app (Settings → Delete Account). Upon request, your profile, contact associations, wallet records, and chat threads are permanently purged within 24 hours.',
            },
            {
              heading: '6. Grievance Officer & Contact',
              body: 'If you have questions, concerns, or grievances regarding your personal data, you may reach our designated Data Protection Officer at:\nChatzzie Technologies Private Limited\nBangalore, Karnataka, India\nEmail: privacy@chatzzie.com | support@chatzzie.com',
            },
          ],
        };

      case 'community':
        return {
          title: 'Community Standards & Compassionate Care Disclaimer',
          subtitle: 'Emotional wellness guidelines and non-clinical emergency disclaimers',
          icon: HeartHandshake,
          updated: 'October 2026',
          intro: 'Chatzzie is a supportive peer community designed to combat urban loneliness, stress, and anxiety through judgment-free human listening. To ensure our community remains a safe haven for all, every member must understand our scope of care.',
          sections: [
            {
              heading: '1. Peer Listening, NOT Clinical Therapy or Medical Care',
              body: 'Chatzzie hosts are compassionate, verified conversationalists who provide empathetic listening, friendly dialogue, and emotional venting space. Hosts are NOT licensed clinical psychologists, psychiatrists, therapists, medical doctors, or suicide prevention specialists. Chatzzie is not a medical device, mental health clinic, or diagnostic service.',
            },
            {
              heading: '2. Emergency Crisis & Suicide Prevention Helplines',
              body: 'Chatzzie is NOT an emergency crisis response platform. If you or someone you know is experiencing acute psychiatric distress, severe depression, thoughts of self-harm, or suicidal ideation, please reach out immediately to professional national crisis helplines:\n• Tele-MANAS (Govt. of India 24x7 Mental Health Helpline): Dial 14416 or 1800-891-4416 (Toll-Free, Multilingual)\n• KIRAN Mental Health Helpline: 1800-599-0019\n• National Emergency Services: Dial 112\n• Vandrevala Foundation Helpline: +91 9999 666 555',
            },
            {
              heading: '3. Mutual Respect & Zero Tolerance for Harassment',
              body: 'Host partners deserve the same respect and dignity they offer to callers. Any form of verbal abuse, sexual solicitation, non-consensual vulgarity, blackmail, or aggressive demands will result in an immediate session disconnect, forfeiture of coins, and permanent hardware/account banning.',
            },
            {
              heading: '4. Protecting Your Vulnerability',
              body: 'While we encourage authentic self-expression, never share personal financial details, passwords, home addresses, or intimate media with anyone on the platform. Keep your conversations focused on emotional wellness, personal stories, and uplifting exchange.',
            },
          ],
        };
    }
  };

  const doc = getDoc();
  const Icon = doc.icon;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.8}>
            <ArrowLeft size={22} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{doc.title}</Text>
            <Text style={styles.headerSub}>Chatzzie Technologies Legal</Text>
          </View>
        </View>

        {/* Tab Switcher Pills */}
        <View style={styles.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {[
              { key: 'terms', label: 'Terms of Use' },
              { key: 'privacy', label: 'Privacy Policy' },
              { key: 'refund', label: 'Returns & Refund' },
              { key: 'community', label: 'Community Care' },
            ].map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tabPill, activeTab === t.key && styles.tabPillActive]}
                onPress={() => setActiveTab(t.key as PolicyType)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Scrollable Policy Content */}
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.docHeaderCard}>
            <View style={styles.iconCircle}>
              <Icon size={28} color={THEME.colors.primary} />
            </View>
            <Text style={styles.docTitle}>{doc.title}</Text>
            <Text style={styles.docSubtitle}>{doc.subtitle}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.versionBadge}>
                <CheckCircle2 size={11} color="#059669" />
                <Text style={styles.versionText}>Official Chatzzie Document</Text>
              </View>
              <Text style={styles.lastUpdated}>Updated: {doc.updated}</Text>
            </View>
          </View>

          {/* Intro Paragraph */}
          <View style={styles.introBox}>
            <Text style={styles.introText}>{doc.intro}</Text>
          </View>

          {/* Policy Sections List */}
          <View style={styles.sectionsList}>
            {doc.sections.map((sec, i) => (
              <View key={i} style={styles.secCard}>
                <Text style={styles.secHeading}>{sec.heading}</Text>
                <Text style={styles.secParagraph}>{sec.body}</Text>
              </View>
            ))}
          </View>

          {/* Company Footer Note */}
          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              Chatzzie Technologies Private Limited • Registered in Bangalore, Karnataka, India{'\n'}
              Support: support@chatzzie.com • Official Website: https://chatzzie.com
            </Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.closeBtnText}>I Understand & Agree</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabPillActive: {
    backgroundColor: THEME.colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  docHeaderCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  docTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    textAlign: 'center',
  },
  docSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  lastUpdated: {
    fontSize: 11,
    color: '#94A3B8',
  },
  introBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  introText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
    fontWeight: '500',
  },
  sectionsList: {
    gap: 14,
    marginBottom: 24,
  },
  secCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  secParagraph: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 21,
  },
  footerNote: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginBottom: 16,
  },
  footerNoteText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  closeBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
