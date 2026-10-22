import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
  TouchableOpacity
} from 'react-native';
import { Wifi, Battery, Signal, Smartphone, ShieldCheck, ExternalLink } from 'lucide-react-native';
import { THEME } from '../theme';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const { width, height } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === 'web' && width > 520;

  if (!isDesktopWeb) {
    return <View style={styles.nativeContainer}>{children}</View>;
  }

  return (
    <View style={styles.desktopCanvas}>
      {/* Top Desktop Helper Header */}
      <View style={styles.desktopHeader}>
        <View style={styles.brandBadge}>
          <Smartphone size={16} color="#60A5FA" />
          <Text style={styles.brandTitle}>Chatzie Mobile App</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Real-Time Device Preview</Text>
          </View>
        </View>

        <View style={styles.headerRightControls}>
          <TouchableOpacity
            style={styles.adminLinkBtn}
            onPress={() => {
              if (typeof window !== 'undefined') {
                window.open('http://localhost:8681/admin', '_blank');
              }
            }}
            activeOpacity={0.8}
          >
            <ShieldCheck size={14} color="#93C5FD" />
            <Text style={styles.adminLinkText}>Open Admin Backoffice (/admin)</Text>
            <ExternalLink size={12} color="#93C5FD" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Realistic Smartphone Chassis */}
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

      {/* Subtle Frame Footer Tip */}
      <Text style={styles.desktopTip}>
        Constrained to 412×890px mobile viewport • Responsive touch & scrolling enabled
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
  desktopCanvas: {
    flex: 1,
    minHeight: '100%',
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
    maxWidth: 720,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  brandTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '600',
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
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  adminLinkText: {
    color: '#EFF6FF',
    fontSize: 12,
    fontWeight: '600',
  },
  phoneChassis: {
    width: 412,
    height: 890,
    maxHeight: '92vh',
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
    marginTop: 10,
    textAlign: 'center',
  }
});
