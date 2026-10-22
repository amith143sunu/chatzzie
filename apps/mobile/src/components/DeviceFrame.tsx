import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
  TouchableOpacity
} from 'react-native';
import {
  Wifi,
  Battery,
  Signal,
  Smartphone,
  ShieldCheck,
  ExternalLink,
  Monitor,
  Radio
} from 'lucide-react-native';
import { THEME } from '../theme';

interface DeviceFrameProps {
  children: React.ReactNode;
}

type ViewMode = 'desktop' | 'mobile';

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const { width } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && width > 640;

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('chatzie_view_mode');
      if (saved === 'mobile' || saved === 'desktop') return saved;
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'mobile') return 'mobile';
      if (params.get('view') === 'desktop') return 'desktop';
    }
    return 'desktop'; // Default to clean responsive Desktop Web on computer monitors
  });

  const handleToggleMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('chatzie_view_mode', mode);
    }
  };

  // Pure Native Mobile View on phones or small viewports
  if (!isLargeScreen) {
    return <View style={styles.nativeContainer}>{children}</View>;
  }

  return (
    <View style={viewMode === 'desktop' ? styles.desktopWebCanvas : styles.desktopCanvas}>
      {/* Top Desktop Helper Header */}
      <View style={styles.desktopHeader}>
        {/* Brand & Status */}
        <View style={styles.brandBadge}>
          <Text style={styles.brandTitle}>Chatzie</Text>
          <View style={styles.liveIndicator}>
            <Radio size={12} color="#10B981" />
            <Text style={styles.liveText}>Live Agora RTC Engine</Text>
          </View>
        </View>

        {/* Desktop vs Mobile Preview Switcher */}
        <View style={styles.modeSwitcher}>
          <TouchableOpacity
            style={[styles.switchBtn, viewMode === 'desktop' && styles.switchBtnActive]}
            onPress={() => handleToggleMode('desktop')}
            activeOpacity={0.8}
          >
            <Monitor size={14} color={viewMode === 'desktop' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.switchText, viewMode === 'desktop' && styles.switchTextActive]}>
              Desktop Web View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switchBtn, viewMode === 'mobile' && styles.switchBtnActive]}
            onPress={() => handleToggleMode('mobile')}
            activeOpacity={0.8}
          >
            <Smartphone size={14} color={viewMode === 'mobile' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.switchText, viewMode === 'mobile' && styles.switchTextActive]}>
              Mobile Preview (412px)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <View style={styles.headerRightControls}>
          <TouchableOpacity
            style={styles.adminLinkBtn}
            onPress={() => {
              if (typeof window !== 'undefined') {
                window.open('http://localhost:8681/admin', '_blank');
              }
            }}
            activeOpacity={0.8}
            title="Open Admin Backoffice in new tab"
          >
            <ShieldCheck size={14} color="#93C5FD" />
            <Text style={styles.adminLinkText}>Admin Portal (/admin)</Text>
            <ExternalLink size={12} color="#93C5FD" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Container based on selected View Mode */}
      {viewMode === 'desktop' ? (
        /* DESKTOP FULL WEB APPLICATION CONTAINER */
        <View style={styles.desktopAppContainer}>
          <View style={styles.screenViewport}>
            {children}
          </View>
        </View>
      ) : (
        /* REALISTIC SMARTPHONE CHASSIS (MOBILE PREVIEW) */
        <View style={styles.phoneChassis}>
          {/* Dynamic Island / Top Phone Notch */}
          <View style={styles.statusBar}>
            <Text style={styles.statusTime}>9:41</Text>

            <View style={styles.dynamicIsland}>
              <View style={styles.cameraLens} />
              <View style={styles.sensorDot} />
            </View>

            <View style={styles.statusIcons}>
              <Signal size={12} color="#0F172A" />
              <Wifi size={12} color="#0F172A" />
              <Battery size={14} color="#0F172A" />
            </View>
          </View>

          {/* Screen Viewport Content */}
          <View style={styles.screenViewport}>
            {children}
          </View>

          {/* Bottom Phone Home Indicator Bar */}
          <View style={styles.homeIndicatorWrapper}>
            <View style={styles.homeBar} />
          </View>
        </View>
      )}

      {/* Subtle Frame Footer Tip */}
      <Text style={styles.desktopTip}>
        {viewMode === 'desktop'
          ? 'Desktop Web Mode • Responsive full-width layout with Agora 2-way WebRTC calling'
          : 'Mobile Phone Simulation Mode (412×890px) • Click "Desktop Web View" above to expand'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: THEME.colors.white,
  },
  desktopWebCanvas: {
    flex: 1,
    height: '100%',
    minHeight: '100vh' as any,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  desktopCanvas: {
    flex: 1,
    minHeight: '100vh' as any,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  desktopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 1040,
    marginBottom: 10,
    paddingHorizontal: 4,
    gap: 12,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  modeSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 2,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  switchBtnActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  switchText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  switchTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  adminLinkText: {
    color: '#EFF6FF',
    fontSize: 12,
    fontWeight: '700',
  },
  desktopAppContainer: {
    width: '100%',
    maxWidth: 1040,
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  phoneChassis: {
    width: 412,
    height: 890,
    maxHeight: '90vh' as any,
    backgroundColor: '#FFFFFF',
    borderRadius: 48,
    borderWidth: 10,
    borderColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 24,
  },
  statusBar: {
    height: 44,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
    zIndex: 100,
  },
  statusTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    width: 45,
  },
  dynamicIsland: {
    width: 108,
    height: 26,
    backgroundColor: '#000000',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    gap: 6,
  },
  cameraLens: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  sensorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#052e16',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: 45,
    justifyContent: 'flex-end',
  },
  screenViewport: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    overflow: 'hidden',
  },
  homeIndicatorWrapper: {
    height: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBar: {
    width: 134,
    height: 4.5,
    backgroundColor: '#0F172A',
    borderRadius: 3,
  },
  desktopTip: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  }
});
