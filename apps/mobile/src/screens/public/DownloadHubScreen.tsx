import React, { useState } from 'react';
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
  Smartphone,
  Apple,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  PhoneCall,
} from 'lucide-react-native';

interface DownloadHubScreenProps {
  onNavigate: (path: string) => void;
  onOpenLogin: () => void;
}

export const DownloadHubScreen: React.FC<DownloadHubScreenProps> = ({
  onNavigate,
  onOpenLogin,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownloadApk = () => {
    setDownloadNotice('Starting Chatzzie Android .APK download...');
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const link = document.createElement('a');
        link.href = '/manifest.json';
        link.download = 'Chatzzie-App.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setDownloadNotice('Download initiated! Check your downloads bar.');
      setTimeout(() => setDownloadNotice(null), 4000);
    }, 600);
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.pillBadge}>
          <Smartphone size={14} color="#4F46E5" />
          <Text style={styles.pillBadgeText}>Available for Android &amp; iOS</Text>
        </View>
        <Text style={styles.mainTitle}>Download the Chatzzie App</Text>
        <Text style={styles.subtitle}>
          Install Chatzzie directly on your mobile device for instant call notifications, crystal clear audio, and zero battery drain.
        </Text>

        {downloadNotice && (
          <View style={styles.toastNotice}>
            <CheckCircle2 size={16} color="#10B981" />
            <Text style={styles.toastNoticeText}>{downloadNotice}</Text>
          </View>
        )}
      </View>

      {/* Main Options Grid */}
      <View style={styles.sectionWrap}>
        <View style={[styles.optionsGrid, isDesktop && styles.optionsGridDesktop]}>
          {/* 1. Android Direct APK & Play Store */}
          <View style={styles.downloadCard}>
            <View style={[styles.platformIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Smartphone size={28} color="#059669" />
            </View>
            <View style={styles.platformBadgeWrap}>
              <Text style={styles.platformBadge}>Android Smartphone</Text>
            </View>
            <Text style={styles.cardTitle}>Android Standalone .APK</Text>
            <Text style={styles.cardDesc}>
              Compatible with Android 8.0 and above. Fast, direct installation without waiting for store reviews.
            </Text>

            <View style={styles.perkRow}>
              <CheckCircle2 size={15} color="#059669" />
              <Text style={styles.perkText}>Instant Incoming Call Ringing</Text>
            </View>
            <View style={styles.perkRow}>
              <CheckCircle2 size={15} color="#059669" />
              <Text style={styles.perkText}>Low Latency Peer-to-Peer Voice</Text>
            </View>
            <View style={styles.perkRow}>
              <CheckCircle2 size={15} color="#059669" />
              <Text style={styles.perkText}>Direct UPI Payments via GPay/PhonePe</Text>
            </View>

            <TouchableOpacity style={styles.downloadPrimaryBtn} onPress={handleDownloadApk}>
              <Download size={16} color="#FFFFFF" />
              <Text style={styles.downloadPrimaryBtnText}>Download .APK (v1.0.0)</Text>
            </TouchableOpacity>
          </View>

          {/* 2. Apple iOS iPhone / iPad Guide */}
          <View style={styles.downloadCard}>
            <View style={[styles.platformIconBox, { backgroundColor: '#F1F5F9' }]}>
              <Apple size={28} color="#0F172A" />
            </View>
            <View style={[styles.platformBadgeWrap, { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.platformBadge, { color: '#0F172A' }]}>
                Apple iOS
              </Text>
            </View>
            <Text style={styles.cardTitle}>Apple iPhone / iPad</Text>
            <Text style={styles.cardDesc}>
              Run Chatzzie as a native Progressive Web App (PWA) with zero App Store friction.
            </Text>

            <View style={styles.stepGuideBox}>
              <View style={styles.guideStepRow}>
                <View style={styles.stepCircleWrap}>
                  <Text style={styles.stepCircleText}>1</Text>
                </View>
                <Text style={styles.guideStepText}>Open chatzzie.com in Safari</Text>
              </View>
              <View style={styles.guideStepRow}>
                <View style={styles.stepCircleWrap}>
                  <Text style={styles.stepCircleText}>2</Text>
                </View>
                <Text style={styles.guideStepText}>Tap Safari &quot;Share&quot; button below</Text>
              </View>
              <View style={styles.guideStepRow}>
                <View style={styles.stepCircleWrap}>
                  <Text style={styles.stepCircleText}>3</Text>
                </View>
                <Text style={styles.guideStepText}>Select &quot;Add to Home Screen&quot;</Text>
              </View>
            </View>

            <TouchableOpacity style={[styles.downloadPrimaryBtn, { backgroundColor: '#0F172A' }]} onPress={onOpenLogin}>
              <Apple size={16} color="#FFFFFF" />
              <Text style={styles.downloadPrimaryBtnText}>Launch iOS Web App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Instant Web App Option */}
      <View style={[styles.sectionWrap, { backgroundColor: '#F8FAFC' }]}>
        <View style={styles.webAppBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.webAppOverline}>No Download Needed</Text>
            <Text style={styles.webAppTitle}>Prefer Talking From Your Laptop or Browser?</Text>
            <Text style={styles.webAppSubtitle}>
              Chatzzie works seamlessly in Google Chrome, Apple Safari, Microsoft Edge, and Firefox. Simply sign in with your phone number to start connecting.
            </Text>
          </View>
          <TouchableOpacity style={styles.webAppBtn} onPress={onOpenLogin}>
            <Globe size={16} color="#FFFFFF" />
            <Text style={styles.webAppBtnText}>Open Web App Now</Text>
          </TouchableOpacity>
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
  toastNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 18,
  },
  toastNoticeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },

  sectionWrap: {
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  optionsGrid: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 28,
  },
  optionsGridDesktop: {
    flexDirection: 'row',
  },
  downloadCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  platformIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  platformBadgeWrap: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  platformBadge: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#059669',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  perkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  downloadPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
  },
  downloadPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  stepGuideBox: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    gap: 10,
  },
  guideStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepCircleWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  guideStepText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },

  webAppBanner: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 20,
  },
  webAppOverline: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  webAppTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 4,
  },
  webAppSubtitle: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 6,
    lineHeight: 22,
  },
  webAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  webAppBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
