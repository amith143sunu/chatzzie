import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Headphones, ShieldCheck, Heart, Sparkles } from 'lucide-react-native';

interface PublicFooterProps {
  onNavigate: (path: string) => void;
  onOpenLogin: () => void;
  onOpenHostPortal: () => void;
  onOpenAdminLogin: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenHostPortal,
  onOpenAdminLogin,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  return (
    <View style={styles.footerWrap}>
      <View style={[styles.footerInner, isDesktop && styles.footerInnerDesktop]}>
        {/* Brand Column */}
        <View style={styles.footerBrandCol}>
          <TouchableOpacity
            style={styles.footerBrandRow}
            onPress={() => onNavigate('/')}
            activeOpacity={0.8}
          >
            <View style={styles.brandIconBox}>
              <Headphones size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.footerBrandTitle}>Chatzzie</Text>
          </TouchableOpacity>
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

        {/* Platform Column */}
        <View style={styles.footerCol}>
          <Text style={styles.footerColHeader}>Platform</Text>
          <TouchableOpacity onPress={() => onNavigate('/')}>
            <Text style={styles.footerLink}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate('/how-it-works')}>
            <Text style={styles.footerLink}>How It Works</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate('/why-chatzzie')}>
            <Text style={styles.footerLink}>Why Chatzzie</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate('/hosts')}>
            <Text style={styles.footerLink}>Meet Confidantes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate('/download')}>
            <Text style={styles.footerLink}>Download App (.APK / iOS)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onOpenLogin}>
            <Text style={styles.footerLink}>Web App Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onOpenHostPortal}>
            <Text style={[styles.footerLink, { color: '#F472B6', fontWeight: '700' }]}>
              Become a Host Partner (/host)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Editorial & Community */}
        <View style={styles.footerCol}>
          <Text style={styles.footerColHeader}>Editorial &amp; Help</Text>
          <TouchableOpacity onPress={() => onNavigate('/blog')}>
            <Text style={styles.footerLink}>Wellness Blog &amp; Articles</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate('/faq')}>
            <Text style={styles.footerLink}>Frequently Asked Questions</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate('/community')}>
            <Text style={styles.footerLink}>Community Care Guidelines</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onOpenAdminLogin}>
            <Text style={[styles.footerLink, { color: '#64748B' }]}>
              Admin Portal (/admin/login)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Legal & Trust */}
        <View style={styles.footerCol}>
          <Text style={styles.footerColHeader}>Legal &amp; Trust</Text>
          <TouchableOpacity onPress={() => onNavigate('/terms')}>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate('/privacy')}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate('/refund')}>
            <Text style={styles.footerLink}>Cancellation &amp; Refund Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate('/community')}>
            <Text style={styles.footerLink}>Safety &amp; Masking Guarantee</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Legal Notice */}
      <View style={[styles.footerBottomRow, isDesktop && styles.footerBottomRowDesktop]}>
        <Text style={styles.copyrightText}>
          © 2026 Chatzzie Technologies Private Limited. All rights reserved.
        </Text>
        <Text style={styles.disclaimerText}>
          Disclaimer: Chatzzie is a peer-to-peer social wellness and compassionate listening platform. Not intended for clinical psychiatric crises or emergency medical care.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerWrap: {
    backgroundColor: '#0F172A',
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  footerInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 40,
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  footerInnerDesktop: {
    flexDirection: 'row',
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
  brandIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 13,
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerBottomRowDesktop: {
    flexDirection: 'row',
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
});
