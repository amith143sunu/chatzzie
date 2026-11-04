import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  FileText,
  Shield,
  RotateCcw,
  HeartHandshake,
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentWrap}>
      <View style={styles.headerBanner}>
        <View style={styles.pillBadge}>
          <Shield size={14} color="#4F46E5" />
          <Text style={styles.pillBadgeText}>Trust &amp; Compliance</Text>
        </View>
        <Text style={styles.mainTitle}>Legal &amp; Trust Policies</Text>
        <Text style={styles.subtitle}>
          Chatzzie Technologies Private Limited is committed to transparent governance, user data privacy, and ethical community standards.
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

      {/* Document Body */}
      <View style={styles.documentWrap}>
        <View style={styles.documentCard}>
          {activeTab === 'terms' && (
            <View>
              <Text style={styles.docTitle}>Terms of Service</Text>
              <Text style={styles.docMeta}>
                Effective Date: January 1, 2026 • Last Updated: November 2026
              </Text>

              <Text style={styles.sectionHeader}>1. Agreement to Terms</Text>
              <Text style={styles.paragraph}>
                By accessing, browsing, or utilizing the Chatzzie mobile applications, Progressive Web App (PWA), or web services owned and operated by <Text style={styles.boldText}>Chatzzie Technologies Private Limited</Text>, you explicitly accept and agree to be legally bound by these Terms of Service and our associated Privacy Policy.
              </Text>

              <Text style={styles.sectionHeader}>2. Platform Nature &amp; Scope</Text>
              <Text style={styles.paragraph}>
                Chatzzie is a technology-enabled social wellness and anonymous 1:1 human connection platform. Chatzzie is <Text style={styles.boldText}>NOT</Text> an emergency crisis hotline, clinical psychological facility, or healthcare provider. If you are experiencing suicidal thoughts, psychiatric distress, or medical emergencies, please immediately contact your local emergency services (112 in India) or dedicated helplines (e.g. Vandrevala Foundation: 9999 666 555 / Tele-MANAS: 14416).
              </Text>

              <Text style={styles.sectionHeader}>3. Virtual Coins &amp; Pay-As-You-Go Billing</Text>
              <Text style={styles.paragraph}>
                All voice and video calling features on Chatzzie are denominated in non-transferable virtual coins purchased through verified Reserve Bank of India compliant payment gateways (e.g. Razorpay, Cashfree). Conversion rate is fixed at 1 INR = 10 Virtual Coins. Standard audio calls cost 90 coins/min (₹9/min) and video calls cost 300 coins/min (₹30/min). Calls are billed precisely per minute from the time of connection.
              </Text>

              <Text style={styles.sectionHeader}>4. Zero Tolerance Behavior Policy</Text>
              <Text style={styles.paragraph}>
                Any form of harassment, extortion, hate speech, explicit sexual solicitation, non-consensual recording, or personal data mining is strictly prohibited and results in permanent hardware device banning and immediate referral to cyber law authorities.
              </Text>
            </View>
          )}

          {activeTab === 'privacy' && (
            <View>
              <Text style={styles.docTitle}>Privacy Policy &amp; Data Masking</Text>
              <Text style={styles.docMeta}>
                Effective Date: January 1, 2026 • Compliant with Digital Personal Data Protection (DPDP) Act 2023
              </Text>

              <Text style={styles.sectionHeader}>1. What We Collect &amp; Why</Text>
              <Text style={styles.paragraph}>
                We minimize data collection to the absolute technical minimum necessary to provide masked audio communication. We collect your mobile number exclusively for OTP authentication and token issuance. We <Text style={styles.boldText}>never</Text> request your full legal name, social graph, device contacts, or location data.
              </Text>

              <Text style={styles.sectionHeader}>2. End-to-End Identity Masking</Text>
              <Text style={styles.paragraph}>
                When a call is initiated between a caller and a host, audio and video streams travel directly through encrypted WebRTC peer-to-peer data channels. Neither party has access to the other&apos;s phone number, SIM IMSI, or true IP address.
              </Text>

              <Text style={styles.sectionHeader}>3. Zero Audio Recording Storage</Text>
              <Text style={styles.paragraph}>
                Chatzzie does not record, archive, analyze, or transcribe real-time voice calls between callers and hosts. Once a call terminates, media packets disappear permanently from server memory.
              </Text>
            </View>
          )}

          {activeTab === 'refund' && (
            <View>
              <Text style={styles.docTitle}>Cancellation &amp; Refund Policy</Text>
              <Text style={styles.docMeta}>
                Consumer Protection Guidelines • Chatzzie Technologies Private Limited
              </Text>

              <Text style={styles.sectionHeader}>1. Virtual Coin Wallet Purchases</Text>
              <Text style={styles.paragraph}>
                When you purchase a virtual coin recharge pack, coins are credited immediately to your digital balance. Since virtual coins grant on-demand access to real-time service providers, completed recharges where coins have been utilized are generally non-refundable.
              </Text>

              <Text style={styles.sectionHeader}>2. Failed Recharges &amp; Bank Deductions</Text>
              <Text style={styles.paragraph}>
                If money is deducted from your UPI or bank account but coins were not credited due to network timeouts, our automated settlement reconciliation system automatically resolves the transaction within 24 to 48 banking hours.
              </Text>

              <Text style={styles.sectionHeader}>3. Call Drops &amp; Technical Grievances</Text>
              <Text style={styles.paragraph}>
                If a call drops within the first 30 seconds due to severe network degradation or an unresponsive host, affected coins are automatically refunded to your wallet upon ticket submission to support@chatzzie.com.
              </Text>
            </View>
          )}

          {activeTab === 'community' && (
            <View>
              <Text style={styles.docTitle}>Community Care Guidelines</Text>
              <Text style={styles.docMeta}>
                Mutual Dignity, Respect &amp; Safety Standards
              </Text>

              <Text style={styles.sectionHeader}>1. Respecting Host Boundaries</Text>
              <Text style={styles.paragraph}>
                Chatzzie hosts are human confidantes offering emotional listening. They are not romantic partners or psychotherapists. Demanding private WhatsApp numbers, physical addresses, or financial transactions outside Chatzzie violates community safety.
              </Text>

              <Text style={styles.sectionHeader}>2. Empowering Female Hosts</Text>
              <Text style={styles.paragraph}>
                Chatzzie exists to provide a secure, dignified space for female listeners to earn independent livelihoods. Hosts have the unilateral right to disconnect any call where a user uses abusive or inappropriate language.
              </Text>
            </View>
          )}
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
    paddingBottom: 60,
  },
  headerBanner: {
    paddingVertical: 56,
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
  },
  documentCard: {
    maxWidth: 840,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 36,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  docTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  docMeta: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 16,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
});
