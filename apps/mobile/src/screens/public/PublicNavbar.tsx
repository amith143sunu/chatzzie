import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  Headphones,
  Sparkles,
  Menu,
  X,
  PhoneCall,
} from 'lucide-react-native';

interface PublicNavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenLogin: () => void;
  onOpenHostPortal: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenLogin,
  onOpenHostPortal,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width > 900;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Why Chatzzie', path: '/why-chatzzie' },
    { label: 'Confidantes', path: '/hosts' },
    { label: 'Blog', path: '/blog' },
    { label: 'Download', path: '/download' },
    { label: 'FAQ', path: '/faq' },
  ];

  const handleLinkPress = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  return (
    <View style={styles.navWrapper}>
      <View style={styles.navContainer}>
        {/* Brand Logo */}
        <TouchableOpacity
          style={styles.brandRow}
          activeOpacity={0.8}
          onPress={() => handleLinkPress('/')}
        >
          <View style={styles.brandIconBox}>
            <Headphones size={20} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.brandNameRow}>
              <Text style={styles.brandTitle}>Chatzzie</Text>
              <View style={styles.livePulseDot} />
            </View>
            <Text style={styles.brandSubtitle}>1:1 Anonymous Voice &amp; Video</Text>
          </View>
        </TouchableOpacity>

        {/* Desktop Navigation Links */}
        {isDesktop && (
          <View style={styles.desktopLinksRow}>
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? currentPath === '/' || currentPath === ''
                  : currentPath.startsWith(link.path);

              return (
                <TouchableOpacity
                  key={link.path}
                  onPress={() => handleLinkPress(link.path)}
                  style={[styles.desktopNavLink, isActive && styles.desktopNavLinkActive]}
                >
                  <Text
                    style={[
                      styles.desktopNavLinkText,
                      isActive && styles.desktopNavLinkTextActive,
                    ]}
                  >
                    {link.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Right Action CTAs */}
        <View style={styles.navActionsRow}>
          {isDesktop && (
            <TouchableOpacity
              style={styles.hostPartnerPill}
              activeOpacity={0.85}
              onPress={onOpenHostPortal}
            >
              <Sparkles size={14} color="#EC4899" />
              <Text style={styles.hostPartnerPillText}>Become a Host</Text>
              <View style={styles.earnBadge}>
                <Text style={styles.earnBadgeText}>Earn 50%</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.startTalkingBtn}
            activeOpacity={0.85}
            onPress={onOpenLogin}
          >
            <PhoneCall size={14} color="#FFFFFF" />
            <Text style={styles.startTalkingBtnText}>Start Talking</Text>
          </TouchableOpacity>

          {/* Mobile Hamburger Toggle */}
          {!isDesktop && (
            <TouchableOpacity
              style={styles.hamburgerBtn}
              onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} color="#0F172A" /> : <Menu size={22} color="#0F172A" />}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mobile Menu Dropdown */}
      {!isDesktop && mobileMenuOpen && (
        <View style={styles.mobileDropdown}>
          {navLinks.map((link) => {
            const isActive =
              link.path === '/'
                ? currentPath === '/' || currentPath === ''
                : currentPath.startsWith(link.path);

            return (
              <TouchableOpacity
                key={link.path}
                onPress={() => handleLinkPress(link.path)}
                style={[styles.mobileMenuItem, isActive && styles.mobileMenuItemActive]}
              >
                <Text
                  style={[
                    styles.mobileMenuItemText,
                    isActive && styles.mobileMenuItemTextActive,
                  ]}
                >
                  {link.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.mobileHostBtn}
            onPress={() => {
              setMobileMenuOpen(false);
              onOpenHostPortal();
            }}
          >
            <Sparkles size={16} color="#EC4899" />
            <Text style={styles.mobileHostBtnText}>Become a Host Partner (Earn 50%)</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 9999,
  },
  navContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.2,
  },

  // Desktop Links
  desktopLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  desktopNavLink: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  desktopNavLinkActive: {
    backgroundColor: '#EEF2FF',
  },
  desktopNavLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  desktopNavLinkTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },

  // Actions
  navActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hostPartnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDF2F8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  hostPartnerPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BE185D',
  },
  earnBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  earnBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  startTalkingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  startTalkingBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hamburgerBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },

  // Mobile Dropdown
  mobileDropdown: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  mobileMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  mobileMenuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  mobileMenuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  mobileMenuItemTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  mobileHostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDF2F8',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 6,
  },
  mobileHostBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#BE185D',
  },
});
