import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import {
  Home,
  Phone,
  MessageSquare,
  Wallet,
  ShieldCheck,
  Smartphone,
  Monitor,
  ExternalLink,
  Plus,
  Headphones,
  Coins,
  IndianRupee
} from 'lucide-react-native';
import { NavTab } from './BottomNavBar';
import { THEME } from '../theme';

interface DesktopHeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  balanceINR: number;
  onBalancePress: () => void;
  onAvatarPress: () => void;
  onBecomeListenerPress: () => void;
  onEarningsPress?: () => void;
  viewMode?: 'desktop' | 'mobile';
  onToggleViewMode?: (mode: 'desktop' | 'mobile') => void;
  unreadChatCount?: number;
  userName?: string;
  userRole?: 'talker' | 'listener';
  onSwitchProfilePress?: () => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  activeTab,
  onTabChange,
  balanceINR,
  onBalancePress,
  onAvatarPress,
  onBecomeListenerPress,
  onEarningsPress,
  viewMode,
  onToggleViewMode,
  unreadChatCount = 1,
  userName = 'Amit',
  userRole = 'talker',
  onSwitchProfilePress,
}) => {
  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerContainer}>
        {/* Left: Brand Logo & Title */}
        <TouchableOpacity
          style={styles.logoSection}
          onPress={() => onTabChange('home')}
          activeOpacity={0.85}
        >
          <View style={styles.logoIcon}>
            <MessageSquare size={18} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitle}>Chatzie</Text>
              <View style={styles.livePulseDot} />
            </View>
            <Text style={styles.brandSubtitle}>1:1 Anonymous Calling</Text>
          </View>
        </TouchableOpacity>

        {/* Center: Desktop Navigation Tabs */}
        <View style={styles.navLinks}>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
            onPress={() => onTabChange('home')}
            activeOpacity={0.8}
          >
            <Home
              size={17}
              color={activeTab === 'home' ? THEME.colors.primary : '#64748B'}
              strokeWidth={activeTab === 'home' ? 2.5 : 2}
            />
            <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
              Explore
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'calls' && styles.navItemActive]}
            onPress={() => onTabChange('calls')}
            activeOpacity={0.8}
          >
            <Phone
              size={17}
              color={activeTab === 'calls' ? THEME.colors.primary : '#64748B'}
              strokeWidth={activeTab === 'calls' ? 2.5 : 2}
            />
            <Text style={[styles.navText, activeTab === 'calls' && styles.navTextActive]}>
              Verified Hosts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'chat' && styles.navItemActive]}
            onPress={() => onTabChange('chat')}
            activeOpacity={0.8}
          >
            <View style={styles.iconBadgeWrapper}>
              <MessageSquare
                size={17}
                color={activeTab === 'chat' ? THEME.colors.primary : '#64748B'}
                strokeWidth={activeTab === 'chat' ? 2.5 : 2}
              />
              {unreadChatCount > 0 && <View style={styles.unreadDot} />}
            </View>
            <Text style={[styles.navText, activeTab === 'chat' && styles.navTextActive]}>
              Messages
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'wallet' && styles.navItemActive]}
            onPress={() => onTabChange('wallet')}
            activeOpacity={0.8}
          >
            <Wallet
              size={17}
              color={activeTab === 'wallet' ? THEME.colors.primary : '#64748B'}
              strokeWidth={activeTab === 'wallet' ? 2.5 : 2}
            />
            <Text style={[styles.navText, activeTab === 'wallet' && styles.navTextActive]}>
              Wallet & Coins
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right: Actions, Balance & Profile */}
        <View style={styles.rightActions}>
          {/* Become a Host CTA */}
          <TouchableOpacity
            style={styles.hostCtaBtn}
            onPress={onBecomeListenerPress}
            activeOpacity={0.85}
          >
            <Headphones size={14} color="#2563EB" />
            <Text style={styles.hostCtaText}>Become a Host</Text>
          </TouchableOpacity>

          {/* Host Earnings CTA */}
          {onEarningsPress && (
            <TouchableOpacity
              style={styles.earningsCtaBtn}
              onPress={onEarningsPress}
              activeOpacity={0.85}
              title="Host Earnings & Settlements"
            >
              <IndianRupee size={13} color="#B45309" />
              <Text style={styles.earningsCtaText}>Earnings</Text>
            </TouchableOpacity>
          )}

          {/* Balance Chip */}
          <TouchableOpacity
            style={styles.balancePill}
            onPress={onBalancePress}
            activeOpacity={0.85}
            title="Wallet Balance (Click to recharge)"
          >
            <Coins size={14} color="#D97706" />
            <Text style={styles.balanceCoinsText}>{(balanceINR * 10).toLocaleString('en-IN')}</Text>
            <Text style={styles.balanceInrText}>• ₹{balanceINR.toFixed(0)}</Text>
            <View style={styles.addPlusCircle}>
              <Plus size={11} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* User Profile Pill */}
          <View style={styles.userRolePill}>
            <View style={[styles.roleBadgeDot, userRole === 'listener' ? styles.listenerDot : styles.talkerDot]} />
            <Text style={styles.userNameHeader}>{userName}</Text>
            <Text style={styles.userRoleHeader}>({userRole === 'listener' ? 'Host' : 'Caller'})</Text>
          </View>

          {/* User Avatar */}
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={onAvatarPress}
            activeOpacity={0.85}
            title="My Account"
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }}
              style={styles.avatarImg}
            />
          </TouchableOpacity>

          {/* Admin Portal Shortcut */}
          <TouchableOpacity
            style={styles.adminPortalBtn}
            onPress={() => {
              if (typeof window !== 'undefined') {
                const adminUrl = window.location.port === '8680' ? 'http://localhost:8681/admin' : '/admin';
                window.open(adminUrl, '_blank');
              }
            }}
            activeOpacity={0.85}
            title="Open Admin Backoffice"
          >
            <ShieldCheck size={14} color="#1E40AF" />
            <Text style={styles.adminPortalText}>Admin</Text>
          </TouchableOpacity>

          {/* Mode Switcher Pill */}
          <View style={styles.viewToggleGroup}>
            <TouchableOpacity
              style={[styles.viewToggleBtn, viewMode === 'desktop' && styles.viewToggleBtnActive]}
              onPress={() => onToggleViewMode('desktop')}
              activeOpacity={0.8}
              title="Desktop Web Mode"
            >
              <Monitor size={13} color={viewMode === 'desktop' ? '#FFFFFF' : '#64748B'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleBtn, viewMode === 'mobile' && styles.viewToggleBtnActive]}
              onPress={() => onToggleViewMode('mobile')}
              activeOpacity={0.8}
              title="Mobile Device Preview"
            >
              <Smartphone size={13} color={viewMode === 'mobile' ? '#FFFFFF' : '#64748B'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    width: '100%',
    zIndex: 100,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  headerContainer: {
    height: 70,
    width: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto' as any,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    transition: 'all 0.15s ease' as any,
  },
  navItemActive: {
    backgroundColor: '#EFF6FF',
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  navTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  iconBadgeWrapper: {
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  hostCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  earningsCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  earningsCtaText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  balanceCoinsText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#B45309',
  },
  balanceInrText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  addPlusCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  avatarBtn: {
    padding: 2,
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  adminPortalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  adminPortalText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  viewToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
  },
  viewToggleBtnActive: {
    backgroundColor: '#2563EB',
  },
  userRolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  roleBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  talkerDot: {
    backgroundColor: '#3B82F6',
  },
  listenerDot: {
    backgroundColor: '#10B981',
  },
  userNameHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  userRoleHeader: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  switchText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
    textDecorationLine: 'underline',
  },
});
