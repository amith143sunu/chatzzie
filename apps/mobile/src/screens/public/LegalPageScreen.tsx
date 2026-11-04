import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  FileText,
  Shield,
  RotateCcw,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react-native';

export type LegalDocType = 'terms' | 'privacy' | 'refund' | 'community';

interface LegalPageScreenProps {
  initialDoc?: LegalDocType;
  onNavigate: (path: string) => void;
}

export const LegalPageScreen: React.FC<LegalPageScreenProps> = ({
  initialDoc = 'terms',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<LegalDocType>((initialDoc as LegalDocType) || 'terms');

  const tabs: { id: LegalDocType; label: string; icon: any; path: string }[] = [
    { id: 'terms', label: 'Terms of Service', icon: FileText, path: '/terms' },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield, path: '/privacy' },
    { id: 'refund', label: 'Refund Policy', icon: RotateCcw, path: '/refund' },
    { id: 'community', label: 'Community Guidelines', icon: HeartHandshake, path: '/community' },
  ];

  const handleTabSelect = (tab: typeof tabs[0]) => {
    setActiveTab(tab.id);
    onNavigate(tab.path);
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.pillBadge}>
          <Shield size={14} color="#4F46E5" />
          <Text style={styles.pillBadgeText}>Legal Governance &amp; Compliance</Text>
        </View>
        <Text style={styles.mainTitle}>Legal &amp; Trust Policies</Text>
        <Text style={styles.subtitle}>
          Official governance documents for Chatzzie Technologies Private Limited, drafted in accordance with Indian Law, the DPDP Act 2023, and Store Safety Guidelines.
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsSection}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
                onPress={() => handleTabSelect(tab)}
              >
                <Icon size={16} color={isSelected ? '#4F46E5' : '#64748B'} />
                <Text style={[styles.tabBtnText, isSelected && styles.tabBtnTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Document Body Card */}
      <View style={styles.documentWrap}>
        <View style={styles.documentCard}>
          {/* ================================================================ */}
          {/* 1. TERMS OF SERVICE AGREEMENT                                   */}
          {/* ================================================================ */}
          {activeTab === 'terms' && (
            <View>
              <View style={styles.docHeader}>
                <Text style={styles.docTitle}>Terms of Service Agreement</Text>
                <Text style={styles.docMeta}>
                  Effective: September 2023 • Last Updated: October 2026 • Chatzzie Technologies Private Limited
                </Text>
              </View>

              <View style={styles.introBox}>
                <Text style={styles.introText}>
                  Welcome to Chatzzie, operated by Chatzzie Technologies Private Limited (&quot;Chatzzie&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). Please read these Terms of Service carefully before accessing our website (https://chatzzie.com) or mobile applications. By creating an account or using our platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use the service.
                </Text>
              </View>

              <Text style={styles.sectionHeader}>1. Acceptance &amp; Amendments</Text>
              <Text style={styles.paragraph}>
                We reserve the right to modify these Terms of Service and our operating guidelines at our discretion to reflect new features, security updates, or legal compliance requirements. The latest revision date will always appear at the top of this document. Continued use of Chatzzie following any modifications constitutes your formal acceptance of the updated terms. We notify users of material modifications via the App.
              </Text>

              <Text style={styles.sectionHeader}>2. Eligibility &amp; Strict 18+ Verification</Text>
              <Text style={styles.paragraph}>
                Chatzzie is designed exclusively for adults seeking meaningful, anonymous conversations. By creating an account, you legally affirm and warrant that:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• You are at least 18 years of age.</Text>
                <Text style={styles.bulletItem}>• You possess the full legal capacity to enter into a binding contract under Indian laws.</Text>
                <Text style={styles.bulletItem}>• You are not prohibited from using the service under Indian laws or any applicable jurisdiction.</Text>
                <Text style={styles.bulletItem}>• You have no unspent convictions or active court orders related to assault, violence, sexual misconduct, or harassment.</Text>
                <Text style={styles.bulletItem}>• You have not previously been banned, suspended, or removed from Chatzzie for policy violations.</Text>
                <Text style={styles.bulletItem}>• You will comply with all local, state, national, and international laws while using the platform.</Text>
              </View>

              <Text style={styles.sectionHeader}>3. Governing Law &amp; Exclusive Jurisdiction</Text>
              <Text style={styles.paragraph}>
                These Terms of Service, the Privacy Policy, and any disputes arising out of or related to your use of Chatzzie shall be governed by and construed in accordance with the laws of India. You agree to submit to the exclusive jurisdiction of the competent courts in Bangalore, Karnataka, India.
              </Text>

              <Text style={styles.sectionHeader}>4. Account Registration &amp; Masked Identity Safeguards</Text>
              <Text style={styles.paragraph}>
                You authenticate your Chatzzie account via mobile phone number and SMS OTP. To protect your real-world identity, your phone number is NEVER shared with other users or hosts. You choose an anonymous display name, avatar, and conversation preferences.
              </Text>
              <Text style={styles.paragraph}>
                You are solely responsible for maintaining the confidentiality of your login credentials and for all activities conducted under your profile. If you suspect your account has been compromised, contact <Text style={styles.boldText}>support@chatzzie.com</Text> immediately from your registered identifier.
              </Text>

              <Text style={styles.sectionHeader}>5. Community Guidelines &amp; Dignified Conduct</Text>
              <Text style={styles.paragraph}>
                Chatzzie users and verified hosts are expected to conduct themselves with the highest standards of dignity and mutual respect. Unacceptable behavior results in immediate membership termination:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• Do not transmit defamatory, inaccurate, abusive, obscene, profane, offensive, sexually explicit, threatening, or harassing content.</Text>
                <Text style={styles.bulletItem}>• Do not use automated scripts, bots, or scraping tools to retrieve or reproduce platform content.</Text>
                <Text style={styles.bulletItem}>• Do not use Chatzzie for soliciting commercial business activities, loans, or commercial advertising.</Text>
                <Text style={styles.bulletItem}>• Do not record, screenshot, or distribute audio or video streams without explicit mutual written consent.</Text>
              </View>

              <Text style={styles.sectionHeader}>6. Anti-Leak Policy: Strict Ban on Contact Numbers &amp; Social Handles</Text>
              <Text style={styles.paragraph}>
                To protect users and host partners from external stalking, harassment, and financial fraud, sharing personal contact details is strictly prohibited. You may NOT share, solicit, or exchange:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• Numeric telephone numbers, SIM dialer details, or WhatsApp links.</Text>
                <Text style={styles.bulletItem}>• Social media handles (Instagram, Snapchat, Telegram, Facebook, LinkedIn, Twitter/X).</Text>
                <Text style={styles.bulletItem}>• Personal email addresses or home/workplace geographic coordinates.</Text>
                <Text style={styles.bulletItem}>• Payment handles (UPI IDs, Paytm, PhonePe, Google Pay, QR codes).</Text>
              </View>
              <Text style={styles.paragraph}>
                Our automated safety engine actively monitors real-time communication patterns. Detected violations trigger immediate session termination, wallet coin forfeiture, and permanent hardware banning.
              </Text>

              <Text style={styles.sectionHeader}>7. Absolute Prohibition of Off-Platform Money Transfers</Text>
              <Text style={styles.paragraph}>
                All payments must be made exclusively through official in-app coin packs and verified payment gateways. Users are strictly prohibited from sending, receiving, requesting, or soliciting money or anything of monetary value from other users outside Chatzzie.
              </Text>
              <Text style={styles.paragraph}>
                Chatzzie is NOT a party to, and does not facilitate, monitor, verify, guarantee, mediate, or process any transaction that takes place outside the Platform. If you voluntarily send or receive money outside Chatzzie, you do so entirely at your own risk. Chatzzie holds ZERO liability for off-platform fraud, scams, or losses.
              </Text>

              <Text style={styles.sectionHeader}>8. Account Termination &amp; Right to Permanent Erasure</Text>
              <Text style={styles.paragraph}>
                You hold the unconditional right to permanently delete your Chatzzie account at any time directly through the app settings. Account deletion purges your profile, contact associations, and conversation records within 24 hours. Chatzzie reserves the right to suspend or terminate accounts that breach these Terms without prior notice or refund.
              </Text>
            </View>
          )}

          {/* ================================================================ */}
          {/* 2. PRIVACY & DATA PROTECTION POLICY                             */}
          {/* ================================================================ */}
          {activeTab === 'privacy' && (
            <View>
              <View style={styles.docHeader}>
                <Text style={styles.docTitle}>Privacy &amp; Data Protection Policy</Text>
                <Text style={styles.docMeta}>
                  Effective: September 2023 • Last Updated: October 2026 • Compliant with DPDP Act 2023
                </Text>
              </View>

              <View style={styles.introBox}>
                <Text style={styles.introText}>
                  At Chatzzie, your privacy is our foundational promise. We believe meaningful emotional connection requires absolute safety and discretion. We do not sell, rent, or trade your personal data to advertisers or third parties. This Privacy Policy explains our data collection, masking architecture, and your rights under India&apos;s Digital Personal Data Protection (DPDP) Act 2023.
                </Text>
              </View>

              <Text style={styles.sectionHeader}>1. Zero Contact Disclosure Architecture</Text>
              <Text style={styles.paragraph}>
                Your real-world mobile phone number is NEVER disclosed to other users or hosts. All audio calls, video connections, and chat messages are routed through encrypted virtual identifiers. Neither party can ever view the other&apos;s phone number, carrier details, IMSI, or true IP address.
              </Text>

              <Text style={styles.sectionHeader}>2. Information We Collect &amp; Why</Text>
              <Text style={styles.paragraph}>
                We collect only the absolute minimum data required to facilitate secure, masked communication:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Authentication Data:</Text> Mobile number strictly for OTP authentication and token issuance.</Text>
                <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Profile Information:</Text> Display nickname, avatar illustration/photo, bio summary, and language fluency.</Text>
                <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Financial Ledger:</Text> Coin wallet balances, recharge receipts, and host earning records (processed via RBI-compliant gateways like Razorpay).</Text>
                <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Technical Telemetry:</Text> WebRTC latency, packet loss metrics, and device diagnostics to maintain audio clarity.</Text>
              </View>

              <Text style={styles.sectionHeader}>3. Zero Audio Recording Policy</Text>
              <Text style={styles.paragraph}>
                1-on-1 audio and video calls on Chatzzie stream through encrypted WebRTC peer-to-peer data channels (powered by Agora RTC) with AES-128/256 bit stream encryption in transit. Chatzzie does NOT record, tap, wiretap, transcribe, or archive your private voice or video conversations. Once a call session terminates, the real-time media streams disappear permanently from memory.
              </Text>

              <Text style={styles.sectionHeader}>4. SafeTalk AI Anti-Harassment Scanning</Text>
              <Text style={styles.paragraph}>
                To protect female host partners and vulnerable callers from scams, extortion, and off-platform stalking, our SafeTalk AI automated moderation engine performs real-time pattern matching for phone numbers, payment QR links, and social media handles. Content violating safety policies is blocked automatically before delivery.
              </Text>

              <Text style={styles.sectionHeader}>5. Right to Be Forgotten &amp; Instant Account Deletion</Text>
              <Text style={styles.paragraph}>
                In full accordance with Apple App Store and Google Play Store privacy guidelines and Section 12 of the DPDP Act 2023, you hold the unconditional right to request complete data erasure. You can delete your account instantly from App Settings → Account → Delete Account. All associated identifiers and chat logs are permanently destroyed within 24 hours.
              </Text>

              <Text style={styles.sectionHeader}>6. Designated Grievance Officer &amp; Contact</Text>
              <Text style={styles.paragraph}>
                In accordance with the Information Technology Act 2000 and DPDP Act 2023, the details of our Grievance Redressal Officer are published below:
              </Text>
              <View style={styles.contactCard}>
                <View style={styles.contactRow}>
                  <Shield size={16} color="#4F46E5" />
                  <Text style={styles.contactLabel}>Grievance Officer: Legal &amp; Compliance Team</Text>
                </View>
                <View style={styles.contactRow}>
                  <MapPin size={16} color="#64748B" />
                  <Text style={styles.contactValue}>Chatzzie Technologies Private Limited, Bangalore, Karnataka, India</Text>
                </View>
                <View style={styles.contactRow}>
                  <Mail size={16} color="#64748B" />
                  <Text style={styles.contactValue}>Email: privacy@chatzzie.com / support@chatzzie.com</Text>
                </View>
              </View>
            </View>
          )}

          {/* ================================================================ */}
          {/* 3. RETURNS & REFUND POLICY                                      */}
          {/* ================================================================ */}
          {activeTab === 'refund' && (
            <View>
              <View style={styles.docHeader}>
                <Text style={styles.docTitle}>Returns &amp; Refund Policy</Text>
                <Text style={styles.docMeta}>
                  Effective: September 2023 • Last Updated: October 2026 • Consumer Protection Guidelines
                </Text>
              </View>

              <View style={styles.introBox}>
                <Text style={styles.introText}>
                  Thank you for using Chatzzie, our audio and video call service. If, for any reason, you are not entirely satisfied with our service, we invite you to review our policy on refunds and returns. This Return and Refund Policy outlines the terms and conditions applicable to any purchases made through our service.
                </Text>
              </View>

              <Text style={styles.sectionHeader}>1. Digital Goods &amp; Virtual Coins</Text>
              <Text style={styles.paragraph}>
                Since Chatzzie provides digital communication services and virtual coins rather than physical goods, standard physical cancellations and return shipments do not apply. Users purchase virtual coins that are consumed in real time for 1:1 voice calls (90 coins/min) and video calls (300 coins/min).
              </Text>

              <Text style={styles.sectionHeader}>2. General Refund Policy</Text>
              <Text style={styles.paragraph}>
                In general, payments once made and virtual coins consumed during active call connections are non-refundable. You do not have the option of canceling completed calls. If a user membership is terminated due to community guideline violations, unused balances are non-refundable.
              </Text>
              <Text style={styles.paragraph}>
                <Text style={styles.boldText}>Exception:</Text> We may make an exception if a refund is requested within 14 days of the transaction date if the payment was made in a currency other than INR, if the purchased coins remain completely unused in the digital wallet, and if applicable local consumer protection laws mandate refunds. Approved refunds are issued within 7 business days.
              </Text>

              <Text style={styles.sectionHeader}>3. Failed Recharges &amp; Bank Deductions</Text>
              <Text style={styles.paragraph}>
                If money is debited from your bank account, credit card, or UPI app, but coins are not credited to your wallet due to network timeouts:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• Our automated banking settlement reconciliation automatically detects pending webhooks and credits your wallet within 2 hours.</Text>
                <Text style={styles.bulletItem}>• If the transaction cannot be completed, the payment gateway initiates a full automated reversal to your source bank within 24 to 48 banking hours.</Text>
                <Text style={styles.bulletItem}>• You can write to <Text style={styles.boldText}>support@chatzzie.com</Text> with your order reference ID for manual priority verification.</Text>
              </View>

              <Text style={styles.sectionHeader}>4. Dropped Calls &amp; Technical Glitch Protection</Text>
              <Text style={styles.paragraph}>
                We are committed to fair billing. If a call drops within the first 30 seconds due to server errors, severe network degradation, or host unresponsiveness, the consumed coins for that block are automatically re-credited to your wallet upon ticket submission.
              </Text>

              <Text style={styles.sectionHeader}>5. Platform-Specific Refund Routing</Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Apple iOS Devices:</Text> Any payment queries regarding purchases made through iOS devices using your Apple ID must be sent directly to Apple. To request an Apple refund, please visit https://getsupport.apple.com.</Text>
                <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Google Play Store:</Text> If you made a purchase via Google Play In-App Billing, write to support@chatzzie.com with your Google Play Order ID (starting with &quot;GPA.&quot;) and invoice within 48 hours.</Text>
                <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Website / Razorpay Gateways:</Text> For recharges made on our official web app, contact support@chatzzie.com with your payment invoice.</Text>
              </View>

              <Text style={styles.sectionHeader}>6. Strict Prohibition of Off-Platform Money Transfers</Text>
              <Text style={styles.paragraph}>
                This Return and Refund Policy applies exclusively to payments made through Chatzzie&apos;s official in-app methods. Users are strictly prohibited from sending, receiving, or soliciting money outside Chatzzie (via UPI, bank transfer, gift cards, or cash). Chatzzie is not a party to off-platform transfers and provides NO refund, recovery, or mediation for any money transferred outside the app.
              </Text>

              <Text style={styles.sectionHeader}>7. Host Payout Disbursals &amp; Tax Compliance</Text>
              <Text style={styles.paragraph}>
                Host partner earnings are disbursed directly to verified Indian bank accounts or UPI IDs via IMPS/NEFT upon reaching the minimum withdrawal threshold of ₹200. Payouts require valid PAN KYC submission and are subject to statutory TDS deductions under Indian Income Tax regulations.
              </Text>
            </View>
          )}

          {/* ================================================================ */}
          {/* 4. COMMUNITY GUIDELINES & CARE DISCLAIMER                       */}
          {/* ================================================================ */}
          {activeTab === 'community' && (
            <View>
              <View style={styles.docHeader}>
                <Text style={styles.docTitle}>Community Standards &amp; Care Disclaimer</Text>
                <Text style={styles.docMeta}>
                  Effective: September 2023 • Last Updated: October 2026 • Mutual Dignity &amp; Scope of Care
                </Text>
              </View>

              <View style={styles.introBox}>
                <Text style={styles.introText}>
                  Chatzzie is a supportive peer community designed to combat urban loneliness, stress, and overthinking through judgment-free human listening. To ensure our community remains a safe haven for all, every member must understand our exact scope of care.
                </Text>
              </View>

              <Text style={styles.sectionHeader}>1. Peer Listening, NOT Clinical Therapy or Medical Care</Text>
              <Text style={styles.paragraph}>
                Chatzzie hosts are compassionate, verified conversationalists offering active human listening and emotional venting space. Hosts are <Text style={styles.boldText}>NOT</Text> licensed psychiatrists, clinical psychologists, therapists, medical doctors, or emergency crisis responders. Chatzzie is not a medical device, mental health clinic, or suicide prevention hotline.
              </Text>

              <Text style={styles.sectionHeader}>2. National Emergency Crisis &amp; Mental Health Helplines</Text>
              <Text style={styles.paragraph}>
                If you or someone you know is experiencing acute psychiatric distress, suicidal thoughts, or medical emergencies, please immediately contact these dedicated national helplines:
              </Text>

              <View style={styles.helplineGrid}>
                <View style={styles.helplineCard}>
                  <Text style={styles.helplineName}>Tele-MANAS (Govt. of India)</Text>
                  <Text style={styles.helplineDesc}>24x7 National Mental Health Toll-Free Support</Text>
                  <Text style={styles.helplinePhone}>Dial 14416 or 1800-891-4416</Text>
                </View>

                <View style={styles.helplineCard}>
                  <Text style={styles.helplineName}>KIRAN Mental Health Helpline</Text>
                  <Text style={styles.helplineDesc}>Govt. of India Ministry of Social Justice</Text>
                  <Text style={styles.helplinePhone}>1800-599-0019</Text>
                </View>

                <View style={styles.helplineCard}>
                  <Text style={styles.helplineName}>National Emergency Services</Text>
                  <Text style={styles.helplineDesc}>Police, Ambulance, and Fire Emergency</Text>
                  <Text style={styles.helplinePhone}>Dial 112</Text>
                </View>

                <View style={styles.helplineCard}>
                  <Text style={styles.helplineName}>Vandrevala Foundation Helpline</Text>
                  <Text style={styles.helplineDesc}>24x7 Free Psychological Crisis Support</Text>
                  <Text style={styles.helplinePhone}>+91 9999 666 555</Text>
                </View>
              </View>

              <Text style={styles.sectionHeader}>3. Empowering &amp; Protecting Female Hosts</Text>
              <Text style={styles.paragraph}>
                Chatzzie exists to provide a secure, dignified space for female listeners to earn independent livelihoods. Host partners deserve the highest standards of respect. Any form of verbal abuse, explicit sexual solicitation, non-consensual vulgarity, or aggressive harassment will trigger an immediate session disconnect, forfeiture of wallet balance, and permanent hardware device banning.
              </Text>

              <Text style={styles.sectionHeader}>4. Protecting Your Personal Boundaries</Text>
              <Text style={styles.paragraph}>
                While we encourage authentic conversations, never share personal financial credentials, passwords, physical residential addresses, or intimate media with anyone on the platform. Keep your conversations focused on emotional wellness, heartfelt stories, and mutual encouragement.
              </Text>
            </View>
          )}

          {/* Corporate Footer Note */}
          <View style={styles.corpFooter}>
            <Text style={styles.corpFooterTitle}>Chatzzie Technologies Private Limited</Text>
            <Text style={styles.corpFooterText}>
              F-10/9, Mandir Marg, Krishna Nagar, Delhi 110051 IN • Bangalore, Karnataka, India{'\n'}
              Official Inquiries: info@chatzzie.com • User Support: support@chatzzie.com • Official Site: https://chatzzie.com
            </Text>
          </View>
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
  headerBanner: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
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
    fontSize: Platform.OS === 'web' ? 40 : 28,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 680,
  },

  tabsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  tabsContainer: {
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },

  documentWrap: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  documentCard: {
    maxWidth: 880,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 36,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  docHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 18,
    marginBottom: 20,
  },
  docTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  docMeta: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  introBox: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  introText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 22,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  bulletList: {
    gap: 8,
    marginBottom: 16,
    paddingLeft: 4,
  },
  bulletItem: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 22,
  },

  contactCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    marginTop: 12,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  contactValue: {
    fontSize: 12,
    color: '#475569',
  },

  helplineGrid: {
    gap: 12,
    marginVertical: 16,
  },
  helplineCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helplineName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  helplineDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  helplinePhone: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },

  corpFooter: {
    marginTop: 36,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
    textAlign: 'center',
  },
  corpFooterTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  corpFooterText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
